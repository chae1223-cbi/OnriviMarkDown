# 도움말 현행화 확인 기록

확인일: 2026-10-14. 배포 도움말은 `frontend/public/help`, 데스크톱 대체 탐색 자료는 `docs/help`에 동일하게 반영했다. 기존 01~29의 파일명을 유지하여 기존 링크를 보존하고 30~32를 추가했다.

## 소스와 안내 연결

| 도움말 | 확인한 구현 |
| --- | --- |
| 01~02 화면·시작 | `MainEditorApp.tsx` 초기 preview 상태·탐색기·보기 순서·Monaco readOnly, `useEditorTabs.ts` 파일 열기 |
| 03 저장 | `MainEditorApp.tsx` autoSave 초 단위 설정, `useEditorHandlers.ts` 로컬/Drive 저장과 임시 초안 |
| 04·10 리소스 | `resourceMedia.ts`, `resourceMediaPicker.ts`, `resourceSettings.ts`, `documentTransfer.ts`, `googleDriveClient.ts`, `main.js` |
| 05~08 입력·목록·인용문 | `VisualDocumentEditor.tsx`, `visualMarkdownInputRules.ts`, `visualListCommands.ts`, `visualDocumentCodec.ts` |
| 09 표 | `visualTableCommands.ts`, `TableModal.tsx`, `VisualDocumentEditor.tsx` 표 복사, `MainEditorApp.tsx` 편집 서식 |
| 11~14 서식 | `constants/cssProfile.ts`, `CssStyleForm.tsx`, `CssStyleModal.tsx`, `aiFormatter.ts` |
| 15~16 AI | `AIDraftModal.tsx`, `AIPromptLibrary.tsx`, `SettingsModal.tsx`, `gemini.ts`, `aiRequest.ts`, `secureStorage.ts` |
| 17 지식 | `components/knowledge`, `lib/knowledge`, 데스크톱 지식 API 처리 |
| 18~20 수식·Mermaid·각주 | `FormulaModal.tsx`, `MarkdownViewer.tsx`, `VisualDocumentEditor.tsx`, `toolbarConfig.ts`, 참고문헌 처리 |
| 21~24 출력·가져오기 | `exportHandlers.ts`, `ExportModal.tsx`, `importFormats.ts`, `fileImporter.ts`, `picturebookEpub.ts` |
| 25~27 명령·설정 | `toolbarConfig.ts`, `visualCommandCatalog.ts`, `SettingsModal.tsx`, `useEditorSettings.ts` |
| 28~29 권한·오류 | `MainEditorApp.tsx` restrictedCommands·라이선스·인수, `LicenseModal.tsx`, 각 기능 오류 처리 |
| 30 코드 | `VisualDocumentEditor.tsx` 언어·복사·나가기, `MainEditorApp.tsx` 24px 여백·가로 스크롤 |
| 31 그림책 | `picturebook.ts`, `PicturebookPreview.tsx`, `CssStyleForm.tsx`, `ExportModal.tsx`, `picturebookEpub.ts` |
| 32 문서·날짜·이모지 | `LinkModal.tsx`, `CalendarModal.tsx`, `DateTimeInsertPicker.tsx`, `VisualDocumentEditor.tsx`, `MainEditorApp.tsx` 이모지 Esc·삽입 |

## 정정한 주요 안내

- 독립 마크다운 탭과 중앙 원문/우측 미리보기 설명을 문서보기 중심으로 변경. 나란히 보기 오른쪽은 현재 소스에서 읽기 전용이다.
- 앱 시작·일반 파일 열기는 문서보기지만 새 문서 생성 분기에는 `both` 전환이 있어 그 예외를 명시했다.
- 자동 툴바 표시·양방향 휠·항상 5초 자동 저장 설명을 삭제했다.
- Ctrl+Space는 플로팅 서식 툴바, 태그 취소는 Ctrl+Shift+0. 코드 Ctrl+Shift+E와 기존 이모지 메뉴 표시 충돌은 별도 주의로 명시했다.
- 일반 Enter와 공백 처리, 표 `<br>`, 인용문 Ctrl+Enter, Tab 문맥과 설정을 분리했다.
- 표 복사는 마크다운, 미디어 복사는 참조, CODE 복사는 코드 내용으로 구분했다.
- 현재 문서보기 TSV 자동 표 변환을 보장하지 않는다. 가져오기에는 HWP는 있지만 HWPX는 없으며 일반 문서 HWPX 출력은 구현되어 있다.
- 그림책 DOCX·HWPX 제외와 자동 후속 장면 생성 미사용을 명시했다.
- 모델의 외부 서비스 제공 여부·특정 DPI·보안·복구·서점/블로그 호환성에 대한 무조건 보장 문구를 제거했다.

## 검증

`node scripts/check-help-docs.cjs`로 도움말 메타·마크다운 예제·내부 링크·이미지·목록 등록·공개/대체 자료 일치를 확인한다. TypeScript 검사로 도움말 목록 변경을 확인한다. 실제 기능의 원문 보존·표/코드/인용문 입력은 기존 `scripts/check-visual-editor.cjs` 브라우저 검증을 사용한다.

도움말 전용 브라우저 검사는 `node scripts/check-visual-editor.cjs --visual --help`이다. 개편된 HELP-01 전체와 별도 구조 회귀 예제를 붙여넣어 원문·제목·표·코드·콜아웃·링크·실행 취소/재실행을 확인한다. 코드 편집 검사는 기존 HELP-02의 ASCII 화면 도식 대신 새 HELP-30 예제를 사용한다.

전체 `--visual` 검사에서는 도움말 검사 이후 메타 서식 변경 시 첫 문단 DOM 재사용 확인이 실패했다. 이는 도움말 링크·파싱 검증과 별도의 편집기 회귀 항목으로 남겨 두었으며, 이번 문서 현행화에서 편집기 코드를 수정하지 않았다. 전체 검사 통과로 보고하지 않는다.
