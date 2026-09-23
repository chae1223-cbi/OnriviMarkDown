/**
 * styleShowcaseModules.ts
 * 서식 관리(CssStyleModal) 전용 5대 서식 모듈 뭉침 쇼케이스 정의
 * 
 * 🚨 @PATCH : **2026-09-24** — [서식 관리 우측 서식별 모듈 뭉침 뷰 신설]: 좌측 서식 제어판과 1:1 대응되는 5대 핵심 서식 쇼케이스 카드 마크다운 정의
 */

export interface ShowcaseModule {
  id: 'typography' | 'headings' | 'lists' | 'boxes' | 'media';
  title: string;
  badge: string;
  description: string;
  markdown: string;
  associatedTags: string[];
}

export const SHOWCASE_MODULES: ShowcaseModule[] = [
  {
    id: 'typography',
    title: '본문 및 타이포그래피',
    badge: 'Card 1',
    description: '기본 문단(p), 폰트 패밀리, 자간, 행간, 굵게, 기울임, 인라인 코드, 하이퍼링크',
    associatedTags: ['p', 'strong', 'em', 'u', 'del', 'code', 'a'],
    markdown: `문서의 가독성은 **정갈한 본문 타이포그래피**에서 시작됩니다. 단락 간격과 줄간격(Line Height), 그리고 자간(Letter Spacing)이 최적화되어 장시간 독서 시에도 눈의 피로를 최소화합니다.

인라인 서식 지원: **강조(Bold)**, *기울임(Italic)*, <u>밑줄(Underline)</u>, ~~취소선(Strikethrough)~~, \`인라인 코드(Code)\`, [온리비 공식 웹사이트 링크](https://onrivi.com)를 자유롭게 조합할 수 있습니다.`,
  },
  {
    id: 'headings',
    title: '제목 위계 스타일 (H1 ~ H6)',
    badge: 'Card 2',
    description: '대분류부터 소분류까지 6단계 제목의 크기 배율(Scale), 상하 마진, 하단 구분선 조화',
    associatedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    markdown: `# 👑 H1 1단계 대제목 (Master Headline)
## 🎯 H2 2단계 중제목 (Section Header)
### ⚡ H3 3단계 소제목 (Sub Section)
#### 📌 H4 4단계 세부제목 (Item Heading)
##### 🔹 H5 5단계 소항목제목 (Minor Heading)
###### ▪️ H6 6단계 최소단위제목 (Micro Heading)`,
  },
  {
    id: 'lists',
    title: '목록 및 태스크 체크박스',
    badge: 'Card 3',
    description: '순서 있는 숫자 목록, 글머리 불릿(다계층 들여쓰기), 완료/미완료 태스크 체크박스',
    associatedTags: ['ul', 'ol', 'li', 'input'],
    markdown: `1. 첫 번째 순차 실행 프로세스
2. 두 번째 데이터 검증 및 분석 단계
3. 세 번째 최종 리포트 및 자동 저장

- 💡 온리비 어서 핵심 기능 목록
  - 로컬 우선(Local-First) 무결점 오프라인 보안
    - 0.1초 즉시 실행 및 초경량 아키텍처
    - 내 컴퓨터 로컬 폴더 직접 연동
  - 마이크로소프트 VS Code 기반 Monaco Editor 탑재
- 🚀 할 일 및 태스크 체크리스트
  - [x] 한글 입력 결함(Input Glitch) 제로 보장
  - [x] 수직 중앙 정렬 테이블 렌더러 탑재
  - [ ] 원클릭 맞춤형 PDF 및 전자책(EPUB) 출판`,
  },
  {
    id: 'boxes',
    title: '표(Table) · 인용구 · 소스코드',
    badge: 'Card 4',
    description: '수직 중앙 정렬 표, 감성 인용구 박스, 다크/라이트 신택스 하이라이팅 코드 블록',
    associatedTags: ['table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'pre'],
    markdown: `| 서식 항목 | 현재 규격 스펙 | 가독성 편익 지표 |
| :--- | :---: | :--- |
| **줄간격 (Line Height)** | \`1.75\` 배율 락인 | 행간이 답답하지 않고 시원하게 읽힘 |
| **기본 글꼴 (Font)** | 고급 \`KoPubBatang\` | 양장본 출판물을 읽는 듯한 아날로그 감성 |
| **여백 (Margin)** | 사방 \`25mm\` 안전 통제 | 기하학적 균형 배치로 시각적 안정감 제공 |

> 💬 **감성 인용구 박스 (Blockquote)**
> "좋은 서식은 글의 가치를 배가시키며, 독자가 내용에 온전히 몰입할 수 있는 가장 우아한 통로를 열어줍니다."

\`\`\`typescript
// 고해상도 소스코드 블록 (CodeBlock with Syntax Highlighting)
function calculateEditorialLayout(pageWidth: number, baseFontSize: number): number {
  const goldenRatio = 1.618;
  return Math.round(pageWidth / (baseFontSize * goldenRatio));
}
\`\`\``,
  },
  {
    id: 'media',
    title: '미디어(이미지) & 수평 구분선(HR)',
    badge: 'Card 5',
    description: '모서리 둥글기(Border Radius), 그림자 효과, 중앙 정렬 이미지와 디자인 수평선',
    associatedTags: ['img', 'hr'],
    markdown: `![Onrivi Editorial Workspace](https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80)
*▲ 감성적인 미디어 객체 캡션 및 라운딩 테두리 스타일*

---

기본 1px 실선 구분선부터 대시선, 굵은 테마선까지 문서의 흐름을 정갈하게 분절합니다.`,
  }
];
