import { Button } from "@/components/ui/button";
import { ArrowRight, CreditCard, Database } from "lucide-react";
import { Terminal } from "./terminal";
import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
            From idea to object,
            <span className="block text-red-500">Make it real!</span>
          </h1>
        </div>
      </section>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl md:text-4xl">
            Custom 3D design and production for products the world hasn't seen
            yet — and for the ones you need made exactly your way.
          </h2>
        </div>
      </section>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          We are still working on things, so if you want to get in touch while
          we are working on the site, email{" "}
          <Link
            href="mailto:admin@lastlayer.ca"
            className="underline text-red-500"
          >
            admin@lastlayer.ca
          </Link>
        </div>
      </section>
    </main>
  );
}
