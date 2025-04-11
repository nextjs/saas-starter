"use client";
import { useState } from "react";
import { createContext, useContext, ReactNode, FC } from "react";

interface DialogContextType {
  isOpen: boolean;
  openXauthDialog: () => void;
  closeXauthDialog: () => void;
  toggleXauthDialog: () => void;
}

const XauthDialogContext = createContext<DialogContextType | null>(null);

export const XauthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openXauthDialog = () => setIsOpen(true);
  const closeXauthDialog = () => setIsOpen(false);
  const toggleXauthDialog = () => setIsOpen((prev) => !prev);

  return (
    <XauthDialogContext.Provider
      value={{ isOpen, openXauthDialog, closeXauthDialog, toggleXauthDialog }}
    >
      {children}
    </XauthDialogContext.Provider>
  );
};

export const useXauthDialog = () => {
  const context = useContext(XauthDialogContext);
  if (!context) {
    throw new Error("useXauthDialog must be used within a XauthDialogProvider");
  }
  return context;
};

