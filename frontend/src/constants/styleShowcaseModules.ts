/**
 * styleShowcaseModules.ts
 * 서식 관리(CssStyleModal) 전용 6대 서식 모듈 뭉침 쇼케이스 정의
 * 🚨 @PATCH : **2026-09-24** — [문장 사이 간격(sentence-gap) 실시간 동기화 지원]: Card 6에 문단 내 줄바꿈 마크다운 샘플을 탑재하여 문장 사이 간격 슬라이더 조작 시 1:1 실시간 시각적 확장 검증 지원
 * 🚨 @PATCH : **2026-09-24** — [수식(MATH) remark-math 멀티라인 블록 구문 정규화]: $$ 앞뒤 개행 및 독립 블록 구문을 적용하여 rehype-katex의 .katex-display 블록 요소 변환 및 서식 동기화 정상 작동 보장
 * 🚨 @PATCH : **2026-09-24** — [수식(MATH) 쇼케이스 탑재 및 고급 레이아웃·본문 문단 Card 6 신설]: Card 5에 KaTeX display math 샘플 및 math 태그 연동을 추가하고, 좌측 패널의 '⚙️ 고급 레이아웃 및 본문 문단'과 1:1 대응되는 Card 6(본문 양끝 정렬, 첫 줄 들여쓰기, 문단 상하여백, 문장 사이 간격 <br>)을 신설하여 실시간 검증 환경 완성
 * 🚨 @PATCH : **2026-09-24** — [미디어 쇼케이스 인라인 스타일 해제]: Card 5 동영상(<video>) 및 지도(<iframe>)에 하드코딩되어 있던 인라인 style(width/height/border-radius)을 제거하여 좌측 패널의 서식 프로필 CSS(너비, 높이, 상하 여백, 정렬)가 100% 온전하게 실시간 반영되도록 개선
 * 🚨 @PATCH : **2026-09-24** — [미디어 쇼케이스 Card 5에 동영상(VIDEO) 및 지도(MAP) 실시간 미리보기 샘플 탑재]: 우측 쇼케이스에서 이미지 외에 비디오 및 지도 객체의 규격·여백·정렬을 실시간 확인하고 조작할 수 있도록 샘플 마크다운 및 태그 연동 확장
 * 🚨 @PATCH : **2026-09-24** — [서식 관리 우측 서식별 모듈 뭉침 뷰 신설]: 좌측 서식 제어판과 1:1 대응되는 5대 핵심 서식 쇼케이스 카드 마크다운 정의
 */

export interface ShowcaseModule {
  id: 'typography' | 'headings' | 'lists' | 'boxes' | 'media' | 'advanced';
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
    title: '미디어 (이미지 · 동영상 · 지도) & 수식(MATH) · 구분선',
    badge: 'Card 5',
    description: '이미지, 비디오, 지도, 수식 객체의 규격·여백·정렬과 감성 수평 구분선',
    associatedTags: ['img', 'video', 'map', 'iframe', 'math', 'hr'],
    markdown: `![Onrivi Editorial Workspace](https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80)
*▲ 이미지 객체 규격 (너비, 높이, 라운딩, 상하 여백, 좌/중/우 정렬)*

---

<video src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" controls></video>
*▲ 동영상(VIDEO) 미디어 객체 규격 (너비, 높이, 상하 여백, 좌/중/우 정렬)*

---

<iframe src="https://maps.google.com/maps?q=37.5665,126.9780&z=15&output=embed" allowfullscreen loading="lazy"></iframe>
*▲ 인터랙티브 지도(MAP) 객체 규격 (너비, 높이, 상하 여백, 좌/중/우 정렬)*

---

$$
f(x) = \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi
$$

*▲ KaTeX 수식(MATH) 객체 규격 (글자 크기, 글자 색상, 상하 여백, 좌/중/우 정렬)*

---

기본 1px 실선 구분선부터 대시선, 굵은 테마선까지 문서의 흐름을 정갈하게 분절합니다.`,
  },
  {
    id: 'advanced',
    title: '고급 레이아웃 및 본문 문단',
    badge: 'Card 6',
    description: '본문 문단(P) 양끝 정렬, 첫 줄 들여쓰기, 문단 상하 여백, 문장 사이 간격(<br>), 자간',
    associatedTags: ['p', 'br'],
    markdown: `지식의 기록과 전달은 정교한 조판 시스템을 통해 완성됩니다. 독자가 글에 깊이 몰입할 수 있도록 본문의 양끝 정렬(Justify)과 첫 줄 들여쓰기(Indent), 그리고 문단 간의 호흡을 제어하는 상하 여백을 자유롭게 조절할 수 있습니다.<br class="onrivi-sentence-br" />문장과 문장 사이에 강제 줄바꿈(Shift+Enter 또는 br)이 삽입된 경우에도, '문장 사이 간격(sentence-gap)' 설정을 통해 단락의 리듬감을 잃지 않고 유려하게 이어지도록 미세 간격을 실시간으로 조율합니다.

두 번째 문단에서는 첫 줄 들여쓰기(Text Indent)와 문단 위/아래 여백(Margin)의 상호작용을 확인할 수 있습니다. 인쇄 출판물의 문헌적 품격을 온리비 어서의 디지털 에디토리얼 환경에서 그대로 재현합니다.<br class="onrivi-sentence-br" />다양한 행간(Line Height)과 자간(Letter Spacing)을 조합하여, 당신의 글에 가장 적합한 활자 호흡을 완성해 보세요.`,
  }
];
