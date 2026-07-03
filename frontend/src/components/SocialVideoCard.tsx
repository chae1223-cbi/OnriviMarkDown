"use client";

import React, { useState, useEffect } from 'react';

interface SocialVideoCardProps {
  url: string;
  displayName: string;
}

function detectPlatform(url: string): string | null {
  if (/tiktok\.com/.test(url)) return 'TikTok';
  if (/instagram\.com/.test(url)) return 'Instagram';
  if (/vimeo\.com/.test(url)) return 'Vimeo';
  if (/twitch\.tv/.test(url)) return 'Twitch';
  if (/dailymotion\.com/.test(url)) return 'Dailymotion';
  return null;
}

const platformColors: Record<string, string> = {
  TikTok: 'hover:border-purple-400 dark:hover:border-purple-500',
  Instagram: 'hover:border-pink-400 dark:hover:border-pink-500',
  Vimeo: 'hover:border-blue-400 dark:hover:border-blue-500',
  Twitch: 'hover:border-purple-500 dark:hover:border-purple-600',
  Dailymotion: 'hover:border-blue-400 dark:hover:border-blue-500',
};

export default function SocialVideoCard({ url, displayName }: SocialVideoCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const platform = detectPlatform(url);

  useEffect(() => {
    let cancelled = false;
    const oembedUrl = `https://onrivi.com/api/oembed?url=${encodeURIComponent(url)}`;

    fetch(oembedUrl)
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data.thumbnail_url) {
          setThumbnailUrl(data.thumbnail_url);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [url]);

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block no-underline my-2 group">
      <div className={`relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 transition-colors ${platformColors[platform || ''] || 'hover:border-blue-400 dark:hover:border-blue-500'}`}>
        <div className="aspect-video relative flex items-center justify-center bg-black/10 dark:bg-black/30 overflow-hidden">
          {loading ? (
            <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-600 border-t-transparent rounded-full animate-spin" />
          ) : thumbnailUrl ? (
            <img src={thumbnailUrl} alt={displayName} className="absolute inset-0 w-full h-full object-cover"
              onError={() => setThumbnailUrl(null)} />
          ) : null}
          {!loading && !thumbnailUrl ? (
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
        <div className="px-4 py-2.5 flex items-center gap-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
          <div className="w-5 h-5 shrink-0 text-zinc-400 fill-current">
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
            </svg>
          </div>
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300 truncate min-w-0">
            <span className="text-zinc-400 dark:text-zinc-500 mr-1.5">▶</span>
            <span>{displayName}</span>
          </div>
          <span className="ml-auto text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0">{platform || '동영상'}</span>
        </div>
      </div>
    </a>
  );
}
