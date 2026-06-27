// ====================================================================
// 📊 [OMD-CORE-landing-page-0001] page ➔ Page
// 🎯 @KICK  : 통합 프리미엄 웹 SaaS 및 데스크톱 다운로드 유도 메인 랜딩페이지
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : **2026-06-21** — OMDLanding UI 및 레이아웃 컴포넌트 전면 이식 및 정합성 최적화 패치
//             **2026-06-22** — Luminous Arctic 디자인 시스템 라이트모드 배경 적용 패치
// 🔗 @CALLS : Navbar, Footer, HeroSection, FeaturesSection, PricingSection, FaqSection, CtaSection
// ====================================================================
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";

export default function Page() {
  return (
    <div style={{ minHeight: "100vh", background: "#f7f9fb", fontFamily: "Inter, sans-serif" }}>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </div>
  );
}

