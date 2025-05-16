import { Layers, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

const Hero = () => {
  return (
    <section className="bg-background py-12 sm:py-28 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="max-w-5xl">
            <div className="space-y-4 flex flex-col items-center">
              <h1 className="light:effect-font-gradient dark:effect-font-gradient-dark text-3xl sm:text-5xl md:text-6xl font-thin tracking-loose text-foreground">
                Build and Launch in a Weekend
              </h1>
              <p className="max-w-xl text-base sm:text-lg text-muted-foreground">
                The Next.js boilerplate packed with everything you need to
                create your SaaS, AI tool, or web app—and start earning online,
                fast.
              </p>
              <div className="flex flex-col items-center mt-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <span className="mt-2 text-sm text-muted-foreground">
                  Trusted by 1000+ founders
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center w-full">
            <Button
              asChild
              size="lg"
              variant="default"
              className="font-medium text-md"
            >
              <Link href="/sign-up">
                <Layers className="h-5 w-5" />
                Get SaaS Stack
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
