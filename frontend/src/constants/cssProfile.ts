import { CssProfile } from '../types/cssProfile';

// ====================================================================
// 📊 [OMD-CORE-cssProfile-0006] cssProfile ➔ SYSTEM_PROFILE_IDS
// 🎯 @KICK  : 시스템 프로필 식별자 목록을 정의한다
// 🛡️ @GUARD : 이 ID를 가진 프로필은 수정/삭제 불가
// 🚨 @PATCH : 없음
// 🔗 @CALLS : isSystemProfileId
// ====================================================================
/**
 * 시스템 프로필 식별자 목록 — 이 ID를 가진 프로필은 수정/삭제 불가
 */
export const SYSTEM_PROFILE_IDS = ['system-gov', 'system-press', 'system-report'] as const;
export type SystemProfileId = typeof SYSTEM_PROFILE_IDS[number];

// ====================================================================
// 📊 [OMD-CORE-cssProfile-0005] cssProfile ➔ isSystemProfileId
// 🎯 @KICK  : 주어진 id가 시스템 프로필 ID인지 검사한다
// 🛡️ @GUARD : SYSTEM_PROFILE_IDS 배열에 포함된 값인지만 확인
// 🚨 @PATCH : 없음
// 🔗 @CALLS : SYSTEM_PROFILE_IDS
// ====================================================================
export function isSystemProfileId(id: string): boolean {
  return (SYSTEM_PROFILE_IDS as readonly string[]).includes(id);
}

// ====================================================================
// 📊 [OMD-CORE-cssProfile-0004] cssProfile ➔ EMPTY_RULES
// 🎯 @KICK  : 모든 태그가 빈 객체인 CssRuleSet 템플릿을 제공한다
// 🛡️ @GUARD : createEmptyProfile()에서 깊은 복사하여 사용되므로 직접 참조하지 않도록 주의
// 🚨 @PATCH : 없음
// 🔗 @CALLS : createEmptyProfile
// ====================================================================
/**
 * 모든 태그가 빈 CssRuleSet을 가진 템플릿 객체입니다.
 * createEmptyProfile()에서 깊은 복사(deep clone)하여 사용합니다.
 * @see createEmptyProfile
 */
const EMPTY_RULES = {
  h1: {}, h2: {}, h3: {}, h4: {}, h5: {}, h6: {},
  p: {}, strong: {}, em: {}, del: {},
  ul: {}, ol: {}, li: {}, taskList: {}, hr: {},
  table: {}, th: {}, td: {}, blockquote: {}, codeBlock: {}, codeBlockTitle: {},
  a: {}, img: {}, code: {}, video: {}, math: {},
  map: {}, footnote: {},
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
// ====================================================================
// 📊 [OMD-CORE-cssProfile-0003] cssProfile ➔ SYSTEM_PROFILES
// 🎯 @KICK  : 앱에 내장된 3개의 시스템 프로필 배열을 정의한다
// 🛡️ @GUARD : system-* 접두사 id를 가지며 수정/삭제 불가
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
/**
 * 시스템 기본 프로필 목록 (4개)
 * - 앱에 내장되어 배포되며 수정/삭제 불가
 * - id는 'system-*' 접두사 사용
 */
export const SYSTEM_PROFILES: CssProfile[] = [
  {
    id: 'system-gov',
    name: '공공기관_행정_표준_문서_프로필',
  pageStyle: {
    fontFamily: '"Noto Serif KR", serif',
    fontSize: '14px',
    lineHeight: '1.8',
    letterSpacing: '0px',
    backgroundColor: '#ffffff',
    paperSize: 'a4',
    marginTop: '25mm',
    marginBottom: '20mm',
    marginLeft: '25mm',
    marginRight: '25mm',
    orientation: 'portrait',
    headingSizeOffset: '3',
    tabSize: '4',
  },
  rules: {
    // --- 제목(Heading) ---
    h1: { "text-align": "center", "font-weight": "bold", "font-size": "26px", "margin-top": "32px", "margin-bottom": "20px", "letter-spacing": "0.05em" },
    h2: { "text-align": "left", "font-weight": "bold", "font-size": "20px", "margin-top": "28px", "margin-bottom": "14px", "border-bottom": "1px solid", "padding-bottom": "6px" },
    h3: { "text-align": "left", "font-weight": "bold", "font-size": "17px", "margin-top": "20px", "margin-bottom": "10px" },
    h4: { "text-align": "left", "font-weight": "bold", "font-size": "15px", "margin-top": "16px", "margin-bottom": "8px" },
    h5: { "text-align": "left", "font-weight": "600", "font-size": "14px", "margin-top": "12px", "margin-bottom": "6px" },
    h6: { "text-align": "left", "font-weight": "600", "font-size": "13px", "margin-top": "10px", "margin-bottom": "4px" },
    // --- 본문 ---
    p: { "text-align": "justify", "margin-top": "0px", "margin-bottom": "10px", "text-indent": "10px", "line-height": "1.8", "word-break": "keep-all" },
    // --- 인라인 서식 ---
    strong: { "font-weight": "bold" },
    em: { "font-style": "italic" },
    u: {},
    del: { "text-decoration-color": "#9ca3af" },
    // --- 목록 ---
    ul: { "padding-left": "24px", "list-style-type": "disc" },
    ol: { "padding-left": "24px", "list-style-type": "decimal" },
    li: { "margin-bottom": "4px", "padding-inline-start": "6px" },
    taskList: {},
    // --- 수평선 ---
    hr: { "border-top-color": "#d1d5db" },
    // --- 표 ---
    table: { "width": "100%", "border-collapse": "collapse", "border-style": "solid", "border-width": "1px", "border-color": "#9ca3af", "font-size": "13px" },
    th: { "background-color": "#f3f4f6", "padding": "8px", "border-style": "solid", "border-width": "1px", "border-color": "#9ca3af", "font-weight": "bold" },
    td: { "padding": "6px 8px", "border-style": "solid", "border-width": "1px", "border-color": "#9ca3af" },
    // --- 인용문, 코드, 링크, 이미지 ---
    blockquote: { "border-left-width": "4px", "border-left-style": "solid", "border-left-color": "#2563eb", "padding": "12px 16px", "margin-top": "16px", "margin-bottom": "16px", "background-color": "#f8fafc", "color": "#374151" },
    codeBlock: { "background-color": "#1e293b", "color": "#e2e8f0", "font-size": "13px", "padding": "16px", "border-radius": "6px" },
    codeBlockTitle: { "background-color": "#0f172a", "color": "#94a3b8" },
    a: { "color": "#2563eb", "text-decoration": "underline" },
    img: { "display": "block", "margin-left": "auto", "margin-right": "auto", "width": "500px", "margin-top": "20px", "margin-bottom": "20px" },
    code: { "background-color": "#f1f5f9", "color": "#dc2626", "font-size": "0.85em", "padding-top": "1px", "padding-bottom": "1px", "padding-left": "4px", "padding-right": "4px", "border-radius": "3px", "line-height": "1" },
    video: { "width": "560px", "height": "315px", "display": "block", "margin-left": "auto", "margin-right": "auto", "margin-top": "16px", "margin-bottom": "16px" },
    math: { "color": "#1e3a8a", "font-size": "16px", "text-align": "center", "margin-top": "16px", "margin-bottom": "16px" },
    map: { "width": "600px", "height": "450px", "display": "block", "margin-left": "auto", "margin-right": "auto", "margin-top": "16px", "margin-bottom": "16px" },
    footnote: { "color": "#6b7280", "font-size": "11px", "line-height": "1.4", "margin-top": "8px", "margin-bottom": "8px" },
  },
  hrStructure: {
    borderTopStyle: "solid",
    borderTopWidth: "1px",
    marginTopBottom: "28px",
    lineWidth: "100%"
  },
    checkboxStructure: {
    boxSize: "16px",
    checkedEffect: "line-through-and-dim",
    textGap: "10px"
  }
},
  // ──────────────────────────────────────────────
  // 시스템 프로필 ❷: 언론사_보도자료_표준
  // ──────────────────────────────────────────────
  {
    id: 'system-press',
    name: '언론사_보도자료_표준',
    pageStyle: {
      fontFamily: '"Noto Serif KR", serif',
      fontSize: '14px',
      lineHeight: '1.9',
      letterSpacing: '0px',
      backgroundColor: '#ffffff',
      paperSize: 'a4',
      marginTop: '20mm',
      marginBottom: '20mm',
      marginLeft: '20mm',
      marginRight: '20mm',
      orientation: 'portrait',
      headingSizeOffset: '4',
      tabSize: '4',
    },
    rules: {
      h1: { "text-align": "center", "font-weight": "bold", "font-size": "30px", "margin-top": "40px", "margin-bottom": "8px", "letter-spacing": "0.08em" },
      h2: { "text-align": "left", "font-weight": "bold", "font-size": "20px", "margin-top": "32px", "margin-bottom": "12px", "border-bottom": "2px solid #1e40af", "padding-bottom": "8px", "color": "#1e40af" },
      h3: { "text-align": "left", "font-weight": "bold", "font-size": "17px", "margin-top": "24px", "margin-bottom": "8px" },
      h4: { "text-align": "left", "font-weight": "600", "font-size": "15px", "margin-top": "16px", "margin-bottom": "6px" },
      h5: { "text-align": "left", "font-weight": "600", "font-size": "14px", "margin-top": "12px", "margin-bottom": "4px" },
      h6: { "text-align": "left", "font-weight": "600", "font-size": "13px", "margin-top": "10px", "margin-bottom": "4px" },
      p: { "text-align": "justify", "margin-top": "0px", "margin-bottom": "12px", "text-indent": "0px", "line-height": "1.9" },
      strong: { "color": "#1e40af" },
      em: { "font-style": "italic" },
      u: {},
      del: {},
      ul: { "padding-left": "24px", "list-style-type": "disc" },
      ol: { "padding-left": "24px", "list-style-type": "decimal" },
      li: { "margin-bottom": "4px", "padding-inline-start": "6px" },
      taskList: {},
      hr: { "border-top-color": "#1e40af", "border-top-width": "2px" },
      table: { "width": "100%", "border-collapse": "collapse", "border-style": "solid", "border-width": "1px", "border-color": "#cbd5e1", "font-size": "13px" },
      th: { "background-color": "#1e40af", "color": "#ffffff", "padding": "10px", "border-style": "solid", "border-width": "1px", "border-color": "#cbd5e1", "font-weight": "bold" },
      td: { "padding": "8px 10px", "border-style": "solid", "border-width": "1px", "border-color": "#cbd5e1" },
      blockquote: { "border-left-width": "4px", "border-left-style": "solid", "border-left-color": "#1e40af", "padding": "12px 16px", "margin-top": "16px", "margin-bottom": "16px", "background-color": "#eff6ff", "color": "#1e3a5f", "font-style": "italic" },
      codeBlock: { "background-color": "#0f172a", "color": "#e2e8f0", "font-size": "13px", "padding": "16px", "border-radius": "6px" },
      codeBlockTitle: { "background-color": "#020617", "color": "#64748b" },
      a: { "color": "#1e40af", "text-decoration": "underline", "font-weight": "bold" },
      img: { "display": "block", "margin-left": "auto", "margin-right": "auto", "width": "500px", "margin-top": "20px", "margin-bottom": "20px" },
      code: { "background-color": "#f1f5f9", "color": "#b91c1c", "font-size": "0.85em", "padding-top": "1px", "padding-bottom": "1px", "padding-left": "4px", "padding-right": "4px", "border-radius": "3px", "line-height": "1" },
      video: { "width": "560px", "height": "315px", "display": "block", "margin-left": "auto", "margin-right": "auto", "margin-top": "16px", "margin-bottom": "16px" },
      math: { "color": "#1e3a8a", "font-size": "16px", "text-align": "center", "margin-top": "16px", "margin-bottom": "16px" },
      map: { "width": "600px", "height": "450px", "display": "block", "margin-left": "auto", "margin-right": "auto", "margin-top": "16px", "margin-bottom": "16px" },
      footnote: { "color": "#64748b", "font-size": "11px", "line-height": "1.4", "margin-top": "8px", "margin-bottom": "8px" },
    },
    hrStructure: { borderTopStyle: "solid", borderTopWidth: "2px", marginTopBottom: "32px", lineWidth: "75%" },
    checkboxStructure: { boxSize: "16px", checkedEffect: "line-through-and-dim", textGap: "10px" }
  },
  // ──────────────────────────────────────────────
  // 시스템 프로필 ❸: 회의록_및_보고서_프로필
  // ──────────────────────────────────────────────
  {
    id: 'system-report',
    name: '회의록_및_보고서_프로필',
    pageStyle: {
      fontFamily: '"Noto Sans KR", sans-serif',
      fontSize: '13px',
      lineHeight: '1.6',
      letterSpacing: '0px',
      backgroundColor: '#ffffff',
      paperSize: 'a4',
      marginTop: '15mm',
      marginBottom: '15mm',
      marginLeft: '20mm',
      marginRight: '20mm',
      orientation: 'portrait',
      headingSizeOffset: '2',
      tabSize: '4',
    },
    rules: {
      h1: { "text-align": "left", "font-weight": "bold", "font-size": "22px", "margin-top": "24px", "margin-bottom": "16px", "border-bottom": "3px double #374151", "padding-bottom": "10px" },
      h2: { "text-align": "left", "font-weight": "bold", "font-size": "18px", "margin-top": "20px", "margin-bottom": "10px", "color": "#374151" },
      h3: { "text-align": "left", "font-weight": "bold", "font-size": "16px", "margin-top": "16px", "margin-bottom": "8px" },
      h4: { "text-align": "left", "font-weight": "600", "font-size": "14px", "margin-top": "12px", "margin-bottom": "6px" },
      h5: { "text-align": "left", "font-weight": "600", "font-size": "13px", "margin-top": "10px", "margin-bottom": "4px" },
      h6: { "text-align": "left", "font-weight": "600", "font-size": "12px", "margin-top": "8px", "margin-bottom": "4px" },
      p: { "text-align": "justify", "margin-top": "0px", "margin-bottom": "8px", "text-indent": "0px", "line-height": "1.6" },
      strong: { "color": "#111827" },
      em: { "font-style": "italic", "color": "#4b5563" },
      u: {},
      del: { "opacity": "0.5" },
      ul: { "padding-left": "20px", "list-style-type": "disc" },
      ol: { "padding-left": "20px", "list-style-type": "decimal" },
      li: { "margin-bottom": "3px", "padding-inline-start": "4px" },
      taskList: {},
      hr: { "border-top-color": "#d1d5db" },
      table: { "width": "100%", "border-collapse": "collapse", "border-style": "solid", "border-width": "1px", "border-color": "#d1d5db", "font-size": "12px" },
      th: { "background-color": "#374151", "color": "#ffffff", "padding": "6px 8px", "border-style": "solid", "border-width": "1px", "border-color": "#d1d5db", "font-weight": "bold" },
      td: { "padding": "5px 8px", "border-style": "solid", "border-width": "1px", "border-color": "#d1d5db" },
      blockquote: { "border-left-width": "3px", "border-left-style": "solid", "border-left-color": "#9ca3af", "padding": "8px 12px", "margin-top": "12px", "margin-bottom": "12px", "background-color": "#f9fafb", "color": "#4b5563" },
      codeBlock: { "background-color": "#1e293b", "color": "#e2e8f0", "font-size": "12px", "padding": "12px", "border-radius": "4px" },
      codeBlockTitle: { "background-color": "#0f172a", "color": "#94a3b8" },
      a: { "color": "#2563eb", "text-decoration": "underline" },
      img: { "display": "block", "margin-left": "auto", "margin-right": "auto", "width": "450px", "margin-top": "16px", "margin-bottom": "16px" },
      code: { "background-color": "#f1f5f9", "color": "#dc2626", "font-size": "0.85em", "padding-top": "1px", "padding-bottom": "1px", "padding-left": "3px", "padding-right": "3px", "border-radius": "3px", "line-height": "1" },
      video: { "width": "560px", "height": "315px", "display": "block", "margin-left": "auto", "margin-right": "auto", "margin-top": "16px", "margin-bottom": "16px" },
      math: { "color": "#1e3a8a", "font-size": "15px", "text-align": "center", "margin-top": "12px", "margin-bottom": "12px" },
      map: { "width": "600px", "height": "450px", "display": "block", "margin-left": "auto", "margin-right": "auto", "margin-top": "16px", "margin-bottom": "16px" },
      footnote: { "color": "#6b7280", "font-size": "10px", "line-height": "1.3", "margin-top": "6px", "margin-bottom": "6px" },
    },
    hrStructure: { borderTopStyle: "solid", borderTopWidth: "1px", marginTopBottom: "24px", lineWidth: "100%" },
    checkboxStructure: { boxSize: "14px", checkedEffect: "dim-only", textGap: "8px" }
  }
];

// ====================================================================
// 📊 [OMD-CORE-cssProfile-0002] cssProfile ➔ DEFAULT_PROFILE
// 🎯 @KICK  : 시스템 기본 프로필(system-gov)을 기본값으로 내보낸다
// 🛡️ @GUARD : SYSTEM_PROFILES[0]을 참조하며 시스템 프로필이므로 수정/삭제 불가
// 🚨 @PATCH : 없음
// 🔗 @CALLS : SYSTEM_PROFILES
// ====================================================================
/**
 * DEFAULT_PROFILE: 사용자 정의 프로필 생성/가져오기 시 템플릿으로 사용합니다.
 * (시스템 프로필이 아니므로 가져온 스타일로 덮어쓸 수 있습니다)
 */
export const DEFAULT_PROFILE: CssProfile = SYSTEM_PROFILES[0]; // system-gov

// ====================================================================
// 📊 [OMD-CORE-cssProfile-0001] cssProfile ➔ createEmptyProfile
// 🎯 @KICK  : 새로운 빈 CssProfile 객체를 생성하여 반환한다
// 🛡️ @GUARD : EMPTY_RULES를 깊은 복사하여 여러 프로필이 동일 객체를 참조하지 않도록 방지한다
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
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
    pageStyle: { fontFamily: '', fontSize: '', lineHeight: '', letterSpacing: '', backgroundColor: '#ffffff', paperSize: 'a4', marginTop: '', marginBottom: '', marginLeft: '', marginRight: '', orientation: 'portrait', headingSizeOffset: '', tabSize: '4' },
    rules: JSON.parse(JSON.stringify(EMPTY_RULES)),
    hrStructure: {
      borderTopStyle: 'solid',
      borderTopWidth: '1px',
      marginTopBottom: '32px',
      lineWidth: '100%'
    },
    checkboxStructure: {
      boxSize: '16px',
      checkedEffect: 'line-through-and-dim',
      textGap: '10px'
    }
  };
}
