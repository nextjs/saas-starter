import { ReactNode } from "react";

interface SectionHeadingProps {
  title: ReactNode;
  subtitle?: string;
  centered?: boolean;
}

export function SectionHeading({ title, subtitle, centered = false }: SectionHeadingProps) {
  return (
    <div className={`space-y-3 sm:space-y-4 ${centered ? 'text-center' : ''} mb-8 sm:mb-12`}>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900">{title}</h2>
      {subtitle && <p className={`text-base sm:text-lg text-gray-600 ${centered ? 'mx-auto' : ''} max-w-3xl`}>{subtitle}</p>}
    </div>
  );
} 