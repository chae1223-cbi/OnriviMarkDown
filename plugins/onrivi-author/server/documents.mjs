import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { atomicReplace } from './atomic-write.mjs';

const MAX_BYTES = 2 * 1024 * 1024;
const markdownPath = (value) => typeof value === 'string' && path.isAbsolute(value) && /\.(md|markdown)$/i.test(value);
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

async function fileAt(input, allowedFolders) {
  if (!markdownPath(input)) throw new Error('절대경로로 된 .md 또는 .markdown 파일을 지정하세요.');
  const resolved = path.resolve(input);
  if (!Array.isArray(allowedFolders) || allowedFolders.length === 0) throw new Error('현재 작업장과 리소스 폴더를 확인해 주세요.');
  const actual = await fs.realpath(resolved);
  let allowed = false;
  for (const folder of allowedFolders) {
    const root = await fs.realpath(folder);
    const relative = path.relative(root, actual);
    if (relative && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative)) allowed = true;
  }
  if (!allowed) throw new Error('현재 작업장 또는 리소스 폴더 밖의 문서는 사용할 수 없습니다.');
  const stat = await fs.lstat(resolved);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('일반 마크다운 파일만 지원합니다.');
  if (stat.size > MAX_BYTES) throw new Error('문서가 2 MiB 제한을 초과했습니다.');
  return resolved;
}

export async function readDocument(input, allowedFolders) {
  const file = await fileAt(input, allowedFolders);
  const bytes = await fs.readFile(file);
  if (bytes.length > MAX_BYTES || bytes.includes(0)) throw new Error('2 MiB 이하의 텍스트 마크다운 파일만 지원합니다.');
  return { path: file, content: bytes.toString('utf8'), sha256: sha256(bytes) };
}

export async function replaceDocument(input, expectedSha256, content, allowedFolders, beforeWrite) {
  if (typeof content !== 'string') throw new Error('content는 문자열이어야 합니다.');
  if (!/^[a-f0-9]{64}$/i.test(expectedSha256 ?? '')) throw new Error('read_markdown에서 받은 SHA-256 값이 필요합니다.');
  const bytes = Buffer.from(content, 'utf8');
  if (bytes.length > MAX_BYTES || bytes.includes(0)) throw new Error('내용은 2 MiB 이하의 텍스트여야 합니다.');
  const file = await fileAt(input, allowedFolders);
  {
    const stat = await fs.lstat(file);
    if (!stat.isFile() || stat.size > MAX_BYTES) throw new Error('이 문서는 더 이상 지원되는 파일이 아닙니다.');
    const current = await fs.readFile(file);
    if (sha256(current) !== expectedSha256.toLowerCase()) throw new Error('문서를 읽은 뒤 파일이 변경되었습니다. 다시 읽은 후 저장하세요.');
    await atomicReplace(file, bytes, async () => {
      if (beforeWrite) await beforeWrite();
      await fileAt(input, allowedFolders);
      if (sha256(await fs.readFile(file)) !== expectedSha256.toLowerCase()) throw new Error('문서를 읽은 뒤 파일이 변경되었습니다. 다시 읽은 후 저장하세요.');
    });
  }
  return { path: file, sha256: sha256(bytes), bytes: bytes.length };
}
