"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, CaseSensitive, FileText } from 'lucide-react';
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
  onFileOpenAndJump: (filePath: string, lineNumber: number) => void;
  workspacePath?: string;
  rootFolderHandle?: any;
  onSelectFolder?: () => void;
  tabs?: TabContent[];
  workspaceType?: string;
  fileList?: FileNode[];
}

// ====================================================================
// 📊 [OMD-FILE-GlobalSearch-0001] GlobalSearch ➔ GlobalSearch
// 🎯 @KICK  : 워크스페이스/폴더/단일 문서 전체를 검색하고 결과를 클릭 시 파일로 이동
// 🛡️ @GUARD : 150ms 디바운스, 검색어 미입력 시 결과 초기화
// 🚨 @PATCH : 없음
// 🔗 @CALLS : handleSelectFolder, scanDirectory
// ====================================================================
export default function GlobalSearch({ isDarkMode, content, currentFileName, onFileOpenAndJump, workspacePath, rootFolderHandle, onSelectFolder, tabs, workspaceType, fileList }: GlobalSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFolder, setSearchFolder] = useState<string | null>(null); // 검색 대상 폴더 경로
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [matchCase, setMatchCase] = useState(false);

  // 폴더 선택 창 실행
  // ====================================================================
  // 📊 [OMD-FILE-GlobalSearch-0002] GlobalSearch ➔ handleSelectFolder
  // 🎯 @KICK  : Electron 폴더 선택 다이얼로그 실행 또는 상위 onSelectFolder 콜백 호출
  // 🛡️ @GUARD : electronAPI 존재 여부 확인 후 분기 처리
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : onSelectFolder
  // ====================================================================
  const handleSelectFolder = async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
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
    } else if (onSelectFolder) {
      // 💡 Addon/Browser 환경: 상위에서 정의된 selectRootFolder 기능 기동
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
  }, [searchTerm, content, matchCase, currentFileName, searchFolder, workspacePath, fileList, tabs]);

  return (
    <div className="w-full h-full flex flex-col min-h-0 select-none">
      {/* 검색 설정 패널 */}
      <div className={`p-3 border-b ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
        {/* 사용자 피드백에 의해 검색 대상 폴더 경로 바 및 폴더 선택 버튼 제거 */}

        <div className="relative mb-2">
          <input 
            type="text" 
            placeholder={searchFolder ? "폴더 내 모든 md 파일 검색..." : fileList && fileList.length > 0 ? "워크스페이스 전체 검색..." : tabs && tabs.length > 0 ? "열린 탭 전체 검색..." : "현재 문서 내용 검색..."} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className={`w-full pl-9 pr-12 py-2.5 text-base rounded-lg border outline-none transition-all ${
              isDarkMode 
                ? 'bg-zinc-900 border-white/10 focus:ring-1 focus:ring-blue-500' 
                : 'bg-zinc-100 border-black/5 focus:ring-2 focus:ring-blue-500/20'
            }`}
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40">
            <button 
              onClick={() => setMatchCase(!matchCase)}
              className={`hover:text-blue-500 transition-colors ${matchCase ? 'text-blue-500 opacity-100' : ''}`}
              title="대소문자 구분"
            >
              <CaseSensitive size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm opacity-60">
          <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-100">
            <input type="checkbox" checked={matchCase} onChange={() => setMatchCase(!matchCase)} className="rounded-sm w-4 h-4" />
            <span>대소문자 구분</span>
          </label>
        </div>
      </div>

      {/* 검색 결과 현황 */}
      <div className={`px-3 py-2 text-sm opacity-60 font-bold ${isDarkMode ? 'bg-zinc-900/50' : 'bg-zinc-50'}`}>
        {searchFolder || (fileList && fileList.length > 0) || (tabs && tabs.length > 0) ? `매칭된 파일: ${results.length}개` : `매칭된 줄: ${results.length > 0 ? results[0].count : 0}개`}
      </div>

      {/* 검색 결과 리스트 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {results.map((result, idx) => (
          <div 
            key={idx} 
            className={`border-b ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}
          >
            <div className={`px-3 py-2.5 flex items-center justify-between ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
              <div className="flex items-center gap-1.5 min-w-0">
                <FileText size={16} className="text-blue-500 shrink-0" />
                <span className="text-sm font-bold opacity-80 truncate" title={result.path}>{result.fileName}</span>
              </div>
              {searchFolder && !result.fileNameMatch && (
                <span className="text-sm px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-500 font-bold shrink-0">
                  {result.count}
                </span>
              )}
              {result.fileNameMatch && (
                <span className="text-sm px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold shrink-0">
                  파일명
                </span>
              )}
            </div>
            
            <div className="px-3 py-2 space-y-2">
              {result.fileNameMatch ? (
                <div className="text-sm text-blue-500 dark:text-blue-400 font-semibold italic flex items-center gap-1">
                  <span>📄</span> 파일명 일치
                </div>
              ) : (
                result.snippets.map((snippet, i) => {
                  const lineNum = result.lineNumbers[i];
                  return (
                    <div 
                      key={i} 
                      onDoubleClick={() => lineNum && onFileOpenAndJump(result.path, lineNum)}
                      className="text-sm opacity-80 font-mono leading-relaxed hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer py-1 border-b border-black/5 dark:border-white/5 last:border-0 truncate"
                      title="더블클릭 시 해당 파일의 줄로 이동합니다"
                    >
                      {snippet.split(new RegExp(`(${searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi')).map((part, pi) => (
                        <React.Fragment key={pi}>
                          {part.toLowerCase() === searchTerm.toLowerCase() && searchTerm !== "" ? (
                            <span className="bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold rounded px-0.5">
                              {part}
                            </span>
                          ) : (
                            part
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
        {searchTerm && results.length === 0 && !isLoading && (
          <div className="text-sm opacity-40 text-center py-10">검색 결과가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
