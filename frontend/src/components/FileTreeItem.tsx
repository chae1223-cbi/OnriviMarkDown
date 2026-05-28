"use client";

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, FolderPlus, Edit2, Trash2 } from 'lucide-react';
import { FileNode, getFileIcon } from '@/lib/helper';
import { getApiUrl } from '@/lib/api';
import { vfsCreateFile, vfsCreateFolder, vfsRename, vfsDelete } from '@/lib/vfsHelper';
import PromptModal from '@/components/PromptModal';
import { msg } from '@/lib/msg';
import { useToast } from '@/components/ToastProvider';

interface FileTreeItemProps {
  node: FileNode;
  parentHandle: any;
  level: number;
  openFile: (node: FileNode | null) => void;
  currentFileName: string;
  currentFilePath?: string;
  workspaceType: string;
  refreshParent: () => void;
  askConfirm: (config: { title: string, message: string, onConfirm: () => void, isDanger?: boolean }) => void;
  siblings?: FileNode[];
  isMergeMode?: boolean;
  selectedMergeNodes?: FileNode[];
  toggleMergeNodeSelect?: (node: FileNode) => void;
  onLazyLoad?: (node: FileNode) => Promise<FileNode[]>;
}

const FileTreeItem = ({ 
  node: rawNode, parentHandle, level, openFile, currentFileName, currentFilePath, workspaceType, refreshParent, askConfirm, siblings,
  isMergeMode = false, selectedMergeNodes = [], toggleMergeNodeSelect, onLazyLoad
}: FileTreeItemProps) => {
  const { showToast } = useToast();

  // 🛡️ 백엔드/VFS 노드 규격(type: 'dir'/'file' -> kind) 자동 호환 안전장치
  const node = React.useMemo(() => {
    const kind = rawNode.kind || ((rawNode as any).type === 'dir' || (rawNode as any).type === 'directory' ? 'directory' : 'file');
    return { ...rawNode, kind };
  }, [rawNode]);
  
  const [isOpen, setIsOpen] = useState(false);
  const [localChildren, setLocalChildren] = useState<FileNode[] | null>(null);

  React.useEffect(() => {
    if (node.children !== undefined) {
      setLocalChildren(node.children);
    }
  }, [node.children]);
  const refreshThisDirectory = async () => {
    if (node.kind !== 'directory' || !onLazyLoad) return;
    setIsLoading(true);
    try {
      const children = await onLazyLoad(node);
      setLocalChildren(children);
    } catch (err) {
      msg.warn('폴더 재갱신 실패', err);
    } finally {
      setIsLoading(false);
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  const [promptConfig, setPromptConfig] = useState<{
    isOpen: boolean;
    title: string;
    defaultValue: string;
    type: 'rename' | 'createFile' | 'createFolder' | null;
    error?: string;
  }>({ isOpen: false, title: "", defaultValue: "", type: null, error: "" });

  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData("sourcePath", node.path || "");
    e.dataTransfer.setData("sourceName", node.name);
    e.dataTransfer.setData("sourceKind", node.kind);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (node.kind === 'directory') {
      e.dataTransfer.dropEffect = "move";
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (node.kind !== 'directory') return;

    const sourcePath = e.dataTransfer.getData("sourcePath");
    const sourceName = e.dataTransfer.getData("sourceName");
    const sourceKind = e.dataTransfer.getData("sourceKind");

    if (sourcePath === node.path) return; // 자기 자신에게 드롭 방지

    try {
      if (workspaceType === 'local') {
        const newPath = node.path ? `${node.path}\\${sourceName}` : sourceName;
        const api = (window as any).electronAPI;
        if (api?.renameFile) {
          await api.renameFile(sourcePath, newPath);
          showToast(`'${sourceName}' 이동 완료`, 'success');
          refreshParent();
          await refreshThisDirectory();
        } else {
          const res = await fetch(getApiUrl('/api/rename'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldPath: sourcePath, newPath })
          });
          if (res.ok) {
            showToast(`'${sourceName}' 이동 완료`, 'success');
            refreshParent();
            await refreshThisDirectory();
          }
        }
      } else if (workspaceType === 'browser') {
        const browserMoveMsg = "브라우저 모드에서는 드래그 이동을 준비 중입니다.";
        showToast(browserMoveMsg, 'info');
      }
    } catch (e) {
      const moveFailedMsg = "이동 실패: ";
      showToast(moveFailedMsg + e, 'error');
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMergeMode && node.kind === 'file' && node.name.toLowerCase().endsWith('.md')) {
      if (toggleMergeNodeSelect) toggleMergeNodeSelect(node);
      return;
    }
    if (node.kind === 'directory') {
      const willOpen = !isOpen;
      if (willOpen && onLazyLoad && (!node.children || node.children.length === 0) && localChildren === null) {
        setIsLoading(true);
        onLazyLoad(node).then((children: FileNode[]) => {
          setLocalChildren(children);
          setIsLoading(false);
          setIsOpen(true);
        }).catch(() => setIsLoading(false));
      } else {
        setIsOpen(willOpen);
      }
    } else if (node.kind === 'file') {
      openFile(node);
    }
  };

  const handleRename = async (e: any) => {
    e.stopPropagation();
    setPromptConfig({
      isOpen: true,
      title: `'${node.name}'의 새 이름을 입력하세요:`,
      defaultValue: node.name,
      type: 'rename'
    });
  };

  const handleCreateFile = async (e: any) => {
    e.stopPropagation();
    setPromptConfig({
      isOpen: true,
      title: `[${node.name}]에 생성할 새 파일의 이름을 입력하세요:`,
      defaultValue: "untitled.md",
      type: 'createFile'
    });
  };

  const handleCreateFolder = async (e: any) => {
    e.stopPropagation();
    setPromptConfig({
      isOpen: true,
      title: `[${node.name}]에 생성할 새 폴더의 이름을 입력하세요:`,
      defaultValue: "",
      type: 'createFolder'
    });
  };

  const onPromptConfirm = async (name: string) => {
    const type = promptConfig.type;
    setPromptConfig({ ...promptConfig, isOpen: false });
    if (!name) return;

    if (type === 'rename') {
      if (name === node.name) return;
      const finalName = node.kind === 'file' && !name.toLowerCase().endsWith('.md') ? `${name}.md` : name;
      
      // 중복 체크
      if (siblings?.some(s => s.name.toLowerCase() === finalName.toLowerCase() && s.path !== node.path)) {
        setPromptConfig(prev => ({ ...prev, error: "이미 같은 이름의 항목이 존재합니다." }));
        return;
      }

      try {
        setPromptConfig(prev => ({ ...prev, isOpen: false, error: '' }));
        if (workspaceType === 'browser') {
          if (node.handle) {
            const file = await node.handle.getFile();
            const text = await file.text();
            const newHandle = await parentHandle.getFileHandle(finalName, { create: true });
            const writable = await newHandle.createWritable();
            await writable.write(text);
            await writable.close();
            await parentHandle.removeEntry(node.name);
            refreshParent();
            if (currentFileName === node.name) openFile({ name: finalName, kind: 'file', handle: newHandle });
          } else if (node.path) {
            // LocalStorage 가상 파일/폴더 이름 변경
            const oldPath = node.path;
            const normalizedPath = oldPath.replace(/\\/g, '/');
            const lastSlashIndex = normalizedPath.lastIndexOf('/');
            const parentPath = lastSlashIndex !== -1 ? normalizedPath.substring(0, lastSlashIndex) : "";
            const newPath = parentPath ? `${parentPath}/${finalName}` : finalName;
            
            vfsRename(oldPath, newPath);
            refreshParent();
            if (currentFileName === node.name) {
              openFile({ name: finalName, kind: node.kind, path: newPath });
            }
          }
        } else {
          const api = (window as any).electronAPI;
          const normalizedPath = node.path ? node.path.replace(/\\/g, '/') : "";
          const lastSlashIndex = normalizedPath.lastIndexOf('/');
          const parentPath = lastSlashIndex !== -1 ? normalizedPath.substring(0, lastSlashIndex) : "";
          const finalParentPath = parentPath.replace(/\//g, '\\');
          // 🛡️ 한글 자소 분리 깨짐 방지를 위한 NFC 경로 표준화
          const newPath = (finalParentPath ? `${finalParentPath}\\${finalName}` : finalName).normalize('NFC');

          if (api?.renameFile) {
            await api.renameFile(node.path, newPath);
            refreshParent();
            setTimeout(() => refreshParent(), 500); // 🛡️ OS 파일 락 타임아웃 감안 300ms → 500ms 상향
            if (currentFileName === node.name) openFile({ name: finalName, kind: 'file', path: newPath });
          } else {
            const res = await fetch(getApiUrl('/api/rename'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ oldPath: node.path, newPath })
            });
            if (res.ok) {
              refreshParent();
              setTimeout(() => refreshParent(), 500); // 🛡️ OS 파일 락 타임아웃 감안 300ms → 500ms 상향
              if (currentFileName === node.name) openFile({ name: finalName, kind: 'file', path: newPath });
            }
          }
        }
      } catch(e) { showToast("이름 변경 실패: " + e, 'error'); }
    } else if (type === 'createFile') {
      const finalName = name.toLowerCase().endsWith('.md') ? name : `${name}.md`;
      
      // 중복 체크
      if (node.children?.some(c => c.name.toLowerCase() === finalName.toLowerCase())) {
        setPromptConfig(prev => ({ ...prev, error: "이미 같은 이름의 파일이 존재합니다." }));
        return;
      }

      try {
        setPromptConfig(prev => ({ ...prev, isOpen: false, error: '' }));
        if (workspaceType === 'browser') {
          if (node.handle) {
            const handle = await node.handle.getFileHandle(finalName, { create: true });
            refreshParent();
            openFile({ name: finalName, kind: 'file', handle });
          } else if (node.path) {
            // LocalStorage 가상 파일 생성
            vfsCreateFile(node.path, finalName);
            refreshParent();
            const filePath = `${node.path}/${finalName}`;
            openFile({ name: finalName, kind: 'file', path: filePath });
          }
        } else {
          const api = (window as any).electronAPI;
          if (api?.createFile) {
            const result = await api.createFile(node.path, finalName);
            if (result.success) {
              await refreshThisDirectory();
              openFile({ name: finalName, kind: 'file', path: result.path });
            }
          } else {
            const res = await fetch(getApiUrl('/api/create-file'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ parentPath: node.path, name: finalName })
            });
            if (res.ok) {
              const data = await res.json();
              await refreshThisDirectory();
              openFile({ name: finalName, kind: 'file', path: data.path });
            }
          }
        }
      } catch(e) { showToast("생성 실패: " + e, 'error'); }
    } else if (type === 'createFolder') {
      // 중복 체크
      if (node.children?.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        setPromptConfig(prev => ({ ...prev, error: "이미 같은 이름의 폴더가 존재합니다." }));
        return;
      }

      try {
        setPromptConfig(prev => ({ ...prev, isOpen: false, error: '' }));
        if (workspaceType === 'browser') {
          if (node.handle) {
            await node.handle.getDirectoryHandle(name, { create: true });
          } else if (node.path) {
            // LocalStorage 가상 폴더 생성
            vfsCreateFolder(node.path, name);
          }
        } else {
          const api = (window as any).electronAPI;
          if (api?.createFolder) {
            await api.createFolder(node.path, name);
          } else {
            await fetch(getApiUrl('/api/create-folder'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ parentPath: node.path, name: name })
            });
          }
        }
        await refreshThisDirectory();
      } catch(e) { showToast("생성 실패: " + e, 'error'); }
    }
  };

  const handleDelete = async (e: any) => {
    e.stopPropagation();
    
    askConfirm({
      title: "파일 삭제",
      message: `'${node.name}'을(를) 정말 삭제하시겠습니까?`,
      isDanger: true,
      onConfirm: async () => {
        try {
          if (workspaceType === 'browser') {
            if (node.handle) {
              await parentHandle.removeEntry(node.name, { recursive: true });
              refreshParent();
              setTimeout(() => refreshParent(), 300); // 🛡️ 지연 인덱싱 동기화 갱신
            } else if (node.path) {
              // LocalStorage 가상 파일/폴더 삭제
              vfsDelete(node.path);
              refreshParent();
            }
          } else {
            const api = (window as any).electronAPI;
            if (api?.deleteFile) {
              await api.deleteFile(node.path);
            } else {
              const res = await fetch(getApiUrl('/api/delete'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: node.path })
              });
              if (!res.ok) return;
            }
            refreshParent();
            setTimeout(() => refreshParent(), 300);
          }
          if (currentFileName === node.name) {
            openFile(null); 
          }
        } catch(e) { 
          const deleteFailedMsg = "삭제 실패: ";
          showToast(deleteFailedMsg + e, 'error'); 
        }
      }
    });
  };

  const isSelected = node.kind === 'file' && (
    currentFilePath ? node.path === currentFilePath : node.name === currentFileName
  );

  const isMergeSelected = node.kind === 'file' && selectedMergeNodes.some(n => n.path ? n.path === node.path : n.name === node.name);
  const isMarkdown = node.kind === 'file' && node.name.toLowerCase().endsWith('.md');

  return (
    <div className="select-none">
      <PromptModal 
        isOpen={promptConfig.isOpen}
        title={promptConfig.title}
        defaultValue={promptConfig.defaultValue}
        error={promptConfig.error}
        onConfirm={onPromptConfirm}
        onCancel={() => setPromptConfig({ ...promptConfig, isOpen: false, error: '' })}
      />
      <div 
        draggable={!isMergeMode}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative flex items-center w-full py-0.5 pr-2 transition-all cursor-pointer border-l-2 ${
          isSelected 
            ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold' 
            : isDragOver
              ? 'bg-blue-500/20 border-blue-500 scale-[1.02]'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        style={{ paddingLeft: `${(level * 12) + 8}px` }}
        onClick={handleClick}
      >
        <span className="w-4 h-4 flex items-center justify-center mr-0.5 opacity-60">
          {node.kind === 'directory' ? (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : null}
        </span>
        
        {isMergeMode && isMarkdown && (
          <input 
            type="checkbox" 
            checked={isMergeSelected}
            onChange={() => toggleMergeNodeSelect?.(node)}
            className="w-3.5 h-3.5 mr-2 rounded text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-1 cursor-pointer shrink-0"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        
        {getFileIcon(node, isSelected)}
        
        <span className="ml-1.5 truncate text-[13px] text-left flex-1">{node.name}</span>

        {/* Hover Actions */}
        {!isMergeMode && (
          <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {node.kind === 'directory' && (
              <>
                <button onClick={handleCreateFile} className="p-1 hover:bg-blue-500 hover:text-white rounded transition-colors" title={"새 파일"}><Plus size={12} /></button>
                <button onClick={handleCreateFolder} className="p-1 hover:bg-blue-500 hover:text-white rounded transition-colors" title={"새 폴더"}><FolderPlus size={12} /></button>
              </>
            )}
            <button onClick={handleRename} className="p-1 hover:bg-blue-500 hover:text-white rounded transition-colors" title={"이름 변경"}><Edit2 size={12} /></button>
            <button onClick={handleDelete} className="p-1 hover:bg-red-500 hover:text-white rounded transition-colors" title={"삭제"}><Trash2 size={12} /></button>
          </div>
        )}
      </div>

      {node.kind === 'directory' && isOpen && (() => {
        const children = localChildren !== null ? localChildren : node.children;
        if (!children) return null;
        if (isLoading) {
          return <div className="text-[10px] text-zinc-400 pl-6 py-1 italic">불러오는 중...</div>;
        }
        return (
          <div className="mt-px">
            {children.length === 0 && (
              <div className="text-[10px] text-zinc-400 pl-6 py-1 italic">빈 폴더</div>
            )}
            {children.map((child, idx) => (
              <FileTreeItem 
                key={`${child.path || child.name}-${idx}`} 
                node={child} 
                parentHandle={node.handle}
                level={level + 1}
                openFile={openFile}
                currentFileName={currentFileName}
                currentFilePath={currentFilePath}
                workspaceType={workspaceType}
                refreshParent={refreshThisDirectory}
                askConfirm={askConfirm}
                siblings={children}
               
                isMergeMode={isMergeMode}
                selectedMergeNodes={selectedMergeNodes}
                toggleMergeNodeSelect={toggleMergeNodeSelect}
                onLazyLoad={onLazyLoad}
              />
            ))}
          </div>
        );
      })()}
    </div>
  );
};

export default FileTreeItem;
