import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

const Hero = () => {
  return (
    <section className="py-20 sm:py-28 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="max-w-4xl">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
                Build Your SaaS Faster Than Ever
              </h1>
              <p className="text-base sm:text-lg text-gray-600">
                Launch your SaaS product in record time with our powerful,
                ready-to-use template. Packed with modern technologies and
                essential integrations.
              </p>
            </div>
          </div>
          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-xs sm:max-w-none">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="text-base sm:text-lg rounded-full bg-gradient-to-r from-blue-500 to-blue-400 hover:bg-blue-600 cursor-pointer w-full sm:w-auto"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
