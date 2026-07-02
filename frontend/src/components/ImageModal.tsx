"use client";

// 🚨 @PATCH : **2026-06-20** — 클립보드 이미지 붙여넣기 시 마우스 클릭 시 강제 포커싱(onClick focus)을 부여하여 Ctrl+V 이벤트가 확실히 트리거되도록 수정하고, 웹 브라우저 환경에서 electronAPI가 없을 경우를 위한 blob URL 폴백 생성을 추가해 크로스 플랫폼 붙여넣기 결함을 해결

import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getApiUrl } from '@/lib/apiUrlBuilder';

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
}

// ====================================================================
// 📊 [OMD-EDIT-ImageModal-0007] ImageModal ➔ ImageModal
// 🎯 @KICK  : 이미지 삽입 모달 - URL/파일/클립보드 이미지 경로 입력 및 크기/정렬 설정
// 🛡️ @GUARD : isOpen/mounted false 시 null 반환; cleanImagePath가 없으면 삽입 버튼 비활성화
// 🚨 @PATCH : **2026-06-20** — 클립보드 이미지 붙여넣기 시 마우스 클릭 시 강제 포커싱(onClick focus) 및 브라우저 환경을 위한 blob URL 폴백 추가
// 🔗 @CALLS : handleInsert, handlePasteEvent, handleFileChange, cleanImagePath, previewSrc
// ====================================================================
export default function ImageModal({ 
  isOpen, 
  onClose, 
  onInsert, 
  isDarkMode, 
  initialData, 
  targetFolder, 
  showToast 
}: ImageModalProps) {
  const [imagePath, setImagePath] = React.useState("");
  const [appliedPath, setAppliedPath] = React.useState("");
  const [imageAlt, setImageAlt] = React.useState("이미지 설명");
  const [imageWidth, setImageWidth] = React.useState("");
  const [imageHeight, setImageHeight] = React.useState("");
  const [imageAlign, setImageAlign] = React.useState("center");
  const [mounted, setMounted] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

// ====================================================================
// 📊 [OMD-EDIT-ImageModal-0006] ImageModal ➔ useEffect (mounted)
// 🎯 @KICK  : 클라이언트 마운트 완료 상태 설정으로 포탈 렌더링 hydration mismatch 방지
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
// 🔗 @CALLS : setMounted
// ====================================================================
  React.useEffect(() => {
    setMounted(true);
  }, []);

// ====================================================================
// 📊 [OMD-EDIT-ImageModal-0005] ImageModal ➔ useEffect (initialData mapping)
// 🎯 @KICK  : 모달 열림 시 initialData가 있으면 각 필드에 매핑, 없으면 초기화
// 🛡️ @GUARD : isOpen이 true일 때만 실행
// 🚨 @PATCH : 없음
// 🔗 @CALLS : setImagePath, setImageAlt, setImageWidth, setImageHeight, setImageAlign
// ====================================================================
  // 💡 모달이 열릴 때 이전 데이터가 존재하면 매핑해 줍니다.
  React.useEffect(() => {
    if (isOpen) {
      setAppliedPath("");
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
  }, [isOpen, initialData]);

// ====================================================================
// 📊 [OMD-EDIT-ImageModal-0004] ImageModal ➔ handlePasteEvent
// 🎯 @KICK  : 클립보드 이미지를 로컬 assets 폴더에 저장하고 경로를 입력 필드에 설정
// 🛡️ @GUARD : 클립보드에 이미지 타입 아이템이 없으면 early return
// 🚨 @PATCH : **2026-06-20** — 브라우저 환경에서 electronAPI가 없을 경우를 위한 blob URL 폴백 로직 추가
// 🔗 @CALLS : api.saveImage, showToast, setImagePath
// ====================================================================
  // 📸 [클립보드 붙여넣기(Paste) 공통 처리 함수]
  // 🖥️ 데스크탑 공통: R2 우선 업로드 → 실패 시 로컬 assets/ fallback
  const handleDesktopImageUpload = async (base64Data: string, fileName: string, imageFile: File) => {
    let finalPath = '';
    let r2Success = false;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const resp = await fetch('https://onrivi.com/api/upload-image', {
        method: 'POST', headers,
        body: JSON.stringify({ base64Data, targetFolder: targetFolder || '', fileName }),
      });
      if (resp.ok) {
        const d = await resp.json();
        if (d.status === 'success' && d.relativePath) {
          finalPath = d.relativePath;
          r2Success = true;
        }
      }
    } catch {}
    if (!r2Success) {
      const api = (window as any).electronAPI;
      if (api) {
        const saveResult = await api.saveImage(targetFolder || '', base64Data, fileName);
        if (saveResult && saveResult.success) {
          finalPath = saveResult.isRelative ? `assets/${fileName}` : `media://local/serve?url=${encodeURIComponent(saveResult.absolutePath)}`;
        }
      }
    }
    if (finalPath) {
      setImagePath(finalPath);
      setAppliedPath(finalPath);
      if (showToast) {
        if (r2Success) showToast('R2 업로드 완료 — 적용 경로가 설정되었습니다.', 'success');
        else showToast('R2 업로드 실패 — 로컬 assets에 저장되었습니다.', 'error');
      }
    } else {
      const blobPreview = URL.createObjectURL(imageFile);
      setImagePath(blobPreview);
      if (showToast) showToast('이미지 저장 실패', 'error');
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
    if (!imageFile) {
      if (showToast) showToast('클립보드에서 이미지를 읽을 수 없습니다.', 'error');
      return;
    }
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
      const api = (window as any).electronAPI;
      if (api) {
        const fileName = `image_${Date.now()}.png`;
        await handleDesktopImageUpload(base64Data, fileName, imageFile!);
      } else {
        const blobPreview = URL.createObjectURL(imageFile!);
        setImagePath(blobPreview);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          const isDev = process.env.NODE_ENV === 'development';
          const uploadEndpoint = isDev ? getApiUrl('/api/upload-pasted-image') : '/api/upload-image';
          const headers: any = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const response = await fetch(uploadEndpoint, {
            method: 'POST', headers,
            body: JSON.stringify({ base64Data, targetFolder: targetFolder || '' }),
          });
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.relativePath) {
              setImagePath(data.relativePath);
              setAppliedPath(data.relativePath);
              if (showToast) {
                if (isDev) showToast('개발 환경: 로컬 프록시를 통해 assets 폴더에 저장되었습니다.', 'success');
                else showToast('웹 환경: 클라우드 서버(R2)에 성공적으로 업로드되었습니다.', 'success');
              }
            } else {
              if (showToast) showToast('이미지 클라우드 업로드 실패: ' + (data.error || ''), 'error');
            }
          } else {
            if (showToast) showToast(`서버 오류 발생 (${response.status})`, 'error');
          }
        } catch (err) {
          console.error(err);
          if (showToast) showToast('웹 이미지 업로드 전송 중 네트워크 오류가 발생했습니다.', 'error');
        }
      }
    };
    reader.onerror = () => {
      if (showToast) showToast('이미지 파일을 읽는데 실패했습니다.', 'error');
    };
    reader.readAsDataURL(imageFile);
  };

// ====================================================================
// 📊 [OMD-EDIT-ImageModal-0003] ImageModal ➔ cleanImagePath
// 🎯 @KICK  : 입력된 이미지 경로에서 순수 URL 추출 (마크다운/HTML 태그 래핑 제거)
// 🛡️ @GUARD : media:// 프로토콜 래핑 해제; 외곽 괄호/따옴표 제거
// 🚨 @PATCH : media://local/serve?url= 내부의 중첩 URL을 추출하는 fallback 로직
// 🔗 @CALLS : 없음
// ====================================================================
  // 실제 이미지 주소 추출
  const cleanImagePath = React.useMemo(() => {
    let raw = imagePath.trim();
    const srcMatch = raw.match(/src=["']([^"']+)["']/);
    const mdMatch = raw.match(/!\[[^\]]*\]\(([^)]*)\)/);
    let url = raw;
    if (srcMatch) url = srcMatch[1];
    else if (mdMatch) url = mdMatch[1];
    
    // 외곽 괄호 및 따옴표 제거
    url = url.replace(/^[\("'\s]+|[\)"'\s]+$/g, '');
    
    // 이미지 주소 뒤의 width, height 파라미터(?width=... 나 ?height=... 등)를 제거하여 순수 경로 리턴
    url = url.replace(/[\?&](?:width|height|w|h)=[^&]*/gi, '');
    
    // 💡 [미디어 프로토콜 래퍼 제거 가드]
    // 만약 주소가 media://local/serve?url=... 형태로 감싸져 있는 상태라면,
    // 내부의 순수 상대경로(또는 절대경로)를 추출하여 뷰어 및 미리보기가 정상적으로 경로 조합을 수행하게 합니다.
    if (url.startsWith('media://')) {
      try {
        const parsedUrl = new URL(url);
        const extracted = parsedUrl.searchParams.get('url');
        if (extracted) {
          url = extracted;
        }
      } catch (e) {
        const m = url.match(/[?&]url=([^&]+)/);
        if (m) {
          url = decodeURIComponent(m[1]);
        }
      }
    }
    
    return url;
  }, [imagePath]);

// ====================================================================
// 📊 [OMD-EDIT-ImageModal-0002] ImageModal ➔ previewSrc
// 🎯 @KICK  : cleanImagePath를 media:// 로컬 프록시 URL로 변환하여 미리보기 이미지 로드 보장
// 🛡️ @GUARD : 외부 URL, blob, data URL은 원본 유지; 로컬 경로만 변환
// 🚨 @PATCH : media://?url= 접두사를 media://local/serve?url=로 정정
// 🔗 @CALLS : 없음
// ====================================================================
  // 🛡️ [미리보기 이미지 URL 안전 동적 매핑]
  // assets/로 시작하는 상대 경로 및 일반 경로를 뷰어가 404 없이 로드할 수 있도록 media:// 로컬 프록시 주소로 변환
  const previewSrc = React.useMemo(() => {
    if (!cleanImagePath) return "";
    
    // 외부 URL이나 blob인 경우는 그대로 사용
    const isExternal = cleanImagePath.startsWith('http://') || cleanImagePath.startsWith('https://') || cleanImagePath.startsWith('data:') || cleanImagePath.startsWith('blob:');
    if (isExternal) return cleanImagePath;

    // 이미 media:// 프로토콜 형식을 취하고 있는 경우
    if (cleanImagePath.startsWith('media://')) {
      if (cleanImagePath.startsWith('media://?url=')) {
        return cleanImagePath.replace('media://?url=', 'media://local/serve?url=');
      }
      return cleanImagePath;
    }

    // R2 API 경로인 경우 (데스크탑에서 HTTPS로 로드)
    if (cleanImagePath.startsWith('/api/image/')) {
      if ((window as any).electronAPI) return `https://onrivi.com${cleanImagePath}`;
      return cleanImagePath;
    }

    // 로컬 절대경로 또는 상대경로인 경우
    let absolutePath = cleanImagePath;
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const isAbsoluteWin = /^[a-zA-Z]:[\\/]/.test(cleanImagePath);
      const isAbsoluteUnix = cleanImagePath.startsWith('/');
      const isAbsolute = isAbsoluteWin || isAbsoluteUnix;

      if (!isAbsolute && targetFolder) {
        const sep = targetFolder.includes('/') ? '/' : '\\';
        const folder = targetFolder.endsWith(sep) ? targetFolder : targetFolder + sep;
        absolutePath = folder + cleanImagePath;
      }
      return `media://local/serve?url=${encodeURIComponent(absolutePath)}`;
    }

    return cleanImagePath;
  }, [cleanImagePath, targetFolder]);

  if (!isOpen) return null;
  if (!mounted) return null;

// ====================================================================
// 📊 [OMD-EDIT-ImageModal-0001] ImageModal ➔ handleInsert
// 🎯 @KICK  : 이미지 경로와 크기/정렬 파라미터를 조합해 마크다운 코드로 삽입
// 🛡️ @GUARD : cleanImagePath가 비어있으면 실행 차단
// 🚨 @PATCH : 없음
// 🔗 @CALLS : onInsert, onClose
// ====================================================================
  const handleInsert = () => {
    const insertPath = appliedPath || cleanImagePath;
    if (insertPath) {
      let finalPath = insertPath;
      const params: string[] = [];
      if (imageWidth.trim()) {
        params.push(`width=${encodeURIComponent(imageWidth.trim())}`);
      }
      if (imageHeight.trim()) {
        params.push(`height=${encodeURIComponent(imageHeight.trim())}`);
      }
      if (imageAlign && imageAlign !== 'left') {
        params.push(`align=${imageAlign}`);
      }
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
      onClose(); // 삽입 후 모달 닫기 추가
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        const api = (window as any).electronAPI;
        if (api) {
          const fileName = `image_${Date.now()}.png`;
          await handleDesktopImageUpload(base64Data, fileName, file);
          setImageAlt("이미지 설명");
        } else {
          // 💡 웹 브라우저 환경 (SaaS: Cloudflare R2 클라우드 저장)
          const blobPreview = URL.createObjectURL(file);
          setImagePath(blobPreview);
          try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const isDev = process.env.NODE_ENV === 'development';
            const uploadEndpoint = isDev ? getApiUrl('/api/upload-pasted-image') : '/api/upload-image';

            const headers: any = { 'Content-Type': 'application/json' };
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(uploadEndpoint, {
              method: 'POST',
              headers,
              body: JSON.stringify({ base64Data, targetFolder: targetFolder || '' }),
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.status === 'success' && data.relativePath) {
                setImagePath(data.relativePath);
                setImageAlt("이미지 설명");
                if (showToast) {
                  if (isDev) showToast('개발 환경: 로컬 프록시를 통해 assets 폴더에 저장되었습니다.', 'success');
                  else showToast('웹 환경: 클라우드 서버(R2)에 성공적으로 업로드되었습니다.', 'success');
                }
              } else {
                if (showToast) showToast('이미지 클라우드 업로드 실패: ' + (data.error || ''), 'error');
              }
            } else {
              if (showToast) showToast(`서버 오류 발생 (${response.status})`, 'error');
            }
          } catch (err) {
            console.error(err);
            if (showToast) showToast('웹 이미지 업로드 전송 중 네트워크 오류가 발생했습니다.', 'error');
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 dark:bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className={`relative w-full max-w-[520px] shadow-2xl rounded-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border ${
        isDarkMode ? 'bg-[#1e2022] border-[#44474e]' : 'bg-white border-[#c1c6d7]'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDarkMode ? 'border-[#44474e] bg-[#181c20]' : 'border-[#c1c6d7] bg-[#f7f9ff]'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">이미지</span>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-blue-300' : 'text-[#181c20]'}`}>이미지 삽입</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-on-surface">
          {/* 이미지 경로 입력 */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">소스 파일 (원본)</label>
            <div className="flex gap-2">
              <input type="text" value={imagePath} onChange={(e) => setImagePath(e.target.value)}
                placeholder="https://example.com/image.png"
                className={`flex-1 border px-3 py-2 rounded-lg outline-none transition-all text-sm ${
                  isDarkMode ? 'bg-[#282a2f] border-[#44474e] text-white focus:border-blue-400' : 'bg-white border-[#c1c6d7] focus:border-blue-600'
                }`} />
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              <button onClick={() => fileInputRef.current?.click()}
                className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all active:scale-95 ${
                  isDarkMode ? 'bg-[#33373b] border-[#44474e] text-blue-300 hover:bg-[#44474e]' : 'bg-[#ebeef3] border-[#c1c6d7] text-gray-700 hover:bg-[#e0e3e8]'
                }`}>찾아보기</button>
            </div>
          </div>

          {/* 적용 경로 (자동 R2 업로드 후 세팅됨) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">적용 경로</label>
            <input type="text" value={appliedPath || cleanImagePath} readOnly
              className={`w-full border px-3 py-2 rounded-lg outline-none text-sm bg-gray-100 dark:bg-[#1a1c1e] ${
                isDarkMode ? 'border-[#44474e] text-gray-300' : 'border-[#c1c6d7] text-gray-500'
              }`} placeholder="붙여넣기/파일선택 시 자동 설정됩니다" />
          </div>

          {/* 클립보드 붙여넣기 */}
          <div tabIndex={0} onPaste={handlePasteEvent} onClick={(e) => e.currentTarget.focus()}
            className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all focus:ring-2 focus:ring-blue-500 outline-none ${
              isDarkMode ? 'border-[#44474e] bg-[#282a2f] hover:border-blue-400 text-gray-400 focus:border-blue-400' : 'border-[#c1c6d7] bg-gray-50 hover:border-blue-600 text-gray-500 focus:border-blue-600'
            }`}>
            <p className="text-xs font-semibold">클릭 후 Ctrl+V</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">클립보드 이미지 붙여넣기</p>
          </div>

          {/* Alt + 크기 + 정렬 3열 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">설명 (Alt)</label>
              <input type="text" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)}
                className={`w-full border px-2 py-2 rounded-lg outline-none transition-all text-sm ${
                  isDarkMode ? 'bg-[#282a2f] border-[#44474e] text-white focus:border-blue-400' : 'bg-white border-[#c1c6d7] focus:border-blue-600'
                }`} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">가로</label>
              <input type="text" value={imageWidth} onChange={(e) => setImageWidth(e.target.value)} placeholder="300px"
                className={`w-full border px-2 py-2 rounded-lg outline-none transition-all text-sm ${
                  isDarkMode ? 'bg-[#282a2f] border-[#44474e] text-white focus:border-blue-400' : 'bg-white border-[#c1c6d7] focus:border-blue-600'
                }`} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">세로</label>
              <input type="text" value={imageHeight} onChange={(e) => setImageHeight(e.target.value)} placeholder="auto"
                className={`w-full border px-2 py-2 rounded-lg outline-none transition-all text-sm ${
                  isDarkMode ? 'bg-[#282a2f] border-[#44474e] text-white focus:border-blue-400' : 'bg-white border-[#c1c6d7] focus:border-blue-600'
                }`} />
            </div>
          </div>

          {/* 정렬 */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">정렬</label>
            <div className="flex gap-2">
              {([['left', '왼쪽'], ['center', '가운데'], ['right', '오른쪽']] as const).map(([val, label]) => (
                <button key={val} onClick={() => setImageAlign(val)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border ${
                    imageAlign === val
                      ? isDarkMode ? 'bg-[#33373b] text-blue-300 border-[#44474e] shadow-sm' : 'bg-white text-blue-600 border-[#c1c6d7] shadow-sm font-semibold'
                      : isDarkMode ? 'bg-transparent text-gray-400 border-transparent hover:bg-[#282a2f]' : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-50'
                  }`}>{label}</button>
              ))}
            </div>
          </div>

          {/* 미리보기 */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">미리보기</label>
            <div className={`rounded-xl border border-dashed flex items-center justify-center overflow-hidden bg-black/5 dark:bg-white/5 ${
              isDarkMode ? 'border-[#444755]' : 'border-[#c1c6d7]'
            }`} style={{ minHeight: '200px' }}>
              {previewSrc ? (
                <img src={previewSrc} alt="미리보기"
                  style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                  onLoad={(e) => (e.currentTarget.style.display = 'block')} />
              ) : (
                <div className="text-center p-6 text-gray-400">
                  <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                  <p className="text-xs">유효한 이미지 주소를 입력하면<br/>여기에 미리보기가 표시됩니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex justify-end items-center gap-2 ${
          isDarkMode ? 'border-[#44474e] bg-[#1d2024]' : 'border-[#c1c6d7] bg-[#f1f4f9]'
        }`}>
          <button 
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClose}
            className={`px-6 py-2 border rounded-lg text-xs font-medium transition-all active:scale-95 ${
              isDarkMode 
                ? 'bg-[#1e2022] border-[#44474e] text-gray-400 hover:bg-[#282a2f]' 
                : 'bg-white border-[#c1c6d7] text-gray-600 hover:bg-gray-50'
            }`}
          >
            취소
          </button>
          <button 
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleInsert}
            disabled={!cleanImagePath}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-2 ${
              cleanImagePath 
                ? 'bg-[#c64f00] text-white hover:brightness-110' 
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            <LinkIcon size={14} />
            마크다운 코드 삽입
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
