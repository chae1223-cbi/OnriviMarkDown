const crypto = require('node:crypto');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

function registerDriveOAuth({ ipcMain, app, shell, safeStorage, getWindow }) {
  let authenticating = null, renewing = null;
  const filename = () => path.join(app.getPath('userData'), 'gdrive-oauth-session.enc');
  const origin = () => !app.isPackaged && process.env.NO_SERVER !== 'true' ? 'http://localhost:3100' : 'https://onrivi.com';
  const trusted = event => event.sender === getWindow()?.webContents;
  const read = async () => {
    try { return JSON.parse(safeStorage.decryptString(await fs.readFile(filename()))); } catch { return null; }
  };
  async function post(base, route, body, session) {
    if (!['http://localhost:3100', 'https://onrivi.com'].includes(base)) throw new Error('인증 서버 주소가 올바르지 않습니다.');
    const response = await fetch(`${base}/api/gdrive/oauth/${route}`, { method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: base, ...(session ? { Authorization: `Bearer ${session}` } : {}) },
      body: JSON.stringify(body), signal: AbortSignal.timeout(20000) });
    const result = await response.json();
    if (!response.ok) { const error = new Error(result.error || 'Google Drive 인증 요청에 실패했습니다.'); error.code = result.code; throw error; }
    return result;
  }
  ipcMain.handle('gdrive:request-auth', async (event, options) => {
    if (!trusted(event)) throw new Error('허용되지 않은 인증 요청입니다.');
    const standalone = options?.isStandalone === true;
    if (authenticating) throw new Error('Google Drive 인증이 진행 중입니다. 완료 후 다시 시도해 주세요.');
    if (!safeStorage.isEncryptionAvailable()) throw new Error('운영체제의 인증 정보 암호화 저장소를 사용할 수 없습니다.');
    authenticating = new Promise((resolve, reject) => {
      const base = origin(), state = crypto.randomBytes(32).toString('base64url'), verifier = crypto.randomBytes(32).toString('base64url');
      const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
      let finished = false, exchanging = false, timer;
      const finish = (error, result) => {
        if (finished) return;
        finished = true; clearTimeout(timer); server.close();
        if (error) reject(error); else { resolve(result); const win = getWindow(); if (win && !win.isDestroyed()) { if (win.isMinimized()) win.restore(); win.focus(); } }
      };
      const server = http.createServer(async (request, response) => {
        response.setHeader('Cache-Control', 'no-store');
        response.setHeader('Referrer-Policy', 'no-referrer');
        const url = new URL(request.url, 'http://127.0.0.1');
        const ticket = url.searchParams.get('code');
        if (request.method !== 'GET' || url.pathname !== '/callback' || url.searchParams.get('state') !== state || !/^[\w-]{43}$/.test(ticket || '') || exchanging) {
          response.writeHead(400); response.end('Invalid OAuth callback'); return;
        }
        exchanging = true;
        try {
          const tokens = await post(base, 'exchange', { ticket, verifier });
          if (!/^[\w-]{43}$/.test(tokens.session_token || '') || !tokens.access_token) throw new Error('인증 응답이 올바르지 않습니다.');
          if (!standalone) await fs.writeFile(filename(), safeStorage.encryptString(JSON.stringify({ origin: base, session: tokens.session_token })), { mode: 0o600 });
          response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          response.end(`<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Google Drive 연결 완료</title>
<style>body{font:16px/1.6 system-ui,sans-serif;color:#242735;margin:0;padding:48px 24px}main{max-width:480px;margin:auto}button{font:inherit;padding:8px 20px;cursor:pointer}</style>
</head><body><main hidden id="complete"><h1>Google Drive에 연결되었습니다.</h1>
<p>온리비 어서에서 작업을 계속하세요. 이 탭은 닫아도 됩니다.</p><button id="close" type="button">탭 닫기</button>
<p>닫히지 않으면 Ctrl+W를 누르거나 탭의 ×를 눌러 주세요.</p></main>
<script>
// Remove the one-use callback parameters from the visible address/history.
try { history.replaceState(null, '', '/callback'); } catch {}
function closeTab() { try { window.close(); } catch {} }
document.getElementById('close').addEventListener('click', closeTab);
closeTab();
setTimeout(function () { document.getElementById('complete').hidden = false; }, 400);
</script></body></html>`);
          finish(null, { access_token: tokens.access_token, expires_in: tokens.expires_in });
        } catch (error) {
          response.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' }); response.end('인증 연결에 실패했습니다. 앱에서 다시 시도해 주세요.'); finish(error);
        }
      });
      server.on('error', error => finish(error));
      timer = setTimeout(() => finish(new Error('Google Drive 인증 시간이 초과되었습니다. 다시 연결해 주세요.')), 300000);
      // Google is redirected to the fixed server callback; only its short-lived
      // PKCE-protected handoff ticket is delivered to this loopback listener.
      const listen = port => {
        server.once('listening', () => {
          const address = server.address();
          if (address.port < 49152) { finish(new Error('인증용 로컬 포트를 사용할 수 없습니다.')); return; }
          const target = new URL(`${base}/api/gdrive/oauth/start`);
          target.search = new URLSearchParams({ port: String(address.port), state, challenge }).toString();
          void shell.openExternal(target.href).catch(error => finish(error));
        });
        server.listen(port, '127.0.0.1');
      };
      // Reserve a high dynamic port without the old probe/listen race.
      const attempt = () => 49152 + crypto.randomInt(16384);
      listen(attempt());
    }).finally(() => { authenticating = null; });
    return authenticating;
  });
  ipcMain.handle('gdrive:refresh-auth', async event => {
    if (!trusted(event)) throw new Error('허용되지 않은 인증 요청입니다.');
    if (!renewing) renewing = (async () => {
      const saved = await read();
      if (!saved) return { code: 'REAUTH_REQUIRED' };
      try { return await post(saved.origin, 'refresh', {}, saved.session); }
      catch (error) {
        if (error.code === 'REAUTH_REQUIRED') { await fs.rm(filename(), { force: true }); return { code: error.code }; }
        return { code: 'REFRESH_FAILED' };
      }
    })().finally(() => { renewing = null; });
    return renewing;
  });
  ipcMain.handle('gdrive:disconnect-auth', async event => {
    if (!trusted(event)) return;
    const saved = await read();
    await fs.rm(filename(), { force: true });
    if (saved) { try { await post(saved.origin, 'disconnect', {}, saved.session); } catch { /* Local credentials are already removed. */ } }
  });
}
module.exports = { registerDriveOAuth };
