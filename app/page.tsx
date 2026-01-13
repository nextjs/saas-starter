'use client';

import { ArrowRight, BarChart3, Zap, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { PublicNav } from '@/components/PublicNavigation';
import { Footer } from '@/components/Footer';
import { AuthProvider } from '@/lib/context/AuthContext';

export default function LandingPage() {
  return (
    <AuthProvider>
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900">
      {/* Navigation */}
      <PublicNav />

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          Unlock the Power of <span className="text-orange-400">Property Intelligence</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
          Access comprehensive parcel data, analytics, and insights to make informed real estate decisions. Empower your business with GeoSelect.It.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center px-2">
          <Link href="/sign-up" className="px-6 sm:px-8 py-3 sm:py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base">
            Start Free Trial
            <ArrowRight className="h-4 sm:h-5 w-4 sm:w-5" />
          </Link>
          <Link href="/search" className="px-6 sm:px-8 py-3 sm:py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition text-sm sm:text-base">
            Explore Demo
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-8 sm:mb-12">Powerful Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-lg border border-slate-700 hover:border-orange-500 transition">
            <BarChart3 className="h-8 sm:h-10 w-8 sm:w-10 text-orange-500 mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Advanced Analytics</h3>
            <p className="text-sm sm:text-base text-gray-400">
              Real-time insights and comprehensive reports on parcel data, market trends, and property valuations.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-lg border border-slate-700 hover:border-orange-500 transition">
            <Zap className="h-8 sm:h-10 w-8 sm:w-10 text-orange-500 mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Lightning Fast</h3>
            <p className="text-sm sm:text-base text-gray-400">
              Instantly search, filter, and analyze millions of parcels with our optimized platform.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-lg border border-slate-700 hover:border-orange-500 transition">
            <Users className="h-8 sm:h-10 w-8 sm:w-10 text-orange-500 mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Team Collaboration</h3>
            <p className="text-sm sm:text-base text-gray-400">
              Work seamlessly with your team using shared workspaces, notes, and collaborative tools.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-8 sm:mb-12">Plans for Every Need</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            { name: 'Browse', price: 'Free', features: ['Search parcels', 'Basic filters', 'Limited results'] },
            { name: 'Home', price: '$29', features: ['Unlimited search', 'Advanced filters', 'Property details'] },
            { name: 'Studio', price: '$79', features: ['All Home features', 'Analytics dashboard', 'Export data'] },
            { name: 'Pro + Workspace', price: '$199', features: ['Team workspaces', 'CRM integration', 'Custom reports'] },
            { name: 'Pro + CRM', price: '$299', features: ['All Pro features', 'Advanced CRM', 'Contact management'] },
            { name: 'Pro + AI', price: '$499', features: ['All Pro features', 'AI insights', 'Predictive analytics'] },
          ].map((plan) => (
            <div key={plan.name} className="bg-slate-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-lg border border-slate-700 hover:border-orange-500 transition flex flex-col">
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-2xl sm:text-3xl font-bold text-orange-400 mb-4 sm:mb-6">{plan.price}</p>
              <ul className="space-y-2 mb-6 sm:mb-8 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm sm:text-base text-gray-300">
                    <CheckCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="w-full px-4 py-2 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition text-center text-sm sm:text-base">
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">There's Truth in Every Parcel</h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
           Ready to get started? 
        </p>
        <Link href="/sign-up" className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition text-sm sm:text-base">
          Start Your Free Trial Today
        </Link>
      </section>

      <Footer />
      </main>
    </AuthProvider>
  );
}
