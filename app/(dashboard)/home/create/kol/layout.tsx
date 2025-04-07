import TwitterView from "@/app/components/home/TwitterView";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Zap } from "lucide-react";
import Link from "next/link";
import React from "react";
import Preview from "./compontents/preview";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full overflow-hidden flex">
      <div className="w-full h-full overflow-hidden flex flex-col flex-1 box-border p-2 md:p-4 lg:p-6">
        <div className="w-full flex items-center justify-between shadow-[0_10px_10px_20px_rgba(251,249,250,1)] pb-4">
          <Link href="/home">
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-6 h-6" />
              <h1 className="text-base font-bold">Create Your Agent</h1>
            </div>
          </Link>
          <Button variant="outline" className="flex gap-2">
            <Zap className="w-4 h-4" />
            <span className="text-md">Create Quickly</span>
          </Button>
        </div>
        <div className="w-full flex-1 overflow-auto">{children}</div>
      </div>
      <div className="hidden md:block">
        <Preview />
      </div>
    </div>
  );
}
