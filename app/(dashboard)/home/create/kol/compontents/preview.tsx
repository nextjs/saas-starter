"use client";

import { useEffect, useState, useRef } from "react";

import PreviewProfile from "./preview-profile";
import { ScrollArea } from "@/components/ui/scroll-area";
import PreviewStepOne from "./preview-step1";
import PreviewStepTwo from "./preview-step2";
import PreviewStepThree from "./preview-step3";
import PreviewStepFour from "./preview-step4";
import PreviewStepFive from "./preview-step5";
import PreviewStepSix from "./preview-step6";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { updateConfig } from "@/app/store/reducers/userSlice";

export default function Preview() {
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector((state) => state.userReducer.config.currentStep);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [contentChanged, setContentChanged] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const mouseLeaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onUpdate = (evt: any) => {
      dispatch(updateConfig({ key: "currentStep", value: evt.detail.step }));
    };

    globalThis.addEventListener("update-step", onUpdate);

    return () => {
      globalThis.removeEventListener("update-step", onUpdate);
    };
  }, []);

  const scrollToBottom = () => {
    if (shouldAutoScroll && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const handleMouseEnter = () => {
    setShouldAutoScroll(false);
    
    if (mouseLeaveTimerRef.current) {
      clearTimeout(mouseLeaveTimerRef.current);
      mouseLeaveTimerRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (mouseLeaveTimerRef.current) {
      clearTimeout(mouseLeaveTimerRef.current);
    }
    
    mouseLeaveTimerRef.current = setTimeout(() => {
      setShouldAutoScroll(true);
      scrollToBottom();
      mouseLeaveTimerRef.current = null;
    }, 500);
  };

  useEffect(() => {
    setContentChanged(true);
  }, [currentStep]);

  useEffect(() => {
    if (!scrollAreaRef.current) return;
    
    const observer = new MutationObserver(() => {
      scrollToBottom();
    });
    
    const config = { 
      childList: true, 
      subtree: true,
      characterData: true,
      attributes: true 
    };
    
    observer.observe(scrollAreaRef.current, config);
    
    return () => {
      observer.disconnect();
    };
  }, [shouldAutoScroll]);

  useEffect(() => {
    if (contentChanged && shouldAutoScroll) {
      const timer = setTimeout(() => {
        scrollToBottom();
        setContentChanged(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [contentChanged, shouldAutoScroll]);

  useEffect(() => {
    return () => {
      if (mouseLeaveTimerRef.current) {
        clearTimeout(mouseLeaveTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="w-3xs lg:w-xs bg-foreground h-dvh shadow-sm flex flex-col">
      <div className="border-b border-border">
        <PreviewProfile />
      </div>
      <div 
        className="flex-1 w-full h-full overflow-auto box-border py-4"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ScrollArea className="w-full h-full" ref={scrollAreaRef}>
          {currentStep === 1 && <PreviewStepOne />}
          {currentStep === 2 && <PreviewStepTwo />}
          {currentStep === 3 && <PreviewStepThree />}
          {currentStep === 4 && <PreviewStepFour />}
          {currentStep === 5 && <PreviewStepFour />}
          {currentStep === 6 && <PreviewStepSix />}
        </ScrollArea>
      </div>
    </div>
  );
}
