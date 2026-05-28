const fs = require('fs');
const path = require('path');

const dir = __dirname + '/src/components';
const files = ['ImageModal.tsx', 'YoutubeModal.tsx', 'FormulaModal.tsx', 'MapModal.tsx', 'TableModal.tsx', 'ConfirmModal.tsx', 'ExportModal.tsx', 'MergeModal.tsx'];

for (const file of files) {
  const p = path.join(dir, file);
  if (!fs.existsSync(p)) continue;
  let content = fs.readFileSync(p, 'utf8');
  
  // ImageModal
  content = content.replace(/\?\?\?\?\? \?명/g, "이미지 설명");
  content = content.replace(/\?\?\? \?명/g, "이미지 설명");
  content = content.replace(/\?제\?\?\?\? 주소 추출/g, "실제 이미지 주소 추출");
  content = content.replace(/\?입 \?\?모달 \?기 추\?/g, "삽입 후 모달 닫기 추가");
  content = content.replace(/\?\?\? 경로 \?는 URL/g, "이미지 경로 또는 URL");
  content = content.replace(/\?\?\? \?명 \(Alt\)/g, "이미지 설명 (Alt)");
  content = content.replace(/\?효\?\?\?\?\? 주소\?\?력\?면<br\/>\?기\?\?미리보기\? \?시\?니\?\?/g, "유효한 이미지 주소를 입력하면<br/>여기에 미리보기가 표시됩니다.");
  content = content.replace(/\?효\?\?\?\?\? 주소\?\?력\?면<br\/>\?기\?\?미리보기\? \?시\?니\?\?/g, "유효한 이미지 주소를 입력하면<br/>여기에 미리보기가 표시됩니다.");
  content = content.replace(/마크\?운 코드 \?입/g, "마크다운 코드 삽입");

  // TableModal
  content = content.replace(/\? \?입/g, "표 삽입");
  content = content.replace(/행 개\?\?/g, "행 개수");
  content = content.replace(/열 개\?\?/g, "열 개수");

  // MapModal
  content = content.replace(/지\?\? \?입/g, "지도 삽입");
  content = content.replace(/지\?\? 크기/g, "지도 크기");
  content = content.replace(/\?\? \(px \?는 %\)/g, "너비 (px 또는 %)");
  content = content.replace(/높이 \(px \?는 %\)/g, "높이 (px 또는 %)");

  // YoutubeModal
  content = content.replace(/\?튜\? \?영 \?입/g, "유튜브 영상 삽입");
  content = content.replace(/\?튜\? \?영 \?입/g, "유튜브 영상 삽입");
  content = content.replace(/\?튜\? 링크 \?는 공유 코드/g, "유튜브 링크 또는 공유 코드");
  content = content.replace(/미리보기 직접 \?생 \(Iframe\)/g, "미리보기 직접 재생 (Iframe)");
  content = content.replace(/\?네\?\?링크 \?동 \(Markdown\)/g, "썸네일 링크 이동 (Markdown)");
  content = content.replace(/\?레\?어 \?기 \?\?\?/g, "플레이어 크기 지정");
  content = content.replace(/\?효\?\?\?튜\?주소\?\?력\?면<br\/>\?기\?\?미리보기\? \?시\?니\?\?/g, "유효한 유튜브 주소를 입력하면<br/>여기에 미리보기가 표시됩니다.");
  content = content.replace(/\?효\?\?\?튜\?주소\?\?력\?면<br\/>\?기\?\?미리보기\? \?시\?니\?\?/g, "유효한 유튜브 주소를 입력하면<br/>여기에 미리보기가 표시됩니다.");
  
  // FormulaModal
  content = content.replace(/\?식 \?디\?\?/g, "수식 에디터");
  content = content.replace(/LaTeX 문법\?\?\?용\?여 \?식\?\?\?성\?세\?\?/g, "LaTeX 문법을 사용하여 수식을 작성하세요");
  content = content.replace(/<span>\?\? \?\?바꿈\?\? \\\\ \?\?용\?고, 공백\?\? \\quad \?는 \\, \?\?용\?세\?\?<\/span>/g, "<span>줄 바꿈은 \\\\ 를 사용하고, 공백은 \\quad 또는 \\, 를 사용하세요.</span>");

  // Common UI Buttons
  content = content.replace(/취\?/g, "취소");
  content = content.replace(/\?인/g, "확인");
  content = content.replace(/\?입/g, "삽입");

  fs.writeFileSync(p, content, 'utf8');
}
console.log('Fixed Korean text');
