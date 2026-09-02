# [통합 디자인 시스템 및 아키텍처 명세서]
## Onrivi Author — LINE Design System (LDSG) 에디션

**문서 ID:** `ONRIVI-DS-SYSTEM-002`  
**버전:** `v5.0 (LINE Design System LDSG Edition)`  
**상태:** Official Development Specification  
**참조:** [LINE Design System for Global Family Service (LDSG)](https://designsystem.line.me/LDSG)  
**적용 범위:** Landing Page, Application Shell, Editor Frame, Sidebar, Toolbar, Modal/Dialog, Component Scope, Markdown Content Isolation

---

# 1. 문서 목적 및 핵심 철학

본 문서는 **LINE Design System for Global Family Service (LDSG)**의 원칙과 토큰 체계를 준용하여, Onrivi Author 서비스 전반의 UI/UX 일관성을 확립하고 마크다운 콘텐츠 서식 및 동기화 엔진 간의 책임 경계를 명확히 분리하기 위한 표준 개발 기준을 정의합니다.

---

# 2. 3대 책임 영역 분리 철학

```
+-------------------------------------------------------------------------+
| 1. Application UI Scope (LDSG Standard)                                |
|    - Landing Page, Editor Shell, Sidebar (LNB), MenuBar (GNB), Modals  |
|    - LDSG Tokens: LINE Green (#06C755), Gray Scale, 4/8/12/16/24px Radii|
+-------------------------------------------------------------------------+
| 2. Content Document Scope (.onrivi-content-root)                        |
|    - h1~h6, p, ul, ol, table, img, code, blockquote                     |
|    - Pure CSS Profile & User Custom CSS Isolation                       |
|    - Strict Prohibition: globals.css 직접 마크다운 스타일링 절대 금지   |
+-------------------------------------------------------------------------+
| 3. Editor <-> Preview Sync Engine (Geometry-based)                      |
|    - Line Height & DOM Geometry Only                                    |
|    - Safe Zone (Top 40px, Bottom 60px), Minimal Delta, Scroll Clamp      |
+-------------------------------------------------------------------------+
```

---

# 3. LDSG 토큰 체계 (Color, Typography, Elevation)

### 3.1 Color Palette (LDSG Foundation)
- **Primary**: LINE Green `#06C755` (Hover: `#05B04B`, Alpha: `rgba(6, 199, 85, 0.1 ~ 0.8)`)
- **Secondary**: LDSG Blue `#4D73FF` (Hover: `#3B5FE8`)
- **Neutral (Light Mode)**:
  - `Background`: `#F7F8F9` (Surface Base)
  - `Container / Card`: `#FFFFFF`
  - `Title / Heading`: `#1F1F1F`
  - `Body / Paragraph`: `#616161`
  - `Caption / Tertiary`: `#949494`
  - `Border / Divider`: `#EFEFEF`
- **Neutral (Dark Mode)**:
  - `Background`: `#121212`
  - `Container / Card`: `#1E1E1E`
  - `Title / Heading`: `#FFFFFF`
  - `Body / Paragraph`: `#A0A0A0`
  - `Caption / Tertiary`: `#666666`
  - `Border / Divider`: `rgba(255, 255, 255, 0.08)`

- **Sidebar / LNB Luxury Gradient (모든 좌측 사이드바 전용 바탕색 표준)**:
  - `Light Mode`: `linear-gradient(180deg, #F6F8FA 0%, #F0F4F8 50%, #E8EDF3 100%)` (실크 실버-미스트 블루)
  - `Dark Mode`: `linear-gradient(180deg, #17191E 0%, #131519 50%, #0F1114 100%)` (흑요석 티타늄 차콜)
  - `Header / Workspace Sub-bar`: `backdrop-blur-md bg-white/75` (Dark: `bg-black/30`)
  - `Border`: `#E2E8F0` (Light) / `rgba(255, 255, 255, 0.08)` (Dark)

### 3.2 Typography & Readability (고해상도 가독성 표준)
- **Primary UI Font Family**: `"Pretendard Variable"`, `Pretendard`, `LineSeed`, `-apple-system`, `BlinkMacSystemFont`, `system-ui`, `Roboto`, `"Segoe UI"`, `"Apple SD Gothic Neo"`, `"Noto Sans KR"`, `"Malgun Gothic"`, `sans-serif`
- **Monospace (Code / Editor)**: `'D2Coding'`, `'JetBrains Mono'`, `Consolas`, `monospace`
- **Text Rendering Engine Settings**:
  - `-webkit-font-smoothing: antialiased;`
  - `-moz-osx-font-smoothing: grayscale;`
  - `text-rendering: optimizeLegibility;`
  - `font-feature-settings: "cv02", "cv03", "cv04", "cv11";`
  - `letter-spacing: -0.012em;` (한글 자간 최적화)
- **Color Contrast & Font Weight Standard**:
  - **Main Title / Body Text**: `#0F172A` (Slate 900) 또는 `#111827`, 기본 `font-weight: 500 (Medium)` 권장
  - **Sub / Label / Muted Text**: `#475569` (Slate 600, WCAG AA 4.5:1 이상 대비율 보장)
  - **Table Header / Caption**: `font-weight: 600 (SemiBold)` 적용으로 또렷한 가독성 확보

### 3.3 Object Styles & Radii
- `xs (Chip / Tag)`: `4px`
- `sm (Button / Input)`: `8px`
- `md (Card / Modal)`: `12px`
- `lg (Large Container / Banner)`: `16px ~ 24px`
- `full (Badge / Pill)`: `9999px`

### 3.4 Form Controls & High-Contrast Visual Standards (선명한 폼 컨트롤 표준)
- **Input / Select / Textarea**:
  - `Background`: `#FFFFFF`
  - `Border`: `1.5px solid #CBD5E1` (Slate 300)
  - `Text`: `#0F172A` (Slate 900), `font-weight: 500`
  - `Placeholder`: `#94A3B8` (Slate 400)
  - `Focus State`: `border-color: #06C755`, `box-shadow: 0 0 0 3px rgba(6, 199, 85, 0.18)`
  - `Elevation`: `box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04)` (화이트 배경 위 선명한 입체 경계 보장)
- **Labels & Headers**:
  - `Form Label`: `#1E293B` (Slate 800), `font-weight: 600`
  - `Table Header`: `background: #F8FAFC`, `border-bottom: 1.5px solid #E2E8F0`, `color: #334155`, `font-weight: 600`
- **Cards & Modals Border**:
  - `Card Border`: `1px solid #E2E8F0`, `box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.05)`
  - `Modal Overlay (Backdrop)`: `rgba(15, 23, 42, 0.45)` (Slate 900 45% 딤으로 모달 폼 전면 부각)
