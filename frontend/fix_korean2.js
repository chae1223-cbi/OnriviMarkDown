const fs = require('fs');
const path = require('path');

const dir = 'd:/developer/OnriviMarkDown/frontend/src/components';
const files = ['ImageModal.tsx', 'YoutubeModal.tsx', 'FormulaModal.tsx', 'MapModal.tsx', 'TableModal.tsx', 'ConfirmModal.tsx', 'ExportModal.tsx', 'MergeModal.tsx'];

for (const file of files) {
  const p = path.join(dir, file);
  if (!fs.existsSync(p)) continue;
  let lines = fs.readFileSync(p, 'utf8').split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    // ImageModal
    if (lines[i].includes('useState(') && lines[i].includes('imageAlt')) {
      lines[i] = '  const [imageAlt, setImageAlt] = React.useState("이미지 설명");';
    }
    if (lines[i].includes('//') && lines[i].includes('주소 추출')) {
      lines[i] = '  // 실제 이미지 주소 추출';
    }
    if (lines[i].includes('setImageAlt(')) {
      lines[i] = '      setImageAlt("이미지 설명");';
    }
    if (lines[i].includes('//') && lines[i].includes('모달')) {
      // keep it simple or just leave comment as is
    }
    if (lines[i].includes('<label') && lines[i].includes('URL')) {
      lines[i] = '            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">이미지 경로 또는 URL</label>';
    }
    if (lines[i].includes('<label') && lines[i].includes('(Alt)')) {
      lines[i] = '            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">이미지 설명 (Alt)</label>';
    }
    if (lines[i].includes('<p') && lines[i].includes('미리보기') && lines[i].includes('br')) {
      lines[i] = '                <p className="text-xs">유효한 이미지 주소를 입력하면<br/>여기에 미리보기가 표시됩니다.</p>';
    }
    if (lines[i].includes('마크') && lines[i].includes('코드')) {
      lines[i] = '              마크다운 코드 삽입';
    }
    
    // YoutubeModal
    if (lines[i].includes('<h2') && lines[i].includes('text-xl')) {
       if (file === 'YoutubeModal.tsx') lines[i] = '            <h2 className={`text-xl font-semibold ${isDarkMode ? \'text-blue-300\' : \'text-[#181c20]\'}`}>유튜브 영상 삽입</h2>';
       if (file === 'ImageModal.tsx') lines[i] = '            <h2 className={`text-xl font-semibold ${isDarkMode ? \'text-blue-300\' : \'text-[#181c20]\'}`}>이미지 삽입</h2>';
       if (file === 'TableModal.tsx') lines[i] = '            <h2 className={`text-xl font-semibold ${isDarkMode ? \'text-blue-300\' : \'text-[#181c20]\'}`}>표 삽입</h2>';
       if (file === 'MapModal.tsx') lines[i] = '            <h2 className={`text-xl font-semibold ${isDarkMode ? \'text-blue-300\' : \'text-[#181c20]\'}`}>지도 삽입</h2>';
    }
    if (file === 'YoutubeModal.tsx' && lines[i].includes('<span') && lines[i].includes('text-lg')) {
       lines[i] = '            <span className="text-lg leading-none">유튜브</span>';
    }
    if (file === 'ImageModal.tsx' && lines[i].includes('<span') && lines[i].includes('text-lg')) {
       lines[i] = '            <span className="text-lg leading-none">이미지</span>';
    }
    if (file === 'MapModal.tsx' && lines[i].includes('<span') && lines[i].includes('text-lg')) {
       lines[i] = '            <span className="text-lg leading-none">지도</span>';
    }
    if (file === 'TableModal.tsx' && lines[i].includes('<span') && lines[i].includes('text-lg')) {
       lines[i] = '            <span className="text-lg leading-none">표</span>';
    }
    
    if (file === 'YoutubeModal.tsx' && lines[i].includes('<label') && lines[i].includes('URL')) {
      lines[i] = '            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">유튜브 링크 또는 공유 코드</label>';
    }
    if (file === 'YoutubeModal.tsx' && lines[i].includes('Iframe')) {
      lines[i] = '                미리보기 직접 재생 (Iframe)';
    }
    if (file === 'YoutubeModal.tsx' && lines[i].includes('Markdown') && lines[i].includes('</button>') === false) {
      if (lines[i].includes('썸네일')) {} else {
         lines[i] = '                썸네일 링크 삽입 (Markdown)';
      }
    }
    
    // FormulaModal
    if (file === 'FormulaModal.tsx' && lines[i].includes('<h2')) {
       lines[i] = '              <h2 className={`text-base font-bold ${isDarkMode ? \'text-[#eef1f6]\' : \'text-[#181c20]\'}`}>수식 에디터</h2>';
    }
    if (file === 'FormulaModal.tsx' && lines[i].includes('LaTeX')) {
       lines[i] = '              <p className="text-[10px] opacity-50">LaTeX 문법을 사용하여 수식을 작성하세요</p>';
    }
    if (file === 'FormulaModal.tsx' && lines[i].includes('quad')) {
       lines[i] = '              <span>줄 바꿈은 \\\\ 를 사용하고, 공백은 \\quad 또는 \\, 를 사용하세요.</span>';
    }
    if (file === 'FormulaModal.tsx' && lines[i].includes('label=') && lines[i].includes('templates')) {
       lines[i] = '              <TabBtn active={activeTab === \'templates\'} onClick={() => setActiveTab(\'templates\')} icon={<Calculator size={14}/>} label="템플릿" isDarkMode={isDarkMode} />';
    }
    if (file === 'FormulaModal.tsx' && lines[i].includes('label=') && lines[i].includes('symbols')) {
       lines[i] = '              <TabBtn active={activeTab === \'symbols\'} onClick={() => setActiveTab(\'symbols\')} icon={<Sigma size={14}/>} label="기호" isDarkMode={isDarkMode} />';
    }
    if (file === 'FormulaModal.tsx' && lines[i].includes('label=') && lines[i].includes('history')) {
       lines[i] = '              <TabBtn active={activeTab === \'history\'} onClick={() => setActiveTab(\'history\')} icon={<History size={14}/>} label="최근" isDarkMode={isDarkMode} />';
    }

    // MapModal
    if (file === 'MapModal.tsx' && lines[i].includes('<label') && lines[i].includes('URL')) {
      lines[i] = '            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">구글 지도 공유 링크 또는 iframe 코드</label>';
    }
    if (file === 'MapModal.tsx' && lines[i].includes('<label') && lines[i].includes('px')) {
      if (lines[i].includes('width')) {
        lines[i] = '                  <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1 block">너비 (px 또는 %)</label>';
      } else {
        lines[i] = '                  <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1 block">높이 (px 또는 %)</label>';
      }
    }
    if (file === 'MapModal.tsx' && lines[i].includes('지도 크기') || lines[i].includes('지?? 크기')) {
       lines[i] = '              <span className="font-medium text-gray-700 dark:text-gray-300">지도 크기</span>';
    }

    // TableModal
    if (file === 'TableModal.tsx' && lines[i].includes('<label') && lines[i].includes('행')) {
      lines[i] = '                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">행 개수</label>';
    }
    if (file === 'TableModal.tsx' && lines[i].includes('<label') && lines[i].includes('열')) {
      lines[i] = '                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">열 개수</label>';
    }

    // Common Buttons
    if (lines[i].includes('onClick={onClose}') && lines[i].includes('</button>') && !lines[i].includes('X')) {
      lines[i] = '            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#21262d] border border-gray-200 dark:border-[#30363d] rounded-xl transition-all active:scale-[0.98]">취소</button>';
    }
    if (lines[i].includes('bg-blue-600') && lines[i].includes('</button>')) {
      if (file === 'MapModal.tsx' || file === 'YoutubeModal.tsx' || file === 'ImageModal.tsx' || file === 'TableModal.tsx' || file === 'FormulaModal.tsx') {
         lines[i] = '            <button onClick={handleInsert} className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]">삽입</button>';
      }
    }
  }

  fs.writeFileSync(p, lines.join('\n'), 'utf8');
}
console.log('Fixed lines directly');
