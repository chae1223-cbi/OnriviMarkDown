// ====================================================================
// 📊 [OMD-DATA-blogData-0001] blogData ➔ 온리비 기술/가이드 블로그 데이터 모델 및 스토리지 매니저
// 🎯 @KICK  : 한컴 블로그(https://blog.hancom.com/) 스타일의 카드형 기술 블로그 게시글 데이터 모델, 기본 아티클 및 로컬스토리지 동기화 엔진
// 🛡️ @GUARD : SSR Hydration 불일치 방어(브라우저 확인 후 로컬스토리지 병합) 및 슬러그 중복 방어
// 🚨 @PATCH : **2026-09-26** — [사용자 지정 디폴트 썸네일 교체]: 사용자가 제공한 데스크 환경 사진으로 블로그 디폴트 커버(/blog/default-blog-cover.jpg?v=2) 업데이트
// 🚨 @PATCH : **2026-09-26** — [블로그 첫 번째 이미지 썸네일 자동 추출 및 디폴트 커버 적용]: 본문 내 첫 번째 이미지(Markdown/HTML) 썸네일 우선 지정, 미존재 시 고품질 디폴트 커버(/blog/default-blog-cover.jpg) 자동 폴백 함수 getPostThumbnail 신설
// 🚨 @PATCH : **2026-09-26** — [블로그 카테고리 개편]: 사용자 요청에 따라 '제품 소식' 카테고리 삭제 및 '사용자 팁' ➔ '사용자 활용'으로 명칭 변경
// 🚨 @PATCH : **2026-09-26** — [블로그 초안 및 관리자 선택 발행 파이프라인 신설]: BlogPost에 status('published' | 'draft') 필드 추가, getBlogDrafts, publishPosts, unpublishPosts 관리 함수 구축
// 🚨 @PATCH : **2026-09-26** — [카드형 기술 블로그 시스템 신설]: 한컴 블로그 스타일 레이아웃, 초기 고품질 가이드 포스트 및 에디터 연동 로컬스토리지 동기화 엔진 구축
// 🔗 @CALLS : blogSnapshot
// ====================================================================

import blogSnapshot from '@/generated/blogSnapshot.json';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: "마크다운 가이드" | "기술 인사이트" | "사용자 활용";
  author: string;
  publishedAt: string; // YYYY.MM.DD
  readingTime: string; // 예: "3분"
  coverImage?: string;
  gradientBg?: string;
  tags: string[];
  isFeatured?: boolean;
  status?: "published" | "draft"; // 게시 상태
  deploymentStatus?: "draft" | "pending" | "live" | "failed";
}

export const BLOG_CATEGORIES = [
  "전체",
  "마크다운 가이드",
  "기술 인사이트",
  "사용자 활용",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: "post-markdown-table-fix",
    slug: "markdown-table-formatting-recovery-guide",
    title: "외부 노트 앱에서 내보낸 마크다운 표·서식 깨짐 해결법 (완벽 가이드)",
    excerpt:
      "클라우드 노트나 웹 에디터에서 마크다운을 내보냈을 때 표가 뭉개지거나 서식이 깨지는 현상의 기술적 원인과, 이를 단 1초 만에 깔끔한 출판 규격으로 복원하는 실무 가이드.",
    category: "마크다운 가이드",
    author: "Onrivi Author",
    publishedAt: "2026.09.26",
    readingTime: "4분",
    gradientBg: "from-blue-600 via-indigo-600 to-slate-900",
    isFeatured: true,
    tags: ["마크다운", "표복원", "서식깨짐", "출판조판", "업무팁"],
    content: `## 1. 외부 노트에서 내보낸 마크다운, 왜 깨질까요?

많은 사용자들이 노트를 작성할 때 다양한 클라우드 노트나 웹 기반 위지윅(WYSIWYG) 에디터를 사용합니다. 하지만 이를 마크다운(.md) 파일로 내보내어(Export) 보고서나 타 플랫폼으로 옮길 때 다음과 같은 치명적인 서식 깨짐을 자주 마주하게 됩니다.

1. **표(Table) 정렬 파괴**: 열 구분을 위한 파이프(\`|\`)와 하이픈(\`---\`)이 임의로 줄바꿈되어 표가 일반 텍스트 문단처럼 뭉개짐.
2. **코드 블록 및 인라인 서식 분실**: 역따옴표(\`\`\`)가 닫히지 않거나 줄바꿈 처리 불일치로 전체 문서의 레이아웃이 붕괴.
3. **불필요한 HTML 태그 혼입**: \`<br>\`, \`<div>\`, \`<span>\` 등의 인라인 스타일 태그가 뒤섞여 원시 마크다운 소스가 오염됨.

---

## 2. 서식 복원의 핵심 기술 원리

온리비 어서(Onrivi Author)는 이러한 내보내기 마크다운의 구조적 결함을 복원하기 위해 **3단계 정규화 파이프라인**을 제공합니다.

\`\`\`markdown
[외부 내보내기 마크다운] 
       ↓ 1단계: 불필요한 인라인 HTML 태그 안전 정제 (Sanitization)
       ↓ 2단계: AST 구문 분석 기반 불완전 파이프(|) 표 자동 재배열
       ↓ 3단계: 황금 비율 활자 조판 템플릿 실시간 렌더링
[100% 무결점 A4 규격 출판 문서 완성]
\`\`\`

### 표 자동 정렬 예시
깨진 데이터 형태:
\`\`\`text
| 과업명 | 담당자 | 일정 |
| 기획서 작성 채병익 2026-09
\`\`\`

온리비 복원 후:
| 과업명 | 담당자 | 일정 | 진행상태 |
| :--- | :--- | :--- | :---: |
| 기능 명세서 기획 | 제품기획팀 | 2026-09-26 | 완료 |
| 마크다운 복원 테스트 | 엔지니어링팀 | 2026-09-27 | 진행중 |
| A4 PDF 인쇄 사출 | 디자인팀 | 2026-09-28 | 대기 |

---

## 3. 실무자를 위한 3초 해결 팁

1. 내보낸 \`.md\` 파일을 온리비 어서(Onrivi Author)로 열어보세요.
2. **단축키(Ctrl+Alt+S)** 또는 우측 상단의 **서식 자동 정돈**을 클릭합니다.
3. 헝클어진 표와 인라인 수식이 완벽한 출판 규격으로 1초 만에 복원되며, 곧바로 고품질 PDF나 인쇄용 규격으로 출력할 수 있습니다.
`,
  },
  {
    id: "post-korean-ime-bug-fix",
    slug: "korean-ime-composition-editor-bug-fix",
    title: "웹 에디터에서 한글 끝글자 씹힘(IME 조합) 현상 원인과 완벽 해결기",
    excerpt:
      "브라우저 기반 에디터 개발 시 가장 큰 골칫거리인 한글 IME 조합 중복 입력(isComposing)과 글자 누락 버그를 온리비가 어떻게 원천 방어했는지 공유합니다.",
    category: "기술 인사이트",
    author: "Onrivi Author",
    publishedAt: "2026.09.25",
    readingTime: "5분",
    gradientBg: "from-teal-600 via-emerald-700 to-slate-900",
    tags: ["한글IME", "MonacoEditor", "React", "웹에디터", "프론트엔드"],
    content: `## 1. 한글 입력기(IME)와 브라우저 이벤트의 엇박자

한국어, 일본어, 중국어 등 CJK 문자는 여러 자모가 합쳐져 하나의 음절을 완성하는 **조합(Composition) 단계**를 거칩니다.

웹 브라우저의 \`keydown\`, \`input\`, \`compositionstart\`, \`compositionend\` 이벤트 사이클에서 브라우저별(Chrome, Safari, Edge)로 이벤트 발생 순서가 미묘하게 달라, 다음과 같은 전형적인 문제가 발생합니다:

- 엔터키 입력 시 마지막 조합 글자가 2번 중복 타이핑됨 (예: \`마크다운ㄴ\`)
- 모달창이나 포커스 이동 시 조합 중이던 글자가 증발해 사라짐
- 원문자(\`⑨⑧⑦\`)나 특수 기호 입력 시 커서 위치가 엉뚱한 곳으로 튀는 현상

---

## 2. 해결 방안: isComposing 가드와 가상 커서 동기화

온리비 어서는 Monaco Editor와 자체 래퍼 레이어에서 다음과 같은 **IME 조합 안전 가드**를 적용하여 한글 타이핑의 피로도를 0으로 만들었습니다.

\`\`\`typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  // 1. 브라우저 IME 조합 중(e.nativeEvent.isComposing)일 때는 전역 단축키 차단
  if (e.nativeEvent.isComposing || e.keyCode === 229) {
    return;
  }
  
  // 2. 조합이 안전하게 종료된 후에만 에디터 명령 실행
  executeEditorCommand(e);
};
\`\`\`

온리비 어서에서는 긴 글을 집중해서 쓸 때 단 한 글자의 오타나 글자 씹힘도 없이 부드러운 타이핑 경험을 제공합니다.
`,
  },
  {
    id: "post-onrivi-v2-local-first",
    slug: "onrivi-author-v2-local-first-release",
    title: "온리비 어서(Onrivi Author) V2 출시: 로컬 우선 아키텍처와 고품질 PDF 조판",
    excerpt:
      "서버로 내 글을 전송하지 않는 100% 로컬 파일 직결 보안과, 디자이너 없이도 아름다운 출판 문서를 뽑아내는 자동 조판 엔진을 소개합니다.",
    category: "기술 인사이트",
    author: "Onrivi Author",
    publishedAt: "2026.09.24",
    readingTime: "3분",
    gradientBg: "from-blue-700 via-cyan-700 to-slate-900",
    tags: ["온리비어서", "신규출시", "로컬우선", "LocalFirst", "PDF조판"],
    content: `## 1. 왜 '로컬 우선(Local-First)'인가?
 
소중한 업무 기획서, 회사 내부 기술 문서, 개인적인 일기를 제3자의 클라우드 서버에 저장하는 것은 언제나 보안과 데이터 소유권에 대한 불안을 남깁니다.

온리비 어서(Onrivi Author)는 **Local-First 원칙**을 기반으로 설계되었습니다:
- 문서는 오직 사용자의 PC 로컬 디스크에만 저장됩니다.
- 오프라인 상태에서도 100% 완벽하게 동작합니다.
- Git, VS Code 등 기존 개발 환경과 로컬 파일 단위로 1:1 완벽 호환됩니다.

---

## 2. 인쇄와 출판에 최적화된 자동 스타일링

마크다운으로 글을 쓰고 출력할 때 항상 여백과 글꼴 때문에 스트레스를 받으셨나요?
온리비 어서는 **A4 규격에 정밀하게 맞춘 활자 타이포그래피 엔진**을 탑재하여, 버튼 한 번으로 곧바로 결재를 올리거나 학회에 제출할 수 있는 PDF/인쇄 문서를 완성합니다.
`,
  },
  {
    id: "post-latex-math-mermaid-guide",
    slug: "latex-math-mermaid-diagram-guide",
    title: "수식(LaTeX)과 다이어그램(Mermaid)을 마크다운 하나로 문서화하는 법",
    excerpt:
      "복잡한 수학 기호, 물리학 공식, 아키텍처 흐름도를 별도 그래픽 도구 없이 텍스트만으로 깔끔하게 정리하는 완벽한 실무 작성 팁.",
    category: "사용자 활용",
    author: "Onrivi Author",
    publishedAt: "2026.09.22",
    readingTime: "4분",
    gradientBg: "from-purple-700 via-indigo-800 to-slate-900",
    tags: ["수식", "KaTeX", "LaTeX", "다이어그램", "Mermaid", "기술문서"],
    content: `## 1. 텍스트로 그리는 다이어그램: Mermaid

별도의 이미지 캡처 도구 없이, 마크다운 코드 블록 안에 간단한 텍스트를 적는 것만으로 깔끔한 흐름도(Flowchart)와 시퀀스 다이어그램이 완성됩니다.

\`\`\`mermaid
graph TD
    A[아이디어 메모] --> B(온리비 마크다운 작성)
    B --> C{AI 문장 다듬기}
    C -->|승인| D[A4 PDF 출판]
    C -->|재교정| B
\`\`\`

---

## 2. 학술 논문급 수식 표현: KaTeX

온리비 어서는 KaTeX 엔진을 기본 내장하여 가벼운 인라인 수식부터 복잡한 행렬까지 밀리초 단위로 즉각 렌더링합니다:

- 인라인 수식: $E = mc^2$
- 분수 및 적분: $\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$

이제 수식 작성을 위해 무거운 워드 수식 편집기를 켤 필요가 없습니다.
`,
  },
];

const LOCAL_STORAGE_POSTS_KEY = "onrivi_blog_posts";

/**
 * 공개 발행된 모든 블로그 포스트를 조회합니다. (초안 draft 제외)
 */
export function getAllBlogPosts(): BlogPost[] {
  return (blogSnapshot as BlogPost[]).filter(post => post.status !== 'draft');
}

/**
 * 게시 대기 중인 모든 블로그 초안(Draft) 목록을 조회합니다. (관리자 전용)
 */
export function getAllBlogDrafts(): BlogPost[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
    if (!raw) return [];
    const userPosts: BlogPost[] = JSON.parse(raw);
    return userPosts
      .filter((p) => p.status === "draft")
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  } catch (err) {
    console.error("블로그 초안 로컬스토리지 로드 실패:", err);
    return [];
  }
}

/**
 * 슬러그(slug)로 단일 블로그 포스트를 조회합니다. (공개 글 우선, 없으면 초안도 조회)
 */
export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return getAllBlogPosts().find(post => post.slug === slug);
}

/**
 * 에디터에서 작성한 글을 블로그 초안 또는 발행본으로 저장합니다.
 * (기본값: status = 'draft')
 */
export function saveBlogPost(
  post: Omit<BlogPost, "id" | "publishedAt" | "readingTime"> & { id?: string; status?: "published" | "draft" }
): BlogPost {
  if (typeof window === "undefined") {
    throw new Error("브라우저 환경에서만 블로그 포스트 저장이 가능합니다.");
  }

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const publishedAt = `${yyyy}.${mm}.${dd}`;

  // 읽는 시간 계산 (한글 기준 약 분당 400자)
  const charCount = post.content.length;
  const minutes = Math.max(1, Math.ceil(charCount / 400));
  const readingTime = `${minutes}분`;

  const newPost: BlogPost = {
    ...post,
    id: post.id || `post-${Date.now()}`,
    status: post.status || "draft", // 기본적으로 초안(draft)으로 저장
    publishedAt,
    readingTime,
  };

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
    let userPosts: BlogPost[] = raw ? JSON.parse(raw) : [];

    const existingIndex = userPosts.findIndex((p) => p.id === newPost.id || p.slug === newPost.slug);
    if (existingIndex >= 0) {
      userPosts[existingIndex] = newPost;
    } else {
      userPosts.unshift(newPost);
    }

    localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(userPosts));
    window.dispatchEvent(new CustomEvent("onrivi:blog-posts-updated", { detail: newPost }));
    return newPost;
  } catch (err) {
    console.error("블로그 포스트 저장 실패:", err);
    throw err;
  }
}

/**
 * 선택한 초안(Draft) 글들을 공식 블로그에 일괄 발행합니다.
 */
export function publishPosts(ids: string[]): boolean {
  if (typeof window === "undefined" || ids.length === 0) return false;

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}.${mm}.${dd}`;

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
    let userPosts: BlogPost[] = raw ? JSON.parse(raw) : [];
    const idSet = new Set(ids);

    userPosts = userPosts.map((p) => {
      if (idSet.has(p.id)) {
        return {
          ...p,
          status: "published",
          publishedAt: todayStr,
        };
      }
      return p;
    });

    localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(userPosts));
    window.dispatchEvent(new CustomEvent("onrivi:blog-posts-updated"));
    return true;
  } catch (err) {
    console.error("선택 포스트 발행 실패:", err);
    return false;
  }
}

/**
 * 선택한 공개 발행 글들을 비공개(초안 draft)로 전환합니다.
 */
export function unpublishPosts(ids: string[]): boolean {
  if (typeof window === "undefined" || ids.length === 0) return false;

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
    let userPosts: BlogPost[] = raw ? JSON.parse(raw) : [];
    const idSet = new Set(ids);

    // 기본 등록 글이 비공개로 전환되는 경우 userPosts에 복사하여 상태 저장
    const defaultTargets = INITIAL_BLOG_POSTS.filter((p) => idSet.has(p.id));
    for (const def of defaultTargets) {
      if (!userPosts.some((p) => p.id === def.id)) {
        userPosts.push({ ...def, status: "draft" });
      }
    }

    userPosts = userPosts.map((p) => {
      if (idSet.has(p.id)) {
        return { ...p, status: "draft" };
      }
      return p;
    });

    localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(userPosts));
    window.dispatchEvent(new CustomEvent("onrivi:blog-posts-updated"));
    return true;
  } catch (err) {
    console.error("선택 포스트 비공개 전환 실패:", err);
    return false;
  }
}

/**
 * 블로그 포스트를 삭제합니다.
 */
export function deleteBlogPost(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
    if (!raw) return false;
    let userPosts: BlogPost[] = JSON.parse(raw);
    userPosts = userPosts.filter((p) => p.id !== id);
    localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(userPosts));
    window.dispatchEvent(new CustomEvent("onrivi:blog-posts-updated"));
    return true;
  } catch (err) {
    console.error("블로그 포스트 삭제 실패:", err);
    return false;
  }
}

export const DEFAULT_BLOG_COVER = "/blog/default-blog-cover.jpg?v=2";

/**
 * 글의 썸네일 이미지를 반환합니다.
 * 1. post.coverImage 가 유효하게 지정되어 있으면 해당 이미지 사용
 * 2. 없으면 post.content(마크다운 본문) 내 첫 번째 이미지(Markdown/HTML 태그) 자동 추출
 * 3. 본문에도 이미지가 없으면 디폴트 블로그 커버(/blog/default-blog-cover.jpg) 반환
 */
export function getPostThumbnail(post: BlogPost): string {
  if (post.coverImage && post.coverImage.trim()) {
    return post.coverImage.trim();
  }

  // 1. 마크다운 이미지 정규식: ![alt](url)
  const mdImgMatch = post.content.match(/!\[.*?\]\((https?:\/\/[^\s\)]+|\/[^\s\)]+)\)/);
  if (mdImgMatch && mdImgMatch[1]) {
    return mdImgMatch[1].trim();
  }

  // 2. HTML <img> 태그 정규식: <img ... src="url" ...>
  const htmlImgMatch = post.content.match(/<img[^>]+src=["'](https?:\/\/[^"']+|\/[^"']+)["']/i);
  if (htmlImgMatch && htmlImgMatch[1]) {
    return htmlImgMatch[1].trim();
  }

  return DEFAULT_BLOG_COVER;
}

/**
 * 에디터의 마크다운 텍스트와 파일명으로부터 포스트 메타데이터를 자동 추출합니다.
 */
export function extractPostFromMarkdown(markdown: string, fallbackTitle: string = "새로운 블로그 글") {
  const lines = markdown.split("\n");
  let title = "";
  let excerpt = "";

  // 1. 첫 번째 # 제목 찾기
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      title = trimmed.replace(/^#\s+/, "").trim();
      break;
    }
  }

  if (!title) {
    title = fallbackTitle.replace(/\.md$/i, "");
  }

  // 2. 첫 번째 일반 문단을 찾아 요약문으로 추출
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("```") &&
      !trimmed.startsWith("-") &&
      !trimmed.startsWith("*") &&
      !trimmed.startsWith(">") &&
      !trimmed.startsWith("|")
    ) {
      excerpt = trimmed.slice(0, 150);
      if (trimmed.length > 150) excerpt += "...";
      break;
    }
  }

  if (!excerpt) {
    excerpt = "온리비 어서(Onrivi Author)로 작성된 마크다운 포스트입니다.";
  }

  // 3. 슬러그 자동 생성 (영문/숫자/하이픈 정규화 또는 타임스탬프)
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 50) || `post-${Date.now()}`;

  // 4. 본문 내 첫 번째 이미지 자동 추출 (없으면 디폴트 커버)
  const mdImgMatch = markdown.match(/!\[.*?\]\((https?:\/\/[^\s\)]+|\/[^\s\)]+)\)/);
  const htmlImgMatch = markdown.match(/<img[^>]+src=["'](https?:\/\/[^"']+|\/[^"']+)["']/i);
  const coverImage = mdImgMatch ? mdImgMatch[1].trim() : htmlImgMatch ? htmlImgMatch[1].trim() : DEFAULT_BLOG_COVER;

  return { title, excerpt, slug, coverImage };
}
