"use client";
import { useState } from "react";
import { createContext, useContext, ReactNode, FC } from "react";

interface DrawerContextType {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const LoginDrawerContext = createContext<DrawerContextType | null>(null);

export const LoginProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);
  const toggleDrawer = () => setIsOpen((prev) => !prev);

  return (
    <LoginDrawerContext.Provider
      value={{ isOpen, openDrawer, closeDrawer, toggleDrawer }}
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

