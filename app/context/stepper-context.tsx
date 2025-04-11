"use client";
import { createContext, useContext } from 'react';

interface StepperContextType {
  handleNext: () => void;
  handleBack: () => void;
  handleComplete: () => void;
  currentStep: number;
  isLastStep: boolean;
  isCompleted: boolean;
  setCurrentStep: (step: number) => void;
}

export const StepperContext = createContext<StepperContextType | null>(null);

export function useStepperContext() {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('useStepperContext must be used within a StepperProvider');
  }
  return context;
}