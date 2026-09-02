# 온리비 어서 개발 규칙 (Rules)

## 1. 코드 변경 시 문서 및 주석 동기화 규칙
- **소스 코드 주석 최신화**: 소스 코드를 수정할 때마다, 해당 소스 파일 최상단에 정의된 OMD 주석 가이드라인 블록(특히 `🚨 @PATCH` 항목)에 수정 날짜(YYYY-MM-DD)와 패치 내역을 한글로 명확히 기록해야 합니다.
- **OMD_QUICK_TABLE.md 동기화**: 소스 코드 수정 완료 후, 루트 디렉토리에 위치한 `OMD_QUICK_TABLE.md` 파일의 매칭되는 주석 고유번호 항목을 찾아서 `🚨 @PATCH` 내용 및 `✅ FIXED` 상태 마크를 항상 최신 수정본으로 업데이트해야 합니다.

## 2. 데이터베이스 및 통신 코드값 표준화 규칙
- **대문자 통일 규칙**: 데이터베이스 테이블에 저장되거나 시스템 모듈 간 주고받는 모든 코드값(예: `FREE`, `ACTIVE`, `EXPIRED`, `Y`, `N` 등)은 반드시 **대문자**로 통일하여 지정해야 합니다. 소문자로 입력 및 쿼리 필터링 처리를 수행하지 않습니다.


## 3. UI 컴포넌트 아키텍처 분리 규칙 (역할 기반)
비대해진 대형 화면 컴포넌트를 신규 설계하거나 리팩토링할 때는 **역할(Role)**을 명확히 구분하여 다음과 같이 분리해야 합니다.
- **Container (컨트롤 타워)**: 화면을 직접 그리지 않고, 오직 상태(State), 비즈니스 로직, Context Provider 제공에만 집중합니다. (예: `MainEditorApp`)
- **Layout (구조 래퍼)**: 앱의 상하좌우 뼈대, 메뉴바, 사이드바 등 고정적인 껍데기 UI 골격을 배치합니다. (예: `EditorLayout`)
- **Core (핵심 도메인 뷰)**: 서비스 본질의 가치가 집중되는 핵심 렌더링 영역을 격리합니다. (예: `EditorCore`)
- **Manager (오버레이 통합 관리)**: 모달(Modal), 플러그인 등 독립적인 Z-Index와 생명주기를 가지는 플로팅 UI들을 중앙 집중식으로 묶어 관리합니다. (예: `ModalManager`)
- **렌더링 위임 원칙**: 컨테이너 컴포넌트에 복잡한 HTML/Tailwind 마크업을 하드코딩하지 말고, 분리된 뷰 컴포넌트에 Props나 Context로 위임하여 코드를 슬림하게 유지합니다.

## 4. 단위 테스트(Unit Test) 코드 격리 및 전용 디렉토리 관리 규칙
- **테스트 파일 분리 격리**: 프로덕션 소스 코드 디렉토리(`src/components`, `src/lib`, `src/hooks` 등) 내부에 테스트 파일(`*.test.ts`, `*.spec.ts`)을 임의로 혼재하여 생성하지 않습니다.
- **전용 디렉토리 표준화**: 모든 단위 테스트(Unit Test) 소스 코드는 반드시 별도의 격리된 전용 디렉토리(`frontend/src/__tests__/unit/`) 하위에서 모듈 경로와 1:1로 대응되도록 체계적으로 관리해야 합니다.
- **빌드 파이프라인 오염 방지**: 단위 테스트 코드가 프로덕션 번들링(`next build`, `tsconfig.json`)에 포함되어 빌드 에러나 번들 용량 증가를 유발하지 않도록, `tsconfig.json`의 `exclude` 목록에 테스트 경로를 명시하고 순수 테스트 실행기(Vitest/Node 스크립트) 환경에서만 독립 구동되도록 유지합니다.

## 5. 일회성 패치 및 임시 스크립트 격리 관리 규칙
- **루트 디렉토리 오염 방지**: 버그 수정, 텍스트 변환, DB 검증, 일회성 마이그레이션 등을 위해 작성되는 임시 스크립트(`fix_*.js`, `patch_*.py`, `check_*.js`, `*.txt` 덤프 등)를 프로젝트 루트 디렉토리나 프로덕션 소스 폴더에 직접 생성하지 않습니다.
- **전용 디렉토리 표준화**: 모든 일회성 패치 및 임시 검증 스크립트는 반드시 별도의 격리된 전용 디렉토리(`scripts/patches/` 또는 `scratch/`) 하위에서만 작성 및 실행해야 합니다.
- **루트 청결 유지 원칙**: 프로젝트 루트 디렉토리는 항상 빌드/배포 및 프로젝트 구동에 필수적인 핵심 설정 파일과 문서(`package.json`, `main.js`, `OMD_QUICK_TABLE.md` 등)로만 슬림하고 깨끗하게 유지되어야 합니다.

## 6. 통합 디자인 시스템 및 3대 책임 영역 격리 규칙 (LINE Design System LDSG v5.0 / DESIGN.md)
본 프로젝트는 앱 UI, 마크다운 콘텐츠 서식, 위치 동기화 엔진 간의 책임 경계를 엄격히 격리하여 개발해야 합니다. 상세 명세는 루트의 `DESIGN.md`를 표준 기준으로 따릅니다.
- **Application UI Scope (앱 인터페이스)**: 랜딩 페이지, 에디터 프레임, 사이드바, 툴바, 모달, 버튼, 입력창 등 애플리케이션의 모든 UI는 LINE Design System for Global Family Service (LDSG) 기반 디자인 토큰(LINE Green `#06C755`, LDSG Blue `#4D73FF`, Surface, Border `#EFEFEF` 등)과 공통 컴포넌트 규칙을 적용합니다.
- **LNB 사이드바 바탕색 표준**: 모든 좌측 사이드바는 공통 럭셔리 그라데이션(`.bg-sidebar-luxury` — Light: `linear-gradient(#F6F8FA, #F0F4F8, #E8EDF3)`, Dark: `linear-gradient(#17191E, #131519, #0F1114)`)을 표준으로 고정 적용합니다.
- **Content Document Scope (미리보기 서식 격리)**: 미리보기 내부의 마크다운 콘텐츠(`h1~h6`, `p`, `ul`, `ol`, `table`, `img`, `blockquote`, `pre`, `code` 등)는 오직 CSS Profile 및 User Custom CSS(`.onrivi-content-root` 하위)에 의해서만 결정됩니다. `globals.css` 등 전역 스타일에서 마크다운 태그를 직접 스타일링하여 콘텐츠를 오염시키는 행위를 절대 금지합니다.
- **Sync Engine의 Geometry 기반 독립성**: Sync Engine(`syncEngine.ts`)은 콘텐츠의 구체적인 CSS 스타일(font-size, margin 등)을 참조하거나 변경하지 않고, 최종 렌더링된 실제 DOM Geometry와 Safe Zone(상단 40px, 하단 60px), Minimal Delta, Scroll Clamp만을 기반으로 위치를 동기화합니다.
- **Sync 단일 진입점 원칙**: 에디터 ↔ 미리보기 간의 모든 위치 동기화 스크롤은 `syncPreviewInterpolated()` 단일 진입점을 통해서만 실행합니다.


