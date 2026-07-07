"use client";

import React, { useState, useRef, useEffect } from 'react';

const thumbnailCache = new Map<string, string>();

interface VideoCardProps {
  src: string;
  href: string;
  displayName: string;
  isYoutube?: boolean;
  youtubeId?: string;
}

export default function VideoCard({ src, href, displayName, isYoutube, youtubeId }: VideoCardProps) {
  const cachedKey = isYoutube ? `yt:${youtubeId}` : src;
  const [thumbnail, setThumbnail] = useState<string | null>(() => thumbnailCache.get(cachedKey) || null);
  const [loading, setLoading] = useState(!thumbnailCache.has(cachedKey));
  const frameDoneRef = useRef(false);

  useEffect(() => {
    if (isYoutube && youtubeId) {
      if (navigator.onLine) {
        const ytUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
        thumbnailCache.set(cachedKey, ytUrl);
        setThumbnail(ytUrl);
      }
      setLoading(false);
      return;
    }
    if (!src || thumbnailCache.has(cachedKey)) { setLoading(false); return; }
    
    const isDesktop = typeof window !== 'undefined' && !!(window as any).electronAPI;
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

    // 사용자의 요청 정리:
    // 1. "데스크탑은 원래대로 하고": 데스크탑(Electron) 환경에서는 로컬/클라우드 상관없이 정상적으로 썸네일을 추출합니다.
    // 2. "로컬에서는 파일명으로 해줘": 로컬 웹 개발 서버(localhost:3100 등)에서는 외부/로컬 영상 로드 시 CORS 에러 방지를 위해 썸네일 추출을 모두 생략하고 파일명만 표시합니다.
    if (isLocalhost && !isDesktop) {
      setLoading(false);
      return;
    }

    if (frameDoneRef.current) return;
    frameDoneRef.current = true;
    let cancelled = false;
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    const timeout = setTimeout(() => { if (!cancelled) { video.remove(); setLoading(false); } }, 5000);
    video.onloadedmetadata = () => {
      if (cancelled) return;
      // 검은 화면 방지를 위해 1초 시점(또는 매우 짧은 경우 중간 시점)으로 이동
      video.currentTime = Math.min(1, video.duration > 0 ? video.duration / 2 : 0.5);
    };
    video.onseeked = () => {
      if (cancelled) return;
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        thumbnailCache.set(cachedKey, dataUrl);
        if (!cancelled) setThumbnail(dataUrl);
      } catch {
        if (!cancelled) setThumbnail(null);
      }
      video.remove();
      setLoading(false);
    };
    video.onerror = () => { clearTimeout(timeout); if (!cancelled) { video.remove(); setLoading(false); } };
    video.src = src;
    video.load();
    return () => { cancelled = true; clearTimeout(timeout); video.remove(); };
  }, [src, isYoutube, youtubeId, cachedKey]);

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block no-underline my-2 group" style={{ display: 'block', textDecoration: 'none' }}>
      <span className={`block relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-colors ${
        isYoutube ? 'bg-zinc-950 hover:border-red-400 dark:hover:border-red-500' : 'bg-zinc-100 dark:bg-zinc-900 hover:border-blue-400 dark:hover:border-blue-500'
      }`}>
        <span className="aspect-video relative flex items-center justify-center bg-black/10 dark:bg-black/30 overflow-hidden">
          {loading ? (
            <span className="block w-8 h-8 border-2 border-zinc-300 dark:border-zinc-600 border-t-transparent rounded-full animate-spin" />
          ) : thumbnail ? (
            <img src={thumbnail} alt={displayName} className="absolute inset-0 w-full h-full object-cover"
              onError={() => setThumbnail(null)} />
          ) : null}
          {!loading && !thumbnail ? (
            <span className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-200/80 to-zinc-300/80 dark:from-zinc-800/60 dark:to-zinc-900/80">
              <span className="absolute w-full px-6 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate drop-shadow-sm" style={{ top: '70%' }}>
                {displayName}
              </span>
            </span>
          ) : null}
          <span className="relative w-16 h-16 rounded-full bg-black/60 dark:bg-black/50 flex items-center justify-center group-hover:bg-black/80 group-hover:scale-110 transition-all z-10">
            <svg width="28" height="28" viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current" style={{ marginLeft: 3 }}>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </span>
    </a>
  );
}
