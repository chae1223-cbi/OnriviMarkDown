// ====================================================================
// 📊 [OMD-UI-CtaSection-0025] CtaSection ➔ CtaSection
// 🎯 @KICK  : 사용자 가입 전환(CTA)을 강력하게 소구하고 회원가입 경로로 리다이렉트하는 랜딩페이지 마지막 전환 유도 영역
// 🛡️ @GUARD : viewport once 옵션을 활성화하여 모션 버벅임 억제
// 🚨 @PATCH : **2026-09-03** — Onrivi Author Premium V2 랜딩페이지 개편: 둥근 카드 박스를 걷어내고 전체 폭 활용 + 은은한 Green Glow 배경의 모던 와이드 CTA 탑재
//             **2026-06-22** — Luminous Arctic 디자인 시스템 라이트모드 적용 패치 (글래스 CTA 카드, Ice Blue 그래디언트 배경); 비로그인 상태 가입 진입 버튼 제거 및 텍스트 교체 패치
//             **2026-06-21** — OMDLanding UI 이식 및 /login 리다이렉트 변경 패치
// 🔗 @CALLS : Button, Link, motion.div
// ====================================================================
"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function CtaSection() {
  return (
    <section
      className="py-28 sm:py-36 px-6 relative overflow-hidden bg-[#F9F8F6] dark:bg-[#121314] text-[#1A1A18] dark:text-[#E8ECE9] border-t border-[#E2DFD8] dark:border-white/5"
      style={{
        fontFamily: "Pretendard, LineSeed, sans-serif",
      }}
    >
      {/* Subtle Background Green Glow */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(6,199,85,0.08)_0%,transparent_70%)] pointer-events-none z-0"
      />

      <div className="max-w-[900px] mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Top Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAE8E1] dark:bg-zinc-800 text-[11px] font-extrabold text-[#1A1A18] dark:text-zinc-200 tracking-widest uppercase shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#06C755]" />
            ONRIVI AUTHOR
          </div>

          {/* Main Title */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            글쓰기를 다시 생각하세요.
          </h2>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl font-bold text-[#06C755] tracking-tight">
            AI는 마크다운으로, 사람은 문서로.
          </p>

          {/* Description */}
          <p className="text-sm sm:text-base text-[#68716D] dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
            복잡한 서식 설정 없이 텍스트 본연에만 집중하는 정밀 에디터.<br className="hidden sm:inline" />
            지금 바로 Onrivi Author와 함께 새로운 창작의 기준을 경험하세요.
          </p>

          {/* Action Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link href="/signup" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#06C755] hover:bg-[#05B04B] text-white font-bold text-base shadow-[0_4px_28px_rgba(6,199,85,0.3)] hover:shadow-[0_8px_32px_rgba(6,199,85,0.45)] transition-all transform hover:-translate-y-0.5">
                무료로 시작하기
                <ArrowRight size={18} />
              </button>
            </Link>
          </div>

          {/* Bottom Trust Line */}
          <div className="pt-6 flex items-center justify-center gap-2 text-xs text-[#68716D] dark:text-zinc-500 font-medium">
            <CheckCircle2 size={14} className="text-[#06C755] shrink-0" />
            <span>신용카드 등록 없이 즉시 시작 · 로컬 우선 데이터 무결성 보장</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
