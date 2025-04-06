"use client";
import StepOne from "./compontents/step1";
import StepTwo from "./compontents/step2";
import StepThree from "./compontents/step3";
import StepFour from "./compontents/step4";
import StepFive from "./compontents/step5";
import StepSix from "./compontents/step6";
import Stepper, { Step } from "@/app/components/comm/Stepper";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

export default function Page() {
  return (
    <div className="w-full h-full flex max-w-2xl mx-auto">
      <div className="w-full h-full">
        <Stepper
          initialStep={1}
          stepText={[
            "1. Info",
            "2. Ability",
            "3. Interactive",
            "4. Topics",
            "5. Configuration",
            "6. Profit",
          ]}
          onStepChange={(step) => {
            console.log(step);
          }}
          onFinalStepCompleted={() => console.log("All steps completed!")}
          backButtonText="Previous"
          nextButtonText="Next"
        >
          <Step>
            <ScrollArea className="w-full">
              <StepOne />
            </ScrollArea>
          </Step>
          <Step>
            <StepTwo />
          </Step>
          <Step>
            <StepThree />
          </Step>
          <Step>
            <StepFour />
          </Step>
          <Step>
            <ScrollArea className="w-full">
              <StepFive />
            </ScrollArea>
          </Step>
          <Step>
            <ScrollArea className="w-full">
              <StepSix />
            </ScrollArea>
          </Step>
        </Stepper>
      </div>
    </div>
  );
}
