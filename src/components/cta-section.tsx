import { Layers } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { SectionHeading } from "./ui/section-heading";

export function CTASection() {
  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <SectionHeading
          title="Launch 10x faster with SaaS Stack."
          subtitle="Don't waste time on boilerplate—focus on what matters. Join thousands of founders building and launching faster with SaaSify."
          centered
        />
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <Link href="/sign-up">
            <Button
              size="lg"
              className="sm:text-md text-md rounded-lg cursor-pointer w-full sm:w-auto"
            >
              <Layers className="h-5 w-5" />
              Get SaaS Stack
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
