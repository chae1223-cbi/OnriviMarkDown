# OMD 함수 카탈로그 퀵 테이블

> **온리비 어서 (OnriviAuthor) v1.0.1** — 호출구조 결합형 전수 함수 주석 가이드라인  
> 생성일: 2026-06-15 | 총 함수: 55개 (MainEditorApp.tsx 기준)  
> **BUG 마크**: Shift+LeftArrow 관련 의심 함수 강조

---

## Shift+LeftArrow 선택 버그 분석

**현상**: 커서가 멈추다 갑자기 앞으로 이동하면서 선택됨

**원인**: `globalKeydownHandler` (L3319) — `capture:true` 모드로 Monaco 에디터보다 먼저 키 이벤트 수신

**즉시 수정 코드** — `handleGlobalKeyDown` 함수 최상단에 추가:
```typescript
// Shift+방향키는 capture 단계에서 절대 가로채지 않음 (Monaco cursorLeftSelect 보호)
if (e.shiftKey && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return;
```

---

## 함수 카탈로그 인덱스 (55개)

| 주석 고유번호 | 소스 위치 | 대상 함수명 | 상호 호출 함수 목록 | 핵심 기능 요약 |
|---|---|---|---|---|
| OMD-FILE-0001 | MEA.tsx:180 | getMdFiles | - | FileNode 트리에서 .md 파일 전체 재귀 수집 |
| OMD-FILE-0002 | MEA.tsx:198 | fetchAllMdFiles | getMdFiles, fetch, api.listDirectory | 멀티플랫폼 비동기 파일 트리 스캔 |
| OMD-CORE-0001 | MEA.tsx:252 | resolveRelativeImagePath | - | 마크다운 상대 이미지 경로 절대 경로 변환 |
| OMD-CORE-0002 | MEA.tsx:309 | getRelativePath | - | 두 파일 간 상대 경로 계산(위키 링크) |
| OMD-CORE-0003 | MEA.tsx:338 | MainEditorApp (컴포넌트) | useToast, useEditorTabs, useFileExplorer, useEditorSettings, usePageBreak | 컨트롤 타워: 전체 상태·레이아웃·Monaco 통합 |
| OMD-EDIT-0001 | MEA.tsx:344 | contentRef_sync | - | contentRef.current를 content 상태와 동기화 |
| OMD-CORE-0004 | MEA.tsx:417 | loadUserProfiles | api.readProfiles, localStorage.getItem, setProfiles | 플랫폼 저장소에서 CSS 프로파일 로드 |
| OMD-EDIT-0002 | MEA.tsx:461 | previewModeRef_sync | - | previewModeRef 상태 동기화 |
| OMD-EDIT-0003 | MEA.tsx:466 | helpContent_forces_preview | setPreviewModeRaw | 헬프 콘텐츠 설정 시 미리보기 모드 강제 전환 |
| OMD-CORE-0005 | MEA.tsx:491 | pageViewInit | localStorage.getItem | 페이지뷰 모드 localStorage 복원 |
| OMD-CORE-0006 | MEA.tsx:501 | handleTogglePageView | localStorage.setItem | 페이지뷰 on/off 토글 및 저장 |
| OMD-EDIT-0004 ✅ FIXED | MEA.tsx:513 | tabMetadata_sync | setTabs, activeTabId (최상단 선행 선언 상태 참조) | 탭 메타데이터(파일명·노드·경로) 동기화 *(수정: 2026-06-15 — tabs/activeTabId 최상단 선행 선언으로 TDZ 해결)* |
| OMD-EDIT-0005 | MEA.tsx:531 | searchOpen_sidebar_behavior | setIsSidebarOpen, setSidebarTab | 검색창 열릴 때 사이드바 검색 탭 활성화 |
| OMD-FILE-0003 | MEA.tsx:564 | loadFilesForDocLinkPicker | fetchAllMdFiles, setAllMdFiles | doc link picker 열릴 때 전체 .md 목록 로드 |
| OMD-AUTH-0001 | MEA.tsx:591 | initDeviceId | api.getMachineId, chrome.storage, crypto.randomUUID | 장치 고유 ID 초기화 |
| OMD-AUTH-0002 | MEA.tsx:629 | loadAndVerifyLicense | api.loadLicenseFull, supabase, saveSecureData, setLicenseStatus | 라이선스 로드 및 Supabase DB 검증 |
| OMD-PAY-0001 | MEA.tsx:784 | supabaseRealtime_license | supabase.channel, handleSuccessActivation, showToast | Supabase 실시간 라이선스 활성화 구독 |
| OMD-AUTH-0003 | MEA.tsx:840 | handleSuccessActivation | setLicenseStatus, api.saveLicenseFull, chrome.storage | 결제 성공 후 라이선스 전체 저장 |
| OMD-FILE-0004 | MEA.tsx:895 | toggleMergeNodeSelect | setSelectedMergeNodes | 병합 선택 목록에 FileNode 추가/제거 |
| OMD-FILE-0005 | MEA.tsx:906 | handleOpenMergeModal | showToast, setIsMergeModalOpen | 병합 모달 열기(2개 이상 선택 필요) |
| OMD-EDIT-0006 | MEA.tsx:961 | currentFileNodeRef_sync | - | currentFileNodeRef stale closure 방지 동기화 |
| OMD-EDIT-0007 | MEA.tsx:962 | currentFileNameRef_sync | - | currentFileNameRef 동기화 |
| OMD-EDIT-0008 | MEA.tsx:963 | workspaceTypeRef_sync | - | workspaceTypeRef 동기화 |
| OMD-EDIT-0009 | MEA.tsx:964 | rootFolderRef_sync | - | rootFolderRef 동기화 |
| OMD-CORE-0007 | MEA.tsx:965 | tabSizeRef_sync | parseInt | 활성 CSS 프로파일에서 tabSize 갱신 |
| OMD-EDIT-0010 | MEA.tsx:1015 | setPreviewMode | setPreviewModeRaw, createNewTab, switchTab, clearTimeout | 미리보기 모드 전환 (콘텐츠 보존·헬프 가드) |
| OMD-EDIT-0011 | MEA.tsx:1057 | closeTab | setTabs, switchTab, createNewTab, setConfirmConfig | 탭 닫기 (미저장 경고·모델 해제·모드 자동 복귀) |
| OMD-EDIT-0012 ✅ FIXED | MEA.tsx:1101 | autoSaveRef/lastSavedContentRef 선행 선언 | useRef (React) | autoSaveRef·lastSavedContentRef 선행 선언 (기존 L1289→L1101 이동) *(수정: 2026-06-15 — autoSaveRef useEffect 참조 이전 선언 이동으로 rS TDZ 해결)* |
| OMD-CORE-0008 | MEA.tsx:1168 | handleCheckboxToggle | editor.getModel, editor.executeEdits | 미리보기 체크박스 클릭→에디터 라인 동기화 |
| OMD-CORE-0009 | MEA.tsx:1198 | updateDecorations | decorationsCollectionRef.current.set | Monaco 마크다운 문법 강조 데코레이션 업데이트 |
| OMD-EDIT-0013 | MEA.tsx:1305 | previewWheelSync | editor.setScrollTop | 미리보기 마우스휠을 에디터 스크롤에 전달 |
| OMD-CORE-0010 | MEA.tsx:1330 | darkModeDOMClass | document.documentElement.classList | documentElement dark 클래스 토글 |
| OMD-EDIT-0014 | MEA.tsx:1340 | editorSettingsSync | monaco.editor.setTheme, editor.updateOptions | 테마·폰트·줄바꿈 설정 에디터 재적용 |
| OMD-CORE-0011 | MEA.tsx:1360 | darkModePaletteSync | setThemePalette | 다크모드 토글 시 팔레트 자동 전환 |
| OMD-CORE-0012 | MEA.tsx:1375 | profilesSave | api.saveProfiles, localStorage.setItem | CSS 프로파일 변경 시 플랫폼 저장 |
| OMD-CORE-0013 | MEA.tsx:1388 | activeProfileSave | localStorage.setItem | 활성 CSS 프로파일 ID localStorage 저장 |
| OMD-IO-0001 | MEA.tsx:1396 | electronAPI_listeners | api.onNewFileRequested, api.onReceiveFile, openExternalFile | Electron IPC 리스너 등록 (파일 작업) |
| OMD-FILE-0006 | MEA.tsx:1426 | openExternalFile | api.readFromPath, switchTab, monaco.editor.createModel, setTabs | OS 더블클릭/CLI 파일 열기, Monaco 모델 생성 |
| OMD-FILE-0007 | MEA.tsx:1481 | welcomeContentLoad | getWelcomeContent, setTabs, setActiveTabId | 최초 마운트 시 환영 콘텐츠 로드 |
| OMD-EDIT-0015 | MEA.tsx:1524 | dynamicTitleBar | - | 현재 파일명으로 document.title 갱신 |
| OMD-CORE-0014 | MEA.tsx:1534 | previewHighlightLine | element.classList | 에디터 커서 라인 미리보기 강조 |
| OMD-CORE-0015 | MEA.tsx:1566 | postContentScrollCorrection | requestAnimationFrame, editor.getTopForLineNumber | 콘텐츠 변경 후 미리보기 스크롤 위치 보정 |
| OMD-EDIT-0016 | MEA.tsx:1612 | handleMouseMove | setSidebarWidth, localStorage.setItem | 사이드바 리사이즈 드래그 처리 |
| OMD-EDIT-0017 | MEA.tsx:1623 | stopResizing | document.removeEventListener | 사이드바 리사이즈 종료 |
| OMD-EDIT-0018 | MEA.tsx:1631 | startResizing | document.addEventListener | 사이드바 리사이즈 시작 |
| OMD-FILE-0008 ✅ FIXED | MEA.tsx:1645 | saveStatusSync | setSaveStatus, setTabs | 콘텐츠 vs lastSaved 비교로 저장 상태·탭 수정 여부 갱신 *(수정: 2026-06-17 — activeTabId deps 추가로 탭 전환 시 isModified 오염 방지)* |
| OMD-FILE-0009 | MEA.tsx:1657 | autoSave | saveFile, setSaveStatus, setTimeout, clearTimeout | 5초 디바운스 자동 저장 |
| OMD-EDIT-0019 | MEA.tsx:1688 | insertAtCursor | utilsEditorActions.insertAtCursor | 커서 위치에 텍스트 삽입 |
| OMD-CORE-0016 | MEA.tsx:1699 | findLineNumberByHeading | utilsEditorActions.findLineNumberByHeading | 제목으로 라인 번호 탐색 |
| OMD-EDIT-0020 | MEA.tsx:1708 | scrollToLine | utilsEditorActions.scrollToLine | 에디터 특정 라인으로 스크롤 |
| OMD-CORE-0017 | MEA.tsx:1717 | handlePreviewClick | scrollToLine, classList | 미리보기 클릭 시 에디터 해당 라인으로 스크롤 |
| OMD-EDIT-0021 | MEA.tsx:1744 | insertBlockTag | utilsEditorActions.insertBlockTag | 블록 태그 감싸기 |
| OMD-EDIT-0022 | MEA.tsx:1755 | wrapSelection | utilsEditorActions.wrapSelection | 선택 영역 서식 감싸기/해제 |
| OMD-EDIT-0023 | MEA.tsx:1759 | insertLink | editor.executeEdits, editor.setSelection | 마크다운 링크 삽입 및 URL 플레이스홀더 선택 |
| OMD-EDIT-0024 | MEA.tsx:1812 | insertTagLink | setShowTagLinkPicker | 태그 링크 피커 열기 |
| OMD-EDIT-0025 | MEA.tsx:1816 | handleTagLinkSelect | editor.executeEdits | 헤딩 선택 후 태그 링크 삽입 |
| OMD-FILE-0010 | MEA.tsx:1853 | readFileText | node.handle.getFile, vfsReadFile, api.readFromPath | 파일 콘텐츠 읽기 (브라우저/Electron/VFS/API) |
| OMD-CORE-0018 | MEA.tsx:1897 | extractHeadings | - | 마크다운 텍스트에서 H1~H6 제목 추출 |
| OMD-FILE-0011 | MEA.tsx:1915 | handleDocFileClick | readFileText, extractHeadings, setDocHeadings | doc link picker에서 파일 선택 시 제목 목록 로드 |
| OMD-EDIT-0026 | MEA.tsx:1930 | handleDocLinkSelect | getRelativePath, editor.executeEdits | 크로스 문서 링크([[path#heading]]) 삽입 |
| OMD-EDIT-0027 | MEA.tsx:1972 | parseHtmlTableToMarkdown | utilsPasteHandlers.parseHtmlTableToMarkdown | HTML 표를 마크다운 표로 변환 |
| OMD-EDIT-0028 | MEA.tsx:1983 | sanitizePastedText | utilsPasteHandlers.sanitizePastedText | 붙여넣기 텍스트 정제 |
| OMD-EDIT-0029 | MEA.tsx:1993 | fixMarkdownTable | utilsPasteHandlers.fixMarkdownTable | 마크다운 표 정렬 수정 |
| OMD-EDIT-0030 | MEA.tsx:1997 | handleEditorPaste | FileReader, parseHtmlTableToMarkdown, sanitizePastedText, insertAtCursor, updateContent, showToast | 붙여넣기 처리: 이미지 업로드·HTML표 변환·텍스트 정제 |
| OMD-EDIT-0031 | MEA.tsx:2101 | applyLinePrefix | editor.getSelection, editor.executeEdits, model.forceTokenization | 선택 라인에 순서/불릿/인용/체크리스트 prefix 적용 |
| OMD-EDIT-0032 | MEA.tsx:2213 | removePrefix | editor.getSelection, editor.executeEdits | 선택 영역의 마크다운 서식 제거 |
| OMD-CORE-0019 | MEA.tsx:2281 | processedContent_lineMap | preprocessMarkdownForPreview | 미리보기 전처리 및 라인 매핑 생성(스크롤 동기화용) |
| OMD-CORE-0020 | MEA.tsx:2301 | dynamicCssString | - | 활성 CSS 프로파일로 동적 CSS 문자열 생성 |
| OMD-EDIT-0033 | MEA.tsx:2491 | quickWrap | wrapSelection, applyLinePrefix, insertBlockTag | 빠른 서식 감싸기(heading/quote/code) |
| OMD-EDIT-0034 | MEA.tsx:2577 | dispatchCommand | handlers.xxx, selectRootFolder, setPreviewMode | 에디터 명령 유형→핸들러 메서드 라우팅 |
| OMD-EDIT-0035 | MEA.tsx:2740 | mapIdToCommandType | - | 툴바 ID→EditorCommandType 변환 |
| OMD-EDIT-0036 | MEA.tsx:2791 | hotkeyRegistration | TOOLBAR_ITEMS.forEach, editor.addAction, parseKeybinding | Monaco 커스텀 단축키 액션 등록 |
| OMD-EDIT-0037 ✅ FIXED | MEA.tsx:3319 | globalKeydownHandler | dispatchCommand, mapIdToCommandType, setShowTagLinkPicker, setFloatingToolbar | capture:true 전역 키 핸들러 *(수정: 2026-06-15 — Shift+방향키 early return 추가로 Monaco 선택 버그 해결)* | |
| OMD-CORE-0021 | MEA.tsx:3472 | toc | - | 마크다운 제목 파싱→TOC 목차 생성 |
| OMD-HOOK-0001 | useEditorSettings.ts:12 | useEditorSettings | getDefaultHotkeys, THEME_MAP, idb, getApiUrl | 테마·단축키·폰트·자동저장 설정 관리 |
| OMD-HOOK-0002 | useEditorSettings.ts:41 | handleThemeChange | setThemePalette, setIsDarkMode | 테마 전환 |
| OMD-HOOK-0003 ✅ FIXED | useEditorTabs.ts:13 | useEditorTabs | tabs, setTabs, activeTabId, setActiveTabId (외부 주입), getWelcomeContent, monaco.editor.createModel | 다중 탭 관리 *(수정: 2026-06-15 — 내부 useState 제거→외부 주입 전환으로 rS TDZ 에러 해결)* |
| OMD-HOOK-0004 | useEditorTabs.ts:35 | updateContent | setContent, setTabs | 콘텐츠 변경 탭 동기화(100ms 디바운스) |
| OMD-HOOK-0005 ✅ FIXED | useEditorTabs.ts:59 | switchTab | editor.setModel, setActiveTabId | 탭 전환·스크롤 저장·모델 교체 *(수정: 2026-06-17 — css-style↔일반 탭 전환 시 모드 자동 전환, 도움말 탭 preview 모드 강제)* |
| OMD-HOOK-0006 | useEditorTabs.ts:89 | createNewTab | monaco.editor.createModel, setTabs | 새 탭 생성 및 Monaco 모델 초기화 |
| OMD-HOOK-0007 | useFileExplorer.ts | useFileExplorer | saveFile, refreshFileList, handleFileClick, selectRootFolder | 파일 탐색·열기·저장·워크스페이스 제어 |
| OMD-HOOK-0008 | useEditorHandlers.ts | useEditorHandlers | 각종 핸들러 | 에디터 액션 로직 통합 핸들러 |
| OMD-HOOK-0009 | usePageBreak.ts | usePageBreak | handleResetPageBreaks, executeAutoPageBreak | 자동 페이지 나누기 |

