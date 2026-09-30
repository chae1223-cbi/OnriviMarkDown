// ====================================================================
// 📊 [OMD-UI-WorkflowSection-0001] WorkflowSection ➔ WorkflowSection
// 🎯 @KICK  : Onrivi Author 5단계 Workflow 인포그래픽 — INPUT SOURCE → AI PROCESSING → STRUCTURED CONTENT → ONRIVI AUTHOR → DOCUMENT
// 🛡️ @GUARD : 반응형 스크롤/그리드 지원 및 절차명과 매체명 동시 표기
// 🚨 @PATCH : **2026-09-30** — [랜딩 개편 Workflow 5단계 섹션 신규 구현]:
//             1. 제목: "아이디어에서 완성된 문서까지"
//             2. 설명: "다양한 소스의 정보를 AI와 Markdown을 거쳐 하나의 완성된 문서로 연결합니다."
//             3. 5단계 파이프라인(INPUT SOURCE -> AI PROCESSING -> STRUCTURED CONTENT -> ONRIVI AUTHOR -> DOCUMENT) 시각화
// 🔗 @CALLS : motion.div, FileText, Cpu, Code2, Layout, BookOpen, ArrowRight
// ====================================================================
"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileInput, Cpu, FileCode2, Layout, FileCheck, ArrowRight, ArrowDown } from "lucide-react";

interface WorkflowStep {
  step: string;
  title: string;
  desc: string;
  items: string[];
  icon: any;
  color: string;
  bg: string;
  border: string;
}

const STEPS: WorkflowStep[] = [
  {
    step: "01",
    title: "INPUT SOURCE",
    desc: "다양한 소스 수집",
    items: ["AI 생성 내용", "메모 / 아이디어", "웹 문서 / 자료", "Excel / CSV", "PDF / 기존 문서"],
    icon: FileInput,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-800",
  },
  {
    step: "02",
    title: "AI PROCESSING",
    desc: "지능형 분석 및 전처리",
    items: ["핵심 내용 분석", "문맥 논리 구조화", "체계적 초안 생성"],
    icon: Cpu,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/40",
    border: "border-teal-200 dark:border-teal-800",
  },
  {
    step: "03",
    title: "STRUCTURED CONTENT",
    desc: "표준 마크다운 변환",
    items: ["Markdown 서식", "Heading (H1~H6)", "List & Checklist", "Table & Grid", "Image Asset"],
    icon: FileCode2,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    border: "border-indigo-200 dark:border-indigo-800",
  },
  {
    step: "04",
    title: "ONRIVI AUTHOR",
    desc: "실시간 조판 및 완성",
    items: ["Focus Edit 모드", "Split View 듀얼 싱크", "Live A4 Preview", "CSS Profile 스타일링"],
    icon: Layout,
    color: "text-[#1d4ed8] dark:text-blue-300",
    bg: "bg-blue-100/60 dark:bg-blue-900/30",
    border: "border-[#1d4ed8] dark:border-blue-500",
  },
  {
    step: "05",
    title: "DOCUMENT",
    desc: "전문 출판 규격 사출",
    items: ["고품질 PDF 출력", "전자책 EPUB 사출", "A4 용지 규격 인쇄", "로컬 영구 소장"],
    icon: FileCheck,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
  },
];

export function WorkflowSection() {
  return (
    <section
      id="workflow"
      className="py-24 sm:py-32 bg-[#FFFFFF] dark:bg-[#0A0D14] text-[#0F172A] dark:text-[#E8ECE9] border-b border-[#E2E4F6] dark:border-white/5 relative"
      style={{ fontFamily: "Pretendard, sans-serif" }}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-zinc-800 border border-blue-100 dark:border-white/10 text-[11px] font-bold text-[#1d4ed8] dark:text-blue-400 tracking-wider uppercase mb-4 shadow-2xs">
            WORKFLOW PIPELINE
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-[#0F172A] dark:text-white">
            아이디어에서 완성된 문서까지
          </h2>
          <p className="text-base sm:text-lg text-[#475569] dark:text-zinc-300 font-normal leading-relaxed">
            다양한 소스의 정보를 AI와 Markdown을 거쳐<br className="hidden sm:inline" /> 하나의 완성된 전문 문서로 연결합니다.
          </p>
        </div>

        {/* 5-Step Pipeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 relative">
          {STEPS.map((s, idx) => {
            const IconComp = s.icon;
            const isHighlight = s.step === "04";

            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`relative rounded-2xl p-5 border flex flex-col justify-between transition-all duration-200 group ${s.bg} ${s.border} ${
                  isHighlight 
                    ? "ring-2 ring-[#1d4ed8] shadow-md dark:shadow-[0_0_20px_rgba(29,78,216,0.3)]" 
                    : "hover:shadow-xs hover:border-zinc-400 dark:hover:border-zinc-600"
                }`}
              >
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300">
                      STEP {s.step}
                    </span>
                    <IconComp className={`w-5 h-5 ${s.color}`} />
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white tracking-tight">
                      {s.title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium mt-0.5">
                      {s.desc}
                    </p>
                  </div>
                </div>

                {/* Items List */}
                <div className="mt-5 pt-4 border-t border-zinc-200/80 dark:border-white/10 space-y-2">
                  {s.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-[#334155] dark:text-zinc-300 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Arrow Connector for Desktop (Steps 1 to 4) */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 items-center justify-center shadow-xs text-zinc-400">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Flow Summary Caption */}
        <div className="mt-12 text-center text-xs sm:text-sm font-semibold text-[#64748B] dark:text-zinc-400 flex flex-wrap items-center justify-center gap-2">
          <span>입력 (Input)</span>
          <span>→</span>
          <span>처리 (AI Processing)</span>
          <span>→</span>
          <span>전달 (Markdown)</span>
          <span>→</span>
          <span className="text-[#1d4ed8] font-bold">작성 (Onrivi Author)</span>
          <span>→</span>
          <span className="text-emerald-600 font-bold">출력 (Document)</span>
        </div>
      </div>
    </section>
  );
}
