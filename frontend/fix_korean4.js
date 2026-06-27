const fs = require('fs');

const base = __dirname + '/src/components';
const fileMap = {
  [base + '/FormulaModal.tsx']: [
    ['릭', '여', '택', '클릭하여 선택'],
    ['<p className="text-xs">최근', '습', '다.</p>', '<p className="text-xs">최근 사용한 수식이 없습니다.</p>'],
    ['초기', '</button>', '초기화                  </button>'],
    ['placeholder="', '\\frac{-b', '2a}"', 'placeholder="예: \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"'],
    ['문서', '입', '기', '문서에 삽입하기']
  ],
  [base + '/ImageModal.tsx']: [
    ['onClose(); // ', '모달', '추', 'onClose(); // 삽입 후 모달 닫기 추가']
  ],
  [base + '/MapModal.tsx']: [
    ['const [address, setAddress] = useState("', '중구', '110");', 'const [address, setAddress] = useState("서울특별시 중구 세종대로 110");'],
    ['showToast("', '결과', '찾을', 'error\');', 'showToast("검색 결과를 찾을 수 없습니다.", \'error\');'],
    ['placeholder="', '소명을', '력', '고', '요..."', 'placeholder="장소명을 입력하고 엔터를 누르세요..."']
  ],
  [base + '/MergeModal.tsx']: [
    ['showToast(language === \'ko\' ? \'최종', '일명을', '력', '요.\' : \'Please enter target filename.\', \'warning\');', 'showToast(language === \'ko\' ? \'최종 파일명을 입력해주세요.\' : \'Please enter target filename.\', \'warning\');'],
    ['setTimeout(() => refreshParent(), 300); // ', '덱', '기', '갱신', 'setTimeout(() => refreshParent(), 300); // 파일 시스템 인덱스 동기화 갱신']
  ],
  [base + '/SettingsModal.tsx']: [
    ['{/* 좌측', '바', '*/}', '{/* 좌측 사이드바 */}'],
    ['{/* 3. 브라', '토리', '역', '용', '처리) */}', '{/* 3. 브라우저 스토리지 영역 (사용 안 하므로 숨김 처리) */}'],
    ['<option value="ko"', '국', '(Korean)</option>', '<option value="ko" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" style={{ backgroundColor: colors.container, color: colors.onSurface }}>한국어 (Korean)</option>'],
    ['<h3 className="text-sm font-bold"', '축', '래', '커맨', '정</h3>', '<h3 className="text-sm font-bold" style={{ color: colors.onSurface }}>단축키 및 슬래시 커맨드 설정</h3>'],
    ['기본값으', '초기', '(Reset)', '기본값으로 초기화 (Reset)'],
    ['if (workspaceType === \'browser\' && (!rootFolder || rootFolder.name !== \'브라', '토리', '\')) {', 'if (workspaceType === \'browser\' && (!rootFolder || rootFolder.name !== \'브라우저 스토리지\')) {']
  ],
  [base + '/TableModal.tsx']: [
    ['그리', '릭', '여', '기', '정', '세', '그리드를 클릭하여 크기를 지정하세요'],
    ['{selectedPos.c} x {selectedPos.r} ', '입', '기', '{selectedPos.c} x {selectedPos.r} 표 삽입하기']
  ],
  [base + '/YoutubeModal.tsx']: [
    ['showToast("', '바', '튜', '링크', '스코드', '력', '주', '요.", "warning");', 'showToast("올바른 유튜브 링크나 소스코드를 입력해주세요.", "warning");'],
    ['showToast("', '튜', '영', '이 본문', '입', '었', '니', '", "success");', 'showToast("유튜브 영상이 본문에 삽입되었습니다.", "success");'],
    ['{/* Option: Insert Type (', '림', '태', '그먼티', '컨트롤로 촌스', '면', '소) */}', '{/* Option: Insert Type */}'],
    ['{/* Preview Area (', '선', '모달 룩앤', '100%', '치) */}', '{/* Preview Area */}']
  ]
};

for (const [file, matchGroups] of Object.entries(fileMap)) {
  if (fs.existsSync(file)) {
    let lines = fs.readFileSync(file, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const group of matchGroups) {
        const targetStr = group[group.length - 1]; // last element is target
        const conditions = group.slice(0, group.length - 1);
        
        let match = true;
        for (const cond of conditions) {
          if (!lines[i].includes(cond)) {
            match = false;
            break;
          }
        }
        
        if (match) {
           // We found the line! Replace it entirely based on its indentation
           const leadingSpace = lines[i].match(/^\s*/)[0];
           lines[i] = leadingSpace + targetStr;
        }
      }
    }
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
  }
}

console.log("Replaced using substring matches.");
