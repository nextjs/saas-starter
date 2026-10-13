import Link from "next/link";

export type DevelopStep = "design" | "estimate" | "submit";

const steps: { id: DevelopStep; label: string; href: string }[] = [
  { id: "design", label: "Design", href: "/develop" },
  { id: "estimate", label: "Get Estimate", href: "/develop?step=estimate" },
];

export default function DevelopSteps({
  currentStep,
}: {
  currentStep: DevelopStep;
}) {
  return (
    <nav aria-label="Project steps" className="mb-8 border-b border-gray-200">
      <ol className="flex gap-2 sm:gap-8">
        {steps.map((step) => {
          const isCurrent = step.id === currentStep;

          return (
            <li key={step.id}>
              <Link
                href={step.href}
                aria-current={isCurrent ? "step" : undefined}
                className={`inline-flex min-h-12 items-center border-b-2 px-3 text-sm font-medium transition-colors sm:px-4 ${
                  isCurrent
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
                }`}
              >
                {step.label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
