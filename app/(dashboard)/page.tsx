import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowRight,
  CircleIcon,
  CreditCard,
  Database,
} from "lucide-react";
import { Terminal } from "./terminal";
import BgAnimate from "./bg-animate";
import Link from "next/link";
import PricingCard from "./pricing/pricing-card";
import "@/app/assets/scss/bg-animate.scss";

export default function HomePage() {
  return (
    <main className="relative">
      <BgAnimate />
      <section className="py-25  flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              {/* from-[#45EC82] from-[0.16%] via-[#7079F3] via-[47.81%] to-[#75CEFC] to-100% bg-gradient-to-r */}
              {/* bg-gradient-to-l from-secondary from-25% to-foreground to-60% */}
              <h1 className="text-4xl font-bold py-2 tracking-tight sm:text-5xl md:text-6xl from-white from-[20%] via-[#7079F3] via-[27.81%] to-secondary to-100% bg-gradient-to-r bg-clip-text text-transparent">
                Create Your Agent
                <h1 className="block font-bold mt-2">Kol Alter Ego </h1>
              </h1>
              <p className="mt-3 text-lg text-white/80 sm:mt-5 sm:text-md lg:text-md xl:text-xl">
                Your kol agent to help you quickly manage posts, create buzz,
                and be a digital alter ego for you!
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Link href="/home">
                  <Button className="bg-white text-base hover:bg-gray-100 text-black border border-gray-200 rounded-full px-4 py-2 inline-flex items-center justify-center">
                    Launch Now
                    <ArrowRight className="ml-2 h-4 w-4 animate-float-right" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              {/* <Terminal /> */}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="">
              <div className="flex items-center justify-center rounded-md text-primary">
                <Activity />
              </div>
              <div className="mt-5 text-center">
                <h2 className="text-lg font-medium text-gray-900">
                  Next.js and React
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Leverage the power of modern web technologies for optimal
                  performance and developer experience.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center rounded-md text-primary">
                <Database className="h-6 w-6" />
              </div>
              <div className="mt-5 text-center">
                <h2 className="text-lg font-medium text-gray-900">
                  Postgres and Drizzle ORM
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Robust database solution with an intuitive ORM for efficient
                  data management and scalability.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center rounded-md text-primary">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="mt-5 text-center">
                <h2 className="text-lg font-medium text-gray-900">
                  Stripe Integration
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Seamless payment processing and subscription management with
                  industry-leading Stripe integration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Ready to have your doppelganger?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                He will help you to do anything to increase your extra income,
                or maybe you are a project owner, find quality kol to promote
                your product and post your tasks right!
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <Link href="/home">
                <Button className="bg-white hover:bg-gray-100 text-black border border-gray-200 rounded-full text-xl px-12 py-6 inline-flex items-center justify-center">
                  Experience it now
                  <ArrowRight className="ml-3 h-6 w-6 animate-float-right" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-animate-pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <h1 className="text-4xl text-center font-bold mb-10 bg-gradient-to-l from-[#0bbdb6] to-[#00d179] to-60% bg-clip-text text-transparent">
            Pricing
          </h1> */}
          <PricingCard />
        </div>
      </section>

      <footer className="w-full py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between">
            <div className="flex-1 flex flex-col gap-10">
              <Link href="/" className="flex items-center">
                <CircleIcon className="h-6 w-6 text-secondary" />
                <span className="ml-2 text-xl font-bold text-primary">
                  KOL AGENT
                </span>
              </Link>
              <p className="text-sm text-primary/80">
                © 2024 KOL AGENT. All rights reserved.
              </p>
            </div>
            {/* <div className="flex-1 flex gap-6">
              <div className="flex flex-col gap-4">
                <h2 className="text-white/80 text-base">About</h2>
                <span className="text-white text-sm">Pricing</span>
              </div>
              <div className="flex flex-col gap-4">
                <h2 className="text-white/80 text-base">App</h2>
                <span className="text-white text-sm">Launch App</span>
              </div>
            </div> */}
          </div>
        </div>
      </footer>
    </main>
  );
}
