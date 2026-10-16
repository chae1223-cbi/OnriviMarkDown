const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { createRequire } = require('node:module');
const req = createRequire(path.resolve('frontend/package.json'));
const ts = req('typescript');
const mainSource = fs.readFileSync('frontend/src/components/MainEditorApp.tsx', 'utf8');
const guideStart = mainSource.indexOf('  useEffect(() => {', mainSource.indexOf('// 🌟 [전체사용자 공통 리소스 폴더 미설정 시 초기 안내 모달 트리거]'));
const guideEnd = mainSource.indexOf(']);', guideStart) + 3;
assert.ok(guideStart > 0 && guideEnd > guideStart);
const guideEffect = ts.transpileModule(mainSource.slice(guideStart, guideEnd), { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText;
function checkGuide(initial, updated) {
  let settings = initial, callback, open;
  Function('useEffect', 'mounted', 'getResourceSettings', 'resourceFolder', 'resourceFolderHandle', 'isDuplicateInstance', 'isRestrictedUser', 'licenseStatus', 'isDismissedGuide', 'setTimeout', 'clearTimeout', 'setIsResourceGuideModalOpen', guideEffect)(
    effect => effect(), true, () => settings, null, null, false, false, { isActivated: true, isExpired: false }, false,
    fn => { callback = fn; return 1; }, () => {}, value => { open = value; });
  if (updated) settings = updated;
  callback?.();
  return open;
}
assert.equal(checkGuide({ path: '참조파일' }), false, 'Configured resources close an existing guide despite pending React state');
assert.equal(checkGuide(null), true, 'Missing resources still offer manual setup');
assert.notEqual(checkGuide(null, { path: '참조파일' }), true, 'Delayed guide must recheck completed initialization');
const dir = path.resolve('.tmp/browser-default-storage-qa');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'loader.cjs'), `const ts=require(${JSON.stringify(req.resolve('typescript'))});module.exports=function(source){return ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;};`);
fs.writeFileSync(path.join(dir, 'icons.js'), 'exports.Icon=()=>null;');
fs.writeFileSync(path.join(dir, 'drive.js'), 'exports.getSavedDriveToken=()=>null;exports.uploadDriveImage=()=>{throw Error("Unexpected Drive access");};');
fs.writeFileSync(path.join(dir, 'entry.js'), `
  window.qa={...require(${JSON.stringify(path.resolve('frontend/src/lib/browserDefaultStorage.ts'))}),
    ...require(${JSON.stringify(path.resolve('frontend/src/lib/browserPickerStartIn.ts'))}),
    ...require(${JSON.stringify(path.resolve('frontend/src/lib/resourceMedia.ts'))}),
    ...require(${JSON.stringify(path.resolve('frontend/src/lib/indexedDbHelper.tsx'))})};
`);
async function main() {
  await new Promise((resolve, reject) => req('webpack')({ mode: 'development', entry: path.join(dir, 'entry.js'),
    output: { path: dir, filename: 'bundle.js' },
    module: { rules: [{ test: /\.tsx?$/, exclude: /node_modules/, use: path.join(dir, 'loader.cjs') }] },
    resolve: { extensions: ['.ts', '.tsx', '.js'], modules: [path.resolve('frontend/node_modules')], alias: {
      '@/components/icons/Icon': path.join(dir, 'icons.js'),
      './gdrive/googleDriveClient': path.join(dir, 'drive.js'),
      '@': path.resolve('frontend/src'),
    } },
  }, (error, stats) => error || stats.hasErrors() ? reject(error || Error(stats.toString({ all: false, errors: true }))) : resolve()));
  const server = http.createServer((request, response) => {
    response.setHeader('Content-Type', request.url === '/bundle.js' ? 'application/javascript' : 'text/html');
    response.end(request.url === '/bundle.js' ? fs.readFileSync(path.join(dir, 'bundle.js')) : '<script src="/bundle.js"></script>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await req('playwright-core').chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = `http://127.0.0.1:${server.address().port}`;
    await page.goto(url);
    await page.evaluate(async () => {
      await Promise.all([qa.initializeBrowserDefaultStorage(), qa.initializeBrowserDefaultStorage()]);
      const workspace = await qa.idb.get('rootFolderHandle');
      const file = await workspace.getFileHandle('테스트.md', { create: true });
      const writer = await file.createWritable(); await writer.write('# 그림책\n\n저장 확인'); await writer.close();
      await qa.saveResourceMedia(new Blob(['image bytes'], { type: 'image/png' }), '테스트.png');
    });
    await page.reload();
    const result = await page.evaluate(async () => {
      await qa.initializeBrowserDefaultStorage();
      const workspace = await qa.idb.get('rootFolderHandle');
      const resources = await qa.idb.get('resourceFolderHandle');
      const media = await resources.getDirectoryHandle('media');
      const profiles = await resources.getDirectoryHandle('profiles');
      const tree = await qa.scanDirectory(workspace);
      return { mode: localStorage.getItem('workspaceType'),
        permission: await workspace.queryPermission({ mode: 'readwrite' }),
        document: await (await (await workspace.getFileHandle('테스트.md')).getFile()).text(),
        image: await (await (await media.getFileHandle('테스트.png')).getFile()).text(),
        profiles: JSON.parse(await (await (await profiles.getFileHandle('userCssProfiles.json')).getFile()).text()).length,
        listed: tree.some(node => node.name === '테스트.md'),
        pickerStart: await qa.browserPickerStartIn(workspace),
      };
    });
    assert.equal(result.mode, 'browser'); assert.equal(result.permission, 'granted');
    assert.equal(result.document, '# 그림책\n\n저장 확인'); assert.equal(result.image, 'image bytes');
    assert.ok(result.profiles > 0); assert.equal(result.listed, true);
    assert.equal(result.pickerStart, undefined);
    for (const scenario of ['cloud', 'external', 'disconnected', 'desktop']) {
      const isolated = await browser.newContext(); const tab = await isolated.newPage(); await tab.goto(url);
      const state = await tab.evaluate(async scenario => {
        if (scenario === 'cloud') { localStorage.setItem('workspaceType', 'cloud'); localStorage.setItem('rootFolder', '{"name":"Cloud"}'); }
        if (scenario === 'external') { localStorage.setItem('rootFolder', '{"name":"MyFolder"}'); localStorage.setItem('onrivi_resource_settings', '{"local":{"kind":"browser","path":"MyResources"}}'); }
        if (scenario === 'disconnected') { localStorage.setItem('rootFolder', '{"name":"MyFolder"}'); localStorage.setItem('onrivi_resource_settings', '{"local":null}'); }
        if (scenario === 'desktop') window.electronAPI = {};
        const before = JSON.stringify({ ...localStorage });
        await qa.initializeBrowserDefaultStorage();
        return { unchanged: before === JSON.stringify({ ...localStorage }), handle: !!await qa.idb.get('rootFolderHandle') };
      }, scenario);
      assert.equal(state.unchanged, scenario !== 'disconnected', scenario); assert.equal(state.handle, false, scenario);
      if (scenario === 'disconnected') {
        assert.equal(await tab.evaluate(() => JSON.parse(localStorage.getItem('onrivi_resource_settings')).local.kind), 'browser');
        assert.equal(await tab.evaluate(async () => !!await qa.idb.get('resourceFolderHandle')), true);
      }
      await isolated.close();
    }
    assert.deepEqual(errors, []);
    console.log('PASS: real OPFS + IndexedDB initialization, document/image write and reload, explorer scan, default profiles, existing destination guards');
    await context.close();
  } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
