// ====================================================================
// 📊 [OMD-UI-DocumentGallerySection-0028] DocumentGallerySection ➔ DocumentGallerySection
// 🎯 @KICK  : 실무에서 작성되는 4대 핵심 문서(기획서, 기능명세서, 회의록, 기술문서)를 사진 대신 실제 조판된 문서 카드로 쇼케이스하는 갤러리 섹션
// 🛡️ @GUARD : 문서 카드 그리드 반응형 가드 및 호버 인터랙션 보장
// 🚨 @PATCH : **2026-09-03** — Onrivi Author Premium V2 랜딩페이지 개편: '문서가 곧 비주얼이 된다'는 기획 철학을 구현한 Documents Gallery 컴포넌트 신규 생성
// 🔗 @CALLS : motion.div, FileText, CheckSquare, Code2, Calendar
// ====================================================================
"use client";

import { motion } from "framer-motion";
import { FileText, CheckSquare, Code2, Calendar, ArrowUpRight } from "lucide-react";

export function DocumentGallerySection() {
  const documents = [
    {
      category: "기획서",
      categoryEn: "Proposal",
      title: "차세대 지식 자산화 플랫폼 개편안",
      date: "2026.09.01",
      icon: FileText,
      badges: ["전략 기획", "v2.0"],
      content: {
        h1: "# 1. 프로젝트 비전",
        p1: "단순 텍스트 편집을 넘어 조직의 핵심 노하우를 단일 신뢰 소스(SSoT)로 자산화하는 고신뢰 인프라를 구축합니다.",
        subHeading: "## 핵심 목표 (KPI)",
        items: [
          "문서 작성 및 출판 리드타임 60% 단축",
          "마크다운 기반 전사 표준 템플릿 일원화",
        ],
      },
    },
    {
      category: "기능 명세서",
      categoryEn: "PRD",
      title: "엔터프라이즈 SSO 인증 프로토콜 규격",
      date: "2026.08.28",
      icon: CheckSquare,
      badges: ["보안 규격", "API"],
      content: {
        h1: "# 1. 인증 아키텍처",
        p1: "SAML 2.0 및 OpenID Connect(OIDC) 기반의 무결점 싱글 사인온(SSO) 핸드셰이크를 보장합니다.",
        subHeading: "## 토큰 수명 주기",
        items: [
          "Session Lifetime: 8시간 (자동 갱신)",
          "암호화: AES-GCM 256bit Secure Storage",
        ],
      },
    },
    {
      category: "회의록",
      categoryEn: "Minutes",
      title: "2026 Q3 프로덕트 스프린트 킥오프",
      date: "2026.09.02",
      icon: Calendar,
      badges: ["스프린트", "액션 아이템"],
      content: {
        h1: "# 1. 주요 안건 및 결정",
        p1: "Sync Engine v2 구간 선형 보간 알고리즘 도입을 통해 에디터와 미리보기 스크롤 오차를 0px로 확정했습니다.",
        subHeading: "## Action Items",
        items: [
          "[x] Safe Zone 상단 40px, 하단 60px 밀착",
          "[x] 모바일 반응형 뷰포트 여백 클램핑 검증",
        ],
      },
    },
    {
      category: "기술 문서",
      categoryEn: "Tech Spec",
      title: "Markdown 파서 & 렌더링 파이프라인",
      date: "2026.08.30",
      icon: Code2,
      badges: ["개발 명세", "LDSG v5.0"],
      content: {
        h1: "# 1. AST 처리 규칙",
        p1: "Remark & Rehype 파이프라인에서 raw HTML을 엄격히 격리하고 .onrivi-content-root 내부 스코프에만 서식을 주입합니다.",
        subHeading: "## 플러그인 사양",
        items: [
          "KaTeX 수식 렌더링 & Mermaid 다이어그램",
          "D2Coding / JetBrains Mono 가독성 최적화",
        ],
      },
    },
  ];

  return (
    <section
      id="documents"
      className="py-24 sm:py-32 bg-[#F2F0EB] dark:bg-[#15171A] border-y border-[#E2DFD8] dark:border-white/5 text-[#1A1A18] dark:text-[#E8ECE9]"
      style={{ fontFamily: "Pretendard, LineSeed, sans-serif" }}
    >
      <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6E3DB] dark:bg-zinc-800 text-[11px] font-bold text-[#1A1A18] dark:text-zinc-200 tracking-wider uppercase mb-4">
            DOCUMENTS
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-[#111413] dark:text-white">
            무엇이든 문서가 됩니다.
          </h2>
          <p className="text-[#68716D] dark:text-zinc-400 text-base sm:text-lg">
            스톡 사진 대신, 정교하게 조판된 실제 문서가 온리비 어서의 가장 강력한 비주얼입니다.
          </p>
        </div>

        {/* 4 Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {documents.map((doc, idx) => {
            const Icon = doc.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="group rounded-2xl border border-[#E0DED7] dark:border-white/10 bg-white dark:bg-[#1A1D22] p-6 sm:p-8 hover:border-[#06C755]/60 transition-all duration-300 hover:shadow-[0_16px_40px_-10px_rgba(30,25,15,0.08)] flex flex-col justify-between text-left"
              >
                <div>
                  {/* Card Top Metadata */}
                  <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#ECEAE3] dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#F2F0EB] dark:bg-zinc-800 text-[#1A1A18] dark:text-zinc-200">
                        {doc.category}
                      </span>
                      <span className="text-xs text-[#68716D] dark:text-zinc-400 font-mono">
                        {doc.categoryEn}
                      </span>
                    </div>
                    <span className="text-xs text-[#68716D] dark:text-zinc-400">
                      {doc.date}
                    </span>
                  </div>

                  {/* Document Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-[#111413] dark:text-white tracking-tight mb-4 group-hover:text-[#06C755] transition-colors flex items-center justify-between">
                    <span>{doc.title}</span>
                    <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[#06C755]" />
                  </h3>

                  {/* Document Sheet Simulation */}
                  <div className="rounded-xl border border-[#E5E2D9] dark:border-white/5 bg-[#F8F6F1] dark:bg-[#14161A] p-4 sm:p-5 font-sans text-xs space-y-3">
                    <div className="font-mono text-zinc-400 text-[11px]">
                      {doc.content.h1}
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                      {doc.content.p1}
                    </p>
                    <div className="font-mono text-zinc-400 text-[11px] pt-1">
                      {doc.content.subHeading}
                    </div>
                    <div className="space-y-1 pl-2 border-l-2 border-[#06C755]/40 text-zinc-600 dark:text-zinc-400">
                      {doc.content.items.map((item, i) => (
                        <div key={i}>{item}</div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Badges */}
                <div className="flex items-center gap-2 pt-5">
                  {doc.badges.map((badge, bIdx) => (
                    <span
                      key={bIdx}
                      className="text-[11px] font-semibold text-[#68716D] dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded"
                    >
                      #{badge}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
