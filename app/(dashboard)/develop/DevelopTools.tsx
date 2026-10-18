import Link from "next/link";

export type DevelopTool = "2design" | "3ddesign" | "estimate" | "submit";

export const developTools: {
  id: Exclude<DevelopTool, "submit">;
  label: string;
  href: string;
  description: string;
}[] = [
  {
    id: "2design",
    label: "2D Design",
    href: "/develop?tool=2design",
    description:
      "Create and edit your project's flat outline with the SVG design editor.",
  },
  {
    id: "3ddesign",
    label: "3D Design",
    href: "/develop?tool=3ddesign",
    description:
      "Turn your concept into a 3D model in the design editor and prepare it for printing.",
  },
  {
    id: "estimate",
    label: "Get Estimate",
    href: "/develop?tool=estimate",
    description:
      "Upload your STL, review its dimensions, choose material settings, and see an estimated print cost.",
  },
];

export default function DevelopTools({
  currentTool,
}: {
  currentTool?: DevelopTool;
}) {
  return (
    <nav aria-label="Project tools" className="mb-8 border-b border-gray-200">
      <ol className="flex gap-2 sm:gap-8">
        {developTools.map((tool) => {
          const isCurrent = currentTool !== undefined && tool.id === currentTool;

          return (
            <li key={tool.id}>
              <Link
                href={tool.href}
                aria-current={isCurrent ? "page" : undefined}
                className={`inline-flex min-h-12 items-center border-b-2 px-3 text-sm font-medium transition-colors sm:px-4 ${
                  isCurrent
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
                }`}
              >
                {tool.label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
