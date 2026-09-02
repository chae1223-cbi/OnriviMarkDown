// ====================================================================
// 📊 [OMD-UI-CtaSection-0025] CtaSection ➔ CtaSection
// 🎯 @KICK  : 사용자 가입 전환(CTA)을 강력하게 소구하고 회원가입 경로로 리다이렉트하는 랜딩페이지 마지막 전환 유도 영역
// 🛡️ @GUARD : viewport once 옵션을 활성화하여 모션 버벅임 억제
// 🚨 @PATCH : **2026-06-21** — OMDLanding UI 이식 및 /login 리다이렉트 변경 패치
//             **2026-06-22** — Luminous Arctic 디자인 시스템 라이트모드 적용 패치 (글래스 CTA 카드, Ice Blue 그래디언트 배경); 비로그인 상태 가입 진입 버튼 제거 및 텍스트 교체 패치
// 🔗 @CALLS : Button, Link, motion.div
// ====================================================================
"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function CtaSection() { // CtaSection : 사용자 가입 전환(CTA)을 강력하게 소구하고 회원가입 경로로 리다이렉트하는 랜딩페이지 마지막 전환 유도 영역 
  return (
    <section
      className="py-24 sm:py-32 px-6 relative overflow-hidden bg-gradient-to-b from-[#F2FBF5] to-[#E5F7EC] dark:from-[#111A14] dark:to-[#0D140F] text-on-surface"
      style={{
        fontFamily: "LineSeed, Pretendard, sans-serif",
      }}
    >
      {/* Decorative orbs (LDSG Green/Blue) */}
      <div aria-hidden style={{ position: "absolute", top: "10%", right: "8%", width: 450, height: 450, background: "radial-gradient(circle, rgba(6,199,85,0.12) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", bottom: "5%", left: "5%", width: 350, height: 350, background: "radial-gradient(circle, rgba(77,115,255,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <div className="max-w-[820px] mx-auto text-center relative z-10">
        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white/95 dark:bg-[#1A221E]/90 border border-white/80 dark:border-white/10 rounded-[2.5rem] px-8 py-14 sm:px-16 sm:py-16 shadow-[0_24px_60px_-15px_rgba(6,199,85,0.12)] dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        >
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#E8F9EE] dark:bg-emerald-950/60 text-[#06C755] text-[12px] font-bold tracking-wide">
              지금 시작하세요
            </span>
          </div>

          {/* Main Title */}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F1F1F] dark:text-white tracking-tight mb-4 leading-tight">
            글쓰기를 혁신할 준비가 되셨나요?
          </h2>

          {/* Subtitle */}
          <p className="text-base font-bold text-[#06C755] mb-4">
            오직 지금만, Onrivi Author의 첫 번째 주인공이 되어보세요.
          </p>

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto mb-10">
            복잡한 설정 없이 텍스트 본연에만 집중하는 정밀 에디터. 정식 출시 전 Onrivi의 무결점 생산성을 먼저 경험해 보세요.
          </p>

          {/* Bottom Checkpoint */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <CheckCircle2 size={15} className="text-[#06C755] shrink-0" />
            <span>정적 마크다운 원고 작성 및 실시간 인쇄 서식 보정 완벽 지원</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
