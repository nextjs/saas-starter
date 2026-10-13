import DevelopSteps from "./DevelopSteps";
import StlCostEstimator from "./StlCostEstimator";

export default async function DevelopPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = await searchParams;
  const showEstimate = step === "estimate";

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DevelopSteps currentStep={showEstimate ? "estimate" : "design"} />
      {showEstimate ? (
        <StlCostEstimator />
      ) : (
        <iframe
          title="JumpStart 3D design workspace"
          src="/develop/design"
          className="h-[calc(100vh-13rem)] min-h-[600px] w-full border-0"
        />
      )}
    </main>
  );
}
