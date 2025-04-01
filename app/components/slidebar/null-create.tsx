"use client";
import { Navigation } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function NullCreate() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center">
      <Navigation />
      <h1 className="text-base font-bold text-primary">The story starts here</h1>
      <p className="text-slate-500 text-md">Simply click the button above to create your first agent.</p>
      {/* <Link href="/home/pricing">
        <Button className="w-fit flex items-center justify-center gap-2 relative my-2 rounded-full">
          <span className="text-sm font-bold">Create Agent</span>
          <div className="absolute z-[-1] -inset-0.5 bg-gradient-to-r from-sky-400 to-fuchsia-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        </Button>
      </Link> */}
    </div>
  );
}
