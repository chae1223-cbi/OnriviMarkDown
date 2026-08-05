"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, FileText, Database, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { loadSecureData } from '@/lib/secureStorage';
import { vfsWriteFile } from '@/lib/virtualFileSystem';

interface ReferenceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  resourceFolderHandle?: any;
  workspaceType?: string;
  rootFolder?: any;
  resourceFolder?: string | null;
}

interface BibFile {
  name: string;
  path?: string;
  handle?: any;
  content: string;
}

// ====================================================================
// 📊 [OMD-EDIT-ReferenceManagerModal-0001] ReferenceManagerModal
// 🎯 @KICK  : 외부 참조 파일(BibTeX, CSL-JSON 등) 추가 및 리소스 폴더 저장 모달 (CRUD 지원)
// 🛡️ @GUARD : isOpen/mounted false 시 null 반환, resourceFolder 부재 시 가드
// 🚨 @PATCH : **2026-08-05** — 2-Pane 레이아웃 개편: 기존 리소스 폴더 내 .bib 파일 목록 조회, 수정, 삭제 기능 추가
// 🔗 @CALLS : showToast, saveFile, window.dispatchEvent, electronAPI.deleteFile
// ====================================================================
export default function ReferenceManagerModal({
  isOpen,
  onClose,
  isDarkMode,
  resourceFolderHandle,
  workspaceType,
  rootFolder,
  resourceFolder,
}: ReferenceManagerModalProps) {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);

  const [bibFiles, setBibFiles] = useState<BibFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<BibFile | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form states
  const [fileName, setFileName] = useState("references.bib");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadBibFiles = useCallback(async () => {
    try {
      const api = (window as any).electronAPI;
      const freshResourceFolder = loadSecureData<string>('resourceFolder') || resourceFolder;
      const loadedFiles: BibFile[] = [];

      if (api && freshResourceFolder) {
        // Desktop
        try {
          try {
            await api.createFolder(freshResourceFolder, 'bible');
          } catch(e) {} // ignore if already exists
          const bibleDir = `${freshResourceFolder}\\bible`;
          const entries = await api.listDirectory(bibleDir);
          for (const entry of entries) {
            if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.bib') && entry.path) {
              const fileObj = await api.readFromPath(entry.path);
              loadedFiles.push({
                name: entry.name,
                path: entry.path,
                content: fileObj?.content || ''
              });
            }
          }
        } catch (e) {
          console.error("Desktop bible load error", e);
        }
      } else if (resourceFolderHandle) {
        // Browser Resource Folder
        try {
          const bibleHandle = await resourceFolderHandle.getDirectoryHandle('bible', { create: true });
          for await (const [name, handle] of bibleHandle.entries()) {
            if (handle.kind === 'file' && name.toLowerCase().endsWith('.bib')) {
              const file = await handle.getFile();
              const text = await file.text();
              loadedFiles.push({
                name,
                handle,
                content: text
              });
            }
          }
        } catch (e) {
          console.error("Browser resource folder bible load error", e);
        }
      } else if (rootFolder?.handle) {
        // Fallback Browser Root
        try {
          const bibleHandle = await rootFolder.handle.getDirectoryHandle('bible', { create: true });
          for await (const [name, handle] of bibleHandle.entries()) {
            if (handle.kind === 'file' && name.toLowerCase().endsWith('.bib')) {
              const file = await handle.getFile();
              const text = await file.text();
              loadedFiles.push({
                name,
                handle,
                content: text
              });
            }
          }
        } catch (e) {
          console.error("Browser root folder bible load error", e);
        }
      }
      setBibFiles(loadedFiles);
    } catch (e) {
      console.error("[loadBibFiles] Error loading bib files:", e);
    }
  }, [resourceFolderHandle, rootFolder, resourceFolder]);

  const handleCreateNew = useCallback(() => {
    setSelectedFile(null);
    setIsCreatingNew(true);
    setFileName("references.bib");
    setContent("");
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadBibFiles().then(() => {
        handleCreateNew();
      });
    }
  }, [isOpen, loadBibFiles, handleCreateNew]);

  const handleSelectFile = (file: BibFile) => {
    setSelectedFile(file);
    setIsCreatingNew(false);
    setFileName(file.name);
    setContent(file.content);
  };

  const handleDelete = async (file: BibFile) => {
    if (!confirm(`'${file.name}' 파일을 삭제하시겠습니까?`)) return;
    setIsDeleting(true);
    try {
      const api = (window as any).electronAPI;
      if (api && file.path) {
        await api.deleteFile(file.path);
      } else if (resourceFolderHandle && file.handle) {
        const bibleHandle = await resourceFolderHandle.getDirectoryHandle('bible');
        await bibleHandle.removeEntry(file.name);
      } else if (rootFolder?.handle && file.handle) {
        const bibleHandle = await rootFolder.handle.getDirectoryHandle('bible');
        await bibleHandle.removeEntry(file.name);
      }
      showToast(`'${file.name}' 삭제 완료`, "success");
      
      if (selectedFile?.name === file.name) {
        handleCreateNew();
      }
      await loadBibFiles();
      window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
    } catch (e: any) {
      showToast(`삭제 중 오류 발생: ${e.message}`, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!fileName.trim()) {
      showToast("파일명을 입력해주세요.", "warning");
      return;
    }
    if (!content.trim()) {
      showToast("참조 데이터(BibTeX 등)를 입력해주세요.", "warning");
      return;
    }

    // 파일 확장자 검사 (기본 .bib)
    let finalFileName = fileName.trim();
    if (!finalFileName.includes('.')) {
      finalFileName += '.bib';
    }

    setIsSaving(true);
    try {
      const api = (window as any).electronAPI;
      const freshResourceFolder = loadSecureData<string>('resourceFolder') || resourceFolder;

      let saved = false;

      if (api) {
        // 🖥️ 데스크탑: 무조건 로컬(resourceFolder) 저장
        if (!freshResourceFolder) {
          showToast("먼저 리소스 폴더를 설정해주세요.", "warning");
          setIsSaving(false);
          return;
        }
        
        try {
          await api.createFolder(freshResourceFolder, 'bible');
        } catch(e) {}

        const targetPath = `${freshResourceFolder}\\bible\\${finalFileName}`;
        const success = await api.saveFile(targetPath, content);
        if (success) {
          saved = true;
        }
      } else {
        // 웹 브라우저 환경
        if (workspaceType === 'browser' || workspaceType === 'local') {
          if (resourceFolderHandle) {
            // FileSystem Access API
            const bibleHandle = await resourceFolderHandle.getDirectoryHandle('bible', { create: true });
            const fileHandle = await bibleHandle.getFileHandle(finalFileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(content);
            await writable.close();
            saved = true;
          } else if (rootFolder?.handle) {
            // 폴백: 루트 폴더에 저장
            const bibleHandle = await rootFolder.handle.getDirectoryHandle('bible', { create: true });
            const fileHandle = await bibleHandle.getFileHandle(finalFileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(content);
            await writable.close();
            saved = true;
            showToast("리소스 폴더가 없어 워크스페이스 루트의 bible 폴더에 저장되었습니다.", "info");
          } else {
            // VFS 폴백
            vfsWriteFile(`/bible/${finalFileName}`, content);
            saved = true;
          }
        } else {
          // VFS 저장
          vfsWriteFile(`/bible/${finalFileName}`, content);
          saved = true;
        }
      }

      if (saved) {
        showToast(`'${finalFileName}' 저장 완료`, "success");
        // 파일 트리 리프레시 및 리스트 리로드
        window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
        await loadBibFiles();
        
        // Find and select the newly saved/updated file
        const apiForPath = (window as any).electronAPI;
        const freshResFolderForPath = loadSecureData<string>('resourceFolder') || resourceFolder;
        setIsCreatingNew(false);
        setFileName(finalFileName);
        
        // update selectedFile visually manually to prevent race
        setSelectedFile({
          name: finalFileName,
          content: content,
          path: apiForPath ? `${freshResFolderForPath}\\bible\\${finalFileName}` : undefined
        });

      } else {
        showToast("파일 저장에 실패했습니다.", "error");
      }
    } catch (e: any) {
      showToast(`저장 중 오류 발생: ${e.message}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${isDarkMode ? 'dark' : ''}`}>
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div 
        className="relative flex w-[90%] max-w-5xl h-[80vh] bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
      >
        {/* Left Pane (File List) */}
        <div className="w-1/3 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50 dark:bg-[#1a1a1a]">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
              <Database className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold">참조 파일 관리</h2>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            <button
              onClick={handleCreateNew}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors w-full text-left ${
                isCreatingNew 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-300 dark:border-blue-700' 
                : 'bg-white dark:bg-[#252525] text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">새 파일 만들기</span>
            </button>

            <div className="my-2 border-t border-zinc-200 dark:border-zinc-800" />
            
            {bibFiles.map((file, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectFile(file)}
                className={`group flex items-center justify-between px-3 py-2 rounded-md transition-colors cursor-pointer border ${
                  selectedFile?.name === file.name && !isCreatingNew
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300 dark:border-blue-700' 
                  : 'bg-white dark:bg-[#252525] text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 opacity-70 flex-shrink-0" />
                  <span className="truncate text-sm">{file.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file);
                  }}
                  disabled={isDeleting}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {bibFiles.length === 0 && (
              <p className="text-sm text-center text-zinc-500 dark:text-zinc-400 mt-4">
                저장된 참조 파일이 없습니다.
              </p>
            )}
          </div>
        </div>

        {/* Right Pane (Editor) */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#1e1e1e]">
          <div className="flex items-center justify-end px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <button 
              onClick={onClose}
              className="p-1 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col flex-1 p-6 gap-6 overflow-y-auto">
            {/* Filename Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                파일명 지정
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="예: references.bib"
                disabled={!isCreatingNew}
                className={`w-full px-3 py-2 border rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/50 ${
                  !isCreatingNew 
                  ? 'bg-zinc-100 dark:bg-[#151515] border-zinc-200 dark:border-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-white dark:bg-[#252525] border-zinc-300 dark:border-zinc-700 placeholder:text-zinc-400 dark:placeholder:text-zinc-600'
                }`}
              />
              {isCreatingNew && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  확장자를 생략하면 자동으로 <code>.bib</code>가 붙습니다.
                </p>
              )}
            </div>

            {/* Reference Data Input */}
            <div className="flex flex-col gap-2 flex-1 min-h-[250px]">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                참조 데이터 내용 (BibTeX)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="@article{key,\n  title={Example Title},\n  author={Doe, John},\n  year={2026}\n}"
                className="w-full flex-1 px-3 py-2 bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-300 dark:border-zinc-700 rounded-md text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/50 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1a1a1a] gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
            >
              닫기
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
              ) : (
                <Save size={16} />
              )}
              {isCreatingNew ? '리소스 폴더에 저장' : '수정 사항 저장'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
