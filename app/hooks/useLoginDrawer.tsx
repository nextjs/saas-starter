"use client";
import { useState } from "react";
import { createContext, useContext, ReactNode, FC } from "react";

export enum Step {
  Login = 0,
  Register = 1,
  ResetPassword = 2,
  VerifyCode = 3,
  ForgotPassword = 4,
  TwitterAuth = 5,
}
interface DrawerContextType {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  step: Step;
  setStep: (step: Step) => void;
}

const LoginDrawerContext = createContext<DrawerContextType | null>(null);

export const LoginProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(Step.Login);
  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);
  const toggleDrawer = () => setIsOpen((prev) => !prev);

  return (
    <LoginDrawerContext.Provider
      value={{ isOpen, openDrawer, closeDrawer, toggleDrawer, step, setStep }}
    >
      {children}
    </LoginDrawerContext.Provider>
  );
};

export const useLoginDrawer = () => {
  const context = useContext(LoginDrawerContext);
  if (!context) {
    throw new Error("useLoginDrawer must be used within a LoginDrawerProvider");
  }
  return context;
};

