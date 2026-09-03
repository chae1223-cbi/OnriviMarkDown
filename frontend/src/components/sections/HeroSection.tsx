// ====================================================================
// 📊 [OMD-UI-HeroSection-0022] HeroSection ➔ HeroSection
// 🎯 @KICK  : Onrivi Author Premium V2의 압도적 타이포그래피 가치 제안 및 제품 실제 UI(에디터 타건 + AI 어시스트 + 출판급 문서 뷰)를 전면에 선보이는 핵심 히어로 영역
// 🛡️ @GUARD : Framer Motion 모션 버벅임 억제 및 반응형 뷰포트 레이아웃 가드
// 🚨 @PATCH : **2026-09-03** — Onrivi Author Premium V2 개편: 웜 페이퍼 크림(#F9F8F6) 베이스 및 멀티미디어 비주얼 쇼케이스(Mermaid 파이프라인 그래프 + KaTeX 정밀 수식 렌더링 + 컬러풀 LDSG 성능 표) 탑재, 대형 타이포그래피(font-size clamp 44~76px) 및 LINE Green(#06C755) 단일 악센트 적용
//             **2026-06-22** — Luminous Arctic 디자인 시스템 라이트모드 적용 패치 (프리즘 배경, 글래스 프리뷰 카드, Ice Blue 그래디언트)
//             **2026-06-21** — OMDLanding UI 디자인 이식 및 /login 리다이렉트 변경 패치
// 🔗 @CALLS : motion.div, Link
// ====================================================================
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

export function HeroSection() {
  return (
    <section
      className="pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden relative bg-[#F9F8F6] dark:bg-[#121314] text-[#1A1A18] dark:text-[#E8ECE9]"
      style={{ fontFamily: "Pretendard, LineSeed, sans-serif" }}
    >
      {/* Subtle Top Ambient Glow (LINE Green on Warm Base) */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[380px] bg-[radial-gradient(ellipse_at_top,rgba(6,199,85,0.09)_0%,transparent_70%)] pointer-events-none z-0"
      />

      <div className="max-w-[1240px] mx-auto px-6 lg:px-10 relative z-10">
        {/* Top Tag */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F0EFEA] dark:bg-zinc-800/80 border border-[#E3E1DB] dark:border-white/10 text-xs font-semibold text-[#1A1A18] dark:text-zinc-200 tracking-tight shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#06C755]" />
            AI-NATIVE DOCUMENT PLATFORM
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="text-center tracking-tight font-extrabold text-[#111413] dark:text-white mb-6"
          style={{
            fontSize: "clamp(44px, 5.8vw, 76px)",
            lineHeight: 1.08,
            letterSpacing: "-0.045em",
          }}
        >
          AI는 마크다운으로,<br />
          <span className="text-[#06C755]">사람은 문서로.</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="text-center mx-auto mb-10 max-w-2xl text-[#68716D] dark:text-zinc-400 font-normal leading-relaxed text-[17px] sm:text-[19px] tracking-tight"
        >
          생각은 Markdown으로 빠르게. 결과물은 사람이 읽는 아름다운 문서처럼.<br className="hidden sm:inline" />
          타이핑의 즉시성과 출판 규격의 조판 품질을 하나의 화면에서 완성합니다.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16 sm:mb-20"
        >
          <Link href="/signup" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#06C755] hover:bg-[#05B04B] text-white font-bold text-[15px] shadow-[0_4px_24px_rgba(6,199,85,0.28)] hover:shadow-[0_6px_28px_rgba(6,199,85,0.4)] transition-all transform hover:-translate-y-0.5">
              무료로 시작하기
              <ArrowRight size={16} />
            </button>
          </Link>
          <a href="#philosophy" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-[#E0DED7] dark:border-white/15 bg-white dark:bg-zinc-900/50 hover:bg-[#F2F0EB] dark:hover:bg-zinc-800 text-[#1A1A18] dark:text-zinc-200 font-semibold text-[15px] transition-all shadow-2xs">
              제품 살펴보기
            </button>
          </a>
        </motion.div>

        {/* Real Product UI Mockup (Hero Highlight) */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative max-w-[1100px] mx-auto rounded-2xl border border-[#E0DED7] dark:border-white/10 bg-white dark:bg-[#17191E] shadow-[0_24px_70px_-15px_rgba(40,35,25,0.08)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          {/* Window Chrome */}
          <div className="bg-[#F4F2EC] dark:bg-[#131519] border-b border-[#E0DED7] dark:border-white/10 px-4 py-3 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block border" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block border" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block border" />
              <span className="ml-3 text-xs font-medium text-[#68716D] dark:text-zinc-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-[#06C755] inline-block shadow-[0_0_8px_rgba(6,199,85,0.6)]" />
                knowledge-engine-spec.md
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#68716D] dark:text-zinc-400">
              <span className="hidden sm:inline-flex items-center gap-1.5 bg-[#06C755]/10 text-[#06C755] font-bold px-2.5 py-1 rounded-md border border-[#06C755]/25">
                <Sparkles size={12} /> Mermaid + KaTeX Active
              </span>
              <span className="bg-zinc-200/80 dark:bg-zinc-800 text-[#1A1A18] dark:text-zinc-200 font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                LIVE SPLIT
              </span>
            </div>
          </div>

          {/* Dual Split Editor Body */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#E0DED7] dark:divide-white/10 text-left">
            {/* Left: Raw Markdown Editor Pane */}
            <div className="p-6 md:p-8 bg-[#FBF9F5] dark:bg-[#14161B] font-mono text-[12px] sm:text-[13px] leading-relaxed text-[#1A1A18] dark:text-zinc-200 overflow-x-auto">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-200/80 dark:border-white/5 text-[11px] text-[#68716D] uppercase tracking-wider font-semibold">
                <span>EDITOR · MARKDOWN SOURCE</span>
                <span className="text-[#06C755] font-bold">UTF-8</span>
              </div>

              <div className="space-y-3 font-mono">
                <p className="text-blue-600 dark:text-blue-400 font-bold"># 차세대 지식 엔진 아키텍처</p>
                <p className="text-emerald-700 dark:text-emerald-400 font-semibold">## 1. 지식 사출 파이프라인 (Mermaid)</p>
                
                {/* Mermaid Code Snippet */}
                <div className="p-3 rounded-lg bg-zinc-900 text-zinc-200 text-[11px] font-mono leading-tight space-y-1">
                  <span className="text-zinc-500">```mermaid</span>
                  <p className="text-[#06C755]">graph LR</p>
                  <p className="pl-3 text-zinc-300">A[원시 마크다운] --&gt; B(AST 파서)</p>
                  <p className="pl-3 text-amber-300">B --&gt; C&#123;AI 첨삭 엔진&#125;</p>
                  <p className="pl-3 text-[#06C755]">C --&gt;|무결점 검증| D[LDSG 출판 조판]</p>
                  <span className="text-zinc-500">```</span>
                </div>

                <p className="text-emerald-700 dark:text-emerald-400 font-semibold pt-1">## 2. 조판 최적화 목적함수 (KaTeX)</p>
                <p className="text-purple-600 dark:text-purple-400 bg-purple-500/10 p-2 rounded border border-purple-500/20 text-xs">
                  {"$$ \\mathcal{L}_{\\text{total}} = \\alpha \\mathcal{L}_{\\text{doc}} + \\beta \\sum_{i=1}^{n} \\frac{\\exp(z_i)}{\\sum_j \\exp(z_j)} $$"}
                </p>

                <p className="text-emerald-700 dark:text-emerald-400 font-semibold pt-1">## 3. 렌더링 파이프라인 성능</p>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-tight">
                  | 파이프라인 | 렌더링 포맷 | 지연율 | 규격 |<br />
                  |---|---|---|---|<br />
                  | Mermaid Graph | Vector SVG | 0.04s | LDSG v5.0 |<br />
                  | KaTeX Math | MathML HTML | 0.01s | LaTeX AMS |<br />
                  | Print Styler | 출판용 인쇄본 | 0.08s | A4 Strict |
                </p>
              </div>
            </div>

            {/* Right: Rendered Document View (Multimedia Showcase) */}
            <div className="p-6 md:p-8 bg-white dark:bg-[#17191E] text-left space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-white/5 text-[11px] text-[#68716D] uppercase tracking-wider font-semibold">
                <span>PREVIEW · 출판급 멀티미디어 조판</span>
                <span className="inline-flex items-center gap-1 text-[#06C755] font-bold">
                  <CheckCircle2 size={12} /> LDSG v5.0
                </span>
              </div>

              {/* Document Header */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-[#06C755]/15 text-[#06C755] uppercase tracking-wider">
                    SPECIFICATION
                  </span>
                  <span className="text-xs text-[#68716D] dark:text-zinc-400">
                    Onrivi Knowledge Engine v3.4
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#111413] dark:text-white tracking-tight">
                  차세대 지식 엔진 아키텍처
                </h2>
              </div>

              {/* 1. Visual Mermaid Flowchart Mockup */}
              <div className="rounded-xl border border-[#E0DED7] dark:border-white/10 bg-[#FAF9F6] dark:bg-[#14161A] p-3.5 sm:p-4">
                <div className="text-[10px] font-bold text-[#68716D] uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>✦ MERMAID PIPELINE GRAPH</span>
                  <span className="text-[#06C755] font-mono">VECTOR SVG</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold">
                  <div className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 shadow-2xs">
                    📄 원시 마크다운
                  </div>
                  <span className="text-zinc-400 font-bold">→</span>
                  <div className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 shadow-2xs">
                    ⚡ AST 파서
                  </div>
                  <span className="text-zinc-400 font-bold">→</span>
                  <div className="px-2.5 py-1.5 rounded-lg bg-[#06C755]/15 text-[#06C755] border border-[#06C755]/40 font-bold shadow-xs flex items-center gap-1">
                    <Sparkles size={11} /> AI 첨삭 엔진
                  </div>
                  <span className="text-zinc-400 font-bold">→</span>
                  <div className="px-2.5 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold shadow-2xs">
                    📚 출판본 사출
                  </div>
                </div>
              </div>

              {/* 2. Visual KaTeX Math Formula Block */}
              <div className="rounded-xl border border-purple-200/80 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 p-3.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-1.5">
                  <span>✦ KATEX MATH RENDERING</span>
                  <span className="bg-purple-200/60 dark:bg-purple-900/60 px-2 py-0.5 rounded text-[10px]">O(N log N)</span>
                </div>
                <div className="font-serif text-center py-1 text-sm sm:text-base text-zinc-900 dark:text-zinc-100 font-medium tracking-wide">
                  <i>L</i><sub>total</sub> = &alpha; <i>L</i><sub>doc</sub> + &beta; &sum;<sub>i=1</sub><sup>n</sup> &nbsp;<span className="inline-block text-center align-middle"><span className="border-b border-zinc-700 dark:border-zinc-300 block text-xs">exp(<i>z</i><sub>i</sub>)</span><span className="block text-xs">&sum;<sub>j</sub> exp(<i>z</i><sub>j</sub>)</span></span>
                </div>
              </div>

              {/* 3. Visual Colorful LDSG Table */}
              <div className="rounded-xl border border-[#E0DED7] dark:border-white/10 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#F4F2EC] dark:bg-zinc-800 text-[#111413] dark:text-zinc-200 font-bold text-[11px]">
                    <tr>
                      <th className="p-2.5 border-b border-[#E0DED7] dark:border-white/10">파이프라인</th>
                      <th className="p-2.5 border-b border-[#E0DED7] dark:border-white/10">포맷</th>
                      <th className="p-2.5 border-b border-[#E0DED7] dark:border-white/10">지연율</th>
                      <th className="p-2.5 border-b border-[#E0DED7] dark:border-white/10">규격</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0DED7] dark:divide-white/10 text-zinc-600 dark:text-zinc-300 text-[11px]">
                    <tr>
                      <td className="p-2.5 font-semibold text-[#111413] dark:text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#06C755]" />
                        Mermaid Graph
                      </td>
                      <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">SVG</span></td>
                      <td className="p-2.5 font-mono text-[#06C755] font-bold">0.04s</td>
                      <td className="p-2.5 font-medium">LDSG v5.0</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-[#111413] dark:text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        KaTeX Math
                      </td>
                      <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold text-[10px]">MathML</span></td>
                      <td className="p-2.5 font-mono text-[#06C755] font-bold">0.01s</td>
                      <td className="p-2.5 font-medium">LaTeX AMS</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-[#111413] dark:text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Print Styler
                      </td>
                      <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-[10px]">A4/PDF</span></td>
                      <td className="p-2.5 font-mono text-[#06C755] font-bold">0.08s</td>
                      <td className="p-2.5 font-medium">A4 Strict</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
