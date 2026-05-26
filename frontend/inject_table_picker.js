const fs = require('fs');

let content = fs.readFileSync('d:/developer/OnriviMarkDown/frontend/src/components/Toolbar.tsx', 'utf8');

if (!content.includes('import TablePicker')) {
  content = content.replace("import { useToast } from '@/components/ToastProvider';", "import { useToast } from '@/components/ToastProvider';\nimport TablePicker from './TablePicker';");
}

if (!content.includes('const [isTablePickerOpen')) {
  content = content.replace("const [headingLevel, setHeadingLevel] = React.useState(3);", "const [headingLevel, setHeadingLevel] = React.useState(3);\n  const [isTablePickerOpen, setIsTablePickerOpen] = React.useState(false);");
}

// Find the table button and replace it
const tableBtnMatch = /<ToolbarButton label="📊" title=\{t\('table'\)\} onClick=\{\(\) => handlers\.table\(\)\} \/>/;
if (content.match(tableBtnMatch)) {
  const replacement = `
              <div className="relative">
                <ToolbarButton label="📊" title={t('table')} onClick={() => setIsTablePickerOpen(!isTablePickerOpen)} />
                {isTablePickerOpen && (
                  <div className="absolute top-full left-0 mt-1">
                    <TablePicker 
                      isDarkMode={isDarkMode} 
                      onClose={() => setIsTablePickerOpen(false)}
                      onSelect={(r, c) => {
                        let header = "| " + Array(c).fill("제목").join(" | ") + " |\\n";
                        let divider = "| " + Array(c).fill("---").join(" | ") + " |\\n";
                        let row = "| " + Array(c).fill("내용").join(" | ") + " |\\n";
                        let body = Array(r).fill(row).join("");
                        
                        // We need a way to insert text at cursor. The handlers.table doesn't take arguments.
                        // We will add a custom handler to page.tsx soon. For now we use handlers.insertTable(r, c) or handlers.insertText
                        if (handlers.insertText) {
                          handlers.insertText(\`\\n\${header}\${divider}\${body}\\n\`);
                        }
                      }} 
                    />
                  </div>
                )}
              </div>
  `.trim();
  content = content.replace(tableBtnMatch, replacement);
}

fs.writeFileSync('d:/developer/OnriviMarkDown/frontend/src/components/Toolbar.tsx', content, 'utf8');
