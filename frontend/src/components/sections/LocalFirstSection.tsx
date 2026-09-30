// ====================================================================
// 📊 [OMD-UI-LocalFirstSection-0001] LocalFirstSection ➔ LocalFirstSection
// 🎯 @KICK  : Onrivi Author의 핵심 철학인 Local First 원칙 — 내 문서는 내 컴퓨터에 안전하게 저장·관리
// 🛡️ @GUARD : 과장된 보안 주장 대신 실제 로컬 저장 및 오프라인 구동 구조를 정직하게 시각화
// 🚨 @PATCH : **2026-09-30** — [랜딩 개편 Local First 섹션 신규 구현]:
//             1. Heading: "내 문서는, 내 컴퓨터에."
//             2. Supporting: "외부 클라우드 의존 없이, 내 로컬 환경에서 문서를 안전하게 작성하고 영구적으로 보관하세요."
//             3. YOUR COMPUTER 로컬 파일 시스템 및 오프라인 영구 소장 다이어그램 시각화
// 🔗 @CALLS : motion.div, HardDrive, ShieldCheck, WifiOff, FileCheck
// ====================================================================
"use client";

import React from "react";
import { motion } from "framer-motion";
import { HardDrive, ShieldCheck, WifiOff, FolderKey } from "lucide-react";

export function LocalFirstSection() {
  return (
    <section
      id="local-first"
      className="py-24 sm:py-32 bg-[#F8FAFC] dark:bg-[#0E131F] text-[#0F172A] dark:text-[#E8ECE9] border-b border-[#E2E4F6] dark:border-white/5 relative"
      style={{ fontFamily: "Pretendard, sans-serif" }}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 dark:bg-zinc-800 border border-blue-200 dark:border-white/10 text-[11px] font-bold text-[#1d4ed8] dark:text-blue-400 tracking-wider uppercase shadow-2xs">
              DATA PRIVACY & SOVEREIGNTY
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-[#0F172A] dark:text-white">
              내 문서는, 내 컴퓨터에.
            </h2>

            <p className="text-base sm:text-lg text-[#475569] dark:text-zinc-300 font-normal leading-relaxed">
              작성 중인 문서와 이미지는 외부 클라우드 서버에 강제로 업로드되지 않습니다.<br />
              내 PC의 로컬 폴더에 순수 텍스트 파일(.md)로 직접 저장되어, 서비스 종료 걱정 없이 평생 안전하게 소장할 수 있습니다.
            </p>

            <div className="space-y-3.5 pt-2 text-sm text-[#334155] dark:text-zinc-300 font-medium">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[#1d4ed8]">
                  <HardDrive className="w-4 h-4" />
                </div>
                <span>내 파일 시스템(로컬 디렉토리)에 1:1 직결 저장</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[#1d4ed8]">
                  <WifiOff className="w-4 h-4" />
                </div>
                <span>인터넷 연결이 끊긴 비행기나 카페에서도 100% 정상 작동</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[#1d4ed8]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>기밀 보고서 및 개인 메모의 외부 유출 가능성 원천 차단</span>
              </div>
            </div>
          </div>

          {/* Right Visual Column: YOUR COMPUTER Diagram */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[480px] rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#16181D] p-7 shadow-lg relative overflow-hidden text-left space-y-5">
              {/* Computer Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <FolderKey className="w-4 h-4 text-[#1d4ed8]" />
                  <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    YOUR COMPUTER
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                  LOCAL ONLY
                </span>
              </div>

              {/* Local File Tree Mockup */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0E131F] border border-zinc-200 dark:border-zinc-800 font-mono text-xs space-y-2.5">
                <div className="text-zinc-500 flex items-center gap-2">
                  <span>📁 Documents/Onrivi_Workspace</span>
                </div>
                <div className="pl-4 space-y-1.5 text-zinc-700 dark:text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span>├── 📄 2026_q3_report.md</span>
                    <span className="text-[10px] text-zinc-400">14.2 KB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>├── 📄 gangneung-travel.md</span>
                    <span className="text-[10px] text-zinc-400">8.4 KB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>├── 📁 assets/</span>
                    <span className="text-[10px] text-zinc-400">3 Images</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-600 font-bold">
                    <span>└── 📕 executive_summary.pdf</span>
                    <span className="text-[10px]">출판 사출</span>
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1d4ed8] dark:text-blue-400 font-mono">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% PRIVATE & OFFLINE READY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
