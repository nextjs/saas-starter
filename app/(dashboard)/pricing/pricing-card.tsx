"use client";
import React from "react";
import { Check } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PricingCardItem = ({
  name,
  price,
  features,
  isHot,
}: {
  name: string;
  price: number;
  features: string[];
  isHot: boolean;
}) => {
  return (
    <div
      className={cn(
        "w-full rounded-lg p-4 relative",
        isHot
          ? "bg-gradient-to-r from-[#ffe89a] to-[#ffcc26] p-[4px]"
          : "bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.1)]"
      )}
    >
      <div className={cn("h-full w-full bg-white rounded-lg p-4")}>
        <div className="text-lg text-black/50 flex items-end gap-0 ">
          {isHot && (
            <DotLottieReact
              className="w-10"
              src="https://lottie.host/a29399ea-d1c9-48b1-b41a-faef7f9d83cb/gVmyM7MHgh.lottie"
              autoplay
              loop
            />
          )}
          <span className="flex font-bold items-center gap-0 text-base">
            {name} Plan
          </span>
        </div>
        <div className="py-10 text-[#00d179] flex items-end gap-2">
          <span className="text-5xl font-bold">${price}</span>
          <span className="text-base">USDT</span>
        </div>
        <div className="w-full mb-6">
          <Button
            variant="primary"
            className={cn(
              "w-full text-base font-bold",
              isHot &&
                "from-[#ffe89a] to-[#ffcc26] cursor-default pointer-events-none"
            )}
          >
            {isHot ? "Active" : "Subscribe"}
          </Button>
        </div>
        <ul className="flex flex-col justify-start gap-1">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-1">
              {/* <Check className="w-3 h-3 text-green-500" /> */}
              <span className="text-md text-primary/60 text-left">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default function PricingCard() {
  const pricingCardItems = [
    {
      name: "Platinum",
      price: 1.99,
      description: "To infinity and beyond",
      period: "day",
      features: ["✅ Bonus 200k credits/mo (About 8 replies/mo)", "✅ 1 active agent", "✅ Browser automation"],
      isHot: false,
    },
    {
      name: "Diamond",
      description: "Jump into another dimension",
      price: 19.59,
      period: "month",
      isHot: true,
      features: [
        "✅ 750k credits/mo (About 30 replies/mo)",
        "✅ 1 active agent",
        "✅ Browser automation",
      ],
    },
    {
      name: "Gold",
      description: "Massive AI power to your community",
      price: 129.99,
      period: "year",
      features: ["✅ 3m credits/mo (About 150 replies/mo)", "✅ 3 active agents ⬆️", "✅ Browser automation", "✅ Priority generation queue"],
      isHot: false,
    },
    {
      name: "Silver",
      description: "The way to go when you need more",
      price: 199,
      period: "permanent",
      features: ["✅ 6m credits/mo (About 300 replies/mo)", "✅ 5 active agents ⬆️ ⬆️", "✅ Browser automation", "✅ Priority generation queue"],
      isHot: false,
    },
  ];
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pricingCardItems.map((item) => (
        <PricingCardItem key={item.name} {...item} />
      ))}
    </div>
  );
}
