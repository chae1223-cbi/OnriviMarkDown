// ====================================================================
// 📊 [OMD-UI-TransformationSection-0001] TransformationSection ➔ TransformationSection
// 🎯 @KICK  : AI가 생성한 거친 마크다운 구조(STRUCTURED CONTENT)가 Onrivi 엔진을 통해 출판급 비즈니스 전문 보고서(PROFESSIONAL DOCUMENT)로 변환되는 Before & After 쇼케이스
// 🛡️ @GUARD : 비즈니스 전문 문서(Executive Summary, KPI 배지, 표) 대비 시각화
// 🚨 @PATCH : **2026-09-30** — [랜딩 개편 Transformation Showcase 신규 구현]:
//             1. Heading: "단순한 콘텐츠를 전문 문서로."
//             2. Supporting: "AI의 결과를 거친 텍스트로 끝내지 마세요. Onrivi를 거치면 보고서와 출판 규격의 전문 문서로 거듭납니다."
//             3. STRUCTURED CONTENT → ONRIVI ENGINE → PROFESSIONAL DOCUMENT 3단 시각화
// 🔗 @CALLS : motion.div, ArrowRight, CheckCircle2, TrendingUp, BarChart3
// ====================================================================
"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2, TrendingUp, FileText, ArrowDown } from "lucide-react";

export function TransformationSection() {
  return (
    <section
      id="transformation"
      className="py-24 sm:py-32 bg-[#FFFFFF] dark:bg-[#0A0D14] text-[#0F172A] dark:text-[#E8ECE9] border-b border-[#E2E4F6] dark:border-white/5 relative"
      style={{ fontFamily: "Pretendard, sans-serif" }}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-zinc-800 border border-blue-100 dark:border-white/10 text-[11px] font-bold text-[#1d4ed8] dark:text-blue-400 tracking-wider uppercase mb-4 shadow-2xs">
            TRANSFORMATION SHOWCASE
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-[#0F172A] dark:text-white">
            단순한 콘텐츠를 전문 문서로.
          </h2>
          <p className="text-base sm:text-lg text-[#475569] dark:text-zinc-300 font-normal leading-relaxed">
            AI의 결과를 거친 텍스트로 끝내지 마세요.<br className="hidden sm:inline" />
            Onrivi를 거치면 경영진과 고객이 신뢰하는 출판급 규격의 전문 리포트로 완성됩니다.
          </p>
        </div>

        {/* 3-Column Comparison: Raw Content -> Onrivi Engine -> Professional Result */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* 1. Left Card: Raw Structured Content */}
          <div className="lg:col-span-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0E131F] p-6 sm:p-7 shadow-xs space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500">
              <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                <FileText className="w-4 h-4" />
                BEFORE : STRUCTURED CONTENT
              </span>
              <span className="font-mono text-[11px]">RAW TEXT</span>
            </div>

            <div className="font-mono text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 space-y-2.5">
              <p className="text-zinc-800 dark:text-zinc-200 font-bold">
                # Q3 경영 실적 요약 보고서
              </p>
              <p>## 1. 핵심 성과 지표 (KPI)</p>
              <p>- 총 매출액: 142억 원 (YoY +28.4% 성장)</p>
              <p>- 신규 구독자 수: 12,480명 돌파</p>
              <p>- 고객 리텐션 비율: 94.2% 유지</p>
              <p className="pt-1">## 2. 세부 사업부별 매출 테이블</p>
              <div className="p-2 bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800 text-[11px] whitespace-pre overflow-x-auto text-zinc-500">
{`| 사업 부문  | 매출액 (억) | 전년비 |
|------------|-------------|--------|
| Enterprise | 86.4        | +34%   |
| Cloud Pro  | 42.1        | +22%   |
| Solution   | 13.5        | +12%   |`}
              </div>
            </div>
          </div>

          {/* 2. Middle Badge: Onrivi Transformation Bridge */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center gap-2 py-2">
            <div className="w-12 h-12 rounded-2xl bg-[#1d4ed8] text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-xs font-extrabold text-[#1d4ed8] uppercase tracking-wider font-mono">
              ONRIVI ENGINE
            </span>
            <span className="text-[11px] text-zinc-500 text-center">
              1초 출판급 조판 변환
            </span>
            <div className="hidden lg:flex text-[#1d4ed8] mt-1">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div className="flex lg:hidden text-[#1d4ed8] mt-1">
              <ArrowDown className="w-5 h-5" />
            </div>
          </div>

          {/* 3. Right Card: Professional Document Result */}
          <div className="lg:col-span-5 rounded-2xl border-2 border-[#1d4ed8]/30 dark:border-blue-500/40 bg-white dark:bg-[#16181D] p-6 sm:p-7 shadow-lg space-y-4 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#1d4ed8] text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider font-mono">
              출판급 전문 리포트
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#1d4ed8] dark:text-blue-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                AFTER : PROFESSIONAL DOCUMENT
              </span>
            </div>

            {/* Simulated Executive Report View */}
            <div className="space-y-3.5 text-xs text-[#0F172A] dark:text-zinc-100">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-[#1d4ed8] tracking-widest uppercase">
                  EXECUTIVE SUMMARY
                </div>
                <h4 className="text-base font-extrabold tracking-tight text-[#0F172A] dark:text-white">
                  Q3 경영 실적 요약 보고서
                </h4>
              </div>

              {/* KPI Badge Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900">
                  <span className="text-[10px] text-zinc-500 block font-semibold">총 매출액</span>
                  <strong className="text-sm font-bold text-[#1d4ed8]">142억 원</strong>
                  <span className="text-[10px] text-emerald-600 font-bold block">+28.4%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900">
                  <span className="text-[10px] text-zinc-500 block font-semibold">신규 구독자</span>
                  <strong className="text-sm font-bold text-teal-700 dark:text-teal-400">12,480명</strong>
                  <span className="text-[10px] text-teal-600 font-bold block">목표 초과</span>
                </div>
                <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
                  <span className="text-[10px] text-zinc-500 block font-semibold">고객 리텐션</span>
                  <strong className="text-sm font-bold text-indigo-700 dark:text-indigo-400">94.2%</strong>
                  <span className="text-[10px] text-indigo-600 font-bold block">최고 기록</span>
                </div>
              </div>

              {/* Polished Table */}
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                <table className="w-full text-[11px]">
                  <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
                    <tr>
                      <th className="p-2 text-left pl-3">사업 부문</th>
                      <th className="p-2 text-right">매출액</th>
                      <th className="p-2 text-right pr-3">성장률</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    <tr>
                      <td className="p-2 pl-3 font-semibold">Enterprise</td>
                      <td className="p-2 text-right font-mono">86.4억</td>
                      <td className="p-2 text-right pr-3 text-emerald-600 font-bold">+34%</td>
                    </tr>
                    <tr className="bg-zinc-50/50 dark:bg-zinc-800/30">
                      <td className="p-2 pl-3 font-semibold">Cloud Pro</td>
                      <td className="p-2 text-right font-mono">42.1억</td>
                      <td className="p-2 text-right pr-3 text-emerald-600 font-bold">+22%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
