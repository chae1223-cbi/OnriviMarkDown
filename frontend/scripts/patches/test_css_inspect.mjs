// 실제 dynamicCssString에서 ul, li에 걸리는 스타일 분석
const css = `
.custom-preview-container ul,
.onrivi-content-root ul,
.custom-preview-container .prose ul {
  padding-left: 28px !important;
  list-style-type: disc !important;
  color: #2f2f2f !important;
}

.custom-preview-container li,
.onrivi-content-root li {
  margin-bottom: 5px !important;
  padding-inline-start: 3px !important;
  line-height: 1.7 !important;
}

/* blockquote 스타일 */
.custom-preview-container blockquote {
  padding: 2px 0 2px 18px !important;
  border-left: 3px solid #d9d9d9 !important;
}
`;

console.log(css);
