'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { SectionHeading } from './ui/section-heading';

interface PlanCardProps {
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText?: string;
}

function PlanCard({ 
  name, 
  price, 
  interval, 
  description, 
  features, 
  popular = false,
  buttonText = "Get started" 
}: PlanCardProps) {
  return (
    <div className={`rounded-lg ${popular ? 'border-2 border-zinc-900 scale-105' : 'border border-gray-200'} p-8 relative`}>
      {popular && (
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-zinc-900 text-white px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <div className="mb-6">
        <span className="text-4xl font-bold text-gray-900">${price}</span>
        <span className="text-gray-600">/{interval}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-zinc-900 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <Link href={name === 'Enterprise' ? '/contact' : '/sign-up'}>
        <Button 
          className={`w-full ${popular ? 'bg-zinc-900 hover:bg-zinc-800' : ''}`}
          variant={popular ? 'default' : 'outline'}
        >
          {buttonText}
        </Button>
      </Link>
    </div>
  );
}

const plans = [
  {
    name: "Starter",
    oldPrice: "$299",
    price: "$199",
    features: [
      "Next.js boilerplate",
      "SEO & Blog",
      "Email integration (Mailgun)",
      "Stripe / Lemon Squeezy payments",
      "MongoDB / Supabase support",
      "Google OAuth & Magic Links",
      "Prebuilt components & animations",
      "AI-generated legal docs",
      "Community access",
      "$1,200+ in partner discounts",
      "Lifetime updates",
      "One-time payment, unlimited projects"
    ]
  },
  {
    name: "Pro",
    oldPrice: "$349",
    price: "$249",
    features: [
      "Everything in Starter, plus:",
      "Advanced analytics",
      "Priority support",
      "Extended integrations",
      "Early access to new features"
    ]
  },
  {
    name: "BUNDLE",
    oldPrice: "$648",
    price: "$299",
    features: [
      "Everything in Pro, and...",
      "SaaSify LaunchLab ($299 value)",
      "Learn to build and launch a SaaS from scratch",
      "12+ hours of actionable content",
      "Entrepreneur mindset training",
      "Community Q&A and support",
      "One-time payment, unlimited access!"
    ]
  }
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-10 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Save hours of development, launch faster, and grow your business!"
          subtitle="$100 off for the first 5000 customers (9 left)"
          centered
        />
        <div className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-gray-400 line-through text-lg">{plan.oldPrice}</span>
                <span className="text-3xl font-extrabold text-zinc-900">{plan.price}</span>
                <span className="text-sm text-gray-500">USD</span>
              </div>
              <ul className="mb-6 space-y-2 text-gray-700 text-sm flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-zinc-900 font-bold">•</span> {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-2 rounded-xl transition-colors">Get {plan.name}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 