// ====================================================================
// 📊 [OMD-UI-ExperienceSection-0027] ExperienceSection ➔ ExperienceSection
// 🎯 @KICK  : Onrivi Author의 3대 핵심 경험(WRITE, REFINE, PUBLISH)을 실제 제품 UI 목업과 함께 단계별로 몰입감 있게 선보이는 피처 섹션
// 🛡️ @GUARD : 탭 상태 스위칭 및 반응형 카드 UI 오버플로우 방지
// 🚨 @PATCH : **2026-09-03** — Onrivi Author Premium V2 랜딩페이지 개편: 기존 6개 분절 카드 제거 및 WRITE/REFINE/PUBLISH 3단계 제품 스토리텔링 뷰 신규 구축
// 🔗 @CALLS : motion.div, useState, Check, Sparkles
// ====================================================================
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

export function ExperienceSection() {
  const [activeTab, setActiveTab] = useState<"write" | "refine" | "publish">("write");

  const experiences = [
    {
      id: "write",
      tabNumber: "01",
      tabTitle: "WRITE",
      tag: "생각의 속도",
      heading: "생각의 속도를 문서에 그대로.",
      subheading: "Markdown으로 빠르게 작성하고 구조를 잃지 않습니다.",
      desc: "단축키 기반의 헤딩 생성, 순서 있는 목록, 체크리스트, 코드 블록을 손가락이 키보드를 떠나지 않고 막힘없이 써 내려갑니다. 마우스로 서식을 찾느라 영감을 놓치는 일이 없습니다.",
      bullets: [
        "지연 없는 실시간 Monaco 엔진 기반 타이핑",
        "키보드 단축키로 헤딩, 인용, 표 원터치 생성",
        "로컬 파일 시스템 1:1 직결 및 폴더 탐색기",
      ],
    },
    {
      id: "refine",
      tabNumber: "02",
      tabTitle: "REFINE",
      tag: "지능형 문맥 첨삭",
      heading: "AI는 대신 쓰지 않습니다. 더 잘 쓰도록 돕습니다.",
      subheading: "작성자의 의도를 존중하며 문장과 논리를 정교하게 다듬습니다.",
      desc: "원고의 주도권은 언제나 당신에게 있습니다. AI는 문단의 맥락을 파악하여 누락된 요건을 짚어주고, 비문 교정 및 명료한 문체로 재구성하는 최고의 페어 에디터가 되어 줍니다.",
      bullets: [
        "문맥을 반영한 인라인 실시간 Suggestion",
        "원클릭 톤앤매너 전환 (전문 보고서/기획서/기술문서)",
        "독립 모달 없는 부드러운 인라인 어시스턴스",
      ],
    },
    {
      id: "publish",
      tabNumber: "03",
      tabTitle: "PUBLISH",
      tag: "출판급 문서 완성",
      heading: "Markdown으로 시작해서 사람이 읽는 문서로 끝납니다.",
      subheading: "디자이너가 만진 듯한 완벽한 레이아웃과 서식을 원클릭으로.",
      desc: "마크다운의 날것 그대로 두지 마세요. LDSG v5.0 기준의 여백, 타이포그래피, 콜아웃, 인터랙티브 표가 자동으로 조판되어 PDF, 인쇄본, 웹 문서로 즉시 배포됩니다.",
      bullets: [
        "Safe Zone과 Scroll Clamp가 보장된 정밀 렌더링",
        "단 한 줄의 전역 CSS 오염 없는 무결점 격리",
        "PDF, HTML, 인쇄 규격 무결점 원클릭 사출",
      ],
    },
  ] as const;

  const currentExp = experiences.find((e) => e.id === activeTab) || experiences[0];

  return (
    <section
      id="experience"
      className="py-24 sm:py-32 bg-[#F9F8F6] dark:bg-[#121314] text-[#1A1A18] dark:text-[#E8ECE9] relative overflow-hidden"
      style={{ fontFamily: "Pretendard, LineSeed, sans-serif" }}
    >
      <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE8E1] dark:bg-zinc-800 text-[11px] font-bold text-[#1A1A18] dark:text-zinc-200 tracking-wider uppercase mb-4">
            EXPERIENCE
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-[#111413] dark:text-white">
            하나의 Author,<br />
            모든 문서의 시작점.
          </h2>
          <p className="text-[#68716D] dark:text-zinc-400 text-base sm:text-lg">
            작성(Write), 다듬기(Refine), 조판(Publish)의 전 과정을 끊김 없이 잇는 워크플로우.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex justify-center mb-12 sm:mb-16">
          <div className="inline-flex p-1.5 rounded-2xl bg-[#EAE8E1] dark:bg-[#1A1D22] border border-[#DDD9D0] dark:border-white/10 max-w-full overflow-x-auto shadow-2xs">
            {experiences.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-white dark:bg-zinc-800 text-[#111413] dark:text-white shadow-xs border border-[#DDD9D0] dark:border-white/10"
                      : "text-[#68716D] dark:text-zinc-400 hover:text-[#111413] dark:hover:text-white"
                  }`}
                >
                  <span className={`font-mono text-[11px] ${isActive ? "text-[#06C755]" : "opacity-60"}`}>
                    {tab.tabNumber}
                  </span>
                  <span>{tab.tabTitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Stage Experience Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center rounded-3xl border border-[#DDD9D0] dark:border-white/10 bg-[#F2F0EB] dark:bg-[#16181D] p-6 sm:p-10 lg:p-12 shadow-xs"
          >
            {/* Left Description Column */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06C755]/10 text-[#06C755] text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06C755]" />
                {currentExp.tag}
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111413] dark:text-white leading-snug">
                {currentExp.heading}
              </h3>

              <p className="text-base text-[#111413] dark:text-zinc-200 font-semibold">
                {currentExp.subheading}
              </p>

              <p className="text-sm text-[#68716D] dark:text-zinc-400 leading-relaxed">
                {currentExp.desc}
              </p>

              <div className="space-y-2.5 pt-2">
                {currentExp.bullets.map((b, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs sm:text-[13px] text-[#111413] dark:text-zinc-300 font-medium">
                    <div className="w-4 h-4 rounded-full bg-[#06C755]/15 text-[#06C755] flex items-center justify-center shrink-0">
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right UI Visual Column */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-[#DDD9D0] dark:border-white/10 bg-white dark:bg-[#1C1F26] shadow-md overflow-hidden text-left">
                {/* Visual Header Chrome */}
                <div className="bg-[#F4F2EC] dark:bg-[#131519] border-b border-[#DDD9D0] dark:border-white/10 px-4 py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700 inline-block" />
                    <span className="ml-2 font-mono text-zinc-500 text-[11px]">
                      {activeTab === "write" && "feature-spec.md — WRITE"}
                      {activeTab === "refine" && "refine-assistant.ai — REFINE"}
                      {activeTab === "publish" && "document-output.pdf — PUBLISH"}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#06C755]">
                    {activeTab.toUpperCase()} MODE
                  </span>
                </div>

                {/* Tab Specific UI Mockups */}
                {activeTab === "write" && (
                  <div className="p-6 sm:p-8 font-mono text-[13px] leading-relaxed bg-zinc-50/40 dark:bg-[#14161B] space-y-3">
                    <p className="text-blue-600 dark:text-blue-400 font-bold"># 프로젝트 기획서</p>
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold">## 문제 정의</p>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      문서 저작 도구의 서식 설정 피로도로 인해 집필자의 몰입이 중단되는 문제를 해결합니다.
                    </p>
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold pt-1">## 해결 방법</p>
                    <ul className="space-y-1 text-zinc-600 dark:text-zinc-300 pl-4 border-l-2 border-zinc-200 dark:border-zinc-800">
                      <li>- <strong className="text-[#06C755]">빠른 작성:</strong> 마크다운 키보드 네비게이션</li>
                      <li>- <strong className="text-[#06C755]">명확한 구조:</strong> 헤딩 및 목록 실시간 정렬</li>
                      <li>- <strong className="text-[#06C755]">쉬운 공유:</strong> 단일 신뢰 소스(SSoT) 출력</li>
                    </ul>
                    <div className="inline-block w-2 h-4 bg-[#06C755] animate-pulse align-middle ml-1" />
                  </div>
                )}

                {activeTab === "refine" && (
                  <div className="p-6 sm:p-8 font-sans text-sm space-y-4 bg-white dark:bg-[#1C1F26]">
                    <div className="text-zinc-500 text-xs">작성 중인 본문 문장:</div>
                    <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed">
                      &quot;사용자가 문서를 작성할 때 이런저런 기능이 많으면 헷갈릴 수 있어서 필요한 정보만 바로 찾을 수 있도록 만들어야 합니다.&quot;
                    </div>

                    {/* AI Suggestion Tooltip */}
                    <div className="p-4 rounded-xl bg-[#06C755]/10 border border-[#06C755]/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#06C755]">
                        <span className="flex items-center gap-1.5">
                          <Sparkles size={14} /> ✦ 문장 간결화 & 전문 용어 정돈 제안
                        </span>
                        <span className="text-[11px] bg-[#06C755] text-white px-2 py-0.5 rounded">적용 추천</span>
                      </div>
                      <p className="text-xs text-[#111413] dark:text-zinc-100 font-medium leading-relaxed">
                        &quot;문서 작성 과정에서 사용자의 인지 부하를 최소화하기 위해, 필수 맥락 정보만을 신속하게 전달하는 직관적 인터페이스를 구축합니다.&quot;
                      </p>
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                      <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300">
                        원본 유지
                      </button>
                      <button className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#06C755] text-white shadow-xs">
                        문장 반영하기
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "publish" && (
                  <div className="p-6 sm:p-8 font-sans text-sm space-y-4 bg-[#FCFDFC] dark:bg-[#181B20]">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-white/10 text-xs">
                      <span className="font-bold text-[#06C755]">완성된 문서 · 출판본</span>
                      <span className="text-zinc-400">규격: A4 / Web Standard</span>
                    </div>

                    <h4 className="text-lg font-extrabold text-[#111413] dark:text-white">
                      글로벌 서비스 기능 명세서
                    </h4>

                    {/* TOC pill group */}
                    <div className="flex flex-wrap gap-1.5 py-1">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"># 1. 개요</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"># 2. 보안 규격</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"># 3. 배포 파이프라인</span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      본 규격서는 사내 표준 지식 자산으로 등록되었으며, 버전 4.2 기준의 완전한 인쇄 서식과 시각적 조판을 충족합니다.
                    </p>

                    <div className="p-3 rounded-lg border-l-3 border-[#06C755] bg-zinc-100/60 dark:bg-zinc-800/40 text-xs text-zinc-600 dark:text-zinc-300 font-mono">
                      curl -X POST https://api.onrivi.io/v2/documents/export
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
