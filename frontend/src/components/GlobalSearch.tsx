"use client";

import React, { useState, useEffect } from 'react';
import { X, Search, CaseSensitive, FileText } from 'lucide-react';
import { scanDirectory } from '@/lib/helper';

interface SearchResult {
  fileName: string;
  path: string;
  count: number;
  snippets: string[];
  lineNumbers: number[];
  fileNameMatch?: boolean;
}

interface GlobalSearchProps {
  isDarkMode: boolean;
  content: string; // 현재 에디터 내용
  currentFileName: string; // 현재 파일명
  onFileOpenAndJump: (filePath: string, lineNumber: number) => void; // 파일 열기 및 줄 이동 콜백
  workspacePath?: string; // 워크스페이스 루트 경로 (desktop)
  rootFolderHandle?: any; // FileSystemDirectoryHandle (addon/browser)
}

export default function GlobalSearch({ isDarkMode, content, currentFileName, onFileOpenAndJump, workspacePath, rootFolderHandle }: GlobalSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFolder, setSearchFolder] = useState<string | null>(null); // 검색 대상 폴더 경로
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [matchCase, setMatchCase] = useState(false);

  // 폴더 선택 창 실행
  const handleSelectFolder = async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      try {
        const result = await (window as any).electronAPI.selectFolder();
        if (result?.status === 'success' && result.path) {
          setSearchFolder(result.path);
        } else if (result?.status === 'canceled') {
          console.log("폴더 선택이 취소되었습니다.");
        }
      } catch (e) {
        console.error("폴더 선택 오류:", e);
      }
    }
  };

  // 검색 연동
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const effectiveFolder = searchFolder || (workspacePath ? workspacePath : null);
        if (effectiveFolder && typeof window !== 'undefined' && (window as any).electronAPI) {
          // 워크스페이스/지정 폴더 재귀적 다중 파일 검색 (Electron 메인에 위임)
          const data = await (window as any).electronAPI.searchInFolder({
            folderPath: effectiveFolder,
            searchTerm,
            matchCase,
            useRegex: false
          });
          setResults(data || []);
        } else if (rootFolderHandle) {
          // === Addon/Browser: File System Access API로 워크스페이스 전체 검색 ===
          const escaped = searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regex = new RegExp(escaped, matchCase ? 'g' : 'gi');
          const results: SearchResult[] = [];
          const entries = await scanDirectory(rootFolderHandle);
          const mdFiles = entries.filter(e => e.kind === 'file' && e.name.toLowerCase().endsWith('.md'));
          for (const file of mdFiles) {
            try {
              const fileObj = await file.handle.getFile();
              const text = await fileObj.text();
              const lines = text.split('\n');
              const snippets: string[] = [];
              const lineNumbers: number[] = [];
              let fileNameMatched = false;
              regex.lastIndex = 0;
              if (regex.test(file.name)) {
                fileNameMatched = true;
              }
              const fileNameWithoutExt = file.name.replace(/\.md$/i, '');
              regex.lastIndex = 0;
              if (regex.test(fileNameWithoutExt)) {
                fileNameMatched = true;
              }
              lines.forEach((line: string, index: number) => {
                regex.lastIndex = 0;
                if (regex.test(line)) {
                  snippets.push(`Line ${index + 1}: ${line.trim()}`);
                  lineNumbers.push(index + 1);
                }
              });
              if (snippets.length > 0) {
                results.push({ fileName: file.name, path: file.name, count: snippets.length, snippets, lineNumbers });
              } else if (fileNameMatched) {
                results.push({ fileName: file.name, path: file.name, count: 0, snippets: [], lineNumbers: [], fileNameMatch: true });
              }
            } catch (e) {
              console.error('파일 검색 오류:', file.name, e);
            }
          }
          setResults(results);
        } else {
          // 단일 문서 내부 검색
          const lines = content.split('\n');
          const snippets: string[] = [];
          const lineNumbers: number[] = [];
          const escaped = searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regex = new RegExp(escaped, matchCase ? 'g' : 'gi');

          lines.forEach((line, index) => {
            regex.lastIndex = 0;
            if (regex.test(line)) {
              snippets.push(`Line ${index + 1}: ${line.trim()}`);
              lineNumbers.push(index + 1);
            }
          });

          if (snippets.length > 0) {
            setResults([
              {
                fileName: currentFileName,
                path: 'current',
                count: snippets.length,
                snippets: snippets,
                lineNumbers: lineNumbers
              }
            ]);
          } else {
            setResults([]);
          }
        }
      } catch (e) {
        console.error("검색 처리 오류:", e);
      } finally {
        setIsLoading(false);
      }
    }, 150); // 150ms 디바운스 적용

    return () => clearTimeout(timer);
  }, [searchTerm, content, matchCase, currentFileName, searchFolder, workspacePath, rootFolderHandle]);

  return (
    <div className="w-full h-full flex flex-col min-h-0 select-none">
      {/* 검색 설정 패널 */}
      <div className={`p-3 border-b ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
        {/* 검색 대상 폴더 경로 바 */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className={`flex-1 px-2.5 py-1 text-[10px] rounded-lg border truncate ${
            isDarkMode ? 'bg-zinc-900/50 border-white/5 text-gray-400' : 'bg-zinc-50 border-black/5 text-gray-500'
          }`}>
            {searchFolder ? `폴더: ${searchFolder}` : workspacePath ? `워크스페이스: ${workspacePath}` : rootFolderHandle ? "워크스페이스 전체 검색" : "범위: 현재 문서 내부"}
          </div>
          <button 
            onClick={handleSelectFolder}
            className="shrink-0 px-2.5 py-1 bg-blue-500 text-white rounded-lg text-[10px] font-bold hover:bg-blue-600 active:scale-95 transition-all shadow-md shadow-blue-500/20"
          >
            폴더 선택
          </button>
          {searchFolder && (
            <button 
              onClick={() => setSearchFolder(null)}
              className={`shrink-0 p-1 rounded-lg border hover:bg-red-500 hover:text-white transition-colors ${
                isDarkMode ? 'border-white/10 text-gray-400' : 'border-black/5 text-gray-500'
              }`}
              title="검색 범위 초기화 (워크스페이스 검색)"
            >
              <X size={10} />
            </button>
          )}
        </div>

        <div className="relative mb-2">
          <input 
            type="text" 
            placeholder={searchFolder ? "폴더 내 모든 md 파일 검색..." : workspacePath || rootFolderHandle ? "워크스페이스 전체 검색..." : "현재 문서 내용 검색..."} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className={`w-full pl-8 pr-12 py-1.5 text-xs rounded-lg border outline-none transition-all ${
              isDarkMode 
                ? 'bg-zinc-900 border-white/10 focus:ring-1 focus:ring-blue-500' 
                : 'bg-zinc-100 border-black/5 focus:ring-2 focus:ring-blue-500/20'
            }`}
          />
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-30" />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-40">
            <button 
              onClick={() => setMatchCase(!matchCase)}
              className={`hover:text-blue-500 transition-colors ${matchCase ? 'text-blue-500 opacity-100' : ''}`}
              title="대소문자 구분"
            >
              <CaseSensitive size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] opacity-60">
          <label className="flex items-center gap-1 cursor-pointer hover:opacity-100">
            <input type="checkbox" checked={matchCase} onChange={() => setMatchCase(!matchCase)} className="rounded-sm w-2.5 h-2.5" />
            <span>대소문자 구분</span>
          </label>
        </div>
      </div>

      {/* 검색 결과 현황 */}
      <div className={`px-3 py-1.5 text-[10px] opacity-50 ${isDarkMode ? 'bg-zinc-900/50' : 'bg-zinc-50'}`}>
        {searchFolder || workspacePath || rootFolderHandle ? `매칭된 파일: ${results.length}개` : `매칭된 줄: ${results.length > 0 ? results[0].count : 0}개`}
      </div>

      {/* 검색 결과 리스트 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {results.map((result, idx) => (
          <div 
            key={idx} 
            className={`border-b ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}
          >
            <div className={`px-3 py-1.5 flex items-center justify-between ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
              <div className="flex items-center gap-1.5 min-w-0">
                <FileText size={12} className="text-blue-500 shrink-0" />
                <span className="text-[11px] font-bold opacity-80 truncate" title={result.path}>{result.fileName}</span>
              </div>
              {searchFolder && !result.fileNameMatch && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-500 font-bold shrink-0">
                  {result.count}
                </span>
              )}
              {result.fileNameMatch && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold shrink-0">
                  파일명
                </span>
              )}
            </div>
            
            <div className="px-3 py-2 space-y-1">
              {result.fileNameMatch ? (
                <div className="text-[11px] text-blue-500 dark:text-blue-400 font-semibold italic flex items-center gap-1">
                  <span>📄</span> 파일명 일치
                </div>
              ) : (
                result.snippets.map((snippet, i) => {
                  const lineNum = result.lineNumbers[i];
                  return (
                    <div 
                      key={i} 
                      onDoubleClick={() => lineNum && onFileOpenAndJump(result.path, lineNum)}
                      className="text-[11px] opacity-70 font-mono leading-relaxed hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer py-0.5 border-b border-black/5 dark:border-white/5 last:border-0 truncate"
                      title="더블클릭 시 해당 파일의 줄로 이동합니다"
                    >
                      {snippet.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, pi) => (
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
          <div className="text-[11px] opacity-40 text-center py-10">검색 결과가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
