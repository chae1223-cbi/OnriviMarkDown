"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Plus, Minus, MapPin, Copy, Check, Map } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (code: string) => void;
  isDarkMode: boolean;
}

// ====================================================================
// 📊 [OMD-CORE-MapModal-0006] MapModal ➔ MapModal
// 🎯 @KICK  : Google Maps iframe 기반 지도 삽입 모달 - 주소 검색, 줌 제어, 크기/정렬 설정 및 프리미엄 HSL 테마 이식
// 🛡️ @GUARD : isOpen/mounted false 시 null 반환
// 🚨 @PATCH : 2026-07-15 - 왼쪽 사이드바 제거 요청 반영 및 본문 영역 확장
// 🔗 @CALLS : handleSearch, handleInsert, setZoom, setMapAlign, showToast, createPortal
// ====================================================================
export default function MapModal({ isOpen, onClose, onInsert, isDarkMode }: MapModalProps) {
  const { showToast } = useToast();
  const [address, setAddress] = useState("서울특별시 중구 세종대로 110");
  const [coords, setCoords] = useState("37.5665, 126.9780");
  const [placeName, setPlaceName] = useState("서울시청");
  const [zoom, setZoom] = useState(15);
  const [mapWidth, setMapWidth] = useState("600");
  const [mapHeight, setMapHeight] = useState("350");
  const [mapAlign, setMapAlign] = useState<'left' | 'center' | 'right'>('center');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 지도 검색 함수 - Nominatim(OpenStreetMap) 기반 주소/장소명 검색
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!address.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&accept-language=ko`,
        { 
          headers: { 
            'Accept-Language': 'ko',
            'User-Agent': 'OnriviAuthor/1.0 (contact@onrivi.com)'
          } 
        }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newCoords = `${parseFloat(lat).toFixed(4)}, ${parseFloat(lon).toFixed(4)}`;
        setCoords(newCoords);
        const shortName = display_name.split(',')[0] || address;
        setPlaceName(shortName);
        showToast(`"${shortName}" 위치를 찾았습니다.`, 'success');
      } else {
        showToast("검색 결과를 찾을 수 없습니다. 다른 검색어를 입력해보세요.", 'error');
      }
    } catch (error) {
      console.error("[Onrivi Author] Search error", error);
      showToast("검색 중 오류가 발생했습니다.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const cleanCoords = useMemo(() => {
    return coords.trim().replace(/^[\("'\s]+|[\)"'\s]+$/g, '');
  }, [coords]);

  const googleEmbedUrl = useMemo(() => {
    const [lat, lng] = cleanCoords.split(',').map(s => s.trim());
    return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&t=&ie=UTF8&iwloc=&output=embed${isDarkMode ? '&theme=dark' : ''}`;
  }, [cleanCoords, zoom, isDarkMode]);

  const [latVal, lngVal] = cleanCoords.split(',').map(s => s.trim());
  const mapCode = `<iframe src="https://maps.google.com/maps?q=${latVal},${lngVal}&z=${zoom}&output=embed" style="width:${mapWidth}px; height:${mapHeight}px; border:0;" allowfullscreen loading="lazy" data-align="${mapAlign}"></iframe>`;

  const handleInsert = () => {
    onInsert(`\n${mapCode}\n`);
    onClose();
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(mapCode);
      setIsCopied(true);
      showToast("지도 HTML 코드가 복사되었습니다.", "success");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      showToast("코드 복사에 실패했습니다.", "error");
    }
  };

  if (!isOpen) return null;
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-8" style={{ overflowY: "auto" }}>
      {/* 선명한 투명 배경 (안개 블러 제거) */}
      <div className="absolute inset-0 bg-black/65" onClick={onClose} />
      
      {/* Modal Shell */}
      <main 
        className={`relative w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden flex flex-col border animate-in zoom-in-95 duration-300 ${
          isDarkMode 
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100' 
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Top App Bar (Header) */}
        <header className={`flex justify-between items-center h-16 px-8 w-full border-b shrink-0 ${
          isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-150 bg-slate-50/50'
        }`}>
          <div className="flex items-center space-x-3">
            <span className="text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Map size={20} />
            </span>
            <h1 className="text-base font-black tracking-tight text-indigo-600 dark:text-indigo-400">지도 삽입</h1>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-2 transition-colors rounded-full active:scale-95"
          >
            <X size={18} />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden h-[540px] min-h-0">
          {/* Main Working Canvas */}
          <section className="flex-1 flex flex-col p-6 space-y-5 overflow-y-auto min-h-0 bg-white dark:bg-zinc-950">
            {/* Search Module */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 tracking-wider uppercase">
                주소 또는 장소 검색
              </label>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1 group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 flex items-center">
                    <Search size={16} />
                  </span>
                  <input 
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="서울특별시 중구 세종대로 110"
                    className={`w-full border-transparent focus:border-indigo-500/20 focus:ring-0 rounded-lg pl-11 pr-4 py-2.5 text-xs font-bold transition-all shadow-sm ${
                      isDarkMode ? 'bg-zinc-900 focus:bg-zinc-900' : 'bg-slate-50 focus:bg-slate-50/30'
                    }`}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-bold text-xs flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-40"
                >
                  <span>{isLoading ? '검색 중...' : '검색'}</span>
                </button>
              </form>
            </div>

            {/* Map Visualization */}
            <div className={`relative rounded-xl overflow-hidden border shadow-inner h-[280px] shrink-0 ${
              isDarkMode ? 'border-zinc-800' : 'border-slate-200'
            }`}>
              <iframe
                key={googleEmbedUrl}
                title="Google Map"
                width="100%"
                height="100%"
                style={{ border: 0, filter: isDarkMode ? 'invert(90%) hue-rotate(180deg)' : 'none' }}
                loading="lazy"
                allowFullScreen
                src={googleEmbedUrl}
              />

              {/* Floating Coordinates Overlay */}
              <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 px-3.5 py-1.5 rounded-lg flex items-center space-x-3 z-20 shadow-sm text-[10px] font-bold">
                <div className="flex flex-col text-slate-600 dark:text-zinc-400 leading-tight">
                  <span>LAT: {latVal}</span>
                  <span>LNG: {lngVal}</span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-zinc-800" />
                <span className="text-slate-400 dark:text-zinc-500">Local Engine Active</span>
              </div>

              {/* Map Controls */}
              <div className="absolute top-4 right-4 flex flex-col space-y-1.5 z-20">
                <button 
                  onClick={() => setZoom(z => Math.min(z + 1, 20))}
                  className="w-8 h-8 bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-center hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-colors active:scale-95"
                >
                  <Plus size={16} />
                </button>
                <button 
                  onClick={() => setZoom(z => Math.max(z - 1, 1))}
                  className="w-8 h-8 bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-center hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-colors active:scale-95"
                >
                  <Minus size={16} />
                </button>
              </div>
            </div>

            {/* Editorial Control Panel: Grid of Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1 shrink-0">
              {/* Dimensions and Alignment */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] font-black text-slate-500 dark:text-zinc-400 tracking-wider uppercase">너비 (PX)</label>
                    <input 
                      type="number" 
                      value={mapWidth} 
                      onChange={(e) => setMapWidth(e.target.value)}
                      className={`w-full border-transparent focus:border-indigo-500/20 focus:ring-0 rounded-lg p-2.5 text-xs font-bold ${
                        isDarkMode ? 'bg-zinc-900' : 'bg-slate-50'
                      }`} 
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] font-black text-slate-500 dark:text-zinc-400 tracking-wider uppercase">높이 (PX)</label>
                    <input 
                      type="number" 
                      value={mapHeight} 
                      onChange={(e) => setMapHeight(e.target.value)}
                      className={`w-full border-transparent focus:border-indigo-500/20 focus:ring-0 rounded-lg p-2.5 text-xs font-bold ${
                        isDarkMode ? 'bg-zinc-900' : 'bg-slate-50'
                      }`} 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-zinc-400 tracking-wider uppercase">정렬</label>
                  <div className={`flex p-1 rounded-lg ${isDarkMode ? 'bg-zinc-900' : 'bg-slate-50'}`}>
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button 
                        key={align}
                        onClick={() => setMapAlign(align)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                          mapAlign === align
                            ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200/40 dark:ring-zinc-700/40'
                            : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
                        }`}
                      >
                        {align === 'left' ? '왼쪽' : align === 'center' ? '가운데' : '오른쪽'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Code Block Area */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <label className="text-[9px] font-black text-slate-500 dark:text-zinc-400 tracking-wider uppercase">삽입될 HTML (IFRAME)</label>
                  <span className="text-[9px] font-black text-indigo-600/60 dark:text-indigo-400/60">API 키 불필요</span>
                </div>
                <div className={`rounded-lg overflow-hidden border shadow-sm ${
                  isDarkMode ? 'border-zinc-800/80' : 'border-slate-200/60'
                }`}>
                  <div className={`px-3 py-1.5 flex justify-between items-center border-b ${
                    isDarkMode ? 'bg-zinc-900/80 border-zinc-800/80' : 'bg-slate-100/80 border-slate-200/60'
                  }`}>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400 font-mono">EMBED_SNIPPET.HTML</span>
                    <button 
                      onClick={handleCopyCode}
                      className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center"
                    >
                      {isCopied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <pre className={`p-3 font-mono text-[9px] leading-relaxed overflow-x-auto whitespace-nowrap scrollbar-none select-text ${
                    isDarkMode ? 'bg-zinc-900/30 text-zinc-400' : 'bg-slate-50/50 text-slate-600'
                  }`}>
                    <code>{mapCode}</code>
                  </pre>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sticky Footer Action Zone */}
        <footer className={`h-20 px-8 border-t flex items-center justify-between z-50 shrink-0 ${
          isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-150 bg-slate-50/50'
        }`}>
          <div className="flex items-center space-x-2 text-slate-400 dark:text-zinc-650">
            <span className="text-[10px] font-black tracking-tight font-mono">Onrivi Local-First Engine v1.0.4</span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-[4px] font-bold text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all active:scale-95"
            >
              취소
            </button>
            <button 
              onClick={handleInsert}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-[4px] font-bold text-xs shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center space-x-2"
            >
              <MapPin size={14} />
              <span>지도 삽입하기</span>
            </button>
          </div>
        </footer>
      </main>
    </div>,
    document.body
  );
}
