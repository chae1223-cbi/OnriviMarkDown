import React, { useState, useEffect } from 'react';

interface FontSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFont: string;
  onSelectFont: (fontName: string) => void;
  isDarkMode: boolean;
}

const FALLBACK_FONTS = [
  '맑은 고딕', '바탕체', '궁서체', '돋움체', '굴림체', '휴먼명조',
  'Segoe UI', 'Arial', 'Times New Roman', 'Georgia', 'Noto Sans KR',
  'Nanum Gothic', 'Malgun Gothic', 'Gulim', 'Dotum', 'Batang', 'Gungsuh',
  'Nanum Myeongjo', 'Noto Serif KR', 'Cousine', 'D2Coding', 'Consolas',
  'Courier New', 'Verdana', 'Tahoma', 'Impact', 'Comic Sans MS'
];

async function collectFonts(): Promise<string[]> {
  try {
    if (typeof window !== 'undefined' && 'queryLocalFonts' in window) {
      const availableFonts = await (window as any).queryLocalFonts();
      if (availableFonts && availableFonts.length > 0) {
        const families = availableFonts.map((f: any) => f.family) as string[];
        return Array.from(new Set(families)).sort((a, b) => a.localeCompare(b, 'ko'));
      }
    }
  } catch (e) {
    console.warn('queryLocalFonts 실패:', e);
  }
  return FALLBACK_FONTS;
}

export default function FontSelectorModal({ isOpen, onClose, currentFont, onSelectFont, isDarkMode }: FontSelectorModalProps) {
  const [fonts, setFonts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    collectFonts().then((list) => {
      setFonts(list);
      setLoading(false);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = fonts.filter(f => f.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`w-full max-w-md mx-4 rounded-xl shadow-2xl border ${
          isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className={`flex justify-between items-center px-5 pt-4 pb-3 border-b ${
          isDarkMode ? 'border-zinc-800' : 'border-gray-100'
        }`}>
          <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-[#1b1b23]'}`}>
            시스템 글꼴 선택
          </span>
          <button
            onClick={onClose}
            className={`text-xs font-bold cursor-pointer ${isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            닫기
          </button>
        </div>

        {/* 검색창 */}
        <div className="px-5 pt-3 pb-2">
          <input
            type="text"
            placeholder="글꼴 검색 (예: 바탕, 고딕, Arial)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full p-2.5 rounded-lg text-xs font-semibold border outline-none transition-all ${
              isDarkMode
                ? 'bg-zinc-800 border-zinc-700 text-white focus:border-blue-500 placeholder-zinc-500'
                : 'bg-gray-50 border-gray-200 text-[#1b1b23] focus:border-blue-500'
            }`}
            autoFocus
          />
        </div>

        {/* 폰트 목록 */}
        <div className={`mx-4 mb-3 max-h-64 overflow-y-auto space-y-0.5 rounded-lg border p-1 ${
          isDarkMode ? 'border-zinc-800 bg-zinc-950/40' : 'border-gray-100 bg-gray-50/50'
        }`}>
          {loading ? (
            <div className={`text-center py-8 text-xs font-medium ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
              시스템 폰트를 불러오는 중...
            </div>
          ) : filtered.length === 0 ? (
            <div className={`text-center py-8 text-xs font-medium ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
              검색된 글꼴이 없습니다.
            </div>
          ) : (
            filtered.map((font) => (
              <button
                key={font}
                onClick={() => {
                  onSelectFont(font);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2.5 rounded-md text-xs font-bold transition-all flex justify-between items-center cursor-pointer ${
                  currentFont === font
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isDarkMode
                      ? 'hover:bg-blue-600/20 text-zinc-300'
                      : 'hover:bg-blue-50 text-zinc-600'
                }`}
              >
                <span>{font}</span>
                <span className="text-[11px] font-normal opacity-60" style={{ fontFamily: font }}>
                  가나다 ABC 123
                </span>
              </button>
            ))
          )}
        </div>

        {/* 하단 정보 */}
        <div className={`px-5 pb-4 text-[10px] text-right font-medium ${
          isDarkMode ? 'text-zinc-500' : 'text-gray-400'
        }`}>
          총 <span className="text-blue-600 font-bold">{filtered.length}</span>개 글꼴
        </div>
      </div>
    </div>
  );
}
