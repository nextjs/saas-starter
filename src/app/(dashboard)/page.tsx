import { CTASection } from "@/src/components/cta-section";
import { FAQSection } from "@/src/components/faq-section";
import { FeaturesSection } from "@/src/components/features-section";
import { Footer } from "@/src/components/footer";
import Hero from "@/src/components/hero";
import { PricingSection } from "@/src/components/pricing-section";
import TechStack from "@/src/components/tech-stack";
import { TestimonialsSection } from "@/src/components/testimonials-section";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main>
        <Hero />
        <TechStack />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
