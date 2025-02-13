import { Button } from '@/components/ui/button';
import { ArrowRight, CreditCard, Database } from 'lucide-react';
import { Terminal } from './terminal';

export default function HomePage() {
  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                RouteFlo AI Services
                <span className="block text-orange-500">Boost Sales with AI Insights</span>
              </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Get personalized training from our AI sales trainer. Enhance your sales skills and strategies with cutting-edge AI technology.
                </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <a
                  href="https://vercel.com/templates/next.js/next-js-saas-starter"
                  target="_blank"
                >
                  <Button className="bg-white hover:bg-gray-100 text-black border border-gray-200 rounded-full text-lg px-8 py-4 inline-flex items-center justify-center">
                    Talk to Demo Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <img
              src="images/2people.png"
              alt="Two people talking to AI"
              className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
              <svg viewBox="0 0 24 24" className="h-6 w-6">
                <path
                fill="currentColor"
                d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14.93V17h-2v-2h2v1.93a8.001 8.001 0 01-6.93-6.93H7v-2H5.07A8.001 8.001 0 0112 4.07V5h2V3h-1.93a8.001 8.001 0 016.93 6.93H17v2h1.93A8.001 8.001 0 0113 16.93z"
                />
              </svg>
              </div>
              <div className="mt-5">
              <h2 className="text-lg font-medium text-gray-900">
                AI Sales Trainer
              </h2>
              <p className="mt-2 text-base text-gray-500">
                Leverage AI to get personalized sales training, insights, and
                strategies to boost your sales performance and close more deals.
              </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
              <CreditCard className="h-6 w-6" />
              </div>
              <div className="mt-5">
              <h2 className="text-lg font-medium text-gray-900">
                Customer Service Excellence
              </h2>
              <p className="mt-2 text-base text-gray-500">
                Elevate your customer service with AI-driven insights and tools. Enhance customer satisfaction and loyalty with personalized support and efficient service management.
              </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <svg viewBox="0 0 24 24" className="h-6 w-6">
                <path
                  fill="currentColor"
                  d="M6.62 10.79a15.91 15.91 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.36 11.36 0 003.58.61 1 1 0 011 1v3.78a1 1 0 01-1 1A16 16 0 013 4a1 1 0 011-1h3.78a1 1 0 011 1 11.36 11.36 0 00.61 3.58 1 1 0 01-.27 1.11l-2.2 2.2z"
                />
                </svg>
                </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                Cold Call Mastery
                </h2>
                <p className="mt-2 text-base text-gray-500">
                Improve your cold calling techniques with AI-powered insights. Increase your success rate and close more deals with data-driven strategies and personalized coaching.
                </p>
              </div>
            </div>

      
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <footer className="bg-gray-800 py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                <div>
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Contact Us
                </h2>
                <p className="mt-3 max-w-3xl text-lg text-gray-400">
                  Have questions or need help? Reach out to our support team for assistance.
                </p>
                <p className="mt-3 max-w-3xl text-lg text-gray-400">
                  Email: support@yourbusiness.com | Phone: (123) 456-7890
                </p>
                </div>
                <div className="flex justify-end lg:col-span-1 lg:justify-end">
                <img
                  src="images/routeflo.png"
                  alt="Company Logo"
                  className="h-12 w-auto"
                />
                </div>
              </div>
              </div>
            </footer>
           
        </div>
      </section>
    </main>
  );
}
