const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const quiet = { error() {}, warn() {}, log() {} };
function loadTs(relative, mocks, globals = {}) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  } }).outputText;
  const exports = {};
  const context = { exports, console: quiet, URL, ...globals,
    require: name => name in mocks ? mocks[name] : require(name) };
  vm.runInNewContext(code, context);
  return exports;
}
function facade(api, handle, fetchImpl = () => { throw new Error('Unexpected server access'); }) {
  return loadTs('src/lib/profileStorage.ts', {
    '@/constants/cssProfile': { isSystemProfileId: id => id === 'system-1' },
    '@/lib/secureStorage': { loadSecureData: () => null },
    '@/lib/indexedDbHelper': { idb: { get: async () => handle } },
  }, { window: { electronAPI: api }, localStorage: {
    getItem: key => key === 'userCssProfiles' ? '[{"id":"stale"}]' : null,
    setItem: () => { throw new Error('Unexpected cache write'); },
  }, fetch: fetchImpl });
}
const profiles = [{ id: 'custom', name: 'Imported or AI profile', rules: { h2: { 'border-bottom': 'none' } } }];

test('Desktop reads empty canonical list without resurrecting cached profiles', async () => {
  const storage = facade({ readProfiles: async () => [] });
  assert.equal((await storage.fetchUserProfiles('D:\\chosen')).length, 0);
});
test('Desktop read failure propagates; does not read cache or web API', async () => {
  const storage = facade({ readProfiles: async () => { throw new Error('denied'); } });
  await assert.rejects(storage.fetchUserProfiles('D:\\chosen'), /denied/);
});
test('Desktop saves one JSON payload, excludes system profiles, reports failure', async () => {
  let args;
  let success = true;
  const storage = facade({ saveProfiles: async (...value) => { args = value; return { success }; } });
  assert.equal(await storage.persistUserProfiles([...profiles, { id: 'system-1' }], 'D:\\chosen'), true);
  assert.equal(args.length, 2);
  assert.equal(JSON.stringify(args[0]), JSON.stringify(profiles));
  assert.equal(args[1], 'D:\\chosen');
  success = false;
  assert.equal(await storage.persistUserProfiles(profiles, 'D:\\chosen'), false);
});
function browserHandle({ failClose = false, empty = false } = {}) {
  const calls = [];
  let content = JSON.stringify(empty ? [] : profiles);
  return { calls, name: 'chosen', getDirectoryHandle: async name => {
    calls.push(name);
    assert.equal(name, 'profiles');
    return { getFileHandle: async filename => {
      calls.push(filename);
      assert.equal(filename, 'userCssProfiles.json');
      return { getFile: async () => ({ text: async () => content }), createWritable: async () => ({
        write: async value => { content = value; },
        close: async () => { if (failClose) throw new Error('disk full'); calls.push('closed'); },
        abort: async () => { calls.push('aborted'); },
      }) };
    } };
  } };
}
test('Restored browser handle reads and writes only canonical file, awaits close', async () => {
  const handle = browserHandle({ empty: true });
  const storage = facade(null, handle);
  assert.equal((await storage.fetchUserProfiles('chosen')).length, 0);
  assert.equal(await storage.persistUserProfiles(profiles, 'chosen'), true);
  assert.ok(handle.calls.includes('closed'));
  assert.equal(JSON.stringify(await storage.fetchUserProfiles('chosen')), JSON.stringify(profiles));
});
test('Browser close failure returns failure instead of premature success', async () => {
  const handle = browserHandle({ failClose: true });
  const storage = facade(null, handle);
  assert.equal(await storage.persistUserProfiles(profiles, 'chosen'), false);
  assert.ok(handle.calls.includes('aborted'));
});
test('Unconnected relative folder cannot trigger server path guessing', async () => {
  const storage = facade(null, null);
  await assert.rejects(storage.fetchUserProfiles('chosen'));
  assert.equal(await storage.persistUserProfiles(profiles, 'chosen'), false);
});
test('Rapid edits are persisted in order, including reverting to the original value', async () => {
  const order = [];
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const storage = facade({ saveProfiles: async data => {
    if (data[0].name === 'edited') await gate;
    order.push(data[0].name);
    return { success: true };
  } });
  const first = storage.persistUserProfiles([{ id: 'custom', name: 'edited' }], 'D:\\chosen');
  const second = storage.persistUserProfiles(profiles, 'D:\\chosen');
  release();
  await Promise.all([first, second]);
  assert.deepEqual(order, ['edited', profiles[0].name]);
});

// Exercise production Electron IPC and Next handlers against isolated real files.
for (const runtime of ['electron', 'next']) {
  test(`${runtime}: canonical read/write, empty list, no extra CSS or fallback files`, async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'onrivi-profiles-test-'));
    const handlers = {};
    const main = fs.readFileSync(path.join(root, '..', 'main.js'), 'utf8');
    if (runtime === 'electron') {
      const start = main.indexOf('function resolveUserProfilesPath(');
      const end = main.indexOf('// ─────────────────', start);
      vm.runInNewContext(main.slice(start, end), { fs, path, console: quiet,
        ipcMain: { handle: (name, fn) => { handlers[name] = fn; } } });
    } else {
      Object.assign(handlers, loadTs('src/app/api/profiles/route.ts', {
        'next/server': { NextResponse: { json: (body, options) => ({ ...body, status: options?.status || 200 }) } },
      }));
    }
    const read = folder => runtime === 'electron'
      ? handlers['file:readProfiles'](null, folder)
      : handlers.GET({ url: `http://localhost/api/profiles?resourceFolder=${encodeURIComponent(folder)}` }).then(r => {
        if (!r.success) throw new Error(r.error);
        return r.profiles;
      });
    const save = (folder, data) => runtime === 'electron'
      ? handlers['file:saveProfiles'](null, data, folder, { 'extra.css': 'h2 {}' })
      : handlers.POST({ json: async () => ({ profiles: data, resourceFolder: folder, cssMap: { 'extra.css': 'h2 {}' } }) });
    try {
      fs.writeFileSync(path.join(dir, 'user_profiles.json'), '[{"id":"legacy"}]');
      assert.equal((await read(dir)).length, 0);
      assert.equal((await save(dir, profiles)).success, true);
      assert.deepEqual(fs.readdirSync(path.join(dir, 'profiles')), ['userCssProfiles.json']);
      assert.equal(JSON.stringify(await read(dir)), JSON.stringify(profiles));
      assert.equal((await save(dir, [])).success, true);
      assert.equal((await read(dir)).length, 0);
      fs.writeFileSync(path.join(dir, 'profiles', 'userCssProfiles.json'), '{broken');
      await assert.rejects(read(dir));
      const missing = path.join(dir, 'missing');
      assert.equal((await save(missing, profiles)).success, false);
      assert.equal(fs.existsSync(missing), false);
    } finally {
      const resolved = path.resolve(dir);
      assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
      assert.ok(path.basename(resolved).startsWith('onrivi-profiles-test-'));
      fs.rmSync(resolved, { recursive: true });
    }
  });
}
