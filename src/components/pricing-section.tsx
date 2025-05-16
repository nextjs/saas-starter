"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { SectionHeading } from "./ui/section-heading";

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
  buttonText = "Get started",
}: PlanCardProps) {
  return (
    <div
      className={`rounded-lg ${popular ? "border-2 border-primary scale-105" : "border border-border"} p-8 relative bg-background`}
    >
      {popular && (
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </div>
      )}
      <h3 className="text-xl font-bold text-foreground mb-2">{name}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      <div className="mb-6">
        <span className="text-4xl font-bold text-foreground">${price}</span>
        <span className="text-muted-foreground">/{interval}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <Link href={name === "Enterprise" ? "/contact" : "/sign-up"}>
        <Button
          className={`w-full ${popular ? "bg-zinc-900 hover:bg-zinc-800" : ""}`}
          variant={popular ? "default" : "outline"}
        >
          {buttonText}
        </Button>
      </Link>
    </div>
  );
}

const plans = [
  {
    name: "Basic",
    oldPrice: "$99",
    price: "$19",
    features: [
      "Core features included",
      "Email support",
      "Access to standard resources",
      "Regular updates",
      "Single user license",
      "Community access",
      "One-time payment",
    ],
  },
  {
    name: "Professional",
    oldPrice: "$199",
    price: "$49",
    features: [
      "Everything in Basic, plus:",
      "Priority email support",
      "Advanced resource access",
      "Team collaboration tools",
      "Extended usage limits",
      "Early access to new features",
    ],
  },
  {
    name: "Enterprise",
    oldPrice: "$399",
    price: "Contact Us",
    features: [
      "Everything in Professional, and...",
      "Dedicated account manager",
      "Custom integrations",
      "Personalized onboarding",
      "Premium support",
      "Flexible licensing options",
      "Unlimited users",
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-10 sm:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Choose the plan that fits your needs"
          subtitle="Special introductory pricing available for a limited time"
          centered
        />
        <div className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className="bg-background p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col border border-border"
            >
              <h3 className="text-xl font-thin text-foreground mb-2">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-2 mb-4">
                {/* <span className="text-muted-foreground line-through text-lg">
                  {plan.oldPrice}
                </span> */}
                <span className="text-3xl font-medium text-primary">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">USD</span>
              </div>
              <ul className="mb-6 space-y-2 text-muted-foreground text-sm flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary font-thin">•</span> {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant="default"
                className="w-full hover:bg-primary/90 text-md font-medium py-5 rounded-md transition-colors"
              >
                Get {plan.name}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
