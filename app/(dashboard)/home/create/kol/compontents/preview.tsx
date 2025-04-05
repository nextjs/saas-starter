"use client";

import { useEffect, useState } from "react";
import { Link, CalendarDays } from "lucide-react";

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
      <div className="border-b border-border text-md">
        <div className="h-48 relative bg-primary/10">
          <div className="absolute bottom-0 left-4 w-28 h-28 rounded-full bg-muted-foreground border-4 translate-y-1/2 border-background"></div>
        </div>
        <div className="p-4 space-y-4">
          <div className="h-10"></div>
          <dl>
            <dt className="text-xl font-bold">KOL Agent</dt>
            <dd className="text-muted-foreground">@KOLAGENT</dd>
          </dl>
          <p>PROGRAMMED TO KOL AGENT</p>
          <ul className="flex space-x-4 items-center">
            <li className="flex items-center space-x-1">
              <Link className="w-4 h-4 text-muted-foreground" />
              <span className="text-blue underline">kol-agent.com</span>
            </li>
            <li className="flex items-center space-x-1">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Joined January 2025</span>
            </li>
          </ul>
          <ul className="flex space-x-4 items-center">
            <li className="space-x-1">
              <strong className="font-bold">21</strong>
              <span className="text-muted-foreground">Following</span>
            </li>
            <li className="space-x-1">
              <strong className="font-bold">640K</strong>
              <span className="text-muted-foreground">Followers</span>
            </li>
          </ul>
        </div>
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
