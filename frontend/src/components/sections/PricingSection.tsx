// ====================================================================
// 📊 [OMD-UI-PricingSection-0023 ✅ FIXED] PricingSection ➔ PricingSection
// 🎯 @KICK  : 요금제 리스트 출력 및 접속 횟수 기반 플랜 선택 지원
// 🛡️ @GUARD : isAnnual 토글 상태 변경에 따른 애니메이션 제어
// 🚨 @PATCH : **2026-06-21** — 요금제 리스트형 변경, 접속 횟수 용어 개편, 로그인 리다이렉트 연동 패치
//             **2026-06-22** — Luminous Arctic 디자인 시스템 라이트모드 적용 패치 (글래스 카드, Ice Blue 토글, 하이라이트 플랜); 비로그인 상태 진입(로그인 링크) 버튼 제거 및 플랜 명세 텍스트 대체 패치
// 🔗 @CALLS : Link, plans constants
// ====================================================================
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { plans } from "@/lib/constants";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import Link from "next/link";

export function PricingSection() {
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean; title: string; message: string; onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  return (
    <section
      id="pricing"
      style={{ padding: "96px 0", background: "#f7f9fb", fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-14">
          <span style={{ display: "inline-block", marginBottom: 16, padding: "4px 16px", borderRadius: 9999, background: "rgba(125,211,252,0.2)", color: "#006591", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em" }}>
            PRICING
          </span>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 600, letterSpacing: "-0.01em", color: "#0f172a", marginBottom: 12 }}>
            합리적이고 투명한 최대 접속 횟수별 요금제 정책
          </h2>
          <p style={{ fontSize: 18, color: "#3e4850", lineHeight: "28px" }}>
            필요에 맞추어 최대 접속 횟수를 유연하게 선택해 보세요.
          </p>
        </div>

        {/* Common Benefits */}
        <div
          className="max-w-3xl mx-auto mb-12"
          style={{
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: "1.5rem",
            padding: "28px 32px",
            boxShadow: "0 4px 24px rgba(14,165,233,0.06)",
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", marginBottom: 16, textAlign: "center" }}>
            💡 모든 요금제 공통 제공 혜택 및 공통 규정
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "기간 내 모든 기능 사용 (에디트, 분할, 미리보기 모든 모드 무제한 사용)",
              "대시보드 실시간 접속 동기화 해제 지원 (접속 세션 원격 해제 및 동기화)",
              "기간 내 무제한 문서 편집 가능 (오프라인 데스크톱 및 웹 SaaS 무제한 편집)",
              "요금 계약 만료 시 미리보기(읽기 전용) 전환 (원고 열람 및 목차 작동 보장)",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ color: "#0ea5e9", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 13, color: "#475569", lineHeight: "20px" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan List */}
        <div className="max-w-3xl mx-auto" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {plans.map((plan, i) => {
            const isHighlighted = plan.highlighted;
            const priceText = plan.isFree
              ? "0원"
              : plan.name.includes("연간") || plan.name.includes("데스크톱")
              ? `₩${(plan.priceYearly || 0).toLocaleString()} / 년`
              : `₩${(plan.priceMonthly || 0).toLocaleString()} / 월`;
            const usdText = plan.isFree ? "" : plan.name.includes("연간") || plan.name.includes("데스크톱")
              ? `($${plan.priceUSD?.replace("$", "")} / 년)`
              : `(${plan.priceUSD || "0$"} / 월)`;
            const sessionCount = plan.name.includes("무료") ? "1회 (1주일 체험)" : "3회";

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px 28px",
                  borderRadius: "1rem",
                  flexWrap: "wrap",
                  gap: 16,
                  ...(isHighlighted
                    ? {
                        background: "linear-gradient(135deg, #006591 0%, #0ea5e9 100%)",
                        border: "none",
                        boxShadow: "0 8px 24px rgba(14,165,233,0.25)",
                      }
                    : {
                        background: "rgba(255,255,255,0.6)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.5)",
                        boxShadow: "0 2px 12px rgba(14,165,233,0.06)",
                      }),
                }}
              >
                {/* Left: Name + tagline */}
                <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1, minWidth: 160 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: isHighlighted ? "#fff" : "#0f172a" }}>
                        {plan.name}
                      </span>
                      {plan.badge && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 9999, background: "rgba(255,255,255,0.25)", color: isHighlighted ? "#fff" : "#006591" }}>
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: isHighlighted ? "rgba(255,255,255,0.75)" : "#6e7881", marginTop: 2 }}>
                      {plan.tagline}
                    </p>
                  </div>
                  <div style={{ width: 1, height: 36, background: isHighlighted ? "rgba(255,255,255,0.25)" : "#e2e8f0" }} className="hidden md:block" />
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: isHighlighted ? "rgba(255,255,255,0.7)" : "#6e7881", letterSpacing: "0.05em", display: "block" }}>
                      {plan.name.includes("데스크톱") ? "라이선스 허용" : "최대 동시 접속"}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: isHighlighted ? "#bae6fd" : "#0ea5e9", marginTop: 2, display: "block" }}>
                      {plan.name.includes("데스크톱") ? "1 카피 (1 PC)" : sessionCount}
                    </span>
                  </div>
                </div>

                {/* Right: Price */}
                <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: isHighlighted ? "#fff" : "#0f172a" }}>
                      {priceText}
                    </span>
                    {usdText && (
                      <span style={{ fontSize: 12, marginLeft: 6, color: isHighlighted ? "rgba(255,255,255,0.65)" : "#6e7881" }}>
                        {usdText}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
      />
    </section>
  );
}
