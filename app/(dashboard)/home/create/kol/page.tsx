"use client";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import StepOne from "./compontents/step1";
import StepTwo from "./compontents/step2";
import StepThree from "./compontents/step3";
import StepFour from "./compontents/step4";
import StepFive from "./compontents/step5";
import StepSix from "./compontents/step6";
import Stepper, { Step } from "@/app/components/comm/Stepper";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  getAbilityList,
  getAgentLimit,
  getAgentPriceList,
  getConstants,
  getKOLInterface,
} from "@/app/request/api";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { updateConfig, clearFrom } from "@/app/store/reducers/userSlice";
import { useRouter } from "next/navigation";
const CreateSuccess = () => {
  return (
    <>
      <DotLottieReact
        className="w-full h-full fixed top-0 left-0 z-[1]"
        src="/lottie/celebrations.lottie"
        autoplay
      />
      <div className="w-full flex items-center justify-center flex-col gap-4 text-primary">
        <div className="w-full h-full top-0 left-0">
          <DotLottieReact
            className="w-full"
            src="/lottie/checked.lottie"
            autoplay
          />
        </div>
        <Link href="/home">
          <Button variant="primary" className="w-full font-bold relative z-10">
            Go to Home
          </Button>
        </Link>
      </div>
    </>
  );
};

export default function Page() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isLoggedIn = useAppSelector(
    (state: any) => state.userReducer.isLoggedIn
  );

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/home");
    } else {
      getConst();
    }
  }, [isLoggedIn]);

  const getConst = async () => {
    try {
      getConstants({
        c_type: "region",
      }).then((res) => {
        dispatch(updateConfig({ key: "region", value: res.data }));
      });
      getConstants({
        c_type: "language",
      }).then((res) => {
        dispatch(updateConfig({ key: "language", value: res.data }));
      });
      getConstants({
        c_type: "character",
      }).then((res) => {
        dispatch(updateConfig({ key: "character", value: res.data }));
      });
      getConstants({
        c_type: "topics",
      }).then((res) => {
        dispatch(updateConfig({ key: "topics", value: res.data }));
      });
      getAbilityList().then((res) => {
        dispatch(updateConfig({ key: "ability", value: res.data }));
      });
      getAgentPriceList().then((res) => {
        dispatch(updateConfig({ key: "price", value: res.data }));
      });
      getKOLInterface().then((res) => {
        dispatch(updateConfig({ key: "kols", value: res.data }));
      });
      getAgentLimit().then((res) => {
        dispatch(updateConfig({ key: "limit", value: res.data }));
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // dispatch(clearFrom());
    // return () => {
    //   dispatch(clearFrom());
    // };
  }, []);
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
          completedContent={<CreateSuccess />}
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
