// ====================================================================
// 📊 [OMD-UI-PricingSection-0023 ✅ FIXED] PricingSection ➔ PricingSection
// 🎯 @KICK  : Onrivi Author 서비스 멤버십 가격표 출력
// 🚨 @PATCH : **2026-09-03** — Onrivi Author Premium V2 랜딩페이지 개편: 초록색 풀 채움 카드 제거, White/Surface 베이스에 Regular 플랜 얇은 Green 테두리 및 MOST POPULAR 뱃지/elevation 고급화 적용
//             **2026-08-07** — DB pricing_plans 테이블을 기반으로 멤버십 데이터를 동적 조회(fetch)하여 렌더링하도록 마이그레이션 패치; **2026-07-09** — 4계급 멤버십 구조 (Reader/Apprentice/Regular/Elite Pro) 전면 개편
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
      className="py-24 sm:py-32 bg-[#F9F8F6] dark:bg-[#121314] text-[#1A1A18] dark:text-[#E8ECE9]"
      style={{ fontFamily: "Pretendard, LineSeed, sans-serif" }}
    >
      <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE8E1] dark:bg-zinc-800 text-[11px] font-bold text-[#1A1A18] dark:text-zinc-200 tracking-wider uppercase mb-4">
            MEMBERSHIP
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-[#111413] dark:text-white">
            간단하고 투명한 요금제
          </h2>
          <p className="text-[#68716D] dark:text-zinc-400 text-base sm:text-lg">
            문서 읽기부터 전문가 수준의 전 기능 출판까지, 필요한 만큼 시작하세요.
          </p>
        </div>

        {/* Plan List */}
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {dbPlans.map((plan, i) => {
            const isRegular = plan.plan_code === "REGULAR" || plan.is_highlighted;
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
                ? `($${plan.price_monthly_usd} / mo)`
                : plan.plan_code === "ELITEPRO" && plan.price_yearly_usd
                  ? `($${plan.price_yearly_usd} / yr)`
                  : plan.price_monthly_usd ? `($${plan.price_monthly_usd} / mo)` : plan.price_yearly_usd ? `($${plan.price_yearly_usd} / yr)` : "";

            const envLabel = plan.environment_name || plan.sys_type;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`relative p-6 sm:p-7 rounded-2xl transition-all duration-300 ${
                  isRegular
                    ? "bg-white dark:bg-[#1A1D22] border-2 border-[#06C755] shadow-[0_16px_40px_-10px_rgba(6,199,85,0.16)]"
                    : "bg-[#F2F0EB] dark:bg-[#17191E] border border-[#E0DED7] dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20 shadow-2xs"
                }`}
              >
                {/* Most Popular Badge */}
                {isRegular && (
                  <div className="absolute -top-3 right-6 bg-[#06C755] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-xs tracking-wider">
                    MOST POPULAR
                  </div>
                )}

                {/* Header: Tier emoji + Name + Environment + Price */}
                <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{plan.tier_emoji}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-extrabold text-[#111413] dark:text-white">
                          {plan.name}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isRegular
                            ? "bg-[#06C755]/15 text-[#06C755]"
                            : "bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        }`}>
                          {envLabel}
                        </span>
                      </div>
                      <p className="text-xs text-[#68716D] dark:text-zinc-400 mt-1">
                        {plan.tagline}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl sm:text-2xl font-extrabold text-[#111413] dark:text-white">
                      {priceDisplay}
                    </div>
                    {usdDisplay && (
                      <span className="text-xs text-[#68716D] dark:text-zinc-400 font-medium">
                        {usdDisplay}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="m-0 p-0 list-none space-y-1.5 pt-2 border-t border-zinc-200/60 dark:border-white/5">
                  {(plan.features || []).map((f: string, fi: number) => (
                    <li key={fi} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                      <span className="text-[#06C755] font-extrabold text-sm">✓</span>
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
