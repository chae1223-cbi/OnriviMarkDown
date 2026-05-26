"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search } from 'lucide-react';

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  position: { top: number; left: number };
  isDarkMode: boolean;
}

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: '표정 & 감정',
    icon: '😀',
    emojis: [
      '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','😈','👿','👹','👹','💀','☠️','👻','👽','👾','🤖','💩','😺','😸','😹','😻','😼','😽','🙀','😿','😾'
    ]
  },
  {
    id: 'nature',
    name: '자연 & 동식물',
    icon: '🌿',
    emojis: [
      '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷','🕸','🦂','🐢','🐍','🦎','🐙','🦑','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🐐','🦌','🐕','🐩','🐈','🐓','🦃','🦚','🦜','🦢','🦩','🕊','🌱','🌲','🌳','🌴','🌵','🌿','☘️','🍀','🍁','🍂','🍃','🍄','🐚','🌾','💐','🌷','🌹','🥀','🌺','🌸','🌼','🌻','🌞','🌝','🌛','🌜','🌚','🌕','🌖','🌗','🌘','🌑','🌒','🌓','🌔','🌙','🌎','🌍','🌏','🪐','💫','⭐️','🌟','✨','⚡️','☄️','💥','🔥','🌪','🌈','☀️','🌤','⛅️','🌥','☁️','🌦','🌧','⛈','🌩','🌨','💨','☃️','❄️','🌫','🌊','💧','💦','☔️'
    ]
  },
  {
    id: 'food',
    name: '음식 & 음료',
    icon: '🍔',
    emojis: [
      '🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶','🌽','🥕','🥔','🍠','🥐','🍞','🥖','🥨','🥯','🥞','🧇','🧀','🍖','🍗','🥩','🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🥙','🍳','🥘','🍲','🥣','🥗','🍿','🧈','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🦪','🍡','🥟','🥠','🥡','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍯','🍼','🥛','☕️','🍵','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🥤','🧃','🧊'
    ]
  },
  {
    id: 'travel',
    name: '여행 & 장소',
    icon: '✈️',
    emojis: [
      '🚗','🚙','🚌','🚎','🏎','🚓','🚑','🚒','🚐','🚚','🚛','🚜','🛵','🏍','🚲','🛴','🛹','🚏','🛣','🛤','🚨','🚥','🚦','🛑','🚧','⚓️','⛵️','🛶','🚤','🛳','⛴','🛩','🛫','✈️','🛬','🪂','🚟','🚠','🚡','🚁','🚂','🚈','🚄','🚅','🚆','🚇','🚊','🚉','🗺','🏔','⛰','🌋','🗻','🏕','🏖','🏜','🏝','🏞','🏟','🏛','🏗','🧱','🏠','🏡','🏢','🏣','🏥','🏦','🏨','🏪','🏫','🏬','🏭','🏰','🏯','🗽','🗼','🕌','⛪️','⛩','🏛','🗺','⛲️','🌅','🌄','🌇','🌆','🌃','🌉','🌁','🌌'
    ]
  },
  {
    id: 'activities',
    name: '활동 & 스포츠',
    icon: '⚽',
    emojis: [
      '⚽️','🏀','🏈','⚾️','🥎','🎾','🏐','🏉','🎱','🏓','🏸','🥅','🏒','🏑','🥍','🏏','⛳️','🏹','🎣','🤿','🥊','🥋','⛸','🎿','🛷','🥌','🎯','🪀','🪁','🎮','🕹','🎰','🎲','🧩','🧸','♠️','♥️','♦️','♣️','🃏','🀄️','🎭','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🎻'
    ]
  },
  {
    id: 'objects',
    name: '사물',
    icon: '💡',
    emojis: [
      '⌚️','📱','📲','💻','⌨️','🖱️','🖥','🖨','🎙','🎚','🎛','🧭','⏱','⏲','⏰','⏳','⌛️','📸','📷','📹','🎥','📽','🎞','📞','☎️','📟','📠','📺','📻','💡','🔦','🕯','🔌','🔋','🧯','🛢','💸','💵','💴','💶','💷','🪙','💰','💳','💎','⚖️','🧰','🔧','🔨','⚒','🛠','⛏','🔩','⚙️','🧱','⛓','🧲','🔫','💣','🧨','🪓','🔪','🗡','⚔️','🛡','🚬','⚰️','⚱️','🏺','🔮','📿','🧿','🧪','🧬','🔬','🔭','📡','🪞','🪜','🗑','🪟','🧳','🧴','🧼','🧽','🧹','🛁','🚿','🛀','🗝','🔑','🔐','🔏','🔒','🔓'
    ]
  },
  {
    id: 'symbols',
    name: '기호',
    icon: '🔣',
    emojis: [
      '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉','☸️','✡️','☯️','☦️','🛐','⛎','♈️','♉️','♊️','♋️','♌️','♍️','♎️','♏️','♐️','♑️','♒️','♓️','🆔','⚛️','☣️','☢️','📴','📳','🈶','🈚️','🈸','🈴','🉐','🈹','🈲','🛑','⛔️','📛','🚫','❌','⭕️','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❓','❔','❕','❗️','⚠️','🚸','🔰','🔱','🚰','♿️','🚹','🚺','🚼','🚻','🚾','🛗','🚮','🎚','🎛','🔀','🔁','🔂','▶️','⏩','⏮','◀️','⏪','⏮','🔼','🔽','⏹','⏺','⏸','⏏️','📶'
    ]
  },
  {
    id: 'shapes',
    name: '도형 & 특수문자',
    icon: '⬛',
    emojis: [
      '■', '□', '▲', '△', '▼', '▽', '◆', '◇', '○', '◎', '●', '★', '☆', '✦', '✧', '✨', '♥', '♡', '♦', '♢', '♣', '♧', '♠', '♤', '♩', '♪', '♫', '♬', '♭', '♮', '♯', '✓', '✔', '✗', '✘', '※', '†', '‡', '§', '¶', '→', '←', '↑', '↓', '↔', '↕', '↗', '↖', '↘', '↙', '⇄', '⇅', '⇆', '⇉', '⇇', '⇈', '⇊', '⇌', '⇋', '⇐', '⇒', '⇑', '⇓', '⇔', '⇕'
    ]
  }
];

export default function EmojiPicker({ isOpen, onClose, onSelect, position, isDarkMode }: EmojiPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("smileys");
  const pickerRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Clean search input on close
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return EMOJI_CATEGORIES;

    const term = searchTerm.toLowerCase();
    return EMOJI_CATEGORIES.map(category => ({
      ...category,
      emojis: category.emojis.filter(emoji => 
        // 간단한 텍스트 매칭이 없으므로 이모지 자체 또는 카테고리 이름으로 필터링
        category.name.toLowerCase().includes(term) || emoji.includes(term)
      )
    })).filter(category => category.emojis.length > 0);
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div 
      ref={pickerRef}
      style={{ 
        position: 'fixed', 
        top: `${position.top}px`, 
        left: `${position.left}px`,
        zIndex: 100
      }}
      className={`w-[320px] h-[380px] shadow-2xl rounded-xl border flex flex-col animate-in fade-in slide-in-from-top-3 duration-200 ${
        isDarkMode 
          ? 'bg-[#1e2022]/95 backdrop-blur-xl border-[#44474e] text-white' 
          : 'bg-white/95 backdrop-blur-xl border-[#c1c6d7] text-[#1e2022]'
      }`}
    >
      {/* Search Bar */}
      <div className="p-3 border-b border-black/5 dark:border-white/5 flex gap-2 items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="이모지 검색..."
            className={`w-full pl-8 pr-3 py-1.5 rounded-lg outline-none text-xs transition-all ${
              isDarkMode 
                ? 'bg-[#282a2f] border border-[#44474e] text-white focus:border-blue-400' 
                : 'bg-black/5 border border-transparent focus:bg-white focus:border-blue-600'
            }`}
          />
        </div>
      </div>

      {/* Category Tabs (Show only when not searching) */}
      {!searchTerm && (
        <div className="flex px-2 py-1.5 border-b border-black/5 dark:border-white/5 overflow-x-auto gap-0.5 custom-scrollbar">
          {EMOJI_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`p-1.5 rounded-lg text-sm transition-all flex-shrink-0 ${
                activeCategory === category.id
                  ? (isDarkMode ? 'bg-[#33373b]' : 'bg-black/5')
                  : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100'
              }`}
              title={category.name}
            >
              {category.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emojis Grid */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {filteredCategories.length > 0 ? (
          filteredCategories.map(category => {
            // If active or searching, render
            if (!searchTerm && category.id !== activeCategory) return null;

            return (
              <div key={category.id} className="space-y-2">
                <div className="text-[10px] font-bold opacity-50 uppercase tracking-wider">
                  {category.name}
                </div>
                <div className="grid grid-cols-8 gap-1.5">
                  {category.emojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelect(emoji);
                        onClose();
                      }}
                      className="w-7 h-7 flex items-center justify-center text-lg rounded-md hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition-all"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 text-xs">
            <span>🔍</span>
            <span className="mt-1">검색 결과가 없습니다.</span>
          </div>
        )}
      </div>
    </div>
  );
}
