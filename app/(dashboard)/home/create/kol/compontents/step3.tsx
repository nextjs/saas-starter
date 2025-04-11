"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useStepperContext } from "@/app/context/stepper-context";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import QueryMask from "@/app/components/comm/QueryMask";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  interactive: z.string().min(1).max(200),
});

export default function StepThree() {
  const { handleNext, handleBack, currentStep } = useStepperContext();
  const [search, setSearch] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interactive: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    handleNext();
  }

  const [selectedKOL, setSelectedKOL] = useState<number[]>([]);

  const selectKOL = (index: number) => {
    setSelectedKOL((prev) => [...prev, index]);
    form.setValue("interactive", `KOL Name ${index + 1}`);
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6 px-2">
      <div className="flex-1 h-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="interactive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex flex-col gap-2">
                      <span className="text-lg font-bold capitalize">
                        interactive KOL
                      </span>
                      <span className="text-sm text-gray-500">
                        Select or enter keywords to find KOL that you would like
                        to Interactive to
                      </span>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <div className="border rounded-md px-2 shadow-sm group transition-colors focus-within:border-primary">
                      <div className="w-full relative">
                        <Textarea
                          {...field}
                          placeholder="Enter your KOL"
                          maxLength={200}
                          minLength={1}
                          className="text-md border-none shadow-none pl-0 pr-10 "
                        />
                        <div className="absolute bottom-1 right-2 text-xs text-gray-400">
                          {field.value?.length || 0}/200
                        </div>
                      </div>
                      <div className="w-full border-t my-2 px-4"></div>
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-slate-500">
                            Suggested KOL
                          </p>
                          <div className="flex items-center gap-1 relative">
                            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                              placeholder="Search"
                              className="w-24 bg-foreground text-xs py-1 px-2 pl-6 rounded-full"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                            />
                          </div>
                        </div>
                        <ScrollArea className="h-38 pb-2">
                          <div className="grid grid-cols-3 gap-1">
                            {Array.from({ length: 20 }).map((_, index) => (
                              <div
                                key={index}
                                className={cn(
                                  "flex items-center gap-1 p-1 rounded-sm bg-slate-100 hover:bg-slate-200 cursor-pointer",
                                  // selectedKOL.includes(index)
                                  //   ? "bg-slate-50 text-primary/50 cursor-not-allowed pointer-events-none opacity-80"
                                  //   : ""
                                )}
                                onClick={() => selectKOL(index)}
                              >
                                <div className="w-6 min-w-6 h-6 bg-gray-200 rounded-full overflow-hidden"></div>
                                <div className="flex flex-col w-full overflow-hidden">
                                  {/* <QueryMask className="justify-start truncate"> */}
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <p className="text-sm font-bold w-full truncate">
                                          KOL Name
                                        </p>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="flex flex-col gap-1">
                                          <p className="text-sm font-bold">
                                            KOL Name
                                          </p>
                                          <p className="text-sm text-gray-500">
                                            KOL Description
                                          </p>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  {/* </QueryMask> */}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <Button
                onClick={handleBack}
                variant="ghost"
                type="button"
                className={`duration-350 h-10 rounded transition text-md ${
                  currentStep === 1
                    ? "pointer-events-none opacity-50 text-neutral-400"
                    : "text-neutral-400 hover:text-neutral-700"
                }`}
              >
                Previous
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="duration-350 h-10 flex items-center justify-center font-bold px-10"
              >
                Next
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
