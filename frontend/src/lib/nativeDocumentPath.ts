// Relative document names are meaningful only inside a connected native workspace.
export function resolveNativeDocumentPath(filePath: string, root?: { name?: string; type?: string } | null): string | null {
  if (root?.type === 'GDRIVE') return null;
  let value = filePath.normalize('NFC');
  if (value.startsWith('file:///')) value = decodeURIComponent(value.slice(8));
  const absolute = /^(?:[a-zA-Z]:[/\\]|\\\\|\/)/;
  if (absolute.test(value)) return value;
  if (!root?.name || !absolute.test(root.name)) return null;
  return `${root.name.replace(/[/\\]+$/, '')}/${value.replace(/^[/\\]+/, '')}`;
}
