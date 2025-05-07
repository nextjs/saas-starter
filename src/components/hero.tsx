import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

const Hero = () => {
  return (
    <section className="py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">

          <div className="max-w-4xl">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold">
                Build Your SaaS Faster Than Ever
              </h1>
              <p className="text-lg text-gray-600">
                Launch your SaaS product in record time with our powerful,
                ready-to-use template. Packed with modern technologies and
                essential integrations.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="text-lg rounded-full bg-orange-500 hover:bg-orange-600"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="https://github.com/nextjs/saas-starter" target="_blank">
              <Button
                size="lg"
                variant="outline"
                className="text-lg rounded-full"
              >
                View on GitHub
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
