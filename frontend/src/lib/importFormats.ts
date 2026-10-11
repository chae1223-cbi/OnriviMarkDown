/** Formats implemented by convertFileToMarkdown. Keep chooser and validation in sync. */
export const IMPORT_EXTENSIONS = ['docx', 'hwp', 'pdf', 'epub', 'txt', 'md', 'markdown', 'html', 'htm'] as const;
export const IMPORT_ACCEPT = IMPORT_EXTENSIONS.map(extension => `.${extension}`).join(',');
export function isSupportedImportFile(name: string): boolean {
  return (IMPORT_EXTENSIONS as readonly string[]).includes(name.split('.').pop()?.toLowerCase() || '');
}

export const IMPORT_PICKER_OPTIONS = {
  multiple: false,
  excludeAcceptAllOption: true,
  types: [{
    description: '지원 문서 (DOCX, HWP, PDF, EPUB, TXT, MD, HTML)',
    accept: { 'application/octet-stream': IMPORT_EXTENSIONS.map(extension => `.${extension}`) }
  }]
};
