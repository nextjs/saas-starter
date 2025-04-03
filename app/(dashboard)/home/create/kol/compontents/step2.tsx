"use client";
import { useStepperContext } from "@/app/context/stepper-context";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import React from "react";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <FormLabel className="flex items-center">
      {children} <span className="text-red-500 ml-1">*</span>
    </FormLabel>
  );
}

const formSchema = z.object({
  ability: z.string().min(2).max(4000),
});

export default function StepOne() {
  const { handleNext, handleBack, currentStep } = useStepperContext();
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ability: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    handleNext();
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 px-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            rules={{ required: "Ability is required" }} 
            name="ability"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel>Ability</RequiredLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Enter your ability" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between pt-10">
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
  );
}
