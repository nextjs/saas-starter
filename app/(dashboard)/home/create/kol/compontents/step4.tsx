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
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { updateFrom } from "@/app/store/reducers/userSlice";
import { useRef, useEffect } from "react";

const formSchema = z.object({
  topics: z.string().min(1).max(200),
});

export default function StepFour() {
  const { handleNext, handleBack, currentStep } = useStepperContext();

  const step4Init = useAppSelector((state: any) => state.userReducer.from.step4);
  const dispatch = useAppDispatch();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topics: step4Init?.topics || "",
    },
  });

  const prevValuesRef = useRef(form.getValues());
  
  const initialRenderRef = useRef(true);

  useEffect(() => {
    const subscription = form.watch((values) => {
      const currentValues = form.getValues();
      
      if (JSON.stringify(currentValues) !== JSON.stringify(prevValuesRef.current)) {
        dispatch(updateFrom({ key: "step4", value: currentValues }));
        prevValuesRef.current = { ...currentValues };
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, dispatch]);

  useEffect(() => {
    if (initialRenderRef.current && step4Init) {
      form.reset({
        topics: step4Init.topics || "",
      });
      initialRenderRef.current = false;
    }
  }, [step4Init, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    handleNext();
  }

  return (
    <div className="w-full h-full flex flex-col space-y-6 px-2">
      <div className="space-y-1">
        <h3 className="text-xl font-bold capitalize">topics</h3>
        <p className="text-md text-muted-foreground">
          Select or enter the topics you would like to filter the keyword search
          results for replies
        </p>
      </div>
      <div className="flex-1 h-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="topics"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormControl>
                    <div className="w-full border rounded-md px-2 shadow-sm group transition-colors focus-within:border-primary">
                      <div className="w-full relative">
                        <Textarea
                          {...field}
                          placeholder="Enter your topics"
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
                          Suggested keywords
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
