import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import {
  features,
  faqs,
  plans,
  NAV_LINKS,
} from "@/lib/constants";

export default function HomePage() {
  return (
    <>
      <div style={{ minHeight: "100vh", background: "#f7f9fb", fontFamily: "Inter, sans-serif" }}>
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
        <Footer />
      </div>
    </>
  );
}
