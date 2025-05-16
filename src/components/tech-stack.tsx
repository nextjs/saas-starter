import Image from "next/image";
import { SectionHeading } from "./ui/section-heading";

interface TechItem {
  src: string;
  alt: string;
  label: string;
  className?: string;
}

const techRows: TechItem[][] = [
  [
    {
      src: "/typescript.svg",
      alt: "TypeScript",
      label: "TypeScript",
    },
    {
      src: "/nextjs.svg",
      alt: "Next.js",
      label: "Next.js",
      className: "text-gray-900",
    },
    {
      src: "/tailwindcss.svg",
      alt: "TailwindCSS",
      label: "TailwindCSS",
      className: "text-zinc-500",
    },
    {
      src: "/better-auth.svg",
      alt: "Better Auth",
      label: "Better Auth",
      className: "text-zinc-500",
    },
  ],
  [
    {
      src: "/drizzle.svg",
      alt: "Drizzle ORM",
      label: "Drizzle ORM",
      className: "text-zinc-500",
    },
    {
      src: "/supabase.svg",
      alt: "Supabase",
      label: "Supabase",
      className: "text-zinc-500",
    },
    {
      src: "/stripe.svg",
      alt: "Stripe",
      label: "Stripe",
      className: "text-zinc-500",
    },
    {
      src: "/resend.svg",
      alt: "Resend",
      label: "Resend",
      className: "text-zinc-500",
    },
  ],
];

const TechStackItem = ({ src, alt, label, className }: TechItem) => (
  <div className="flex flex-col items-center">
    <Image
      src={src}
      alt={alt}
      width={48}
      height={48}
      className={`h-10 w-10 sm:h-12 sm:w-12 ${className ?? ""}`}
    />
    <span className="mt-2 sm:mt-3 font-medium text-sm sm:text-base">{label}</span>
  </div>
);

const TechStack = () => {
  return (
    <section className="py-12 sm:py-16 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="The Tech Stack You're Already Using"
          subtitle="We've assembled the modern tech stack you already want to use, pre-configured and working together seamlessly."
          centered
        />
        {techRows.map((row, i) => (
          <div
            key={i}
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8 justify-items-center${i > 0 ? " mt-6 sm:mt-8" : ""}`}
          >
            {row.map((item) => (
              <TechStackItem key={item.alt} {...item} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default TechStack;
