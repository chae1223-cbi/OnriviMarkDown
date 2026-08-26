"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Image as ImageIcon, Upload, Link as LinkIcon, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getApiUrl } from '@/lib/apiUrlBuilder';
import { loadSecureData } from '@/lib/secureStorage';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (path: string, alt: string, range?: any) => void;
  isDarkMode: boolean;
  initialData?: {
    alt: string;
    path: string;
    width: string;
    height: string;
    align: string;
    range: any;
  } | null;
  targetFolder?: string;
  showToast?: (message: string, type: 'success' | 'error') => void;
  resourceFolderHandle?: any;
  workspaceType?: string;
  rootFolder?: any;
  resourceFolder?: string | null;
}

// ====================================================================
// 📊 [OMD-EDIT-ImageModal-0007] ImageModal ➔ ImageModal
// 🎯 @KICK  : 이미지 삽입 모달 - URL/파일/클립보드 이미지 경로 입력 및 크기/정렬 설정
// 🛡️ @GUARD : isOpen/mounted false 시 null 반환; cleanImagePath 없으면 삽입 버튼 비활성화
// 🚨 @PATCH : 2026-08-26 — 데스크탑 및 웹 환경에서 리소스 폴더 이미지를 찾아보기로 선택 시 미리보기가 노출되지 않는 버그 및 자동저장 시 상태가 blob으로 원복되는 문제를 해결하기 위해 useEffect의 의존성 배열에서 initialData를 제거하고, 데스크탑 환경은 readImageAsBase64 API를 활용해 웹 보안 샌드박스를 우회하도록 함; 미리보기 컨테이너 div에 onWheel preventDefault를 연동해 마우스 스크롤 전파를 차단함
// 🚨 @PATCH : 2026-07-20 — 이미지 모달 내 클립보드 붙여넣기 영역(슬림 붙여넣기 바) 클릭 시 윈도우 파일 탐색기가 뜨던 불편함 해소 (onClick 팝업 제거 및 focus 적용으로 순수 붙여넣기 대기 상태 전환)
// 🚨 @PATCH : 2026-07-15 — 2단 분할 레이아웃(좌:입력, 우:미리보기), 슬림 붙여넣기 바, 인코딩 정상화
// 🔗 @CALLS : handleInsert, handlePasteEvent, handleFileChange, cleanImagePath, previewSrc, createPortal
// ====================================================================
export default function ImageModal({
  isOpen,
  onClose,
  onInsert,
  isDarkMode,
  initialData,
  targetFolder,
  showToast,
  resourceFolderHandle,
  workspaceType,
  rootFolder,
  resourceFolder,
}: ImageModalProps) {
  const [imagePath, setImagePath] = useState("");
  const [appliedPath, setAppliedPath] = useState("");
  const [imageAlt, setImageAlt] = useState("이미지 설명");
  const [imageWidth, setImageWidth] = useState("");
  const [imageHeight, setImageHeight] = useState("");
  const [imageAlign, setImageAlign] = useState("center");
  const [localBlobUrl, setLocalBlobUrl] = useState("");
  const [tempPreviewUrl, setTempPreviewUrl] = useState("");
  const [imageLoadError, setImageLoadError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setAppliedPath("");
      setTempPreviewUrl("");
      if (initialData) {
        setImagePath(initialData.path);
        setImageAlt(initialData.alt);
        setImageWidth(initialData.width);
        setImageHeight(initialData.height || "");
        setImageAlign(initialData.align || "center");
      } else {
        setImagePath("");
        setImageAlt("이미지 설명");
        setImageWidth("");
        setImageHeight("");
        setImageAlign("center");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleLocalImageSave = async (base64Data: string, fileName: string, imageFile: File) => {
    let finalPath = '';
    const api = (window as any).electronAPI;
    
    if (api) {
      // 💡 [Desktop] targetFolder prop 대신 secureStorage에서 항상 최신 resourceFolder를 읽어 사용
      const freshResourceFolder = loadSecureData<string>('resourceFolder') || resourceFolder;
      const effectiveTargetFolder = freshResourceFolder
        ? freshResourceFolder + '\\media'
        : (targetFolder || '');
      const saveResult = await api.saveImage(effectiveTargetFolder, base64Data, fileName);
      if (saveResult && saveResult.success) {
        if (saveResult.mediaPath) {
          // main.js가 명시적으로 mediaPath를 반환한 경우 (가장 정확)
          finalPath = saveResult.mediaPath;
        } else if (saveResult.absolutePath) {
          // absolutePath만 있는 경우 media:// 프로토콜로 렌더링
          finalPath = `media://local/serve?url=${encodeURIComponent(saveResult.absolutePath)}`;
        }
      }
    } else if (workspaceType === 'browser' || workspaceType === 'local') {
      try {
        if (resourceFolderHandle) {
          const mediaDir = await resourceFolderHandle.getDirectoryHandle('media', { create: true });
          const fileHandle = await mediaDir.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(imageFile);
          await writable.close();
          finalPath = `/media/${fileName}`;
        } else if (rootFolder?.handle) {
          const assetsDir = 'assets';
          const assetsHandle = await rootFolder.handle.getDirectoryHandle(assetsDir, { create: true });
          const fileHandle = await assetsHandle.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(imageFile);
          await writable.close();
          finalPath = `/${assetsDir}/${fileName}`;
        } else {
          const assetsDir = 'assets';
          const { vfsWriteFile } = await import('@/lib/virtualFileSystem');
          const imgPath = `${assetsDir}/${fileName}`;
          vfsWriteFile(imgPath, base64Data);
          finalPath = `/${imgPath}`;
        }
      } catch (e) {
        console.error('로컬 이미지 저장 실패', e);
      }
    }

    if (finalPath) {
      setImagePath(finalPath);
      setAppliedPath(finalPath);
      if (showToast) showToast('로컬 assets 폴더에 저장되었습니다.', 'success');
    } else {
      const blobPreview = URL.createObjectURL(imageFile);
      setTempPreviewUrl(blobPreview);
      setImagePath(blobPreview);
      if (showToast) showToast('이미지 로컬 저장 실패 (임시 렌더링)', 'error');
    }
  };

  const resolveClipboardFile = async (e: React.ClipboardEvent<HTMLDivElement>): Promise<File | null> => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) return file;
        }
      }
    }
    const files = e.clipboardData?.files;
    if (files && files.length > 0 && files[0].type.startsWith('image/')) return files[0];
    try {
      if (navigator.clipboard && typeof navigator.clipboard.read === 'function') {
        const clipboardItems = await navigator.clipboard.read();
        for (const ci of clipboardItems) {
          for (const type of ci.types) {
            if (type.startsWith('image/')) {
              const blob = await ci.getType(type);
              return blob as File;
            }
          }
        }
      }
    } catch {}
    return null;
  };

  const handlePasteEvent = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const imageFile = await resolveClipboardFile(e);
    if (!imageFile) return;
    e.preventDefault();
    e.stopPropagation();

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      if (!base64Data) {
        if (showToast) showToast('이미지 데이터를 읽을 수 없습니다.', 'error');
        return;
      }
      let fileName = `image_${Date.now()}.png`;
      try {
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 12);
        fileName = `img_${hashHex}.png`;
      } catch (e) {
        console.warn('해시 생성 실패, 기본 시간 기반 이름 사용', e);
      }
      await handleLocalImageSave(base64Data, fileName, imageFile!);
    };
    reader.onerror = () => {
      if (showToast) showToast('이미지 파일을 읽는데 실패했습니다.', 'error');
    };
    reader.readAsDataURL(imageFile);
  };

  const cleanImagePath = useMemo(() => {
    let raw = imagePath.trim();
    const srcMatch = raw.match(/src=["']([^"']+)["']/);
    const mdMatch = raw.match(/!\[[^\]]*\]\(([^)]*)\)/);
    let url = raw;
    if (srcMatch) url = srcMatch[1];
    else if (mdMatch) url = mdMatch[1];

    url = url.replace(/^[\("'\s]+|[\)"'\s]+$/g, '');
    url = url.replace(/[?&](?:width|height|w|h)=[^&]*/gi, '');

    if (url.startsWith('media://')) {
      try {
        const parsedUrl = new URL(url);
        const extracted = parsedUrl.searchParams.get('url');
        if (extracted) url = extracted;
      } catch (e) {
        const m = url.match(/[?&]url=([^&]+)/);
        if (m) url = decodeURIComponent(m[1]);
      }
    }

    return url;
  }, [imagePath]);

  useEffect(() => {
    let active = true;
    let createdBlob = '';
    
    setLocalBlobUrl('');
    
    if (!cleanImagePath) return;
    const isExternal = cleanImagePath.startsWith('http://') || cleanImagePath.startsWith('https://') || cleanImagePath.startsWith('data:') || cleanImagePath.startsWith('blob:') || cleanImagePath.startsWith('media://');
    if (isExternal) return;
    
    const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;
    if (api) return;
    
    if (workspaceType !== 'browser' && workspaceType !== 'local') {
      setLocalBlobUrl(`/api/view?filePath=${encodeURIComponent(cleanImagePath)}`);
      return;
    }

    const loadLocal = async () => {
      try {
        if ((cleanImagePath.startsWith('/media/') || cleanImagePath.startsWith('./media/')) && resourceFolderHandle) {
          const fileName = cleanImagePath.replace(/^\.?\/media\//, '');
          const mediaDir = await resourceFolderHandle.getDirectoryHandle('media');
          const fileHandle = await mediaDir.getFileHandle(fileName);
          const file = await fileHandle.getFile();
          createdBlob = URL.createObjectURL(file);
          if (active) setLocalBlobUrl(createdBlob);
          return;
        }

        let pathParts = cleanImagePath.split(/[/\\]/).filter(Boolean);
        if (rootFolder?.handle) {
          if (pathParts[0] === rootFolder.name) pathParts.shift();
          let currentHandle = rootFolder.handle;
          for (let i = 0; i < pathParts.length - 1; i++) {
            currentHandle = await currentHandle.getDirectoryHandle(pathParts[i]);
          }
          const fileHandle = await currentHandle.getFileHandle(pathParts[pathParts.length - 1]);
          const file = await fileHandle.getFile();
          createdBlob = URL.createObjectURL(file);
          if (active) setLocalBlobUrl(createdBlob);
        } else {
          const { vfsReadFile } = await import('@/lib/virtualFileSystem');
          const cleanVfsPath = cleanImagePath.startsWith('/') ? cleanImagePath.substring(1) : cleanImagePath;
          const b64 = vfsReadFile(cleanVfsPath);
          if (b64 && active) setLocalBlobUrl(`data:image/png;base64,${b64}`);
        }
      } catch (e) {
        if (active) setLocalBlobUrl(`/api/view?filePath=${encodeURIComponent(cleanImagePath)}`);
      }
    };
    loadLocal();
    return () => {
      active = false;
      if (createdBlob) URL.revokeObjectURL(createdBlob);
    };
  }, [cleanImagePath, workspaceType, rootFolder, resourceFolderHandle]);

  const previewSrc = useMemo(() => {
    if (tempPreviewUrl) {
      return tempPreviewUrl;
    }

    if (!cleanImagePath) return "";

    // 💡 [데스크탑 가드] 이미 만료된 blob URL은 로딩 시 net::ERR_UPLOAD_FILE_CHANGED 에러를 대량 유발하므로 즉시 차단
    const isDesktop = typeof window !== 'undefined' && (window as any).electronAPI;
    if (isDesktop && cleanImagePath.startsWith('blob:')) {
      return "";
    }

    const isExternal = cleanImagePath.startsWith('http://') || cleanImagePath.startsWith('https://') || cleanImagePath.startsWith('data:') || cleanImagePath.startsWith('blob:');
    if (isExternal) return cleanImagePath;

    if (cleanImagePath.startsWith('media://')) {
      if (cleanImagePath.startsWith('media://?url=')) {
        return cleanImagePath.replace('media://?url=', 'media://local/serve?url=');
      }
      return cleanImagePath;
    }

    if (cleanImagePath.startsWith('/api/image/')) {
      if ((window as any).electronAPI) return `https://onrivi.com${cleanImagePath}`;
      return cleanImagePath;
    }

    let absolutePath = cleanImagePath;
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const isMediaOrAssets = cleanImagePath.startsWith('/media/') || cleanImagePath.startsWith('./media/') || cleanImagePath.startsWith('/assets/') || cleanImagePath.startsWith('./assets/');
      const isRootRelative = cleanImagePath.startsWith('/');
      
      if (isMediaOrAssets) {
        const freshRF = loadSecureData<string>('resourceFolder') || resourceFolder;
        if (freshRF) {
          const sep = freshRF.includes('\\') ? '\\' : '/';
          const cleanRoot = freshRF.endsWith(sep) ? freshRF.slice(0, -1) : freshRF;
          const strippedPath = cleanImagePath.startsWith('./') ? cleanImagePath.substring(1) : cleanImagePath;
          const normalizedSrc = sep === '\\' ? strippedPath.replace(/\//g, '\\') : strippedPath;
          absolutePath = cleanRoot + normalizedSrc;
        } else if (targetFolder) {
          const sep = targetFolder.includes('\\') ? '\\' : '/';
          // targetFolder가 .md 파일이면 폴더로 잘라냄
          let rawDir = targetFolder;
          if (rawDir.endsWith('.md') || rawDir.endsWith('.markdown')) {
            rawDir = rawDir.substring(0, Math.max(rawDir.lastIndexOf('\\'), rawDir.lastIndexOf('/')));
          }
          const cleanRoot = rawDir.endsWith(sep) ? rawDir.slice(0, -1) : rawDir;
          const strippedPath = cleanImagePath.startsWith('./') ? cleanImagePath.substring(1) : cleanImagePath;
          const normalizedSrc = sep === '\\' ? strippedPath.replace(/\//g, '\\') : strippedPath;
          absolutePath = cleanRoot + normalizedSrc;
        }
      } else {
        const isAbsoluteWin = /^[a-zA-Z]:[\\/]/.test(cleanImagePath);
        const isAbsoluteUnix = cleanImagePath.startsWith('/');
        const isAbsolute = isAbsoluteWin || isAbsoluteUnix;

        if (!isAbsolute && targetFolder) {
          const sep = targetFolder.includes('\\') ? '\\' : '/';
          let rawDir = targetFolder;
          if (rawDir.endsWith('.md') || rawDir.endsWith('.markdown')) {
            rawDir = rawDir.substring(0, Math.max(rawDir.lastIndexOf('\\'), rawDir.lastIndexOf('/')));
          }
          const cleanRoot = rawDir.endsWith(sep) ? rawDir.slice(0, -1) : rawDir;
          const normalizedSrc = sep === '\\' ? cleanImagePath.replace(/\//g, '\\') : cleanImagePath;
          absolutePath = cleanRoot + sep + normalizedSrc;
        } else if (isRootRelative && targetFolder) {
          // 일반적인 /images/ 류의 루트 상대경로 처리
          const sep = targetFolder.includes('\\') ? '\\' : '/';
          let rawDir = targetFolder;
          if (rawDir.endsWith('.md') || rawDir.endsWith('.markdown')) {
            rawDir = rawDir.substring(0, Math.max(rawDir.lastIndexOf('\\'), rawDir.lastIndexOf('/')));
          }
          const cleanRoot = rawDir.endsWith(sep) ? rawDir.slice(0, -1) : rawDir;
          const normalizedSrc = sep === '\\' ? cleanImagePath.replace(/\//g, '\\') : cleanImagePath;
          absolutePath = cleanRoot + normalizedSrc;
        }
      }
    }

    if (workspaceType === 'browser' || workspaceType === 'local') {
      if (localBlobUrl) {
        return localBlobUrl;
      }
    }
    
    if (absolutePath.startsWith('http') || absolutePath.startsWith('data:') || absolutePath.startsWith('blob:')) {
      return absolutePath;
    }
    
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      return `media://local/serve?url=${encodeURIComponent(absolutePath)}`;
    }

    if (workspaceType === 'browser' || workspaceType === 'local') {
      return localBlobUrl;
    }

    return cleanImagePath;
  }, [cleanImagePath, targetFolder, localBlobUrl, workspaceType, resourceFolder, tempPreviewUrl]);

  useEffect(() => {
    setImageLoadError(false);
  }, [previewSrc]);

  const handleInsert = () => {
    const insertPath = appliedPath || cleanImagePath;
    if (insertPath) {
      let finalPath = insertPath;
      const params: string[] = [];
      if (imageWidth.trim()) params.push(`width=${encodeURIComponent(imageWidth.trim())}`);
      if (imageHeight.trim()) params.push(`height=${encodeURIComponent(imageHeight.trim())}`);
      if (imageAlign) params.push(`align=${imageAlign}`);
      if (params.length > 0) {
        finalPath += (finalPath.includes('?') ? '&' : '?') + params.join('&');
      }
      onInsert(finalPath, imageAlt, initialData?.range);
      setImagePath("");
      setAppliedPath("");
      setImageAlt("이미지 설명");
      setImageWidth("");
      setImageHeight("");
      setImageAlign("center");
      onClose();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const api = (window as any).electronAPI;
      
      // 💡 [데스크탑 환경] Web Security 샌드박스를 우회하고 파일 잠금 에러를 원천 방지하기 위해 media:// 프로토콜 활용
      if (api && (file as any).path) {
        const filePath = (file as any).path;
        
        // 1. 즉시 media:// 주소로 미리보기 설정 (FileReader 호출 없음 -> ERR_UPLOAD_FILE_CHANGED 원천 예방)
        const localMediaUrl = `media://local/serve?url=${encodeURIComponent(filePath)}`;
        setTempPreviewUrl(localMediaUrl);

        // 2. 복사 생략(리소스 폴더 내부 파일) 체크
        const freshResourceFolder = loadSecureData<string>('resourceFolder') || resourceFolder;
        let targetDir = '';
        if (freshResourceFolder) {
          targetDir = freshResourceFolder + (freshResourceFolder.includes('\\') ? '\\media' : '/media');
        } else if (targetFolder) {
          let rawDir = targetFolder;
          if (rawDir.endsWith('.md') || rawDir.endsWith('.markdown')) {
            rawDir = rawDir.substring(0, Math.max(rawDir.lastIndexOf('\\'), rawDir.lastIndexOf('/')));
          }
          const folderName = rawDir.substring(Math.max(rawDir.lastIndexOf('\\'), rawDir.lastIndexOf('/')) + 1).toLowerCase();
          if (folderName !== 'assets' && folderName !== 'media') {
            targetDir = rawDir + (rawDir.includes('\\') ? '\\assets' : '/assets');
          } else {
            targetDir = rawDir;
          }
        }

        if (targetDir) {
          const normFilePath = filePath.replace(/\\/g, '/').toLowerCase();
          const normTargetDir = targetDir.replace(/\\/g, '/').toLowerCase();
          
          if (normFilePath.startsWith(normTargetDir + '/')) {
            const fileName = filePath.substring(Math.max(filePath.lastIndexOf('\\'), filePath.lastIndexOf('/')) + 1);
            const isMediaDir = normTargetDir.endsWith('/media') || normTargetDir.endsWith('/assets');
            const finalFolderName = targetDir.substring(Math.max(targetDir.lastIndexOf('\\'), targetDir.lastIndexOf('/')) + 1);
            
            let finalPath = '';
            if (isMediaDir && targetFolder) {
              finalPath = `/${finalFolderName}/${fileName}`;
            } else {
              finalPath = localMediaUrl;
            }
            
            setImagePath(finalPath);
            setAppliedPath(finalPath);
            setImageAlt("이미지 설명");
            if (showToast) showToast('리소스 폴더의 기존 파일을 선택하여 복사 없이 바로 적용합니다.', 'success');
            return; // 중단 (디스크 파일 변경 및 쓰기가 없으므로 잠금 에러 0%)
          }
        }

        // 외부 파일인 경우 로컬 저장 프로세스 진행
        try {
          const dataUrl = await api.readImageAsBase64(filePath);
          if (dataUrl) {
            const base64Data = dataUrl.split(',')[1] || '';
            const fileName = file.name ? file.name.replace(/\s+/g, '_') : `image_${Date.now()}.png`;
            await handleLocalImageSave(base64Data, fileName, file);
            setImageAlt("이미지 설명");
          }
        } catch (err) {
          console.error('데스크탑 이미지 로드 실패:', err);
          if (showToast) showToast('이미지를 로드하는 중 오류가 발생했습니다.', 'error');
        }
        return;
      }

      // 💡 [웹 환경] Web Security 샌드박스 내부이므로 기존 FileReader 방식으로 안전하게 획득
      const reader = new FileReader();
      reader.onload = async () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        
        setTempPreviewUrl(result);

        const fileName = file.name ? file.name.replace(/\s+/g, '_') : `image_${Date.now()}.png`;
        await handleLocalImageSave(base64Data, fileName, file);
        setImageAlt("이미지 설명");
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6" style={{ overflowY: "auto" }} onPaste={handlePasteEvent}>
      <div className="absolute inset-0 bg-black/65" onClick={onClose} />

      {/* PREMIUM WIDE MODAL (SCR-014) */}
      <div
        className={`relative w-full max-w-5xl rounded-lg shadow-2xl overflow-hidden flex flex-col border animate-in zoom-in-95 duration-200 ${
          isDarkMode
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className={`flex justify-between items-center px-6 py-4 border-b shrink-0 ${
          isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded flex items-center justify-center ${
              isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-600/10 text-indigo-600'
            }`}>
              <ImageIcon size={16} />
            </div>
            <h2 className="text-sm font-bold tracking-tight text-indigo-600 dark:text-indigo-400">이미지 삽입</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1.5 transition-colors rounded-full active:scale-95"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body: 2-column split */}
        <div className="flex flex-col md:flex-row min-h-0">

          {/* ─── LEFT PANEL ─── */}
          <div className={`flex flex-col gap-3 p-5 md:w-[52%] border-r ${
            isDarkMode ? 'border-zinc-800' : 'border-slate-200'
          }`}>

            {/* 소스 파일 */}
            <div className={`rounded-lg p-4 border ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-2 block">
                소스 파일 (원본)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imagePath}
                  onChange={(e) => {
                    setImagePath(e.target.value);
                    setAppliedPath("");
                  }}
                  onPaste={(e) => {
                    // 💡 전역 바이너리 업로드 핸들러로 버블링 원천 차단
                    e.stopPropagation();
                    e.nativeEvent?.stopImmediatePropagation?.();
                    const text = e.clipboardData?.getData('text') || '';
                    if (text) {
                      e.preventDefault();
                      setImagePath(text.trim());
                      setAppliedPath("");
                    }
                  }}
                  placeholder="https://example.com/image.png"
                  className={`w-full font-mono text-xs border rounded px-3 py-2.5 outline-none transition-all ${
                    isDarkMode
                      ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30'
                      : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
                  }`}
                />
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-4 py-2.5 border rounded font-bold text-xs transition-colors shrink-0 ${
                    isDarkMode
                      ? 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                      : 'border-slate-300 bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300'
                  }`}
                >
                  찾아보기
                </button>
              </div>
              {(appliedPath || cleanImagePath) && (
                <div className={`mt-2 px-3 py-1.5 rounded text-[10px] font-mono flex items-center gap-1.5 ${
                  isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'
                }`}>
                  <span className="text-green-500">✓</span>
                  <span className="truncate">{appliedPath || cleanImagePath}</span>
                </div>
              )}
            </div>

            {/* 슬림 붙여넣기 바 */}
            <div
              tabIndex={0}
              onPaste={handlePasteEvent}
              onClick={(e) => e.currentTarget.focus()}
              className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg border border-dashed cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                isDarkMode
                  ? 'bg-zinc-900 border-zinc-700 hover:border-indigo-500 hover:bg-zinc-800'
                  : 'bg-white border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30'
              }`}
            >
              <Upload className="text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" size={14} />
              <span className="font-bold text-xs text-slate-500 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                여기를 클릭 후 클립보드 이미지 붙여넣기 (Ctrl+V)
              </span>
            </div>

            {/* 이미지 속성 */}
            <div className={`rounded-lg p-4 border ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-3 block">
                이미지 속성
              </label>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1 block">설명 (Alt)</label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="이미지 설명"
                    className={`w-full text-xs border rounded px-3 py-2.5 outline-none focus:ring-1 transition-all ${
                      isDarkMode
                        ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-600 focus:border-indigo-500 focus:ring-indigo-500/30'
                        : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1 block">가로 (PX)</label>
                    <input
                      type="text"
                      value={imageWidth}
                      onChange={(e) => setImageWidth(e.target.value)}
                      placeholder="600px 또는 100%"
                      className={`w-full font-mono text-xs border rounded px-3 py-2.5 outline-none focus:ring-1 transition-all ${
                        isDarkMode
                          ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-600 focus:border-indigo-500 focus:ring-indigo-500/30'
                          : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1 block">세로 (PX)</label>
                    <input
                      type="text"
                      value={imageHeight}
                      onChange={(e) => setImageHeight(e.target.value)}
                      placeholder="auto 또는 400px"
                      className={`w-full font-mono text-xs border rounded px-3 py-2.5 outline-none focus:ring-1 transition-all ${
                        isDarkMode
                          ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-600 focus:border-indigo-500 focus:ring-indigo-500/30'
                          : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 정렬 */}
            <div className={`rounded-lg p-4 border ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-3 block">
                정렬
              </label>
              <div className="flex gap-2">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => setImageAlign(align)}
                    className={`flex-1 py-2.5 rounded text-xs font-bold transition-all border ${
                      imageAlign === align
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : isDarkMode
                          ? 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                          : 'border-slate-300 bg-slate-50 text-slate-500 hover:text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {align === 'left' ? '⬅ 왼쪽' : align === 'center' ? '↔ 가운데' : '오른쪽 ➡'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ─── RIGHT PANEL: Preview ─── */}
          <div className={`flex flex-col md:w-[48%] ${
            isDarkMode ? 'bg-zinc-900' : 'bg-white'
          }`}>
            <div className={`px-5 py-3 border-b flex items-center gap-2 ${
              isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-50'
            }`}>
              <Eye size={12} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                미리보기
              </span>
              {previewSrc && (
                <span className="ml-auto text-[9px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                  ● LIVE
                </span>
              )}
            </div>

            <div className="flex-grow flex flex-col p-5 gap-3">
              {/* 이미지 표시 영역 */}
              <div
                className={`relative flex-grow rounded-lg overflow-hidden border flex items-center justify-center ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-100 border-slate-200'
                }`}
                style={{ minHeight: '280px' }}
                onWheel={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                {previewSrc ? (
                  <>
                    {!imageLoadError ? (
                      <img
                        src={previewSrc}
                        alt="미리보기"
                        className="w-full h-full object-contain"
                        onError={() => setImageLoadError(true)}
                      />
                    ) : (
                      <div className="text-center p-8 text-slate-400 dark:text-zinc-500">
                        <ImageIcon size={28} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-bold">이미지를 불러올 수 없습니다</p>
                      </div>
                    )}
                    {/* 메타데이터 오버레이 */}
                    <div className={`absolute bottom-0 inset-x-0 px-4 py-2.5 border-t flex gap-4 items-center ${
                      isDarkMode ? 'bg-zinc-900/95 border-zinc-700' : 'bg-white/95 border-slate-200'
                    }`}>
                      <div>
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Format</div>
                        <div className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {(() => {
                            if (cleanImagePath.startsWith('data:image/')) {
                              return cleanImagePath.split(';')[0].split('/')[1]?.toUpperCase() || 'IMG';
                            }
                            if (cleanImagePath.startsWith('blob:')) {
                              if (appliedPath) return appliedPath.split('.').pop()?.toUpperCase() || 'IMG';
                              return 'BLOB';
                            }
                            const ext = cleanImagePath.split('.').pop()?.split('?')[0]?.toUpperCase();
                            return ext && ext.length <= 4 ? ext : 'IMG';
                          })()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Status</div>
                        <div className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {appliedPath ? 'SAVED' : 'LOCAL'}
                        </div>
                      </div>
                      {(imageWidth || imageHeight) && (
                        <div>
                          <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Size</div>
                          <div className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {imageWidth || '—'} × {imageHeight || '—'}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                      isDarkMode ? 'bg-zinc-700' : 'bg-slate-200'
                    }`}>
                      <ImageIcon size={28} className="text-slate-400 dark:text-zinc-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 leading-relaxed">
                      {cleanImagePath.startsWith('blob:')
                        ? <>만료된 임시 미리보기 경로입니다.<br />찾아보기를 눌러 로컬 파일을 다시 선택해주세요.</>
                        : <>이미지 주소 입력 또는<br />파일을 선택하면<br />여기에 미리보기가 표시됩니다</>
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* 정렬 미리보기 표시기 */}
              <div className={`rounded-lg px-4 py-3 border ${
                isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <span className="font-black uppercase text-[9px] tracking-widest">정렬 적용 미리보기</span>
                <div className={`mt-2 flex ${imageAlign === 'right' ? 'justify-end' : imageAlign === 'center' ? 'justify-center' : 'justify-start'}`}>
                  <div className="h-2 rounded-full bg-indigo-400/40 transition-all" style={{ width: previewSrc ? '60%' : '40%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-end gap-3 shrink-0 ${
          isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-50'
        }`}>
          <button
            onClick={onClose}
            className="font-bold text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2 px-3"
          >
            취소
          </button>
          <button
            onClick={handleInsert}
            disabled={!cleanImagePath}
            className={`px-6 py-2.5 rounded font-bold text-xs flex items-center gap-2 transition-all active:scale-[0.98] ${
              cleanImagePath
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed'
            }`}
          >
            <LinkIcon size={13} />
            이미지 삽입
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
