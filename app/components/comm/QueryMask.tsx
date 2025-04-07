"use client";
import React, { useState } from "react";

export default function QueryMask({ children, className, maskClassName }: { children: React.ReactNode, className?: string, maskClassName?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`fixed inset-0 bg-white/20 z-[99] backdrop-blur-[1px] pointer-events-none left-0 top-0 w-screen h-screen transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0"
        } ${maskClassName}`}
      />
      <div
        className="relative z-[100] isolate w-full"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
      </div>
    </div>
  );
}
