import { type LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description
}: FeatureCardProps) {
  return (
    <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
      <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-blue-600 text-white">
        <Icon className="size-5" />
      </div>
      <h3 className="text-lg font-semibold text-blue-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-blue-900/70">{description}</p>
    </article>
  );
}
