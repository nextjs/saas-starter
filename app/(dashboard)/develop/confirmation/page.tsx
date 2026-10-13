import Link from "next/link";
import { Check } from "lucide-react";
import DevelopSteps from "../DevelopSteps";

export default function ConfirmationPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DevelopSteps currentStep="submit" />
      <section
        aria-labelledby="confirmation-title"
        className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white px-6 py-12 text-center shadow-sm"
      >
        <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-green-100 text-green-700">
          <Check aria-hidden="true" className="size-6" />
        </div>
        <h1
          id="confirmation-title"
          className="text-2xl font-semibold text-gray-900"
        >
          Submission complete
        </h1>
        <p className="mt-3 text-gray-600">
          Thank you. Your project request has been submitted successfully.
        </p>
        <Link
          href="/develop"
          className="mt-8 inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to Design
        </Link>
      </section>
    </main>
  );
}
