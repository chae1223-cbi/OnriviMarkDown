// ====================================================================
// 📊 [OMD-MODAL-KnowledgeDetail-0001] KnowledgeDetailModal.tsx ➔ 지식 문서 설정 상세 분석 모달
// 🎯 @KICK  : 지식 문서 등록/설정 시 생성된 AI 요약, 핵심 요점, 헤딩별 분할 청크(라인 범위, 키워드), 추출 태그(관련도 점수), 확장 검색어의 상세 분석 결과를 직관적으로 시각화
// 🛡️ @GUARD : LINE Design System LDSG v5.0 (#06C755), 청크별 에디터 라인 점프 연동, 빈 데이터 안전 가드
// 🚨 @PATCH : **2026-09-04** — 모달 상단 헤더 아이콘을 남성 학사(📗)로 교체
//             **2026-09-04** — [지식 문서 설정 상세내역 모달 신규 구현] 단순 알림 메시지 대신 청크 분할 구조, 태그, 요약 등을 완벽 시각화하여 사용자에게 즉시 안내
// 🔗 @CALLS : /api/knowledge/detail, app:open-file-at-line, app:open-knowledge-manager
// ====================================================================

import React, { useState } from 'react';
import { 
  X, CheckCircle2, Sparkles, Tag, Layers, FileText, 
  ExternalLink, Search, Hash, ChevronDown, ChevronUp, Database, ArrowRight
} from 'lucide-react';
import type { KnowledgeDocumentDetail } from '@/types/knowledge';

interface KnowledgeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  detail: KnowledgeDocumentDetail | null;
  onOpenKnowledgeManager?: () => void;
  showToast?: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const KnowledgeDetailModal: React.FC<KnowledgeDetailModalProps> = ({
  isOpen,
  onClose,
  detail,
  onOpenKnowledgeManager,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'chunks' | 'tags'>('summary');
  const [expandedChunkId, setExpandedChunkId] = useState<string | null>(null);

  if (!isOpen || !detail) return null;

  const handleOpenInEditor = (startLine: number = 1) => {
    window.dispatchEvent(new CustomEvent('app:open-file-at-line', {
      detail: { filePath: detail.filePath, startLine }
    }));
    if (showToast) {
      showToast(`'${detail.filePath}' 문서를 에디터 ${startLine}번 라인에서 열었습니다.`, 'info');
    }
    onClose();
  };

  const handleOpenManager = () => {
    onClose();
    if (onOpenKnowledgeManager) {
      onOpenKnowledgeManager();
    } else {
      window.dispatchEvent(new CustomEvent('app:open-knowledge-manager'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-[#1C1E22] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#06C755]/15 text-[#06C755] flex items-center justify-center font-extrabold text-xl shrink-0 shadow-2xs">
              📗
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                  지식 문서 설정 상세 분석
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  READY (정상 색인)
                </span>
                {detail.analyzerModel && (
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
                    {detail.analyzerModel}
                  </span>
                )}
                {detail.documentType && (
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60">
                    {detail.documentType}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5 font-mono">
                📁 {detail.filePath}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0 ml-2"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 📊 4대 지식 메트릭 바 */}
        <div className="grid grid-cols-4 gap-2.5 px-6 py-3 bg-zinc-100/50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 shrink-0 text-center">
          <div className="p-2 rounded-xl bg-white dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/60">
            <span className="text-[10px] text-zinc-400 font-medium block">생성 청크</span>
            <span className="text-sm font-extrabold text-[#06C755]">{detail.chunksCount}개</span>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/60">
            <span className="text-[10px] text-zinc-400 font-medium block">추출 태그</span>
            <span className="text-sm font-extrabold text-violet-600 dark:text-violet-400">{detail.tags?.length || 0}개</span>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/60">
            <span className="text-[10px] text-zinc-400 font-medium block">연관 검색어</span>
            <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{detail.searchTerms?.length || 0}개</span>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/60">
            <span className="text-[10px] text-zinc-400 font-medium block">파일 크기</span>
            <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
              {detail.fileSize ? `${Math.round(detail.fileSize / 1024 * 10) / 10} KB` : '텍스트'}
            </span>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 gap-4 shrink-0">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'summary'
                ? 'border-[#06C755] text-[#06C755]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 요약 & 핵심 요점</span>
          </button>

          <button
            onClick={() => setActiveTab('chunks')}
            className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'chunks'
                ? 'border-[#06C755] text-[#06C755]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>분할 청크 내역 ({detail.chunksCount}개)</span>
          </button>

          <button
            onClick={() => setActiveTab('tags')}
            className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tags'
                ? 'border-[#06C755] text-[#06C755]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>지식 태그 & 검색어 ({detail.tags?.length || 0})</span>
          </button>
        </div>

        {/* 본문 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* 1. AI 요약 & 핵심 요점 탭 */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              {/* 핵심 요약 카드 */}
              <div>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mb-2 text-xs">
                  <span className="text-[#06C755]">💡</span> AI 핵심 요약
                </span>
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/50 text-zinc-800 dark:text-zinc-200 leading-relaxed text-sm">
                  {detail.summary || '문서 요약 정보가 없습니다.'}
                </div>
              </div>

              {/* 핵심 요점 리스트 */}
              <div>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mb-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#06C755]" /> 추출된 핵심 요점 (Key Points)
                </span>
                {detail.keyPoints && detail.keyPoints.length > 0 ? (
                  <div className="space-y-2">
                    {detail.keyPoints.map((point, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#06C755]/15 text-[#06C755] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {point}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400 italic p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl">
                    추출된 핵심 요점이 없습니다.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 2. 분할 청크 내역 탭 */}
          {activeTab === 'chunks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-zinc-500 mb-1">
                <span>마크다운 헤딩 계층 구조를 기반으로 안전하게 분할된 청크 목록입니다.</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">총 {detail.chunks.length}개 구간</span>
              </div>

              {detail.chunks.map((chunk, idx) => {
                const isExpanded = expandedChunkId === chunk.id;
                return (
                  <div 
                    key={chunk.id || idx}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 overflow-hidden shadow-2xs hover:border-[#06C755]/40 transition"
                  >
                    {/* 청크 헤더 바 */}
                    <div className="p-3 flex items-center justify-between gap-3 bg-zinc-50/60 dark:bg-zinc-800/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-extrabold rounded-md bg-[#06C755]/15 text-[#06C755]">
                          #{chunk.chunkIndex + 1}
                        </span>
                        {chunk.headingLevel > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-sm bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                            H{chunk.headingLevel}
                          </span>
                        )}
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate" title={chunk.headingPath || chunk.headingTitle}>
                          {chunk.headingPath || chunk.headingTitle || '(헤딩 없는 서두 구간)'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-zinc-400 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-200/80 dark:border-zinc-700/60">
                          Lines {chunk.startLine} ~ {chunk.endLine}
                        </span>
                        <button
                          onClick={() => handleOpenInEditor(chunk.startLine)}
                          className="px-2 py-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-[#06C755] dark:hover:text-[#06C755] hover:bg-white dark:hover:bg-zinc-700 rounded-md transition flex items-center gap-1"
                          title="이 청크 위치의 에디터 라인으로 이동"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>이동</span>
                        </button>
                        <button
                          onClick={() => setExpandedChunkId(isExpanded ? null : chunk.id)}
                          className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                          title={isExpanded ? '본문 접기' : '본문 미리보기'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* 청크 메타 & 요약 */}
                    <div className="px-3.5 py-2.5 space-y-1.5">
                      {chunk.chunkSummary && (
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {chunk.chunkSummary}
                        </p>
                      )}

                      {chunk.keywords && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[10px] text-zinc-400 font-semibold">키워드:</span>
                          {(Array.isArray(chunk.keywords) 
                            ? chunk.keywords 
                            : chunk.keywords.split(',')
                          ).map((kw: string, kidx: number) => (
                            <span 
                              key={kidx} 
                              className="px-1.5 py-0.5 text-[10px] rounded-sm bg-zinc-100 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300"
                            >
                              {typeof kw === 'string' ? kw.trim() : String(kw)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 아코디언 본문 뷰 */}
                    {isExpanded && chunk.chunkText && (
                      <div className="p-3 border-t border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/40 dark:bg-zinc-900/60">
                        <pre className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-all max-h-48 overflow-y-auto p-2 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
                          {chunk.chunkText}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. 지식 태그 & 검색어 탭 */}
          {activeTab === 'tags' && (
            <div className="space-y-5">
              {/* 태그 영역 */}
              <div>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mb-2 text-xs">
                  <Tag className="w-4 h-4 text-violet-500" />
                  문서 관련도 지식 태그 ({detail.tags?.length || 0}개)
                </span>
                {detail.tags && detail.tags.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {detail.tags.map((tag, idx) => (
                      <div 
                        key={idx}
                        className="p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/70 dark:border-violet-800/60 flex items-center justify-between"
                      >
                        <span className="font-bold text-violet-700 dark:text-violet-300 truncate">
                          #{tag.name}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-violet-200/70 dark:bg-violet-900 text-violet-800 dark:text-violet-200 shrink-0">
                          {tag.score}점
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400 italic p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl">
                    추출된 태그가 없습니다.
                  </p>
                )}
              </div>

              {/* 연관 검색어 영역 */}
              <div>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mb-2 text-xs">
                  <Search className="w-4 h-4 text-blue-500" />
                  하이브리드 RAG 검색 매칭용 연관 검색어 ({detail.searchTerms?.length || 0}개)
                </span>
                <p className="text-[11px] text-zinc-400 mb-2.5">
                  사용자가 검색창에 다양한 표현으로 질문하더라도 이 문서를 찾아낼 수 있도록 AI가 생성한 동의어/연관어 사전입니다.
                </p>
                {detail.searchTerms && detail.searchTerms.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {detail.searchTerms.map((term, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/50 font-medium text-xs flex items-center gap-1"
                      >
                        <Search className="w-2.5 h-2.5 opacity-60" />
                        <span>{term}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400 italic p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl">
                    생성된 연관 검색어가 없습니다.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 하단 푸터 액션 바 */}
        <div className="px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 flex items-center justify-between shrink-0">
          <button
            onClick={handleOpenManager}
            className="px-3.5 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-xl transition flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-zinc-500" />
            <span>지식 보관함 전체보기</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenInEditor(1)}
              className="px-4 py-2 text-xs font-bold text-[#06C755] bg-[#06C755]/10 hover:bg-[#06C755]/20 border border-[#06C755]/30 rounded-xl transition flex items-center gap-1.5"
            >
              <span>에디터에서 열기</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-white bg-[#06C755] hover:bg-[#05a847] rounded-xl shadow-xs transition cursor-pointer"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
