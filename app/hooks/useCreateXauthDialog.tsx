"use client";
import { useState } from "react";
import { createContext, useContext, ReactNode, FC } from "react";

interface DialogContextType {
  isOpen: boolean;
  openCreateXauthDialog: () => void;
  closeCreateXauthDialog: () => void;
  toggleCreateXauthDialog: () => void;
}

const CreateXauthDialogContext = createContext<DialogContextType | null>(null);

export const CreateXauthProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const openCreateXauthDialog = () => setIsOpen(true);
  const closeCreateXauthDialog = () => setIsOpen(false);
  const toggleCreateXauthDialog = () => setIsOpen((prev) => !prev);

  return (
    <CreateXauthDialogContext.Provider
      value={{
        isOpen,
        openCreateXauthDialog,
        closeCreateXauthDialog,
        toggleCreateXauthDialog,
      }}
    >
      {children}
    </CreateXauthDialogContext.Provider>
  );
};

export const useCreateXauthDialog = () => {
  const context = useContext(CreateXauthDialogContext);
  if (!context) {
    throw new Error(
      "useCreateXauthDialog must be used within a CreateXauthDialogProvider"
    );
  }
  return context;
};

