// Relative document names are meaningful only inside a connected native workspace.
export function resolveNativeDocumentPath(filePath: string, root?: { name?: string; path?: string; type?: string } | null): string | null {
  if (root?.type === 'GDRIVE') return null;
  let value = filePath.normalize('NFC');
  if (value.startsWith('file:///')) value = decodeURIComponent(value.slice(8));
  const absolute = /^(?:[a-zA-Z]:[/\\]|\\\\|\/)/;
  if (absolute.test(value)) return value;
  const rootPath = root?.path || root?.name;
  if (!rootPath || !absolute.test(rootPath)) return null;
  return `${rootPath.replace(/[/\\]+$/, '')}/${value.replace(/^[/\\]+/, '')}`;
}

/** Match document links by location; same-named files in different folders are different documents. */
export function matchesLinkedDocument(candidate: { path?: string; name?: string }, target: string, root?: { name?: string; path?: string; type?: string } | null): boolean {
  const normalize = (input: string) => {
    let value = input;
    try { value = decodeURIComponent(value); } catch {}
    value = value.replace(/^file:\/\/\//i, '').replace(/\\/g, '/').normalize('NFC');
    const windows = /^[a-z]:\//i.test(value) || value.startsWith('//');
    const parts: string[] = [];
    for (const part of value.split('/')) {
      if (part === '.') continue;
      if (part === '..' && parts.length && parts[parts.length - 1] !== '..') parts.pop();
      else parts.push(part);
    }
    const result = parts.join('/');
    return windows ? result.toLowerCase() : result;
  };
  const targetPath = target.replace(/^\.\//, '');
  const bareName = !/[/\\]/.test(targetPath);
  if (candidate.path) {
    const resolvedTarget = resolveNativeDocumentPath(target, root) || target;
    const resolvedCandidate = resolveNativeDocumentPath(candidate.path, root) || candidate.path;
    if (normalize(resolvedCandidate) === normalize(resolvedTarget)) return true;
  }
  return bareName && (normalize(candidate.name || '') === normalize(targetPath) || normalize(candidate.name || '').replace(/\.md$/i, '') === normalize(targetPath).replace(/\.md$/i, ''));
}

/** Older help documents used web-root URLs even when edited as workspace files. */
export function resolveWorkspaceHelpLink(target: string, currentFile?: string | null): string {
  let link = target;
  try { link = decodeURIComponent(link); } catch {}
  const match = link.replace(/\\/g, '/').match(/^(?:\.?\/)?help\/([^/]+\.md)$/i);
  if (!match || !currentFile) return target;
  const source = currentFile.replace(/\\/g, '/');
  if (/(?:^|\/)[^/]+\.asar(?:\/|$)/i.test(source)) return target;
  if (!/(?:^|\/)help\/[^/]+\.md$/i.test(source)) return target;
  return `${source.slice(0, source.lastIndexOf('/'))}/${match[1]}`;
}
