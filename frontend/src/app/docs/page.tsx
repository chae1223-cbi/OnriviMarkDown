"use client";

// ====================================================================
// 📊 [OMD-CORE-docs-page-0001] page ➔ HelpCenterPage
// 🎯 @KICK  : 도움말 센터 화면 - Onrivi Author 소개, 마크다운 문법, 단축키, 세션 연동 해제 방법 안내
// 🛡️ @GUARD : Client Component로 전환하여 마크다운 동적 렌더링 적용
// 🚨 @PATCH : **2026-07-06** — 도움말 센터를 HelpModal과 동일한 마크다운 동적 렌더링 2-Pane 구조로 전면 개편 패치
//             **2026-06-21** — 도움말 폴더 내의 실물 사용 설명서 및 상세 기능 명세서 내용을 심층 이식하여 전문 사용자 매뉴얼 페이지로 전면 개편 패치
// 🔗 @CALLS : Navbar, Footer, MarkdownViewer
// ====================================================================
import React, { useEffect, useState, MouseEvent } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookOpen, ChevronRight } from "lucide-react";
import MarkdownViewer from '@/components/MarkdownViewer';
import { stripFrontmatter } from "@/lib/editorUtils";

// 💡 하드코딩된 도움말 파일 목록
const HELP_DOCS_LIST = [
  "00_시작하기.md",
  "01_마크다운에디트란.md",
  "02_에디터-기본.md",
  "03_파일-관리.md",
  "04_미리보기-모드.md",
  "05_서식-정의.md",
  "06_내보내기.md",
  "07_표-체크리스트.md",
  "08_다이어그램-수식.md",
  "09_슬래시-명령어.md",
  "10_한글-입력.md",
  "11_미디어-삽입.md",
  "12_내보내기-고급.md",
  "13_설정.md"
];

// 파일명 추출
const formatDocTitle = (filename: string) => {
  return filename.replace(/^\d+_/, '').replace(/\.md$/, '').replace(/-/g, ' ');
};

export default function HelpCenterPage() {
  const [mounted, setMounted] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<string>(HELP_DOCS_LIST[0]);
  const [docContent, setDocContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 문서 로딩
  useEffect(() => {
    let isMounted = true;
    const fetchDoc = async () => {
      setIsLoading(true);
      let rawMd = '';
      
      try {
        const res = await fetch(`/help/${currentDoc}`);
        if (!res.ok) throw new Error('Not found');
        rawMd = await res.text();
      } catch (e) {
        rawMd = '## 문서를 불러올 수 없습니다.\n\n해당 도움말 파일을 찾을 수 없습니다.';
      }

      if (isMounted) {
        setDocContent(stripFrontmatter(rawMd));
        setIsLoading(false);
      }
    };

    fetchDoc();
    return () => { isMounted = false; };
  }, [currentDoc]);

  // 내부 링크 클릭 인터셉트
  const handleLinkClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    // 상대 경로 마크다운 링크인 경우
    if (href.endsWith('.md') && !href.startsWith('http')) {
      e.preventDefault();
      // 파일명만 추출
      const filename = href.split('/').pop();
      if (filename && HELP_DOCS_LIST.includes(filename)) {
        setCurrentDoc(filename);
      }
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 transition-colors duration-200">
      <Navbar />

      <main className="flex-grow pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* 히어로 헤더 */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full border border-indigo-100/50 dark:border-indigo-900/30">
              Onrivi Help Center
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mt-4 tracking-tight leading-tight">
              Onrivi Author 사용 설명서
            </h1>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
              Onrivi Author의 마크다운 문법부터 미디어 삽입, 핵심 파싱 엔진 명세 및 트러블슈팅까지 상세 가이드를 제공합니다.
            </p>
          </div>

          {/* 2-Pane 레이아웃 */}
          <div className="flex flex-col md:flex-row bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xs overflow-hidden min-h-[700px]">
            
            {/* 좌측 사이드바 네비게이션 */}
            <aside className="w-full md:w-64 lg:w-72 border-b md:border-b-0 md:border-r border-gray-150 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 shrink-0 p-4 flex flex-col gap-1">
              <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 px-2">설명서 목차</h3>
              {HELP_DOCS_LIST.map((doc) => {
                const isSelected = currentDoc === doc;
                return (
                  <button
                    key={doc}
                    onClick={() => setCurrentDoc(doc)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isSelected 
                        ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <BookOpen className={`w-4 h-4 ${isSelected ? 'text-indigo-500' : 'text-gray-400'}`} />
                      <span className="truncate">{formatDocTitle(doc)}</span>
                    </div>
                    {isSelected && <ChevronRight size={16} className="text-indigo-500 opacity-70 shrink-0" />}
                  </button>
                );
              })}
            </aside>

            {/* 우측 본문 마크다운 뷰어 */}
            <div 
              className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto"
              onClick={handleLinkClick}
            >
              {isLoading ? (
                <div className="animate-pulse flex flex-col gap-4 max-w-3xl">
                  <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/6"></div>
                </div>
              ) : (
                <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
                  <MarkdownViewer 
                    content={docContent || "도움말 내용이 없습니다."}
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
