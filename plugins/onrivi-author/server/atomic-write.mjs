import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

// Keep the original file intact until the complete replacement is on disk.
export async function atomicReplace(file, bytes, beforeCommit) {
  const temporary = path.join(path.dirname(file), `.${path.basename(file)}.${randomUUID()}.tmp`);
  let staged = false;
  try {
    const original = await fs.stat(file);
    const handle = await fs.open(temporary, 'wx', original.mode);
    staged = true;
    try { await handle.writeFile(bytes); await handle.sync(); }
    finally { await handle.close(); }
    await beforeCommit();
    await fs.rename(temporary, file);
    staged = false;
  } finally {
    if (staged) await fs.unlink(temporary).catch(() => {});
  }
}
