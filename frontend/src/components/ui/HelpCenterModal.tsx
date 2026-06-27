// ====================================================================
// 📊 [OMD-UI-HelpCenterModal-0002] HelpCenterModal ➔ HelpCenterModal
// 🎯 @KICK  : 온리비 어서 도움말 문서를 아코디언 메뉴와 함께 딤드 배경 모달 형식으로 노출하고 markdown 실시간 렌더링 지원
// 🛡️ @GUARD : 모달 비활성 상태(open이 false)일 때 로딩 방지; 네트워크 에러 시 오류 메시지 표시 처리
// 🚨 @PATCH : **2026-06-21** — OMDLanding UI 디자인 이식에 따른 신규 컴포넌트 생성 패치
// 🔗 @CALLS : loadArticle, stripFrontmatter, mdToHtml
// ====================================================================
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Loader2, Book } from "lucide-react";

const articles = [
  { id: "00_시작하기", file: "00_시작하기.md", title: "시작하기" },
  { id: "01_마크다운에디트란", file: "01_마크다운에디트란.md", title: "마크다운의 정의와 문법" },
  { id: "02_에디터-기본", file: "02_에디터-기본.md", title: "에디터 기본 사용법" },
  { id: "03_파일-관리", file: "03_파일-관리.md", title: "파일 관리" },
  { id: "04_미리보기-모드", file: "04_미리보기-모드.md", title: "미리보기 모드" },
  { id: "05_서식-정의", file: "05_서식-정의.md", title: "서식 정의" },
  { id: "06_내보내기", file: "06_내보내기.md", title: "내보내기" },
  { id: "07_표-체크리스트", file: "07_표-체크리스트.md", title: "표 및 체크리스트" },
  { id: "08_다이어그램-수식", file: "08_다이어그램-수식.md", title: "다이어그램 및 수식" },
  { id: "09_슬래시-명령어", file: "09_슬래시-명령어.md", title: "슬래시 명령어 및 단축키" },
  { id: "10_한글-입력", file: "10_한글-입력.md", title: "한글 입력" },
  { id: "11_미디어-삽입", file: "11_미디어-삽입.md", title: "미디어 삽입" },
  { id: "12_내보내기-고급", file: "12_내보내기-고급.md", title: "내보내기 고급" },
  { id: "13_설정", file: "13_설정.md", title: "설정" },
];

function stripFrontmatter(md: string): string {
  return md.replace(/^---[\s\S]*?---\n*/, "");
}

function mdToHtml(md: string): string {
  let html = md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^---$/gm, "<hr />")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^\- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```\w*\n?/, "").replace(/```$/, "");
      return `<pre><code>${code}</code></pre>`;
    })
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(.+)$/gm, (m) => {
      if (m.startsWith("<h") || m.startsWith("<ul") || m.startsWith("<li") || m.startsWith("<pre") || m.startsWith("<blockquote") || m.startsWith("<hr") || m.startsWith("</p>") || m.startsWith("<p>") || m === "") return m;
      if (!m.startsWith("<")) return m;
      return m;
    });

  html = `<p>${html}</p>`;
  html = html.replace(/<p><\/p>/g, "");
  html = html.replace(/<\/ul>\s*<ul>/g, "");
  return html;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function HelpCenterModal({ open, onClose }: Props) {
  const [selected, setSelected] = useState(articles[0]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    loadArticle(selected);
  }, [selected, open]);

  async function loadArticle(article: typeof articles[0]) {
    setLoading(true);
    try {
      const res = await fetch(`/help/${article.file}`);
      const text = await res.text();
      setContent(stripFrontmatter(text));
    } catch {
      setContent("내용을 불러올 수 없습니다.");
    }
    setLoading(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-gray-950 rounded-2xl shadow-2xl flex overflow-hidden border border-gray-200 dark:border-gray-800"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="w-64 flex-shrink-0 bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto">
              <div className="flex items-center gap-2 mb-6 pt-2">
                <Book className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-gray-900 dark:text-white">도움말</span>
              </div>
              <nav className="space-y-1">
                {articles.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 ${
                      selected.id === a.id
                        ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <ChevronRight className={`w-3 h-3 flex-shrink-0 ${selected.id === a.id ? "text-indigo-500" : "text-transparent"}`} />
                    {a.title}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{selected.title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  </div>
                ) : (
                  <div
                    className="prose prose-gray dark:prose-invert max-w-none text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: mdToHtml(content) }}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
