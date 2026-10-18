import Link from "next/link";
import DevelopTools, { developTools } from "./DevelopTools";
import StlCostEstimator from "./StlCostEstimator";

export default async function DevelopPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string; step?: string }>;
}) {
  const { tool: requestedTool, step: legacyStep } = await searchParams;
  const tool = requestedTool ?? legacyStep;
  const currentTool =
    tool === "3ddesign" || tool === "estimate" ? tool : "2design";

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DevelopTools currentTool={tool ? currentTool : undefined} />
      {!tool ? (
        <section aria-labelledby="develop-title">
          <h1
            id="develop-title"
            className="text-3xl font-semibold tracking-tight text-gray-900"
          >
            Develop your project
          </h1>
          <p className="mt-2 max-w-3xl text-gray-600">
            Choose a design editor or get an estimate for your project.
          </p>
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {developTools.map((developTool) => (
              <li
                key={developTool.id}
                className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                <h2 className="mt-2 text-xl font-semibold text-gray-900">
                  {developTool.label}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">
                  {developTool.description}
                </p>
                <Link
                  href={developTool.href}
                  className="mt-6 inline-flex min-h-10 items-center justify-center self-start rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {developTool.id === "estimate"
                    ? "Get an estimate"
                    : `Open ${developTool.label}`}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : currentTool === "estimate" ? (
        <StlCostEstimator />
      ) : currentTool === "3ddesign" ? (
        <iframe
          title="3D design workspace"
          src="/develop/3ddesign"
          className="h-[calc(100vh-13rem)] min-h-[600px] w-full border-0"
        />
      ) : (
        <iframe
          title="2D SVG design editor"
          src="/develop/2ddesign/"
          className="h-[calc(100vh-13rem)] min-h-[600px] w-full border-0"
        />
      )}
    </main>
  );
}
