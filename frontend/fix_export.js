const fs = require('fs');

let content = fs.readFileSync('d:/developer/OnriviMarkDown/frontend/src/app/page.tsx', 'utf8');
content = content.replace(/,\s*language/g, '');
content = content.replace(/language\s*:\s*'ko',/g, '');
fs.writeFileSync('d:/developer/OnriviMarkDown/frontend/src/app/page.tsx', content, 'utf8');

let exportHandlers = fs.readFileSync('d:/developer/OnriviMarkDown/frontend/src/lib/exportHandlers.ts', 'utf8');
exportHandlers = exportHandlers.replace(/,\s*language/g, '');
exportHandlers = exportHandlers.replace(/language\s*:\s*Language/g, '');
exportHandlers = exportHandlers.replace(/import\s*\{\s*getTranslation[^}]*\}\s*from\s*['"]@\/lib\/i18n['"];?\n?/g, '');
// Since we removed i18n, any remaining `t('...')` in exportHandlers should be hardcoded.
exportHandlers = exportHandlers.replace(/t\(['"]pdfExportMsg['"]\)/g, "'PDF 내보내기 준비 중...'");
exportHandlers = exportHandlers.replace(/t\(['"]toastPdfExportSuccess['"]\)/g, "'PDF 내보내기가 완료되었습니다.'");
exportHandlers = exportHandlers.replace(/t\(['"]htmlExportMsg['"]\)/g, "'HTML 내보내기 준비 중...'");
exportHandlers = exportHandlers.replace(/t\(['"]toastHtmlExportSuccess['"]\)/g, "'HTML 내보내기가 완료되었습니다.'");
exportHandlers = exportHandlers.replace(/t\(['"]epubExportMsg['"]\)/g, "'EPUB 내보내기 준비 중...'");
exportHandlers = exportHandlers.replace(/t\(['"]toastEpubExportSuccess['"]\)/g, "'EPUB 내보내기가 완료되었습니다.'");
exportHandlers = exportHandlers.replace(/t\(['"]pngExportMsg['"]\)/g, "'이미지 내보내기 준비 중...'");
exportHandlers = exportHandlers.replace(/t\(['"]toastPngExportSuccess['"]\)/g, "'이미지 내보내기가 완료되었습니다.'");
exportHandlers = exportHandlers.replace(/t\(['"]error['"]\)/g, "'오류'");
fs.writeFileSync('d:/developer/OnriviMarkDown/frontend/src/lib/exportHandlers.ts', exportHandlers, 'utf8');
