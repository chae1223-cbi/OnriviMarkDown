// ====================================================================
// 📊 [OMD-UI-FeaturesSection-0023] FeaturesSection ➔ FeaturesSection
// 🎯 @KICK  : 제품의 6대 핵심 편의 기능 명세를 그리드 형식으로 바인딩하여 렌더링하는 피처 소개 섹션
// 🛡️ @GUARD : constants 에 정의된 features 리스트 구조 체크 및 FeatureCard index 바인딩
// 🚨 @PATCH : **2026-06-21** — OMDLanding UI 디자인 이식에 따른 신규 컴포넌트 생성 패치
//             **2026-06-22** — Luminous Arctic 디자인 시스템 라이트모드 적용 패치 (글래스 피처 카드, Inter 폰트)
// 🔗 @CALLS : FeatureCard, constants
// ====================================================================
import { features } from "@/lib/constants";
import { FeatureCard } from "@/components/ui/FeatureCard";

export function FeaturesSection() {
  return (
    <section
      id="features"
      style={{ padding: "96px 0", background: "rgba(255,255,255,0.7)", fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <span
            style={{
              display: "inline-block",
              marginBottom: 16,
              padding: "4px 16px",
              borderRadius: 9999,
              background: "rgba(125,211,252,0.2)",
              color: "#006591",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            FEATURES
          </span>
          <h2
            style={{
              fontSize: "clamp(24px, 3vw, 32px)",
              fontWeight: 600,
              lineHeight: "40px",
              letterSpacing: "-0.01em",
              color: "#0f172a",
              marginBottom: 12,
            }}
          >
            온리비 어서가 당신의 문서를 프로의 문정으로
          </h2>
          <p style={{ fontSize: 18, color: "#3e4850", lineHeight: "28px" }}>
            단 1픽셀의 오차도 용납하지 않는 6가지 핵심 역량.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
