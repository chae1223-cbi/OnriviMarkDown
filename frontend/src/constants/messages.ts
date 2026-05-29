// 🍅 [Onrivi Author - 시스템 전역 메시지 커널]
// 모든 사용자 알림 메시지를 이 파일 하나에서 SSoT(Single Source of Truth)로 관리합니다.
// 하드코딩된 문자열 대신 이 파일의 키를 사용하세요.

import type { ToastType } from '../utils/toast';

export interface SystemMessage {
  type: ToastType;
  text: string;
}

export const SYSTEM_MESSAGES = {
  // ─── 에디터 / 모나코 ───────────────────────────────────────────────
  MONACO_LOAD_ERROR:    { type: 'warning', text: '에디터 로드 실패. 오프라인 모드로 안전 복구합니다.' },
  UNMAPPED_COMMAND:     { type: 'warning', text: '알 수 없는 명령어가 수신되었습니다.' },

  // ─── 파일 I/O ──────────────────────────────────────────────────────
  FILE_SAVE_SUCCESS:    { type: 'success', text: '저장되었습니다.' },
  FILE_SAVE_ERROR:      { type: 'error',   text: '파일 저장 중 오류가 발생했습니다. 권한을 확인해 주세요.' },
  FILE_OPEN_ERROR:      { type: 'error',   text: '파일을 여는데 실패했습니다.' },
  FILE_READ_ERROR:      { type: 'error',   text: '파일 읽기에 실패했습니다.' },
  FILE_NEW:             { type: 'info',    text: '새 문서를 시작합니다.' },
  FILE_OPENED:          { type: 'info',    text: '파일을 열었습니다.' },

  // ─── 워크스페이스 ──────────────────────────────────────────────────
  WORKSPACE_CONNECTED:  { type: 'success', text: '워크스페이스가 연결되었습니다.' },
  WORKSPACE_ERROR:      { type: 'error',   text: '워크스페이스 선택 중 오류가 발생했습니다.' },
  WORKSPACE_CANCELED:   { type: 'info',    text: '폴더 선택이 취소되었습니다.' },
  WORKSPACE_UNSUPPORTED:{ type: 'warning', text: '데스크톱 모드(또는 최신 Chrome)에서만 사용 가능합니다.' },

  // ─── 파일 목록 / 디렉토리 ─────────────────────────────────────────
  FILELIST_ERROR:       { type: 'error',   text: '파일 목록을 불러오는 중 오류가 발생했습니다.' },
  FILELIST_FETCH_ERROR: { type: 'error',   text: '파일 목록 조회 실패. 잠시 후 다시 시도해 주세요.' },
  BACKEND_ROOT_ERROR:   { type: 'warning', text: '백엔드 루트 경로 조회 실패.' },
  CACHE_INVALID:        { type: 'warning', text: '워크스페이스 캐시가 유효하지 않아 초기화합니다.' },

  // ─── 클립보드 / 붙여넣기 ──────────────────────────────────────────
  PASTE_IMAGE_ERROR:    { type: 'error',   text: '클립보드 이미지 업로드에 실패했습니다.' },
  PASTE_TABLE_SUCCESS:  { type: 'success', text: '웹 표 데이터가 마크다운으로 변환되었습니다.' },
  PASTE_TEXT_SUCCESS:   { type: 'success', text: '붙여넣은 텍스트가 자동으로 정제되었습니다.' },
  PASTE_HTML_ERROR:     { type: 'error',   text: 'HTML 표 파싱 중 오류가 발생했습니다.' },

  // ─── 내보내기 / 복사 ──────────────────────────────────────────────
  COPY_SUCCESS:         { type: 'success', text: '미리보기 내용이 클립보드에 복사되었습니다.' },
  COPY_NO_PREVIEW:      { type: 'warning', text: '미리보기 창이 활성화되어 있지 않습니다.' },

  // ─── 문서 편집 ────────────────────────────────────────────────────
  DOC_CLEAN_SUCCESS:    { type: 'success', text: '문서 내 서식이 일괄 정리되었습니다.' },
  DOC_CLEAN_NONE:       { type: 'info',    text: '정리할 서식이 없습니다.' },
} as const;

export type SystemMessageKey = keyof typeof SYSTEM_MESSAGES;
