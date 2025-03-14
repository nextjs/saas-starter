import { Button } from '@/components/ui/button';
import { ArrowRight, WandSparkles , TrendingUpDown , Cable  } from 'lucide-react';
import { Terminal } from './terminal';

export default function HomePage() {
  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                Position Builder
                <span className="block text-orange-500">Average Down with Confidence</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Position Builder automates your dollar-cost averaging strategy
                by monitoring your portfolio and executing ‘average down’ trades
                based on your personalized priorities. Simplify your trading and
                give yourself the edge of consistent cost-basis management.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0"> 
                <a href="/sign-up">
                  <Button className="bg-white hover:bg-gray-100 text-black border border-gray-200 rounded-full text-lg px-8 py-4 inline-flex items-center justify-center">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <img src="averaging_down.gif" alt="Trading Automation Preview" className="w-full rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            
            {/* Feature 1 - Alpaca Integration */}
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Cable className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Alpaca Brokerage Integration
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Trade seamlessly through Alpaca’s powerful API—monitor and
                  place orders on your connected account with Position Builder’s
                  automated logic.
                </p>
              </div>
            </div>

            {/* Feature 2 - Priority-Based Averaging Down */}
            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <TrendingUpDown className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Priority-Based Averaging Down
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Define which stocks or crypto assets to average down first—
                  our priority list ensures your most important holdings get
                  addressed at the right moments.
                </p>
              </div>
            </div>

            {/* Feature 3 - Future Premium Features */}
            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <WandSparkles  className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Future Premium Features
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  We plan to integrate premium analytics and subscription
                  tiers—pay securely if you want extras like extended scheduling,
                  expanded notifications, or advanced charting.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Ready to simplify your DCA strategy?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Position Builder is your automated partner for leveling out your
                cost basis. By scheduling regular checks and purchasing when
                your holdings dip below your average, you get consistency and
                clarity. Focus on the trades that matter—let us handle the rest.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <a href="/sign-up">
                <Button className="bg-white hover:bg-gray-100 text-black border border-gray-200 rounded-full text-xl px-12 py-6 inline-flex items-center justify-center">
                  Register Today
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
