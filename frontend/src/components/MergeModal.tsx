import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp, ArrowDown, X, Layers, Trash2, ArrowUpDown } from 'lucide-react';
import { FileNode } from '@/lib/indexedDbHelper';
import { getApiUrl } from '@/lib/apiUrlBuilder';
import { useToast } from '@/components/ToastProvider';


interface MergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNodes: FileNode[];
  workspaceType: string;
  rootFolder?: any;

  refreshParent: () => void;
  openFile: (node: FileNode | null) => void;
}

// ====================================================================
// 📊 [OMD-FILE-MergeModal-0007] MergeModal ➔ MergeModal
// 🎯 @KICK  : 여러 파일을 선택 순서대로 병합하여 새 파일로 저장 (로컬/브라우저 모드 대응)
// 🛡️ @GUARD : isOpen/mounted false 시 null 반환; 최소 2개 파일 필요
// 🚨 @PATCH : 없음
// 🔗 @CALLS : handleMerge, moveUp, moveDown, removeItem, showToast
// ====================================================================
const MergeModal: React.FC<MergeModalProps> = ({
  isOpen, onClose, selectedNodes, workspaceType, rootFolder, refreshParent, openFile
}) => {
  const { showToast } = useToast();
  

  const [nodes, setNodes] = useState<FileNode[]>([]);
  const [targetName, setTargetName] = useState('merged.md');
  const [separator, setSeparator] = useState('line'); // 'none' | 'line' | 'divider' | 'title'
  const [deleteSources, setDeleteSources] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

// ====================================================================
// 📊 [OMD-FILE-MergeModal-0006] MergeModal ➔ useEffect (mounted)
// 🎯 @KICK  : 클라이언트 마운트 완료 상태 설정으로 포탈 렌더링 hydration 방지
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
// 🔗 @CALLS : setMounted
// ====================================================================
  useEffect(() => {
    setMounted(true);
  }, []);

// ====================================================================
// 📊 [OMD-FILE-MergeModal-0005] MergeModal ➔ useEffect (isOpen)
// 🎯 @KICK  : 모달이 열릴 때 선택된 노드 목록을 복사하고 기본 병합 파일명 제안
// 🛡️ @GUARD : isOpen이 true일 때만 실행
// 🚨 @PATCH : 없음
// 🔗 @CALLS : setNodes, setTargetName
// ====================================================================
  useEffect(() => {
    if (isOpen) {
      setNodes([...selectedNodes]);
      // 기본 병합 파일명 제안 (첫번째 파일명 뒤에 _merged 추가)
      if (selectedNodes.length > 0) {
        const first = selectedNodes[0].name;
        const extIndex = first.lastIndexOf('.');
        const baseName = extIndex !== -1 ? first.substring(0, extIndex) : first;
        setTargetName(`${baseName}_merged.md`);
      }
    }
  }, [isOpen, selectedNodes]);

  if (!isOpen) return null;
  if (!mounted) return null;

// ====================================================================
// 📊 [OMD-FILE-MergeModal-0004] MergeModal ➔ moveUp
// 🎯 @KICK  : 병합 목록에서 파일을 한 칸 위로 이동
// 🛡️ @GUARD : 첫 번째 인덱스면 실행 차단
// 🚨 @PATCH : 없음
// 🔗 @CALLS : setNodes
// ====================================================================
  const moveUp = (index: number) => {
    if (index === 0) return;
    const nextNodes = [...nodes];
    const temp = nextNodes[index - 1];
    nextNodes[index - 1] = nextNodes[index];
    nextNodes[index] = temp;
    setNodes(nextNodes);
  };

// ====================================================================
// 📊 [OMD-FILE-MergeModal-0003] MergeModal ➔ moveDown
// 🎯 @KICK  : 병합 목록에서 파일을 한 칸 아래로 이동
// 🛡️ @GUARD : 마지막 인덱스면 실행 차단
// 🚨 @PATCH : 없음
// 🔗 @CALLS : setNodes
// ====================================================================
  const moveDown = (index: number) => {
    if (index === nodes.length - 1) return;
    const nextNodes = [...nodes];
    const temp = nextNodes[index + 1];
    nextNodes[index + 1] = nextNodes[index];
    nextNodes[index] = temp;
    setNodes(nextNodes);
  };

// ====================================================================
// 📊 [OMD-FILE-MergeModal-0002] MergeModal ➔ removeItem
// 🎯 @KICK  : 병합 목록에서 특정 파일을 제거
// 🛡️ @GUARD : 남은 파일이 2개 미만이면 경고 후 제거 차단
// 🚨 @PATCH : 없음
// 🔗 @CALLS : showToast
// ====================================================================
  const removeItem = (index: number) => {
    if (nodes.length <= 2) {
      showToast("병합하려면 최소 2개 이상의 파일을 선택해야 합니다.", 'warning');
      return;
    }
    const nextNodes = [...nodes];
    nextNodes.splice(index, 1);
    setNodes(nextNodes);
  };

// ====================================================================
// 📊 [OMD-FILE-MergeModal-0001] MergeModal ➔ handleMerge
// 🎯 @KICK  : 선택한 파일들을 병합하여 새 파일로 저장 (로컬/브라우저 모드 대응)
// 🛡️ @GUARD : targetName이 비어있으면 경고 후 early return
// 🚨 @PATCH : 없음
// 🔗 @CALLS : showToast, fetch, refreshParent, onClose, openFile
// ====================================================================
  const handleMerge = async () => {
    if (!targetName.trim()) {
      showToast('최종 파일명을 입력해주세요.', 'warning');
      return;
    }
    
    const finalName = targetName.toLowerCase().endsWith('.md') ? targetName : `${targetName}.md`;
    setLoading(true);

    try {
      const hasPaths = nodes.some(n => !!n.path);
      const hasHandles = nodes.some(n => !!n.handle);
      
      let activeMode = workspaceType;
      if (hasPaths && !hasHandles) {
        activeMode = 'local';
      } else if (hasHandles && !hasPaths) {
        activeMode = 'browser';
      }

      if (activeMode === 'local') {
        const sourcePaths = nodes.map(n => n.path);
        
        const firstPath = nodes[0].path || "";
        const lastSlash = firstPath.lastIndexOf('\\');
        const parentDir = lastSlash !== -1 ? firstPath.substring(0, lastSlash) : "";
        const targetPath = parentDir ? `${parentDir}\\${finalName}` : finalName;

        const res = await fetch(getApiUrl('/api/merge-files'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourcePaths,
            targetPath,
            deleteSources,
            separator
          })
        });

        if (res.ok) {
          const result = await res.json();
          showToast("문서 병합이 정상적으로 처리되었습니다.", 'success');
          refreshParent();
          setTimeout(() => refreshParent(), 300);
          onClose();
          openFile({ name: finalName, kind: 'file', path: result.path });
        } else {
          const errData = await res.json();
          showToast("글 병합 중 오류가 발생했습니다: " + errData.error, 'error');
        }
      } else if (activeMode === 'browser') {
        const contents = [];
        for (const node of nodes) {
          if (!node.handle) throw new Error('File handle missing in browser mode');
          const file = await node.handle.getFile();
          const text = await file.text();
          
          let formattedContent = text;
          if (separator === 'title') {
            const titleLabel = node.name.replace(/\.[^/.]+$/, "");
            formattedContent = `## ${titleLabel}\n\n${text}`;
          }
          contents.push(formattedContent);
        }

        let joinSep = '\n\n';
        if (separator === 'divider') joinSep = '\n\n---\n\n';
        else if (separator === 'none') joinSep = '\n';
        
        const mergedText = contents.join(joinSep);

        if (!rootFolder || !rootFolder.handle) {
          throw new Error('Root folder handle is not open');
        }
        
        const newFileHandle = await rootFolder.handle.getFileHandle(finalName, { create: true });
        const writable = await newFileHandle.createWritable();
        await writable.write(mergedText);
        await writable.close();

        if (deleteSources) {
          for (const node of nodes) {
            if (node.name !== finalName) {
              await rootFolder.handle.removeEntry(node.name);
            }
          }
        }

        showToast("문서 병합이 정상적으로 처리되었습니다.", 'success');
        refreshParent();
        setTimeout(() => refreshParent(), 300);
        onClose();
        openFile({ name: finalName, kind: 'file', handle: newFileHandle });
      }
    } catch (e: any) {
      showToast("글 병합 중 오류가 발생했습니다: " + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-2xl shadow-2xl overflow-hidden flex flex-col scale-[1.01] transition-transform duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#30363d] bg-gray-50/50 dark:bg-[#0d1117]/30">
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">?</span>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{"글 통폐합 (병합)"}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#21262d] rounded-xl text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-5 overflow-y-auto max-h-[60vh] custom-scrollbar">
          
          {/* Target File Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">{"최종 병합 파일명"}</label>
            <input 
              type="text" 
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="merged.md"
              className="w-full px-4 py-2 text-sm bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/30 transition-all font-medium"
            />
          </div>

          {/* Separator Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">{"구분선 스타일"}</label>
            <select 
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/30 transition-all cursor-pointer font-medium"
            >
              <option value="none">{"구분선 없음"}</option>
              <option value="line">{"개행 (빈 줄 2개)"}</option>
              <option value="divider">{"수평선 (---)"}</option>
              <option value="title">{"H2 제목으로 파일명 삽입"}</option>
            </select>
          </div>

          {/* Source Files Reordering List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <ArrowUpDown size={12} />
                {"병합 순서"} ({nodes.length})
              </label>
            </div>
            
            <div className="border border-gray-100 dark:border-[#30363d] rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-[#30363d] bg-gray-50/20 dark:bg-black/10">
              {nodes.map((node, index) => (
                <div 
                  key={node.path || node.name} 
                  className="flex items-center justify-between px-4 py-2.5 text-xs text-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#161b22]/50 transition-colors"
                >
                  <span className="truncate font-medium flex-1 pr-4">{node.name}</span>
                  
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-[#21262d] rounded-md text-gray-500 hover:text-blue-500 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button 
                      onClick={() => moveDown(index)}
                      disabled={index === nodes.length - 1}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-[#21262d] rounded-md text-gray-500 hover:text-blue-500 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button 
                      onClick={() => removeItem(index)}
                      className="p-1 hover:bg-red-500/10 rounded-md text-gray-400 hover:text-red-500 transition-all ml-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delete Source Option */}
          <div className="flex items-center gap-2 px-1 pt-1">
            <input 
              type="checkbox" 
              id="deleteSourcesCheck"
              checked={deleteSources}
              onChange={(e) => setDeleteSources(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500/30 dark:focus:ring-blue-500/20 focus:ring-2 dark:bg-[#0d1117] dark:border-[#30363d] cursor-pointer"
            />
            <label 
              htmlFor="deleteSourcesCheck" 
              className="text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer select-none"
            >
              {"병합 완료 후 원본 파일 삭제"}
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-[#30363d] bg-gray-50/50 dark:bg-[#0d1117]/30">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#21262d] border border-gray-200 dark:border-[#30363d] rounded-xl transition-all active:scale-[0.98]"
          >
            {"취소"}
          </button>
          <button 
            onClick={handleMerge}
            disabled={loading}
            className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center gap-1.5"
          >
            {loading ? "로딩 중..." : "확인"}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default MergeModal;
