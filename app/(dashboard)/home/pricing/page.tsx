import React from "react";
import PricingCard from "../../pricing/pricing-card";
import GradientText from "@/components/TextAnimations/GradientText/GradientText";
import Aurora from "@/components/Backgrounds/Aurora/Aurora";

export default function page() {
  return (
    <div className="w-full h-full flex flex-col gap-4 text-primary text-center">
      <div className="absolute inset-0 w-full h-full">
        {/* <Aurora
          colorStops={["#45EC82", "#7079F3", "#75CEFC"]}
          blend={1}
          amplitude={2.0}
          speed={0.5}
        /> */}
      </div>
      <div className="p-4 md:p-8 w-full h-full flex flex-col items-center justify-center">
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
