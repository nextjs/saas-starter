import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { SectionHeading } from './ui/section-heading';

export function CTASection() {
  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <SectionHeading
          title="Ready to Launch Your SaaS Product?"
          subtitle="Start building today with our comprehensive SaaS starter kit. No credit card required. Try it free for 7 days and see how quickly you can get your product to market."
          centered
        />
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-8">
          <Link href="/sign-up">
            <Button size="lg" className="rounded-full px-8 bg-blue-500 hover:bg-blue-600 w-full sm:w-auto">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="https://github.com/nextjs/saas-starter" target="_blank">
            <Button size="lg" variant="outline" className="rounded-full px-8 w-full sm:w-auto">
              View on GitHub
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
} 