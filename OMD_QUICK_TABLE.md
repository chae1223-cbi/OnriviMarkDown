| 주석 고유번호 | 소스 위치 / 소스명 | 대상 함수명 | 🎯 @KICK | 🛡️ @GUARD | 🚨 @PATCH | 🔗 @CALLS |
|---|---|---|---|---|---|---|
| OMD-AUTH-AboutModal-0001 | AboutModal | AboutModal | 프로그램 정보, 정품 인증 상태, 저작권 정보를 표시하는 포털 기반 모달 창 | isOpen 및 mounted 상태가 모두 true일 때만 렌더링 | 없음 | 없음 |
| OMD-AUTH-LicenseModal-0001 | LicenseModal | handleCopyText | 라이선스 키 텍스트를 클립보드에 복사하고 사용자 피드백 표시 | 없음 | 없음 | clipboard.writeText, setMessage |
| OMD-AUTH-secureStorage-0001 | secureStorage.ts | saveSecureData | AES-256 암호화하여 로컬 스토리지에 보안 데이터 저장 | window 부재, JSON.stringify 실패 시 catch | 없음 | 없음 |
| OMD-AUTH-secureStorage-0002 | secureStorage.ts | loadSecureData | 로컬 스토리지 AES-256 암호화 데이터 복호화 및 JSON 파싱 | window 부재, ciphertext null, 복호화 결과 유효성, 변조 의심 시 null 반환 | 없음 | 없음 |
| OMD-AUTH-LicenseModal-0002 | LicenseModal | handleManualActivate | Supabase를 통해 라이선스 키+유저+verifyKey 일치 여부 검증 후 기기 등록 | 이메일/verifyKey가 비어있으면 early return; Supabase 설정 미비 시 차단 | 없음 | supabase.from, onSuccessActivation, onClose |
| OMD-AUTH-LicenseModal-0003 | LicenseModal | handleOpenRegister | 백엔드 API로 일회성 티켓을 발급하고 대시보드 결제 페이지로 이동 | 이메일 미입력/형식 오류 시 early return | 없음 | fetch, window.open, api.openExternal |
| OMD-AUTH-LicenseModal-0004 | LicenseModal | LicenseModal | 라이선스 정품 인증 UI - 대시보드 연동 및 Supabase 수동 인증 제공 | isOpen이 false이면 null 반환 | 없음 | handleOpenRegister, handleManualActivate, handleCopyText |
| OMD-AUTH-MainEditorApp-0015 | MainEditorApp.tsx | initDeviceId | electronAPI, chrome.storage 또는 localStorage 폴백에서 고유 장치 ID 초기화 | 순서가 다른 환경 처리; 존재하지 않으면 crypto-random UUID 생성 | 애드온 크로스 브라우저 동기화를 위해 chrome.storage.sync 사용 | api.getMachineId, chrome.storage.sync.get/set, crypto.randomUUID, localStorage.getItem/setItem, setDeviceId |
| OMD-AUTH-MainEditorApp-0016 | MainEditorApp.tsx | loadAndVerifyLicense | 저장소에서 라이선스 키 로드, Supabase DB로 검증, 로컬 평가 기간으로 폴백 | 암호화 캐시를 통한 오프라인 유예 기간(3일), 최초 실행 14일 보장, SHA-256 익명 키 생성 폴백 | DB를 사용할 수 없는 경우 익명 키를 위한 crypto subtle 폴백 | api.loadLicenseFull, chrome.storage.local.get, supabase.from.license_activations.select, crypto.subtle.digest, saveSecureData, loadSecureData, setLicenseStatus, setLicenseKey |
| OMD-AUTH-MainEditorApp-0018 | MainEditorApp.tsx | handleSuccessActivation | 성공적인 결제/활성화 후 모든 저장소 계층에 확인된 라이선스 활성화 유지 | 원자적 setLicenseStatus + 플랫폼 저장소 저장 (electronAPI, chrome.storage, localStorage) | None | setLicenseStatus, api.saveLicenseFull, chrome.storage.local.set, localStorage.setItem |
| OMD-CORE-MarkdownPageViewer-0001 | MarkdownPageViewer | handlePageClick | 복제된 DOM에서 체크박스 토글, 앵커 링크 이동, 일반 클릭 이벤트 위임 처리 | input/체크박스, 앵커 태그 분기 처리로 불필요한 이벤트 전파 차단 | 없음 | onCheckboxToggle, scrollIntoView, onFileOpen, resolveRelativeImagePath, onPreviewClick |
| OMD-CORE-FontSelectorModal-0001 | FontSelectorModal | collectFonts | queryLocalFonts API로 시스템 설치 폰트 수집, 실패 시 FALLBACK_FONTS 반환 | queryLocalFonts 미지원 환경에서는 콘솔 경고 후 폴백 폰트 반환 | 없음 | 없음 |
| OMD-CORE-MapModal-0001 | MapModal | handleInsert | Google Maps iframe HTML 코드를 생성하여 onInsert로 전달 | 없음 | 없음 | onInsert, onClose |
| OMD-CORE-welcomeContent-0001 | welcomeContent | saveWelcomeContent | 웰컴 페이지 내용을 localStorage에 저장한다 | SSR 환경에서는 아무 동작도 하지 않음 | 없음 | WELCOME_STORAGE_KEY |
| OMD-CORE-cssProfileGuide-0001 | cssProfileGuide | CSS_PROFILE_GUIDE_MD | CSS Profile 작성 표준 명세서 마크다운을 상수로 내보낸다 | 서식 설정 화면에서 다운로드 가능한 가이드로 사용됨 | 없음 | 없음 |
| OMD-CORE-cssProfile-0001 | cssProfile | createEmptyProfile | 새로운 빈 CssProfile 객체를 생성하여 반환한다 | EMPTY_RULES를 깊은 복사하여 여러 프로필이 동일 객체를 참조하지 않도록 방지한다 | 없음 | 없음 |
| OMD-CORE-paperSizes-0001 | paperSizes | PAPER_SIZES | 선택 가능한 용지 규격 상수 맵 — mm 단위 width/height 제공 | 키는 jsPDF format 이름과 호환 ('a4' → jsPDF 'a4') | 없음 | mmToPixels |
| OMD-CORE-paperSizes-0002 | paperSizes | mmToPixels | mm 값을 주어진 DPI 기준 px로 변환 | 기본 DPI는 96 (브라우저 표준) | 없음 | 없음 |
| OMD-CORE-messages-0001 | messages | SystemMessageKey | SYSTEM_MESSAGES 객체의 키를 유니온 타입으로 추출한다 | typeof SYSTEM_MESSAGES의 키만 허용 | 없음 | SYSTEM_MESSAGES |
| OMD-CORE-MarkdownViewer-0001 | MarkdownViewer | rehypeBrRaw | raw HTML <br> 태그를 안전하게 br 엘리먼트로 교체하는 rehype 플러그인 | raw 노드를 분할하여 br 태그만 엘리먼트로, 나머지는 보존 | 없음 | 없음 |
| OMD-CORE-ConfirmModal-0001 | ConfirmModal | ConfirmModal | 확인/취소 선택과 위험 경고 아이콘을 표시하는 포털 기반 범용 컨펌 모달 | isOpen 및 mounted 상태 모두 true일 때만 렌더링, isDanger에 따라 스타일 분기 | 없음 | 없음 |
| OMD-CORE-CssStyleForm-0001 | CssStyleForm | AccordionSection | 접이식 아코디언 섹션 래퍼 컴포넌트 - 타이틀 클릭으로 열기/닫기 토글 | isOpen 상태에 따라 자식 렌더링 조건 분기 | 없음 | 없음 |
| OMD-CORE-ColorText-0001 | ColorText | ColorText | 텍스트에서 16진수 색상 코드를 감지하여 컬러 박스와 함께 시각적으로 렌더링 | 정규식으로 유효한 헥사코드만 매칭하여 안전한 렌더링 보장 | 없음 | 없음 |
| OMD-CORE-page-0001 | page | Page | Next.js 클라이언트 진입 페이지 - SSR 비활성화로 MainEditorApp 동적 로딩 | 없음 | 없음 | MainEditorApp |
| OMD-CORE-USEPAGEBREAK-0001 | usePageBreak.ts | executeAutoPageBreak | 타이핑 시 선택 용지 기준 자동 페이지 나누기를 지능형으로 재계산하여 주입 | isAutoPageBreakingRef Lock으로 중복 실행 방지, previewRef 미존재 시 early return | A4 고정→PAPER_SIZES lookup으로 변경 | showToast |
| OMD-CORE-layout-0001 | layout | RootLayout | Next.js 루트 레이아웃 - 전역 HTML 구조, CSP, 폰트, Mermaid 설정 및 ToastProvider 래핑 | 없음 | 없음 | ToastProvider |
| OMD-CORE-helper-0001 | helper.tsx | idb | IndexedDB 기반 key-value 저장 헬퍼 (get/set) | onupgradeneeded 스토어 생성, objectStoreNames 존재 여부 체크 | 없음 | 없음 |
| OMD-CORE-layout-0002 | layout | metadata | Next.js Metadata 객체 - 페이지 제목, 설명, 아이콘 경로 설정 | 없음 | 없음 | 없음 |
| OMD-CORE-FontSelectorModal-0002 | FontSelectorModal | FontSelectorModal | 시스템 폰트 목록을 검색/선택하는 모달 창 | isOpen이 false면 렌더링 생략 | 없음 | collectFonts |
| OMD-CORE-MarkdownPageViewer-0002 | MarkdownPageViewer | useLayoutEffect (DOM cloning) | calculatePagination 결과를 실제 가상 용지 DOM에 복제 이식 | cloneNode(true)로 원본 노드를 복제해 Virtual DOM 파괴 방지 | cloneNode(true)를 사용해 React Virtual DOM 정합성 붕괴 버그 우회 | cloneNode, appendChild |
| OMD-CORE-MarkdownViewer-0002 | MarkdownViewer | rehypeSourceLinesPlugin | 마크다운 노드에 data-line 속성으로 원본 줄 번호를 매핑 | lineMap을 통해 processedLine을 originalLine으로 역매핑 | 없음 | 없음 |
| OMD-CORE-MapModal-0002 | MapModal | googleEmbedUrl | 좌표와 줌 레벨로 Google Maps iframe embed URL 생성 | 없음 | 없음 | 없음 |
| OMD-CORE-welcomeContent-0002 | welcomeContent | getWelcomeContent | localStorage에서 웰컴 페이지 내용을 읽어온다 | SSR 환경에서는 항상 DEFAULT_WELCOME_MD 반환 | 없음 | DEFAULT_WELCOME_MD |
| OMD-CORE-messages-0002 | messages | SYSTEM_MESSAGES | 모든 사용자 알림 메시지를 SSoT로 관리하는 객체를 정의한다 | 하드코딩된 문자열 대신 이 객체의 키를 사용하도록 강제 | 없음 | SystemMessageKey |
| OMD-CORE-USEPAGEBREAK-0002 | usePageBreak.ts | handleResetPageBreaks | 커서 이하의 페이지 구분선을 지능형으로 재계산하여 재주입 | editorRef/previewRef 미존재 시 early return | A4 고정→PAPER_SIZES lookup으로 변경 | showToast |
| OMD-CORE-helper-0002 | helper.tsx | scanDirectory | File System Access API로 폴더를 재귀 스캔하여 .md/.markdown 파일 트리 구축 | directory/file kind 분기, 오류 시 빈 배열 반환, 파일명 필터링 | localeCompare로 폴더 우선 정렬 | msg.error |
| OMD-CORE-cssProfile-0002 | cssProfile | DEFAULT_PROFILE | 시스템 기본 프로필(system-gov)을 기본값으로 내보낸다 | SYSTEM_PROFILES[0]을 참조하며 시스템 프로필이므로 수정/삭제 불가 | 없음 | SYSTEM_PROFILES |
| OMD-CORE-ConfirmModal-0002 | ConfirmModal | useEffect (handleKeyDown) | Escape/Enter 키 입력 시 각각 취소/확인 콜백 자동 실행 | isOpen이 false면 이벤트 무시 | 없음 | onCancel, onConfirm |
| OMD-CORE-CssStyleForm-0002 | CssStyleForm | SliderWidget | HTML5 range 슬라이더로 숫자 값 실시간 조정 위젯 | getNumValue로 falsy 값 안전 처리 | 없음 | getNumValue |
| OMD-CORE-helper-0003 | helper.tsx | getFileIcon | 파일/폴더 확장자에 따른 Lucide 아이콘 및 색상 반환 | directory/file 분기, 확장자 lowercase 매핑 | 없음 | 없음 |
| OMD-CORE-USEPAGEBREAK-0003 | usePageBreak.ts | usePageBreak | 선택 용지 기준 지능형 페이지 나누기 계산 및 초기화 로직 처리 | Lock 변수(isAutoPageBreakingRef)로 중복 자동 페이지 나누기 방지 | 없음 | 없음 |
| OMD-CORE-cssProfile-0003 | cssProfile | SYSTEM_PROFILES | 앱에 내장된 3개의 시스템 프로필 배열을 정의한다 | system-* 접두사 id를 가지며 수정/삭제 불가 | 없음 | 없음 |
| OMD-CORE-CssStyleForm-0003 | CssStyleForm | ColorPickerWidget | 브라우저 내장 컬러 피커와 텍스트 입력을 연동한 색상 선택 위젯 | value가 #으로 시작하지 않으면 #000000 기본값 사용 | 없음 | 없음 |
| OMD-CORE-MainEditorApp-0003 | MainEditorApp.tsx | resolveRelativeImagePath | 상대 마크다운 이미지 경로를 절대 경로로 변환, 백슬래시 및 ../.. 세그먼트 정규화 | http/https/data/blob URI, Windows 드라이브 문자, 빈 src 처리 | None | None |
| OMD-CORE-MapModal-0003 | MapModal | cleanCoords | 입력된 좌표 문자열에서 외곽 괄호/따옴표 제거 | trim + 정규식으로 좌표 정제 | 없음 | 없음 |
| OMD-CORE-MarkdownPageViewer-0003 | MarkdownPageViewer | calculatePagination | 오프스크린 렌더링 높이를 측정하여 선택 용지 단위로 페이지 분할 | 테이블/리스트는 행 단위 심층 분할; 초대형 요소는 단일 페이지 처리 | A4 고정→선택용지 대응 (paperSize prop + PAPER_SIZES lookup) | createTablePiece, createListPiece, setPages, setIsCalculated |
| OMD-CORE-messages-0003 | messages | SystemMessage | 시스템 메시지의 타입 구조를 정의한다 | type은 ToastType, text는 문자열로 제한 | 없음 | ToastType |
| OMD-CORE-MarkdownViewer-0003 | MarkdownViewer | cleanContent | 마크다운 원문 전처리 - 위키링크 변환, 괄호 링크 이스케이프, 목록 번호 방어 | 숫자+괄호 패턴을 백슬래시 이스케이프로 목록 변환 방지 | 소괄호 포함 URL 파싱 깨짐 방지를 위해 <> 래핑 필터 적용 | 없음 |
| OMD-CORE-FontSelectorModal-0003 | FontSelectorModal | useEffect (collectFonts) | 모달 열릴 때 시스템 폰트 목록을 수집하여 사용자에게 노출 | isOpen이 false면 실행 생략으로 불필요한 폰트 스캔 방지 | 없음 | collectFonts |
| OMD-CORE-welcomeContent-0003 | welcomeContent | WELCOME_STORAGE_KEY | localStorage 저장 키 이름을 정의한다 | saveWelcomeContent/getWelcomeContent에서만 사용 | 없음 | saveWelcomeContent, getWelcomeContent |
| OMD-CORE-CssStyleForm-0004 | CssStyleForm | TagRuleEditor | 특정 HTML 태그의 CSS 룰셋을 키-값 쌍으로 편집하는 서브 에디터 | isSystemProfile true면 모든 입력 비활성화 | 없음 | onUpdateRule, onRemoveRule |
| OMD-CORE-MarkdownViewer-0004 | MarkdownViewer | MarkdownViewer | 마크다운 텍스트를 ReactMarkdown으로 렌더링 - 코드블록, 표, 머메이드, 이미지 경로 변환 등 고기능 뷰어 | 이미지 경로는 media:// 프록시로 변환; HTML 이스케이프/위키링크 전처리 | 쿼리 스트링 분리 가드, 웰컴 페이지 예외 가드, 단위 자동 보완 가드 | CodeBlock, TableWrapper, MermaidBlock, rehypeSourceLinesPlugin, rehypeBrRaw, cleanContent |
| OMD-CORE-cssProfile-0004 | cssProfile | EMPTY_RULES | 모든 태그가 빈 객체인 CssRuleSet 템플릿을 제공한다 | createEmptyProfile()에서 깊은 복사하여 사용되므로 직접 참조하지 않도록 주의 | 없음 | createEmptyProfile |
| OMD-CORE-MainEditorApp-0004 | MainEditorApp.tsx | getRelativePath | 위키 스타일 문서 링크를 위한 두 파일 간 상대 경로 계산 | null fromPath 처리, 절대 경로가 아니면 ./로 시작하도록 보장 | None | None |
| OMD-CORE-MarkdownPageViewer-0004 | MarkdownPageViewer | useEffect (ResizeObserver) | 오프스크린 컨테이너 내부 요소 크기 변화를 감지하여 페이지 재분할 트리거 | ResizeObserver API 존재 여부 확인; contentRoot 존재 검사 | 없음 | calculatePagination, mmToPixels |
| OMD-CORE-MapModal-0004 | MapModal | handleSearch | Nominatim API로 주소를 검색하여 좌표와 장소명 획득 | address가 비어있으면 early return; 검색 결과가 없으면 에러 토스트 | 없음 | fetch, setCoords, setPlaceName, showToast |
| OMD-CORE-welcomeContent-0004 | welcomeContent | DEFAULT_WELCOME_MD | 기본 웰컴 페이지 마크다운을 내보낸다 | WELCOME_MD를 참조하며 읽기 전용 | 없음 | WELCOME_MD |
| OMD-CORE-cssProfile-0005 | cssProfile | isSystemProfileId | 주어진 id가 시스템 프로필 ID인지 검사한다 | SYSTEM_PROFILE_IDS 배열에 포함된 값인지만 확인 | 없음 | SYSTEM_PROFILE_IDS |
| OMD-CORE-MarkdownPageViewer-0005 | MarkdownPageViewer | useEffect (pagination) | content/용지 설정(용지 크기 포함) 변경 시 200ms 디바운스 후 페이지 재분할 | 이전 타이머를 clear하여 중복 실행 방지 | paperSize 의존성 배열 추가 | calculatePagination, setIsCalculated |
| OMD-CORE-MarkdownViewer-0005 | MarkdownViewer | MermaidBlock | Mermaid 차트 텍스트를 SVG로 실시간 변환 렌더링 및 이미지 저장/복사 툴바 제공 | Mermaid 라이브러리 로드 실패 시 에러 메시지 표시; 문법 무결성 사전 검증 | 대괄호/소괄호 전각 문자 변환으로 파싱 에러 방지; 렌더링 ID 충돌 방지용 타임스탬프 | loadMermaidScript, handleCopyImage, handleSaveImage, handleCopyCode |
| OMD-CORE-MapModal-0005 | MapModal | useEffect (mounted) | 클라이언트 마운트 완료 상태 설정으로 hydration mismatch 방지 | 없음 | 없음 | setMounted |
| OMD-CORE-MainEditorApp-0005 | MainEditorApp.tsx | MainEditorApp | 컨트롤 타워: 모든 전역 상태, 레이아웃 조립, Monaco 에디터, 미리보기, 사이드바, 메뉴 조정 | TDZ 선언 순서 방어, IME 조합 잠금, 스테일 클로저 Ref 백업, 마운트 시 레이스 컨디션 가드 | 아래 상세 하위 항목 참조 | useToast, useEditorTabs, useFileExplorer, useEditorSettings, usePageBreak, useEditorHandlers, getMdFiles, fetchAllMdFiles, resolveRelativeImagePath, getRelativePath, utilsEditorActions, utilsPasteHandlers, getSlashCommands, preprocessMarkdownForPreview, saveSecureData, loadSecureData, idb, getApiUrl |
| OMD-CORE-welcomeContent-0005 | welcomeContent | WELCOME_CONTENT | 웰컴 페이지 마크다운을 외부에 내보낸다 | DEFAULT_WELCOME_MD와 동일한 값을 참조 | 없음 | WELCOME_MD |
| OMD-CORE-CssStyleForm-0005 | CssStyleForm | CssStyleForm | 좌측 서식 정의 에디터 폼 - CSS 프로필 전역 타이포그래피 및 태그별 룰셋 편집 | 시스템 프로필(isSystemProfileId) 선택 시 모든 입력 비활성화 | RAF 기반 triggerUpdate로 고속 업데이트 병합 최적화 | AccordionSection, SliderWidget, ColorPickerWidget, TagRuleEditor, FontSelectorModal |
| OMD-CORE-welcomeContent-0006 | welcomeContent | WELCOME_MD | 웰컴 페이지 마크다운을 원시 문자열 상수로 정의한다 | WELCOME_CONTENT, DEFAULT_WELCOME_MD가 이 값을 참조 | 없음 | WELCOME_CONTENT, DEFAULT_WELCOME_MD |
| OMD-CORE-MarkdownViewer-0006 | MarkdownViewer | loadMermaidScript | Mermaid CDN 스크립트를 동적으로 로드하고 초기화 (SSR 번들 충돌 방지) | window.mermaid 존재 시 재사용; 중복 로딩 방지용 mermaidPromise 캐싱 | 없음 | mermaid.initialize |
| OMD-CORE-CssStyleForm-0006 | CssStyleForm | triggerUpdate | requestAnimationFrame 기반 고속 업데이트 최적화 게이트 - 중복 호출 병합 | pendingProfileRef 및 rafIdRef로 중복 RAF 실행 방어 | 없음 | onUpdateProfile |
| OMD-CORE-MapModal-0006 | MapModal | MapModal | Google Maps iframe 기반 지도 삽입 모달 - 주소 검색, 줌 제어, 크기/정렬 설정 | isOpen/mounted false 시 null 반환 | 없음 | handleSearch, handleInsert, setZoom, setMapAlign, showToast |
| OMD-CORE-cssProfile-0006 | cssProfile | SYSTEM_PROFILE_IDS | 시스템 프로필 식별자 목록을 정의한다 | 이 ID를 가진 프로필은 수정/삭제 불가 | 없음 | isSystemProfileId |
| OMD-CORE-MarkdownPageViewer-0006 | MarkdownPageViewer | MarkdownPageViewer | 선택 용지 기반 페이지 분할 뷰어 - 오프스크린 측정 후 가상 페이지 렌더링 | content/용지 설정(용지 크기 포함) 변경 시 200ms 디바운스 재계산; 빈 콘텐츠 처리 | A4 고정→선택용지 대응 (paperSize prop + PAPER_SIZES lookup) | calculatePagination, handlePageClick, MarkdownViewer, useLayoutEffect, useEffects, mmToPixels |
| OMD-CORE-CssStyleForm-0007 | CssStyleForm | downloadGuideSpec | CSS 프로필 명세서 가이드 마크다운 파일을 다운로드 | try-catch로 다운로드 실패 시 토스트 메시지 | 없음 | showToast |
| OMD-CORE-MainEditorApp-0007 | MainEditorApp.tsx | loadUserProfiles | 마운트 시 플랫폼 저장소(electronAPI 또는 localStorage)에서 사용자 CSS 프로필 로드 | 사용자 저장 데이터에서 시스템 프로필 필터링, 레거시 형식 마이그레이션 병합 | None | api.readProfiles, localStorage.getItem, JSON.parse, setProfiles |
| OMD-CORE-MarkdownViewer-0007 | MarkdownViewer | TableWrapper | 마크다운 표를 HTML + TSV 형식으로 클립보드에 복사하는 래퍼 컴포넌트 | tableRef/tableEl 존재 여부 확인 | 없음 | handleCopy, ClipboardItem, navigator.clipboard.write |
| OMD-CORE-MarkdownViewer-0008 | MarkdownViewer | CodeBlock | 코드블록을 언어명 헤더 + 복사 버튼 + 모노스페이스 렌더링 | navigator.clipboard.writeText API 존재 여부 | 없음 | handleCopy, navigator.clipboard.writeText |
| OMD-CORE-CssStyleForm-0009 | CssStyleForm | copyProfileToClipboard | 현재 서식 프로필을 JSON 문자열로 클립보드에 복사 | clipboard.writeText 실패 시 catch로 안전 처리 | 없음 | showToast |
| OMD-CORE-MarkdownViewer-0009 | MarkdownViewer | remarkDisableIndentedCode | 4칸 들여쓰기/탭의 코드블록 인식을 차단하는 remark 플러그인 | micromarkExtensions에 codeIndented 비활성화 등록 | 없음 | 없음 |
| OMD-CORE-CssStyleForm-0010 | CssStyleForm | importProfileString | JSON 문자열을 파싱하여 유효성 검증 후 서식 프로필 가져오기 | name/pageStyle/rules 필수 속성 검증, JSON 파싱 실패 시 alert | 없음 | onImportProfile, showToast |
| OMD-CORE-MainEditorApp-0010 | MainEditorApp.tsx | pageViewInit | 마운트 시 localStorage에서 isPageViewEnabled 복원 | None | 이전에 제품 결정으로 비활성화되었으나 인쇄 미리보기 용도로 복원 | localStorage.getItem |
| OMD-CORE-CssStyleForm-0011 | CssStyleForm | handleFileUpload | JSON 서식 파일을 FileReader로 읽어 importProfileString으로 가져오기 | 파일 미선택 시 실행 차단 | 없음 | importProfileString |
| OMD-CORE-MainEditorApp-0011 | MainEditorApp.tsx | handleTogglePageView | 페이지 보기 모드 토글 및 localStorage에 설정 유지 (인쇄 미리보기 용도) | None | 인쇄 미리보기 용도로 복원 (이전에 제품 결정으로 비활성화) | localStorage.setItem |
| OMD-CORE-CssStyleForm-0012 | CssStyleForm | updateMediaAlign | 이미지/동영상/지도 미디어 객체의 정렬 방식(좌/중/우) 업데이트 | isSystemProfile true면 실행 차단 | 없음 | triggerUpdate, getTagRules, getMediaAlign |
| OMD-CORE-CssStyleForm-0013 | CssStyleForm | updateCssRule | 특정 HTML 태그의 단일 CSS 속성 값을 업데이트 | isSystemProfile true면 실행 차단 | 없음 | triggerUpdate, getTagRules |
| OMD-CORE-CssStyleForm-0014 | CssStyleForm | removeCssRule | 특정 태그의 CSS 속성 하나를 제거 | isSystemProfile true면 실행 차단 | 없음 | triggerUpdate, getTagRules |
| OMD-CORE-CssStyleForm-0015 | CssStyleForm | updateTableBorder | 표(table/th/td) 테두리 스타일/두께/색상을 일괄 업데이트 | isSystemProfile true면 실행 차단 | 없음 | triggerUpdate, getTagRules |
| OMD-CORE-CssStyleForm-0016 | CssStyleForm | updateCellPadding | 표 th/td 셀 내부 여백을 일괄 업데이트 | isSystemProfile true면 실행 차단 | 없음 | triggerUpdate, getTagRules |
| OMD-CORE-CssStyleForm-0017 | CssStyleForm | updateTableFontSize | 표(table/th/td) 글자 크기를 일괄 업데이트 또는 제거 | isSystemProfile true면 실행 차단, value가 비면 font-size 속성 제거 | 없음 | triggerUpdate, getTagRules |
| OMD-CORE-CssStyleForm-0018 | CssStyleForm | handlePageStyleChange | 용지 레이아웃 속성(글꼴, 글자 크기, 줄 간격, 용지 크기, 여백 등) 업데이트 | isSystemProfile true면 실행 차단 | paperSize(용지 크기) 선택 기능 추가 | triggerUpdate |
| OMD-CORE-CssStyleForm-0019 | CssStyleForm | handleDeleteClick | 현재 선택된 서식 프로필 삭제 처리 | canDelete 및 onDeleteProfile 존재 여부 확인, confirm 창으로 재확인 | 없음 | onDeleteProfile |
| OMD-CORE-CssStyleForm-0020 | CssStyleForm | updateHrStructure | 수평 구분선(HR) 스타일(선 스타일, 두께, 여백, 너비) 업데이트 | isSystemProfile true면 실행 차단 | 없음 | triggerUpdate |
| OMD-CORE-CssStyleForm-0021 | CssStyleForm | updateCheckboxStructure | 체크박스 구조(완료 효과, 박스 크기, 텍스트 간격) 업데이트 | isSystemProfile true면 실행 차단 | 없음 | triggerUpdate |
| OMD-CORE-CssStyleForm-0022 | CssStyleForm | resetToDefault | 시스템 기본 서식(DEFAULT_PROFILE)으로 즉시 전환 | isSystemProfile true면 실행 차단, confirm 창으로 재확인 | 없음 | onSelectProfile |
| OMD-CORE-MainEditorApp-0025 | MainEditorApp.tsx | tabSizeRef_sync | 활성 CSS 프로필 tabSize 설정에서 tabSizeRef 업데이트 | None | None | parseInt |
| OMD-CORE-MainEditorApp-0029 | MainEditorApp.tsx | handleCheckboxToggle | 미리보기 체크박스 클릭을 에디터 모델 라인 콘텐츠에 동기화 | window.monaco 존재 확인, 라인 범위 검사, 정규식 검증으로 가드 | None | editor.getModel, editor.pushUndoStop, editor.executeEdits |
| OMD-CORE-MainEditorApp-0030 | MainEditorApp.tsx | updateDecorations | 마크다운 구문 강조(제목, 굵게, 기울임, 취소선)를 위한 인라인 Monaco 데코레이션 적용 | editor/window.monaco를 사용할 수 없으면 건너뜀 | None | decorationsCollectionRef.current.set |
| OMD-CORE-MainEditorApp-0032 | MainEditorApp.tsx | darkModeDOMClass | Tailwind 다크 모드를 위해 documentElement에 'dark' 클래스 토글 | SSR 불일치 방지를 위해 마운트 후에만 실행 | None | document.documentElement.classList.add/remove |
| OMD-CORE-MainEditorApp-0034 | MainEditorApp.tsx | darkModePaletteSync | 시각적 일관성 유지를 위해 다크 모드 전환 시 테마 팔레트 자동 전환 | 현재 팔레트가 다크/라이트 모드와 일치하는지 THEME_MAP으로 확인 | None | setThemePalette |
| OMD-CORE-MainEditorApp-0035 | MainEditorApp.tsx | profilesSave | 변경 시마다 사용자 CSS 프로필을 플랫폼 저장소에 유지 | 중복 방지를 위해 저장 전 시스템 프로필 필터링 | None | api.saveProfiles, localStorage.setItem |
| OMD-CORE-MainEditorApp-0036 | MainEditorApp.tsx | activeProfileSave | 활성 CSS 프로필 ID를 localStorage에 유지 | None | None | localStorage.setItem |
| OMD-CORE-MainEditorApp-0041 | MainEditorApp.tsx | previewHighlightLine | 분할 모드에서 에디터의 activeLine과 일치하는 미리보기 줄 강조 | 중복 방지를 위해 모든 강조 먼저 제거, 불일치 위치에 대해 가장 가까운 하위 data-line 찾기 | None | element.classList.add/remove |
| OMD-CORE-MainEditorApp-0042 | MainEditorApp.tsx | postContentScrollCorrection | 콘텐츠 변경/파싱 후 에디터 커서 비율에 맞게 미리보기 스크롤 위치 동기화 | 에디터 커서에서 뷰포트 비율 계산하여 미리보기 스크롤에 동일 비율 적용 | isScrollingRef 잠금으로 스크롤 루프 방지; 정확한 타이밍을 위한 requestAnimationFrame | requestAnimationFrame, editor.getPosition, editor.getTopForLineNumber, editor.getScrollTop |
| OMD-CORE-MainEditorApp-0049 | MainEditorApp.tsx | findLineNumberByHeading | 제목 줄 검색을 utilsEditorActions에 위임 | None | None | utilsEditorActions.findLineNumberByHeading |
| OMD-CORE-MainEditorApp-0051 | MainEditorApp.tsx | handlePreviewClick | 미리보기 클릭 시: 에디터를 일치하는 줄로 스크롤, 미리보기에서 줄 강조 | 중첩 요소 처리를 위해 DOM closest [data-line] 순회 | None | scrollToLine, element.closest, classList.add/remove |
| OMD-CORE-MainEditorApp-0058 | MainEditorApp.tsx | extractHeadings | 마크다운 텍스트를 파싱하여 제목 텍스트 줄(H1-H6) 추출 | 제목 텍스트에서 후행 # 문자 제거 | None | None |
| OMD-CORE-MainEditorApp-0067 | MainEditorApp.tsx | processedContent_lineMap | 미리보기를 위해 마크다운 콘텐츠를 전처리하고 스크롤 동기화를 위한 라인 매핑 생성 | None | None | preprocessMarkdownForPreview |
| OMD-CORE-MainEditorApp-0068 | MainEditorApp.tsx | dynamicCssString | 활성 CSS 프로필에서 타이포그래피, 코드 블록, 표, 체크박스, 구분선, 다크모드 재정의를 포함한 동적 CSS 생성 | 기본 프로필은 빈 문자열 반환; blockquote, hr, color에 대한 다크모드 재정의; h2-h6 font-size 건너뜀(자동 계산) | 박스 중첩 아티팩트 방지를 위한 codeBlock 중첩 border/background 투명 재정의 | None |
| OMD-CORE-MainEditorApp-0074 | MainEditorApp.tsx | toc | 마크다운 제목에서 목차를 생성하고 코드 블록은 건너뜁니다 | BOM 문자를 제거하고 코드 블록 펜스를 감지하여 오탐을 방지합니다 | None | None |
| OMD-EDIT-TableModal-0001 | TableModal | useEffect(mounted) | 클라이언트 마운트 완료 시 mounted 상태 true 설정 (SSR 하이드레이션 보호) | 없음 | 없음 | 없음 |
| OMD-EDIT-StatusBar-0001 | StatusBar | getFullPath | 전체 파일 경로를 workspaceType에 따라 조합하여 반환 | 없음 | 없음 | 없음 |
| OMD-EDIT-ImageModal-0001 | ImageModal | handleInsert | 이미지 경로와 크기/정렬 파라미터를 조합해 마크다운 코드로 삽입 | cleanImagePath가 비어있으면 실행 차단 | 없음 | onInsert, onClose |
| OMD-EDIT-toast-0001 | toast | showToast | 화면 우측 상단에 프리미엄 토마토 테마 Toast 알림을 동적으로 생성하여 표시한다 | SSR 환경에서는 early return, 컨테이너 미존재 시 생성 | 없음 | ToastType |
| OMD-EDIT-CopyButton-0001 | CopyButton | CopyButton | 클립보드 복사 버튼 - 텍스트를 클립보드에 복사하고 2초간 체크 아이콘 표시 | e.stopPropagation()으로 상위 이벤트 전파 차단 | 없음 | 없음 |
| OMD-EDIT-ToastProvider-0001 | ToastProvider | useToast | Toast 컨텍스트 커스텀 훅 - Provider 내부에서 showToast 함수 조회 | context undefined 시 "useToast must be used within a ToastProvider" 에러 throw | 없음 | useContext |
| OMD-EDIT-TablePicker-0001 | TablePicker | handleSelect | hovered 행/열을 1-indexed로 변환하여 onSelect 콜백 호출 후 드롭다운 닫기 | hoveredRow >= 0 && hoveredCol >= 0 조건 검증 | 없음 | onSelect, onClose |
| OMD-EDIT-toolbarConfig-0001 | toolbarConfig.ts | getDefaultHotkeys | TOOLBAR_ITEMS에서 defaultHotkey 맵 생성 | item.defaultHotkey 존재 여부 필터 | 없음 | 없음 |
| OMD-EDIT-editorActions-0001 | editorActions | wrapSelection | 선택된 텍스트를 지정된 문자열로 감싸거나 토글 방식으로 제거한다 | 이전 선택 영역이 없거나 비어 있으면 early return | 없음 | 없음 |
| OMD-EDIT-pasteHandlers-0001 | pasteHandlers | parseHtmlTableToMarkdown | HTML <table> 구문을 표준 마크다운 표 형식으로 변환한다 | DOMParser로 파싱 실패 시 null 반환, table 요소 미존재 시 null 반환 | 없음 | 없음 |
| OMD-EDIT-slashCommands-0001 | slashCommands.ts | getSlashCommands | 기본 슬래시 명령어 배열을 Monaco CompletionItem 형식으로 변환 | 없음 | 없음 | 없음 |
| OMD-EDIT-SettingsModal-0001 | SettingsModal | ModeButton | 화면 보기 모드(편집/분할/미리보기) 전환 버튼 렌더링 | 없음 | 없음 | 없음 |
| OMD-EDIT-MenuBar-0001 | MenuBar | MenuDropdown | 상단 메뉴 드롭다운 렌더링 - 서브메뉴 호버 열림 및 단축키 표시 | 없음 | 없음 | 없음 |
| OMD-EDIT-FormulaModal-0001 | FormulaModal | useEffect (loadHistory) | localStorage에서 최근 사용한 수식 기록을 불러오거나 기본 공식 세트 초기화 | JSON 파싱 실패 시 에러 로그만 출력 | 없음 | 없음 |
| OMD-EDIT-UnifiedTabBar-0001 | UnifiedTabBar | UnifiedTabBar | 통합 탭바 컴포넌트 - 열린 문서 탭 목록 표시, 탭 전환/닫기/추가 기능 제공 | 없음 | 없음 | onSwitchTab, onCloseTab, onCreateNewTab |
| OMD-EDIT-Toolbar-0001 | Toolbar | CopyPreviewButton | 미리보기 복사 버튼 - 클릭 시 onAction 콜백 실행 | 없음 | 없음 | onAction |
| OMD-EDIT-YoutubeModal-0001 | YoutubeModal | handleInsert | 생성된 유튜브 코드를 본문에 삽입하고 입력값 초기화 후 모달 닫기 | videoId가 없으면 경고 토스트 표시 후 조기 반환 | 없음 | showToast, onInsert, onClose |
| OMD-EDIT-USEEDITORHANDLERS-0001 | useEditorHandlers.ts | pageBreak | 커서 위치에 페이지 분할선(<!-- [page-break] -->)을 삽입하여 PDF/인쇄 시 페이지 전환 | editorRef, selection, model 존재 여부 확인 | 없음 | showToast |
| OMD-EDIT-USEEDITORSETTINGS-0001 | useEditorSettings.ts | settingsSyncEffect | isDarkMode/fontSize 등 설정 변경 시 localStorage/chrome/Electron에 동기화 저장 | mounted 상태 미달 시 early return | 없음 | api.saveSettings, chrome.storage.local.set |
| OMD-EDIT-monacoEnv-0001 | monacoEnv.ts | configureMonacoEnvironment | Monaco Editor 워커/로더 경로를 로컬(Electron/Web) 또는 Extension 환경에 맞게 구성 | window 부재, Extension 환경(chrome.runtime.id) 조기 반환 | loader.config try-catch로 미초기화 상태 무시 | 없음 |
| OMD-EDIT-editorUtils-0001 | editorUtils.ts | isAnyListLine | 라인이 마크다운 리스트(순서형/비순서형/체크리스트)인지 판별 | 빈 문자열, 정규식 매칭 (ordered/unordered/checkbox) | 없음 | 없음 |
| OMD-EDIT-TableModal-0002 | TableModal | handleInsert | 선택된 행/열로 마크다운 표 문자열 생성 후 onInsert 콜백 전달 및 모달 닫기 | 없음 | 없음 | onInsert, onClose |
| OMD-EDIT-USEEDITORSETTINGS-0002 | useEditorSettings.ts | restoreSettings | localStorage/chrome.storage/Electron에서 저장된 설정을 로드하여 복원 | 각 스토리지별 로드 실패 시 console.error 후 기본값 유지 | 없음 | getDefaultHotkeys, getDefaultCommands, idb.get, api.loadSettings |
| OMD-EDIT-toolbarConfig-0002 | toolbarConfig.ts | getDefaultCommands | TOOLBAR_ITEMS에서 defaultCommand 맵 생성 | item.defaultCommand 존재 여부 필터 | 없음 | 없음 |
| OMD-EDIT-editorActions-0002 | editorActions | insertBlockTag | 선택 영역 또는 커서 위치를 블록 태그로 감싼다 | editorRef.current가 없으면 early return, selection이 없으면 return | 없음 | 없음 |
| OMD-EDIT-USEEDITORHANDLERS-0002 | useEditorHandlers.ts | toggleFloatingToolbar | 플로팅 툴바의 표시/숨김을 토글하고 커서 위치에 배치 | editorRef, position, visiblePos 존재 여부 확인 | 없음 | 없음 |
| OMD-EDIT-toast-0002 | toast | ToastType | Toast 알림의 유형을 정의하는 유니온 타입을 선언한다 | 'success' \\| 'error' \\| 'info' \\| 'warning' 네 가지 값만 허용 | 없음 | showToast |
| OMD-EDIT-pasteHandlers-0002 | pasteHandlers | fixMarkdownTable | 여러 줄로 쪼개진 마크다운 표 셀을 한 행으로 병합하여 보정한다 | text에 '\\|'가 없으면 early return, 현재 행이 '\\|'로 끝날 때까지 병합 | 없음 | 없음 |
| OMD-EDIT-FormulaModal-0002 | FormulaModal | useEffect (livePreview) | LaTeX 수식을 KaTeX로 실시간 렌더링하여 미리보기 영역에 표시 | isOpen이 false면 실행 생략, katex 미로드 시 로딩 메시지 표시 | requestAnimationFrame으로 DOM 안전 타이밍 보장 | katex.render |
| OMD-EDIT-TablePicker-0002 | TablePicker | TablePicker | 표 크기 선택 드롭다운 컴포넌트 - 10x10 그리드 렌더링 및 사용자 인터랙션 처리 | 없음 | 없음 | handleSelect |
| OMD-EDIT-UnifiedTabBar-0002 | UnifiedTabBar | EditorTab | 에디터 탭 인터페이스 - id, name, path, content, isModified 등 탭 상태 정의 | 없음 | 없음 | 없음 |
| OMD-EDIT-ToastProvider-0002 | ToastProvider | ToastProvider | 전역 Toast 컨텍스트 Provider - 자식 컴포넌트에 showToast 유틸리티 제공 | 없음 | 없음 | showToast (from utils) |
| OMD-EDIT-Toolbar-0002 | Toolbar | HeadingSpinButton | 제목 레벨 조절 스핀 버튼 - ▲/▼ 버튼으로 headingLevel 조정 및 H 적용 | headingLevel 1~6 범위 제한 (disabled 처리) | 없음 | handleHeadingUp, handleHeadingDown, onHeadingSelect |
| OMD-EDIT-YoutubeModal-0002 | YoutubeModal | generatedCode | iframe 또는 썸네일 방식에 따른 최종 HTML/마크다운 코드 생성 | videoId가 없으면 빈 문자열 반환 | 없음 | 없음 |
| OMD-EDIT-editorUtils-0002 | editorUtils.ts | stripFrontmatter | YAML frontmatter(--- 블록)를 마크다운 텍스트에서 제거 | 없음 | 없음 | 없음 |
| OMD-EDIT-MenuBar-0002 | MenuBar | useEffect (click outside) | 메뉴 외부 클릭 시 activeMenu를 닫는 클릭 감지 리스너 설치 | menuRef.contains로 클릭 대상이 메뉴 내부인지 확인 | 없음 | setActiveMenu |
| OMD-EDIT-StatusBar-0002 | StatusBar | t | 다국어 키-값 조회 함수 - localTranslations에서 key에 해당하는 번역 문자열 반환 | dict[key]가 없으면 key 자체를 fallback으로 반환 | 없음 | 없음 |
| OMD-EDIT-SettingsModal-0002 | SettingsModal | ThemeButton | 설정 창의 토글 버튼(켜기/끄기) 렌더링 | 없음 | 없음 | 없음 |
| OMD-EDIT-ImageModal-0002 | ImageModal | previewSrc | cleanImagePath를 media:// 로컬 프록시 URL로 변환하여 미리보기 이미지 로드 보장 | 외부 URL, blob, data URL은 원본 유지; 로컬 경로만 변환 | media://?url= 접두사를 media://local/serve?url=로 정정 | 없음 |
| OMD-EDIT-TableModal-0003 | TableModal | TableModal | 표 삽입 모달 - 10x10 그리드 UI로 마우스 표 크기 선택 후 마크다운 코드 생성 | isOpen false 또는 mounted false 시 null 반환으로 조기 종료 | 없음 | handleInsert, createPortal |
| OMD-EDIT-FormulaModal-0003 | FormulaModal | insertLatex | 템플릿/기호 버튼 클릭 시 LaTeX 코드를 텍스트 영역 커서 위치에 삽입 | textareaRef 존재 여부 확인 후 분기 처리 | setTimeout 0ms으로 상태 업데이트 후 커서 위치 재설정 | 없음 |
| OMD-EDIT-MenuBar-0003 | MenuBar | handleThemeSelect | 테마 선택 시 onThemeChange 콜백 호출 | onThemeChange가 존재할 때만 호출 | 없음 | onThemeChange |
| OMD-EDIT-USEEDITORSETTINGS-0003 | useEditorSettings.ts | restoreEffect | 마운트 시 restoreSettings를 호출하여 모든 사용자 설정 초기 복원 | editorRef/monaco 존재 시 Monaco 에디터 테마 적용 | 없음 | restoreSettings |
| OMD-EDIT-toolbarConfig-0003 | toolbarConfig.ts | getSlashCommands | TOOLBAR_ITEMS를 Monaco 슬래시 자동완성 항목으로 변환 (모달/액션/플레이스홀더 처리) | EXCLUDED_FROM_SLASH 필터, modalKeys/actionOnlyKeys 분기, 플레이스홀더 우선순위 매칭 | InsertAsSnippet 하이라이트 방지, filterText 한글/영문 검색 지원 | 없음 |
| OMD-EDIT-editorUtils-0003 | editorUtils.ts | getIndentLevel | 라인의 들여쓰기 수준을 스페이스 개수 기준으로 계산 (탭=4) | 빈 문자열, 탭 문자 4칸 변환 | 없음 | 없음 |
| OMD-EDIT-ImageModal-0003 | ImageModal | cleanImagePath | 입력된 이미지 경로에서 순수 URL 추출 (마크다운/HTML 태그 래핑 제거) | media:// 프로토콜 래핑 해제; 외곽 괄호/따옴표 제거 | media://local/serve?url= 내부의 중첩 URL을 추출하는 fallback 로직 | 없음 |
| OMD-EDIT-USEEDITORHANDLERS-0003 | useEditorHandlers.ts | help | 도움말 문서를 Electron/웹 환경에서 읽어와 화면에 표시 | api.readFromPath / fetch 실패 시 오류 메시지 표시 | 없음 | stripFrontmatter, setHelpTitle, setHelpContent |
| OMD-EDIT-StatusBar-0003 | StatusBar | StatusBar | 상태 표시줄 컴포넌트 - 글자 수, 단어 수, 저장 상태, 라인/컬럼 정보, 테마, 프리뷰 모드 표시 | StatusBarProps 인터페이스로 props 타입 검증 | 없음 | getFullPath, t |
| OMD-EDIT-editorActions-0003 | editorActions | findLineNumberByHeading | 문서 내에서 특정 제목 텍스트가 위치한 라인 번호를 탐색한다 | content나 heading이 falsy이면 1 반환, 매칭 실패 시에도 1 반환 | 없음 | 없음 |
| OMD-EDIT-pasteHandlers-0003 | pasteHandlers | sanitizePastedText | 붙여넣기 문자열을 마크다운에 적합하도록 정제한다 | 줄바꿈 통일, 유령 문자 제거, HTML 찌꺼기 제거, TSV 자동 변환 | 없음 | 없음 |
| OMD-EDIT-Toolbar-0003 | Toolbar | ToolbarButton | 툴바 개별 버튼 - bold/italic/underline/active 스타일링 및 마우스다운 이벤트 처리 | e.preventDefault()로 포커스 유실 방지 | 없음 | onAction |
| OMD-EDIT-SettingsModal-0003 | SettingsModal | handleSaveLicense | 라이선스 키를 localStorage, chrome.storage, electronAPI에 동시 저장 | 각 storage API 존재 여부 확인 후 저장 | 없음 | setLicenseKey, localStorage.setItem, chrome.storage.local.set, api.saveLicense |
| OMD-EDIT-YoutubeModal-0003 | YoutubeModal | embedUrl | videoId로 YouTube iframe embed URL 생성 (관련 영상/로고 제거 옵션 포함) | videoId가 없으면 빈 문자열 반환 | 없음 | 없음 |
| OMD-EDIT-SettingsModal-0004 | SettingsModal | handleThemeSelect | 테마 선택 시 DOM 클래스/로컬스토리지/다크모드/onThemeChange를 일괄 적용 | 테마 ID가 SEVEN_THEMES에 존재하는지 확인 | 없음 | setIsDarkMode, onThemeChange, localStorage.setItem |
| OMD-EDIT-YoutubeModal-0004 | YoutubeModal | useEffect(shorts) | 유튜브 쇼츠 URL 감지 시 자동으로 플레이어 크기 315x560(세로 최적화) 설정 | 없음 | 없음 | setWidth, setHeight |
| OMD-EDIT-MenuBar-0004 | MenuBar | MenuBar | 상단 메뉴바 렌더링 - 파일/편집/도구/도움말 드롭다운 메뉴 제공 | previewMode가 'preview'일 때 편집 메뉴 숨김 | PDF/HTML 내보내기 → PRINT(OS 인쇄) + HTML 별도 유지; 번역키 pdf 제거, print/html/epub/png | MenuDropdown, dispatch, setIsSidebarOpen, setIsToolbarOpen, setPreviewMode |
| OMD-EDIT-ImageModal-0004 | ImageModal | handlePasteEvent | 클립보드 이미지를 로컬 assets 폴더에 저장하고 경로를 입력 필드에 설정 | 클립보드에 이미지 타입 아이템이 없으면 early return | 없음 | api.saveImage, showToast, setImagePath |
| OMD-EDIT-FormulaModal-0004 | FormulaModal | handleInsertToEditor | 작성한 LaTeX 수식을 에디터에 삽입하고 최근 기록에 저장 | latex 미입력 시 실행 차단, displayMode에 따라 $$/$ 래핑 분기 | 없음 | onInsert |
| OMD-EDIT-editorActions-0004 | editorActions | insertAtCursor | 현재 커서 위치 또는 마지막 선택 영역에 텍스트를 주입한다 | editorRef.current가 없으면 early return, selection 검증 후 처리 | 없음 | 없음 |
| OMD-EDIT-Toolbar-0004 | Toolbar | ToolbarGroup | 툴바 그룹 컨테이너 - 자식 버튼들과 하단 라벨 표시 | 없음 | 없음 | 없음 |
| OMD-EDIT-USEEDITORHANDLERS-0004 | useEditorHandlers.ts | deleteTableRow | 편집 중인 표에서 현재 커서가 위치한 행을 삭제 | editorRef, position, model 존재 여부 및 표 행 여부 확인 | 없음 | showToast |
| OMD-EDIT-editorUtils-0004 | editorUtils.ts | preprocessMarkdownForPreview | 마크다운 전처리 파이프라인 — frontmatter 제거, 탭 보정, 한글 강조, HTML 이스케이프, 리스트 간격, 개행 버퍼 | 빈 content, 코드 블록 내부/외부 분기, page-break 특수 태그, ordered/unordered list indent | 한글 붙여쓰기 강조 깨짐 방지(\u200B), html2canvas ::before/counter() 미지원 보정 | stripFrontmatter, isAnyListLine, getIndentLevel |
| OMD-EDIT-USEEDITORSETTINGS-0004 | useEditorSettings.ts | handleThemeChange | 테마 변경 시 팔레트 ID와 다크모드 여부를 동시에 갱신 | THEME_MAP_REF에 없는 themeId는 무시 | 없음 | 없음 |
| OMD-EDIT-SettingsModal-0005 | SettingsModal | useEffect (mounted) | 마운트 시 마운트 상태 설정 및 세션 복원 설정 로드 | 없음 | 없음 | setMounted, setRestoreSession, localStorage.getItem |
| OMD-EDIT-ImageModal-0005 | ImageModal | useEffect (initialData mapping) | 모달 열림 시 initialData가 있으면 각 필드에 매핑, 없으면 초기화 | isOpen이 true일 때만 실행 | 없음 | setImagePath, setImageAlt, setImageWidth, setImageHeight, setImageAlign |
| OMD-EDIT-YoutubeModal-0005 | YoutubeModal | videoId | 유튜브 URL/iframe에서 비디오 ID 추출 (정규식 기반 파싱) | inputUrl이 비어있으면 빈 문자열 반환 | 없음 | 없음 |
| OMD-EDIT-editorUtils-0005 | editorUtils.ts | wrapMathWithBold | KaTeX 수식에 \boldsymbol{...} 래핑하여 칠판 볼드체 렌더링 보장 | 이미 \boldsymbol/\mathbf 포함 여부 체크, 빈 문자열 처리 | 없음 | 없음 |
| OMD-EDIT-FormulaModal-0005 | FormulaModal | TabBtn | 수식 에디터 좌측 패널의 탭 버튼 (템플릿/기호/최근) 컴포넌트 | active 상태에 따라 활성화 스타일 및 그림자 효과 분기 | 없음 | 없음 |
| OMD-EDIT-Toolbar-0005 | Toolbar | handleHeadingDown | 제목 레벨 감소 핸들러 - headingLevel 6 미만일 때 +1 | headingLevel < 6 조건 검사 | 없음 | setHeadingLevel |
| OMD-EDIT-USEEDITORHANDLERS-0005 | useEditorHandlers.ts | insertTableRow | 편집 중인 표 아래에 새 행을 추가하여 데이터 입력 공간 확보 | editorRef, position, model 존재 여부 및 표 행 여부 확인 | 없음 | showToast |
| OMD-EDIT-USEEDITORSETTINGS-0005 | useEditorSettings.ts | useEditorSettings | 에디터 사용자 설정(테마, 단축키, 폰트크기 등)을 관리하고 영구 저장소에 동기화 | 각 스토리지 로드 실패 시 기본값 fallback | 없음 | getDefaultHotkeys, getDefaultCommands, idb.get, api.loadSettings, api.saveSettings |
| OMD-EDIT-editorActions-0005 | editorActions | scrollToLine | Monaco 에디터 내에서 특정 라인 번호로 스크롤하고 포커스를 이동시킨다 | editorRef.current가 없으면 early return | 없음 | 없음 |
| OMD-EDIT-Toolbar-0006 | Toolbar | handleHeadingUp | 제목 레벨 증가 핸들러 - headingLevel 1 초과일 때 -1 | headingLevel > 1 조건 검사 | 없음 | setHeadingLevel |
| OMD-EDIT-YoutubeModal-0006 | YoutubeModal | useEffect(mounted) | 클라이언트 마운트 완료 시 mounted 상태 true 설정 (SSR 하이드레이션 보호) | 없음 | 없음 | 없음 |
| OMD-EDIT-SettingsModal-0006 | SettingsModal | SettingsModal | 환경 설정 모달 - 일반 설정, 정품 인증, 단축키/명령어 테이블, 테마 선택 제공 | isOpen/mounted false 시 null 반환 | 없음 | handleThemeSelect, handleSaveLicense, ThemeButton, ModeButton |
| OMD-EDIT-MainEditorApp-0006 | MainEditorApp.tsx | contentRef_sync | 클로저에서 사용하기 위해 contentRef.current를 content 상태와 동기화 | 스테일 클로저가 ref에서 이전 콘텐츠를 읽는 것을 방지 | None | None |
| OMD-EDIT-FormulaModal-0006 | FormulaModal | SymbolPreview | LaTeX 기호 미리보기용 메모이즈드 컴포넌트 - RAF로 DOM 안전 렌더링 | katex 미로드 시 폴백 텍스트 표시, throwOnError=false로 렌더링 오류 방어 | wrapMathWithBold 헬퍼로 기호 가독성 강화 | wrapMathWithBold, katex.render |
| OMD-EDIT-USEEDITORHANDLERS-0006 | useEditorHandlers.ts | image | 이미지 마크다운 구문을 파싱하여 이미지 편집 모달 열기 | editorRef, selection, model 존재 여부 확인 | setEditingImageInfo, setIsImageModalOpen 매개변수 누락으로 이미지 모달 미오픈 수정 | setEditingImageInfo, setIsImageModalOpen |
| OMD-EDIT-ImageModal-0006 | ImageModal | useEffect (mounted) | 클라이언트 마운트 완료 상태 설정으로 포탈 렌더링 hydration mismatch 방지 | 없음 | 없음 | setMounted |
| OMD-EDIT-ImageModal-0007 | ImageModal | ImageModal | 이미지 삽입 모달 - URL/파일/클립보드 이미지 경로 입력 및 크기/정렬 설정 | isOpen/mounted false 시 null 반환; cleanImagePath가 없으면 삽입 버튼 비활성화 | media://?url= 접두사 정정; 클립보드 이미지 base64 저장 파이프라인 | handleInsert, handlePasteEvent, handleFileChange, cleanImagePath, previewSrc |
| OMD-EDIT-YoutubeModal-0007 | YoutubeModal | YoutubeModal | 유튜브 영상 삽입 모달 - URL 입력, ID 추출, iframe/썸네일 코드 생성, 미리보기 제공 | isOpen false 또는 mounted false 시 null 반환으로 조기 종료 | 없음 | videoId, embedUrl, generatedCode, handleInsert, showToast, createPortal |
| OMD-EDIT-FormulaModal-0007 | FormulaModal | useEffect (SymbolPreview render) | LaTeX 기호를 KaTeX로 실시간 렌더링하여 SymbolPreview에 표시 | containerRef 및 katex 존재 여부 확인 후 안전하게 렌더링 | 없음 | katex.render |
| OMD-EDIT-Toolbar-0007 | Toolbar | t | 다국어 키-값 조회 함수 - localTranslations에서 key에 해당하는 번역 문자열 반환 | dict[key]가 없으면 key 자체를 fallback으로 반환 | 없음 | 없음 |
| OMD-EDIT-USEEDITORHANDLERS-0007 | useEditorHandlers.ts | saveAs | 새 경로/파일명으로 문서를 다른 이름으로 저장 | Electron/File System Access/폴더 선택 각 환경별 예외 처리 | 없음 | refreshFileList, showToast, setPromptConfig |
| OMD-EDIT-Toolbar-0008 | Toolbar | Toolbar | 에디터 상단 툴바 컴포넌트 - 서식/제목/문단/삽입/고급/보기/설정 그룹 제공 | ToolbarProps 인터페이스로 props 타입 검증 | 없음 | ToolbarGroup, ToolbarButton, HeadingSpinButton, CopyPreviewButton, useToast |
| OMD-EDIT-MainEditorApp-0008 | MainEditorApp.tsx | previewModeRef_sync | previewModeRef.current를 previewMode 상태와 동기화 | 이벤트 핸들러 및 비동기 콜백에서 스테일 ref 방지 | None | None |
| OMD-EDIT-USEEDITORHANDLERS-0008 | useEditorHandlers.ts | save | 현재 문서를 Electron/웹/브라우저 환경에 맞게 저장 | fileNode 경로/핸들 존재 여부, 저장 실패 시 fallback 처리 | 없음 | refreshFileList, showToast, vfsWriteFile, setPromptConfig |
| OMD-EDIT-MainEditorApp-0009 | MainEditorApp.tsx | helpContent_forces_preview | 도움말 콘텐츠가 설정되면 미리보기 모드 강제, 에디터 마운트 비활성화 | 도움말 오버레이와 에디터 콘텐츠 충돌 방지 | None | setPreviewModeRaw |
| OMD-EDIT-USEEDITORHANDLERS-0009 | useEditorHandlers.ts | newFile | 새 빈 문서를 생성하고 워크스페이스 사이드바를 활성화 | 없음 | 없음 | updateContent, showToast |
| OMD-EDIT-USEEDITORHANDLERS-0010 | useEditorHandlers.ts | copyAll | 에디터 전체 마크다운 내용을 클립보드에 복사 | contentRef 존재 여부, 클립보드 API 실패 시 오류 토스트 | 없음 | showToast |
| OMD-EDIT-USEEDITORHANDLERS-0011 | useEditorHandlers.ts | cleanDoc | 문서 내 HTML 브레이크 태그 등을 일괄 정리하여 순수 마크다운 유지 | editorRef 존재 여부, 정리할 내용이 없으면 안내 메시지 | 없음 | sanitizePastedText, showToast |
| OMD-EDIT-MainEditorApp-0012 | MainEditorApp.tsx | tabMetadata_sync | 현재 파일 정보가 변경될 때 탭 메타데이터(fileName, path, node) 동기화 | None | None | setTabs |
| OMD-EDIT-USEEDITORHANDLERS-0012 | useEditorHandlers.ts | insertText | 커서 위치에 임의 텍스트를 삽입 (슬래시 명령어 등에서 호출) | editorRef 존재 여부 확인 | 없음 | 없음 |
| OMD-EDIT-USEEDITORHANDLERS-0013 | useEditorHandlers.ts | footnote | 각주 참조 및 정의를 문서 끝에 자동 생성하여 삽입 | editorRef, monaco, model, selection, position 존재 여부 확인 | 없음 | showToast |
| OMD-EDIT-MainEditorApp-0013 | MainEditorApp.tsx | searchOpen_sidebar_behavior | 글로벌 검색이 열릴 때 사이드바 열기 및 검색 탭으로 전환 | 검색이 닫힐 때 (여전히 검색 탭인 경우) 사이드바 탭을 TOC로 재설정 | None | setIsSidebarOpen, setSidebarTab |
| OMD-EDIT-USEEDITORHANDLERS-0014 | useEditorHandlers.ts | useEditorHandlers | 에디터 주요 액션 핸들러(저장, 내보내기, 서식 삽입 등)를 통합 관리 | 각 핸들러별 editorRef/selection/model 방어 로직; previewRef 누락 시 export early return | previewRef 매개변수 미전달로 인한 export 함수 ReferenceError 수정; setIsSettingsModalOpen 누락으로 settings 모달 미오픈 수정; print 핸들러 추가(PDF/HTML → OS 인쇄 통합) | exportPDF, exportHTML, exportEPUB, exportPNG, vfsWriteFile, stripFrontmatter, sanitizePastedText, previewRef, setIsSettingsModalOpen |
| OMD-EDIT-MainEditorApp-0021 | MainEditorApp.tsx | currentFileNodeRef_sync | 핸들러에서 스테일 클로저 방지를 위해 currentFileNodeRef 동기화 | WBS CORE-02 스테일 클로저 방지 시스템의 일부 | None | None |
| OMD-EDIT-MainEditorApp-0022 | MainEditorApp.tsx | currentFileNameRef_sync | 핸들러에서 스테일 클로저 방지를 위해 currentFileNameRef 동기화 | WBS CORE-02 스테일 클로저 방지의 일부 | None | None |
| OMD-EDIT-MainEditorApp-0023 | MainEditorApp.tsx | workspaceTypeRef_sync | 핸들러에서 스테일 클로저 방지를 위해 workspaceTypeRef 동기화 | WBS CORE-02 스테일 클로저 방지의 일부 | None | None |
| OMD-EDIT-MainEditorApp-0024 | MainEditorApp.tsx | rootFolderRef_sync | 핸들러에서 스테일 클로저 방지를 위해 rootFolderRef 동기화 | WBS CORE-02 스테일 클로저 방지의 일부 | None | None |
| OMD-EDIT-MainEditorApp-0026 | MainEditorApp.tsx | setPreviewMode | 에디터 콘텐츠 보존, css-style 웰컴 탭 자동 생성 및 도움말 콘텐츠 가드와 함께 미리보기 모드 전환 | css-style 잠금 중 모드 변경 방지, 전환 전 에디터 콘텐츠 강제 동기화, helpContent 재정의 차단 | 콘텐츠 손실 방지를 위한 모드 전환 전 100ms 디바운스 드레인; isEditorMountedRef 원자적 제어 | editorRef.current.getValue, setContent, setPreviewModeRaw, setHelpContent, createNewTab, switchTab, clearTimeout |
| OMD-EDIT-MainEditorApp-0027 | MainEditorApp.tsx | closeTab | 저장되지 않은 변경사항 확인, 모델 폐기 및 css-style 모드 자동 종료와 함께 탭 닫기 | 이벤트 stopPropagation, 수정된 탭 확인, Monaco 모델 폐기, 다음 탭으로 전환 또는 빈 탭 생성 | None | setTabs, switchTab, createNewTab, setConfirmConfig, tab.model.dispose |
| OMD-EDIT-MainEditorApp-0028 | MainEditorApp.tsx | autoSaveRef_sync | 자동 저장 로직에서 스테일 클로저 방지를 위해 autoSaveRef를 autoSave 상태와 동기화 | 스테일 클로저 방지 시스템의 일부 | None | None |
| OMD-EDIT-MainEditorApp-0031 | MainEditorApp.tsx | previewWheelSync | 분할 모드에서 미리보기 영역의 마우스 휠 이벤트를 에디터 스크롤로 전달 | 기본 스크롤 중지를 위해 passive:false로 e.preventDefault | None | editor.setScrollTop |
| OMD-EDIT-MainEditorApp-0033 | MainEditorApp.tsx | editorSettingsSync | 설정 또는 에디터 마운트 변경 시 테마, 폰트 크기, 줄 바꿈 재적용 | 레이스 컨디션 방지를 위해 mounted && isEditorReady로 가드 | 테마 변경 후 찌그러짐 방지를 위한 requestAnimationFrame layout() | monaco.editor.setTheme, editor.updateOptions, requestAnimationFrame |
| OMD-EDIT-MainEditorApp-0040 | MainEditorApp.tsx | dynamicTitleBar | 창 탭 식별을 위해 현재 파일 이름으로 document.title 업데이트 | None | None | None |
| OMD-EDIT-MainEditorApp-0043 | MainEditorApp.tsx | handleMouseMove | 사이드바 크기 조정 드래그 mousemove 이벤트 처리 | 너비를 150-600px 사이로 제한 | None | setSidebarWidth, localStorage.setItem |
| OMD-EDIT-MainEditorApp-0044 | MainEditorApp.tsx | stopResizing | 사이드바 크기 조정 종료: 리스너 제거, 커서 및 user-select 복원 | None | None | document.removeEventListener, document.body.style.cursor/userSelect |
| OMD-EDIT-MainEditorApp-0045 | MainEditorApp.tsx | startResizing | 사이드바 크기 조정 시작: 리스너 추가, col-resize 커서 설정 | None | None | document.addEventListener, document.body.style |
| OMD-EDIT-MainEditorApp-0048 | MainEditorApp.tsx | insertAtCursor | 커서 위치 텍스트 삽입을 utilsEditorActions에 위임 | None | None | utilsEditorActions.insertAtCursor |
| OMD-EDIT-MainEditorApp-0050 | MainEditorApp.tsx | scrollToLine | 에디터 특정 줄로 스크롤을 utilsEditorActions에 위임 | None | None | utilsEditorActions.scrollToLine |
| OMD-EDIT-MainEditorApp-0052 | MainEditorApp.tsx | insertBlockTag | 블록 태그 감싸기를 utilsEditorActions에 위임 | None | None | utilsEditorActions.insertBlockTag |
| OMD-EDIT-MainEditorApp-0053 | MainEditorApp.tsx | wrapSelection | 선택 영역 감싸기/풀기를 utilsEditorActions에 위임 | None | None | utilsEditorActions.wrapSelection |
| OMD-EDIT-MainEditorApp-0054 | MainEditorApp.tsx | insertLink | 커서에 마크다운 링크 삽입, URL 플레이스홀더 텍스트 자동 선택 | 현재 선택이 비어있으면 lastSelectionRef 사용; 선택 텍스트와 빈 경우 모두 처리 | None | editor.focus, editor.getSelection, editor.executeEdits, editor.setSelection |
| OMD-EDIT-MainEditorApp-0060 | MainEditorApp.tsx | handleDocLinkSelect | 커서에 [[relativePath#heading\\|text]] 문서 간 링크 삽입 | 완료 시 모든 선택기 상태 초기화; lastSelectionRef로 폴백 | None | getRelativePath, editor.focus, editor.getSelection, editor.executeEdits |
| OMD-EDIT-MainEditorApp-0061 | MainEditorApp.tsx | parseHtmlTableToMarkdown | HTML 표를 마크다운으로 변환하는 작업을 paste handlers에 위임 | None | None | utilsPasteHandlers.parseHtmlTableToMarkdown |
| OMD-EDIT-MainEditorApp-0062 | MainEditorApp.tsx | sanitizePastedText | 붙여넣기 텍스트 정제를 paste handlers에 위임 | None | None | utilsPasteHandlers.sanitizePastedText |
| OMD-EDIT-MainEditorApp-0063 | MainEditorApp.tsx | fixMarkdownTable | 마크다운 표 수정을 paste handlers에 위임 | None | None | utilsPasteHandlers.fixMarkdownTable |
| OMD-EDIT-MainEditorApp-0064 | MainEditorApp.tsx | handleEditorPaste | 붙여넣기 이벤트 처리: 이미지 업로드, HTML 표 변환, 텍스트 정제 | 이미지 붙여넣기 시 기본 동작 차단, 일반 텍스트 폴백 전 HTML 표 시도 | None | fetch, FileReader, parseHtmlTableToMarkdown, sanitizePastedText, fixMarkdownTable, insertAtCursor, updateContent, showToast |
| OMD-EDIT-MainEditorApp-0065 | MainEditorApp.tsx | applyLinePrefix | 선택된 줄에 순서 목록/글머리 기호/인용구/체크리스트 접두사 적용 | 이전 비어있지 않은 줄(최대 10줄)에서 연속 순서 번호 계산; 중첩 인용구 처리 | 구문 강조 새로고침을 위해 편집 후 forceTokenization | editor.getSelection, editor.executeEdits, model.forceTokenization, editor.layout |
| OMD-EDIT-MainEditorApp-0066 | MainEditorApp.tsx | removePrefix | 선택 영역에서 마크다운 서식 태그 제거: 굵게, 기울임, 취소선, 코드, 링크, 제목, 목록 | 빈 선택 영역을 전체 줄로 확장 처리; 정규식 기반 정리로 선행 공백 보존 | 구문 강조 새로고침을 위해 편집 후 forceTokenization | editor.getSelection, editor.executeEdits, model.forceTokenization, editor.layout |
| OMD-EDIT-MainEditorApp-0069 | MainEditorApp.tsx | quickWrap | 선택 영역 또는 현재 줄을 제목/인용구/코드 서식으로 빠르게 감쌉니다 | 선택 영역이 없으면 전체 줄 자동 선택; Monaco 가드 확인 | None | wrapSelection, applyLinePrefix, insertBlockTag, editor.focus |
| OMD-EDIT-MainEditorApp-0070 | MainEditorApp.tsx | dispatchCommand | 에디터 포커스 가드와 함께 EditorCommandType을 핸들러 메서드로 라우팅하는 통합 명령 디스패처 | 브라우저 포커스 손실 방지를 위한 entry에서 editor.focus(); 모달 명령 후 50ms 비동기 forceTokenization | 문자 겹침 수정을 위한 50ms setTimeout 토큰화 + 레이아웃 (WBS SYNC-02); EXPORT_PDF → PRINT(OS 인쇄), EXPORT_HTML 별도 유지 | handlers.newFile/save/saveAs/exit/print/exportHTML/exportEPUB/exportPNG/openExport, handlers.zoomIn/zoomOut/undo/redo/find/replace/globalSearch/settings/about/help/license, handlers.toggleFloatingToolbar/cleanDoc/copyAll, handlers.bold/italic/inlineCode/underline/strikethrough/h1-h6/hr/orderedList/list/quote/check/removePrefix, handlers.link/doclink/image/video/now/map/table/quickTable/insertTableRow/deleteTableRow/code/chart/pageBreak/math, handlers.quickWrap, selectRootFolder, setPreviewMode, setIsToolbarOpen, setIsSidebarOpen, setThemePalette, setIsDarkMode |
| OMD-EDIT-MainEditorApp-0071 | MainEditorApp.tsx | mapIdToCommandType | 툴바 항목의 camelCase ID를 명시적 재정의 테이블로 EditorCommandType UPPER_SNAKE_CASE에 매핑 | 불일치 ID에 대한 명시적 매핑(divider→HR, clear→REMOVE_PREFIX, calendar→NOW); 자동 UPPER_SNAKE 폴백 | None | None |
| OMD-EDIT-MainEditorApp-0072 | MainEditorApp.tsx | hotkeyRegistration | 모든 TOOLBAR_ITEMS에 대해 사용자 정의 단축키(Ctrl+S/Ctrl+Shift+S 포함)로 Monaco 에디터 액션 등록 | 재실행 시 이전 disposables 해제; 키바인딩 문자열을 Monaco KeyMod/KeyCode로 파싱 | None | TOOLBAR_ITEMS.forEach, editor.addAction, monaco.editor.defineTheme, monaco.editor.setTheme, updateDecorations, handleEditorPaste |
| OMD-EDIT-MainEditorApp-0073 | MainEditorApp.tsx | globalKeydownHandler | 전역 키보드 단축키 처리기: S/O의 브라우저 기본 동작 차단, Escape로 플로팅 툴바 닫기, 사용자 정의 단축키 라우팅 | 캡처 단계 리스너; Monaco 외부 폼 요소 이벤트 무시; IME 229 keyCode 복구; 에디터 포커스 체크 전 글로벌 전용 단축키 감지 | Ctrl+S/O 브라우저 기본 저장/열기 다이얼로그 preventDefault 처리; 한글 입력을 위한 keyCode 229 IME 조합 복구 | dispatchCommand, mapIdToCommandType, setFloatingToolbar |
| OMD-FILE-MainEditorApp-0001 | MainEditorApp.tsx | getMdFiles | FileNode 트리를 순회하여 모든 .md 파일을 재귀적으로 수집합니다 | None | None | None |
| OMD-FILE-vfsHelper-0001 | vfsHelper.ts | getVfsFiles | localStorage에서 가상 파일 목록 조회, 없으면 Welcome.md로 초기화 | window 부재, JSON 파싱 오류 시 빈 배열 | 없음 | saveVfsFiles, vfsWriteFile, msg.error |
| OMD-FILE-GlobalSearch-0001 | GlobalSearch | GlobalSearch | 워크스페이스/폴더/단일 문서 전체를 검색하고 결과를 클릭 시 파일로 이동 | 150ms 디바운스, 검색어 미입력 시 결과 초기화 | 없음 | handleSelectFolder, scanDirectory |
| OMD-FILE-USEFILEEXPLORER-0001 | useFileExplorer.ts | rootFolderRefreshEffect | rootFolder 변경 시 파일 목록 자동 새로고침 또는 초기화 | rootFolder null 시 fileList를 빈 배열로 초기화 | 없음 | refreshFileList, setFileList |
| OMD-FILE-USEEDITORTABS-0001 | useEditorTabs.ts | createNewTab | 새 탭을 생성하고 Monaco 모델을 만들어 에디터에 연결 | monaco 미존재 시 모델 없이 탭만 생성 | 없음 | getWelcomeContent, setContent, setTabs, setActiveTabId, setCurrentFileName, setCurrentFileNode |
| OMD-FILE-MergeModal-0001 | MergeModal | handleMerge | 선택한 파일들을 병합하여 새 파일로 저장 (로컬/브라우저 모드 대응) | targetName이 비어있으면 경고 후 early return | 없음 | showToast, fetch, refreshParent, onClose, openFile |
| OMD-FILE-FileTreeItem-0001 | FileTreeItem | FileTreeItem | 좌측 파일 탐색기 트리의 단일 노드로, 폴더 열기/파일 열기/드래그 이동/CRUD 지원 | 백엔드/VFS 노드 kind 자동 호환 변환, isMergeMode 시 선택 모드 전환 | 없음 | FileTreeItem (재귀), PromptModal, getFileIcon |
| OMD-FILE-LeftSidebar-0001 | LeftSidebar | onFileOpenAndJump | 전역 검색 결과 파일을 열고 지정 줄로 이동 | 파일 경로를 트리에서 재귀 탐색 후 없으면 dummy/브라우저 핸들로 fallback | 없음 | scrollToLine, openFile, findNodeRecursively, showToast |
| OMD-FILE-USEFILEEXPLORER-0002 | useFileExplorer.ts | saveFile | Electron/웹/브라우저 File System Access 환경에 파일을 물리적으로 저장 | targetFile null 시 false 반환, 권한 거부 시 오류 토스트 | 없음 | vfsWriteFile, api.saveFile, showToast, setTabs |
| OMD-FILE-LeftSidebar-0002 | LeftSidebar | handleLazyLoad | FileSystem API 또는 로컬 API로 폴더 내 .md 파일 목록을 지연 로딩 | 파일 확장자가 .md/.markdown인 경우만 포함 | 없음 | fetch, getVfsFiles, listDirectory |
| OMD-FILE-USEEDITORTABS-0002 | useEditorTabs.ts | switchTab | 특정 탭으로 전환하며 스크롤 위치와 Monaco 모델을 복원 | 대상 탭 미존재 시 early return | 없음 | setContent, setCurrentFileName, setCurrentFileNode |
| OMD-FILE-MergeModal-0002 | MergeModal | removeItem | 병합 목록에서 특정 파일을 제거 | 남은 파일이 2개 미만이면 경고 후 제거 차단 | 없음 | showToast |
| OMD-FILE-vfsHelper-0002 | vfsHelper.ts | saveVfsFiles | 가상 파일 목록을 localStorage에 JSON 직렬화하여 저장 | window 부재 | 없음 | 없음 |
| OMD-FILE-FileTreeItem-0002 | FileTreeItem | useEffect (syncChildren) | node.children 변경 시 localChildren 상태 동기화 | undefined인 경우 동기화 생략 | 없음 | 없음 |
| OMD-FILE-MainEditorApp-0002 | MainEditorApp.tsx | fetchAllMdFiles | 멀티 플랫폼 비동기 파일 트리 스캔: 브라우저, 로컬/Electron 또는 클라우드 API | visited Set으로 무한 디렉토리 루프 사이클 방지 | None | getMdFiles, fetch, api.listDirectory |
| OMD-FILE-GlobalSearch-0002 | GlobalSearch | handleSelectFolder | Electron 폴더 선택 다이얼로그 실행 또는 상위 onSelectFolder 콜백 호출 | electronAPI 존재 여부 확인 후 분기 처리 | 없음 | onSelectFolder |
| OMD-FILE-USEFILEEXPLORER-0003 | useFileExplorer.ts | handleFileClick | 파일 트리 노드 클릭 시 기존 탭 전환 또는 새 탭 생성 및 파일 내용 로딩 | node null/kind directory early return, 파일 읽기 실패 시 오류 토스트 | 없음 | createNewTab, switchTab, setContent, setTabs, setActiveTabId, showToast |
| OMD-FILE-LeftSidebar-0003 | LeftSidebar | useEffect (drives fetch) | 탐색기 탭이 활성화되고 데스크톱 환경일 때 드라이브 목록 자동 조회 | sidebarTab === 'explorer' && isDesktop 조건 검사 | 없음 | fetchDrives |
| OMD-FILE-vfsHelper-0003 | vfsHelper.ts | vfsReadFile | 가상 파일 텍스트 내용을 localStorage에서 조회 | window 부재, null 반환 시 빈 문자열 | 없음 | 없음 |
| OMD-FILE-GlobalSearch-0003 | GlobalSearch | useEffect (searchLogic) | 검색어 입력 시 워크스페이스/폴더/단일 문서 전체를 재귀적으로 검색 | 150ms 디바운스 적용, 검색어 미입력 시 결과 초기화 | 없음 | scanDirectory, electronAPI.searchInFolder |
| OMD-FILE-MergeModal-0003 | MergeModal | moveDown | 병합 목록에서 파일을 한 칸 아래로 이동 | 마지막 인덱스면 실행 차단 | 없음 | setNodes |
| OMD-FILE-FileTreeItem-0003 | FileTreeItem | refreshThisDirectory | 현재 디렉토리 노드의 자식 목록을 지연 로딩(onLazyLoad)으로 갱신 | 디렉토리가 아니거나 onLazyLoad 미존재 시 실행 차단 | 없음 | onLazyLoad |
| OMD-FILE-USEEDITORTABS-0003 | useEditorTabs.ts | updateContent | 에디터/외부에서 콘텐츠 변경 시 탭 상태와 Monaco 모델을 디바운스하여 동기화 | isEditorMounted, previewMode, isComposing 상태에 따른 early return | 없음 | setContent, setTabs |
| OMD-FILE-FileTreeItem-0004 | FileTreeItem | handleDrop | 파일/폴더 드래그 앤 드롭 이동 처리 - Electron, File System API, VFS 세 환경 지원 | 자기 자신/하위 폴더 드롭 방지, 디렉토리만 드롭 대상 허용 | 없음 | refreshParent, refreshThisDirectory, vfsRename, showToast |
| OMD-FILE-LeftSidebar-0004 | LeftSidebar | fetchDrives | electronAPI 또는 REST API를 통해 시스템 드라이브 목록 조회 | api 존재 여부에 따라 분기 처리 | 없음 | api.getDrives, fetch, msg.warn |
| OMD-FILE-USEEDITORTABS-0004 | useEditorTabs.ts | useEditorTabs | Monaco 에디터의 가상 모델 다중 탭 관리 및 탭 전환/생성/컨텐츠 동기화 | TDZ 방지를 위해 외부에서 주입된 탭 상태 사용 | 없음 | getWelcomeContent |
| OMD-FILE-MergeModal-0004 | MergeModal | moveUp | 병합 목록에서 파일을 한 칸 위로 이동 | 첫 번째 인덱스면 실행 차단 | 없음 | setNodes |
| OMD-FILE-USEFILEEXPLORER-0004 | useFileExplorer.ts | findNodeByPath | 파일 경로로 파일 트리 노드를 재귀 탐색 | 경로 정규화 및 대소문자 무효화하여 비교 | 없음 | 없음 |
| OMD-FILE-USEFILEEXPLORER-0005 | useFileExplorer.ts | loadHelp | 도움말 파일 내용을 파싱하여 화면에 표시 | 없음 | 없음 | stripFrontmatter, setHelpContent, setHelpTitle |
| OMD-FILE-LeftSidebar-0005 | LeftSidebar | useEffect (isDesktop) | 클라이언트 환경이 데스크톱(electron)인지 감지하여 isDesktop 상태 설정 | 없음 | 없음 | setIsDesktop |
| OMD-FILE-vfsHelper-0005 | vfsHelper.ts | findNodeByPath | 노드 배열에서 path로 노드 재귀 검색 | directory kind 확인, children 순회 | 없음 | 없음 |
| OMD-FILE-MergeModal-0005 | MergeModal | useEffect (isOpen) | 모달이 열릴 때 선택된 노드 목록을 복사하고 기본 병합 파일명 제안 | isOpen이 true일 때만 실행 | 없음 | setNodes, setTargetName |
| OMD-FILE-FileTreeItem-0005 | FileTreeItem | handleClick | 파일 트리 노드 클릭 - 폴더 토글/지연 로드, 파일 열기, 병합 선택 처리 | isMergeMode 시 파일 선택 모드로 전환 | 없음 | toggleMergeNodeSelect, openFile, onLazyLoad |
| OMD-FILE-vfsHelper-0006 | vfsHelper.ts | vfsCreateFile | 가상 파일 시스템에 새 .md 파일 생성 (확장자 자동 추가) | parentPath 분기, findNodeByPath로 부모 폴더 검증, throw Error | 없음 | getVfsFiles, saveVfsFiles, vfsWriteFile, findNodeByPath |
| OMD-FILE-USEFILEEXPLORER-0006 | useFileExplorer.ts | handleFileOpenByPath | 경로 문자열로 파일을 찾아 열거나 도움말 문서를 로드 | helpContentRef 존재 시 도움말 경로로 라우팅, 파일 미발견 시 fetch fallback | 없음 | findNodeByPath, handleFileClick, createNewTab, switchTab, setTabs, showToast |
| OMD-FILE-MergeModal-0006 | MergeModal | useEffect (mounted) | 클라이언트 마운트 완료 상태 설정으로 포탈 렌더링 hydration 방지 | 없음 | 없음 | setMounted |
| OMD-FILE-LeftSidebar-0006 | LeftSidebar | onPromptConfirm | PromptModal 확인 시 파일/폴더 생성 (브라우저/로컬/LocalStorage VFS 대응) | 이름 중복 체크 후 중복 시 에러 메시지 재표시 | 없음 | refreshFileList, openFile, vfsCreateFile, vfsCreateFolder, fetch, api.createFile, api.createFolder |
| OMD-FILE-FileTreeItem-0006 | FileTreeItem | onPromptConfirm | 이름 변경/파일 생성/폴더 생성 프롬프트 확인 처리 - 브라우저 VFS 또는 Electron API 연동 | 중복 체크 및 빈 이름 방어 | setTimeout 800ms 지연 새로고침으로 OS 파일 인덱싱 락 방어, NFC 경로 표준화로 한글 자소 분리 방지 | vfsRename, vfsCreateFile, vfsCreateFolder, openFile, refreshParent, refreshThisDirectory |
| OMD-FILE-vfsHelper-0007 | vfsHelper.ts | vfsCreateFolder | 가상 파일 시스템에 새 폴더 생성 | parentPath 존재 여부에 따른 루트/하위 분기, findNodeByPath로 부모 검증 | 없음 | getVfsFiles, saveVfsFiles, findNodeByPath |
| OMD-FILE-LeftSidebar-0007 | LeftSidebar | LeftSidebar | 좌측 사이드바 - 탐색기(파일트리), 개요(TOC), 검색 탭 제공 | isSidebarOpen false 시 null 반환; 파일 리스트 필터링으로 .md 확장자만 표시 | 없음 | fetchDrives, handleLazyLoad, onPromptConfirm, onFileOpenAndJump, FileTreeItem, GlobalSearch, PromptModal |
| OMD-FILE-USEFILEEXPLORER-0007 | useFileExplorer.ts | restoreFolderPermission | 브라우저 File System Access 권한을 복구하여 워크스페이스 재연결 | rootFolder.handle 미존재 시 early return, 권한 거부/AbortError 처리 | 없음 | showToast, setRootFolder |
| OMD-FILE-MergeModal-0007 | MergeModal | MergeModal | 여러 파일을 선택 순서대로 병합하여 새 파일로 저장 (로컬/브라우저 모드 대응) | isOpen/mounted false 시 null 반환; 최소 2개 파일 필요 | 없음 | handleMerge, moveUp, moveDown, removeItem, showToast |
| OMD-FILE-FileTreeItem-0007 | FileTreeItem | handleDelete | 파일/폴더 삭제 처리 - 브라우저 VFS 또는 Electron API를 통해 삭제 | askConfirm으로 사용자 재확인 후 실행 | setTimeout 300ms 지연 인덱싱 동기화 갱신으로 OS 파일 락 방어 | askConfirm, refreshParent, vfsDelete, openFile |
| OMD-FILE-USEFILEEXPLORER-0008 | useFileExplorer.ts | selectRootFolder | 로컬/브라우저 워크스페이스 루트 폴더를 선택하고 연결 | Electron/file picker/로컬스토리지 각 환경별 예외 처리 | 없음 | scanDirectory, idb.set, showToast, setRootFolder, setWorkspaceType |
| OMD-FILE-vfsHelper-0008 | vfsHelper.ts | updateChildPaths | 노드 및 하위 노드의 path를 old 접두사에서 new 접두사로 재귀 교체 | directory kind 확인, children 존재 여부 | 없음 | 없음 |
| OMD-FILE-USEFILEEXPLORER-0009 | useFileExplorer.ts | refreshFileList | 브라우저/Electron/웹 환경별 파일 트리 목록을 새로고침 | 각 환경별 API 실패 시 console.error로 대응 | 없음 | scanDirectory, getVfsFiles, api.listDirectory, fetch, setFileList |
| OMD-FILE-vfsHelper-0009 | vfsHelper.ts | vfsRename | 가상 파일/폴더 이름 변경 및 경로 수정 (하위 콘텐츠 키 마이그레이션) | file/directory 분기, 하위 경로 updateChildPaths 재귀 호출 | 없음 | getVfsFiles, vfsReadFile, vfsWriteFile, saveVfsFiles, updateChildPaths |
| OMD-FILE-vfsHelper-0010 | vfsHelper.ts | vfsDelete | 가상 파일/폴더 삭제 (하위 콘텐츠 localStorage 정리 포함) | 재귀 clearContents로 하위 파일 키 일괄 제거 | 없음 | getVfsFiles, saveVfsFiles |
| OMD-FILE-USEFILEEXPLORER-0010 | useFileExplorer.ts | useFileExplorer | 워크스페이스 폴더 연결, 파일 트리 스캔, 파일 열기/저장 I/O 전담 | 각 환경별 API 실패 시 예외 처리 및 fallback | 없음 | scanDirectory, getVfsFiles, fetch, vfsReadFile, vfsWriteFile, stripFrontmatter, idb.get, api.saveFile, api.listDirectory, api.readFromPath |
| OMD-FILE-MainEditorApp-0014 | MainEditorApp.tsx | loadFilesForDocLinkPicker | 문서 링크 선택기 열릴 때 모든 .md 파일 로드, 닫힐 때 상태 정리 | 선택기 닫힐 때 모든 제목/파일 선택 상태 초기화 | None | fetchAllMdFiles, setAllMdFiles |
| OMD-FILE-MainEditorApp-0019 | MainEditorApp.tsx | toggleMergeNodeSelect | 병합 선택 목록에서 FileNode 추가/제거 토글 | 중복 추가 방지를 위해 경로 또는 이름으로 중복 제거 | None | setSelectedMergeNodes |
| OMD-FILE-MainEditorApp-0020 | MainEditorApp.tsx | handleOpenMergeModal | 2개 이상의 파일이 선택된 경우에만 병합 모달 열기 | 모달 열기 전 최소 선택 개수(2) 검증 | None | showToast, setIsMergeModalOpen |
| OMD-FILE-MainEditorApp-0038 | MainEditorApp.tsx | openExternalFile | OS 수준 더블클릭 또는 명령줄에서 파일 열기, Monaco 모델로 탭 생성 | 중복 방지를 위해 기존 탭 확인, 변경 리스너로 Monaco 모델 생성, handleFileOpenByPath로 폴백 | None | api.readFromPath, switchTab, monaco.editor.createModel, setTabs, setActiveTabId, setContent, setCurrentFileName, setCurrentFileNode, handleFileOpenByPath, showToast |
| OMD-FILE-MainEditorApp-0039 | MainEditorApp.tsx | welcomeContentLoad | 첫 마운트 시 탭이 없고 보류 중인 외부 파일이 없으면 웰컴 콘텐츠 로드 | pendingExternalFileRef가 설정되어 있으면 건너뜀 (파일 열기로 연기) | None | getWelcomeContent, setTabs, setActiveTabId, setContent, setCurrentFileName |
| OMD-FILE-MainEditorApp-0046 | MainEditorApp.tsx | saveStatusSync | 콘텐츠와 lastSavedContent를 비교하여 저장 상태 및 탭 isModified 플래그 업데이트 | currentFileNode가 존재할 때만 실행 (새 저장되지 않은 파일 제외) | None | setSaveStatus, setTabs |
| OMD-FILE-MainEditorApp-0047 | MainEditorApp.tsx | autoSave | 콘텐츠 변경 및 autoSave 활성화 시 5초 디바운스 후 파일 자동 저장 | 콘텐츠가 비어있거나, 미리보기 모드가 변경 중이거나, 콘텐츠가 변경되지 않았으면 건너뜀; 5초 디바운스 정리 | None | saveFile, setSaveStatus, setTimeout, clearTimeout |
| OMD-FILE-MainEditorApp-0057 | MainEditorApp.tsx | readFileText | 브라우저 FileSystemHandle, 로컬 electronAPI, VFS 또는 클라우드 API에서 파일 내용 읽기 | 경로/핸들 존재 여부에 따라 활성 모드 결정; 오류를 정상적으로 처리 | None | node.handle.getFile, vfsReadFile, api.readFromPath, fetch |
| OMD-FILE-MainEditorApp-0059 | MainEditorApp.tsx | handleDocFileClick | 문서 링크 선택기를 위해 선택된 문서 파일에서 제목 로드 | 로딩 상태 설정, 오류 시 제목 초기화 | None | readFileText, extractHeadings, setDocHeadings, setIsHeadingLoading |
| OMD-IO-ExportModal-0001 | ExportModal | ExportModal | OS 인쇄(미리보기+PDF저장)/HTML/EPUB/PNG 포맷 선택 및 내보내기 요청을 처리하는 모달 창 | isOpen 및 mounted 상태 모두 true일 때만 포털 렌더링 | PDF/HTML → OS 인쇄(print) 통합 후 HTML 파일 저장 별도 추가; icon/label/desc 변경 | 없음 |
| OMD-IO-msg-0001 | msg.ts | format | 로그 메시지를 [온리비 어서] 프리픽스 + 레벨 포맷 | 없음 | 없음 | 없음 |
| OMD-IO-exportHandlers-0001 | exportHandlers.ts | flushIME | IME 조합 버퍼 강제 커밋 — export 전 한글 미완성 입력 캡처 차단 | 임시 input 생성/포커스/blur/제거 | 없음 | 없음 |
| OMD-IO-epubGenerator-0001 | epubGenerator.ts | escapeXml | XML/EPUB용 literal 문자열 XHTML 안전 이스케이프 | &, <, >, ", ' 문자 변환 | 없음 | 없음 |
| OMD-IO-PromptModal-0001 | PromptModal | handleSubmit | 폼 제출 시 입력값을 onConfirm으로 전달 | 없음 | 없음 | onConfirm |
| OMD-IO-api-0001 | api.ts | getApiUrl | 환경(Next.js dev/Electron/Extension)에 맞게 API URL 동적 계산 | window 존재 여부, 포트 범위(3000~3999), 프로토콜(chrome-extension/file) 감지 | 없음 | 없음 |
| OMD-IO-exportHandlers-0002 | exportHandlers.ts | applyExportInlineStyles | html2canvas 인라인코드 높이 오계산 버그 해결 — display/height/line-height 강제 지정 | pre>code 블록 제외, closest('pre') 조합으로 100% 포착 | vertical-align:middle + padding 0으로 baseline 정렬 보정 | 없음 |
| OMD-IO-epubGenerator-0002 | epubGenerator.ts | getMimeType | 파일 확장자 기반 MIME 타입 결정 | 소문자 변환, 미등록 확장자 fallback | 없음 | 없음 |
| OMD-IO-PromptModal-0002 | PromptModal | useEffect (focus) | 모달이 열릴 때 입력창에 defaultValue 설정 후 자동 포커스 | isOpen이 true일 때만 실행 | 없음 | setValue, inputRef.current.focus, inputRef.current.select |
| OMD-IO-msg-0002 | msg.ts | msg | [온리비 어서] 프리픽스 기반 통합 로깅 객체 (info/success/warn/error) | 없음 | 없음 | format |
| OMD-IO-exportHandlers-0003 | exportHandlers.ts | restoreMapsInClone | data-map-original-src 속성 기반 지도 복원 (Yandex 정적맵 fallback + Google Maps 링크) | URL 파싱 오류, API KEY 유효성, center/zoom 추출 | Yandex Static Maps로 API 키 없는 경우 fallback 이미지 제공 | msg.error |
| OMD-IO-PromptModal-0003 | PromptModal | useEffect (mounted) | 클라이언트 마운트 완료 상태를 설정하여 hydration mismatch 방지 | 없음 | 없음 | setMounted |
| OMD-IO-epubGenerator-0003 | epubGenerator.ts | sanitizeToXHTML | HTML 콘텐츠를 EPUB XHTML 규격으로 변환 — UI 요소 제거, 링크 보정, 앵커 삽입, 속성 정리 | window 부재, data- 속성 필터링, 스키마 없는 외부 링크 자동 교정 | .md 내부 링크를 EPUB 앵커 해시로 재작성, 첫 헤더에 destination ID 강제 삽입 | 없음 |
| OMD-IO-PromptModal-0004 | PromptModal | PromptModal | 사용자 입력을 받는 모달 다이얼로그 - 파일명/폴더명 입력 등 | isOpen/mounted false 시 null 반환; Escape 키로 취소 | 없음 | handleSubmit, handleKeyDown, onConfirm, onCancel |
| OMD-IO-epubGenerator-0004 | epubGenerator.ts | generateEpub | EPUB 규격 파일 어셈블링 — XHTML/OPF/NCX/TOC/CSS 생성, 이미지 임베딩, 페이지 분할 | crypto.randomUUID 폴백, 이미지 fetch 5초 타임아웃, 빈 sections 방어 fallback | mimetype STORE 압축, 한글/공백 파일명을 영숫자로 정규화, EPUB2/3 하위호환 | sanitizeToXHTML, escapeXml, getMimeType |
| OMD-IO-exportHandlers-0004 | exportHandlers.ts | convertYoutubeIframeToLink | YouTube iframe 임베드를 썸네일 + 하이퍼링크 컨테이너로 변환 | youtube.com / youtube-nocookie.com embed 감지, videoId 추출 | 없음 | 없음 |
| OMD-IO-epubGenerator-0005 | epubGenerator.ts | downloadBlob | EPUB Blob을 브라우저 다운로드 다이얼로그로 내보내기 | Blob URL 생성/해제, DOM 정리 | 100ms 지연 후 URL revoke로 메모리 누수 방지 | 없음 |
| OMD-IO-exportHandlers-0005 | exportHandlers.ts | clonePreview | 미리보기 DOM 복제 + 버튼 정리 + 지도 복원 + 유튜브 변환 | cloneNode(true)로 전체 트리 복제 | 없음 | restoreMapsInClone, convertYoutubeIframeToLink |
| OMD-IO-exportHandlers-0006 | exportHandlers.ts | fixListMarkers | html2canvas ::before/counter() 미지원 문제 해결 — DOM에 숫자/불릿 마커 직접 주입 | onrivi-empty-list-row / task-list-item 제외, start 속성 반영 | export-style-element 클래스로 스타일 및 마커 일괄 관리 | 없음 |
| OMD-IO-exportHandlers-0007 | exportHandlers.ts | inlineLocalImages | 상대 경로 / media:// 이미지를 Base64 Data URI로 인라인 임베딩 | Electron IPC, Data URI/http(s) 스킵, 백엔드 /api/view 2차 fallback | Electron readImageAsBase64 IPC 우회, 백엔드 실패 시 프론트엔드 정적 서빙 재시도 | getApiUrl |
| OMD-IO-exportHandlers-0008 | exportHandlers.ts | injectExportStyles | export 전 clone DOM에 동적 CSS + 인쇄 스타일 + 페이지 구분선 숨김 주입 | hideIndicators 옵션, dynamicCssString 존재 여부, pageBg 배경색 | custom-preview-container 클래스 추가로 사용자 CSS 우선 적용 | 없음 |
| OMD-IO-exportHandlers-0009 | exportHandlers.ts | saveToDownloads | 백엔드 /api/save-export API를 통해 다운로드 폴더에 파일 저장 | Electron 환경 조기 반환, API fetch 실패 시 false 반환 | 없음 | getApiUrl |
| OMD-IO-exportHandlers-0010 | exportHandlers.ts | exportPDF | 미리보기 DOM을 jsPDF로 선택 용지 PDF 내보내기 (html2canvas 캡처, 페이지 분할, 슬라이스) | Electron saveFileAs, orientation/paperSize/여백/배경색 설정, 폰트 로딩 대기 | A4 고정→선택용지 대응 (paperSize prop → jsPDF format) | flushIME, clonePreview, inlineLocalImages, injectExportStyles, fixListMarkers, applyExportInlineStyles, saveToDownloads |
| OMD-IO-exportHandlers-0011 | exportHandlers.ts | exportHTML | 미리보기 DOM을 독립 HTML 파일로 내보내기 (Tailwind CDN + computed font 포함) | Electron saveFileAs, computed fontFamily 반영 | 없음 | clonePreview, inlineLocalImages, injectExportStyles, saveToDownloads |
| OMD-IO-exportHandlers-0012 | exportHandlers.ts | exportEPUB | 미리보기 DOM을 EPUB으로 내보내기 (generateEpub 호출, 이미지 인라인) | Electron saveFileAs 브랜치, fontFamily computed 적용, export-style-element 제거 | 없음 | clonePreview, inlineLocalImages, injectExportStyles, generateEpub, downloadBlob, saveToDownloads |
| OMD-IO-exportHandlers-0013 | exportHandlers.ts | exportPNG | 미리보기 DOM을 html-to-image로 PNG 캡처 및 저장 (Electron/브라우저) | Electron IPC saveFileAs, overflow visible 강제, scrollHeight 측정 fallback | html2canvas ::before/counter() 누락 보정, 이미지 crossOrigin anonymous 설정 | flushIME, clonePreview, inlineLocalImages, injectExportStyles, fixListMarkers, applyExportInlineStyles, saveToDownloads |
| OMD-IO-MainEditorApp-0037 | MainEditorApp.tsx | electronAPI_listeners | 파일 작업 및 외부 파일 열기를 위한 Electron 메인 프로세스 IPC 리스너 등록 | 정리 시 리스너 제거, 보류 중인 외부 파일 참조 처리 | pendingExternalFileRef가 마운트 완료될 때까지 파일 열기 연기 | api.onNewFileRequested, api.onSaveFileRequested, api.onSaveFileAsRequested, api.onReceiveFile, openExternalFile, handlers.newFile, handlers.save, handlers.saveAs |
| OMD-PAY-MainEditorApp-0017 | MainEditorApp.tsx | supabaseRealtime_license | 실시간 활성화를 위해 license_activations의 Supabase postgres_changes 구독, 데스크톱 프로토콜 폴백 포함 | 언마운트 시 채널 및 리스너 정리; device_uuid 필터로 중복 제거 | Electron 환경을 위한 데스크톱 onLicenseActivated 백업 | supabase.channel, supabase.from.software_licenses.select, handleSuccessActivation, showToast |
