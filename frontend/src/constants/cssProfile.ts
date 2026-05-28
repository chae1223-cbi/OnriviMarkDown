import { CssProfile } from '../types/cssProfile';

/**
 * 모든 태그가 빈 CssRuleSet을 가진 템플릿 객체입니다.
 * createEmptyProfile()에서 깊은 복사(deep clone)하여 사용합니다.
 * @see createEmptyProfile
 */
const EMPTY_RULES = {
  h1: {}, h2: {}, h3: {}, h4: {}, h5: {}, h6: {},
  p: {}, strong: {}, em: {}, del: {},
  ul: {}, ol: {}, taskList: {}, hr: {},
  table: {}, th: {}, td: {}, blockquote: {}, codeBlock: {},
  a: {}, img: {},
};

/**
 * DEFAULT_PROFILE: 애플리케이션 기본값 프로필입니다.
 * - id가 'default'이므로 CssStyleForm에서 모든 입력 필드가 비활성화(disabled)됩니다.
 * - rules는 각 태그에 최소한의 CSS 속성만 지정하여
 *   Tailwind Typography(prose)의 기본 스타일 위에 자연스럽게 얹어집니다.
 * - 사용자가 이 프로필을 선택하면 동적 CSS 주입이 중단되고(dynamicCssString === ''),
 *   MarkdownViewer가 순수 prose 스타일만 사용하게 됩니다.
 *
 * @remarks 사용자 정의 프로필을 생성할 때도 이 객체를 얕은 복사한 뒤
 * rules만 깊은 복사하여 사용합니다. (page.tsx onAddProfile 참고)
 */
export const DEFAULT_PROFILE: CssProfile = {
  id: 'default',
  name: '일반 Onrivi 기본 스타일 (기본 웹진 규격)',
  pageStyle: {
    fontFamily: 'inherit',    // 부모 요소의 폰트를 그대로 계승
    fontSize: '15px',         // 웹진 기준 가독성 좋은 중간 크기
    lineHeight: '1.8',        // 넉넉한 행간으로 가독성 확보
    letterSpacing: '-0.02em', // 약간 좁힌 자간으로 모던한 느낌
  },
  rules: {
    // --- 제목(Heading) ---
    h1: { "text-align": "left", "font-weight": "bold", "margin-top": "1.5rem", "margin-bottom": "1rem" },
    h2: { "text-align": "left", "font-weight": "bold", "margin-top": "1.3rem", "margin-bottom": "0.8rem" },
    h3: { "text-align": "left", "font-weight": "bold", "margin-top": "1rem", "margin-bottom": "0.6rem" },
    h4: { "text-align": "left", "font-weight": "600", "margin-top": "0.8rem", "margin-bottom": "0.5rem" },
    h5: { "text-align": "left", "font-weight": "500", "margin-top": "0.6rem", "margin-bottom": "0.4rem" },
    h6: { "text-align": "left", "font-weight": "500", "margin-top": "0.5rem", "margin-bottom": "0.3rem" },
    // --- 본문 ---
    p: { "text-align": "left", "margin-bottom": "1rem", "text-indent": "0px" },
    // --- 인라인 서식 (빈 객체 = prose 기본값 사용) ---
    strong: {},
    em: {},
    del: {},
    // --- 목록 ---
    ul: {},
    ol: {},
    taskList: {},
    // --- 수평선 ---
    hr: {},
    // --- 표 ---
    table: { "width": "100%", "border-collapse": "collapse" },
    th: {},
    td: {},
    // --- 인용문, 코드, 링크, 이미지 ---
    blockquote: { "border-left-width": "4px", "border-left-style": "solid", "padding-left": "1rem", "margin-top": "1rem", "margin-bottom": "1rem" },
    codeBlock: {},
    a: {},
    img: {},
  },
};

/**
 * 새로운 빈 프로필을 생성합니다.
 * EMPTY_RULES를 JSON.parse(JSON.stringify(...))로 깊은 복사하여
 * 여러 프로필이同一个 객체를 참조하지 않도록 합니다.
 * @returns 모든 rules가 빈 객체인 CssProfile (id와 이름은 빈 문자열)
 */
export function createEmptyProfile(): CssProfile {
  return {
    id: '',
    name: '',
    pageStyle: { fontFamily: '', fontSize: '', lineHeight: '', letterSpacing: '' },
    rules: JSON.parse(JSON.stringify(EMPTY_RULES)),
  };
}
