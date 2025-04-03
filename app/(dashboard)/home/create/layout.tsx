import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full p-2 md:p-4 lg:p-6 !pr-100">
      {children}
    </div>
  );
}
