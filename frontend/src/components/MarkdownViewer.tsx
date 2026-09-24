// 🚨 @PATCH : **2026-09-24** — [미디어(이미지·비디오·지도) 렌더러 정렬 아키텍처 완성]: iframe 커스텀 렌더러 신설(.onrivi-map-wrapper), AsyncVideo 래퍼(.onrivi-video-wrapper) 탑재, figure img의 margin:0 !important 강제 초기화 제거, AsyncImage 하드코딩 width:100% 해제(maxWidth:100%/height:auto), 래퍼의 fit-content/align-self 인라인 연동 및 캡션 동기화로 서식 프로필 및 쿼리스트링 정렬 100% 실시간 반영 보장
// 🚨 @PATCH : **2026-09-24** — [미디어(이미지/비디오/지도) 서식 스타일 100% 실시간 연동 및 flex 정렬 최적화]: imgStyle 하드코딩 maxWidth(600px) 및 figure 인라인 마진/중앙정렬 강제를 해제하고, AsyncImage 래퍼(.onrivi-image-wrapper) 및 video/iframe 정렬을 CSS 프로필 align-self/align-items와 1:1 완전 동기화
// 🚨 @PATCH : **2026-09-24** — [표 둥근 모서리·그림자·지브라 오염 완전 소멸 및 기본 표 리셋]: MarkdownViewer 내장 스타일에 table border-spacing:0, border-radius:0, box-shadow:none 및 overflow:visible을 명시하여 전역 CSS 간섭 방어
// 🚨 @PATCH : **2026-09-24** — [표 하단 여백 및 인용구 마진 상쇄 차단]: .table-wrapper-area 및 blockquote에 display:inline-block width:100%를 적용하여 마진 상쇄 원천 차단 및 *:has(+ blockquote) margin-bottom:0 강제 소거
// 🚨 @PATCH : **2026-09-24** — [표 테두리 이중선(double) 렌더링 지원]: MarkdownViewer 인라인 스타일에 th/td border-bottom-style inherit 및 border-collapse: collapse 보강
// 🚨 @PATCH : **2026-09-24** — [인용구 상하 여백 0~15px 데드존 완전 소멸 및 선/후행 블록(표/코드블록) 마진 간섭 0 강제]: blockquote/Alert my-4 기본 마진 클래스 제거, *:has(+ blockquote) 및 blockquote + .not-prose .codeblock-area 마진 0 강제 처리로 슬라이더 0px 밀착 및 1px 단위 즉각 반응 실현
// 🚨 @PATCH : **2026-09-23** — [리스트 빈 행 판별 가드 고도화 및 부모 블록 실종 방어] li 컴포넌트에서 isEmptyRow 검사 시 하위 서브리스트(ul/ol) 보유 여부를 엄격히 확인하여, 서브리스트 내부에 빈 행이 있을 때 부모 li(떡볶이, 고추장 등)가 빈 행으로 오탐되어 통째로 증발하던 결함 완벽 해결
// 🚨 @PATCH : **2026-09-23** — [숫자 리스트 에디터 원본 번호 1:1 일치 렌더링] 에디터에 사용자가 직접 기입한 번호(예: 1., 2., 3. 또는 2., 3., 4. 등)를 원본 라인에서 추출하여 li 태그의 value 속성에 바인딩함으로써, 브라우저의 임의 자동 계산 카운터 대신 에디터에 적힌 번호 그대로 1:1 일치하게 미리보기에 렌더링되도록 개선
// 🚨 @PATCH : **2026-09-23** — [리스트(숫자/글머리/체크박스) data-line 명시적 바인딩 및 커서 위치 동기화] li, ol, ul 컴포넌트에 data-line 속성을 명시적으로 바인딩하여 중첩 멀티리스트에서도 에디터 커서와 1:1로 정확하게 일치하도록 보장
// 🚨 @PATCH : **2026-09-23** — [한글 Alert 인용구 태그 지원] blockquote 렌더러에 한글 Alert 태그([!참고], [!팁], [!중요], [!주의], [!경고] 등) 파싱 엔진을 탑재하여 영문([!NOTE])과 한글 태그 모두 동일한 Alert 스타일로 완벽 렌더링되도록 구현
// 🚨 @PATCH : **2026-09-17** — [다크모드/어두운 배경 코드블록 내부 행 하이라이트 고대비 시인성 보장]: 어두운 배경의 코드블록 내부 활성 줄 하이라이트 시 코발트 블루 및 1px 인셋 아웃라인 스타일 연동으로 시인성 극대화
// 🚨 @PATCH : **2026-09-17** — [코드블록 내부 에디터-미리보기 커서 위치 불일치 및 솟구침 결함 완벽 해결]: 코드블록 내부를 splitChildrenIntoLines로 분할하여 각 행마다 <span class="onrivi-line" data-line="...">를 1:1로 부여, 에디터 커서 이동 시 코드블록 내부 활성 줄 단독 하이라이트 및 Safe Zone 정밀 추종 연동
// 🚨 @PATCH : **2026-09-16** — [데스크톱 미리보기 외부 링크 클릭 시 기본 웹브라우저 오픈 연동]: <a> 태그 렌더러에 handleExternalLinkClick 탑재하여 데스크톱(Electron) 환경에서 외부 웹 링크(http/https/mailto/tel) 및 www 링크 클릭 시 electronAPI.openExternal을 통해 시스템 기본 웹브라우저 새 창이 즉시 실행되도록 개선, 로컬 파일(file:///) 링크 openPath 연동
// 🚨 @PATCH : **2026-09-13** — [데스크탑 Mermaid '새 창으로 확대' 팝업 차단 오류 해결]: Electron setWindowOpenHandler의 deny로 window.open()이 차단되던 문제를, openInNewWindow()에서 isDesktop(electronAPI.openMermaidWindow 존재 여부) 분기를 추가하여 데스크탑 환경에서는 IPC mermaid:open-window 경유 BrowserWindow 직접 생성, 웹 환경에서는 기존 window.open() 방식을 유지하도록 분기 처리
// 🚨 @PATCH : **2026-09-13** — [출처 링크 클릭 시 동일/타겟 문서 판별 고도화 및 미리보기·에디터 동시 스크롤·하이라이트 연동]: 상대/절대경로 및 파일명 베이스네임 매칭으로 동일 문서 오판을 해결하고, 링크 클릭 시 미리보기 부드러운 스크롤 및 하이라이트 효과와 에디터 라인 범위 선택·중앙 정렬을 동시에 트리거
//             **2026-09-12** — [미리보기 문서 링크 꺾쇠(<...>) 및 앵커(#) 분리 정제 고도화]: 꺾쇠 괄호(<...>)로 감싸진 상대/절대경로 및 한글 헤딩(#) 링크에서 해시 분리 전 꺾쇠를 사전 제거하고 URI 디코딩을 선행 적용하여 탭 오픈 및 스크롤 점프 완벽 보장
//             **2026-09-12** — [인라인 코드(code) 페이지 가로 넘침 방지 및 줄바꿈(word-break) 완벽 보장]: .onrivi-content-root code에 걸려 있던 white-space: pre !important를 코드블록(pre code) 한정으로 축소하고, 인라인 코드에 white-space: pre-wrap, word-break: break-word, overflow-wrap: anywhere를 적용하여 긴 텍스트/섹션 경로가 페이지 밖으로 잘리는 결함 완벽 해결
//             **2026-09-12** — [절대경로(file:///) 링크 내부 탭 오픈 및 라인 앵커(#L..) 점프 연동]: 마크다운 미리보기에서 file:/// 절대경로 링크 클릭 시 외부 브라우저 호출을 방어하고 에디터 내부 handleFileOpenByPath로 연결, 동일/타겟 문서 라인 앵커(#L시작-L끝) 점프 및 스크롤 지원
//             **2026-09-11** — [인용문 Alert 태그 및 색상 유실 버그 완벽 수정] rehypeSourceLinesPlugin의 span.onrivi-line 래핑 환경에서도 첫 번째 텍스트 노드를 재귀적으로 추적(findFirstText/removeTag)하여 [!NOTE/TIP/IMPORTANT/WARNING/CAUTION] 태그와 고유 색상 및 아이콘이 풀리지 않도록 조치, cleanContent의 인용구(&nbsp;) 간섭 차단 및 다크모드 컬러 보정
//             **2026-09-11** — 단일 물결표(~, 기간·인사말 등) 취소선 오인식 방지: remark-gfm singleTilde: false 옵션 적용 (표준 2개 물결표 ~~취소선~~만 허용)
//             **2026-09-11** — 미리보기 영역 사용자 정의 CSS 전면 지원: customCss prop, 마크다운 Frontmatter custom_css/css 추출 주입, 마크다운 본문 내 인라인 <style> 태그 실시간 렌더링 지원
//             **2026-09-06** — [문단 내 커서 위치 행 단독 하이라이트 및 .onrivi-line 정밀 분할] rehypeSourceLinesPlugin에서 문단(p) 내부를 줄바꿈(br) 단위로 <span class="onrivi-line" data-line="...">로 분할 래핑하여 여러 줄로 구성된 문단에서도 커서가 위치한 특정 행 하나만 정확하게 독립 하이라이트되도록 전면 개선
//             **2026-09-06** — [에디터-미리보기 하이라이트 일원화 및 잔상/중복 테두리 제거] 인라인 activeLine dashed 아웃라인 스타일 태그를 제거하고 단일 preview-highlight-line 클래스로 통일하여 표(tr) 및 일반 요소 하이라이트 시인성 일원화
//             **2026-09-05** — [표 전체 래퍼 중복 앵커 제거 및 행(tr) 단위 초정밀 싱크 보장] TableWrapper에서 테이블 전체를 묶는 중복 data-line 속성을 제거하여 자식 tr 개별 행들이 독립적인 40px 단위 앵커로 정확히 인식되도록 개선; iframe 지도 래퍼(map-embed-wrapper) 단일 앵커 일원화
//             **2026-09-05** — [문단 내 연속 줄바꿈(br) 줄 번호 추적 및 표 직전 제목 일체화] rehypeSourceLinesPlugin에서 p 태그 자식 br 마다 물리 줄 번호를 1:1로 증분 부여하여 연속된 인라인 텍스트 행 타이핑 시에도 앵커가 정확히 잡히도록 개선, 표 직전 헤딩(:is(p,h1~h6,strong):has(+ .table-wrapper-area)) 하단 마진 6px 통일 및 dynamicPropsRef 동기 주입으로 실시간 lineMap 반영 보장
//             **2026-09-05** — [미디어(이미지/동영상/지도/머메이드) 1:1 싱크 및 여백 완벽 최적화] 지도(iframe) 전용 반응형 렌더러 신설, 이미지(alt 누락 포함)/동영상카드(VideoCard, SocialVideoCard, AsyncVideo)/머메이드(MermaidBlock) 전체에 data-line 속성 1:1 완벽 바인딩, 문단 내 미디어 블록 래퍼 규격화 및 이중 마진(40px->12px) 정돈
//             **2026-09-05** — [표 내부 타이핑 싱크 결함 해결] 모든 표 행(tr)에 원본 줄 번호(data-line)를 1:1로 부여하는 전용 tr 컴포넌트 렌더러를 탑재하고 rehypeSourceLinesPlugin에서 tr 자식(td/th)의 줄 번호 상속을 보장하여 표 내부 어느 행에서 타이핑하더라도 정확한 DOM 앵커 추종 및 Safe Zone 노출 보장
//             **2026-09-05** — [표 상단 여백 및 직전 제목 문구 밀착 최적화] Tailwind prose table 기본 마진(!m-0 !mt-0)을 원천 소거하고 TableWrapper를 .table-wrapper-area 표준 규격화하여, 표 바로 위 문구(p:has(+ .table-wrapper-area))와의 하단 여백을 6px로 슬림하게 밀착시켜 제목-표 간의 시각적 일체감 완성
//             **2026-09-03** — 표와 상단 문구 간의 과도한 여백 및 시각적 단절감을 해결하기 위해 TableWrapper의 외곽 테두리 카드 박스를 전면 제거하고 상단 여백을 mt-[2.5px]로 정밀 축소 정돈
//             **2026-09-03** — 모니터 해상도 및 분할 모드에서 우측 화면 및 표가 잘리던 결함을 해결하기 위해 최상위 루트 컨테이너에 boxSizing: border-box 및 maxWidth: 100%를 명속 부여하고 TableWrapper/table에 w-full max-w-full 가로 스크롤 가드 적용
//             **2026-09-03** — 문단 및 리스트 내부의 탭(\t) 및 스페이스 공백이 축약되거나 무시되지 않고 4칸 단위(&nbsp;)로 1:1 시각적 보존되도록 cleanContent 강화
//             **2026-09-03** — 문서링크(위키링크) 변환 시 전체 파일 경로가 노출되던 결함을 해결하여 일반 링크처럼 헤딩(#) 제목 또는 순수 문서명(확장자 제거) 및 별칭(|)만 링크 텍스트로 깔끔하게 노출되도록 개선
//             **2026-09-03** — 리소스 폴더 미지정 상태에서 rootFolderPath 및 currentFilePath로 임의 폴백되어 이미지가 렌더링되던 취약점 원천 제거; 리소스 폴더 미지정 시 이미지 로드를 차단하고 경고 플레이스홀더를 렌더링하도록 표준화
//             **2026-09-02** — 본문 바로 아랫줄에 - 단독 입력 시 Setext H2 헤딩으로 오인되어 윗줄이 제목으로 변하던 마크다운 파서 결함을 방지하기 위해 Setext 오작동 방어 필터 적용
//             **2026-09-02** — br display none을 제거하여 이미지 아래 및 일반 문단의 줄바꿈을 정상화하고, 행 시작 들여쓰기 및 연속 스페이스를 1:1 보존하도록 cleanContent 전처리 고도화
//             **2026-09-02** — cleanContent에서 2칸 이상의 인라인 연속 스페이스를 1:1 보존 처리하고, 리스트 종료 후 빈 행 문단 분리를 위해 ul+p, ol+p에 1.5em 마진 적용
//             **2026-09-02** — 리스트(ul/ol) 및 리스트 아이템(li, li > p)에 white-space: normal 및 margin: 0을 명시하여 리스트 항목 끝 \n에 의한 빈 줄 생성 현상 완벽 해결
//             **2026-09-02** — 리스트(ul/ol), 번호목록, 체크박스 내부에 p 태그가 생성될 때 발생하는 Loose List 행간 벌어짐(빈 행 현상)을 해결하기 위해 li > p 마진 제거 및 display: inline 적용
//             **2026-09-02** — break-spaces 환경에서 br 태그와의 이중 줄바꿈 충돌(들여쓰기 시 빈 행 추가 현상)을 해결하기 위해 .onrivi-content-root br { display: none !important; } 적용 및 p 렌더러 정밀화
//             **2026-09-02** — 에디터 연속 스페이스/탭(Tab) 및 행 시작 들여쓰기 공백이 미리보기에 1:1로 정확하게 유지되도록 white-space: break-spaces, tab-size: 4 연동 적용
//             **2026-09-02** — [ONRIVI-DS-SYSTEM-002 v4.1] Content Document Scope 격리를 위해 최상위 루트에 .onrivi-content-root 표준 클래스 적용 및 서식 스코프 완전 격리
//             **2026-08-31** — 미리보기가 위로 과도하게 치솟아 하얀 빈 화면이 노출되던 결함 해결을 위해 50vh 하단 스페이서 제거; 스크롤 싱크 엔진과 1:1 보간 일원화.
//             **2026-08-30** — onImageLoaded prop을 AsyncImage에 전달할 때 ...props 스프레드로 DOM img에 흘러들어가 발생하던 Unknown event handler 경고 수정(명시적 destructure로 분리); 대형 이미지 비동기 로딩 완료 시 DOM 높이 변화로 인한 스크롤 싱크 오차를 보정하기 위해 onImageLoaded 콜백 prop 추가 및 AsyncImage 내부 handleImgLoad에서 해당 콜백 호출 연결 | **2026-08-28** — 이미지, 표, 코드블록 등의 가변 거대 요소가 포함되었을 때 비선형 리플로우로 인해 선형 스크롤 비율 보간이 어긋나서 싱크가 망가지던 현상을 해결하기 위해, React 컴포넌트 Props 카멜 케이스 변환 및 Properties 손실을 막아주는 extractDataLine 통합 스캐너를 이식하여 래퍼 돔의 data-line 상속 안전성을 확보함 | **2026-08-26** — 코드 블록 헤더 복사 버튼의 글자색이 어두운 배경 위에서 묻히던 시각성 결함을 해결하기 위해 항상 선명한 텍스트 컬러(text-slate-100) 및 불투명도 보정을 적용하고 언어명 텍스트 레이블을 볼드체(font-bold)로 강화 | **2026-08-20** 다크모드에서 자바스크립트 등 언어 코드블록의 글자색이 어두워 보이지 않는 현상을 해결하기 위해 최상위 style 태그를 주입하여 텍스트 및 자식 요소 색상을 흰색으로 강제 고정.
// 🚨 @PATCH : **2026-07-16** — 코드블록 및 인라인 코드의 하드코딩된 파란색 톤 배경 및 글자색을 제거하여, 사용자 CSS 프로필 서식 설정이 가로막힘 없이 실시간으로 올바르게 오버라이딩되도록 버그 수정.
//             **2026-07-15** — MermaidBlock 내 alert() 호출을 useToast showToast('warning')로 교체 (브라우저 팝업 차단 알림을 공통 토스트 UI로 통일)
//             **2026-07-07** — rehype-citation 플러그인 추가 (참고문헌/BibTeX 인용 파이프라인); bibContent prop으로 BibTeX 데이터를 주입받아 [@citekey] 문법을 인용/참고문헌 목록으로 자동 변환
//             **2026-07-04** — Mermaid 다이어그램 렌더링 문법 에러 복구 강화(유입된 중첩 백틱 펜스 태그 ```mermaid 및 깨진 기호/괄호 라인 자동 정제, 화살표 레이블 간격 자동 보정) 및 에러 발생 시 마크다운 코드 원본을 복사하고 대조해볼 수 있는 '코드 원본 보기' 디버깅 UI 추가 패치
//             **2026-06-20** — Mermaid 다이어그램 이미지 저장(handleSaveImage) 기능이 Electron 데스크톱 앱 내에서 동작하지 않던 API 명칭 불일치 버그(saveAs -> saveFileAs)를 해결하고, 웹 브라우저 환경에서 동작할 수 있도록 a 링크 다운로드 폴백을 추가; 다이어그램 저장, 이미지 복사 시 다이어그램 크기가 극도로 작게 나오는 찌그러짐 결함을 3배 스케일링 기법으로 최종 영구 해결; 딤드 오버레이 방식의 복잡한 확대 모달을 전면 걷어내고, 독립 새 브라우저 창(Pop-up Window)으로 다이어그램을 선명하게 확대 및 다중 작업할 수 있도록 openInNewWindow 기능으로 리팩토링 및 🔍 새 창으로 확대 버튼 제공

import React, { useMemo, useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import remarkExtendedTable, { extendedTableHandlers } from 'remark-extended-table';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import DOMPurify from 'dompurify';
import rehypeSanitize from 'rehype-sanitize';
import { getApiUrl } from '@/lib/apiUrlBuilder';
import VideoCard from '@/components/VideoCard';
import SocialVideoCard from '@/components/SocialVideoCard';
import { BROWSER_STORAGE_NAME } from '@/constants/storage';
import { rehypePreserveFootnotes } from '@/lib/rehypePreserveFootnotes';
import { useToast } from '@/components/ToastProvider';
import { extractFrontmatter } from '@/lib/frontmatter';
import { loadSecureData } from '@/lib/secureStorage';


const getTextFromChildren = (children: React.ReactNode): string => {
  if (children === null || children === undefined) return '';
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(getTextFromChildren).join('');
  }
  if (React.isValidElement(children)) {
    return getTextFromChildren(children.props.children);
  }
  return '';
};

/**
 * [ONR-MD-005] MarkdownViewerProps 인터페이스
 * @description 마크다운 렌더러 뷰어 컴포넌트에 주입되는 마크다운 원문(content), 체크박스 토글 핸들러 규격 명세입니다.
 */
interface MarkdownViewerProps {
  content: string;
  originalContent?: string;
  lineMap?: number[];
  onCheckboxToggle?: (lineNumber: number, checked: boolean) => void;
  currentFilePath?: string;
  rootFolderPath?: string;
  onFileOpen?: (resolvedPath: string, hashPart?: string) => void;
  listIndent?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  bibContent?: string;
  rootFolder?: any;
  resourceFolderHandle?: any;
  resourceFolder?: string;
  workspaceType?: string;
  /** 💡 대형 이미지 비동기 로딩 완료 시 호출되는 콜백 — 스크롤 싱크 재정렬 트리거용 */
  onImageLoaded?: () => void;
  /** 💡 현재 에디터에서 포커스/커서가 위치한 활성 라인 번호 (미리보기 인디케이터용) */
  activeLine?: number;
  /** 💡 사용자 정의 CSS 스타일 문자열 (미리보기 서식 격리 주입) */
  customCss?: string;
}

// 💡 [하이브리드 data-line 추출 헬퍼] React 컴포넌트 Props 카멜 케이스 변환 및 AST Properties 누락 방지를 위한 통합 스캐너
const extractDataLine = (props: any, node?: any): number | undefined => {
  if (!props && !node) return undefined;
  const val = props?.['data-line'] || props?.dataLine || props?.['dataLine'] || node?.properties?.['data-line'] || node?.properties?.dataLine;
  if (val !== undefined && val !== null) {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

// ====================================================================
// 🖼️ [ONR-MD-006] AsyncImage 커스텀 컴포넌트
// @description 웹 브라우저 환경에서 로컬 파일(OPFS/VFS)을 비동기적으로 읽어와 렌더링합니다.
// ====================================================================
const AsyncImage = ({ src, alt, absolutePath, rootFolder, resourceFolderHandle, workspaceType, api, queryString, style, className, onImageLoaded, ...props }: any) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    let objectUrl = '';
    setErrorMsg('');
    const loadLocalImage = async () => {
      try {
        if (api) {
          let targetAbsolutePath = absolutePath;
          if (src.startsWith('media://local/serve')) {
             try {
               const parsedUrl = new URL(src);
               const extracted = parsedUrl.searchParams.get('url');
               if (extracted) targetAbsolutePath = extracted;
             } catch (e) {
               const m = src.match(/[?&]url=([^&]+)/);
               if (m) targetAbsolutePath = decodeURIComponent(m[1]);
             }
          }

          if (targetAbsolutePath && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('blob:') && (!src.startsWith('media://') || src.startsWith('media://local/serve'))) {
            try {
              const base64Str = await api.readImageAsBase64(targetAbsolutePath);
              setImgSrc(base64Str);
            } catch (err: any) {
              console.error(`[AsyncImage] Base64 ERROR for: ${targetAbsolutePath}`, err);
              setErrorMsg(`Base64 실패: ${targetAbsolutePath} (${err.message})`);
              setImgSrc(`media://local/serve?url=${encodeURIComponent(targetAbsolutePath)}`);
            }
          } else {
            setImgSrc(src);
          }
        } else if ((workspaceType === 'browser' || workspaceType === 'local') && !src.startsWith('http') && !src.startsWith('data:')) {
          const pureSrc = src.split('?')[0].split('#')[0];
          
          // 🛡️ [정적 자산 우회 가드 개선]
          // 웹서버의 public/ 하위 정적 에셋이거나 확실한 빌트인 에셋인 경우에만 
          // 로컬 드라이브/VFS 검색을 생략하고 웹서버 정적 로더로 직결합니다.
          const isStaticAsset = (
            pureSrc.startsWith('frontend/public/') || 
            pureSrc.startsWith('public/') || 
            (pureSrc.startsWith('/') && !pureSrc.startsWith('/media/') && !pureSrc.startsWith('/assets/'))
          );
          if (isStaticAsset) {
            let webSrc = pureSrc;
            if (webSrc.startsWith('frontend/public/')) webSrc = webSrc.replace('frontend/public/', '/');
            else if (webSrc.startsWith('public/')) webSrc = webSrc.replace('public/', '/');
            
            setImgSrc(queryString ? (webSrc.includes('?') ? webSrc + '&' + queryString.substring(1) : webSrc + queryString) : webSrc);
            return;
          }

          const isMediaSrc = pureSrc.startsWith('./media/') || pureSrc.startsWith('media/') || pureSrc.startsWith('/media/') || pureSrc.includes('media/');

          // 🚨 [필수 규격] media 파일은 무조건 공통 리소스 폴더(resourceFolderHandle)에서만 읽어야 함!
          // rootFolder(작업장 폴더)나 다른 곳으로의 임의 풀백을 원천 금지합니다.
          if (isMediaSrc) {
            if (!resourceFolderHandle) {
              setErrorMsg(`[리소스 폴더 미지정] 환경설정에서 공통 자원 폴더를 지정해야 이미지가 표시됩니다.`);
              return;
            }

            try {
              const fileName = pureSrc.replace(/^\.?\/media\//, '').replace(/^media\//, '');
              const mediaDir = await resourceFolderHandle.getDirectoryHandle('media');
              const fileHandle = await mediaDir.getFileHandle(fileName);
              const file = await fileHandle.getFile();
              objectUrl = URL.createObjectURL(file);
              setImgSrc(objectUrl);
              return;
            } catch (err: any) {
              setErrorMsg(`리소스 폴더의 media/${pureSrc.replace(/^\.?\/media\//, '')} 파일을 찾을 수 없습니다.`);
              return;
            }
          }

          if (rootFolder?.handle) {
            let pathParts = pureSrc.split(/[/\\]/).filter(Boolean);
            if (pathParts[0] === rootFolder.name) pathParts.shift();
            
            let currentHandle = rootFolder.handle;
            for (let i = 0; i < pathParts.length - 1; i++) {
              currentHandle = await currentHandle.getDirectoryHandle(pathParts[i]);
            }
            const fileHandle = await currentHandle.getFileHandle(pathParts[pathParts.length - 1]);
            const file = await fileHandle.getFile();
            objectUrl = URL.createObjectURL(file);
            setImgSrc(objectUrl);
          } else {
            const { vfsReadFile } = await import('@/lib/virtualFileSystem');
            // 🛡️ [앞슬래시 비대칭 조회 보완] /media/ 와 media/ 양쪽 모두 조회하여 매칭되는 이미지 바이너리를 확보합니다.
            let b64 = vfsReadFile(pureSrc);
            if (!b64) {
              const alternativePath = pureSrc.startsWith('/') ? pureSrc.substring(1) : '/' + pureSrc;
              b64 = vfsReadFile(alternativePath);
            }

            if (b64) {
              // 💡 [2중 접두사 방어 가드] 이미 data:image 로 시작하는 완전한 Base64 데이터 스키마이면 그대로 주입합니다.
              if (b64.startsWith('data:image/')) {
                setImgSrc(b64);
              } else {
                setImgSrc(`data:image/png;base64,${b64}`);
              }
            } else {
              throw new Error('VFS file not found');
            }
          }
        } else {
          setImgSrc(src);
        }
      } catch (e: any) {
        console.error(`[AsyncImage] VFS ERROR:`, e);
        setErrorMsg(`VFS 실패: ${absolutePath} (${e.message})`);
        const fallbackSrc = api 
          ? `media://local/serve?url=${encodeURIComponent(absolutePath)}`
          : `/api/view?filePath=${encodeURIComponent(absolutePath)}`;
        setImgSrc(queryString ? (fallbackSrc.includes('?') ? fallbackSrc + '&' + queryString.substring(1) : fallbackSrc + queryString) : fallbackSrc);
      }
    };
    
    loadLocalImage();
    
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, absolutePath, rootFolder, resourceFolderHandle, workspaceType, api, queryString]);

  if (errorMsg) {
    return (
      <span className="inline-flex items-center gap-2 px-3.5 py-2 my-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold shadow-xs select-none">
        <span className="text-sm">⚠️</span>
        <span>{errorMsg}</span>
      </span>
    );
  }

  if (!imgSrc) return <span data-line={extractDataLine(props)} className="inline-block animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded w-full h-32" />;

  const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.dataset.fallbackAttempted) return;
    img.dataset.fallbackAttempted = 'true';
    if (api && absolutePath) {
      img.src = `media://local/serve?url=${encodeURIComponent(absolutePath)}`;
    }
  };

  const handleImgLoad = () => {
    // 💡 타이핑 시 스크롤 간섭을 방지하기 위해 정적 로드로 유지합니다.
  };

  

    const handleCopy = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        let blob;
        if (imgSrc.startsWith('data:')) {
          const response = await fetch(imgSrc);
          blob = await response.blob();
        } else if (imgRef.current) {
          const canvas = document.createElement('canvas');
          canvas.width = imgRef.current.naturalWidth || imgRef.current.width;
          canvas.height = imgRef.current.naturalHeight || imgRef.current.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(imgRef.current, 0, 0);
            blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
          }
        }
        
        if (blob) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } catch (err) {
        console.error('Image copy failed', err);
      }
    };

    return (
      <div data-line={extractDataLine(props)} className={`relative group inline-flex flex-col onrivi-image-wrapper ${className || ''}`} style={style}>
        <img ref={imgRef} src={imgSrc} alt={alt} className={className} onError={onImgError} onLoad={handleImgLoad} {...props} data-line={undefined} style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain' }} />
        <button
            onClick={handleCopy}
            className="copy-button-hook absolute top-2 right-2 px-2.5 py-1.5 bg-black/60 dark:bg-white/20 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1.5 z-10 hover:bg-black/80 font-medium no-print"
            title="복사"
            style={{ userSelect: 'none' }}
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span style={{ color: '#4ade80' }}>복사 완료</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>복사</span>
              </>
            )}
          </button>
      </div>
    );


};

const AsyncVideo = ({ src, absolutePath, rootFolder, resourceFolderHandle, workspaceType, api, queryString, style, className, ...props }: any) => {
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  useEffect(() => {
    let objectUrl = '';
    setErrorMsg('');
    const loadLocalVideo = async () => {
      try {
        if (api) {
          let targetAbsolutePath = absolutePath;
          if (src.startsWith('media://local/serve') || src.startsWith('media-local://')) {
             try {
               if (src.startsWith('media-local://')) {
                 targetAbsolutePath = decodeURIComponent(src.replace('media-local://', ''));
                 if (targetAbsolutePath.startsWith('/')) targetAbsolutePath = targetAbsolutePath.substring(1);
               } else {
                 const parsedUrl = new URL(src);
                 const extracted = parsedUrl.searchParams.get('url');
                 if (extracted) targetAbsolutePath = extracted;
               }
             } catch (e) {
               const m = src.match(/[?&]url=([^&]+)/);
               if (m) targetAbsolutePath = decodeURIComponent(m[1]);
             }
          }
          if (targetAbsolutePath && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('blob:') && (!src.startsWith('media://') || src.startsWith('media://local/serve'))) {
            // Electron의 registerFileProtocol을 타도록 media-local 스킴 사용
            // 윈도우 경로 인코딩 문제를 피하기 위해 쿼리스트링(?url=) 방식 사용
            setVideoSrc(`media-local://serve?url=${encodeURIComponent(targetAbsolutePath)}`);
          } else {
            setVideoSrc(src);
          }
        } else if ((workspaceType === 'browser' || workspaceType === 'local') && !src.startsWith('http') && !src.startsWith('data:')) {
          const pureSrc = src.split('?')[0].split('#')[0];
          
          const createTypedBlobUrl = (file: File, filename: string) => {
            const ext = filename.split('.').pop()?.toLowerCase();
            const mimeMap: Record<string, string> = {
              'mp4': 'video/mp4', 'webm': 'video/webm', 'ogg': 'video/ogg', 'mov': 'video/quicktime'
            };
            const type = mimeMap[ext || ''] || 'video/mp4';
            return URL.createObjectURL(new Blob([file], { type }));
          };

          let webTargetSrc = pureSrc;
          if (src.startsWith('media://local/serve') || src.startsWith('media-local://')) {
             try {
               let extractedPath = '';
               if (src.startsWith('media-local://')) {
                 extractedPath = decodeURIComponent(src.replace('media-local://', ''));
                 if (extractedPath.startsWith('/')) extractedPath = extractedPath.substring(1);
               } else {
                 const parsedUrl = new URL(src);
                 const extracted = parsedUrl.searchParams.get('url');
                 if (extracted) extractedPath = extracted;
               }
               if (extractedPath) {
                 // Convert absolute Windows path to root-relative path if it contains the root folder name
                 if (rootFolder?.name && extractedPath.includes(rootFolder.name)) {
                   const parts = extractedPath.replace(/\\/g, '/').split('/');
                   const rootIdx = parts.indexOf(rootFolder.name);
                   if (rootIdx !== -1) {
                     webTargetSrc = '/' + parts.slice(rootIdx).join('/');
                   } else {
                     webTargetSrc = extractedPath;
                   }
                 } else {
                   webTargetSrc = extractedPath;
                 }
               }
             } catch (e) {
               // ignore
             }
          }

          // 리소스 폴더 지정 안 됨 경고
          if (!resourceFolderHandle && !rootFolder?.handle && (webTargetSrc.startsWith('./media/') || webTargetSrc.startsWith('media/') || (webTargetSrc.startsWith('/media/') || webTargetSrc.startsWith('./media/')))) {
             setErrorMsg(`로컬 비디오를 보려면 좌측 하단의 '리소스 폴더 지정' 버튼을 클릭해 폴더를 연동해주세요.`);
             return;
          }

          if ((webTargetSrc.startsWith('/media/') || webTargetSrc.startsWith('./media/')) && resourceFolderHandle) {
             const fileName = webTargetSrc.replace(/^\.?\/media\//, '');
             const mediaDir = await resourceFolderHandle.getDirectoryHandle('media');
             const fileHandle = await mediaDir.getFileHandle(fileName);
             const file = await fileHandle.getFile();
             objectUrl = createTypedBlobUrl(file, fileName);
             setVideoSrc(objectUrl);
             return;
          }
          if (rootFolder?.handle) {
            // Remove drive letters like D: before splitting
            let cleanSrc = webTargetSrc.replace(/^[a-zA-Z]:[/\\]/, '');
            let pathParts = cleanSrc.split(/[/\\]/).filter(Boolean);
            if (pathParts[0] === rootFolder.name) pathParts.shift();
            let currentHandle = rootFolder.handle;
            
            // Validate all path parts before traversing to avoid 'Name is not allowed' DOMException
            const isValidName = (name: string) => !/[\\/:]/.test(name);
            let valid = true;
            for (let i = 0; i < pathParts.length - 1; i++) {
              if (!isValidName(pathParts[i])) { valid = false; break; }
              currentHandle = await currentHandle.getDirectoryHandle(pathParts[i]);
            }
            if (valid && pathParts.length > 0) {
              const fileName = pathParts[pathParts.length - 1];
              if (isValidName(fileName)) {
                const fileHandle = await currentHandle.getFileHandle(fileName);
                const file = await fileHandle.getFile();
                objectUrl = createTypedBlobUrl(file, fileName);
                setVideoSrc(objectUrl);
                return;
              }
            }
            setVideoSrc(src);
          } else {
            setVideoSrc(src);
          }
        } else {
          setVideoSrc(src);
        }
      } catch (e: any) {
        console.error(`[AsyncVideo] ERROR:`, e);
        setErrorMsg(`비디오 로드 실패: ${absolutePath} (${e.message})`);
        const fallbackSrc = `/api/view?filePath=${encodeURIComponent(absolutePath)}`;
        setVideoSrc(queryString ? (fallbackSrc.includes('?') ? fallbackSrc + '&' + queryString.substring(1) : fallbackSrc + queryString) : fallbackSrc);
      }
    };
    loadLocalVideo();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, absolutePath, rootFolder, resourceFolderHandle, workspaceType, api, queryString]);

  if (errorMsg) {
    return (
      <div className="border border-red-500 bg-red-100 dark:bg-red-900/20 p-2 rounded text-xs text-red-600 dark:text-red-400 break-all my-2">
        <strong>비디오 렌더링 에러:</strong><br/>
        경로: {absolutePath}<br/>
        에러: {errorMsg}
      </div>
    );
  }
  if (!videoSrc) return <div className="animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded w-full h-48 flex items-center justify-center my-2 text-zinc-500 text-sm">비디오 불러오는 중...</div>;
  return (
    <video controls src={videoSrc} style={style} className={`rounded-lg shadow-sm border border-zinc-200/30 max-w-full outline-none bg-black ${className || ''}`} preload="metadata" {...props} />
  );
};

const resolveRelativeImagePath = (srcPath: string, currentFileNodePath: string | undefined): string => {
  if (!srcPath) return "";

  // 앞뒤 꺾쇠 괄호 <> 제거 (경로 내 공백 처리를 위해 감싸진 경우 방어)
  let cleanSrcPath = srcPath.trim();
  if (cleanSrcPath.startsWith('<') && cleanSrcPath.endsWith('>')) {
    cleanSrcPath = cleanSrcPath.slice(1, -1);
  }

  if (cleanSrcPath.startsWith('http://') || cleanSrcPath.startsWith('https://') || cleanSrcPath.startsWith('data:') || cleanSrcPath.startsWith('blob:')) {
    return cleanSrcPath;
  }

  // URL 디코딩: 마크다운 파서가 한글/특수문자를 퍼센트 인코딩한 경우 파일시스템 경로로 복원
  let decoded = cleanSrcPath;
  try {
    decoded = decodeURIComponent(cleanSrcPath);
  } catch {
    decoded = cleanSrcPath;
  }

  // 윈도우 절대경로 (예: D:/, C:\ 등) 판별 시 그대로 반환
  const isAbsoluteWin = /^[a-zA-Z]:[\\/]/.test(decoded.replace(/\\/g, '/'));
  if (isAbsoluteWin) {
    return decoded.replace(/\\/g, '/');
  }

  let baseFolder = "";
  if (currentFileNodePath) {
    const normalizedFile = currentFileNodePath.replace(/\\/g, '/');
    const lastSlash = normalizedFile.lastIndexOf('/');
    if (lastSlash !== -1) {
      baseFolder = normalizedFile.substring(0, lastSlash);
    }
  }

  let cleanSrc = decoded.replace(/\\/g, '/');
  let isRootRelative = false;
  if (cleanSrc.startsWith('/')) {
    isRootRelative = true;
    cleanSrc = cleanSrc.substring(1);
  }

  if (cleanSrc.startsWith('./')) {
    cleanSrc = cleanSrc.substring(2);
  }

  let finalPath = "";
  if (isRootRelative) {
    finalPath = cleanSrc;
  } else if (baseFolder) {
    finalPath = baseFolder + '/' + cleanSrc;
  } else {
    finalPath = cleanSrc;
  }

  const segments = finalPath.split('/');
  const stack: string[] = [];
  for (const seg of segments) {
    if (seg === '.' || seg === '') continue;
    if (seg === '..') {
      stack.pop();
    } else {
      stack.push(seg);
    }
  }

  return stack.join('/');
};

// ====================================================================
// 📊 [OMD-CORE-MarkdownViewer-0009] MarkdownViewer ➔ remarkDisableIndentedCode
// 🎯 @KICK  : 4칸 들여쓰기/탭의 코드블록 인식을 차단하는 remark 플러그인
// 🛡️ @GUARD : micromarkExtensions에 codeIndented 비활성화 등록
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
// [ONR-MD-001] 들여쓰기 코드 블록 인식 차단: 4칸 들여쓰기/탭 입력 시 코드블록으로 인식되는 기본 마크다운 규격을 차단하는 커스텀 remark 플러그인입니다.
// 🛡️ 들여쓰기 4칸/탭 입력 시 코드블록으로 인식되는 것을 완전히 차단하는 플러그인
function remarkDisableIndentedCode(this: any) {
  const data = this.data();
  if (!data.micromarkExtensions) {
    data.micromarkExtensions = [];
  }
  data.micromarkExtensions.push({
    disable: { null: ['codeIndented'] }
  });
}

// 💡 [코드블록 내부 React 자식 노드 줄바꿈(\n) 단위 정밀 분할 헬퍼]
// highlight.js로 파싱된 React 노드 트리(span, text)를 줄 단위(array of lines)로 안전하게 분할 보존
function splitChildrenIntoLines(children: React.ReactNode): React.ReactNode[][] {
  const lines: React.ReactNode[][] = [[]];

  function processNode(node: React.ReactNode) {
    if (node === null || node === undefined || node === false) return;

    if (typeof node === 'string') {
      const parts = node.split('\n');
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) {
          lines.push([]);
        }
        if (parts[i].length > 0) {
          lines[lines.length - 1].push(parts[i]);
        }
      }
      return;
    }

    if (typeof node === 'number') {
      lines[lines.length - 1].push(String(node));
      return;
    }

    if (Array.isArray(node)) {
      for (const child of node) {
        processNode(child);
      }
      return;
    }

    if (React.isValidElement(node)) {
      const childNodes = React.Children.toArray((node.props as any)?.children);
      const subLines: React.ReactNode[][] = [[]];
      const processSubNode = (subNode: React.ReactNode): void => {
        if (typeof subNode === 'string') {
          const parts = subNode.split('\n');
          for (let i = 0; i < parts.length; i++) {
            if (i > 0) subLines.push([]);
            if (parts[i].length > 0) subLines[subLines.length - 1].push(parts[i]);
          }
          return;
        }
        if (Array.isArray(subNode)) {
          for (const c of subNode) processSubNode(c);
          return;
        }
        subLines[subLines.length - 1].push(subNode);
      };

      for (const c of childNodes) {
        processSubNode(c);
      }

      for (let i = 0; i < subLines.length; i++) {
        if (i > 0) lines.push([]);
        if (subLines[i].length > 0) {
          lines[lines.length - 1].push(
            React.cloneElement(node, { key: `${node.key || 'cb-line'}-${i}` }, ...subLines[i])
          );
        }
      }
      return;
    }

    lines[lines.length - 1].push(node);
  }

  processNode(children);
  // 마지막 행이 코드 끝 \n으로 인해 빈 배열인 경우 제거
  if (lines.length > 1 && lines[lines.length - 1].length === 0) {
    lines.pop();
  }
  return lines;
}

// ====================================================================
// 📊 [OMD-CORE-MarkdownViewer-0008] MarkdownViewer ➔ CodeBlock
// 🎯 @KICK  : 코드블록을 언어명 헤더 + 복사 버튼 + 개별 행(.onrivi-line) 1:1 라인 매핑 및 모노스페이스 렌더링
// 🛡️ @GUARD : navigator.clipboard.writeText API 존재 여부, 빈 행 \u200B 보존, AST/lineMap 기반 정밀 줄 번호 부여
// 🚨 @PATCH : **2026-09-17** — [코드블록 내부 에디터-미리보기 커서 위치 불일치 및 솟구침 결함 완벽 해결]: 코드블록 내부를 splitChildrenIntoLines로 분할하여 각 행마다 <span class="onrivi-line" data-line="...">를 1:1로 부여, 에디터 커서 이동 시 코드블록 내부 활성 줄 단독 하이라이트 및 Safe Zone 정밀 추종 연동
// 🔗 @CALLS : handleCopy, navigator.clipboard.writeText, splitChildrenIntoLines
// ====================================================================
function CodeBlock({ lang, code, className, node, lineMap, children, ...props }: { lang: string; code: string; className?: string; node?: any; lineMap?: number[]; children?: React.ReactNode; [key: string]: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[Onrivi Author] 복사 실패', err);
    }
  };

  const startLine = extractDataLine(props, node);
  const currentLineMap = lineMap || [];

  const splitLines = useMemo(() => {
    if (children) return splitChildrenIntoLines(children);
    if (code) return splitChildrenIntoLines([code]);
    return [];
  }, [children, code]);

  return (
    <div data-line={startLine} className="codeblock-area group my-4 rounded-lg bg-zinc-100/90 dark:bg-zinc-900/95 overflow-hidden shadow-sm select-text max-w-full border border-zinc-200/70 dark:border-zinc-800/90">
      {/* 코드블록 상단 헤더 (언어명 및 복사 버튼) */}
      <div data-line={startLine} className="codeblock-header flex items-center justify-between px-4 py-1.5 bg-zinc-200/80 dark:bg-zinc-800/95 h-9 border-b border-zinc-200/70 dark:border-zinc-800/90">
        <span className="codeblock-header-text text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          {lang || 'plaintext'}
        </span>
        <button
            onClick={handleCopy}
            className="copy-button-hook px-2.5 py-1 bg-black/20 dark:bg-white/10 hover:bg-black/40 dark:hover:bg-white/20 text-slate-100 rounded opacity-90 hover:opacity-100 transition-opacity text-xs flex items-center gap-1.5 z-10 font-medium no-print"
            title="복사"
            style={{ userSelect: 'none' }}
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span style={{ color: '#4ade80' }}>복사 완료</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>복사</span>
              </>
            )}
          </button>
      </div>
      
      <div className="overflow-x-auto w-full custom-scrollbar">
        <pre className="m-0 p-4 font-mono text-sm leading-normal bg-transparent w-max min-w-full text-zinc-800 dark:text-white">
          <code className={`hljs ${className || ''}`} style={{ whiteSpace: 'pre' }} {...props}>
            {splitLines.length > 0 ? (
              splitLines.map((lineItems, idx) => {
                const astStartLine = node?.position?.start?.line;
                let lineNum: number | undefined = undefined;
                if (astStartLine) {
                  const targetAstLine = astStartLine + 1 + idx;
                  lineNum = currentLineMap.length > 0
                    ? (currentLineMap[targetAstLine - 1] || targetAstLine)
                    : (startLine ? startLine + 1 + idx : targetAstLine);
                } else if (startLine) {
                  lineNum = startLine + 1 + idx;
                }
                return (
                  <span
                    key={idx}
                    data-line={lineNum}
                    className="onrivi-line block w-full min-h-[1.5em]"
                    style={{ whiteSpace: 'pre' }}
                  >
                    {lineItems.length > 0 ? lineItems : '\u200B'}
                  </span>
                );
              })
            ) : (
              children || code
            )}
            </code>
        </pre>
      </div>
    </div>
  );
}

// ====================================================================
// 📊 [OMD-CORE-MarkdownViewer-0007] MarkdownViewer ➔ TableWrapper
// 🎯 @KICK  : 마크다운 표를 HTML + TSV 형식으로 클립보드에 복사하는 래퍼 컴포넌트
// 🛡️ @GUARD : tableRef/tableEl 존재 여부 확인
// 🚨 @PATCH : **2026-09-03** — 표 주변의 외곽 테두리 카드 박스(border/shadow/rounded/bg-white/p-4)를 전면 제거하고 상단 마진을 mt-[2.5px]로 정밀 축소하여 상단 문구와의 밀착도 및 문서 자연스러움 극대화
// 🔗 @CALLS : handleCopy, ClipboardItem, navigator.clipboard.write
// ====================================================================
// 🛡️ [한글 주석 완벽 탑재] TableWrapper는 렌더링된 표 위에 마우스 오버 시 '시트/표형식 복사' 버튼을 표시하고, 
// 클릭하면 MS 오피스(워드, 엑셀) 및 한글 프로그램 등에 표 형태로 바로 붙여넣어지도록 HTML과 탭 구분 텍스트(TSV)로 클립보드에 적재해 주는 컴포넌트입니다.
function TableWrapper({ children, ...restProps }: { children: React.ReactElement; [key: string]: any }) {
  const [copied, setCopied] = useState(false);
  const tableRef = React.useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    if (!tableRef.current) return;
    const tableEl = tableRef.current.querySelector('table');
    if (!tableEl) return;

    try {
      // 1. HTML 데이터 추출 (복제하여 복사 버튼 등 외부 UI 태그가 들어가는 것 차단)
      const clone = tableEl.cloneNode(true) as HTMLTableElement;
      clone.removeAttribute('class');
      const tableHtml = clone.outerHTML;

      // 2. Plain Text (탭 구분 텍스트) 추출 (엑셀 등에 깔끔하게 붙여넣을 수 있도록 TSV 구성)
      const rows = Array.from(tableEl.querySelectorAll('tr'));
      const textLines = rows.map(row => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        return cells.map(cell => cell.textContent?.trim() || '').join('\t');
      });
      const tableText = textLines.join('\n');

      // 3. 클립보드 다중 타입 데이터 적재
      if (navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([tableHtml], { type: 'text/html' });
        const plainBlob = new Blob([tableText], { type: 'text/plain' });
        
        const data = new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': plainBlob
        });
        await navigator.clipboard.write([data]);
      } else {
        await navigator.clipboard.writeText(tableText);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[Onrivi Author] 시트/표형식 복사 실패', err);
    }
  };

  // [ONR-MD-004] 표 데이터 래퍼 컴포넌트: 마크다운 렌더링 내의 표(table) 태그를 수신하여 가로 스크롤 레이아웃으로 감싸고, 마우스 오버 시 스프레드시트 호환 규격 복사 버튼을 제공하는 고기능 래퍼입니다.
  return (
    <div ref={tableRef} className="table-wrapper-area relative group overflow-x-auto select-text w-full max-w-full" {...restProps}>
      {/* 마우스 호버 시 우측 상단에 노출되는 미려한 시트/표형식 복사 단추 */}
      <button
            onClick={handleCopy}
            className="copy-button-hook absolute top-1 right-1 px-2 py-1 bg-black/60 dark:bg-white/20 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity text-[11px] flex items-center gap-1 z-10 hover:bg-black/80 font-medium no-print"
            title="복사"
            style={{ userSelect: 'none' }}
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span style={{ color: '#4ade80' }}>복사 완료</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>복사</span>
              </>
            )}
          </button>
      {children}
    </div>
  );
}

// ====================================================================
// 📊 [OMD-CORE-MarkdownViewer-0006] MarkdownViewer ➔ loadMermaidScript
// 🎯 @KICK  : Mermaid CDN 스크립트를 동적으로 로드하고 초기화 (SSR 번들 충돌 방지)
// 🛡️ @GUARD : window.mermaid 존재 시 재사용; 중복 로딩 방지용 mermaidPromise 캐싱
// 🚨 @PATCH : **2026-06-20** — Mermaid 로드 시 define이 undefined인 비동기 갭 동안 Monaco 에디터 로더가 모듈을 호출해 TypeError: define is not a function이 발생하는 충돌을 방지하기 위해, fetch + eval 방식을 우선 구동하여 define 비활성 시간차를 차단하고 Monaco 에디터 로딩을 안정화; 확장프로그램 등 eval이 금지된 CSP 환경에서 eval 에러 발생 시 동적 script 태그 로드 방식으로 즉시 자동 우회하는 예외 처리 구현
// 🔗 @CALLS : mermaid.initialize
// ====================================================================
// 🛡️ [한글 주석 완벽 탑재] 비동기 글로벌 Mermaid 스크립트 로더
// Next.js app directory hydration + AMD define 충돌 + file:// 상대경로 3대 문제 대응:
// 1) 동적 <script src="./mermaid.min.js"> 생성 (CSP 'self' 허용, 상대경로로 file:// 대응)
// 2) define 일시 제거 → mermaid UMD global 할당(window.mermaid) 강제 (AMD 충돌 회피)
// 3) CSP 차단 시 fetch + eval 폴백 (CSP 'unsafe-eval' 허용)
let mermaidPromise: Promise<any> | null = null;
const mermaidSvgCache = new Map<string, string>();
const loadMermaidScript = (): Promise<any> => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if ((window as any).mermaid) {
    return Promise.resolve((window as any).mermaid);
  }
  if (mermaidPromise) {
    return mermaidPromise;
  }

  mermaidPromise = new Promise((resolve) => {
    const loaded = () => {
      const m = (window as any).mermaid;
      if (m) {
        m.initialize({
          startOnLoad: false,
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
          securityLevel: 'loose',
        });
        resolve(m);
      } else {
        mermaidPromise = null;
        resolve(null);
      }
    };

    const loadViaScriptTag = (savedDefine: any, callback: () => void) => {
      if ((window as any).mermaid) {
        callback();
        return;
      }
      (window as any).define = undefined;
      const script = document.createElement('script');
      script.src = './mermaid.min.js';
      const done = () => {
        if ((window as any).define === undefined) {
          (window as any).define = savedDefine;
        }
      };
      script.onload = () => { done(); callback(); };
      script.onerror = () => {
        done();
        mermaidPromise = null;
        resolve(null);
      };
      document.head.appendChild(script);
    };

    // 1) 레이스 컨디션 완벽 차단: <script> 비동기 태그 대신 fetch + eval 동기 실행으로만 로드합니다.
    //    이를 통해 define이 undefined로 유지되는 시간차(비동기 갭)를 소거하여 Monaco 에디터 로더와의 충돌을 원천 차단합니다.
    fetch('./mermaid.min.js')
      .then(r => r.text())
      .then(code => {
        const savedDefine = (window as any).define;
        (window as any).define = undefined;
        let evalSuccess = false;
        try {
          (0, eval)(code);
          evalSuccess = true;
        } catch (_) {
          // CSP 차단 등으로 eval 실패 (확장프로그램 환경 등)
        }
        if ((window as any).define === undefined) {
          (window as any).define = savedDefine;
        }
        
        if (evalSuccess && (window as any).mermaid) {
          loaded();
        } else {
          // eval 실패 시 script 태그를 통한 로딩으로 우회
          loadViaScriptTag(savedDefine, loaded);
        }
      })
      .catch(() => {
        // 2) 최후의 수단으로 fetch 실패 시에만 <script> 태그 비동기 로드 fallback 시도
        loadViaScriptTag((window as any).define, loaded);
      });
  });
  return mermaidPromise;
};

// 🛡️ [한글 주석 완벽 탑재] MermaidBlock은 머메이드 차트 원본 텍스트를 파싱하여 SVG 다이어그램 이미지로 실시간 변환 렌더링하고,
// 이미지 저장(PNG 다운로드) 및 이미지 복사(클립보드 기입) 툴바를 제공해 오피스 프로그램에 바로 붙여넣게 도와주는 컴포넌트입니다.
// ====================================================================
// 📊 [OMD-CORE-MarkdownViewer-0005] MarkdownViewer ➔ MermaidBlock
// 🎯 @KICK  : Mermaid 차트 텍스트를 SVG로 실시간 변환 렌더링 및 이미지 저장/복사 툴바 제공
// 🛡️ @GUARD : Mermaid 라이브러리 로드 실패 시 에러 메시지 표시; 문법 무결성 사전 검증
// 🚨 @PATCH : 대괄호/소괄호 전각 문자 변환으로 파싱 에러 방지; 렌더링 ID 충돌 방지용 타임스탬프; <br> → \n 전역 변환 (HTML 태그 파싱 충돌 방지); NBSP(\u00a0) → 공백 치환 + class 세미콜론(;) 제거 (외부 복사 노이즈 내성 강화) | 2026-06-18; **2026-06-20** — 다이어그램 이미지 저장(handleSaveImage) API 호출 버그 수정(saveFileAs) 및 웹 다운로드 폴백 적용
// 🔗 @CALLS : loadMermaidScript, handleCopyImage, handleSaveImage, handleCopyCode
// ====================================================================
const MermaidBlock = React.memo(function MermaidBlock({ code, dataLine }: { code: string; dataLine?: number | string }) {
  const { showToast } = useToast();
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const mermaidRetryRef = useRef(0);
  const mermaidRetryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 🔍 다이어그램 새 창으로 확대 뷰잉 기능 구현 (데스크탑/웹 환경 분기 처리)
  const openInNewWindow = async () => {
    if (!containerRef.current) return;
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    let svgWidth = 800;
    let svgHeight = 600;
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.split(/[ ,]+/);
      if (parts.length === 4) {
        svgWidth = parseFloat(parts[2]);
        svgHeight = parseFloat(parts[3]);
      }
    } else {
      const attrWidth = svgElement.getAttribute('width');
      const attrHeight = svgElement.getAttribute('height');
      if (attrWidth && attrHeight) {
        svgWidth = parseFloat(attrWidth);
        svgHeight = parseFloat(attrHeight);
      }
    }

    // 💡 인라인 스타일 및 width/height 족쇄 제거하여 브라우저에 맞춤 반응하도록 가공
    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
    svgClone.removeAttribute('style');
    svgClone.style.maxWidth = 'none';
    svgClone.style.width = '100%';
    svgClone.style.height = 'auto';
    svgClone.style.display = 'block';

    const svgData = new XMLSerializer().serializeToString(svgClone);

    // 모니터 크기에 맞춰 적절한 윈도우 크기 동적 할당
    const winWidth = Math.min(svgWidth + 100, window.screen.availWidth * 0.85);
    const winHeight = Math.min(svgHeight + 150, window.screen.availHeight * 0.85);

    // ✅ 데스크탑(Electron) 환경: IPC 경유로 BrowserWindow 직접 생성 (window.open 팝업 차단 우회)
    const isDesktop = typeof window !== 'undefined' && typeof (window as any).electronAPI?.openMermaidWindow === 'function';
    if (isDesktop) {
      const result = await (window as any).electronAPI.openMermaidWindow(svgData, {
        width: Math.round(winWidth),
        height: Math.round(winHeight),
      });
      if (result && !result.success) {
        showToast(`💡 다이어그램 창 열기 실패: ${result.error}`, 'warning');
      }
      return;
    }

    // 🌐 웹 브라우저 환경: 기존 window.open() 방식 유지
    const newWindow = window.open(
      '',
      '_blank',
      `width=${winWidth},height=${winHeight},resizable=yes,scrollbars=yes`
    );

    if (!newWindow) {
      showToast("💡 브라우저의 팝업이 차단되었습니다. 주소창 우측에서 팝업을 허용해주세요!", 'warning');
      return;
    }

    newWindow.document.open();
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Onrivi 다이어그램 돋보기</title>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #ffffff;
            overflow: auto;
          }
          .svg-container {
            padding: 40px;
            box-sizing: border-box;
            width: 100%;
            max-width: 95%;
            height: auto;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          svg {
            width: 100% !important;
            height: auto !important;
            max-width: 100% !important;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="svg-container">
          ${svgData}
        </div>
      </body>
      </html>
    `);
    newWindow.document.close();
  };

  const getHighResCanvas = async (svgElement: SVGSVGElement): Promise<HTMLCanvasElement | null> => {
    let svgWidth = 800;
    let svgHeight = 600;
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.split(/[ ,]+/);
      if (parts.length === 4) {
        svgWidth = parseFloat(parts[2]);
        svgHeight = parseFloat(parts[3]);
      }
    } else {
      const attrWidth = svgElement.getAttribute('width');
      const attrHeight = svgElement.getAttribute('height');
      if (attrWidth && attrHeight) {
        svgWidth = parseFloat(attrWidth);
        svgHeight = parseFloat(attrHeight);
      } else {
        const rect = svgElement.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          svgWidth = rect.width;
          svgHeight = rect.height;
        }
      }
    }

    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
    svgClone.removeAttribute('style');
    svgClone.style.maxWidth = 'none';
    svgClone.style.width = `${svgWidth}px`;
    svgClone.style.height = `${svgHeight}px`;
    svgClone.setAttribute('width', svgWidth.toString());
    svgClone.setAttribute('height', svgHeight.toString());

    // 💡 3배 고해상도 해상도로 스케일 업하여 글씨 깨짐 및 축소 현상 방지
    const scaleFactor = 3;
    const canvas = document.createElement('canvas');
    canvas.width = svgWidth * scaleFactor;
    canvas.height = svgHeight * scaleFactor;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scaleFactor, scaleFactor);

    const svgData = new XMLSerializer().serializeToString(svgClone);
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    
    await new Promise((resolve) => img.onload = resolve);
    ctx.drawImage(img, 0, 0, svgWidth, svgHeight);

    return canvas;
  };

  const handleCopyImage = async () => {
    if (!containerRef.current) return;
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    try {
      const canvas = await getHighResCanvas(svgElement);
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setImageCopied(true);
          setTimeout(() => setImageCopied(false), 2000);
        }
      }, 'image/png');
    } catch (err) {
      console.error('이미지 복사 실패:', err);
    }
  };

  const handleSaveImage = async () => {
    if (!containerRef.current) return;
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    try {
      const canvas = await getHighResCanvas(svgElement);
      if (!canvas) return;

      const dataUrl = canvas.toDataURL('image/png');
      const api = (window as any).electronAPI;
      if (api && api.saveFileAs) {
        await api.saveFileAs(dataUrl, 'diagram.png', '', [{ name: 'PNG Image', extensions: ['png'] }]);
      } else {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'diagram.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('이미지 저장 실패:', err);
    }
  };

  // 다크모드 상태 추적
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
      
      const observer = new MutationObserver(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    const cacheKey = `${code}|${isDark ? 'dark' : 'light'}`;
    const cachedSvg = mermaidSvgCache.get(cacheKey);
    if (cachedSvg) {
      setSvgHtml(cachedSvg);
      setLoading(false);
      setError(null);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);

    // 💡 [디바운스 가드] 300ms 대기 후 렌더링하여 타이핑 중 연속 파싱/렌더링으로 인한 화면 굳음 현상 방지
    const debounceTimer = setTimeout(() => {
      const renderChart = async () => {
        const mermaidObj = await loadMermaidScript();
        if (!mermaidObj) {
          if (active && mermaidRetryRef.current < 3) {
            mermaidRetryRef.current++;
            mermaidRetryTimerRef.current = setTimeout(renderChart, 3000);
          } else if (active) {
            setError('Mermaid 라이브러리를 로드하지 못했습니다.');
            setLoading(false);
          }
          return;
        }
        mermaidRetryRef.current = 0;

        // 🛡️ 매 렌더링마다 유일한 임시 ID를 생성하여 Mermaid 렌더러 간 캐시 충돌을 원천 차단 (무한 펜딩 방지)
        const renderId = `mermaid-temp-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

        // 💡 [Mermaid 전처리 가드] 큰따옴표 안쪽의 대괄호([, ]) 및 소괄호((, )) 문법이 파싱 에러를 유발하는 현상을
        // 렌더링 전에 자동으로 전각 문자(［, ］, （, ）)로 자동 보정하여 구문 에러를 원천 예방합니다.
        // 또한 마크다운 파서로 인해 HTML 이스케이프된 기호(&gt;, &lt; 등)를 본래의 코드로 복구합니다.
        let cleanCode = code;
        
        // 💡 [Mermaid 중첩 백틱 가드 2026-07-04] 코드 내용에 실수로 중첩 삽입된 ```mermaid 및 ``` 펜스 기호들을 제거합니다.
        try {
          cleanCode = cleanCode
            .replace(/```mermaid\s*/gi, '')
            .replace(/```\s*$/gi, '')
            .replace(/```/g, '');
        } catch (_) {}

        try {
          cleanCode = cleanCode
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"');
        } catch (_) {}

        // 💡 [Mermaid 문법 정제 가드] 붙여넣기 등으로 유입된 유령 공백(NBSP) 및 잘못된 class 문법 세미콜론 제거
        // 💡 [추가 패치 2026-07-04] 불필요한 빈 줄(\r 등)이나 줄 끝의 불완전한 공백들을 제거하여 문법 에러 최소화
        // 💡 [화살표 텍스트 간격 보정 가드 2026-07-04] 띄어쓰기가 없는 '--텍스트-->' 문법을 파서 호환을 위해 '-- 텍스트 -->' 로 자동 치환
        // 💡 [subgraph 명칭 자동 따옴표 래핑 가드 2026-07-04] subgraph 명칭에 공백/괄호가 포함되었으나 따옴표가 없으면 강제로 따옴표 씌우기
        try {
          cleanCode = cleanCode
            .replace(/\u00a0/g, ' ')
            .replace(/\r/g, '')
            .replace(/^class\s+\S+\s+\S+;/gm, (m) => m.slice(0, -1))
            .replace(/--([^-<>]+)-->/g, '-- $1 -->')
            .replace(/==([^=<>]+)==>/g, '== $1 ==>')
            .replace(/subgraph\s+([^"\n\r]+)$/gm, (match, title) => {
              const trimmed = title.trim();
              // 이미 따옴표가 있거나 방향 지시어(direction)인 경우는 건너뜀
              if (trimmed.startsWith('"') || trimmed.startsWith('\'') || trimmed.match(/^(TB|TD|BT|RL|LR)$/i)) {
                return match;
              }
              return `subgraph "${trimmed}"`;
            });
        } catch (_) {}

        // 💡 [Mermaid 깨진 라인/외톨이 괄호 자동 수리 가드 2026-07-04] 
        // 입력 도중 또는 실수로 복사된 줄 끝의 외톨이 닫는 괄호 ')' 나 불완전한 화살표 연결을 자동 복구합니다.
        try {
          const lines = cleanCode.split('\n');
          const fixedLines = lines.map(line => {
            let l = line.trimRight();
            // Case 1: '--> |텍스트| )' 또는 '--> )' 와 같이 화살표 뒤에 닫는 괄호 하나만 덜렁 있는 경우 제거
            if (l.match(/(-->|==>|-\.-\>)\s*(\|[^|]*\|)?\s*\)$/)) {
              l = l.replace(/\s*\)$/, '');
            }
            // Case 2: '--> |텍스트|' 혹은 '-->' 로 줄이 끝나고 다음 연결 노드가 누락된 경우, 임시 노드 'temp'를 붙여 파서 붕괴 예방
            if (l.endsWith('-->') || l.endsWith('==>') || l.endsWith('-.->')) {
              l = l + ' temp["..."]';
            }
            return line.endsWith('\n') ? l + '\n' : l;
          });
          cleanCode = fixedLines.join('\n');
        } catch (_) {}

        // 💡 [따옴표 내부 전각화 가드]
        try {
          cleanCode = cleanCode.replace(/"([^"]*)"/g, (match, p1) => {
            const sanitized = p1
              .replace(/\[/g, '［')
              .replace(/\]/g, '］')
              .replace(/\(/g, '（')
              .replace(/\)/g, '）');
            return `"${sanitized}"`;
          });
        } catch (_) {}

        // 💡 [대괄호 내부 소괄호 중첩 복구 가드 2026-07-04] 따옴표 없이 사용된 P[텍스트(프로젝트)] 와 같은 중첩 소괄호 전각화
        try {
          // [내부 텍스트(소괄호)텍스트] 패턴 감지하여 안쪽 소괄호만 전각으로 교환
          cleanCode = cleanCode.replace(/\[([^\]\n]*?)\(([^\]\n]*?)\)([^\]\n]*?)\]/g, (match, p1, p2, p3) => {
            return `[${p1}（${p2}）${p3}]`;
          });
        } catch (_) {}

        // 💡 [Mermaid 노드 외곽 괄호 수리 가드] 노드명 뒤에 따옴표 없이 대괄호/소괄호가 올 때, 
        // 괄호 내부에 다른 기호가 있으면 파서가 충돌하므로 안전하게 전각 문자로 보정합니다.
        try {
          cleanCode = cleanCode.replace(/(\[|{|{|\(|=>)\s*([^\]\)\n\"\'`]*?)([\/\:\;\*\&]+)([^\]\)\n\"\'`]*?)\s*(\]|}|\)|=>)/g, (match, open, prefix, invalidChar, suffix, close) => {
            const safeMid = (prefix + invalidChar + suffix).replace(/[\/\:\;\*\&]/g, ' ');
            return `${open}${safeMid}${close}`;
          });
        } catch (_) {}

        try {
          cleanCode = cleanCode.replace(/<br\s*\/?>/gi, '\\n');
        } catch (_) {}

        try {
          // 💡 [문법 무결성 사전 검증 가드] 타이핑 도중의 미완성 문법을 컴포넌트 락 없이 우회 유치
          let isValid = false;
          let parserErrorMsg = '';
          try {
            // v10+ parse API는 Promise를 반환하거나 에러를 throw할 수 있으므로 안전하게 처리
            const parseResult = mermaidObj.parse(cleanCode);
            if (parseResult instanceof Promise) {
              await parseResult;
            }
            isValid = true;
          } catch (parseErr: any) {
            console.error('[Onrivi Author] Mermaid parse error:', parseErr);
            parserErrorMsg = parseErr?.message || String(parseErr);
            isValid = false;
          }

          if (!isValid) {
            if (active) {
              setError(`🎨 Onrivi Author: 다이어그램 문법을 입력하는 중이거나 문법이 불완전합니다. (${parserErrorMsg.substring(0, 150)})`);
              setLoading(false);
            }
            return;
          }

          mermaidObj.initialize({
            startOnLoad: false,
            theme: isDark ? 'dark' : 'default',
            securityLevel: 'loose',
            suppressErrors: true, // 에러 팝업 억제
          });

          // 비동기 렌더링을 통한 SVG 생성
          const { svg } = await mermaidObj.render(renderId, cleanCode);
          if (active) {
            mermaidSvgCache.set(cacheKey, svg);
            setSvgHtml(svg);
            setLoading(false);
          }
        } catch (err: any) {
          console.warn('[Onrivi Author] Mermaid 렌더링 실패 가드 가동', err);
          if (active) {
            setError('🎨 Onrivi Author: 다이어그램 렌더링 중 문법 충돌로 오류가 발생했습니다.');
            setLoading(false);
          }
          const badEl = document.getElementById(renderId);
          if (badEl) badEl.remove();
        }
      };

      renderChart();
    }, 300);

    return () => {
      active = false;
      clearTimeout(debounceTimer);
      if (mermaidRetryTimerRef.current) {
        clearTimeout(mermaidRetryTimerRef.current);
        mermaidRetryTimerRef.current = null;
      }
    };
  }, [code, isDark]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(`\`\`\`mermaid\n${code}\n\`\`\``);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  return (
    <div ref={containerRef} data-line={dataLine} className="relative group my-6 border border-zinc-200/60  rounded-lg overflow-hidden shadow-sm bg-white  select-text">

      <div className="flex items-center justify-between px-4 py-2 bg-zinc-50  border-b border-zinc-200/60 ">
        <span className="text-xs font-semibold text-zinc-500  uppercase tracking-wider flex items-center gap-1.5">
          📊 다이어그램 (Mermaid)
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyCode}
            className="text-[11px] px-2.5 py-1 rounded bg-white  border border-zinc-200  text-zinc-600  hover:bg-zinc-50 :bg-zinc-700 active:scale-95 transition-all shadow-sm font-medium cursor-pointer"
            title="마크다운 소스 복사"
          >
            {copied ? '✓ 코드 복사됨' : '코드 복사'}
          </button>
          {!error && !loading && (
            <>
              <button
                onClick={openInNewWindow}
                className="text-[11px] px-2.5 py-1 rounded bg-white  border border-zinc-200  text-zinc-600  hover:bg-zinc-50 :bg-zinc-700 hover:text-blue-600 :text-blue-400 active:scale-95 transition-all shadow-sm font-medium cursor-pointer"
                title="다이어그램을 새 웹브라우저 창으로 크게 보기"
              >
                🔍 새 창으로 확대
              </button>
              <button
                onClick={handleCopyImage}
                className="text-[11px] px-2.5 py-1 rounded bg-white  border border-zinc-200  text-zinc-600  hover:bg-zinc-50 :bg-zinc-700 hover:text-blue-600 :text-blue-400 active:scale-95 transition-all shadow-sm font-medium cursor-pointer"
                title="차트 이미지를 클립보드에 복사해 워드나 한글에 바로 붙여넣기"
              >
                {imageCopied ? '✓ 이미지 복사됨' : '이미지 복사'}
              </button>
              <button
                onClick={handleSaveImage}
                className="text-[11px] px-2.5 py-1 rounded bg-white  border border-zinc-200  text-zinc-600  hover:bg-zinc-50 :bg-zinc-700 hover:text-blue-600 :text-blue-400 active:scale-95 transition-all shadow-sm font-medium cursor-pointer"
                title="차트를 PNG 파일로 저장"
              >
                💾 저장
              </button>
            </>
          )}
        </div>
      </div>
      <div className="p-6 flex flex-col justify-center items-center overflow-x-auto min-h-[100px]">
        {loading && <div className="text-sm text-zinc-400  flex items-center gap-2">🔄 차트를 렌더링하는 중...</div>}
        {error && (
          <div className="text-sm text-red-500 bg-red-50  border border-red-200  rounded-md p-4 w-full font-mono">
            <div className="flex items-center justify-between border-b border-red-200/55  pb-2 mb-2">
              <span className="font-semibold flex items-center gap-1">⚠️ 렌더링 에러</span>
              <button 
                onClick={() => setShowRaw(!showRaw)}
                className="text-[10px] px-2 py-0.5 rounded bg-white  border border-red-300  text-red-700  hover:bg-red-100/50 cursor-pointer transition-all active:scale-95"
              >
                {showRaw ? '코드 접기' : '코드 원본 보기'}
              </button>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed">{error}</div>
            
            {showRaw && (
              <div className="mt-3 p-3 bg-zinc-900  text-zinc-300  rounded border border-zinc-800 text-xs overflow-x-auto select-all max-h-[250px]">
                {code}
              </div>
            )}
          </div>
        )}
        {!loading && !error && (
          <div 
            onDoubleClick={openInNewWindow}
            title="더블클릭하면 새 웹브라우저 창으로 크게 확대해서 볼 수 있습니다."
            className="w-full flex justify-center mermaid-svg-container cursor-zoom-in"
            dangerouslySetInnerHTML={{ __html: svgHtml }} 
          />
        )}
      </div>
    </div>
  );
});

// ====================================================================
// 📊 [OMD-CORE-MarkdownViewer-0004] MarkdownViewer ➔ MarkdownViewer
// 🎯 @KICK  : 마크다운 텍스트를 ReactMarkdown으로 렌더링 - 코드블록, 표, 머메이드, 이미지 경로 변환 등 고기능 뷰어
// 🛡️ @GUARD : 이미지 경로는 media:// 프록시로 변환; HTML 이스케이프/위키링크 전처리
// 🚨 @PATCH : 쿼리 스트링 분리 가드, 웰컴 페이지 예외 가드, 단위 자동 보완 가드
// 🔗 @CALLS : CodeBlock, TableWrapper, MermaidBlock, rehypeSourceLinesPlugin, rehypeBrRaw, cleanContent
// ====================================================================
function MarkdownViewer({
  content, originalContent, lineMap, onCheckboxToggle, currentFilePath, rootFolderPath,
  onFileOpen, listIndent, marginTop, marginBottom, marginLeft, marginRight, bibContent, rootFolder, resourceFolderHandle, resourceFolder, workspaceType,
  onImageLoaded, activeLine, customCss
}: MarkdownViewerProps) {

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef(content);
  const originalContentRef = useRef(originalContent);
  const dynamicPropsRef = useRef({ lineMap, onCheckboxToggle, currentFilePath, rootFolderPath, onFileOpen, rootFolder, resourceFolderHandle, resourceFolder, workspaceType });
  dynamicPropsRef.current = { lineMap, onCheckboxToggle, currentFilePath, rootFolderPath, onFileOpen, rootFolder, resourceFolderHandle, resourceFolder, workspaceType };

  const frontmatterCustomCss = useMemo(() => {
    if (!content) return '';
    try {
      const { data } = extractFrontmatter(content);
      return data.custom_css || data.customCss || data.css || '';
    } catch {
      return '';
    }
  }, [content]);

  useEffect(() => {
    contentRef.current = content;
    originalContentRef.current = originalContent;
  }, [content, originalContent]);

// ====================================================================
// 📊 [OMD-CORE-MarkdownViewer-0003] MarkdownViewer ➔ cleanContent
// 🎯 @KICK  : 마크다운 원문 전처리 - 위키링크 변환, 괄호 링크 이스케이프, 목록 번호 방어
// 🛡️ @GUARD : 숫자+괄호 패턴을 백슬래시 이스케이프로 목록 변환 방지
// 🚨 @PATCH : 소괄호 포함 URL 파싱 깨짐 방지를 위해 <> 래핑 필터 적용
// 🔗 @CALLS : 없음
// ====================================================================
  // 🛡️ [마크다운 원본 우회] 마크다운 본문의 HTML 이스케이프 깨짐 방지를 위해 원본 내용을 직접 컴포넌트에 공급합니다.
  // 💡 [한글 주석] 마크다운 링크 주소 내부에 소괄호()가 포함되어 파싱이 깨지는 현상 방지 필터 (부등호 <> 래핑 처리)
  const cleanContent = useMemo(() => {
    if (!content) return "";
    
    // 🛡️ [Frontmatter 메타데이터 숨김] 뷰어에 메타데이터(예: css_profile)가 노출되지 않도록 전처리
    const { content: strippedContent } = extractFrontmatter(content);
    let processed = strippedContent;
    
    // 🛡️ [목록 번호 변환 방어]
    // 1) 웹 모드 처럼 숫자에 괄호 닫기 패턴(예: 1) )을 라인 시작 지점에 작성했을 때,
    // 마크다운 파서가 이를 ordered list <ol> 목록으로 오해하여 1. 등으로 변환 렌더링하는 것을 방지하기 위해 괄호 앞에 백슬래시 이스케이프(\))를 자동 적용합니다.
    // 🛡️ [Setext 헤딩 오작동 방어]
    // 본문 문장 바로 아랫줄에 - 기호만 단독으로 입력했을 때(리스트 작성 타이핑 중),
    // 마크다운 파서가 윗줄 문장을 H2 Setext 제목으로 오인하여 볼드로 바꾸는 현상을 방지하기 위해 이스케이프(\-) 처리
    processed = processed.replace(/(^[ \t]*)-([ \t]*)$/gm, '$1\\-$2');
    processed = processed.replace(/(^[ \t]*)=+([ \t]*)$/gm, '$1\\=$2');

    // 💡 [옵시디언 위키링크 변환 필터 개선]
    // 1) 헤딩 링크: [[../path.md#1. 제목]] -> [1. 제목](<../path.md#1. 제목>)
    // 2) 별칭 링크: [[../path.md#1. 제목|요약]] -> [요약](<../path.md#1. 제목>)
    // 3) 문서 링크: [[../path.md]] -> [path](<../path.md>) (확장자 .md 및 상대경로 제거)
    const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
    processed = processed.replace(wikiLinkRegex, (match, linkTarget, customText) => {
      const trimmedTarget = linkTarget.trim();
      let text = '';
      if (customText && customText.trim()) {
        text = customText.trim();
      } else {
        const hashIdx = trimmedTarget.indexOf('#');
        if (hashIdx !== -1) {
          // # 뒤의 헤딩 제목만 깔끔하게 링크명으로 표시
          const headingPart = trimmedTarget.slice(hashIdx + 1).trim();
          text = headingPart || trimmedTarget;
        } else {
          // 파일명에서 디렉토리 경로 및 .md/.markdown 확장자를 제거하여 깔끔한 문서명으로 표시
          const rawFileName = trimmedTarget.split(/[/\\]/).pop() || trimmedTarget;
          text = rawFileName.replace(/\.(md|markdown)$/i, '');
        }
      }
      return `[${text}](<${trimmedTarget}>)`;
    });

    const mdLinkRegex = /\[([^\]]+)\]\(((?:[^()]|\([^()]*\))+)\)/g;
    processed = processed.replace(mdLinkRegex, (match, text, url) => {
      if (url.startsWith('<') && url.endsWith('>')) {
        return match;
      }
      return `[${text}](<${url}>)`;
    });

    // 💡 [연속 엔터 빈 줄 완벽 보존] 엔터 2회 이상의 다중 빈 행이 있을 때 빈 문단(&nbsp;)으로 보존
    processed = processed.replace(/\n{3,}/g, (match) => '\n\n' + '&nbsp;\n\n'.repeat(match.length - 2));

    // 💡 [인라인 연속 스페이스 및 탭 1:1 보존]
    // 코드블록(```) 영역을 제외하고 문장/리스트 중간의 2칸 이상 연속 공백을 &nbsp;로 변환하여 1:1 유지
    const codeBlockSplits = processed.split(/(```[\s\S]*?```)/g);
    processed = codeBlockSplits.map((block, idx) => {
      if (idx % 2 === 1) return block; // 코드블록 내부는 원본 유지
      return block.split('\n').map(line => {
        const isListItem = /^[ \t]*([*+-]|\d+\.)\s+/.test(line);
        if (isListItem) {
          // 리스트 항목: 마크다운 리스트 인덴트 문법 보존 + 내용 내 2칸 이상 공백 보존
          const listMatch = line.match(/^([ \t]*[*+-]|[ \t]*\d+\.)\s+(.*)$/);
          if (listMatch) {
            const prefix = listMatch[1];
            let body = listMatch[2];
            body = body.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ {2,}/g, (spaces) => '&nbsp;'.repeat(spaces.length));
            return `${prefix} ${body}`;
          }
          return line;
        }
        // 인용구: 마크다운 인용구 문법(> 기호 및 Alert 태그) 보존 + 본문 내 2칸 이상 공백 보존
        const isQuote = /^[ \t]*>/.test(line);
        if (isQuote) {
          const quoteMatch = line.match(/^([ \t]*>+[ \t]*)(.*)$/);
          if (quoteMatch) {
            const prefix = quoteMatch[1];
            let body = quoteMatch[2];
            const alertTagMatch = body.match(/^(\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\])(.*)$/i);
            if (alertTagMatch) {
              const tag = alertTagMatch[1];
              let tagBody = alertTagMatch[2];
              tagBody = tagBody.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ {2,}/g, (spaces) => '&nbsp;'.repeat(spaces.length));
              return `${prefix}${tag}${tagBody}`;
            }
            body = body.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ {2,}/g, (spaces) => '&nbsp;'.repeat(spaces.length));
            return `${prefix}${body}`;
          }
          return line;
        }
        // 일반 문장: 행 시작 공백/탭 및 문장 내 2칸 이상 공백 모두 1:1 보존
        const leadMatch = line.match(/^([ \t]*)(.*)$/);
        if (!leadMatch) return line;
        let lead = leadMatch[1];
        let rest = leadMatch[2];
        lead = lead.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ /g, '&nbsp;');
        rest = rest.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ {2,}/g, (spaces) => '&nbsp;'.repeat(spaces.length));
        return lead + rest;
      }).join('\n');
    }).join('');

    return processed;
  }, [content]);

  // 🛡️ [들여쓰기 및 인덴트 가드] 에디터 원본 텍스트의 해당 줄에 있는 탭과 공백을 계산하여 스타일(marginLeft)을 리턴하는 헬퍼 함수
  const getIndentStyle = useCallback((node: any) => {
    const line = node?.position?.start?.line;
    const currentLineMap = dynamicPropsRef.current.lineMap || [];
    const origLine = line ? (currentLineMap[line - 1] || line) : undefined;
    if (!origLine) return {};

    const targetContent = originalContentRef.current || contentRef.current;
    if (!targetContent || typeof targetContent !== 'string') return {};
    const lines = targetContent.split('\n');
    const lineText = lines[origLine - 1] || '';
    const indentMatch = lineText.match(/^([ \t]*)/);
    const indentStr = indentMatch ? indentMatch[1] : '';

    // 💡 [목록 들여쓰기 동적 연동]
    // listIndent prop이 전달되면 (예: '16px'), 그 값을 파싱하여 탭/공백당 들여쓰기 px 단위를 조정합니다.
    // 기본값은 16px (탭 1개당 16px, 공백 1개당 4px) 입니다.
    let baseIndentPx = 16;
    if (listIndent) {
      const parsed = parseInt(listIndent, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        baseIndentPx = parsed;
      }
    }

    let marginLeft = 0;
    for (const char of indentStr) {
      if (char === '\t') {
        marginLeft += baseIndentPx; // 탭 1개당 baseIndentPx 여백 (예: 16px)
      } else if (char === ' ') {
        marginLeft += (baseIndentPx / 4);  // 공백 1개당 baseIndentPx / 4 여백 (예: 4px)
      }
    }

    if (marginLeft > 0) {
      return { marginLeft: `${marginLeft}px` };
    }
    return {};
  }, [listIndent]);

// ====================================================================
// 📊 [OMD-CORE-MarkdownViewer-0002] MarkdownViewer ➔ rehypeSourceLinesPlugin
// 🎯 @KICK  : 마크다운 노드에 data-line 속성으로 원본 줄 번호를 매핑
// 🛡️ @GUARD : lineMap을 통해 processedLine을 originalLine으로 역매핑
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
  // 🛡️ [마크다운 물리 줄번호 매핑 플러그인 — 문단 내 개별 행(.onrivi-line) 1:1 초정밀 분할 매핑]
  // 블록 요소뿐만 아니라 문단(p) 내부의 각 텍스트 행을 줄바꿈(br) 단위로 <span class="onrivi-line" data-line="...">로
  // 정밀 분할 래핑하여, 에디터 커서가 위치한 특정 행(줄) 하나만 정확하게 독립 하이라이트되도록 보장합니다.
  const rehypeSourceLinesPlugin = useMemo(() => {
    return () => (tree: any) => {
      const currentLineMap = dynamicPropsRef.current.lineMap || [];
      const mapLine = (l?: number): number | undefined => {
        if (!l) return undefined;
        return currentLineMap[l - 1] || l;
      };

      const isMediaParagraph = (node: any) => {
        if (!node.children || node.children.length === 0) return false;
        const nonWs = node.children.filter((c: any) => !(c.type === 'text' && c.value.trim() === ''));
        if (nonWs.length === 1) {
          const onlyChild = nonWs[0];
          if (onlyChild.type === 'element' && ['img', 'video', 'iframe', 'source'].includes(onlyChild.tagName)) {
            return true;
          }
        }
        return false;
      };

      const visit = (node: any, parentLine?: number) => {
        if (node.type === 'element') {
          if (!node.properties) node.properties = {};

          if (node.tagName === 'p') {
            if (isMediaParagraph(node)) {
              let line = node.position?.start?.line || parentLine;
              if (line) {
                node.properties['data-line'] = mapLine(line);
              }
              if (node.children) {
                node.children.forEach((child: any) => visit(child, line));
              }
              return;
            }

            const newChildren: any[] = [];
            let currentLineChildren: any[] = [];
            let pLine = node.position?.start?.line || parentLine || 1;

            const pushLine = (lineNum: number) => {
              if (currentLineChildren.length === 0) {
                currentLineChildren.push({ type: 'text', value: '\u200B' });
              }
              newChildren.push({
                type: 'element',
                tagName: 'span',
                properties: {
                  className: ['onrivi-line'],
                  'data-line': mapLine(lineNum)
                },
                children: currentLineChildren
              });
              currentLineChildren = [];
            };

            for (const child of node.children) {
              if (child.type === 'element' && child.tagName === 'br') {
                pushLine(pLine);
                pLine++;
              } else if (child.type === 'text' && child.value === '\n') {
                // br 직후의 개행 텍스트 무시
              } else {
                if (child.type === 'element') {
                  if (child.position?.start?.line) {
                    pLine = child.position.start.line;
                  }
                  visit(child, pLine);
                }
                currentLineChildren.push(child);
              }
            }
            pushLine(pLine);
            node.children = newChildren;
            delete node.properties['data-line'];
            return;
          }

          let line = node.position?.start?.line || parentLine;
          if (line) {
            const mapped = mapLine(line);
            node.properties['data-line'] = mapped;

            // 💡 [에디터-미리보기 숫자 리스트 번호 1:1 일치 연동]
            // 마크다운 파서가 <ol> 내부 번호를 자동 계산하여 에디터 번호와 불일치하는 현상을 방지하기 위해,
            // 에디터 원본 텍스트의 해당 줄 번호('1.', '2.' 등)를 직접 추출하여 li value 속성으로 주입합니다.
            if (node.tagName === 'li' && mapped) {
              const rawContent = originalContentRef.current || contentRef.current || '';
              if (rawContent) {
                const lines = rawContent.split(/\r?\n/);
                const lineText = lines[mapped - 1] || '';
                const match = lineText.match(/^[ \t]*(\d+)\.(?:\s+|$)/);
                if (match) {
                  node.properties.value = parseInt(match[1], 10);
                }
              }
            }
          }
        }

        if (node.children) {
          node.children.forEach((child: any) =>
            visit(child, node.type === 'element' && node.tagName === 'tr' ? node.position?.start?.line : undefined)
          );
        }
      };

      visit(tree);
    };
  }, []);

// ====================================================================
// 📊 [OMD-CORE-MarkdownViewer-0001] MarkdownViewer ➔ rehypeBrRaw
// 🎯 @KICK  : raw HTML <br> 태그를 안전하게 br 엘리먼트로 교체하는 rehype 플러그인
// 🛡️ @GUARD : raw 노드를 분할하여 br 태그만 엘리먼트로, 나머지는 보존
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
  // 🛡️ [강제 수동 개행 플러그인] <br> 태그가 날것의 HTML로 들어올 때, Next.js의 rehypeRaw 삼킴 우려 없이 안전하게 br 엘리먼트로 교체합니다.
  const rehypeBrRaw = useMemo(() => {
    return () => (tree: any) => {
      const walk = (node: any) => {
        if (node.children) {
          const newChildren: any[] = [];
          for (const child of node.children) {
            // 💡 [OMD-HOTFIX] 기존 병합 파일에서 <div style="page-break-before: always"></div> 문자열이 
            // 텍스트나 인라인 코드로 파싱되어 화면에 노출되는 현상 방어 및 출판용 페이지 나누기로 강제 변환
            const isPageBreakString = (val: string) => 
              typeof val === 'string' && (val.includes('page-break-before: always') || val.includes('class="page-break"'));

            if (child.type === 'raw' && /<br\s*\/?>/i.test(child.value)) {
              const parts = child.value.split(/(<br\s*\/?>)/gi);
              for (const part of parts) {
                if (/^<br\s*\/?>$/i.test(part)) {
                  newChildren.push({ type: 'element', tagName: 'br', properties: {}, children: [] });
                } else if (part) {
                  newChildren.push({ type: 'raw', value: part });
                }
              }
            } else if (child.type === 'raw' && isPageBreakString(child.value)) {
              // raw HTML 텍스트로 인식되었을 때 교체
              newChildren.push({ type: 'element', tagName: 'hr', properties: { className: ['page-break'] }, children: [] });
            } else if (child.type === 'element' && child.tagName === 'code' && child.children?.length === 1 && child.children[0].type === 'text' && isPageBreakString(child.children[0].value)) {
              // inlineCode 안의 텍스트로 인식되었을 때 (파서 오작동 방어)
              newChildren.push({ type: 'element', tagName: 'hr', properties: { className: ['page-break'] }, children: [] });
            } else if (child.type === 'text' && isPageBreakString(child.value)) {
              // 일반 텍스트 노드로 인식되었을 때
              const parts = child.value.split(/(<div[^>]*page-break[^>]*><\/div>|<hr[^>]*page-break[^>]*\/>)/i);
              for (const part of parts) {
                if (isPageBreakString(part)) {
                  newChildren.push({ type: 'element', tagName: 'hr', properties: { className: ['page-break'] }, children: [] });
                } else if (part) {
                  newChildren.push({ type: 'text', value: part });
                }
              }
            } else {
              newChildren.push(child);
              if (child.children) walk(child);
            }
          }
          node.children = newChildren;
        }
      };
      walk(tree);
    };
  }, []);

  const processedContent = useMemo(() => {
    let text = cleanContent;
    if (bibContent) {
      const entries: any[] = [];

      const extractField = (body: string, field: string): string => {
        const re = new RegExp(`\\b${field}\\s*=\\s*`, 'i');
        const fieldMatch = re.exec(body);
        if (!fieldMatch) return '';
        let start = fieldMatch.index + fieldMatch[0].length;
        if (start >= body.length) return '';
        const ch = body[start];
        if (ch === '{') {
          start++;
          let value = '';
          let d = 1;
          while (start < body.length && d > 0) {
            if (body[start] === '{') d++;
            else if (body[start] === '}') d--;
            if (d > 0) value += body[start];
            start++;
          }
          return value.trim();
        } else if (ch === '"') {
          start++;
          let value = '';
          while (start < body.length && body[start] !== '"') {
            value += body[start];
            start++;
          }
          return value.trim();
        } else {
          let value = '';
          while (start < body.length && start < body.length && body[start] !== ',' && body[start] !== '}') {
            value += body[start];
            start++;
          }
          return value.trim();
        }
      };

      const entryRegex = /@(\w+)\s*\{\s*([^,]+),/g;
      let entryMatch;
      while ((entryMatch = entryRegex.exec(bibContent)) !== null) {
        const id = entryMatch[2].trim();
        let depth = 1;
        let i = entryMatch.index + entryMatch[0].length;
        let body = '';
        while (i < bibContent.length && depth > 0) {
          const ch = bibContent[i];
          if (ch === '{') depth++;
          else if (ch === '}') depth--;
          if (depth > 0) body += ch;
          i++;
        }
        entryRegex.lastIndex = i + 1;

        const title = extractField(body, 'title');
        const author = extractField(body, 'author');
        const year = extractField(body, 'year');
        const journal = extractField(body, 'journal');

        entries.push({ id, title, author, year, journal });
      }

      const entryMap = new Map<string, any>();
      entries.forEach(e => entryMap.set(e.id.toLowerCase(), e));

      const usedIds = new Set<string>();

      const citationSpan = (id: string, lowerId: string) =>
        `<span class="citation bg-blue-50  text-blue-600  px-1.5 py-0.5 rounded text-[0.9em] mx-1 shadow-sm border border-blue-200 "><a href="#bib-${lowerId}" style="text-decoration: none; color: inherit;">${id}</a></span>`;

      text = text.replace(/\[@([a-zA-Z0-9_:\-.+]+)\]/g, (m, id) => {
        const lower = id.toLowerCase();
        if (!entryMap.has(lower)) return m;
        usedIds.add(lower);
        return citationSpan(id, lower);
      });
      text = text.replace(/(?<!\[)@([a-zA-Z0-9_:\-.+]+)/g, (m, id) => {
        const lower = id.toLowerCase();
        if (!entryMap.has(lower)) return m;
        usedIds.add(lower);
        return citationSpan(id, lower);
      });

      let usedEntries = entries.filter(entry => usedIds.has(entry.id.toLowerCase()));

      usedEntries.sort((a: any, b: any) => {
        const aKey = (a.author || a.id).toLowerCase();
        const bKey = (b.author || b.id).toLowerCase();
        return aKey.localeCompare(bKey);
      });

      if (usedEntries.length > 0) {
        let bibHtml = `\n\n---\n\n<div id="refs" class="references csl-bib-body mt-8 mb-8 break-words">\n  <h2 class="text-2xl font-bold mb-4 border-b pb-2">참고문헌 (References)</h2>\n`;
        usedEntries.forEach(entry => {
          bibHtml += `  <div class="csl-entry mb-4 pl-4 -indent-4" id="bib-${entry.id.toLowerCase()}">\n`;
          let display = '';
          if (entry.author) display += `<strong>${entry.author}</strong> `;
          if (entry.year) display += `(${entry.year}). `;
          if (entry.title) display += `<em>${entry.title}</em>. `;
          if (entry.journal) display += `${entry.journal}. `;
          if (!display) display = entry.id;
          
          bibHtml += `    ${display}\n  </div>\n`;
        });
        bibHtml += `</div>\n`;
        text += bibHtml;
      }
    }
    return text;
  }, [cleanContent, bibContent]);

  return (
    <div
      ref={containerRef}
      className="markdown-viewer-root onrivi-content-root bg-transparent mx-auto relative"
      style={{
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '100%',
        minHeight: '100%',
        boxShadow: 'none',
        borderRadius: '0px',
        paddingTop: marginTop || '0',
        paddingBottom: marginBottom || '0',
        paddingLeft: marginLeft || '0',
        paddingRight: marginRight || '0',
      }}
    >
      <style>{`
        .markdown-viewer-root,
        .onrivi-content-root {
          counter-reset: onrivi-figure;
          tab-size: 4 !important;
          -moz-tab-size: 4 !important;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        .onrivi-content-root p,
        .onrivi-content-root blockquote,
        .onrivi-content-root h1,
        .onrivi-content-root h2,
        .onrivi-content-root h3,
        .onrivi-content-root h4,
        .onrivi-content-root h5,
        .onrivi-content-root h6 {
          tab-size: 4 !important;
          -moz-tab-size: 4 !important;
        }
        .onrivi-content-root .onrivi-sentence-br {
          display: block !important;
          height: 0px !important;
        }
        .onrivi-content-root ul,
        .onrivi-content-root ol {
          white-space: normal !important;
          margin-top: 0.5em !important;
          margin-bottom: 0.5em !important;
          padding-left: 1.5em !important;
        }
        .onrivi-content-root ul + p,
        .onrivi-content-root ol + p {
          margin-top: 1.5em !important;
        }
        .onrivi-content-root p + ul,
        .onrivi-content-root p + ol {
          margin-top: 1.2em !important;
        }
        .onrivi-content-root li {
          white-space: normal !important;
          margin: 0 !important;
          padding: 1px 0 !important;
          line-height: 1.6 !important;
        }
        .onrivi-content-root li > p,
        .onrivi-content-root li > div,
        .onrivi-content-root li p {
          margin: 0 !important;
          padding: 0 !important;
          display: inline !important;
          white-space: normal !important;
        }
        .onrivi-content-root pre,
        .onrivi-content-root pre code {
          white-space: pre !important;
          word-break: normal !important;
          overflow-wrap: normal !important;
        }
        .onrivi-content-root code:not(pre code),
        .onrivi-content-root p code,
        .onrivi-content-root li code {
          white-space: pre-wrap !important;
          word-break: break-word !important;
          overflow-wrap: anywhere !important;
        }
        .markdown-viewer-root figure {
            counter-increment: onrivi-figure;
            margin: 0 !important;
          }
          .markdown-viewer-root figure figcaption {
            margin-top: 0.5rem !important;
            margin-bottom: 0 !important;
          }
        .markdown-viewer-root figcaption::before {
          content: "[그림 " counter(onrivi-figure) "] ";
          font-weight: 700;
          color: #3b82f6;
        }
        .markdown-viewer-root th {
          text-align: center !important;
        }
        .markdown-viewer-root .table-wrapper-area,
        .onrivi-content-root .table-wrapper-area {
          display: inline-block !important;
          width: 100% !important;
          vertical-align: top !important;
          margin-top: 4px !important;
          margin-bottom: 16px !important;
        }
        .markdown-viewer-root table,
        .onrivi-content-root table {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          border-collapse: collapse !important;
          border-spacing: 0 !important;
          border-radius: 0 !important;
          overflow: visible !important;
          box-shadow: none !important;
        }
        .markdown-viewer-root th,
        .onrivi-content-root th,
        .markdown-viewer-root td,
        .onrivi-content-root td {
          border-bottom-style: inherit !important;
        }
        .markdown-viewer-root :is(p, h1, h2, h3, h4, h5, h6, strong):has(+ .table-wrapper-area),
        .onrivi-content-root :is(p, h1, h2, h3, h4, h5, h6, strong):has(+ .table-wrapper-area) {
          margin-bottom: 6px !important;
        }
        /* 💬 인용구(blockquote) 여백 정밀 제어: BFC 및 인라인 블록 격리로 마진 상쇄 원천 차단 */
        .markdown-viewer-root blockquote,
        .onrivi-content-root blockquote {
          display: inline-block !important;
          width: 100% !important;
          vertical-align: top !important;
        }
      `}</style>
      {(customCss || frontmatterCustomCss) && (
        <style dangerouslySetInnerHTML={{ __html: `
          ${customCss ? `/* === [User Custom CSS - Prop] === */\n${customCss}\n` : ''}
          ${frontmatterCustomCss ? `/* === [Frontmatter Custom CSS] === */\n${frontmatterCustomCss}\n` : ''}
        ` }} />
      )}
      <div className="print:!block">
        <ReactMarkdown
          urlTransform={(uri) => {
            // 🛡️ [보안 필터 강화] XSS 공격 방어 (javascript: 차단, blob: 등 허용)
            const cleanUri = DOMPurify.sanitize(uri);
            if (cleanUri.trim().toLowerCase().startsWith('javascript:')) return '';
            return cleanUri;
          }}
          remarkPlugins={[[remarkGfm, { singleTilde: false }], remarkExtendedTable, remarkBreaks, remarkMath, remarkDisableIndentedCode]}
          rehypePlugins={[
            [rehypeKatex, { strict: false }],
            rehypeBrRaw,
            rehypeRaw,
            rehypeHighlight,
            rehypeSourceLinesPlugin,
            rehypePreserveFootnotes,
          ]}
          remarkRehypeOptions={{ handlers: extendedTableHandlers }}
          components={useMemo(() => ({
            source: ({ node, src, ...props }: any) => {
              if (!src) return <source {...props} />;
              
              let actualSrc = src;
              try { if (actualSrc) actualSrc = decodeURI(actualSrc); } catch(e){}
              
              let absolutePath = actualSrc;
              const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;

              if (actualSrc && (actualSrc.startsWith('/media/') || actualSrc.startsWith('./media/'))) {
                const rawSecure = loadSecureData<string>('resourceFolder');
                const freshRF = (rawSecure && rawSecure.trim() !== '') ? rawSecure : (dynamicPropsRef.current.resourceFolder || null);
                if (freshRF) {
                  const sep = freshRF.includes('\\') ? '\\' : '/';
                  const cleanRoot = freshRF.endsWith(sep) ? freshRF.slice(0, -1) : freshRF;
                  const strippedSrc = actualSrc.startsWith('./') ? actualSrc.substring(1) : actualSrc;
                  const normalizedSrc = sep === '\\' ? strippedSrc.replace(/\//g, '\\') : strippedSrc;
                  absolutePath = cleanRoot + normalizedSrc;
                } else {
                  absolutePath = '';
                }
              }
              
              let finalSrc = actualSrc;
              if (api) {
                const isHttp = actualSrc.startsWith('http://') || actualSrc.startsWith('https://');
                if (isHttp) {
                  finalSrc = `media://?url=${encodeURIComponent(actualSrc)}`;
                } else if (absolutePath && absolutePath !== actualSrc) {
                  finalSrc = `media-local://serve?url=${encodeURIComponent(absolutePath)}`;
                } else {
                  finalSrc = absolutePath;
                }
              }

              return <source src={finalSrc} {...props} />;
            },
            video: ({ node, src, children, ...props }: any) => {
              let actualSrc = src;
              if (!actualSrc && children) {
                // Try to find source child
                React.Children.forEach(children, (child: any) => {
                  if (child && child.type === 'source' && child.props && child.props.src) {
                    actualSrc = child.props.src;
                  }
                });
              }

              if (!actualSrc) return <video {...props}>{children}</video>;
              try { if (actualSrc) actualSrc = decodeURI(actualSrc); } catch(e){}
              
              let videoSrc = actualSrc;
              let absolutePath = actualSrc;
              const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;

              if (actualSrc && (actualSrc.startsWith('/media/') || actualSrc.startsWith('./media/'))) {
                const rawSecure = loadSecureData<string>('resourceFolder');
                const freshRF = (rawSecure && rawSecure.trim() !== '') ? rawSecure : (dynamicPropsRef.current.resourceFolder || null);
                if (freshRF) {
                  const sep = freshRF.includes('\\') ? '\\' : '/';
                  const cleanRoot = freshRF.endsWith(sep) ? freshRF.slice(0, -1) : freshRF;
                  const normalizedSrc = sep === '\\' ? actualSrc.replace(/\//g, '\\') : actualSrc;
                  absolutePath = cleanRoot + normalizedSrc;
                } else {
                  absolutePath = '';
                }
              }
              
              let finalSrc = api ? absolutePath : actualSrc;
              
              // 외부 비디오 URL도 media:// 프록시 우회 적용
              const isHttp = actualSrc.startsWith('http://') || actualSrc.startsWith('https://');
              if (isHttp && api) {
                finalSrc = `media://?url=${encodeURIComponent(actualSrc)}`;
              }

              return (
                <figure data-line={extractDataLine(props, node)} className="onrivi-video-figure" style={{ display: 'flex', flexDirection: 'column', width: '100%', clear: 'both' }}>
                  <div className="relative inline-flex flex-col onrivi-video-wrapper" style={{ display: 'inline-flex', flexDirection: 'column', width: 'fit-content', maxWidth: '100%' }}>
                    <AsyncVideo
                      src={finalSrc}
                      absolutePath={absolutePath}
                      rootFolder={dynamicPropsRef.current.rootFolder}
                      resourceFolderHandle={dynamicPropsRef.current.resourceFolderHandle}
                      workspaceType={dynamicPropsRef.current.workspaceType}
                      api={api}
                      {...props}
                    />
                  </div>
                </figure>
              );
            },
            img: ({ node, src, alt, style, ...props }: any) => {
              if (!src) return <img alt={alt} {...props} />;
              
              // 💡 [쿼리 스트링 분리 가드]
              // 이미지 URL 내에 ?width=300&height=200 등의 쿼리 파라미터가 덧붙여 있는 경우,
              // 로컬 파일 경로 해석 시 이 쿼리가 포함되면 404 에러가 나므로 분리 처리합니다.
              let pureSrc = src;
              let queryString = '';
              const qIndex = src.indexOf('?');
              if (qIndex !== -1) {
                pureSrc = src.substring(0, qIndex);
                queryString = src.substring(qIndex);
              }
              try { if (pureSrc) pureSrc = decodeURI(pureSrc); } catch(e){}

              let finalSrc = pureSrc;
              let absolutePath = pureSrc;
              const isHttp = pureSrc.startsWith('http://') || pureSrc.startsWith('https://');
              const isBlobOrData = pureSrc.startsWith('data:') || pureSrc.startsWith('blob:');
              const isExternal = isHttp || isBlobOrData;
              const isR2ApiPath = pureSrc.startsWith('/api/image/');

              // 🛡️ media://local/serve → Electron 전용, 웹에선 filePath 추출
              const isMediaServe = pureSrc === 'media://local/serve';
              let mediaFilePath = '';
              if (isMediaServe && queryString) {
                const urlMatch = queryString.match(/[?&]url=([^&]+)/);
                if (urlMatch) mediaFilePath = decodeURIComponent(urlMatch[1]);
              }

              if (isR2ApiPath) {
                const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;
                if (api || process.env.NODE_ENV === 'development') {
                  finalSrc = `https://onrivi.com${pureSrc}`;
                } else {
                  finalSrc = pureSrc;
                }
                if (queryString) {
                  finalSrc += finalSrc.includes('?') ? '&' + queryString.substring(1) : queryString;
                }
              } else if (isMediaServe && mediaFilePath) {
                // media://local/serve → 웹에선 /api/view?filePath=... 로 변환
                const api = (window as any).electronAPI;
                if (api) {
                  finalSrc = `media://local/serve?url=${encodeURIComponent(mediaFilePath)}`;
                } else if (process.env.NODE_ENV === 'development') {
                  finalSrc = `/api/view?filePath=${encodeURIComponent(mediaFilePath)}`;
                } else {
                  finalSrc = mediaFilePath;
                }
                if (queryString && !finalSrc.includes('?')) {
                  // 쿼리스트링에 url=... 외 다른 파라미터가 있을 경우 처리
                  const otherParams = queryString.replace(/[?&]url=[^&]*/, '');
                  if (otherParams) finalSrc += otherParams;
                }
              } else if (!isExternal && typeof window !== 'undefined') {
                const api = (window as any).electronAPI;
                const isAbsoluteWin = /^[a-zA-Z]:[\\/]/.test(pureSrc);
                // 💡 [마크다운 루트 상대경로 지원]
                // 마크다운 문법에서 /assets/img.png 처럼 최상단 슬래시(/)로 시작하는 경로는 
                // 워크스페이스의 루트 폴더를 기준으로 하는 상대 경로(Root-Relative)로 해석해야 합니다.
                const isRootRelative = pureSrc.startsWith('/');

                const isWelcomePage = dynamicPropsRef.current.currentFilePath && (
                  dynamicPropsRef.current.currentFilePath.endsWith('Welcome.md') || 
                  dynamicPropsRef.current.currentFilePath.endsWith('Welcome.markdown') || 
                  dynamicPropsRef.current.currentFilePath === 'Welcome.md'
                );

                // hero.png만 웰컴 에셋으로 취급하거나, 순수하게 Welcome.md가 렌더링 중일 때만
                const isWelcomeAsset = (pureSrc === './hero.png' || pureSrc === 'hero.png') && isWelcomePage;

                const isLocalMedia = !isExternal && (
                  pureSrc.includes('media/') || 
                  pureSrc.endsWith('.png') || 
                  pureSrc.endsWith('.jpg') || 
                  pureSrc.endsWith('.jpeg') || 
                  pureSrc.endsWith('.gif') || 
                  pureSrc.endsWith('.webp')
                );

                if (isLocalMedia && (api || (dynamicPropsRef.current.rootFolderPath && dynamicPropsRef.current.rootFolderPath !== BROWSER_STORAGE_NAME))) {
                  // 💡 [핵심] 리소스 폴더에서만 절대 경로 조합 (rootFolderPath 임의 폴백 원천 차단)
                  const rawSecure = loadSecureData<string>('resourceFolder');
                  const freshRF = (rawSecure && rawSecure.trim() !== '') ? rawSecure : (dynamicPropsRef.current.resourceFolder || null);
                  const hasRFHandle = !!dynamicPropsRef.current.resourceFolderHandle;

                  // 🚨 [필수 규격] 리소스 폴더가 지정되지 않은 경우: 다른 폴더로 폴백하지 않고 미지정 경고 플레이스홀더를 렌더링
                  if (!freshRF && !hasRFHandle) {
                    return (
                      <span className="inline-flex items-center gap-2 px-3.5 py-2 my-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold shadow-xs select-none">
                        <span className="text-sm">⚠️</span>
                        <span>[리소스 폴더 미지정] 환경설정에서 공통 자원 폴더를 지정해야 이미지가 표시됩니다.</span>
                      </span>
                    );
                  }

                  if (freshRF && freshRF !== BROWSER_STORAGE_NAME) {
                    const sep = freshRF.includes('\\') ? '\\' : '/';
                    const cleanRoot = freshRF.endsWith(sep) ? freshRF.slice(0, -1) : freshRF;
                    
                    let cleanSrc = pureSrc;
                    if (cleanSrc.startsWith('./')) cleanSrc = cleanSrc.substring(2);
                    if (cleanSrc.startsWith('/')) cleanSrc = cleanSrc.substring(1);
                    
                    // 만약 media 폴더가 경로에 직접 없는 경우, 기본 media 하위 파일로 매칭해 줍니다.
                    if (!cleanSrc.startsWith('media/') && !cleanSrc.startsWith('media\\')) {
                      cleanSrc = 'media' + sep + cleanSrc;
                    }
                    
                    const normalizedSrc = sep === '\\' ? cleanSrc.replace(/\//g, '\\') : cleanSrc.replace(/\\/g, '/');
                    absolutePath = cleanRoot + sep + normalizedSrc;
                  }
                } else if (isRootRelative && dynamicPropsRef.current.rootFolderPath && dynamicPropsRef.current.rootFolderPath !== BROWSER_STORAGE_NAME && !isWelcomeAsset) {
                  // 워크스페이스 루트 상대 경로 처리 (예: /assets/img.png -> 워크스페이스경로/assets/img.png)
                  const sep = dynamicPropsRef.current.rootFolderPath.includes('\\') ? '\\' : '/';
                  const cleanRoot = dynamicPropsRef.current.rootFolderPath.endsWith(sep) ? dynamicPropsRef.current.rootFolderPath.slice(0, -1) : dynamicPropsRef.current.rootFolderPath;
                  const normalizedSrc = sep === '\\' ? pureSrc.replace(/\//g, '\\') : pureSrc;
                  absolutePath = cleanRoot + normalizedSrc;
                } else if (isRootRelative && (!dynamicPropsRef.current.rootFolderPath || dynamicPropsRef.current.rootFolderPath === BROWSER_STORAGE_NAME) && dynamicPropsRef.current.currentFilePath && !isWelcomeAsset) {
                  // 폴더 연동 없이 단일 파일만 연 상태에서 /assets/ 등 루트 상대 경로가 사용된 경우, 현재 파일 기준으로 풀이
                  const srcWithoutSlash = pureSrc.startsWith('/') ? pureSrc.substring(1) : pureSrc;
                  absolutePath = resolveRelativeImagePath(srcWithoutSlash, dynamicPropsRef.current.currentFilePath);
                } else if (!isAbsoluteWin && !isRootRelative && dynamicPropsRef.current.currentFilePath && !isWelcomeAsset) {
                  absolutePath = resolveRelativeImagePath(pureSrc, dynamicPropsRef.current.currentFilePath);
                } else if (!isAbsoluteWin && !isRootRelative && dynamicPropsRef.current.rootFolderPath && dynamicPropsRef.current.rootFolderPath !== BROWSER_STORAGE_NAME && !isWelcomeAsset) {
                  const sep = dynamicPropsRef.current.rootFolderPath.includes('/') ? '/' : '\\';
                  const folder = dynamicPropsRef.current.rootFolderPath.endsWith(sep) ? dynamicPropsRef.current.rootFolderPath : dynamicPropsRef.current.rootFolderPath + sep;
                  absolutePath = folder + pureSrc;
                } else if (isWelcomeAsset) {
                  absolutePath = pureSrc.startsWith('./') ? pureSrc.slice(2) : pureSrc.startsWith('/') ? pureSrc.slice(1) : pureSrc;
                }
                
                if (api) {
                  // Desktop API calls handle the absolutePath directly, so we just use it.
                  finalSrc = absolutePath;
                } else {
                  // 웹 환경에서는 브라우저 로컬(상대/절대) 경로를 가장 먼저 시도합니다.
                  finalSrc = pureSrc;
                }
                
                if (queryString) {
                  // 💡 온리비 고유의 크기/정렬 파라미터들 (width, height, align, w, h, a)을 제거하여 외부 CDN 서버 오작동 방지
                  const cleanQuery = queryString
                    .replace(/([?&])(?:width|w)=[^&]*/gi, '')
                    .replace(/([?&])(?:height|h)=[^&]*/gi, '')
                    .replace(/([?&])(?:align|a)=[^&]*/gi, '')
                    .replace(/&&+/g, '&')
                    .replace(/\?&/, '?')
                    .replace(/[?&]$/, '');

                  if (cleanQuery && cleanQuery !== '?') {
                    if (finalSrc.includes('?')) {
                      finalSrc += '&' + cleanQuery.substring(1);
                    } else {
                      finalSrc += cleanQuery.startsWith('?') ? cleanQuery : '?' + cleanQuery;
                    }
                  }
                }
              }

              // 🛡️ [GitHub CORS 방어 가드]
              // github.com의 blob 웹페이지 주소는 CORS 차단이 걸리므로 raw.githubusercontent.com 원본 데이터 주소로 자동 교정합니다.
              if (finalSrc.startsWith('https://github.com/') && finalSrc.includes('/blob/')) {
                finalSrc = finalSrc
                  .replace('https://github.com/', 'https://raw.githubusercontent.com/')
                  .replace('/blob/', '/');
              }

              // 🛡️ [로컬 public 경로 보정 가드]
              // 마크다운에 frontend/public/ 또는 public/ 형태로 경로가 삽입된 경우 웹서버 루트(/) 주소로 자동 치환하여 VFS 오류를 방지합니다.
              if (finalSrc.startsWith('frontend/public/')) {
                finalSrc = finalSrc.replace('frontend/public/', '/');
              } else if (finalSrc.startsWith('public/')) {
                finalSrc = finalSrc.replace('public/', '/');
              }

              // 💡 [외부 HTTP 이미지 프록시 라우팅]
              // 데스크탑 환경에서 외부 이미지가 403 Forbidden 등으로 로드 실패하는 것을 방지하기 위해 
              // 메인 프로세스의 media:// 프록시로 넘깁니다.
              if (isHttp && typeof window !== 'undefined') {
                const api = (window as any).electronAPI;
                if (api) {
                  finalSrc = `media://?url=${encodeURIComponent(finalSrc)}`;
                }
              }

              let width: string | undefined;
              let height: string | undefined;
              let align: string | undefined;
              try {
                const wMatch = src.match(/[?&](?:width|w)=([^&#]+)/);
                const hMatch = src.match(/[?&](?:height|h)=([^&#]+)/);
                const aMatch = src.match(/[?&](?:align|a)=([^&#]+)/);
                if (wMatch) width = decodeURIComponent(wMatch[1]);
                if (hMatch) height = decodeURIComponent(hMatch[1]);
                if (aMatch) align = decodeURIComponent(aMatch[1]);
              } catch (e) {}

              // 💡 [단위 자동 보완 가드]
              if (width && /^\d+$/.test(width)) width = `${width}px`;
              if (height && /^\d+$/.test(height)) height = `${height}px`;

              const imgStyle: React.CSSProperties = {
                ...style, maxWidth: '100%',
              };
              if (width) imgStyle.width = width;
              if (height) imgStyle.height = height;
              
              let figureStyle: React.CSSProperties = {
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                clear: 'both',
              };

              let forceAlignClass = '';
              if (align === 'left') {
                figureStyle.alignItems = 'flex-start';
                figureStyle.textAlign = 'left';
                imgStyle.alignSelf = 'flex-start';
                imgStyle.marginLeft = '0px';
                imgStyle.marginRight = 'auto';
                forceAlignClass = 'force-align-left';
              } else if (align === 'right') {
                figureStyle.alignItems = 'flex-end';
                figureStyle.textAlign = 'right';
                imgStyle.alignSelf = 'flex-end';
                imgStyle.marginLeft = 'auto';
                imgStyle.marginRight = '0px';
                forceAlignClass = 'force-align-right';
              } else if (align === 'center') {
                figureStyle.alignItems = 'center';
                figureStyle.textAlign = 'center';
                imgStyle.alignSelf = 'center';
                imgStyle.marginLeft = 'auto';
                imgStyle.marginRight = 'auto';
                forceAlignClass = 'force-align-center';
              }
              
              const imgElement = (
                <AsyncImage 
                  src={finalSrc} 
                  alt={alt} 
                  absolutePath={absolutePath} 
                  rootFolder={dynamicPropsRef.current.rootFolder} 
                  resourceFolderHandle={dynamicPropsRef.current.resourceFolderHandle}
                  workspaceType={dynamicPropsRef.current.workspaceType} 
                  api={typeof window !== 'undefined' ? (window as any).electronAPI : null} 
                  queryString={queryString} 
                  style={imgStyle} 
                  className={`rounded-lg shadow-sm border border-zinc-200/30 ${forceAlignClass}`} 
                  onImageLoaded={onImageLoaded}
                  {...props} 
                />
              );
              
              const line = extractDataLine(props, node);
              if (alt && alt.trim() !== '') {
                return (
                  <figure data-line={line} className="onrivi-image-figure" style={figureStyle}>
                    {imgElement}
                    <figcaption className="text-[0.9em] text-zinc-500 mt-1 font-medium" style={align ? { textAlign: align as any, alignSelf: figureStyle.alignItems } : undefined}>
                      {alt}
                    </figcaption>
                  </figure>
                );
              }
              return (
                <div data-line={line} className="onrivi-image-figure" style={figureStyle}>
                  {imgElement}
                </div>
              );
            },
            a: ({ node, href, children, ...props }: any) => {
              const isWebLink = href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('www.'));
              const isAnchor = href && (href.startsWith('#') || href.startsWith('.#'));
              
              if (isAnchor) {
                const handleClick = (e: React.MouseEvent) => {
                  e.preventDefault();
                  const targetId = decodeURIComponent(href.startsWith('.#') ? href.slice(2) : href.slice(1));
                  
                  let targetEl = document.getElementById(targetId);
                  
                  if (!targetEl && targetId.includes('fnref-')) {
                    const fnId = targetId.replace('fnref-', 'fn-');
                    targetEl = document.querySelector(`a[href="#${fnId}"]`) || document.getElementById(fnId.replace('user-content-', ''));
                  }

                  if (!targetEl) {
                    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                    const cleanTarget = targetId.toLowerCase().replace(/\s+/g, '').normalize('NFC');
                    for (const h of Array.from(headings)) {
                      const headingText = h.textContent?.trim() || '';
                      const cleanHeading = headingText.toLowerCase().replace(/\s+/g, '').normalize('NFC');
                      if (cleanHeading === cleanTarget || h.id === targetId || (cleanTarget.length > 2 && cleanHeading.includes(cleanTarget))) {
                        targetEl = h as HTMLElement;
                        break;
                      }
                    }
                  }

                  if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                };
                return <a href={href} onClick={handleClick} {...props}>{children}</a>;
              }

              const isKnowledgeLink = href && href.startsWith('knowledge://');
              const isFileLink = href && (href.startsWith('file:///') || /^[a-zA-Z]:[/\\]/.test(href));
              if (href && !isWebLink && (href.endsWith('.md') || href.endsWith('.markdown') || href.includes('.md#') || href.includes('.markdown#') || isKnowledgeLink || isFileLink)) {
                const handleClick = (e: React.MouseEvent) => {
                  e.preventDefault();
                  if (dynamicPropsRef.current.onFileOpen) {
                    // 1) 꺾쇠 <...>, 따옴표 제거 및 URI 디코딩 선행 정제
                    let unbracketed = (href || '').trim();
                    if (unbracketed.startsWith('<') && unbracketed.endsWith('>')) {
                      unbracketed = unbracketed.slice(1, -1).trim();
                    }
                    unbracketed = unbracketed.replace(/^[<"']|[>"']$/g, '').trim();
                    try { unbracketed = decodeURIComponent(unbracketed); } catch {}

                    if (isKnowledgeLink) {
                      const hashPart = unbracketed.includes('#') ? unbracketed.split('#')[1].replace(/^[<"']|[>"']$/g, '').trim() : undefined;
                      dynamicPropsRef.current.onFileOpen(unbracketed, hashPart || undefined);
                      return;
                    }

                    const cleanHref = unbracketed.split('#')[0].replace(/^[<"']|[>"']$/g, '').trim();
                    const hashPart = unbracketed.includes('#') ? unbracketed.split('#')[1].replace(/^[<"']|[>"']$/g, '').trim() : undefined;

                    // file:/// URI 디코딩 또는 상대 경로 resolve
                    let resolved = cleanHref;
                    if (cleanHref.startsWith('file:///')) {
                      resolved = decodeURIComponent(cleanHref.replace(/^file:\/\/\//, ''));
                    } else {
                      resolved = resolveRelativeImagePath(cleanHref, dynamicPropsRef.current.currentFilePath);
                    }
                    
                    const normalizePath = (p: string | undefined) => (p || '').replace(/\\/g, '/').toLowerCase().normalize('NFC').trim();
                    const normResolved = normalizePath(resolved);
                    const normCurrent = normalizePath(dynamicPropsRef.current.currentFilePath);
                    const baseResolved = normResolved.split('/').pop() || '';
                    const baseCurrent = normCurrent.split('/').pop() || '';

                    const isSameFile = Boolean(
                      normCurrent && (
                        normResolved === normCurrent ||
                        normResolved.endsWith('/' + normCurrent) ||
                        normCurrent.endsWith('/' + normResolved) ||
                        (baseResolved && baseCurrent && baseResolved === baseCurrent)
                      )
                    );

                    if (isSameFile) {
                      // 💡 [동일 파일 가드] 같은 파일인 경우 파일을 다시 로드하지 않고 헤딩 또는 라인 위치로 즉시 스크롤 이동합니다.
                      if (hashPart) {
                        // 1) #L15-L40 또는 #L15 라인 앵커 점프 지원
                        const lineMatch = hashPart.match(/^L?(\d+)/i);
                        if (lineMatch) {
                          const lineNum = parseInt(lineMatch[1], 10);
                          const lineEl = document.querySelector(`[data-line="${lineNum}"]`) as HTMLElement;
                          if (lineEl) {
                            lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            lineEl.classList.add('preview-highlight-line');
                            setTimeout(() => lineEl.classList.remove('preview-highlight-line'), 2500);
                          }
                        } else {
                          // 2) 헤딩 ID 또는 텍스트 점프
                          const targetId = decodeURIComponent(hashPart);
                          let targetEl = document.getElementById(targetId);
                          if (!targetEl) {
                            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                            const cleanTarget = targetId.toLowerCase().replace(/\s+/g, '').normalize('NFC');
                            for (const h of Array.from(headings)) {
                              const headingText = h.textContent?.trim() || '';
                              const cleanHeading = headingText.toLowerCase().replace(/\s+/g, '').normalize('NFC');
                              if (cleanHeading === cleanTarget || h.id === targetId || (cleanTarget.length > 2 && cleanHeading.includes(cleanTarget))) {
                                targetEl = h as HTMLElement;
                                break;
                              }
                            }
                          }
                          if (targetEl) {
                            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            targetEl.classList.add('preview-highlight-line');
                            setTimeout(() => targetEl.classList.remove('preview-highlight-line'), 2500);
                          }
                        }
                      }
                      // 에디터도 함께 해당 라인/영역으로 동시 이동
                      dynamicPropsRef.current.onFileOpen(resolved, hashPart || undefined);
                    } else {
                      // 다른 파일인 경우 파일을 열고 라인/헤딩 해시를 함께 전달하여 탭 전환 후 스크롤
                      dynamicPropsRef.current.onFileOpen(resolved, hashPart || undefined);
                    }
                  }
                };
                return <a href={href} onClick={handleClick} {...props}>{children}</a>;
              }

              const apiHref = href && href.startsWith('/api/image/')
                ? `https://onrivi.com${href}`
                : href && (href.startsWith('/api/') || href.match(/^https?:\/\/localhost:/))
                  ? getApiUrl(href.replace(/^https?:\/\/localhost:\d+/, ''))
                  : href;

              const displayName = getTextFromChildren(children);

              const videoDataLine = extractDataLine(props, node);
              const youtubeMatch = href && href.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/);
              if (youtubeMatch && youtubeMatch[2] && youtubeMatch[2].length === 11) {
                return (
                  <VideoCard
                    src={`https://img.youtube.com/vi/${youtubeMatch[2]}/maxresdefault.jpg`}
                    href={`https://www.youtube.com/watch?v=${youtubeMatch[2]}`}
                    displayName={displayName || 'YouTube 동영상'}
                    isYoutube
                    youtubeId={youtubeMatch[2]}
                    dataLine={videoDataLine}
                    data-line={videoDataLine}
                  />
                );
              }

              const isSocialVideo = href && !youtubeMatch && /(tiktok\.com|instagram\.com\/(p|reel|tv)\/|vimeo\.com|twitch\.tv|dailymotion\.com)/i.test(href);
              if (isSocialVideo) {
                return <SocialVideoCard url={href} displayName={displayName || '동영상'} dataLine={videoDataLine} data-line={videoDataLine} />;
              }

              const isVideo = apiHref && /\.(mp4|webm|ogg|mov|avi|mkv)(\?|#|$)/i.test(apiHref);
              if (isVideo) {
                // 쿼리 스트링 분리
                let rawApiHref = apiHref;
                try { if (rawApiHref) rawApiHref = decodeURI(rawApiHref); } catch(e){}
                let pureSrc = rawApiHref;
                let queryString = '';
                const qIndex = apiHref.indexOf('?');
                if (qIndex !== -1) {
                  pureSrc = apiHref.substring(0, qIndex);
                  queryString = apiHref.substring(qIndex);
                }

                let absolutePath = pureSrc;
                const isAbsoluteWin = /^[a-zA-Z]:[\\/]/.test(pureSrc);
                const isRootRelative = pureSrc.startsWith('/');
                const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;

                // [media 처리 논리] (AsyncImage와 동일)
                const isMediaServe = pureSrc === 'media://local/serve';
                let mediaFilePath = '';
                if (isMediaServe && queryString) {
                  const urlMatch = queryString.match(/[?&]url=([^&]+)/);
                  if (urlMatch) mediaFilePath = decodeURIComponent(urlMatch[1]);
                }

                if (isMediaServe && mediaFilePath) {
                  absolutePath = mediaFilePath;
                  pureSrc = `media://local/serve?url=${encodeURIComponent(mediaFilePath)}`;
                } else if ((pureSrc.startsWith('/media/') || pureSrc.startsWith('./media/')) && api) {
                  const rawSecure = loadSecureData<string>('resourceFolder');
                  const freshRF = (rawSecure && rawSecure.trim() !== '') ? rawSecure : (dynamicPropsRef.current.resourceFolder || null);
                  if (freshRF) {
                    const sep = freshRF.includes('\\') ? '\\' : '/';
                    const cleanRoot = freshRF.endsWith(sep) ? freshRF.slice(0, -1) : freshRF;
                    const normalizedSrc = sep === '\\' ? pureSrc.replace(/\//g, '\\') : pureSrc;
                    absolutePath = cleanRoot + normalizedSrc;
                  } else {
                    absolutePath = '';
                  }
                } else if (isRootRelative && dynamicPropsRef.current.rootFolderPath && dynamicPropsRef.current.rootFolderPath !== BROWSER_STORAGE_NAME) {
                  const sep = dynamicPropsRef.current.rootFolderPath.includes('\\') ? '\\' : '/';
                  const cleanRoot = dynamicPropsRef.current.rootFolderPath.endsWith(sep) ? dynamicPropsRef.current.rootFolderPath.slice(0, -1) : dynamicPropsRef.current.rootFolderPath;
                  const normalizedSrc = sep === '\\' ? pureSrc.replace(/\//g, '\\') : pureSrc;
                  absolutePath = cleanRoot + normalizedSrc;
                } else if (isRootRelative && (!dynamicPropsRef.current.rootFolderPath || dynamicPropsRef.current.rootFolderPath === BROWSER_STORAGE_NAME) && dynamicPropsRef.current.currentFilePath) {
                  const srcWithoutSlash = pureSrc.startsWith('/') ? pureSrc.substring(1) : pureSrc;
                  absolutePath = resolveRelativeImagePath(srcWithoutSlash, dynamicPropsRef.current.currentFilePath);
                } else if (!isAbsoluteWin && !isRootRelative && dynamicPropsRef.current.currentFilePath) {
                  absolutePath = resolveRelativeImagePath(pureSrc, dynamicPropsRef.current.currentFilePath);
                } else if (!isAbsoluteWin && !isRootRelative && dynamicPropsRef.current.rootFolderPath && dynamicPropsRef.current.rootFolderPath !== BROWSER_STORAGE_NAME) {
                  const sep = dynamicPropsRef.current.rootFolderPath.includes('/') ? '/' : '\\';
                  const folder = dynamicPropsRef.current.rootFolderPath.endsWith(sep) ? dynamicPropsRef.current.rootFolderPath : dynamicPropsRef.current.rootFolderPath + sep;
                  absolutePath = folder + pureSrc;
                }

                let finalSrc = api ? absolutePath : pureSrc;
                if (pureSrc.startsWith('/api/image/')) {
                  if (api || process.env.NODE_ENV === 'development') {
                    finalSrc = `https://onrivi.com${pureSrc}`;
                  } else {
                    finalSrc = pureSrc;
                  }
                  if (queryString) {
                    finalSrc += finalSrc.includes('?') ? '&' + queryString.substring(1) : queryString;
                  }
                }

                let finalDisplayName = displayName || apiHref.split('/').pop()?.split('?')[0] || '동영상';
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\.[a-zA-Z0-9]+)?$/i;
                if (uuidRegex.test(finalDisplayName)) {
                  finalDisplayName = '로컬 첨부 동영상';
                }

                return (
                  <figure data-line={videoDataLine} className="onrivi-video-figure" style={{ display: 'flex', flexDirection: 'column', width: '100%', clear: 'both' }}>
                    <AsyncVideo
                      src={finalSrc}
                      absolutePath={absolutePath}
                      rootFolder={dynamicPropsRef.current.rootFolder}
                      resourceFolderHandle={dynamicPropsRef.current.resourceFolderHandle}
                      workspaceType={dynamicPropsRef.current.workspaceType}
                      api={api}
                      queryString={queryString}
                    />
                    <figcaption className="text-[0.9em] text-zinc-500 mt-1 font-medium">
                      {finalDisplayName}
                    </figcaption>
                  </figure>
                );
              }
              const handleExternalLinkClick = (e: React.MouseEvent) => {
                let targetUrl = apiHref || href || '';
                if (targetUrl.startsWith('www.')) {
                  targetUrl = `https://${targetUrl}`;
                }
                const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;
                if (api?.openExternal && targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://') || targetUrl.startsWith('mailto:') || targetUrl.startsWith('tel:'))) {
                  e.preventDefault();
                  e.stopPropagation();
                  api.openExternal(targetUrl);
                } else if (api?.openPath && targetUrl && (targetUrl.startsWith('file:///') || /^[a-zA-Z]:[/\\]/.test(targetUrl))) {
                  e.preventDefault();
                  e.stopPropagation();
                  const cleanLocalPath = targetUrl.startsWith('file:///') ? decodeURIComponent(targetUrl.replace(/^file:\/\/\//, '')) : targetUrl;
                  api.openPath(cleanLocalPath);
                }
              };

              return (
                <a
                  href={apiHref?.startsWith('www.') ? `https://${apiHref}` : apiHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleExternalLinkClick}
                  {...props}
                >
                  {children}
                </a>
              );
            },
            table: ({ node, children, className, ...props }: any) => {
               return (
                 <TableWrapper>
                   <table className={`w-full table-auto !m-0 !mt-0 !mb-0 ${className || ''}`} {...props}>
                     {children}
                   </table>
                 </TableWrapper>
               );
             },
            tr: ({ node, children, className, ...props }: any) => {
              const line = extractDataLine(props, node);
              return (
                <tr data-line={line} className={className} {...props}>
                  {children}
                </tr>
              );
            },
            div: ({ node, className, children, ...props }: any) => {
              return <div className={className} {...props}>{children}</div>;
            },
            style: ({ node, children, ...props }: any) => {
              const cssText = getTextFromChildren(children);
              return <style dangerouslySetInnerHTML={{ __html: cssText }} {...props} />;
            },
            br: ({ node, ...props }: any) => <span className="onrivi-sentence-br" {...props} />,
            pre: ({ node, children, ...props }: any) => <div className="not-prose">{children}</div>,
            code: ({ node, inline, className, children, ...props }: any) => {
              const match = /language-(\S+)/.exec(className || '');
              const lang = match ? match[1] : '';
              const codeContent = getTextFromChildren(children).replace(/\n$/, '');
              const isInline = inline || (!match && !codeContent.includes('\n'));
              if (isInline) {
                return <code className="px-1.5 py-0.5 mx-0.5 rounded-md font-mono text-[0.9em] bg-zinc-200/80 dark:bg-zinc-700/90 text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap break-words [overflow-wrap:anywhere]" {...props}>{children}</code>;
              }
              if (lang === 'mermaid') {
                return <MermaidBlock code={codeContent} dataLine={extractDataLine(props, node)} />;
              }
              return <CodeBlock lang={lang} code={codeContent} className={className} node={node} lineMap={dynamicPropsRef.current.lineMap} {...props}>{children}</CodeBlock>;
            },
            h1: ({ node, children, style, ...props }) => {
              const line = (node as any).position?.start?.line;
              const currentLineMap = dynamicPropsRef.current.lineMap || [];
              const origLine = line ? (currentLineMap[line - 1] || line) : undefined;
              return <h1 id={origLine ? `toc-line-${origLine}` : undefined} style={{ ...style, ...getIndentStyle(node) }} {...props}>{children}</h1>;
            },
            h2: ({ node, children, style, ...props }) => {
              const line = (node as any).position?.start?.line;
              const currentLineMap = dynamicPropsRef.current.lineMap || [];
              const origLine = line ? (currentLineMap[line - 1] || line) : undefined;
              return <h2 id={origLine ? `toc-line-${origLine}` : undefined} style={{ ...style, ...getIndentStyle(node) }} {...props}>{children}</h2>;
            },
            h3: ({ node, children, style, ...props }) => {
              const line = (node as any).position?.start?.line;
              const currentLineMap = dynamicPropsRef.current.lineMap || [];
              const origLine = line ? (currentLineMap[line - 1] || line) : undefined;
              return <h3 id={origLine ? `toc-line-${origLine}` : undefined} style={{ ...style, ...getIndentStyle(node) }} {...props}>{children}</h3>;
            },
            h4: ({ node, children, style, ...props }) => {
              const line = (node as any).position?.start?.line;
              const currentLineMap = dynamicPropsRef.current.lineMap || [];
              const origLine = line ? (currentLineMap[line - 1] || line) : undefined;
              return <h4 id={origLine ? `toc-line-${origLine}` : undefined} style={{ ...style, ...getIndentStyle(node) }} {...props}>{children}</h4>;
            },
            h5: ({ node, children, style, ...props }) => {
              const line = (node as any).position?.start?.line;
              const currentLineMap = dynamicPropsRef.current.lineMap || [];
              const origLine = line ? (currentLineMap[line - 1] || line) : undefined;
              return <h5 id={origLine ? `toc-line-${origLine}` : undefined} style={{ ...style, ...getIndentStyle(node) }} {...props}>{children}</h5>;
            },
            h6: ({ node, children, style, ...props }) => {
              const line = (node as any).position?.start?.line;
              const currentLineMap = dynamicPropsRef.current.lineMap || [];
              const origLine = line ? (currentLineMap[line - 1] || line) : undefined;
              return <h6 id={origLine ? `toc-line-${origLine}` : undefined} style={{ ...style, ...getIndentStyle(node) }} {...props}>{children}</h6>;
            },
            iframe: ({ node, style, className, ...props }: any) => {
              const line = extractDataLine(props, node);
              const align = props['data-align'] || (node?.properties && (node.properties['data-align'] || node.properties['dataAlign']));
              let alignStyle: React.CSSProperties = {
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                clear: 'both',
              };
              if (align === 'left') {
                alignStyle.alignItems = 'flex-start';
              } else if (align === 'right') {
                alignStyle.alignItems = 'flex-end';
              } else if (align === 'center') {
                alignStyle.alignItems = 'center';
              }
              const src = props.src || (node?.properties && node.properties.src) || '';
              const isMap = typeof src === 'string' && (src.includes('map') || src.includes('google.com/maps'));
              const wrapperClass = isMap ? 'onrivi-map-wrapper map-embed-wrapper' : 'onrivi-iframe-wrapper';
              const figureClass = isMap ? 'onrivi-map-figure' : 'onrivi-iframe-figure';

              return (
                <figure data-line={line} style={alignStyle} className={figureClass}>
                  <div className={`relative inline-flex flex-col ${wrapperClass}`} style={{ display: 'inline-flex', flexDirection: 'column', width: 'fit-content', maxWidth: '100%' }}>
                    <iframe
                      {...props}
                      className={`rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800 max-w-full ${className || ''}`}
                      style={{ ...style, maxWidth: '100%' }}
                      loading="lazy"
                    />
                  </div>
                </figure>
              );
            },
            input: ({ node, ...props }: any) => <input {...props} />,
            p: ({ node, children, style, ...props }) => {
              if (!children) return <p />;
              // react-markdown은 마크다운 문단의 자식으로 img/video/iframe/미디어 링크가 오면 p 태그로 감쌉니다.
              // 블록 미디어 요소가 p 태그 내부에 중첩되어 생기는 규격 위반 및 DOM 분리를 방지합니다.
              const hasBlockMedia = (function check(n: any): boolean {
                if (!n) return false;
                if (n.tagName === 'img' || n.tagName === 'video' || n.tagName === 'iframe') return true;
                if (n.tagName === 'a') {
                  const href = n.properties?.href;
                  if (typeof href === 'string' && (
                    href.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/) ||
                    /(tiktok\.com|instagram\.com\/(p|reel|tv)\/|vimeo\.com|twitch\.tv|dailymotion\.com)/i.test(href) ||
                    /\.(mp4|webm|ogg|mov|avi|mkv)(\?|#|$)/i.test(href)
                  )) {
                    return true;
                  }
                }
                if (!n.children) return false;
                return n.children.some(check);
              })(node);
              
              if (hasBlockMedia) {
                return <div style={style} {...props} className="my-2">{children}</div>;
              }
              return <p style={style} {...props}>{children}</p>;
            },
            ul: ({ node, children, style, ...props }: any) => {
              const line = extractDataLine(props, node);
              return <ul data-line={line} style={style} {...props}>{children}</ul>;
            },
            ol: ({ node, children, style, start, ...props }: any) => {
              const line = extractDataLine(props, node);
              return <ol start={start} data-line={line} style={style} {...props}>{children}</ol>;
            },
            li: ({ node, children, style, ...props }: any) => {
              const textContent = getTextFromChildren(children).trim();
              const hasChildList = node.children && node.children.some((c: any) => c.type === 'element' && (c.tagName === 'ul' || c.tagName === 'ol'));
              const isEmptyRow = !hasChildList && textContent.replace(/\s+/g, '') === "onrivi-empty-row";

              if (isEmptyRow) {
                const liStyle = {
                  ...style,
                  listStyleType: 'none',
                  listStyle: 'none',
                  height: '12px',
                  maxHeight: '12px',
                  lineHeight: '12px',
                  overflow: 'hidden',
                  background: 'transparent',
                  margin: '0',
                  padding: '0',
                  pointerEvents: 'none'
                } as React.CSSProperties;

                return <li style={liStyle} className="onrivi-empty-list-row" {...props} />;
              }

              const line = (node as any).position?.start?.line;
              const currentLineMap = dynamicPropsRef.current.lineMap || [];
              const origLine = line ? (currentLineMap[line - 1] || line) : undefined;
              const dataLineVal = extractDataLine(props, node) || origLine;

              // 💡 [에디터-미리보기 숫자 리스트 번호 1:1 일치 연동]
              // props.value 또는 node.properties.value, 또는 원본 라인에서 직접 추출하여 에디터 번호 그대로 li에 바인딩
              let explicitValue = props.value ?? (node?.properties?.value ? Number(node.properties.value) : undefined);
              if (explicitValue === undefined && dataLineVal) {
                const targetContent = originalContentRef.current || contentRef.current;
                if (targetContent && typeof targetContent === 'string') {
                  const lines = targetContent.split(/\r?\n/);
                  const lineText = lines[dataLineVal - 1] || '';
                  const match = lineText.match(/^[ \t]*(\d+)\.(?:\s+|$)/);
                  if (match) {
                    explicitValue = parseInt(match[1], 10);
                  }
                }
              }

              const modifiedChildren = React.Children.map(children, (child) => {
                if (React.isValidElement(child) && child.type === 'input' && (child.props as any).type === 'checkbox') {
                  return React.cloneElement(child as React.ReactElement<any>, {
                    disabled: false,
                    className: "w-4 h-4 rounded border-emerald-500/20 text-emerald-600 focus:ring-emerald-500 cursor-pointer mr-2 align-middle",
                    onChange: (e: any) => {
                      if (dataLineVal && dynamicPropsRef.current.onCheckboxToggle) {
                        dynamicPropsRef.current.onCheckboxToggle(dataLineVal, e.target.checked);
                      }
                    }
                  });
                }
                return child;
              });

              const { value: _discardedValue, ...restProps } = props;
              return <li data-line={dataLineVal} value={explicitValue} style={style} className={props.className} {...restProps}>{modifiedChildren}</li>;
            },
            blockquote: ({ node, children, style, ...props }) => {
              // GitHub style Alerts 파싱: [!NOTE], [!TIP], [!IMPORTANT], [!WARNING], [!CAUTION] + 한글 지원 ([!참고], [!팁], [!중요], [!주의], [!경고] 등)
              let alertType: 'NOTE' | 'TIP' | 'IMPORTANT' | 'WARNING' | 'CAUTION' | null = null;
              let rawTagString = '';
              let processedChildren = children;

              const KOREAN_ALERT_MAP: Record<string, 'NOTE' | 'TIP' | 'IMPORTANT' | 'WARNING' | 'CAUTION'> = {
                'NOTE': 'NOTE', '참고': 'NOTE', '참조': 'NOTE', '메모': 'NOTE', '알림': 'NOTE',
                'TIP': 'TIP', '팁': 'TIP', '도움말': 'TIP',
                'IMPORTANT': 'IMPORTANT', '중요': 'IMPORTANT', '필독': 'IMPORTANT',
                'WARNING': 'WARNING', '주의': 'WARNING',
                'CAUTION': 'CAUTION', '경고': 'CAUTION', '위험': 'CAUTION',
              };

              const ALERT_TAG_PATTERN = '(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION|참고|참조|메모|알림|팁|도움말|중요|필독|주의|경고|위험)';
              const alertRegex = new RegExp(`^\\[!(${ALERT_TAG_PATTERN})\\]`, 'i');
              const removeRegex = new RegExp(`\\[!(${ALERT_TAG_PATTERN})\\]`, 'i');

              // 💡 [Alert 인용구 재귀 텍스트 탐색 및 태그 분리 엔진]
              // children이 배열이든, React 엘리먼트이든, rehypeSourceLinesPlugin의 <span className="onrivi-line">이든
              // 깊이와 구조에 무관하게 트리의 가장 첫 번째 의미 있는 텍스트 노드를 찾아 Alert 태그([!NOTE], [!참고] 등)를 정확히 판별합니다.
              const findFirstText = (n: any): string | null => {
                if (!n) return null;
                if (typeof n === 'string') {
                  const cleaned = n.replace(/^[\s\u00a0\u200b]+|^(?:&nbsp;)+/g, '').trim();
                  return cleaned.length > 0 ? cleaned : null;
                }
                if (Array.isArray(n)) {
                  for (const c of n) {
                    const t = findFirstText(c);
                    if (t) return t;
                  }
                  return null;
                }
                if (React.isValidElement(n)) {
                  return findFirstText((n.props as any)?.children);
                }
                return null;
              };

              const firstText = findFirstText(children);
              if (firstText) {
                const match = firstText.match(alertRegex);
                if (match) {
                  rawTagString = match[1];
                  const upperKey = rawTagString.toUpperCase();
                  alertType = KOREAN_ALERT_MAP[upperKey] || KOREAN_ALERT_MAP[rawTagString] || null;

                  // 매칭된 [!TYPE] 태그를 첫 번째 텍스트 노드에서 안전하게 소거
                  let tagRemoved = false;
                  const removeTag = (n: any): any => {
                    if (tagRemoved || !n) return n;
                    if (typeof n === 'string') {
                      const tagMatch = n.match(removeRegex);
                      if (tagMatch) {
                        tagRemoved = true;
                        const idx = n.indexOf(tagMatch[0]);
                        const before = n.substring(0, idx);
                        const after = n.substring(idx + tagMatch[0].length).replace(/^[\s\u00a0\u200b]+|^(?:&nbsp;)+/g, '').trimStart();
                        return (before.trim() ? before : '') + after;
                      }
                      return n;
                    }
                    if (Array.isArray(n)) {
                      return n.map(c => removeTag(c));
                    }
                    if (React.isValidElement(n)) {
                      const ch: any = (n.props as any)?.children;
                      if (ch === undefined || ch === null) return n;
                      const newChild = removeTag(ch);
                      return React.cloneElement(n, {}, ...(Array.isArray(newChild) ? newChild : [newChild]));
                    }
                    return n;
                  };

                  processedChildren = removeTag(children);
                }
              }

              if (alertType) {
                const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(rawTagString);
                const titleMap: Record<'NOTE' | 'TIP' | 'IMPORTANT' | 'WARNING' | 'CAUTION', string> = {
                  NOTE: isKorean ? rawTagString : 'Note',
                  TIP: isKorean ? rawTagString : 'Tip',
                  IMPORTANT: isKorean ? rawTagString : 'Important',
                  WARNING: isKorean ? rawTagString : 'Warning',
                  CAUTION: isKorean ? rawTagString : 'Caution',
                };
                const alertStyles = {
                  NOTE: { border: 'border-blue-500 dark:border-blue-400', bg: 'bg-blue-50/90 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', icon: 'ℹ️', title: titleMap.NOTE },
                  TIP: { border: 'border-emerald-500 dark:border-emerald-400', bg: 'bg-emerald-50/90 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', icon: '💡', title: titleMap.TIP },
                  IMPORTANT: { border: 'border-purple-500 dark:border-purple-400', bg: 'bg-purple-50/90 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', icon: '📢', title: titleMap.IMPORTANT },
                  WARNING: { border: 'border-amber-500 dark:border-amber-400', bg: 'bg-amber-50/90 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', icon: '⚠️', title: titleMap.WARNING },
                  CAUTION: { border: 'border-rose-500 dark:border-rose-400', bg: 'bg-rose-50/90 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', icon: '🛑', title: titleMap.CAUTION },
                }[alertType];

                return (
                  <div style={{ ...style, ...getIndentStyle(node) }} className={`border-l-4 rounded-r-lg ${alertStyles.border} ${alertStyles.bg} p-4 shadow-xs`} {...(props as any)}>
                    <div className={`flex items-center gap-2 font-bold mb-2 text-sm tracking-wide uppercase ${alertStyles.text}`}>
                      <span className="text-base">{alertStyles.icon}</span>
                      <span>{alertStyles.title}</span>
                    </div>
                    <div className="text-zinc-800 dark:text-zinc-100 font-medium prose-p:my-1 prose-p:last:mb-0 text-[0.95em] leading-relaxed">
                      {processedChildren}
                    </div>
                  </div>
                );
              }

              return (
                <blockquote
                  style={{ ...style, ...getIndentStyle(node) }}
                  className="p-4 rounded-r-lg border-l-4 border-zinc-500 dark:border-zinc-600 bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 font-normal not-italic"
                  {...props}
                >
                  {children}
                </blockquote>
              );
            }
          }), [getIndentStyle, onImageLoaded])}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}

// 에디터 커서 열·상태바처럼 미리보기와 무관한 상위 상태가 바뀌어도
// Markdown AST와 DOM을 다시 만들지 않도록 보호합니다.
export default React.memo(MarkdownViewer);
