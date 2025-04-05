"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useStepperContext } from "@/app/context/stepper-context";

const formSchema = z.object({
  interactive: z.string().min(1).max(200),
});

export default function StepThree() {
  const { handleNext, handleBack, currentStep } = useStepperContext();

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

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-bold capitalize">interactive KOL</h3>
        <p className="text-md text-muted-foreground">
          Select or enter keywords to find KOL that you would like to
          Interactive to
        </p>
      </div>
      <div className="flex-1 h-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="interactive"
              render={({ field }) => (
                <FormItem>
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
                        <p className="text-sm text-slate-500 mb-2">
                          Suggested KOL
                        </p>
                        <div className="grid grid-cols-2 gap-4 pb-2">
                          <Badge
                            onClick={() => {
                              field.onChange(field.value + "Badge,");
                            }}
                          >
                            Badge
                          </Badge>
                        </div>
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
