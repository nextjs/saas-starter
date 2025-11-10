import { ImprovementChat } from '@/components/improvement-chat';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">
              Forbedre dine <span className="text-orange-500">Prompts</span> og{' '}
              <span className="text-orange-500">E-poster</span>
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              Bruk AI til å forbedre kvaliteten på dine prompts og e-poster på sekunder
            </p>
          </div>

          {/* Main Chat Interface */}
          <ImprovementChat />

          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-orange-100 p-3">
                  <svg
                    className="h-6 w-6 text-orange-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Rask Forbedring</h3>
              <p className="mt-2 text-gray-600">
                Få forbedrede tekster på sekunder med AI-drevet teknologi
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-orange-100 p-3">
                  <svg
                    className="h-6 w-6 text-orange-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Høy Kvalitet</h3>
              <p className="mt-2 text-gray-600">
                Forbedret klarhet, struktur og profesjonalitet i alle tekster
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-orange-100 p-3">
                  <svg
                    className="h-6 w-6 text-orange-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Trygg & Privat</h3>
              <p className="mt-2 text-gray-600">
                Dine tekster er sikre og private. GDPR-kompatibel.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
