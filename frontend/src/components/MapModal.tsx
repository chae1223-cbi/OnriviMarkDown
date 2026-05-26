"use client";

import React, { useState, useMemo } from 'react';
import { X, Map as MapIcon, Search, Plus, Minus, MapPin, Terminal, Code, Loader } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (code: string) => void;
  isDarkMode: boolean;
}

export default function MapModal({ isOpen, onClose, onInsert, isDarkMode }: MapModalProps) {
  const { showToast } = useToast();
  const [address, setAddress] = useState("서울특별시 중구 세종대로 110");
  const [coords, setCoords] = useState("37.5665, 126.9780");
  const [zoom, setZoom] = useState(15);
  const [isLoading, setIsLoading] = useState(false);

  // 지도 검색 함수
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!address.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setCoords(`${parseFloat(lat).toFixed(4)}, ${parseFloat(lon).toFixed(4)}`);
      } else {
        showToast("검색 결과를 찾을 수 없습니다.", 'error');
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanCoords = useMemo(() => {
    return coords.trim().replace(/^[\("'\s]+|[\)"'\s]+$/g, '');
  }, [coords]);

  // 구글 지도 Embed URL (API 키 없이 연동되는 방식)
  const googleEmbedUrl = useMemo(() => {
    const [lat, lng] = cleanCoords.split(',').map(s => s.trim());
    return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&t=&ie=UTF8&iwloc=&output=embed${isDarkMode ? '&theme=dark' : ''}`;
  }, [cleanCoords, zoom, isDarkMode]);

  if (!isOpen) return null;

  // 삽입할 코드 (구글 스태틱 지도 형식)
  const mapCode = `![Google Map](https://maps.googleapis.com/maps/api/staticmap?center=${cleanCoords.replace(/\s/g, '')}&zoom=${zoom}&size=600x300&key=YOUR_API_KEY)`;

  const handleInsert = () => {
    onInsert(`\n${mapCode}\n`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 dark:bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className={`relative w-full max-w-[640px] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border ${
        isDarkMode 
          ? 'bg-[#131313] border-[#414755] shadow-[0px_8px_32px_rgba(0,0,0,0.4)]' 
          : 'bg-white border-[#c1c6d7] shadow-[0px_4px_24px_rgba(0,0,0,0.15)]'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${
          isDarkMode ? 'border-[#414755] bg-[#201f1f]' : 'border-[#c1c6d7] bg-[#f7f9ff]'
        }`}>
          <div className="flex items-center gap-2">
            <MapIcon size={20} className="text-[#4285F4]" />
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-[#e5e2e1]' : 'text-[#181c20]'}`}>지도 삽입</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleSearch} className="space-y-1.5">
            <label className={`text-xs font-semibold ${isDarkMode ? 'text-[#c1c6d7]' : 'text-[#5c5f61]'}`}>주소 또는 장소 검색 (Google)</label>
            <div className="relative flex items-center">
              {isLoading ? (
                <Loader size={16} className="absolute left-3 text-[#4285F4] animate-spin" />
              ) : (
                <Search size={16} className="absolute left-3 text-gray-400" />
              )}
              <input 
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border outline-none transition-all text-sm ${
                  isDarkMode 
                    ? 'bg-[#0e0e0e] border-[#414755] text-[#e5e2e1] focus:ring-2 focus:ring-[#4285F4]/40' 
                    : 'bg-white border-[#c1c6d7] text-[#181c20] focus:ring-2 focus:ring-[#4285F4]/20'
                }`}
                placeholder="장소명을 입력하고 엔터를 누르세요..."
              />
            </div>
          </form>

          {/* Google Map Preview Area */}
          <div className={`relative w-full h-[320px] rounded-lg overflow-hidden border ${
            isDarkMode ? 'border-[#414755] bg-[#353534]' : 'border-[#c1c6d7] bg-[#e0e3e8]'
          }`}>
            <iframe
              title="Google Map Preview"
              width="100%"
              height="100%"
              style={{ border: 0, filter: isDarkMode ? 'invert(90%) hue-rotate(180deg)' : 'none' }}
              loading="lazy"
              allowFullScreen
              src={googleEmbedUrl}
            ></iframe>
            
            <div className="absolute bottom-4 right-4 flex flex-col gap-1">
              <button onClick={() => setZoom(z => Math.min(z + 1, 20))} className={`w-8 h-8 rounded shadow-md flex items-center justify-center border ${isDarkMode ? 'bg-[#2a2a2a] border-[#414755] text-white' : 'bg-white border-[#c1c6d7]'}`}><Plus size={18} /></button>
              <button onClick={() => setZoom(z => Math.max(z - 1, 1))} className={`w-8 h-8 rounded shadow-md flex items-center justify-center border ${isDarkMode ? 'bg-[#2a2a2a] border-[#414755] text-white' : 'bg-white border-[#c1c6d7]'}`}><Minus size={18} /></button>
            </div>

            <div className={`absolute top-4 left-4 backdrop-blur-md border px-2.5 py-1.5 rounded shadow-sm flex items-center gap-2 ${isDarkMode ? 'bg-black/60 border-[#414755] text-white' : 'bg-white/90 border-[#c1c6d7]'}`}>
              <MapPin size={14} className="text-[#4285F4]" />
              <span className="text-[11px] font-bold">{cleanCoords}</span>
            </div>
          </div>

          <div className={`p-3 border rounded flex items-center gap-3 ${isDarkMode ? 'bg-[#201f1f] border-[#414755]' : 'bg-[#ebeef3] border-[#c1c6d7]'}`}>
            <Code size={18} className="text-gray-400 shrink-0" />
            <code className={`text-[10px] font-mono truncate ${isDarkMode ? 'text-[#c1c6d7]' : 'text-[#5c5f61]'}`}>
              {mapCode}
            </code>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-end gap-2 ${isDarkMode ? 'border-[#414755] bg-[#1c1b1b]' : 'border-[#c1c6d7] bg-[#f1f4f9]'}`}>
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#21262d] border border-gray-200 dark:border-[#30363d] rounded-xl transition-all active:scale-[0.98]">취소</button>
          <button onClick={handleInsert} className="px-5 py-2 bg-[#4285F4] text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-2 hover:opacity-90 transition-all">
            <Terminal size={16} />
            마크다운 코드 삽입
          </button>
        </div>
      </div>
    </div>
  );
}
