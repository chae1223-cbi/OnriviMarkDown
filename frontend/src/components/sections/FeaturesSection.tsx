// ====================================================================
// 📊 [OMD-UI-FeaturesSection-0023] FeaturesSection ➔ FeaturesSection
// 🎯 @KICK  : 제품의 6대 핵심 편의 기능 명세를 그리드 형식으로 바인딩하여 렌더링하는 피처 소개 섹션
// 🛡️ @GUARD : constants 에 정의된 features 리스트 구조 체크 및 FeatureCard index 바인딩
// 🚨 @PATCH : **2026-06-21** — OMDLanding UI 디자인 이식에 따른 신규 컴포넌트 생성 패치
//             **2026-06-22** — Luminous Arctic 디자인 시스템 라이트모드 적용 패치 (글래스 피처 카드, Inter 폰트)
// 🔗 @CALLS : FeatureCard, constants
// ====================================================================
import { features } from "@/lib/constants"; // features : constants에서 피처 데이터를 가져오기 위해 임포트 
import { FeatureCard } from "@/components/ui/FeatureCard"; // FeatureCard : 피처 카드를 사용하기 위해 임포트

// =====================================================================
// FeaturesSection : 제품의 6대 핵심 편의 기능 명세를 그리드 형식으로 바인딩하여 렌더링하는 피처 소개 섹션  
// 🛡️ @GUARD : constants 에 정의된 features 리스트 구조 체크 및 FeatureCard index 바인딩
// 🚨 @PATCH : **2026-06-21** — OMDLanding UI 디자인 이식에 따른 신규 컴포넌트 생성 패치
//             **2026-06-22** — Luminous Arctic 디자인 시스템 라이트모드 적용 패치 (글래스 피처 카드, Inter 폰트)
// 🔗 @CALLS : FeatureCard, constant  s
export function FeaturesSection() { // FeaturesSection : 제품의 6대 핵심 편의 기능 명세를 그리드 형식으로 바인딩하여 렌더링하는 피처 소개 섹션  
  return ( // return : 값을 반환
    <section // section : HTML 문서의 주요 콘텐츠를 정의하는 요소
      id="features"
      className="py-24 bg-surface text-on-surface"
      style={{ fontFamily: "LineSeed, Pretendard, sans-serif" }}
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <span className="chip mb-4">
            FEATURES
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface mb-3">
            Onrivi Author가 당신의 문서를 프로의 문정으로
          </h2>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            단 <strong>1픽셀</strong>의 오차도 용납하지 않는 <strong>6가지</strong> 핵심 역량.
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
