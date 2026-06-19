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

const FONT_NAME_MAP: Record<string, string> = {
  'Malgun Gothic': '맑은 고딕',
  'Gulim': '굴림',
  'Dotum': '돋움',
  'Batang': '바탕',
  'Gungsuh': '궁서',
  'UnBatang': '은바탕',
  'UnDotum': '은돋움',
  'UnGungsuh': '은궁서',
  'UnPilgi': '은필기',
  'UnGraphic': '은그래픽',
  'NanumGothic': '나눔고딕',
  'Nanum Myeongjo': '나눔명조',
  'NanumMyeongjo': '나눔명조',
  'NanumSquare': '나눔스퀘어',
  'NanumSquareRound': '나눔스퀘어라운드',
  'NanumBarunGothic': '나눔바른고딕',
  'Nanum Gothic': '나눔고딕',
  'Apple SD Gothic Neo': '애플 SD 산돌고딕 Neo',
  'AppleGothic': '애플고딕',
  'AppleMyungjo': '애플명조',
  'GungSeo': '궁서체',
  'BatangChe': '바탕체',
  'GulimChe': '굴림체',
  'DotumChe': '돋움체',
  'KoPubBatang': 'KoPub 바탕',
  'KoPubDotum': 'KoPub 돋움',
  'Noto Sans KR': '본고딕 (Noto Sans KR)',
  'Noto Serif KR': '본명조 (Noto Serif KR)'
};

// ====================================================================
// 📊 [OMD-CORE-FontSelectorModal-0001] FontSelectorModal ➔ collectFonts
// 🎯 @KICK  : queryLocalFonts API로 시스템 설치 폰트 수집, 실패 시 FALLBACK_FONTS 반환
// 🛡️ @GUARD : queryLocalFonts 미지원 환경에서는 콘솔 경고 후 폴백 폰트 반환
// 🚨 @PATCH : **2026-06-19** — 시스템 글꼴 중 한글명 매핑 테이블(FONT_NAME_MAP)을 추가하여 UI 상에 친숙한 한글 폰트명으로 노출하고 한글/영문 양방향 검색 지원
// 🔗 @CALLS : 없음
// ====================================================================
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

// ====================================================================
// 📊 [OMD-CORE-FontSelectorModal-0002] FontSelectorModal ➔ FontSelectorModal
// 🎯 @KICK  : 시스템 폰트 목록을 검색/선택하는 모달 창
// 🛡️ @GUARD : isOpen이 false면 렌더링 생략
// 🚨 @PATCH : 없음
// 🔗 @CALLS : collectFonts
// ====================================================================
export default function FontSelectorModal({ isOpen, onClose, currentFont, onSelectFont, isDarkMode }: FontSelectorModalProps) {
  const [fonts, setFonts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // ====================================================================
  // 📊 [OMD-CORE-FontSelectorModal-0003] FontSelectorModal ➔ useEffect (collectFonts)
  // 🎯 @KICK  : 모달 열릴 때 시스템 폰트 목록을 수집하여 사용자에게 노출
  // 🛡️ @GUARD : isOpen이 false면 실행 생략으로 불필요한 폰트 스캔 방지
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : collectFonts
  // ====================================================================
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    collectFonts().then((list) => {
      setFonts(list);
      setLoading(false);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = fonts.filter(f => {
    const koreanName = FONT_NAME_MAP[f] || '';
    const term = searchTerm.toLowerCase();
    return f.toLowerCase().includes(term) || koreanName.toLowerCase().includes(term);
  });

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
                <span>{FONT_NAME_MAP[font] || font}</span>
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
