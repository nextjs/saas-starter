import React from "react";
import PricingCard from "../../pricing/pricing-card";
import GradientText from "@/components/TextAnimations/GradientText/GradientText";

export default function page() {
  return (
    <div className="w-full h-auto text-primary text-center py-12">
      <div className="p-4 md:p-8 w-full h-full">
        <GradientText
          colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
          animationSpeed={3}
          showBorder={false}
          className="custom-class"
        >
          <h1 className="text-3xl font-bold">Purchase a subscription</h1>
        </GradientText>
        <h2 className="text-lg mb-10">Choose the plan that works for you.❤️</h2>
        <PricingCard />
      </div>
    </div>
  );
}
