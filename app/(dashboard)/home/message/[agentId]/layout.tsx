import React from "react";
import Link from "next/link";
import { ChevronLeft, Power } from "lucide-react";

import { Button } from "@/components/ui/button";

import TurnOffConfirmation from "../compontents/turn-off-confirmation";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full overflow-hidden flex">
      <div className="w-full h-full overflow-hidden flex flex-col flex-1 box-border p-2 md:p-4 lg:p-6">
        <div className="w-full flex items-center justify-between shadow-[0_10px_10px_20px_rgba(251,249,250,1)] pb-4">
          <Link href="/home">
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-6 h-6" />
              <h1 className="text-base font-bold">Message</h1>
            </div>
          </Link>
          <TurnOffConfirmation>
            <Button
              variant="outline"
              className="flex gap-2 hover:bg-foreground hover:text-destructive-foreground"
            >
              <Power className="size-4 min-w-4 text-destructive" />
              <span className="text-md text-destructive">Turn Off</span>
            </Button>
          </TurnOffConfirmation>
        </div>
        <div className="w-full flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
