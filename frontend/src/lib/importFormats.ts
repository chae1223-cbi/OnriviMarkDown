/** Formats implemented by convertFileToMarkdown. Keep chooser and validation in sync. */
export const IMPORT_EXTENSIONS = ['docx', 'hwp', 'pdf', 'epub', 'txt', 'md', 'markdown', 'html', 'htm'] as const;
export const IMPORT_ACCEPT = IMPORT_EXTENSIONS.map(extension => `.${extension}`).join(',');
export function isSupportedImportFile(name: string): boolean {
  return (IMPORT_EXTENSIONS as readonly string[]).includes(name.split('.').pop()?.toLowerCase() || '');
}
