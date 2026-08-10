import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { BetaModal } from "@/components/ui/BetaModal";
import { EventsSection } from "@/components/sections/EventsSection";
import {
  features,
  faqs,
  NAV_LINKS,
} from "@/lib/constants";

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Onrivi Author",
            "operatingSystem": "Windows, macOS",
            "applicationCategory": "BusinessApplication",
            "description": "AI 시대의 무결점 지식 자산화 인프라. 마크다운의 생산성과 전문가 수준의 출판 품질을 결합한 로컬 우선 저작 플랫폼.",
            "offers": {
              "@type": "Offer",
              "price": "구독형",
              "priceCurrency": "KRW"
            },
            "author": {
              "@type": "Organization",
              "name": "Onrivi"
            }
          })
        }}
      />
      <div style={{ minHeight: "100vh", background: "#f7f9fb", fontFamily: "Inter, sans-serif" }}>
        <Navbar />
        <HeroSection />
        <EventsSection />
        <FeaturesSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
        <Footer />
      </div>
      <BetaModal />
    </>
  );
}
