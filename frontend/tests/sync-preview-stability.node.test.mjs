import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/lib/syncEngine.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const exports = {};
vm.runInNewContext(compiled, { exports, console });
const { syncPreviewToTargetLine } = exports;

test('typing does not move preview until the rendered line leaves the safe zone', () => {
  let bottom = 380;
  const line = {
    getAttribute: (name) => name === 'data-line' ? '105' : null,
    closest: () => line,
    getBoundingClientRect: () => ({ top: 356, bottom }),
  };
  const preview = {
    clientHeight: 530,
    scrollHeight: 2500,
    scrollTop: 1500,
    getBoundingClientRect: () => ({ top: 0, bottom: 530 }),
    querySelectorAll: () => [line],
  };

  syncPreviewToTargetLine(preview, 105, '', { column: 131 });
  assert.equal(preview.scrollTop, 1500);

  bottom = 430;
  syncPreviewToTargetLine(preview, 105, '', { column: 131 });
  assert.equal(preview.scrollTop, 1540);
});
