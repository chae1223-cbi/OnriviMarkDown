/** CSS 속성-값 쌍을 담는 규칙 집합 (예: { "text-align": "center", "font-weight": "bold" }) */
export interface CssRuleSet {
  [cssProperty: string]: string;
}

/** 서식 정의 프로필 - 전역 타이포그래피 + 태그별 CSS 룰셋 */
export interface CssProfile {
  /** 고유 식별자 (예: 'default', 'profile-1234567890') */
  id: string;
  /** 프로필 표시 이름 (사용자 지정 가능) */
  name: string;
  /** A4 용지 전역 타이포그래피 및 페이지 설정 */
  pageStyle: {
    /** 인쇄 대표 서체 (예: "휴먼명조", serif) */
    fontFamily: string;
    /** 기본 글자 크기 (예: '15px') */
    fontSize: string;
    /** 기본 줄 간격 (예: '1.8') */
    lineHeight: string;
    /** 기본 자간 조절 (예: '-0.02em') */
    letterSpacing: string;
    /** 위쪽 여백 (예: '20mm') */
    marginTop: string;
    /** 아래쪽 여백 (예: '20mm') */
    marginBottom: string;
    /** 왼쪽 여백 (예: '20mm') */
    marginLeft: string;
    /** 오른쪽 여백 (예: '20mm') */
    marginRight: string;
    /** 용지 방향: 'portrait' | 'landscape' */
    orientation: string;
    /** H1→H6 단계별 크기 감소폭 (px) */
    headingSizeOffset: string;
  };
  /** 각 마크다운 요소별 CSS 룰셋 (빈 객체면 해당 요소는 기본 스타일 사용) */
  rules: {
    h1: CssRuleSet;       // H1 보도자료 대제목
    h2: CssRuleSet;       // H2 대분류 / 정책 과제 서두
    h3: CssRuleSet;       // H3 중분류 항목
    h4: CssRuleSet;       // H4 소분류 항목
    h5: CssRuleSet;       // H5 각주형 제목
    h6: CssRuleSet;       // H6 최소 제목
    p: CssRuleSet;        // P 기본 본문 문단
    strong: CssRuleSet;   // STRONG 굵게
    em: CssRuleSet;       // EM 기울임
    u: CssRuleSet;        // U 밑줄
    del: CssRuleSet;      // DEL 취소선
    ul: CssRuleSet;       // UL 순서 없는 목록
    ol: CssRuleSet;       // OL 순서 있는 목록
    li: CssRuleSet;       // LI 목록 아이템 (margin-bottom, padding-inline-start 등)
    taskList: CssRuleSet; // TASKLIST 체크리스트
    hr: CssRuleSet;       // HR 수평선
    table: CssRuleSet;    // TABLE 표
    th: CssRuleSet;       // TH 표 헤더 셀
    td: CssRuleSet;       // TD 표 데이터 셀
    blockquote: CssRuleSet; // BLOCKQUOTE 인용 상자
    codeBlock: CssRuleSet;  // CODE BLOCK 코드 블록
    a: CssRuleSet;        // A 링크
    img: CssRuleSet;      // IMG 이미지
  };
  hrStructure?: {
    borderTopStyle: string;
    borderTopWidth: string;
    marginTopBottom: string;
    lineWidth: string;
  };
  checkboxStructure?: {
    boxSize: string;
    checkedEffect: string;
    textGap: string;
  };
}
