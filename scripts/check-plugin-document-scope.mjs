import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readDocument, replaceDocument } from '../plugins/onrivi-author/server/documents.mjs';

const root = await fs.mkdtemp(path.join(os.tmpdir(), 'onrivi-doc-scope-'));
try {
  const workspace = path.join(root, 'workspace');
  const resource = path.join(root, 'resource');
  await fs.mkdir(workspace);
  await fs.mkdir(resource);
  const inside = path.join(workspace, 'inside.md');
  const outside = path.join(root, 'outside.md');
  await fs.writeFile(inside, 'before');
  await fs.writeFile(outside, 'secret');
  const roots = [workspace, resource];
  const read = await readDocument(inside, roots);
  await assert.rejects(readDocument(outside, roots), /밖의 문서/);
  await assert.rejects(replaceDocument(outside, read.sha256, 'changed', roots), /밖의 문서/);
  await assert.rejects(replaceDocument(inside, read.sha256, 'changed', roots, async () => { throw new Error('revoked'); }), /revoked/);
  assert.equal(await fs.readFile(inside, 'utf8'), 'before');
  await replaceDocument(inside, read.sha256, 'after', roots);
  assert.equal(await fs.readFile(inside, 'utf8'), 'after');
  process.stdout.write('MCP document scope checks passed\n');
} finally {
  await fs.rm(root, { recursive: true, force: true });
}
