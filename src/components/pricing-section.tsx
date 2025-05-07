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
    <div className={`rounded-lg ${popular ? 'border-2 border-orange-500 scale-105' : 'border border-gray-200'} p-8 relative`}>
      {popular && (
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
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
            <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <Link href="/sign-up">
        <Button 
          className={`w-full ${popular ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
          variant={popular ? 'default' : 'outline'}
        >
          {buttonText}
        </Button>
      </Link>
    </div>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Simple, Transparent Pricing"
          subtitle="No hidden fees. No complicated pricing. Choose the plan that works best for your team."
          centered
        />
        
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <PlanCard
            name="Starter"
            price={9}
            interval="month"
            description="Perfect for solo founders and small projects."
            features={[
              "Unlimited Projects",
              "Up to 3 Team Members",
              "Basic Analytics",
              "Email Support",
              "7-day Free Trial"
            ]}
          />
          
          <PlanCard
            name="Pro"
            price={29}
            interval="month"
            description="Ideal for growing startups and small teams."
            features={[
              "Everything in Starter, plus:",
              "Unlimited Team Members",
              "Advanced Analytics",
              "Priority Support",
              "API Access",
              "Custom Integrations"
            ]}
            popular
          />
          
          <PlanCard
            name="Enterprise"
            price={99}
            interval="month"
            description="For established businesses with advanced needs."
            features={[
              "Everything in Pro, plus:",
              "Dedicated Account Manager",
              "Custom Branding",
              "24/7 Phone Support",
              "SLA Agreement",
              "Advanced Security Features"
            ]}
            buttonText="Contact Sales"
          />
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Have questions about our pricing? <a href="#" className="text-orange-500 hover:underline">Contact us</a>
          </p>
        </div>
      </div>
    </section>
  );
} 