// ====================================================================
// 📊 [OMD-UI-PricingSection-0023 ✅ FIXED] PricingSection ➔ PricingSection
// 🎯 @KICK  : Onrivi Author 서비스 멤버십 가격표 출력
// 🚨 @PATCH : **2026-08-07** — DB `pricing_plans` 테이블을 기반으로 멤버십 데이터를 동적 조회(fetch)하여 렌더링하도록 마이그레이션 패치; **2026-07-09** — 4계급 멤버십 구조 (Reader/Apprentice/Regular/Elite Pro) 전면 개편
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
      <section id="pricing" className="py-24 bg-surface text-on-surface" style={{ fontFamily: "LineSeed, Pretendard, sans-serif" }}>
        <div className="text-center text-text-secondary">요금제를 불러오는 중입니다...</div>
      </section>
    );
  }

  return (
    <section
      id="pricing"
      className="py-24 bg-surface text-on-surface"
      style={{ fontFamily: "LineSeed, Pretendard, sans-serif" }}
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="chip mb-4">
            MEMBERSHIP
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface mb-3">
            🎮 Onrivi Author 서비스 멤버십 가격표
          </h2>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            당신의 창작 여정에 맞는 멤버십을 선택하세요.
          </p>
        </div>

        {/* Plan List */}
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
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
                className={`p-6 md:p-7 rounded-2xl transition-all duration-300 ${
                  isHighlighted
                    ? "bg-gradient-to-r from-[#06C755] to-[#05B04B] text-white shadow-lg shadow-[#06C755]/25 border-none"
                    : "bg-surface-container border border-outline/10 text-on-surface shadow-xs hover:border-[#06C755]/40"
                }`}
              >
                {/* Header: Tier emoji + Name + Environment + Price */}
                <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{plan.tier_emoji}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-base font-bold ${isHighlighted ? "text-white" : "text-on-surface"}`}>
                          [{i + 1 === 1 ? "계급 1" : i + 1 === 2 ? "계급 2" : i + 1 === 3 ? "계급 3" : "계급 4"}] {plan.name}
                        </span>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          isHighlighted ? "bg-white/20 text-white" : "bg-[#06C755]/10 text-[#06C755]"
                        }`}>
                          {envLabel}
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 ${isHighlighted ? "text-white/80" : "text-text-secondary"}`}>
                        {plan.tagline}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xl font-bold ${isHighlighted ? "text-white" : "text-on-surface"}`}>
                      {priceDisplay}
                    </span>
                    {usdDisplay && (
                      <span className={`text-xs ml-1.5 ${isHighlighted ? "text-white/70" : "text-text-secondary"}`}>
                        {usdDisplay}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="m-0 p-0 list-none space-y-1">
                  {(plan.features || []).map((f: string, fi: number) => (
                    <li key={fi} className={`flex items-start gap-2 text-xs leading-relaxed ${isHighlighted ? "text-white/90" : "text-text-secondary"}`}>
                      <span className={`font-bold shrink-0 ${isHighlighted ? "text-emerald-100" : "text-[#06C755]"}`}>✓</span>
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
