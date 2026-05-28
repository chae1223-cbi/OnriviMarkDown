# Onrivi Author 고도화 구현계획서 v1.0

> **작성일**: 2026-05-28
> **대상**: Onrivi Author (OnriviMarkDown) — Next.js + Electron + Chrome Extension
> **목적**: 현재 플랫폼을 구조적, 기능적, UX 관점에서 한 단계 진화시키기 위한 5대 개선 과제의 상세 구현 계획

---

## 목차

1. [Monaco Editor 웹 워커 리소스 로컬 패키징 철저화](#1-monaco-editor-웹-워커-리소스-로컬-패키징-철저화)
2. [MarkdownViewer 가상 스크롤 도입](#2-markdownviewer-가상-스크롤-도입)
3. [미디어 자산 경로 추상화 레이어](#3-미디어-자산-경로-추상화-레이어)
4. [WritingAssistant ↔ Monaco 에디터 양방향 바인딩](#4-writingassistant--monaco-에디터-양방향-바인딩)
5. [IME 조합 상태 가드 보강](#5-ime-조합-상태-가드-보강)

---

## 1. Monaco Editor 웹 워커 리소스 로컬 패키징 철저화

### 현재 상태 분석

| 항목 | 내용 |
|------|------|
| **현재 구현 위치** | `frontend/page.tsx:60-86` — 모듈 레벨 `MonacoEnvironment.getWorkerUrl` 설정 |
| **CDN 로컬화** | `frontend/fix-extension.js:26-52` — `copyMonacoEditor()`로 `monaco-editor/min/vs`를 `out/monaco-editor/min/vs`로 복사 |
| **CSP 대응** | `frontend/fix-extension.js:55-105` — `extractInlineScripts()`로 인라인 스크립트 외부화 |

### 문제점

1. **`MonacoEnvironment` 설정이 `page.tsx` 최상단 모듈 스코프**에만 존재 (lines 60-86). Chrome Extension 환경이 아닌 Electron/local 웹 모드에서는 Monaco가 자체 `Blob` URL로 워커를 생성 → CSP 충돌 가능성 잔존
2. **`fix-extension.js`의 `copyMonacoEditor()`는 단순 파일 복사**만 수행. 워커 경로가 `chrome-extension://` 프로토콜로 올바르게 매핑되는지 빌드 타임 검증 부재
3. 복사된 워커 JS 파일들은 Monaco 버전 업데이트 시 수동 추적 필요

### 구현 계획

#### Step 1: `MonacoEnvironment` 설정을 공용 모듈로 분리

**대상 파일**: `frontend/src/lib/monacoEnv.ts` (신규 생성)

```typescript
// 현재 page.tsx:60-86의 로직을 분리하여 별도 모듈로 추출
// Electron / Chrome Extension / Local Web의 3가지 환경을 명시적으로 분기

export function configureMonacoEnvironment(): void {
  if (typeof window === 'undefined') return;

  const isExtension = !!((window as any).chrome?.runtime?.id);
  const isElectron = !!(window as any).electronAPI;

  const getWorkerUrl = (_moduleId: string, label: string) => {
    // 1순위: Chrome Extension → chrome-extension:// URL
    if (isExtension) {
      const base = (window as any).chrome.runtime.getURL('/monaco-editor/min/vs');
      return `${base}/${workerFileName(label)}`;
    }
    // 2순위: Electron → file:// 프로토콜 (상대 경로)
    if (isElectron) {
      return `./monaco-editor/min/vs/${workerFileName(label)}`;
    }
    // 3순위: Local Web → Built-in Blob (Monaco 기본)
    return undefined; // Monaco 기본 Blob 생성 로직에 위임
  };

  (window as any).MonacoEnvironment = { getWorkerUrl };
}
```

#### Step 2: `fix-extension.js` 워커 경로 빌드 타임 검증 추가

**대상 파일**: `frontend/fix-extension.js`

```javascript
// fix-extension.js에 추가할 검증 로직 (lines 177 이후)
function verifyWorkerFiles() {
  const requiredWorkers = [
    'editor/editor.worker.js',
    'language/json/json.worker.js',
    'language/css/css.worker.js',
    'language/html/html.worker.js',
    'language/typescript/ts.worker.js',
  ];

  const missingWorkers = [];
  for (const worker of requiredWorkers) {
    const workerPath = path.join(outDir, 'monaco-editor', 'min', 'vs', worker);
    if (!fs.existsSync(workerPath)) {
      missingWorkers.push(worker);
    }
  }

  if (missingWorkers.length > 0) {
    console.error(`[CRITICAL] Missing Monaco Worker files: ${missingWorkers.join(', ')}`);
    process.exit(1);
  }
  console.log('All Monaco Worker files verified successfully.');
}
```

#### Step 3: `page.tsx` 모듈 스코프의 `MonacoEnvironment` 제거 및 `monacoEnv` 모듈 참조로 변경

**대상 파일**: `frontend/src/app/page.tsx`

- lines 60-86을 통째로 제거
- `import { configureMonacoEnvironment } from '@/lib/monacoEnv';` 추가
- lines 87 위치에 `configureMonacoEnvironment();` 호출

#### Step 4: Electron main process에서 워커 경로 CSP 헤더 화이트리스트 설정

**대상 파일**: `main.js`

`session.defaultSession.webRequest.onHeadersReceived` 콜백에 `worker-src 'self' blob:` CSP 지시자 추가

### 난이도: ⭐⭐ (하)
### 우선순위: **중간**
### 작업 시간: 약 4시간

---

## 2. MarkdownViewer 가상 스크롤 도입

### 현재 상태 분석

| 항목 | 내용 |
|------|------|
| **뷰어 구현** | `frontend/src/components/MarkdownViewer.tsx:154-308` — `react-markdown`이 전체 문서를 한 번에 DOM에 렌더링 |
| **스크롤 동기화** | `frontend/page.tsx:2876-2953` — 에디터 스크롤 → 프리뷰 `[data-line]` 요소 탐색 후 `scrollIntoView` |
| **양방향 동기화** | `frontend/page.tsx:3010-3036` — 프리뷰 스크롤 → `revealLineAtTop` |
| **문서 크기** | 전체 `content` 문자열을 그대로 `MarkdownViewer`에 `props` 전달 |

### 문제점

1. 수십 페이지 분량(예: 50000줄+) 마크다운 문서 로드 시 DOM 노드가 수천~수만 개 생성
2. `react-markdown` + `rehypeKatex`의 KaTeX 수식 렌더링이 모든 DOM 요소에 대해 실행되어 연산 오버헤드 급증
3. React Virtual DOM Reconciliation이 모든 노드를 비교 → 입력 Latency 증가
4. `data-line` 속성 기반 스크롤 동기화가 모든 DOM 요소를 순회 (`querySelectorAll('[data-line]')`)하여 성능 저하

### 구현 계획

#### Step 1: `react-window` + `react-virtualized-auto-sizer` 의존성 추가

```bash
npm install react-window @types/react-window react-virtualized-auto-sizer
```

#### Step 2: 가상화된 `VirtualMarkdownViewer` 컴포넌트 생성

**대상 파일**: `frontend/src/components/VirtualMarkdownViewer.tsx` (신규 생성)

```typescript
interface VirtualMarkdownViewerProps {
  content: string;
  originalContent?: string;
  lineMap?: number[];
  onCheckboxToggle?: (lineNumber: number, checked: boolean) => void;
  onVisibleLineChange?: (topLine: number, bottomLine: number) => void;
}
```

컨셉:
- 전체 마크다운을 **섹션 단위**(헤딩 기준, 또는 N줄 단위)로 분할
- 각 섹션의 높이를 근사 계산(캐싱)하여 가상 스크롤의 `itemCount`와 `itemSize`로 사용
- **화면에 보이는 섹션 + 프리페치 영역**(viewport + overScan)만 실제 `ReactMarkdown`으로 렌더링
- 나머지 영역은 `estimatedSize` 기반의 빈 `div`(placeholder)로 채움

#### Step 3: `MarkdownViewer`를 `VirtualMarkdownViewer`로 교체 (옵션 플래그)

**대상 파일**: `frontend/src/app/page.tsx`

- `MarkdownViewer` import를 `VirtualMarkdownViewer`로 변경 (토글 가능하도록)
- `previewRef`에 `onVisibleLineChange` 콜백 바인딩
- 스크롤 동기화 로직(`page.tsx:2876-2953`, `3009-3036`)을 가상 스크롤의 `onScroll` 이벤트와 연동

#### Step 4: 섹션 분할 및 높이 캐싱 로직

**대상 파일**: `frontend/src/lib/virtualScrollUtils.ts` (신규 생성)

```typescript
export function splitIntoSections(markdown: string): Section[] {
  // 헤딩(##, ###)을 기준으로 섹션 분할
  // 각 섹션의 예상 높이 = 줄 수 × line-height 근사값
}

export function estimateSectionHeight(lines: number): number {
  return lines * 1.5 * 16; // 1.5rem line-height, 16px base
}
```

#### Step 5: `data-line` 기반 스크롤 동기화 최적화

- **Intersection Observer** 도입: 모든 `[data-line]`을 순회하지 않고, 가시 영역 내 섹션만 관찰
- 스크롤 동기화 시 `querySelector` 대신 미리 구축한 **Line → 요소 맵(Map<number, HTMLElement>)**
- 양방향 동기화의 디바운스를 50ms → 16ms로 단축하여 반응성 향상

### 난이도: ⭐⭐⭐⭐ (상)
### 우선순위: **최우선**
### 작업 시간: 약 24시간

---

## 3. 미디어 자산 경로 추상화 레이어

### 현재 상태 분석

| 항목 | 내용 |
|------|------|
| **이미지 붙여넣기** | `frontend/page.tsx:1354-1416` — `handleEditorPaste` → 백엔드 `/api/upload-pasted-image` → `assets/filename.png` |
| **이미지 경로 변환** | `frontend/page.tsx:126-169` — `resolveRelativeImagePath()` 함수가 상대 경로를 절대 경로로 변환 |
| **MarkdownViewer 이미지** | `frontend/src/components/MarkdownViewer.tsx:167-200` — `img` 커스텀 렌더러 (width/height 쿼리스트링 지원) |
| **Browser 모드 저장** | `frontend/src/lib/vfsHelper.ts` — localStorage 기반 가상 파일 시스템 |
| **백엔드 이미지 저장** | `backend/index.js` — `/api/upload-pasted-image` 엔드포인트 |

### 문제점

1. **Browser 모드(`workspaceType === 'browser'`)**에서 이미지 붙여넣기 시 `assets/` 상대 경로가 유효하지 않음 → Broken Image
2. **Chrome Extension 모드**에서 `assets/`는 실제 파일 시스템이 아닌 확장 프로그램 패키지 내부 → 접근 불가
3. `resolveRelativeImagePath()`가 로컬 모드(Express 정적 서빙)에만 최적화되어 있음
4. Browser 모드에서 이미지 paste 시도 → `fetch(getApiUrl('/api/upload-pasted-image'))`는 백엔드가 없으면 실패

### 구현 계획

#### Step 1: `MediaAssetManager` 추상화 레이어 생성

**대상 파일**: `frontend/src/lib/mediaAssetManager.ts` (신규 생성)

```typescript
export type WorkspaceMode = 'local' | 'browser' | 'extension';

export interface IMediaAssetManager {
  /** 이미지 저장 후 접근 가능한 URL 반환 */
  saveImage(base64Data: string, fileName?: string): Promise<string>;
  /** 저장된 이미지 URL을 현재 모드에 맞게 변환 */
  resolveUrl(originalPath: string, currentFilePath?: string): string;
  /** 이미지 삭제 */
  deleteImage(url: string): Promise<void>;
}

export function createMediaAssetManager(mode: WorkspaceMode): IMediaAssetManager {
  switch (mode) {
    case 'local':   return new LocalFileAssetManager();
    case 'browser':  return new BrowserStorageAssetManager();
    case 'extension': return new ExtensionAssetManager();
  }
}
```

#### Step 2: 모드별 구현체 작성

**`LocalFileAssetManager`** (기존 백엔드 API 사용):
- `saveImage()` → `POST /api/upload-pasted-image`
- `resolveUrl()` → `http://localhost:4000/assets/filename.png` 또는 상대 경로

**`BrowserStorageAssetManager`**:
- `saveImage()` → IndexedDB에 Blob 저장, `URL.createObjectURL(blob)`로 Blob URL 생성
- `resolveUrl()` → IndexedDB 키 조회 후 Blob URL 반환

**`ExtensionAssetManager`**:
- `saveImage()` → `chrome.storage.local`에 base64 저장
- `resolveUrl()` → `chrome.runtime.getURL('assets/filename.png')` 또는 `data:image/...` 인라인

#### Step 3: `handleEditorPaste` 이미지 처리 로직 리팩터링

**대상 파일**: `frontend/src/app/page.tsx`

- lines 1354-1416의 `handleEditorPaste` 내 이미지 처리 부분을 `mediaAssetManager.saveImage()` 위임
- `workspaceType`에 따라 적절한 `MediaAssetManager` 인스턴스 사용

```typescript
const mediaManager = useMemo(() => createMediaAssetManager(
  isAddonEnv ? 'extension' : workspaceType
), [workspaceType, isAddonEnv]);

// In handleEditorPaste:
const resolvedUrl = await mediaManager.saveImage(base64Data);
const textToInsert = `![이미지](${resolvedUrl})`;
```

#### Step 4: `MarkdownViewer` 이미지 렌더러에 URL 해석 로직 추가

**대상 파일**: `frontend/src/components/MarkdownViewer.tsx`

- `img` 커스텀 렌더러(lines 167-200)에 `mediaManager.resolveUrl()` 적용
- `blob:`, `chrome-extension://`, `data:` 프로토콜을 포함한 모든 URL 타입 지원

#### Step 5: `resolveRelativeImagePath`를 `mediaAssetManager.resolveUrl`로 대체

**대상 파일**: `frontend/src/app/page.tsx`

- lines 126-169 함수 제거 (기존 논리는 `LocalFileAssetManager`의 `resolveUrl`로 이관)

### 난이도: ⭐⭐⭐ (중)
### 우선순위: **최우선**
### 작업 시간: 약 16시간

---

## 4. WritingAssistant ↔ Monaco 에디터 양방향 바인딩

### 현재 상태 분석

| 항목 | 내용 |
|------|------|
| **WritingAssistant** | `frontend/src/components/WritingAssistant.tsx` — 맞춤법 검사 + SEO 분석 결과 표시 |
| **맞춤법 API** | `backend/services/spellChecker.js` — 정규식 기반 패턴 매칭 (한글 맞춤법) |
| **SEO API** | `backend/services/seoAnalyzer.js` — H1/H2/이미지/링크/글자수 분석 |
| **현재 props** | `isDarkMode: boolean`, `content: string` — 단방향 데이터 전달만 가능 |
| **에디터 참조** | `page.tsx`의 `editorRef` — Monaco 인스턴스, `setSelection`, `executeEdits` 메서드 보유 |

### 문제점

1. **맞춤법 검사 결과가 읽기 전용 리스트** — 사용자가 오류를 보고 직접 에디터에서 찾아가 수동 수정해야 함
2. **오타 위치 정보(`start`, `end` 인덱스)**가 `spellChecker.js`에서 반환되지만 `WritingAssistant.tsx`에서 버려지고 있음 (`wrong`, `correct`, `type`, `desc`만 사용)
3. **에디터와 패널 간 상호작용 부재** — 맞춤법 항목 클릭 → 에디터 커서 이동/선택/자동 교정 기능 없음
4. **재검사 트리거**가 수동 버튼 클릭에만 의존

### 구현 계획

#### Step 1: `WritingAssistant` props 확장 — 에디터 연동 인터페이스 추가

**대상 파일**: `frontend/src/components/WritingAssistant.tsx`

```typescript
interface WritingAssistantProps {
  isDarkMode: boolean;
  content: string;
  // === 신규 ===
  onNavigateToLine?: (lineNumber: number, column?: number) => void;
  onApplyCorrection?: (wrongText: string, correctText: string, startIndex: number, endIndex: number) => void;
  onRequestRecheck?: () => void;
  spellErrors?: SpellError[]; // 선택적: 부모에서 전달 가능
}
```

#### Step 2: 맞춤법 오류 클릭 시 에디터 커서 이동 및 선택 기능

**대상 파일**: `frontend/src/components/WritingAssistant.tsx`

- 각 오류 항목을 클릭 가능한 `button`으로 변경
- 클릭 시 `onNavigateToLine(line, column)` 호출
- `backend/spellChecker.js` 반환값의 `start`/`end` 인덱스를 라인 번호로 변환하여 전달

```tsx
// WritingAssistant.tsx — 각 오류 아이템
<button
  onClick={() => onNavigateToLine?.(err.line, err.column)}
  className="..."
>
  {/* 기존 UI */}
</button>
```

#### Step 3: 원클릭 교정 기능 구현

**대상 파일**: `frontend/src/components/WritingAssistant.tsx`

- 각 오류 항목에 "자동 교정" 버튼 추가
- `onApplyCorrection(err.wrong, err.correct, err.start, err.end)` 호출
- `page.tsx`의 핸들러에서 `editorRef.current.executeEdits()` 실행

```typescript
// page.tsx — onApplyCorrection 핸들러
const handleApplyCorrection = useCallback((wrongText: string, correctText: string, start: number, end: number) => {
  if (!editorRef.current) return;
  const editor = editorRef.current;
  const model = editor.getModel();
  if (!model) return;

  // 인덱스를 라인/컬럼으로 변환
  const startPos = model.getPositionAt(start);
  const endPos = model.getPositionAt(end);

  editor.pushUndoStop();
  editor.executeEdits("spellFix", [{
    range: new monaco.Range(
      startPos.lineNumber, startPos.column,
      endPos.lineNumber, endPos.column
    ),
    text: correctText,
    forceMoveMarkers: true,
  }]);
  editor.pushUndoStop();
  setContent(editor.getValue());
}, []);
```

#### Step 4: `WritingAssistant` 내 오류 라인 정보 보강

**대상 파일**: `backend/services/spellChecker.js`

- 반환 객체에 `line`, `column` 필드 추가
- 현재 `start`, `end` 인덱스를 기반으로 라인/컬럼 계산

```javascript
// spellChecker.js 계산 로직
function getLineColumn(text, index) {
  const before = text.substring(0, index);
  const lines = before.split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}
```

#### Step 5: SEO 분석 결과와 에디터 연동 (선택사항)

- SEO 이슈 항목(예: "H2가 없습니다") 클릭 → 에디터의 H1 아래로 커서 이동
- "볼드체 과다 사용" → 해당 bold 영역으로 탐색

#### Step 6: 자동 재검사 트리거 도입 (선택사항)

- `content`가 변경될 때 5초 디바운스 후 자동 재검사 실행
- 사용자 설정(SettingModal)에서 활성/비활성 토글 가능

### 난이도: ⭐⭐ (하)
### 우선순위: **중간**
### 작업 시간: 약 8시간

---

## 5. IME 조합 상태 가드 보강

### 현재 상태 분석

| 항목 | 내용 |
|------|------|
| **단축키 디스패처** | `frontend/page.tsx:2270-2327` — `keydown` 이벤트 캡처 → 조합키 스캔 → `dispatchCommand` |
| **IME keyCode 229 처리** | `frontend/page.tsx:2290-2295` — `e.keyCode === 229` 조건에서 Ctrl+Shift 조합키 보정 |
| **핸들러 맵** | `page.tsx`의 `handlers` 객체 — `handlersRef`에 래핑되어 있음 |
| **Editor 명령** | `page.tsx:2486-2541` — `editor.onKeyUp`, `addCommand(Enter)`, `addCommand(Tab)` |

### 문제점

1. **IME 조합 중 Enter 키**: 한글/중국어/일본어 입력 중 Enter로 조합 완료 시점에 **Enter 명령(리스트 자동완성 등)이 가로채어** 조합 중인 문자가 쪼개짐
2. **IME 조합 중 단축키**: Ctrl+B, Ctrl+I 등의 서식 단축키가 IME 조합 중에도 실행되어 의도치 않은 서식 적용
3. **`keyCode 229` 처리**가 Ctrl+Shift 조합에만 한정 — 한글 조합 중 일반 Ctrl+B 등의 처리 미흡
4. **Slash 명령어(`/`) 트리거**: `/` 키 입력 시 IME 조합 중에도 Suggest 트리거되어 글자가 깨짐

### 구현 계획

#### Step 1: 전역 키보드 이벤트 가드에 `isComposing` 체크 추가

**대상 파일**: `frontend/src/app/page.tsx` — `keydown` 핸들러 (lines ~2270)

```typescript
const handleKeyDown = useCallback((e: KeyboardEvent) => {
  // === IME Composition Guard ===
  // 조합 중인 문자(한글/중국어/일본어)가 있으면 모든 단축키 가로채기를 차단
  if (e.nativeEvent?.isComposing || e.isComposing) return;

  // 기존 keyCode 229 처리 로직 유지
  // (lines 2290-2295)
}, [/* deps */]);
```

#### Step 2: Monaco Editor 내 Enter 명령 IME 가드

**대상 파일**: `frontend/src/app/page.tsx` — `editor.addCommand(monaco.KeyCode.Enter, ...)` (line 2605)

```typescript
editor.addCommand(monaco.KeyCode.Enter, () => {
  // IME 조합 중 Enter는 기본 동작(개행)만 수행
  const isComposing = editor.getModel()?.getValue() && 
    (typeof (window as any).__monaco_ime_composing !== 'undefined' 
      ? (window as any).__monaco_ime_composing 
      : false);
  if (isComposing) {
    editor.trigger('keyboard', 'type', { text: '\n' });
    return;
  }
  // ... 기존 리스트 자동완성 로직
});
```

#### Step 3: Monaco Editor CompositionStart/End 이벤트 리스너 등록

**대상 파일**: `frontend/src/app/page.tsx` — `onMount` 내부

Monaco Editor의 DOM 컨테이너에 `compositionstart` / `compositionend` 이벤트 리스너 등록:

```typescript
const container = editor.getContainerDomNode();
container.addEventListener('compositionstart', () => {
  (window as any).__monaco_ime_composing = true;
});
container.addEventListener('compositionend', () => {
  (window as any).__monaco_ime_composing = false;
});
```

#### Step 4: Slack 명령어(`/`) Suggest IME 가드

**대상 파일**: `frontend/src/app/page.tsx:2486-2490`

```typescript
editor.onKeyUp((e) => {
  if (e.browserEvent.key === '/') {
    // IME 조합 중이면 Suggest 트리거 차단
    if (e.browserEvent.isComposing) return;
    editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
  }
});
```

#### Step 5: Tab/Enter 자동완성 IME 가드

**대상 파일**: `frontend/src/app/page.tsx`

- `editor.addCommand(monaco.KeyCode.Tab, ...)` (line 2506) — IME 조합 중 기본 탭만 허용
- `editor.addCommand(monaco.KeyCode.Enter, ...)` (line 2605) — IME 조합 중 개행만 허용

#### Step 6: 다국어별 맞춤 IME 처리 (선택사항)

향후 중국어(병음 입력기), 일본어(히라가나/가타카나), 유럽어(악센트 조합)에 대한 대응:
- `e.key`와 `e.code`의 불일치 시 IME 활성 상태로 간주
- `e.inputType === 'insertCompositionText'` 감지 로직

### 난이도: ⭐ (하)
### 우선순위: **높음** (다국어 지원 기반)
### 작업 시간: 약 3시간

---

## 전체 로드맵

| 우선순위 | 과제 | 작업 시간 | 난이도 | 선행 조건 |
|:--------:|------|:---------:|:------:|:---------:|
| 1 | 미디어 자산 경로 추상화 | 16h | ⭐⭐⭐ | 없음 |
| 2 | MarkdownViewer 가상 스크롤 | 24h | ⭐⭐⭐⭐ | 없음 |
| 3 | IME 조합 상태 가드 보강 | 3h | ⭐ | 없음 |
| 4 | Monaco 워커 로컬 패키징 | 4h | ⭐⭐ | 없음 |
| 5 | WritingAssistant ↔ 에디터 바인딩 | 8h | ⭐⭐ | 과제 4 (에디터 연동) |

### 추천 마일스톤

| 마일스톤 | 포함 과제 | 목표 |
|:---------|:----------|:-----|
| **M1** (1주차) | 과제 3 + 4 | 안정성 기반 확보 (IME + Extension) |
| **M2** (2-3주차) | 과제 1 | 플랫폼 호환성 확보 (Browser/Extension 이미지) |
| **M3** (4-5주차) | 과제 5 | UX 개선 (맞춤법 ↔ 에디터 연동) |
| **M4** (6-8주차) | 과제 2 | 대용량 문서 성능 최적화 |

---

## 코드 변경 요약

| 파일 | 변경 유형 | 과제 |
|:-----|:---------:|:----:|
| `frontend/src/lib/monacoEnv.ts` | **신규 생성** | 1 |
| `frontend/fix-extension.js` | 수정 | 1 |
| `frontend/src/app/page.tsx` | 수정 | 1, 3, 4, 5 |
| `main.js` | 수정 | 1 |
| `frontend/src/components/VirtualMarkdownViewer.tsx` | **신규 생성** | 2 |
| `frontend/src/lib/virtualScrollUtils.ts` | **신규 생성** | 2 |
| `frontend/src/components/MarkdownViewer.tsx` | 수정 | 2 |
| `frontend/src/lib/mediaAssetManager.ts` | **신규 생성** | 3 |
| `frontend/src/lib/vfsHelper.ts` | 수정 | 3 |
| `frontend/src/components/WritingAssistant.tsx` | 수정 | 4 |
| `backend/services/spellChecker.js` | 수정 | 4 |
| `backend/index.js` | 수정 | 3 |

---

*이 구현계획서는 현재 소스 코드 분석(`repomix-output.xml`)과 기존 PRD/아키텍처 문서, 그리고 5대 고도화 제언을 종합적으로 연계하여 작성되었습니다.*
