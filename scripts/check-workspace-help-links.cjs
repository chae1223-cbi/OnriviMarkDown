const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const req = require('node:module').createRequire(path.resolve('frontend/package.json'));
const ts = req('typescript');
const compile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const load = source => { const exports = {}; Function('exports', compile(source))(exports); return exports; };
const native = load(fs.readFileSync('frontend/src/lib/nativeDocumentPath.ts', 'utf8'));
const workspace = 'D:/Developer/OnriviMarkDown/OnriviMarkDown';
const current = `${workspace}/frontend/public/help/HELP-01_온리비_어서_소개와_시작하기.md`;
const expected = `${workspace}/frontend/public/help/00_시작하기.md`;
assert.equal(native.resolveWorkspaceHelpLink('/help/00_시작하기.md', current), expected);
assert.equal(native.resolveWorkspaceHelpLink('help/00_시작하기.md', current), expected);
assert.equal(native.resolveWorkspaceHelpLink('./00_시작하기.md', current), './00_시작하기.md');
assert.equal(native.resolveWorkspaceHelpLink('/help/00_시작하기.md', `${workspace}/notes.md`), '/help/00_시작하기.md');

function extract(file, find) {
  const source = fs.readFileSync(file, 'utf8'), tree = ts.createSourceFile(file, source, 99, true, ts.ScriptKind.TSX);
  let result;
  function visit(node) { if (find(node, tree)) result = node.getText(tree); ts.forEachChild(node, visit); }
  visit(tree); assert.ok(result, file); return result;
}
// Exercise both real document-view link resolvers, not a duplicate of their logic.
const markdown = load('exports.resolve=' + extract('frontend/src/components/MarkdownViewer.tsx', n => ts.isArrowFunction(n) && ts.isVariableDeclaration(n.parent) && n.parent.name.getText() === 'resolveRelativeImagePath'));
const visualSource = extract('frontend/src/components/VisualDocumentEditor.tsx', n => ts.isFunctionDeclaration(n) && n.name?.text === 'resolveDocPath');
const visual = load(visualSource + '\nexports.resolve=resolveDocPath;');
assert.equal(markdown.resolve('./00_시작하기.md', current), expected);
assert.equal(visual.resolve('./00_시작하기.md', current), expected);

const main = fs.readFileSync('main.js', 'utf8'), tree = ts.createSourceFile('main.js', main, 99, true);
function handler(name) {
  let callback;
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(tree) === 'ipcMain.handle' && node.arguments[0]?.text === name) callback = node.arguments[1].getText(tree);
    ts.forEachChild(node, visit);
  }
  visit(tree); assert.ok(callback); return compile(`exports.run=${callback};`);
}
const norm = value => path.win32.normalize(value).toLowerCase();
const appPath = 'C:/Program Files/Onrivi Author/resources/app.asar';
const bundled = `${appPath}/frontend/out/help/00_시작하기.md`;
const files = new Map([[norm(expected), 'workspace source'], [norm(current), 'workspace chapter'], [norm(bundled), 'installed source']]);
const writes = [];
const fakeFs = {
  existsSync: target => files.has(norm(target)) || norm(target) === norm(workspace),
  promises: { readFile: async target => { assert.ok(files.has(norm(target)), target); return files.get(norm(target)); } },
  writeFileSync: (target, value) => { writes.push(norm(target)); files.set(norm(target), value); },
};
function ipc(name) {
  const exports = {};
  Function('exports', 'fs', 'path', 'app', 'process', 'currentActiveWorkspacePath', 'findFileRecursive', 'require', 'console', handler(name))(
    exports, fakeFs, path.win32, { getAppPath: () => appPath }, { resourcesPath: 'C:/Program Files/Onrivi Author/resources' }, workspace,
    () => '', () => ({ externalizeInlineImages: source => source }), { warn() {}, error() {} });
  return exports.run;
}
(async () => {
  const read = ipc('file:readFromPath'), save = ipc('file:save');
  const opened = await read(null, native.resolveWorkspaceHelpLink('/help/00_시작하기.md', current));
  assert.equal(norm(opened.path), norm(expected));
  assert.equal(opened.content, 'workspace source');
  assert.equal((await read(null, 'file:///' + encodeURI(expected))).content, 'workspace source');
  await save(null, opened.path, 'edited workspace source');
  assert.deepEqual(writes, [norm(expected)], 'normal Save must write directly to the workspace original');
  assert.equal(files.get(norm(bundled)), 'installed source');
  await assert.rejects(read(null, `${workspace}/missing/help/00_시작하기.md`), /파일을 찾을 수 없습니다/);
  await assert.rejects(read(null, 'missing/help/00_시작하기.md'), /파일을 찾을 수 없습니다/);
  const helpCenter = await read(null, 'help/00_시작하기.md');
  assert.equal(helpCenter.content, 'installed source', 'explicit built-in Help remains available');
  console.log('PASS: both document views resolve workspace sibling links; legacy /help URLs stay in the source folder; actual Electron read/save handlers write workspace originals; missing files never switch to installed namesakes');
})().catch(error => { console.error(error); process.exitCode = 1; });
