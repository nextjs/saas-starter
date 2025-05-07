import Image from "next/image";
import { SectionHeading } from "./ui/section-heading";

const TechStack = () => {
  return (
    <section className="py-16 bg-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Built with Modern Technology"
          subtitle="Powered by the latest web technologies for performance and reliability"
          centered
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
          <div className="flex flex-col items-center">
            <Image
              src="/typescript.svg"
              alt="TypeScript"
              width={48}
              height={48}
              className="h-12 w-12"
            />
            <span className="mt-3 font-medium">TypeScript</span>
          </div>

          <div className="flex flex-col items-center">
            <Image
              src="/nextjs.svg"
              alt="Next.js"
              width={48}
              height={48}
              className="h-12 w-12 text-gray-900"
            />
            <span className="mt-3 font-medium">Next.js</span>
          </div>

          <div className="flex flex-col items-center">
            <Image
              src="/tailwindcss.svg"
              alt="TailwindCSS"
              width={48}
              height={48}
              className="h-12 w-12 text-blue-500"
            />
            <span className="mt-3 font-medium">TailwindCSS</span>
          </div>

          <div className="flex flex-col items-center">
            <Image
              src="/better-auth.svg"
              alt="Better Auth"
              width={48}
              height={48}
              className="h-12 w-12 text-blue-500"
            />
            <span className="mt-3 font-medium">Better Auth</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center mt-8">
          <div className="flex flex-col items-center">
            <Image
              src="/drizzle.svg"
              alt="Drizzle ORM"
              width={48}
              height={48}
              className="h-12 w-12 text-blue-500"
            />
            <span className="mt-3 font-medium">Drizzle ORM</span>
          </div>

          <div className="flex flex-col items-center">
            <Image
              src="/supabase.svg"
              alt="Supabase"
              width={48}
              height={48}
              className="h-12 w-12 text-blue-500"
            />
            <span className="mt-3 font-medium">Supabase</span>
          </div>

          <div className="flex flex-col items-center">
            <Image
              src="/stripe.svg"
              alt="Stripe"
              width={48}
              height={48}
              className="h-12 w-12 text-blue-500"
            />
            <span className="mt-3 font-medium">Stripe</span>
          </div>

          <div className="flex flex-col items-center">
            <Image
              src="/openai.svg"
              alt="OpenAI"
              width={48}
              height={48}
              className="h-12 w-12 text-blue-500"
            />
            <span className="mt-3 font-medium">OpenAI</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStack;
