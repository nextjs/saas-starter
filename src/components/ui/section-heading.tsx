import { ReactNode } from "react";

interface SectionHeadingProps {
  title: ReactNode;
  subtitle?: string;
  centered?: boolean;
}

export function SectionHeading({ title, subtitle, centered = false }: SectionHeadingProps) {
  return (
    <div className={`space-y-4 ${centered ? 'text-center' : ''} mb-12`}>
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h2>
      {subtitle && <p className={`text-lg text-gray-600 ${centered ? 'mx-auto' : ''} max-w-3xl`}>{subtitle}</p>}
    </div>
  );
} 