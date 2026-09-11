// ====================================================================
// 📊 [OMD-UI-ExperienceSection-0027] ExperienceSection ➔ ExperienceSection
// 🎯 @KICK  : Onrivi Author의 3대 핵심 경험(WRITE, REFINE, PUBLISH)을 실제 제품 UI 목업과 함께 단계별로 몰입감 있게 선보이는 피처 섹션
// 🛡️ @GUARD : 탭 상태 스위칭 및 반응형 카드 UI 오버플로우 방지
// 🚨 @PATCH : **2026-09-11** — ExperienceSection 문구를 실생활 친화적이고 직관적인 일상 언어(편안한 작성, 다정한 AI 도우미, 예쁜 문서 완성 등)로 전면 개편
//             **2026-09-11** — 랜딩페이지 섹션 교차(#FFFFFF / #EFEFFF) 배경 및 헤어라인 보더(#E2E4F6) 적용
//             **2026-09-11** — 랜딩페이지 서피스 배경 Primary #DCE1FF 및 헤어라인 보더(#C5CEF8) 적용
//             **2026-09-11** — Modern Technical Editorial 디자인 시스템 적용 (Cobalt #1d4ed8, Inter / Plus Jakarta Sans)
//             2026-09-03** — Onrivi Author Premium V2 랜딩페이지 개편: 기존 6개 분절 카드 제거 및 WRITE/REFINE/PUBLISH 3단계 제품 스토리텔링 뷰 신규 구축
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
      tag: "자유로운 생각 기록",
      heading: "생각나는 대로 키보드로 톡톡, 거침없이 써 내려가세요.",
      subheading: "서식 맞추느라 멈추지 않고, 떠오르는 생각을 그대로 담아냅니다.",
      desc: "글씨 크기나 줄 간격을 신경 쓰느라 좋은 아이디어를 놓치지 마세요. # 하나로 제목을 달고, - 기호로 목록을 만들며 손가락이 키보드를 떠나지 않고 편안하게 글에 몰입할 수 있습니다.",
      bullets: [
        "버벅임 없이 빠르고 부드러운 실시간 타이핑",
        "키보드만으로 제목, 체크박스, 표를 1초 만에 생성",
        "내 컴퓨터 속 폴더와 문서를 그대로 안전하게 보관",
      ],
    },
    {
      id: "refine",
      tabNumber: "02",
      tabTitle: "REFINE",
      tag: "다정한 AI 문장 도우미",
      heading: "내가 쓴 생각을 존중하며, 더 읽기 좋게 다듬어 줍니다.",
      subheading: "어색한 문장이나 놓친 내용을 AI가 다정하게 찾아줍니다.",
      desc: "글의 주도권은 언제나 사용자에게 있습니다. 대충 적어둔 거친 메모도 AI가 꼼꼼히 살펴보고, 보고서나 안내문 등 상황에 꼭 맞는 매끄럽고 친절한 문장으로 추천해 드립니다.",
      bullets: [
        "글의 흐름을 파악해 꼭 알맞은 표현과 맞춤법 제안",
        "클릭 한 번으로 단정한 업무용 톤이나 친근한 말투로 전환",
        "별도 창 없이 글 쓰는 화면에서 마음에 드는 문장만 쏙 선택",
      ],
    },
    {
      id: "publish",
      tabNumber: "03",
      tabTitle: "PUBLISH",
      tag: "예쁜 문서 원클릭 완성",
      heading: "디자이너가 다듬은 듯, 보기 좋은 문서로 바로 변신합니다.",
      subheading: "누구에게 보여줘도 칭찬받는 깔끔한 레이아웃이 자동으로 완성됩니다.",
      desc: "줄 맞춤이나 폰트 설정 때문에 고민하지 마세요. 문서에 꼭 맞는 여백과 세련된 디자인이 알아서 입혀집니다. 완성된 문서는 PDF, 웹 링크, 이미지 파일로 언제 어디서나 바로 공유할 수 있습니다.",
      bullets: [
        "눈이 편안한 전용 폰트와 세련된 여백 자동 조판",
        "인쇄와 공유에 최적화된 깔끔한 PDF 원클릭 저장",
        "웹 링크나 이미지로 팀원과 주고받는 손쉬운 공유",
      ],
    },
  ] as const;

  const currentExp = experiences.find((e) => e.id === activeTab) || experiences[0];

  return (
    <section
      id="experience"
      className="py-24 sm:py-32 bg-[#FFFFFF] dark:bg-[#0A0D14] text-[#1A1A18] dark:text-[#E8ECE9] relative overflow-hidden"
      style={{ fontFamily: "Pretendard, sans-serif" }}
    >
      <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFEFFF] dark:bg-zinc-800 border border-[#E2E4F6] text-[11px] font-bold text-[#1A1A18] dark:text-zinc-200 tracking-wider uppercase mb-4 shadow-2xs">
            EXPERIENCE
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-[#111413] dark:text-white">
            온리비 하나면 충분해요,<br />
            모든 글쓰기의 편안한 시작점.
          </h2>
          <p className="text-[#2D3748] dark:text-zinc-300 text-base sm:text-lg">
            가볍게 적고(Write), 똑똑하게 다듬고(Refine), 예쁘게 완성(Publish)하는 기분 좋은 문서 작성 여정.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex justify-center mb-12 sm:mb-16">
          <div className="inline-flex p-1.5 rounded-2xl bg-[#EFEFFF] dark:bg-[#1A1D22] border border-[#E2E4F6] dark:border-white/10 max-w-full overflow-x-auto shadow-2xs">
            {experiences.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-white dark:bg-zinc-800 text-[#111413] dark:text-white shadow-xs border border-[#E2E4F6] dark:border-white/10"
                      : "text-[#4A5568] dark:text-zinc-400 hover:text-[#111413] dark:hover:text-white"
                  }`}
                >
                  <span className={`font-mono text-[11px] ${isActive ? "text-[#1d4ed8]" : "opacity-60"}`}>
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
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center rounded-3xl border border-[#E2E4F6] dark:border-white/10 bg-[#EFEFFF]/70 dark:bg-[#16181D] p-6 sm:p-10 lg:p-12 shadow-sm"
          >
            {/* Left Description Column */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1d4ed8]/10 text-[#1d4ed8] text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8]" />
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
                    <div className="w-4 h-4 rounded-full bg-[#1d4ed8]/15 text-[#1d4ed8] flex items-center justify-center shrink-0">
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
                      {activeTab === "write" && "meeting-notes.md — WRITE"}
                      {activeTab === "refine" && "ai-assistant.md — REFINE"}
                      {activeTab === "publish" && "proposal-output.pdf — PUBLISH"}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#1d4ed8]">
                    {activeTab.toUpperCase()} MODE
                  </span>
                </div>

                {/* Tab Specific UI Mockups */}
                {activeTab === "write" && (
                  <div className="p-6 sm:p-8 font-mono text-[13px] leading-relaxed bg-zinc-50/40 dark:bg-[#14161B] space-y-3">
                    <p className="text-blue-600 dark:text-blue-400 font-bold"># 주간 기획 회의록</p>
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold">## 오늘 이야기 나눈 점</p>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      글 쓸 때마다 서식이나 줄 맞춤을 신경 쓰느라 정작 중요한 생각에 집중하기 어려웠던 점을 개선하기로 했습니다.
                    </p>
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold pt-1">## 실천할 일</p>
                    <ul className="space-y-1 text-zinc-600 dark:text-zinc-300 pl-4 border-l-2 border-zinc-200 dark:border-zinc-800">
                      <li>- <strong className="text-[#1d4ed8]">편하게 쓰기:</strong> 마우스 없이 키보드로 생각나는 대로 메모</li>
                      <li>- <strong className="text-[#1d4ed8]">알아서 정돈:</strong> # 하나로 제목을 만들고 깔끔하게 정리</li>
                      <li>- <strong className="text-[#1d4ed8]">바로 공유:</strong> 완성된 문서를 PDF나 웹 링크로 전달</li>
                    </ul>
                    <div className="inline-block w-2 h-4 bg-[#1d4ed8] animate-pulse align-middle ml-1" />
                  </div>
                )}

                {activeTab === "refine" && (
                  <div className="p-6 sm:p-8 font-sans text-sm space-y-4 bg-white dark:bg-[#1C1F26]">
                    <div className="text-zinc-500 text-xs">내가 가볍게 적은 메모:</div>
                    <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed">
                      &quot;이번 신제품 소개 문서는 너무 어려운 말 쓰지 말고 누구나 읽기 쉽게 핵심만 바로 보여주는 게 좋을 것 같아요.&quot;
                    </div>

                    {/* AI Suggestion Tooltip */}
                    <div className="p-4 rounded-xl bg-[#1d4ed8]/10 border border-[#1d4ed8]/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#1d4ed8]">
                        <span className="flex items-center gap-1.5">
                          <Sparkles size={14} /> ✦ 더 읽기 쉽고 단정한 문장 제안
                        </span>
                        <span className="text-[11px] bg-[#1d4ed8] text-white px-2 py-0.5 rounded font-medium">추천</span>
                      </div>
                      <p className="text-xs text-[#111413] dark:text-zinc-100 font-medium leading-relaxed">
                        &quot;신제품의 핵심 가치를 고객이 첫눈에 이해할 수 있도록, 친근한 일상 언어로 명확하고 간결하게 설명합니다.&quot;
                      </p>
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                      <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300">
                        원래대로 두기
                      </button>
                      <button className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#1d4ed8] text-white shadow-xs">
                        이 문장으로 바꾸기
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "publish" && (
                  <div className="p-6 sm:p-8 font-sans text-sm space-y-4 bg-[#FCFDFC] dark:bg-[#181B20]">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-white/10 text-xs">
                      <span className="font-bold text-[#1d4ed8]">단정하게 완성된 문서</span>
                      <span className="text-zinc-400">PDF · 웹 공유 가능</span>
                    </div>

                    <h4 className="text-lg font-extrabold text-[#111413] dark:text-white">
                      2026 신제품 기획 제안서
                    </h4>

                    {/* TOC pill group */}
                    <div className="flex flex-wrap gap-1.5 py-1">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"># 1. 기획 배경</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"># 2. 주요 기능</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"># 3. 배포 일정</span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      눈이 편안한 폰트와 균형 잡힌 여백이 자동 적용되어, 팀원이나 고객에게 즉시 전달할 수 있습니다.
                    </p>

                    <div className="p-3 rounded-lg border-l-3 border-[#1d4ed8] bg-zinc-100/60 dark:bg-zinc-800/40 text-xs text-zinc-600 dark:text-zinc-300 flex items-center justify-between">
                      <span className="font-medium text-[#1d4ed8]">✨ PDF 저장 및 웹 공유 링크가 준비되었습니다.</span>
                      <span className="text-[11px] bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-white/10 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-200 font-semibold">내보내기</span>
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
