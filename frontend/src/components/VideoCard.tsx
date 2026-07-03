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
      const ytUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      thumbnailCache.set(cachedKey, ytUrl);
      setThumbnail(ytUrl);
      setLoading(false);
      return;
    }
    if (!src || thumbnailCache.has(cachedKey)) { setLoading(false); return; }
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
      video.currentTime = Math.min(1, video.duration / 2);
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
    <a href={href} target="_blank" rel="noopener noreferrer" className="block no-underline my-2 group">
      <div className={`relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-colors ${
        isYoutube ? 'bg-zinc-950 hover:border-red-400 dark:hover:border-red-500' : 'bg-zinc-100 dark:bg-zinc-900 hover:border-blue-400 dark:hover:border-blue-500'
      }`}>
        <div className="aspect-video relative flex items-center justify-center bg-black/10 dark:bg-black/30 overflow-hidden">
          {loading ? (
            <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-600 border-t-transparent rounded-full animate-spin" />
          ) : thumbnail ? (
            <img src={thumbnail} alt={displayName} className="absolute inset-0 w-full h-full object-cover"
              onError={() => setThumbnail(null)} />
          ) : null}
          {!loading && !thumbnail ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-200/80 to-zinc-300/80 dark:from-zinc-800/60 dark:to-zinc-900/80">
              <svg viewBox="0 0 24 24" className="w-12 h-12 text-zinc-400 dark:text-zinc-600 fill-current opacity-60">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
              </svg>
            </div>
          ) : null}
          <div className="relative w-16 h-16 rounded-full bg-black/60 dark:bg-black/50 flex items-center justify-center group-hover:bg-black/80 group-hover:scale-110 transition-all z-10">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current" style={{ marginLeft: 3 }}>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <div className={`px-4 py-2.5 flex items-center gap-2 border-t ${
          isYoutube
            ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900'
            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900'
        }`}>
          <div className={`w-5 h-5 shrink-0 fill-current ${isYoutube ? 'text-red-500' : 'text-zinc-400'}`}>
            {isYoutube ? (
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
              </svg>
            )}
          </div>
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300 truncate min-w-0">
            <span className={`mr-1.5 ${isYoutube ? 'text-red-500' : 'text-zinc-400 dark:text-zinc-500'}`}>▶</span>
            <span>{displayName}</span>
          </div>
          <span className="ml-auto text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0">{isYoutube ? 'YouTube' : '새창'}</span>
        </div>
      </div>
    </a>
  );
}
