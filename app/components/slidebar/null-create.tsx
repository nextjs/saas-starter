"use client";
import { MessageCircleMore } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function NullCreate() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center">
      <MessageCircleMore className="size-6 text-muted-foreground mb-2" />
      <p className="text-muted-foreground text-md">No agent yet!</p>
      {/* <Link href="/home/pricing">
        <Button className="w-fit flex items-center justify-center gap-2 relative my-2 rounded-full">
          <span className="text-sm font-bold">Create Agent</span>
          <div className="absolute z-[-1] -inset-0.5 bg-gradient-to-r from-sky-400 to-fuchsia-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        </Button>
      </Link> */}
    </div>
  );
}
