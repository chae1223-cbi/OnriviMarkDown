---
메타영역
#서식설정
css_profile: middle-school-note-theme
css_profile_name: "여중생 감성 필기노트"
---

# [목표] 참조(BibTeX/Vibe) 파일 전용 관리자(CRUD) 기능 구현 및 서식 자동 주입 검증

현재 제공되는 `ReferenceManagerModal`은 단순히 새로운 `.bib` 파일을 생성하는 역할만 수행하고 있습니다.
사용자의 요청에 따라 이 화면을 **"기존 `.bib` 파일을 열어서 수정하고, 삭제하며, 새로 만들 수 있는 통합 관리자"** 형태로 전면 개편합니다.
또한, 저장 시점에 서식이 강제 주입되는 기능이 완벽하게 동작하는지 점검 및 보완합니다.

## User Review Required

- ⚠️ **참조 관리 모달 레이아웃 변경**: 기존 단일 입력창 형태에서 좌측에는 `파일 목록`, 우측에는 `에디터`가 있는 분할 레이아웃(CssStyleModal과 유사)으로 개편됩니다.
- ⚠️ **파일 스캔 범위**: 참조 모달 내 파일 목록은 원칙적으로 **리소스 폴더(Resource Folder)** 내부에 있는 `.bib` 파일들만 스캔하고 관리하도록 범위를 좁힙니다. (워크스페이스 전체를 스캔하면 일반 파일과 혼동될 여지가 있기 때문입니다.)

## Proposed Changes

### 1. `frontend/src/components/ReferenceManagerModal.tsx`
- **[MODIFY]** 모달 레이아웃을 2-pane (좌측 목록, 우측 편집기) 구조로 리팩토링합니다.
- **[MODIFY]** `useEffect`를 통해 모달이 열릴 때 리소스 폴더를 스캔하여 `.bib` 파일 목록과 내용을 불러오는 `loadBibFiles` 로직을 추가합니다.
- **[MODIFY]** 파일 선택, 수정 후 저장(`handleSave`), 파일 삭제(`handleDelete`) 기능을 각각 Electron API 및 브라우저 FileSystem Access API에 맞게 구현합니다.
- **[MODIFY]** '새로 만들기' 버튼을 눌러 비어있는 새 `.bib` 파일을 생성할 수 있게 합니다.

### 2. `frontend/src/hooks/useEditorHandlers.ts`
- **[MODIFY]** (확인용) 기존에 적용된 `updateCssProfileInFrontmatter` 함수가 Frontmatter 구역 자체가 아예 존재하지 않는 순수 마크다운 파일에서도 정상적으로 최상단에 `--- css_profile ... ---` 블록을 생성해 주입하는지 최종 검증하고, 부족한 점이 있다면 패치합니다.

## Verification Plan

### Automated Tests
- `npm run typecheck`를 통해 타입 안정성을 검증합니다.

### Manual Verification
- 📚 참조 도구 모달을 열었을 때, 기존에 만들었던 `.bib` 파일이 좌측 리스트에 잘 뜨는지 확인합니다.
- 리스트에서 파일을 클릭해 내용을 수정한 뒤 저장 버튼을 눌러 정상 반영되는지 확인합니다.
- 리스트의 삭제(🗑️) 아이콘을 눌러 파일이 지워지는지 확인합니다.
- 새 파일(.md)을 생성하고 서식이 없는 상태에서 글을 쓴 뒤 저장(Ctrl+S)할 때, 최상단에 `css_profile` 속성이 강제로 잘 붙는지 확인합니다.


