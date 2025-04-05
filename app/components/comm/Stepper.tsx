"use client";
import React, {
  useState,
  Children,
  useRef,
  useLayoutEffect,
  HTMLAttributes,
  ReactNode,
} from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { StepperContext } from "@/app/context/stepper-context";

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  initialStep?: number;
  stepText?: string[];
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  disableStepIndicators?: boolean;
  renderStepIndicator?: (props: {
    step: number;
    currentStep: number;
    onStepClick: (clicked: number) => void;
  }) => ReactNode;
}

export default function Stepper({
  children,
  initialStep = 1,
  stepText = [],
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = "",
  stepContainerClassName = "",
  contentClassName = "",
  footerClassName = "",
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = "Back",
  nextButtonText = "Continue",
  disableStepIndicators = false,
  renderStepIndicator,
  ...rest
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [direction, setDirection] = useState<number>(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }

    const event = new CustomEvent("update-step", {
      detail: {
        step: newStep,
      },
    });

    globalThis.dispatchEvent(event);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  return (
    <StepperContext.Provider
      value={{
        handleNext,
        handleBack,
        currentStep,
        isLastStep,
        isCompleted,
      }}
    >
      <div className="w-full h-full items-center justify-center" {...rest}>
        <div
          className={`w-full h-full overflow-auto flex items-start ${stepCircleContainerClassName}`}
        >
          <div
            className={`flex flex-col items-start gap-2 w-auto p-0 sticky top-0 ${stepContainerClassName}`}
          >
            {stepsArray.map((_, index) => {
              const stepNumber = index + 1;
              const isNotLastStep = index < totalSteps - 1;
              return (
                <React.Fragment key={stepNumber}>
                  {renderStepIndicator ? (
                    renderStepIndicator({
                      step: stepNumber,
                      currentStep,
                      onStepClick: (clicked) => {
                        setDirection(clicked > currentStep ? 1 : -1);
                        updateStep(clicked);
                      },
                    })
                  ) : (
                    <StepIndicator
                      step={stepNumber}
                      stepText={stepText[index] || ""}
                      disableStepIndicators={disableStepIndicators}
                      currentStep={currentStep}
                      onClickStep={(clicked) => {
                        setDirection(clicked > currentStep ? 1 : -1);
                        updateStep(clicked);
                      }}
                    />
                  )}
                  {isNotLastStep && (
                    <StepConnector isComplete={currentStep > stepNumber} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="w-full flex flex-col items-center justify-center">
            <StepContentWrapper
              isCompleted={isCompleted}
              currentStep={currentStep}
              direction={direction}
              className={`w-full ${contentClassName}`}
            >
              {stepsArray[currentStep - 1]}
            </StepContentWrapper>

            {/* {!isCompleted && (
              <div className={`w-full px-8 pb-8 ${footerClassName}`}>
                <div
                  className={`mt-10 flex ${
                    currentStep !== 1 ? "justify-between" : "justify-end"
                  }`}
                >
                  {currentStep !== 1 && (
                    <Button
                      onClick={handleBack}
                      variant="ghost"
                      className={`duration-350 h-10 rounded transition text-md ${
                        currentStep === 1
                          ? "pointer-events-none opacity-50 text-neutral-400"
                          : "text-neutral-400 hover:text-neutral-700"
                      }`}
                      {...backButtonProps}
                    >
                      {backButtonText}
                    </Button>
                  )}
                  <Button
                    onClick={isLastStep ? handleComplete : handleNext}
                    className="duration-350 h-10 flex items-center justify-center font-bold px-10"
                    {...nextButtonProps}
                  >
                    {isLastStep ? "Complete" : nextButtonText}
                  </Button>
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </StepperContext.Provider>
  );
}

interface StepContentWrapperProps {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  children: ReactNode;
  className?: string;
}

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
  className = "",
}: StepContentWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        overflow: isCompleted ? "hidden" : "visible",
        height: isCompleted ? 0 : "auto",
        minHeight: "200px",
      }}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition key={currentStep} direction={direction}>
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </div>
  );
}

function SlideTransition({
  children,
  direction,
}: {
  children: ReactNode;
  direction: number;
}) {
  return (
    <motion.div
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4 }}
      className="w-full"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
      }}
    >
      {children}
    </motion.div>
  );
}

const stepVariants: Variants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? "10%" : "-10%",
    opacity: 0,
  }),
  center: {
    x: "0%",
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? "-10%" : "10%",
    opacity: 0,
  }),
};

interface StepProps {
  children: ReactNode;
  className?: string;
}

export function Step({ children, className }: StepProps) {
  return <div className={cn("pl-8", className)}>{children}</div>;
}

interface StepIndicatorProps {
  step: number;
  stepText: string;
  currentStep: number;
  onClickStep: (clicked: number) => void;
  disableStepIndicators?: boolean;
}

function StepIndicator({
  step,
  stepText,
  currentStep,
  onClickStep,
  disableStepIndicators = false,
}: StepIndicatorProps) {
  const status =
    currentStep === step
      ? "active"
      : currentStep < step
      ? "inactive"
      : "complete";

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators) {
      // onClickStep(step);
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className="relative cursor-pointer outline-none focus:outline-none"
      animate={status}
      initial={false}
    >
      <motion.div
        variants={{
          inactive: { scale: 1 },
          active: { scale: 1 },
          complete: { scale: 1 },
        }}
        transition={{ duration: 0.3 }}
        className="flex items-center rounded-full text-primary !bg-transparent justify-start"
      >
        {status === "complete" ? (
          <div className="flex items-center justify-start gap-2">
            <CheckIcon className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary transition-all duration-300 whitespace-nowrap">
              {stepText}
            </span>
          </div>
        ) : status === "active" ? (
          <div className="text-primary text-base pl-3 relative transition-all duration-300 whitespace-nowrap">
            <span>{stepText}</span>
            <motion.div
              className="absolute top-0 left-[2px] w-[2px] bg-secondary rounded-full shadow-[10px_0_15px_var(--secondary)]"
              initial={{ height: 0 }}
              animate={{ height: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        ) : (
          <span className="text-sm text-slate-500 transition-all duration-300 whitespace-nowrap">
            {stepText}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}

interface StepConnectorProps {
  isComplete: boolean;
}

function StepConnector({ isComplete }: StepConnectorProps) {
  const lineVariants: Variants = {
    incomplete: { width: 0 },
    complete: { width: "100%" },
  };

  return (
    <div className="relative mx-2 h-0.5 flex-1 overflow-hidden">
      <motion.div
        className="absolute left-0 top-0 h-full"
        variants={lineVariants}
        initial={false}
        animate={isComplete ? "complete" : "incomplete"}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

interface CheckIconProps extends React.SVGProps<SVGSVGElement> {}

function CheckIcon(props: CheckIconProps) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          delay: 0.1,
          type: "tween",
          ease: "easeOut",
          duration: 0.3,
        }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
