/** Convert form symbols to inline controls usable inside Markdown table cells. */
export function convertFormCheckboxes(text: string): string {
  let index=0;
  return text.split('\n').map(line => {
    // A single square introducing a heading is a bullet, not a form field.
    // Tables and inline groups of choices are the supported form contexts.
    const isFormRow = /^\s*\|/.test(line) || (line.match(/[□☑☒]/g)||[]).length > 1;
    if (!isFormRow) return line;
    return line.replace(/[□☑☒]/g, symbol => `<input type="checkbox" data-import-checkbox="hwp-${++index}" aria-label="선택 항목 ${index}"${symbol === '□' ? '' : ' checked'} />`);
  }).join('\n');
}

export function importedCheckboxEdit(text: string, id: string, checked: boolean) {
  for (const match of Array.from(text.matchAll(/<input\b[^>]*>/g))) {
    if (!match[0].includes(`data-import-checkbox="${id}"`)) continue;
    const clean=match[0].replace(/\s+checked(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi,'');
    return {start:match.index!,end:match.index!+match[0].length,text:checked?clean.replace(/\s*\/?\s*>$/,' checked />'):clean};
  }
  return null;
}
