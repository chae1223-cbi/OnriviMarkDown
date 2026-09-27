const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(relative, mocks = {}) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, structuredClone, URL,
    require: name => name in mocks ? mocks[name] : require(name) });
  return exports;
}
const profiles = load('src/constants/cssProfile.ts');
test('effective profile keeps system ID and fills omitted tags with displayed defaults', () => {
  const base = profiles.SYSTEM_PROFILES[0];
  const resolved = profiles.resolveCssProfile({ id: base.id, name: base.name, pageStyle: {}, rules: { h1: { color: '#123456' } } });
  assert.equal(resolved.id, base.id);
  assert.equal(resolved.rules.h1.color, '#123456');
  assert.equal(resolved.rules.h2['font-weight'], base.rules.h2['font-weight']);
  assert.ok(resolved.rules.table);
});
test('export applies displayed H2 rule after custom CSS', () => {
  const exportModule = load('src/lib/exportHandlers.ts', {
    '@/constants/cssProfile': profiles,
    '@/constants/paperSizes': { PAPER_SIZES: { a4: { width: 210, height: 297 } } },
    '@/lib/apiUrlBuilder': { getApiUrl: () => '' },
    '@/lib/systemMessages': { msg: () => '' },
  });
  const profile = {
    id: 'user-test', name: 'Test', pageStyle: profiles.DEFAULT_PROFILE.pageStyle,
    rules: { h2: { 'border-bottom': 'none', 'text-align': 'left' } },
    customCss: 'h2 { border-bottom: 2px solid red; }',
  };
  const css = exportModule.generateExportCss(profile);
  assert.ok(css.indexOf('h2 { border-bottom: 2px solid red; }') < css.lastIndexOf('border-bottom: none !important'));
  assert.ok(css.includes('margin-left: 0 !important'));
});
