/**
 * DEFAULT_WELCOME_MD: 애플리케이션 첫 실행 시 에디터에 표시되는 웰컴 페이지 내용입니다.
 *
 * 이 상수는 다음 두 곳에서 사용됩니다:
 * 1. constants/welcomeContent.ts의 getWelcomeContent() — localStorage 초기값
 * 2. lib/vfsHelper.ts의 DEFAULT_WELCOME_TEXT — 브라우저 워크스페이스 Welcome.md 초기값
 *
 * 사용자가 이 내용을 에디터에서 직접 수정한 뒤 저장하면
 * localStorage('onrivi_welcome_content')에 저장되어 다음 실행 시 반영됩니다.
 */
export const DEFAULT_WELCOME_MD = `# Onrivi Author: 일상의 기록이 출판이 되고 가치가 되는 순간

> "당신의 생각은 소중합니다. 우리는 그 생각을 가장 아름답고 머물 만한 공간으로 만듭니다."

![Hero Image](./hero.png)

### 따뜻하고 포근한 햇살 아래, 당신만의 기록 보관소
**Onrivi Author**는 복잡한 기술을 넘어, 당신의 아이디어가 방해받지 않고 기록될 수 있는 평화롭고 포근한 집안 환경을 지향합니다.

---

### 영혼을 담은 글쓰기 (Writing with Heart and Soul)

#### 하나. 편안한 집안 경험
가장 친숙하고 강력한 편집기를 통해, 마치 종이 위에 펜을 굴리듯 매끄럽게 당신의 생각을 써 내려가 보세요. 당신의 손끝에서 태어나는 모든 단어는 실시간으로 아름다운 문서가 됩니다.

#### 둘. 시간의 흐름을 따르는 동기화
당신의 글을 쓰는 리듬에 맞춰 미리보기 창이 부드럽게 따라옵니다. 기술은 뒤로 숨고, 오직 당신의 글과 결과물과의 대화에만 시간을 선물합니다.

#### 셋. 잊힌 기억을 찾아주는 지능형 검색
수개월 전에 적어두었던 한 줄의 생각이나 단어가 떠오르지 않을 때, \`Ctrl + Shift + F\`를 눌러보세요. 당신의 워크스페이스 전체를 샅샅이 뒤져 잊고 있던 소중한 기록을 찾아드립니다.

---

![Lifestyle Workspace](https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80)

### 당신의 진심을 세상에 전하는 방법
정성스럽게 작성한 글을 **PDF, HTML, 이미지**로 깔끔하게 담아보세요. 소중한 사람에게, 혹은 더 넓은 세상으로 당신의 목소리를 전할 준비가 되었습니다.

---

#### 시작하는 방법
왼쪽 **탐색기**에서 당신의 기록들을 담을 폴더를 선택하거나, **새 파일**을 만들어 오늘의 첫 문장을 열어보세요.

---
© 2026 Onrivi Studio. *Crafting tools for human expression.*
`;

/**
 * localStorage에 웰컴 내용을 저장할 때 사용하는 키 이름입니다.
 */
export const WELCOME_STORAGE_KEY = 'onrivi_welcome_content';

/**
 * localStorage에서 웰컴 페이지 내용을 읽어옵니다.
 *
 * 동작 순서:
 * 1. localStorage('onrivi_welcome_content')에 저장된 값이 있으면 반환
 * 2. 없으면 DEFAULT_WELCOME_MD를 localStorage에 저장한 뒤 반환
 * 3. SSR(서버사이드 렌더링) 환경에서는 항상 DEFAULT_WELCOME_MD 반환
 *
 * @returns 웰컴 페이지 마크다운 문자열
 */
export function getWelcomeContent(): string {
  if (typeof window === 'undefined') return DEFAULT_WELCOME_MD;
  try {
    const saved = localStorage.getItem(WELCOME_STORAGE_KEY);
    if (saved) return saved;
    localStorage.setItem(WELCOME_STORAGE_KEY, DEFAULT_WELCOME_MD);
    return DEFAULT_WELCOME_MD;
  } catch {
    return DEFAULT_WELCOME_MD;
  }
}

/**
 * 웰컴 페이지 내용을 localStorage에 저장합니다.
 * 사용자가 에디터에서 웰컴 페이지를 수정한 후 저장할 때 호출됩니다.
 * @param text 저장할 마크다운 문자열
 */
export function saveWelcomeContent(text: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WELCOME_STORAGE_KEY, text);
  } catch {}
}
