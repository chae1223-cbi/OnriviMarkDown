import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { PhilosophySection } from "@/components/sections/PhilosophySection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { DocumentGallerySection } from "@/components/sections/DocumentGallerySection";
import { PricingSection } from "@/components/sections/PricingSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { BetaModal } from "@/components/ui/BetaModal";

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
            "description": "AI 시대의 무결점 지식 자산화 인프라. 생각은 Markdown으로 빠르게, 결과물은 사람이 읽는 아름다운 문서처럼.",
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
      <div className="min-h-screen bg-[#F9F8F6] dark:bg-[#121314] text-[#1A1A18] dark:text-[#E8ECE9] font-sans selection:bg-[#06C755]/20 selection:text-[#06C755]">
        <Navbar />
        <HeroSection />
        <PhilosophySection />
        <ExperienceSection />
        <DocumentGallerySection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
        <Footer />
      </div>
      <BetaModal />
    </>
  );
}
