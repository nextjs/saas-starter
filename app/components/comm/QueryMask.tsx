"use client";
import React, { useState } from "react";

export default function QueryMask({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex items-center justify-center">
      <div
        className={`fixed inset-0 bg-black/20 z-[99] backdrop-blur-[1px] pointer-events-none left-0 top-0 w-screen h-screen transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className="relative z-[100] isolate"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
      </div>
    </div>
  );
}
