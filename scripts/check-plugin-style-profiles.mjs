import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { listProfiles, createProfile } from '../plugins/onrivi-author/server/profiles.mjs';

const root = await fs.mkdtemp(path.join(os.tmpdir(), 'onrivi-profiles-'));
try {
  const dir = path.join(root, 'profiles');
  await fs.mkdir(dir);
  const file = path.join(dir, 'userCssProfiles.json');
  const original = [{ id: 'base', name: '기본 서식', pageStyle: { paperSize: 'a4', fontSize: '16px' }, rules: { h1: { color: '#000000' } } }];
  await fs.writeFile(file, JSON.stringify(original));

  const before = await listProfiles(root);
  assert.equal(before.userProfiles.length, 1);
  const result = await createProfile({ resourceFolder: root, expectedSha256: before.sha256, baseProfileId: 'base', name: '새 보고서', pageStyle: { paperSize: 'letter' }, rules: { h1: { color: '#123456' } } });
  assert.equal(result.count, 2);
  const saved = JSON.parse(await fs.readFile(file, 'utf8'));
  assert.deepEqual(saved[0], original[0]);
  assert.equal(saved[1].pageStyle.paperSize, 'letter');
  assert.equal(saved[1].rules.h1.color, '#123456');
  assert.notEqual(saved[1].id, 'base');

  await assert.rejects(createProfile({ resourceFolder: root, expectedSha256: before.sha256, baseProfileId: 'base', name: '오래된 요청' }), /변경되었습니다/);
  await assert.rejects(createProfile({ resourceFolder: root, expectedSha256: result.sha256, baseProfileId: 'base', name: '새 보고서' }), /같은 이름/);
  await assert.rejects(createProfile({ resourceFolder: root, expectedSha256: result.sha256, baseProfileId: 'base', name: '위험', rules: { h1: { color: 'red; display:none' } } }), /안전한 CSS/);
  assert.equal((await listProfiles(root)).userProfiles.length, 2);
  process.stdout.write('style profile MCP checks passed\n');
} finally {
  await fs.rm(root, { recursive: true, force: true });
}
