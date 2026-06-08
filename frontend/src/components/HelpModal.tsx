"use client";

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, Search } from 'lucide-react';
import MarkdownViewer from './MarkdownViewer'; // MarkdownViewer 재사용

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

// 💡 헬프 문서 리스트 (필요 시 확장 가능)
const HELP_DOCS = [
  { name: '00_시작하기', title: '시작하기', path: 'help/00_시작하기.md' },
  { name: '01_마크다운에디트란', title: '마크다운 에디트란', path: 'help/01_마크다운에디트란.md' },
  { name: '02_에디터-기본', title: '에디터 기본 사용법', path: 'help/02_에디터-기본.md' },
  { name: '03_파일-관리', title: '파일 관리', path: 'help/03_파일-관리.md' },
  { name: '04_미리보기-모드', title: '미리보기 모드', path: 'help/04_미리보기-모드.md' },
  { name: '05_서식-정의', title: '서식 정의', path: 'help/05_서식-정의.md' },
  { name: '06_내보내기', title: '내보내기', path: 'help/06_내보내기.md' },
  { name: '07_표-체크리스트', title: '표 및 체크리스트', path: 'help/07_표-체크리스트.md' },
  { name: '08_다이어그램-수식', title: '다이어그램 및 수식', path: 'help/08_다이어그램-수식.md' },
  { name: '09_슬래시-명령어', title: '슬래시 명령어 및 단축키', path: 'help/09_슬래시-명령어.md' },
  { name: '10_한글-입력', title: '한글 입력', path: 'help/10_한글-입력.md' },
  { name: '11_미디어-삽입', title: '미디어 삽입', path: 'help/11_미디어-삽입.md' },
  { name: '12_내보내기-고급', title: '내보내기 고급', path: 'help/12_내보내기-고급.md' },
  { name: '13_설정', title: '설정 및 커스터마이징', path: 'help/13_설정.md' },
];

export default function HelpModal({ isOpen, onClose, isDarkMode }: HelpModalProps) {
  const [selectedDoc, setSelectedDoc] = useState(HELP_DOCS[0]);
  const [docContent, setDocContent] = useState('');

  // 💡 실제 파일 내용을 읽어오는 로직 (Electron IPC 활용)
  React.useEffect(() => {
    if (isOpen && selectedDoc) {
      const api = (window as any).electronAPI;
      if (api && api.readFromPath) {
        api.readFromPath('docs/' + selectedDoc.path)
          .then((file: any) => setDocContent(file.content))
          .catch((err: any) => console.error('문서 로드 실패', err));
      }
    }
  }, [isOpen, selectedDoc]);


  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-5xl h-[80vh] flex flex-col rounded-xl shadow-2xl border ${isDarkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-black/5'}`}>
        {/* 헤더 */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-blue-500" />
            <h2 className="text-sm font-bold">사용 설명서</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 사이드바 */}
          <div className={`w-64 border-r overflow-y-auto p-3 space-y-1 ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
            {HELP_DOCS.map(doc => (
              <button
                key={doc.name}
                onClick={() => setSelectedDoc(doc)}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                  selectedDoc.name === doc.name
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {doc.title}
              </button>
            ))}
          </div>
          
          {/* 뷰어 */}
          <div className="flex-1 overflow-y-auto p-8">
            <MarkdownViewer content={docContent} originalContent={docContent} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
