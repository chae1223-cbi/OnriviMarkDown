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

export function CtaSection() {
  return (
    <section
      style={{
        padding: "96px 24px",
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f7f9fb 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Decorative orbs */}
      <div aria-hidden style={{ position: "absolute", top: "10%", right: "5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", bottom: "5%", left: "5%", width: 280, height: 280, background: "radial-gradient(circle, rgba(75,165,204,0.10) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <div className="max-w-[800px] mx-auto text-center" style={{ position: "relative", zIndex: 1 }}>
        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.5)",
            borderRadius: "1.5rem",
            padding: "56px 48px",
            boxShadow: "0 20px 48px rgba(14,165,233,0.10), 0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <span style={{ display: "inline-block", marginBottom: 20, padding: "4px 16px", borderRadius: 9999, background: "rgba(125,211,252,0.2)", color: "#006591", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em" }}>
            지금 시작하세요
          </span>
          <h2
            style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#0f172a", marginBottom: 16, lineHeight: 1.2 }}
          >
            글쓰기를 혁신할 준비가 되셨나요?
          </h2>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#0ea5e9", marginBottom: 12 }}>
            오직 지금만, 온리비 어서의 첫 번째 주인공이 되어보세요.
          </p>
          <p style={{ fontSize: 15, color: "#475569", lineHeight: "24px", marginBottom: 36, maxWidth: 520, margin: "0 auto 36px" }}>
            복잡한 설정 없이 텍스트 본연에만 집중하는 정밀 에디터. 정식 출시 전 온리비의 무결점 생산성을 먼저 경험해 보세요.
          </p>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <p style={{ fontSize: 13, color: "#6e7881", display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={14} style={{ color: "#4ade80" }} />
              정적 마크다운 원고 작성 및 실시간 인쇄 서식 보정 완벽 지원
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
