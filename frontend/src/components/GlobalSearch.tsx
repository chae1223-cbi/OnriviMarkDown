"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, FileText } from 'lucide-react';
import { FileNode } from '@/lib/indexedDbHelper';
import { msg } from '@/lib/systemMessages';
import { getApiUrl } from '@/lib/apiUrlBuilder';

interface SearchResult {
  fileName: string;
  path: string;
  count: number;
  snippets: string[];
  lineNumbers: number[];
  fileNameMatch?: boolean;
}

interface TabContent {
  id: string;
  name: string;
  path: string | null;
  content: string;
}

interface GlobalSearchProps {
  isDarkMode: boolean;
  content: string;
  currentFileName: string;
  onFileOpenAndJump: (filePath: string, lineNumber: number, searchTerm?: string) => void;
  workspacePath?: string;
  rootFolderHandle?: any;
  onSelectFolder?: () => void;
  tabs?: TabContent[];
  workspaceType?: string;
  fileList?: FileNode[];
}

// ====================================================================
// 📊 [OMD-FILE-GlobalSearch-0001 ✅ FIXED] GlobalSearch ➔ GlobalSearch
// 🎯 @KICK  : 현재 지정된 작업장 실폴더(Workspace) 내에서 md 파일 및 문서 전체 검색 후 클릭 시 해당 줄로 점프
// 🛡️ @GUARD : 150ms 디바운스, 검색어 미입력 시 결과 초기화, 작업장 폴더 동기화 보장
// 🚨 @PATCH : 2026-09-16 — [워크스페이스 검색 점프 및 검색어 하이라이트 연동] onFileOpenAndJump 시그니처에 searchTerm 파라미터를 추가 전달하여 파일 열기 및 줄 이동 시 일치하는 검색어 텍스트가 하이라이트되도록 연동
//             2026-09-12 — [작업장 실폴더 한정 검색 보장 & 고대비 UI] searchFolder가 현재 선택된 작업장(workspacePath)과 항상 자동 동기화되도록 수정하고, 작업장 내 검색 안내 뱃지 및 Modern Technical Editorial 디자인 시스템 적용
// 🔗 @CALLS : handleSelectFolder, scanDirectory
// ====================================================================
export default function GlobalSearch({ isDarkMode, content, currentFileName, onFileOpenAndJump, workspacePath, rootFolderHandle, onSelectFolder, tabs, workspaceType, fileList }: GlobalSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  // 현재 작업장 폴더 경로와 항상 동기화
  const [searchFolder, setSearchFolder] = useState<string | null>(workspacePath || null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [matchCase, setMatchCase] = useState(false);

  // 작업장(workspacePath)이 변경되면 검색 대상 폴더도 즉시 동기화
  useEffect(() => {
    if (workspacePath) {
      setSearchFolder(workspacePath);
    }
  }, [workspacePath]);

  // 폴더 선택 창 실행
  // ====================================================================
  // 📊 [OMD-FILE-GlobalSearch-0002] GlobalSearch ➔ handleSelectFolder
  // 🎯 @KICK  : 작업장 폴더 선택 또는 변경 연동
  // 🛡️ @GUARD : electronAPI 존재 여부 확인 후 분기 처리
  // 🚨 @PATCH : 2026-09-12 — 상위 작업장 폴더 선택(onSelectFolder)과 연동하여 작업장 일관성 유지
  // 🔗 @CALLS : onSelectFolder
  // ====================================================================
  const handleSelectFolder = async () => {
    if (onSelectFolder) {
      onSelectRootFolderHandler();
    } else if (typeof window !== 'undefined' && (window as any).electronAPI) {
      try {
        const result = await (window as any).electronAPI.selectFolder();
        if (result?.status === 'success' && result.path) {
          setSearchFolder(result.path);
        } else if (result?.status === 'canceled') {
          msg.info("폴더 선택이 취소되었습니다.");
        }
      } catch (e) {
        msg.error("폴더 선택 오류", e);
      }
    }
  };

  const onSelectRootFolderHandler = () => {
    if (onSelectFolder) {
      onSelectFolder();
    }
  };

  // 🛠️ fileList 트리를 평탄화하여 모든 .md 파일 노드 추출
  const flattenMdFiles = useCallback((nodes: FileNode[]): FileNode[] => {
    const result: FileNode[] = [];
    const walk = (list: FileNode[]) => {
      for (const node of list) {
        if (node.kind === 'file' && node.name.toLowerCase().endsWith('.md')) {
          result.push(node);
        }
        if (node.kind === 'directory' && node.children) {
          walk(node.children);
        }
      }
    };
    walk(nodes);
    return result;
  }, []);

  // 🛠️ 단일 파일/탭 검색 함수
  const searchFile = (text: string, fileName: string, filePath: string | null, regex: RegExp): SearchResult | null => {
    const lines = text.split('\n');
    const snippets: string[] = [];
    const lineNumbers: number[] = [];
    let fileNameMatched = false;
    regex.lastIndex = 0;
    if (regex.test(fileName)) { fileNameMatched = true; }
    const nameNoExt = fileName.replace(/\.md$/i, '');
    regex.lastIndex = 0;
    if (regex.test(nameNoExt)) { fileNameMatched = true; }
    lines.forEach((line: string, index: number) => {
      regex.lastIndex = 0;
      if (regex.test(line)) {
        snippets.push(`Line ${index + 1}: ${line.trim()}`);
        lineNumbers.push(index + 1);
      }
    });
    if (snippets.length > 0 || fileNameMatched) {
      return { fileName, path: filePath || fileName, count: snippets.length, snippets, lineNumbers, fileNameMatch: fileNameMatched && snippets.length === 0 };
    }
    return null;
  };

  // 검색 실행
  // ====================================================================
  // 📊 [OMD-FILE-GlobalSearch-0003] GlobalSearch ➔ useEffect (searchLogic)
  // 🎯 @KICK  : 검색어 입력 시 fileList/tabs/단일문서 순서로 검색
  // 🛡️ @GUARD : 150ms 디바운스, 검색어 미입력 시 결과 초기화
  // 🚨 @PATCH : 2026-06-23 — fileList 기반 검색으로 변경 (탐색기와 동일한 파일 목록 사용)
  // 🔗 @CALLS : electronAPI.searchInFolder, fetch, getApiUrl
  // ====================================================================
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const escaped = searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(escaped, matchCase ? 'g' : 'gi');
        let results: SearchResult[] = [];

        // A. Electron → 메인 프로세스
        const effectiveFolder = searchFolder || (workspacePath ? workspacePath : null);
        if (effectiveFolder && typeof window !== 'undefined' && (window as any).electronAPI) {
          const data = await (window as any).electronAPI.searchInFolder({
            folderPath: effectiveFolder, searchTerm, matchCase, useRegex: false
          });
          setResults(data || []);
          return;
        }

        // B. fileList 기반 검색 (탐색기와 동일한 파일 목록)
        const mdFiles = flattenMdFiles(fileList || []);
        for (const file of mdFiles) {
          try {
            const matchedTab = tabs?.find(t => t.path === file.path || t.name === file.name);
            const text = matchedTab ? matchedTab.content : await (await file.handle!.getFile()).text();
            const r = searchFile(text, file.name, file.path || file.name, regex);
            if (r) results.push(r);
          } catch (e) { /* 파일 읽기 실패 시 skip */ }
        }

        // C. fileList에 없는 열린 탭 추가 검색
        if (tabs && tabs.length > 0) {
          const searchPaths = new Set(results.map(r => r.fileName));
          for (const tab of tabs) {
            if (searchPaths.has(tab.name)) continue;
            const r = searchFile(tab.content, tab.name, tab.path || tab.name, regex);
            if (r) { results.push(r); searchPaths.add(tab.name); }
          }
        }

        // D. 단일 문서 (결과가 없을 때만)
        if (results.length === 0) {
          const r = searchFile(content, currentFileName, 'current', regex);
          if (r) results = [r];
        }

        setResults(results);
      } catch (e) {
        msg.error("검색 처리 오류", e);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, content, matchCase, currentFileName, searchFolder, workspacePath, fileList, tabs]);

  // 총 매칭된 개수 계산
  const totalMatchCount = results.reduce((acc, r) => acc + (r.count || 0), 0);

  return (
    <div className="w-full h-full flex flex-col min-h-0 select-none text-[13px]">
      {/* 1. 검색 설정 패널 (Modern Technical Editorial) */}
      <div className="p-3 border-b border-[#E2E8F0] dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/30 backdrop-blur-xs">
        {/* 검색 대상 작업장 실폴더 표시 뱃지 */}
        <div className="flex items-center justify-between gap-1.5 mb-2 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-[11px]">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="font-extrabold text-[#1d4ed8] dark:text-blue-400 shrink-0">작업장</span>
            <span className="text-slate-400 dark:text-zinc-500 shrink-0">|</span>
            <span className="font-bold text-slate-800 dark:text-zinc-200 truncate" title={searchFolder || workspacePath || '현재 워크스페이스'}>
              📁 {searchFolder ? searchFolder.split(/[\\/]/).pop() || searchFolder : workspacePath ? workspacePath.split(/[\\/]/).pop() || workspacePath : '작업장 전체'}
            </span>
          </div>
          {onSelectFolder && (
            <button
              onClick={handleSelectFolder}
              className="px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-zinc-300 hover:text-[#1d4ed8] dark:hover:text-blue-400 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors shrink-0"
              title="작업장 변경"
            >
              변경
            </button>
          )}
        </div>

        <div className="relative mb-2">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder={searchFolder || workspacePath ? "현재 작업장 내 모든 md 파일 검색..." : fileList && fileList.length > 0 ? "작업장 전체 검색..." : tabs && tabs.length > 0 ? "열린 탭 전체 검색..." : "현재 문서 내용 검색..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className={`w-full pl-9 pr-8 py-2 text-[12px] font-medium rounded-lg border outline-none transition-all ${
              isDarkMode
                ? 'bg-[#0f172a]/90 border-slate-800 text-zinc-100 placeholder:text-zinc-500 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/30'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/20 shadow-2xs'
            }`}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="검색어 지우기"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* 대소문자 구분 토글 (고대비 및 정렬) */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-zinc-500 font-medium">
            {isLoading ? "검색 중..." : searchTerm ? "실시간 검색" : "검색어 입력"}
          </span>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white font-bold transition-colors">
            <input 
              type="checkbox" 
              checked={matchCase} 
              onChange={() => setMatchCase(!matchCase)} 
              className="rounded w-3.5 h-3.5 accent-[#1d4ed8] cursor-pointer" 
            />
            <span>대소문자 구분</span>
          </label>
        </div>
      </div>

      {/* 2. 검색 결과 현황 헤더 바 (규칙 8: 고대비 및 뱃지 스타일) */}
      <div className="px-3 py-2 border-b border-[#E2E8F0]/70 dark:border-slate-800/60 bg-slate-100/70 dark:bg-slate-900/60 flex items-center justify-between text-[12px] font-bold text-slate-800 dark:text-zinc-200">
        <div className="flex items-center gap-1.5">
          <span>매칭된 파일:</span>
          <span className="px-1.5 py-0.2 rounded-md bg-[#1d4ed8]/10 text-[#1d4ed8] dark:bg-[#1d4ed8]/25 dark:text-blue-400 font-extrabold text-[11px]">
            {results.length}개
          </span>
        </div>
        {results.length > 0 && totalMatchCount > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-zinc-400 font-semibold">
            <span>총</span>
            <span className="text-[#1d4ed8] dark:text-blue-400 font-bold">{totalMatchCount}건</span>
            <span>일치</span>
          </div>
        )}
      </div>

      {/* 3. 검색 결과 리스트 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2.5">
        {results.map((result, idx) => (
          <div 
            key={idx} 
            className="rounded-lg border border-[#E2E8F0] dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 overflow-hidden shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
          >
            {/* 파일 헤더 영역 */}
            <div className="px-2.5 py-1.5 flex items-center justify-between bg-slate-100/80 dark:bg-slate-800/60 border-b border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
                <FileText size={14} className="text-[#1d4ed8] dark:text-blue-400 shrink-0" />
                <span className="text-[12px] font-bold text-slate-900 dark:text-zinc-100 truncate" title={result.path}>
                  {result.fileName}
                </span>
              </div>
              {!result.fileNameMatch && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#1d4ed8]/10 text-[#1d4ed8] dark:bg-[#1d4ed8]/20 dark:text-blue-300 font-extrabold shrink-0">
                  {result.count}건
                </span>
              )}
              {result.fileNameMatch && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
                  파일명 일치
                </span>
              )}
            </div>
            
            {/* 스니펫 줄 목록 */}
            <div className="p-1.5 space-y-1">
              {result.fileNameMatch ? (
                <div 
                  onClick={() => onFileOpenAndJump(result.path, 1, searchTerm)}
                  className="px-2 py-1.5 text-[11px] text-[#1d4ed8] dark:text-blue-400 font-semibold flex items-center gap-1.5 cursor-pointer rounded-md hover:bg-[#1d4ed8]/10 dark:hover:bg-[#1d4ed8]/20 transition-colors"
                >
                  <span>📄</span> 파일명 일치 (클릭하여 파일 열기)
                </div>
              ) : (
                result.snippets.map((snippet, i) => {
                  const lineNum = result.lineNumbers[i];
                  // "Line 1283: " 접두사 분리하여 라인 번호 뱃지와 텍스트 분리
                  const cleanSnippet = snippet.replace(/^Line\s+\d+:\s*/, '');
                  const lineDisplay = lineNum || snippet.match(/^Line\s+(\d+):/)?.[1];

                  return (
                    <div 
                      key={i} 
                      onClick={() => lineNum && onFileOpenAndJump(result.path, lineNum, searchTerm)}
                      onDoubleClick={() => lineNum && onFileOpenAndJump(result.path, lineNum, searchTerm)}
                      className="group flex items-start gap-1.5 px-2 py-1.5 rounded-md text-[12px] text-slate-800 dark:text-zinc-200 hover:text-slate-950 dark:hover:text-white hover:bg-[#1d4ed8]/10 dark:hover:bg-[#1d4ed8]/20 transition-all cursor-pointer leading-normal"
                      title="클릭 시 해당 줄로 바로 이동합니다"
                    >
                      {lineDisplay && (
                        <span className="shrink-0 mt-0.5 px-1 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-zinc-400 group-hover:bg-[#1d4ed8]/20 group-hover:text-[#1d4ed8] dark:group-hover:text-blue-300 transition-colors">
                          L.{lineDisplay}
                        </span>
                      )}
                      <div className="flex-1 min-w-0 font-mono text-[11.5px] truncate">
                        {cleanSnippet.split(new RegExp(`(${searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi')).map((part, pi) => (
                          <React.Fragment key={pi}>
                            {part.toLowerCase() === searchTerm.toLowerCase() && searchTerm !== "" ? (
                              <mark className="bg-[#f97316]/20 text-[#ea580c] dark:text-[#fb923c] font-black rounded px-0.5">
                                {part}
                              </mark>
                            ) : (
                              <span>{part}</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}

        {searchTerm && results.length === 0 && !isLoading && (
          <div className="text-[12px] text-slate-500 dark:text-zinc-400 font-medium text-center py-12 flex flex-col items-center gap-2">
            <Search size={22} className="text-slate-300 dark:text-zinc-600" />
            <span>검색 결과가 없습니다.</span>
          </div>
        )}
      </div>
    </div>
  );
}
