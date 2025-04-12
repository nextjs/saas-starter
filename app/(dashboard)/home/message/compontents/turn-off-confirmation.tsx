"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TurnOffConfirmation(props: {
  children: React.ReactNode;
}) {
  const { children } = props;

  const [isOpen, setOpen] = useState<boolean>(false);

  const handleCancel = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-xs min-w-[200px] text-primary">
        <DialogHeader>
          <DialogTitle className="text-center text-primary font-bold text-xl capitalize">
            turn off confirmation
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500 text-sm">
            Turning off will terminate any currently running tasks. Are you sure
            you want to proceed?
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center space-x-4">
          <Button variant="outline" onClick={handleCancel}>
            <span className="capitalize">cancel</span>
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            <span className="capitalize">turn off</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
