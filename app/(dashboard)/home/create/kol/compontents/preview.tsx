"use client";

import { useEffect, useState } from "react";

import PreviewProfile from "./preview-profile";
import { ScrollArea } from "@/components/ui/scroll-area";
import PreviewStepOne from "./preview-step1";
import PreviewStepTwo from "./preview-step2";
import PreviewStepThree from "./preview-step3";
import PreviewStepFour from "./preview-step4";
import PreviewStepFive from "./preview-step5";
import PreviewStepSix from "./preview-step6";

export default function Preview() {
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    const onUpdate = (evt: any) => {
      setCurrentStep(evt.detail.step);
    };

    globalThis.addEventListener("update-step", onUpdate);

    return () => {
      globalThis.removeEventListener("update-step", onUpdate);
    };
  }, []);

  return (
    <div className="w-lg bg-foreground h-dvh shadow-sm flex flex-col">
      <div className="border-b border-border">
        <PreviewProfile />
      </div>
      <div className="flex-1 w-full h-full overflow-auto box-border py-4">
        <ScrollArea className="w-full h-full">
          {currentStep === 1 && <PreviewStepOne />}
          {currentStep === 2 && <PreviewStepTwo />}
          {currentStep === 3 && <PreviewStepThree />}
          {currentStep === 4 && <PreviewStepFour />}
          {currentStep === 5 && <PreviewStepFive />}
          {currentStep === 6 && <PreviewStepSix />}
        </ScrollArea>
      </div>
    </div>
  );
}
