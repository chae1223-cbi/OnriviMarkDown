// ====================================================================
// 📊 [OMD-UI-HeroSection-0022] HeroSection ➔ HeroSection
// 🎯 @KICK  : Onrivi Author Premium V2의 타이포그래피 가치 제안 및 실제 라이프스타일/업무 씬을 2열 레이아웃과 무깜빡임(Cross-Fade) 3초 자동 롤링 이미지 슬라이더로 전달하는 히어로 영역
// 🛡️ @GUARD : 슬라이더 타이머 메모리 릭 방지(clearInterval) 및 이미지 상시 DOM 적재 기반 깜빡임 원천 차단
// 🚨 @PATCH : **2026-09-11** — 랜딩페이지 서피스 배경 Primary #DCE1FF 및 헤어라인 보더(#C5CEF8) 적용
//             **2026-09-11** — '제품 살펴보기' 버튼 제거 및 슬라이더 이미지 상시 렌더링(CSS Cross-Fade) 전환으로 깜빡임 현상 완벽 제거
//             **2026-09-11** — 히어로 섹션 2열(좌측 카피/CTA + 우측 3초 자동 롤링 이미지 슬라이더 5종) 전면 개편 및 기존 목업 제거
//             **2026-09-11** — Modern Technical Editorial 디자인 시스템 적용 (Cobalt #1d4ed8, Inter / Plus Jakarta Sans)
//             2026-09-03** — Onrivi Author Premium V2 개편: 웜 페이퍼 크림(#F9F8F6) 베이스 및 멀티미디어 비주얼 쇼케이스 탑재
//             **2026-06-22** — Luminous Arctic 디자인 시스템 라이트모드 적용 패치
//             **2026-06-21** — OMDLanding UI 디자인 이식 및 /login 리다이렉트 변경 패치
// 🔗 @CALLS : motion.div, Link, ChevronLeft, ChevronRight
// ====================================================================
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Zap, Sparkles } from "lucide-react";

interface HeroSlide {
  id: number;
  src: string;
  tag: string;
  title: string;
  subtitle: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    src: "/hero-slides/hero-slide-1.jpg",
    tag: "DESKTOP DUAL CANVAS",
    title: "대화면 모니터와 듀얼 캔버스",
    subtitle: "원시 마크다운 소스와 출판 규격의 조판 문서를 실시간 1ms 동기화",
  },
  {
    id: 2,
    src: "/hero-slides/hero-slide-2.jpg",
    tag: "EXECUTIVE STRATEGY",
    title: "비즈니스 기획 및 보고서 집필",
    subtitle: "표, 수식, 다이어그램을 갖춘 완성도 높은 문서를 즉시 PDF/HTML로 사출",
  },
  {
    id: 3,
    src: "/hero-slides/hero-slide-3.jpg",
    tag: "TEAM COLLABORATION",
    title: "팀 협업과 엔지니어링 지식 공유",
    subtitle: "개발자, 기획자, 리더가 함께 신뢰하는 단 하나의 마크다운 에디터",
  },
  {
    id: 4,
    src: "/hero-slides/hero-slide-4.jpg",
    tag: "FOCUSED MOBILITY",
    title: "어디서나 이어지는 깊은 사유",
    subtitle: "카페, 회의실, 이동 중에도 태블릿과 함께하는 고요한 집필 경험",
  },
  {
    id: 5,
    src: "/hero-slides/hero-slide-5.jpg",
    tag: "INTUITIVE CAPTURE",
    title: "생각의 흐름을 놓치지 않는 기록",
    subtitle: "복잡한 서식 도구 대신 순수한 텍스트 타이핑으로 문서의 뼈대 완성",
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // 3초 자동 슬라이더 타이머 (hover 시 일시정지)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <section
      className="pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden relative bg-[#DCE1FF] dark:bg-[#121314] text-[#1A1A18] dark:text-[#E8ECE9]"
      style={{ fontFamily: "Pretendard, sans-serif" }}
    >
      {/* Subtle Top Ambient Glow (Cobalt Authority on Warm Base) */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[860px] h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(29,78,216,0.12)_0%,transparent_70%)] pointer-events-none z-0"
      />

      <div className="max-w-[1240px] mx-auto px-6 lg:px-10 relative z-10">
        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* ======================================================= */}
          {/* Left Column: Headline, Copy, Single CTA & Badges */}
          {/* ======================================================= */}
          <div className="lg:col-span-6 text-left">
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex mb-5"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-zinc-800/80 border border-[#C5CEF8] dark:border-white/10 text-xs font-semibold text-[#1A1A18] dark:text-zinc-200 tracking-tight shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#1d4ed8] animate-pulse" />
                AI-NATIVE DOCUMENT PLATFORM
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="tracking-tight font-extrabold text-[#111413] dark:text-white mb-6"
              style={{
                fontSize: "clamp(38px, 4.4vw, 58px)",
                lineHeight: 1.12,
                letterSpacing: "-0.04em",
              }}
            >
              AI는 마크다운으로,<br />
              <span className="text-[#1d4ed8]">사람은 문서로.</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="mb-8 max-w-xl text-[#2D3748] dark:text-zinc-300 font-normal leading-relaxed text-[16px] sm:text-[18px] tracking-tight"
            >
              생각은 Markdown으로 빠르게. 결과물은 사람이 읽는 아름다운 문서처럼.<br className="hidden sm:inline" />
              타이핑의 즉시성과 출판 규격의 조판 품질을 하나의 화면에서 완성합니다.
            </motion.p>

            {/* CTA Button (단일 무료로 시작하기 버튼) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-10"
            >
              <Link href="/signup" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-[16px] shadow-[0_4px_24px_rgba(29,78,216,0.28)] hover:shadow-[0_6px_28px_rgba(29,78,216,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                  무료로 시작하기
                  <ArrowRight size={17} />
                </button>
              </Link>
            </motion.div>

            {/* Trust Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="grid grid-cols-3 gap-3 pt-6 border-t border-[#C5CEF8] dark:border-white/10"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#1d4ed8] shrink-0" />
                <span className="text-xs font-semibold text-[#1E293B] dark:text-zinc-300 tracking-tight">
                  100% 로컬 프라이버시
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-[#1d4ed8] shrink-0" />
                <span className="text-xs font-semibold text-[#1E293B] dark:text-zinc-300 tracking-tight">
                  1ms 듀얼 싱크
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#1d4ed8] shrink-0" />
                <span className="text-xs font-semibold text-[#1E293B] dark:text-zinc-300 tracking-tight">
                  출판급 조판 사출
                </span>
              </div>
            </motion.div>
          </div>

          {/* ======================================================= */}
          {/* Right Column: Seamless Cross-Fade 3s Image Slider */}
          {/* ======================================================= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-6 relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Slider Card Container */}
            <div className="relative aspect-square w-full max-w-[540px] mx-auto rounded-2xl sm:rounded-3xl overflow-hidden border border-[#C5CEF8] dark:border-white/10 bg-zinc-950 shadow-[0_20px_60px_-15px_rgba(29,78,216,0.22)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] group select-none">
              {/* All slides mounted continuously in DOM - Pure CSS Cross-Fade to prevent any flash/blink */}
              {HERO_SLIDES.map((s, idx) => {
                const isActive = idx === currentSlide;
                return (
                  <div
                    key={s.id}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                      isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                    }`}
                  >
                    <img
                      src={s.src}
                      alt={s.title}
                      className="w-full h-full object-cover select-none transform scale-100 transition-transform duration-1000 ease-out"
                      loading="eager"
                    />
                    {/* Subtle Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />
                  </div>
                );
              })}

              {/* Caption Overlays (Cross-Faded smoothly per slide) */}
              {HERO_SLIDES.map((s, idx) => {
                const isActive = idx === currentSlide;
                return (
                  <div
                    key={`caption-${s.id}`}
                    className={`absolute bottom-0 left-0 right-0 p-5 sm:p-7 text-left z-20 select-none transition-all duration-700 ease-in-out ${
                      isActive
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2 pointer-events-none"
                    }`}
                  >
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-[10px] sm:text-[11px] font-extrabold text-[#1d4ed8] uppercase tracking-wider mb-2 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8]" />
                      {s.tag}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight drop-shadow-sm mb-1">
                      {s.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-200/90 font-normal leading-relaxed drop-shadow-xs line-clamp-2">
                      {s.subtitle}
                    </p>
                  </div>
                );
              })}

              {/* Navigation Arrows (Visible on Hover) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md active:scale-95 z-30 cursor-pointer"
                aria-label="이전 이미지"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md active:scale-95 z-30 cursor-pointer"
                aria-label="다음 이미지"
              >
                <ChevronRight size={18} />
              </button>

              {/* Pagination Dots (Top Right Inside Container) */}
              <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full">
                {HERO_SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                      idx === currentSlide
                        ? "w-5 bg-[#1d4ed8] shadow-[0_0_8px_rgba(29,78,216,0.8)]"
                        : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`슬라이드 ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
