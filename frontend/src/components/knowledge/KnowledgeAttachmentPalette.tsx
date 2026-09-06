// ====================================================================
// 📊 [OMD-KUI-PALETTE-001] KnowledgeAttachmentPalette.tsx ➔ AI 모달 지식 검색 및 첨부 팔레트
// 🎯 @KICK  : 에디터 AI 모달 내 로컬 지식 문서 검색, 청크 선택 첨부, Auto-RAG 토글 및 토큰 예산 관리
// 🛡️ @GUARD : LDSG v5.0 (#06C755), 로컬 SQLite FTS5 검색, 예산 게이지 시각화, 비대화 방지 UI 분리
// 🚨 @PATCH : **2026-09-04** — [ONRIVI-KNOWLEDGE-EDITOR-001] 에디터 AI 어시스턴트 모달 전용 지식 검색 & RAG 첨부 팔레트 신규 구현
// 🔗 @CALLS : /api/knowledge/search, /api/knowledge/collection, @/types/knowledge
// ====================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Database, FileText, Check, Plus, Trash2, 
  Sparkles, Layers, ChevronDown, ChevronUp, AlertCircle, 
  X, HelpCircle, BookOpen, ExternalLink, Loader2
} from 'lucide-react';
import type { RetrievalCandidate, KnowledgeCollection } from '@/types/knowledge';

export interface KnowledgeAttachmentPaletteProps {
  resourceFolder: string;
  attachedChunks: RetrievalCandidate[];
  onAttachChunk: (chunk: RetrievalCandidate) => void;
  onDetachChunk: (chunkId: string) => void;
  onClearAllChunks?: () => void;
  isAutoRagEnabled: boolean;
  onToggleAutoRag: (enabled: boolean) => void;
  maxTokenBudget?: number; // 기본 4,000자
  currentCharsUsed: number;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const KnowledgeAttachmentPalette: React.FC<KnowledgeAttachmentPaletteProps> = ({
  resourceFolder,
  attachedChunks,
  onAttachChunk,
  onDetachChunk,
  onClearAllChunks,
  isAutoRagEnabled,
  onToggleAutoRag,
  maxTokenBudget = 4000,
  currentCharsUsed,
  showToast,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('ALL');
  const [collections, setCollections] = useState<KnowledgeCollection[]>([]);
  const [searchResults, setSearchResults] = useState<RetrievalCandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [previewSnippetId, setPreviewSnippetId] = useState<string | null>(null);

  // 컬렉션 목록 로드
  useEffect(() => {
    if (!resourceFolder) return;
    const fetchCollections = async () => {
      try {
        const res = await fetch(`/api/knowledge/collection?resourceFolder=${encodeURIComponent(resourceFolder)}`);
        const data = await res.json();
        if (data.ok && Array.isArray(data.collections)) {
          setCollections(data.collections);
        }
      } catch (err) {
        console.error('[KnowledgeAttachmentPalette] 컬렉션 로드 실패:', err);
      }
    };
    fetchCollections();
  }, [resourceFolder]);

  // 검색 실행
  const handleExecuteSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      showToast('검색할 키워드를 입력해 주세요.', 'warning');
      return;
    }
    if (!resourceFolder) {
      showToast('리소스 폴더가 설정되지 않았습니다.', 'warning');
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch('/api/knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery.trim(),
          resourceFolder,
          collectionId: selectedCollectionId === 'ALL' ? undefined : selectedCollectionId,
          limit: 15,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSearchResults(data.candidates || []);
        if ((data.candidates || []).length === 0) {
          showToast('일치하는 지식 청크를 찾을 수 없습니다.', 'info');
        }
      } else {
        showToast(data.message || '지식 검색 실패', 'error');
      }
    } catch {
      showToast('지식 검색 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const isAttached = (chunkId: string) => {
    return attachedChunks.some(c => c.chunkId === chunkId);
  };

  // 용량 게이지 백분율 계산
  const usagePercent = Math.min(100, Math.round((currentCharsUsed / maxTokenBudget) * 100));

  return (
    <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/60 shadow-2xs overflow-hidden transition-all duration-200">
      {/* 헤더 & 토글 바 */}
      <div className="p-3.5 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-800/40 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#06C755]/15 text-[#06C755] flex items-center justify-center">
            <Database className="w-3.5 h-3.5" />
          </div>
          <span className="text-[12px] font-bold text-zinc-800 dark:text-zinc-200">
            지식 보관함 연동 (Knowledge RAG)
          </span>
          {attachedChunks.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#06C755]/15 text-[#06C755]">
              {attachedChunks.length}건 첨부됨
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 rounded-md transition-colors"
          >
            {isExpanded ? (
              <>
                <span>접기</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>검색 및 관리</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* 스마트 토글 & 첨부 요약 바 */}
      <div className="p-3.5 flex flex-col gap-3">
        {/* Auto-RAG 스마트 스위치 */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#06C755]" />
              <span className="text-[12px] font-bold text-zinc-800 dark:text-zinc-200">
                지식 보관함 자동 참조 (Auto-RAG)
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
              {isAutoRagEnabled 
                ? '프롬프트 키워드에 따라 관련 지식을 자동으로 검색하여 답변에 반영합니다.'
                : '비활성화됨: 수동으로 첨부한 지식 문서만 컨텍스트로 전달됩니다.'}
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={isAutoRagEnabled}
              onChange={(e) => onToggleAutoRag(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#06C755]"></div>
          </label>
        </div>

        {/* 선택된 청크 트레이 (Attached Chunks Tray) */}
        {attachedChunks.length > 0 && (
          <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/60 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                <FileText className="w-3.5 h-3.5 text-[#06C755]" />
                <span>첨부된 지식 컨텍스트 ({attachedChunks.length})</span>
              </div>
              {onClearAllChunks && (
                <button
                  type="button"
                  onClick={onClearAllChunks}
                  className="text-[10px] font-medium text-zinc-400 hover:text-red-500 transition-colors"
                >
                  전체 해제
                </button>
              )}
            </div>

            {/* 청크 칩 목록 */}
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar">
              {attachedChunks.map((chunk) => (
                <div
                  key={chunk.chunkId}
                  className="group flex items-center gap-1.5 px-2 py-1 rounded-md bg-white dark:bg-zinc-800 border border-[#06C755]/30 text-[11px] text-zinc-800 dark:text-zinc-200 shadow-2xs"
                  title={`${chunk.documentTitle} > ${chunk.headingPath || chunk.headingTitle} (L${chunk.startLine}~L${chunk.endLine})`}
                >
                  <span className="font-bold text-[#06C755] truncate max-w-[120px]">
                    {chunk.documentTitle}
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-500 truncate max-w-[110px]">
                    {chunk.headingPath || chunk.headingTitle}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    L{chunk.startLine}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDetachChunk(chunk.chunkId)}
                    className="p-0.5 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="첨부 해제"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* 예산 게이지 바 */}
            <div className="flex flex-col gap-1 pt-1 border-t border-zinc-200/50 dark:border-zinc-800">
              <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                <span>컨텍스트 예산 사용량</span>
                <span className="font-mono font-bold">
                  {currentCharsUsed.toLocaleString()} / {maxTokenBudget.toLocaleString()} 자 ({usagePercent}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    usagePercent > 90
                      ? 'bg-rose-500'
                      : usagePercent > 70
                      ? 'bg-amber-500'
                      : 'bg-[#06C755]'
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 확장 영역: 검색 패널 */}
        {isExpanded && (
          <div className="flex flex-col gap-3 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
            {/* 검색 툴바 (컬렉션 필터 + 검색창) */}
            <form onSubmit={handleExecuteSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {collections.length > 0 && (
                <select
                  value={selectedCollectionId}
                  onChange={(e) => setSelectedCollectionId(e.target.value)}
                  className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:border-[#06C755] shrink-0"
                >
                  <option value="ALL">전체 컬렉션</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name} ({col.documentCount ?? 0})
                    </option>
                  ))}
                </select>
              )}

              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="지식 문서 검색 키워드 입력 (예: REST API, 보안 정책)"
                  className="w-full pl-8 pr-8 py-1.5 text-[12px] rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 outline-none focus:border-[#06C755]"
                />
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-white bg-[#06C755] hover:bg-[#05B04B] disabled:opacity-50 rounded-lg transition-colors shrink-0 shadow-2xs"
              >
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>검색</span>
              </button>
            </form>

            {/* 검색 결과 리스트 */}
            {searchResults.length > 0 && (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  검색된 지식 청크 ({searchResults.length})
                </span>
                {searchResults.map((cand) => {
                  const attached = isAttached(cand.chunkId);
                  const isSnippetOpen = previewSnippetId === cand.chunkId;

                  return (
                    <div
                      key={cand.chunkId}
                      className={`p-2.5 rounded-lg border text-[11px] transition-all duration-150 ${
                        attached
                          ? 'bg-emerald-50/30 dark:bg-emerald-950/15 border-[#06C755]/40'
                          : 'bg-white dark:bg-zinc-800/80 border-zinc-200/80 dark:border-zinc-700/80 hover:border-zinc-300 dark:hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-zinc-800 dark:text-zinc-100 truncate">
                              {cand.documentTitle}
                            </span>
                            <span className="text-zinc-400 text-[10px]">›</span>
                            <span className="font-medium text-emerald-700 dark:text-emerald-400 truncate">
                              {cand.headingPath || cand.headingTitle}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400">
                              L{cand.startLine}~L{cand.endLine}
                            </span>
                          </div>

                          {/* 연관도 점수 배지 */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-[#06C755] bg-[#06C755]/10 px-1.5 py-0.2 rounded">
                              일치도 {Math.round(cand.finalScore || cand.score || 0)}%
                            </span>
                            {cand.snippet && (
                              <button
                                type="button"
                                onClick={() => setPreviewSnippetId(isSnippetOpen ? null : cand.chunkId)}
                                className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 underline"
                              >
                                {isSnippetOpen ? '내용 닫기' : '미리보기'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 첨부 / 해제 버튼 */}
                        <button
                          type="button"
                          onClick={() => {
                            if (attached) {
                              onDetachChunk(cand.chunkId);
                            } else {
                              onAttachChunk(cand);
                            }
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors shrink-0 shadow-2xs ${
                            attached
                              ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-red-100 hover:text-red-600'
                              : 'bg-[#06C755] text-white hover:bg-[#05B04B]'
                          }`}
                        >
                          {attached ? (
                            <>
                              <Check className="w-3 h-3 text-[#06C755]" />
                              <span>첨부됨</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>첨부</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* 스니펫 아코디언 */}
                      {isSnippetOpen && cand.snippet && (
                        <div className="mt-2 p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-[11px] font-mono text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto custom-scrollbar">
                          {cand.snippet}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
