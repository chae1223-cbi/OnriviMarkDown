import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, FileText } from 'lucide-react';

interface CitationSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  bibContent?: string;
  onSelect: (citekey: string) => void;
  resourceFolderHandle?: any;
  workspaceType?: string;
  rootFolder?: any;
  resourceFolder?: string | null;
}

interface BibEntry {
  key: string;
  type: string;
  title: string;
  author: string;
  year: string;
}

// 간단한 정규식 기반 BibTeX 파서
function parseBibContent(content: string): BibEntry[] {
  if (!content) return [];
  const entries: BibEntry[] = [];
  
  // @type{citekey,
  //   title = {Title},
  // ...}
  const entryRegex = /@([a-zA-Z0-9_-]+)\s*{\s*([^,]+)/g;
  
  let match;
  while ((match = entryRegex.exec(content)) !== null) {
    const type = match[1];
    const key = match[2].trim();
    
    // 이 엔트리의 끝부분을 대략적으로 찾기 (다음 @ 전까지 혹은 끝까지)
    const startIndex = match.index + match[0].length;
    const nextMatchIndex = content.indexOf('@', startIndex);
    const blockText = nextMatchIndex !== -1 
      ? content.substring(startIndex, nextMatchIndex)
      : content.substring(startIndex);
      
    // 필드 추출 (title, author, year 등)
    const getField = (fieldName: string) => {
      const regex = new RegExp(`${fieldName}\\s*=\\s*(?:{([^}]*)}|"([^"]*)"|([^,\\s}]+))`, 'i');
      const fieldMatch = blockText.match(regex);
      return fieldMatch ? (fieldMatch[1] || fieldMatch[2] || fieldMatch[3] || '').trim() : '';
    };

    entries.push({
      key,
      type,
      title: getField('title'),
      author: getField('author'),
      year: getField('year'),
    });
  }
  return entries;
}

import { loadSecureData } from '@/lib/secureStorage';

export default function CitationSelectionModal({
  isOpen,
  onClose,
  isDarkMode,
  bibContent,
  onSelect,
  resourceFolderHandle,
  workspaceType,
  rootFolder,
  resourceFolder
}: CitationSelectionModalProps) {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [localBibContent, setLocalBibContent] = useState('');

  const loadBibFiles = useCallback(async () => {
    try {
      const api = (window as any).electronAPI;
      const freshResourceFolder = loadSecureData<string>('resourceFolder') || resourceFolder;
      let mergedContent = '';

      if (api && freshResourceFolder) {
        // Desktop
        try {
          const bibleDir = `${freshResourceFolder}\\bible`;
          const entries = await api.listDirectory(bibleDir);
          for (const entry of entries) {
            if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.bib') && entry.path) {
              const fileObj = await api.readFromPath(entry.path);
              if (fileObj?.content) mergedContent += '\n' + fileObj.content;
            }
          }
        } catch (e) {
          console.error("Desktop bible load error", e);
        }
      } else if (resourceFolderHandle) {
        // Browser Resource Folder
        try {
          const bibleHandle = await resourceFolderHandle.getDirectoryHandle('bible');
          for await (const [name, handle] of bibleHandle.entries()) {
            if (handle.kind === 'file' && name.toLowerCase().endsWith('.bib')) {
              const file = await handle.getFile();
              const text = await file.text();
              mergedContent += '\n' + text;
            }
          }
        } catch (e) {
          console.error("Browser resource folder bible load error", e);
        }
      } else if (rootFolder?.handle) {
        // Browser Root Folder
        try {
          const bibleHandle = await rootFolder.handle.getDirectoryHandle('bible');
          for await (const [name, handle] of bibleHandle.entries()) {
            if (handle.kind === 'file' && name.toLowerCase().endsWith('.bib')) {
              const file = await handle.getFile();
              const text = await file.text();
              mergedContent += '\n' + text;
            }
          }
        } catch (e) {
          console.error("Browser root folder bible load error", e);
        }
      } else {
        // Web VFS fallback or bibContent prop
        mergedContent = bibContent || '';
      }
      setLocalBibContent(mergedContent);
    } catch (e) {
      console.error("Error loading bib files", e);
    }
  }, [resourceFolderHandle, rootFolder, resourceFolder, bibContent]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadBibFiles();
    }
  }, [isOpen, loadBibFiles]);

  const entries = useMemo(() => parseBibContent(localBibContent), [localBibContent]);

  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) return entries;
    const lower = searchTerm.toLowerCase();
    return entries.filter(e => 
      e.key.toLowerCase().includes(lower) || 
      e.title.toLowerCase().includes(lower) || 
      e.author.toLowerCase().includes(lower)
    );
  }, [entries, searchTerm]);

  // 키보드 네비게이션용
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-100 font-semibold">
            <FileText size={18} className="text-zinc-500" />
            참조자 선택 (Citation)
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 flex-1 flex flex-col min-h-0">
          {/* 검색 바 */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="참조문헌 검색 (키워드, 저자, 제목)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              autoFocus
            />
          </div>

          {/* 목록 */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[300px]">
            {filteredEntries.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-10">
                <FileText size={48} className="mb-4 opacity-20" />
                <p>표시할 참조문헌이 없습니다.</p>
                <p className="text-sm mt-1">vibe 파일(.bib)을 추가하거나 검색어를 변경해보세요.</p>
              </div>
            ) : (
              filteredEntries.map(entry => (
                <div
                  key={entry.key}
                  onClick={() => {
                    onSelect(entry.key);
                    onClose();
                  }}
                  className="group flex flex-col p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {entry.title || '(제목 없음)'}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                        {entry.author || '저자 미상'} {entry.year ? `(${entry.year})` : ''}
                      </div>
                    </div>
                    <div className="shrink-0 text-xs font-mono px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                      @{entry.key}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
