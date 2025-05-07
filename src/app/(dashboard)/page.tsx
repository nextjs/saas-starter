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
    <div className="flex flex-col min-h-screen scroll-smooth">
      <main className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section id="hero"><Hero /></section>
        <section id="tech"><TechStack /></section>
        <section id="features"><FeaturesSection /></section>
        <section id="pricing"><PricingSection /></section>
        <section id="testimonials"><TestimonialsSection /></section>
        <section id="faq"><FAQSection /></section>
        <section id="cta"><CTASection /></section>
      </main>
      <Footer />
    </div>
  );
}
