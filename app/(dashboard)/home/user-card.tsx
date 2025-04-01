"use client";
import { Sparkles, LogOut, Info, CircleHelp } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import QueryMask from "@/app/components/comm/QueryMask";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function UserCard() {
  const [progress, setProgress] = useState(50);
  return (
    <div className="w-full flex flex-col gap-2">
      <Link href="/home/pricing">
        <Button className="w-fit flex items-center justify-center gap-2 relative my-2">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-bold">Upgrade Now</span>
          <div className="absolute z-[-1] -inset-0.5 bg-gradient-to-r from-sky-400 to-fuchsia-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        </Button>
      </Link>
      <div className="w-full flex flex-col gap-1">
        <div className="w-full h-full flex items-center justify-between text-sm">
          <span className="">Usage</span>
          <div className="flex items-center gap-1 text-gray-500">
            <span>10 / 2000000</span>
            <QueryMask>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CircleHelp className="h-3 w-3 cursor-help relative z-[100]" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add to library</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </QueryMask>
          </div>
        </div>
        <div className="w-full">
          <Progress value={progress} className="w-full h-1" />
        </div>
      </div>
      <div className="w-full h-full rounded-lg bg-slate-50 p-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {/* <Image src="" alt="avatar" className="w-full h-full object-cover" /> */}
            </div>
            <div className="flex flex-col gap-0">
              <span className="text-sm">Fancy Dev</span>
              <span className="text-xs text-gray-500">@fancydev</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LogOut className="h-3 w-3 text-gray-400 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
}
