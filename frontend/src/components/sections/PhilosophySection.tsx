// ====================================================================
// 📊 [OMD-UI-PhilosophySection-0026] PhilosophySection ➔ PhilosophySection
// 🎯 @KICK  : Onrivi Author의 핵심 설계 철학인 '생각은 Markdown으로, 사람은 문서로'를 시각화하고 개념도를 전달하는 섹션
// 🛡️ @GUARD : 반응형 플로우 단계 렌더링 및 모바일 가독성 가드
// 🚨 @PATCH : **2026-09-03** — Onrivi Author Premium V2 랜딩페이지 개편: HOW IT WORKS 및 생각-AI-구조화-문서 파이프라인 시각화 신규 구현
// 🔗 @CALLS : motion.div, ArrowRight, Sparkles, FileText, Cpu, Layers, Users
// ====================================================================
"use client";

import { motion } from "framer-motion";
import { Sparkles, FileText, Layers, Users } from "lucide-react";

export function PhilosophySection() {
  const steps = [
    {
      step: "01",
      title: "Markdown",
      subtitle: "생각의 속도",
      desc: "단축키와 순수 텍스트로 머릿속 생각을 즉시 쏟아냅니다.",
      icon: FileText,
      accent: false,
    },
    {
      step: "02",
      title: "AI 어시스트",
      subtitle: "지능형 보강",
      desc: "문맥을 이해하고 누락된 요건과 표현을 정밀하게 제안합니다.",
      icon: Sparkles,
      accent: true,
    },
    {
      step: "03",
      title: "Structure",
      subtitle: "자동 구조화",
      desc: "헤딩, 목록, 표, 코드블록이 논리적 체계로 자동 정렬됩니다.",
      icon: Layers,
      accent: false,
    },
    {
      step: "04",
      title: "Document",
      subtitle: "출판급 조판",
      desc: "LDSG v5.0 서식이 입혀진 사람이 읽는 완결된 문서로 사출됩니다.",
      icon: Users,
      accent: false,
    },
  ];

  return (
    <section
      id="philosophy"
      className="py-24 sm:py-32 bg-[#F2F0EB] dark:bg-[#15171A] border-y border-[#E2DFD8] dark:border-white/5 text-[#1A1A18] dark:text-[#E8ECE9]"
      style={{ fontFamily: "Pretendard, LineSeed, sans-serif" }}
    >
      <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6E3DB] dark:bg-zinc-800 text-[11px] font-bold text-[#1A1A18] dark:text-zinc-200 tracking-wider uppercase mb-4">
            HOW IT WORKS
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5 text-[#111413] dark:text-white">
            생각은 Markdown으로.<br className="hidden sm:inline" />
            <span className="text-[#06C755]">완성은 읽는 이의 언어로.</span>
          </h2>
          <p className="text-[#68716D] dark:text-zinc-400 text-base sm:text-lg leading-relaxed font-normal">
            빠르게 쓰는 것과 잘 읽히는 문서는 하나일 수 있습니다.<br className="hidden sm:inline" />
            복잡한 서식 설정 없이 오직 글에만 집중하고, 결과물은 전문가의 조판물처럼 세상과 나눕니다.
          </p>
        </div>

        {/* Pipeline Diagram Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`relative p-6 sm:p-7 rounded-2xl border transition-all duration-300 bg-white dark:bg-[#1A1D22] ${
                  item.accent
                    ? "border-[#06C755]/60 shadow-[0_8px_30px_rgba(6,199,85,0.09)]"
                    : "border-[#E0DED7] dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20 shadow-2xs"
                }`}
              >
                {/* Step Number */}
                <div className="flex items-center justify-between mb-5">
                  <span className={`text-xs font-mono font-extrabold tracking-wider ${item.accent ? "text-[#06C755]" : "text-[#68716D] dark:text-zinc-500"}`}>
                    PHASE {item.step}
                  </span>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.accent ? "bg-[#06C755]/15 text-[#06C755]" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"}`}>
                    <Icon size={18} />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#111413] dark:text-white mb-1 tracking-tight">
                  {item.title}
                </h3>
                <div className="text-xs font-semibold text-[#06C755] mb-2.5">
                  {item.subtitle}
                </div>
                <p className="text-xs sm:text-[13px] text-[#68716D] dark:text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
