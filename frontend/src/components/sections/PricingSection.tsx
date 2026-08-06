// ====================================================================
// 📊 [OMD-UI-PricingSection-0023 ✅ FIXED] PricingSection ➔ PricingSection
// 🎯 @KICK  : Onrivi Author 서비스 멤버십 가격표 출력
// 🚨 @PATCH : **2026-07-09** — 4계급 멤버십 구조 (Reader/Apprentice/Regular/Elite Pro) 전면 개편
// 🔗 @CALLS : plans constants
// ====================================================================
"use client"; // "use client" : 클라이언트 사이드 렌더링을 위한 지시어 

import { useState, useEffect } from "react"; // useState, useEffect : 상태 관리 및 데이터 패치를 위해 임포트 
import { motion } from "framer-motion"; // framer-motion : 애니메이션을 위한 라이브러리 
import { ConfirmModal } from "@/components/ui/ConfirmModal"; // ConfirmModal : 확인 모달 컴포넌트 

// ====================================================================
// 🎯 PricingSection ➔ PricingSection
// PricingSection : Onrivi Author 서비스 멤버십 가격표를 위한 컴포넌트  
// ====================================================================
export function PricingSection() {   // PricingSection : Onrivi Author 서비스 멤버십 가격표를 위한 컴포넌트  
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean; title: string; message: string; onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => { } }); // modalConfig : 모달 설정을 위한 상태  

  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbPlans(data);
        }
      })
      .catch(err => console.error("Failed to fetch plans:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="pricing" style={{ padding: "96px 0", background: "#f7f9fb", fontFamily: "Inter, sans-serif" }}>
        <div className="text-center">요금제를 불러오는 중입니다...</div>
      </section>
    );
  }

  return (
    <section
      id="pricing"
      style={{ padding: "96px 0", background: "#f7f9fb", fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-14">
          <span style={{ display: "inline-block", marginBottom: 16, padding: "4px 16px", borderRadius: 9999, background: "rgba(125,211,252,0.2)", color: "#006591", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em" }}>
            MEMBERSHIP
          </span>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 600, letterSpacing: "-0.01em", color: "#0f172a", marginBottom: 12 }}>
            🎮 Onrivi Author 서비스 멤버십 가격표
          </h2>
          <p style={{ fontSize: 18, color: "#3e4850", lineHeight: "28px" }}>
            당신의 창작 여정에 맞는 멤버십을 선택하세요.
          </p>
        </div>

        {/* Plan List */}
        <div className="max-w-3xl mx-auto" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {dbPlans.map((plan, i) => {
            const isHighlighted = plan.is_highlighted;
            const isFree = plan.is_free;

            const priceDisplay = isFree
              ? "0원"
              : plan.plan_code === "REGULAR" && plan.price_monthly
                ? `₩${(plan.price_monthly).toLocaleString()} / 월`
                : plan.plan_code === "ELITEPRO" && plan.price_yearly
                  ? `₩${(plan.price_yearly).toLocaleString()} / 년`
                  : plan.price_monthly ? `₩${(plan.price_monthly).toLocaleString()} / 월` : plan.price_yearly ? `₩${(plan.price_yearly).toLocaleString()} / 년` : "";

            const usdDisplay = isFree
              ? ""
              : plan.plan_code === "REGULAR" && plan.price_monthly_usd
                ? `($${plan.price_monthly_usd} / 월)`
                : plan.plan_code === "ELITEPRO" && plan.price_yearly_usd
                  ? `($${plan.price_yearly_usd} / 년)`
                  : plan.price_monthly_usd ? `($${plan.price_monthly_usd} / 월)` : plan.price_yearly_usd ? `($${plan.price_yearly_usd} / 년)` : "";

            const envLabel = plan.environment_name || plan.sys_type;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                style={{
                  padding: "24px 28px",
                  borderRadius: "1rem",
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
                {/* Header: Tier emoji + Name + Environment + Price */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 28 }}>{plan.tier_emoji}</span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: isHighlighted ? "#fff" : "#0f172a" }}>
                          [{i + 1 === 1 ? "계급 1" : i + 1 === 2 ? "계급 2" : i + 1 === 3 ? "계급 3" : "계급 4"}] {plan.name}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 9999, background: isHighlighted ? "rgba(255,255,255,0.2)" : "rgba(14,165,233,0.1)", color: isHighlighted ? "#e0f2fe" : "#006591" }}>
                          {envLabel}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: isHighlighted ? "rgba(255,255,255,0.75)" : "#6e7881", marginTop: 2 }}>
                        {plan.tagline}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: isHighlighted ? "#fff" : "#0f172a" }}>
                      {priceDisplay}
                    </span>
                    {usdDisplay && (
                      <span style={{ fontSize: 12, marginLeft: 6, color: isHighlighted ? "rgba(255,255,255,0.65)" : "#6e7881" }}>
                        {usdDisplay}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {(plan.features || []).map((f: string, fi: number) => (
                    <li key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "3px 0", fontSize: 13, lineHeight: "20px", color: isHighlighted ? "rgba(255,255,255,0.85)" : "#475569" }}>
                      <span style={{ color: isHighlighted ? "#bae6fd" : "#0ea5e9", fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>

      <ConfirmModal
        isOpen={modalConfig.isOpen} // isOpen : 모달 열림 여부를 위한 상태
        title={modalConfig.title} // title : 모달 제목
        message={modalConfig.message} // message : 모달 메시지
        onConfirm={modalConfig.onConfirm} // onConfirm : 모달 확인 버튼 클릭 시 실행될 함수
      />
    </section>
  );
}
