// ====================================================================
// 📊 [OMD-UI-PhilosophySection-0026] PhilosophySection ➔ PhilosophySection
// 🎯 @KICK  : Onrivi Author의 핵심 설계 철학인 '생각은 Markdown으로, 사람은 문서로'를 시각화하고 개념도를 전달하는 섹션
// 🛡️ @GUARD : 반응형 플로우 단계 렌더링 및 모바일 가독성 가드
// 🚨 @PATCH : **2026-09-11** — PhilosophySection 문구를 실생활 친화적이고 직관적인 일상 언어(자유로운 기록, AI 문장 다듬기 등)로 전면 개편
//             **2026-09-11** — 랜딩페이지 섹션 교차(#FFFFFF / #EFEFFF) 배경 및 헤어라인 보더(#E2E4F6) 적용
//             **2026-09-11** — 랜딩페이지 서피스 배경 Primary #DCE1FF 및 헤어라인 보더(#C5CEF8) 적용
//             **2026-09-11** — Modern Technical Editorial 디자인 시스템 적용 (Cobalt #1d4ed8, Inter / Plus Jakarta Sans)
//             2026-09-03** — Onrivi Author Premium V2 랜딩페이지 개편: HOW IT WORKS 및 생각-AI-구조화-문서 파이프라인 시각화 신규 구현
// 🔗 @CALLS : motion.div, ArrowRight, Sparkles, FileText, Cpu, Layers, Users
// ====================================================================
"use client";

import { motion } from "framer-motion";
import { Sparkles, FileText, Layers, Users } from "lucide-react";

export function PhilosophySection() {
  const steps = [
    {
      step: "01",
      title: "자유로운 기록",
      subtitle: "서식 걱정 없는 타이핑",
      desc: "줄 맞춤이나 폰트 고민 없이, 머릿속에 떠오른 생각을 키보드로 편안하게 적어보세요.",
      icon: FileText,
      accent: false,
    },
    {
      step: "02",
      title: "AI 문장 다듬기",
      subtitle: "어색한 표현 바로잡기",
      desc: "거친 메모나 빠진 내용을 AI가 꼼꼼히 살피고 읽기 좋은 매끄러운 문장으로 다듬어 줍니다.",
      icon: Sparkles,
      accent: true,
    },
    {
      step: "03",
      title: "깔끔한 자동 정돈",
      subtitle: "한눈에 쏙 들어오는 구조",
      desc: "제목, 목록, 표, 체크리스트가 알아서 보기 좋게 정리되어 글의 흐름이 한눈에 보입니다.",
      icon: Layers,
      accent: false,
    },
    {
      step: "04",
      title: "완성된 예쁜 문서",
      subtitle: "PDF · 웹으로 바로 공유",
      desc: "회사 보고서나 팀 공유용으로 바로 건넬 수 있는 완성도 높은 문서로 즉시 출력됩니다.",
      icon: Users,
      accent: false,
    },
  ];

  return (
    <section
      id="philosophy"
      className="py-24 sm:py-32 bg-[#EFEFFF] dark:bg-[#15171A] border-y border-[#E2E4F6] dark:border-white/5 text-[#1A1A18] dark:text-[#E8ECE9]"
      style={{ fontFamily: "Pretendard, sans-serif" }}
    >
      <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-zinc-800 border border-[#E2E4F6] text-[11px] font-bold text-[#1A1A18] dark:text-zinc-200 tracking-wider uppercase mb-4 shadow-2xs">
            간편한 4단계 작성
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5 text-[#111413] dark:text-white">
            메모하듯 편하게 쓰면,<br className="hidden sm:inline" />
            <span className="text-[#1d4ed8]">단정한 문서로 완성됩니다.</span>
          </h2>
          <p className="text-[#2D3748] dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal">
            글 쓸 때 서식이나 줄 맞춤 때문에 스트레스받지 마세요.<br className="hidden sm:inline" />
            떠오르는 생각을 가볍게 적기만 하면, 보기 좋은 문서 디자인은 온리비가 알아서 정돈해 드립니다.
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
                    ? "border-[#1d4ed8] shadow-[0_8px_30px_rgba(29,78,216,0.14)]"
                    : "border-[#E2E4F6] dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20 shadow-xs"
                }`}
              >
                {/* Step Number */}
                <div className="flex items-center justify-between mb-5">
                  <span className={`text-xs font-mono font-extrabold tracking-wider ${item.accent ? "text-[#1d4ed8]" : "text-[#68716D] dark:text-zinc-500"}`}>
                    STEP {item.step}
                  </span>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.accent ? "bg-[#1d4ed8]/15 text-[#1d4ed8]" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"}`}>
                    <Icon size={18} />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#111413] dark:text-white mb-1 tracking-tight">
                  {item.title}
                </h3>
                <div className="text-xs font-semibold text-[#1d4ed8] mb-2.5">
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
