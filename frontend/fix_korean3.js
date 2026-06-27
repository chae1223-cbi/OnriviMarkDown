const fs = require('fs');

const base = __dirname + '/src/components';
const fileMap = {
  [base + '/FormulaModal.tsx']: [
    [/\?\릭\?\여 \?\택/g, "클릭하여 선택"],
    [/<p className="text-xs">최근 \?\용\?\?\?\식\?\?\?\습\?\다\.<\/p>/g, '<p className="text-xs">최근 사용한 수식이 없습니다.</p>'],
    [/초기\?\?/g, "초기화"],
    [/placeholder="\?\? \\frac\{-b \\pm \\sqrt\{b\^2 - 4ac\}\}\{2a\}"/g, 'placeholder="예: \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"'],
    [/문서\?\?\?\입\?\기/g, "문서에 삽입하기"]
  ],
  [base + '/ImageModal.tsx']: [
    [/onClose\(\); \/\/ \?\입 \?\?모달 \?\기 추\\?/g, 'onClose(); // 삽입 후 모달 닫기 추가']
  ],
  [base + '/MapModal.tsx']: [
    [/const \[address, setAddress\] = useState\("\?\울\?\별\?\?중구 \?\종\?\\?110"\);/g, 'const [address, setAddress] = useState("서울특별시 중구 세종대로 110");'],
    [/showToast\("\\?\?\?결과\\?찾을 \?\?\?\습\?\다\.", 'error'\);/g, 'showToast("검색 결과를 찾을 수 없습니다.", \'error\');'],
    [/placeholder="\?\소명을 \?\력\?\고 \?\터\\?\?\르\?\요\.\.\."/g, 'placeholder="장소명을 입력하고 엔터를 누르세요..."']
  ],
  [base + '/MergeModal.tsx']: [
    [/showToast\(language === 'ko' \? '최종 \?\일명을 \?\력\?\주\?\요\.' : 'Please enter target filename\.', 'warning'\);/g, 'showToast(language === \'ko\' ? \'최종 파일명을 입력해주세요.\' : \'Please enter target filename.\', \'warning\');'],
    [/setTimeout\(\(\) => refreshParent\(\), 300\); \/\/ \?\\\?\\?\?\?\?\덱\?\?\?\기\?\?갱신/g, 'setTimeout(() => refreshParent(), 300); // 파일 시스템 인덱스 동기화 갱신']
  ],
  [base + '/SettingsModal.tsx']: [
    [/\{\/\* 좌측 \?이\?바 \(\?\? \*\/\}/g, '{/* 좌측 사이드바 */}'],
    [/\{\/\* 3\. 브라\?\\\? \?\토리\\? \?\역 \(\?\용 \?\?\?\으\\?\?\\\? 처리\) \*\/\}/g, '{/* 3. 브라우저 스토리지 영역 (사용 안 하므로 숨김 처리) */}'],
    [/\?\국\?\?\(Korean\)/g, '한국어 (Korean)'],
    [/\?\축\?\\?\?\래\?\?커맨\?\?\?\정/g, '단축키 및 슬래시 커맨드 설정'],
    [/기본값으\\?초기\?\?\(Reset\)/g, '기본값으로 초기화 (Reset)'],
    [/if \(workspaceType === 'browser' && \(\!rootFolder \|\| rootFolder\.name \!== '브라\?\\\? \?\토리\\?'\)\) \{/g, 'if (workspaceType === \'browser\' && (!rootFolder || rootFolder.name !== \'브라우저 스토리지\')) {']
  ],
  [base + '/TableModal.tsx']: [
    [/그리\?\\\? \?\릭\?\여 \?\기\\?\?\정\?\세\?\?/g, '그리드를 클릭하여 크기를 지정하세요'],
    [/\{selectedPos\.c\} x \{selectedPos\.r\} \?\?\?\입\?\기/g, '{selectedPos.c} x {selectedPos.r} 표 삽입하기']
  ],
  [base + '/YoutubeModal.tsx']: [
    [/showToast\("\?\바\\?\?\튜\\?링크\?\?\?\스코드\\?\?\력\?\주\?\요\.", "warning"\);/g, 'showToast("올바른 유튜브 링크나 소스코드를 입력해주세요.", "warning");'],
    [/showToast\("\?\튜\\?\?\영\?\이 본문\?\?\?\입\?\었\?\니\?\?", "success"\);/g, 'showToast("유튜브 영상이 본문에 삽입되었습니다.", "success");'],
    [/\{\/\* Option: Insert Type \(\?\림\?\?\?\?\?\태\?\?\?\그먼티\?\?컨트롤로 촌스\?\\\? \?\면 \?\소\) \*\/\}/g, '{/* Option: Insert Type */}'],
    [/\{\/\* Preview Area \(\?\\\? \?\선 \\?\?\\\?\\? 모달 룩앤\?\?100% \?\치\) \*\/\}/g, '{/* Preview Area */}']
  ]
};

for (const [file, pairs] of Object.entries(fileMap)) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    for (const [from, to] of pairs) {
      content = content.replace(from, to);
    }
    fs.writeFileSync(file, content, 'utf8');
  }
}

// Special check for any remaining lines
const files = Object.keys(fileMap);
let remaining = 0;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  content.split('\n').forEach((l,i) => {
    let text = l.trim();
    if (!text.includes('?')) return;
    if (text.includes('isDarkMode ?') || text.includes('?.') || text.includes('?:') || text.includes('http') || text.match(/[a-zA-Z0-9_]+ \?/)) return;
    if (text.startsWith('//')) return;
    if (text.includes('/>')) return;
    if (text.includes('match(') || text.includes('regExp')) return;
    if (text.match(/\?[가-힣\?]/) || text.match(/[가-힣]\?/)) {
      console.log('REMAINING: ' + file + ':' + (i+1) + ': ' + text);
      remaining++;
    }
  });
}
if(remaining === 0) console.log("All Korean strings fixed!");
