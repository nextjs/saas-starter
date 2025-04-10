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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useStepperContext } from "@/app/context/stepper-context";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { updateFrom } from "@/app/store/reducers/userSlice";
import { useRef, useEffect } from "react";

const formSchema = z.object({
  day: z
    .string()
    .refine(
      (val) => Number.isInteger(Number(val)) && Number(val) > 0,
      "Must be a positive integer"
    ),
  month: z
    .string()
    .refine(
      (val) => Number.isInteger(Number(val)) && Number(val) > 0,
      "Must be a positive integer"
    ),
  address: z.string().min(1).max(32),
});

export default function StepSix() {
  const { handleNext, handleBack, currentStep, handleComplete } =
    useStepperContext();

    const step6Init = useAppSelector((state: any) => state.userReducer.from.step6);
    const dispatch = useAppDispatch();
    
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        day: step6Init?.day || "",
        month: step6Init?.month || "",
        address: step6Init?.address || "",
      },
    });
  
    const prevValuesRef = useRef(form.getValues());
    
    const initialRenderRef = useRef(true);
  
    useEffect(() => {
      const subscription = form.watch((values) => {
        const currentValues = form.getValues();
        
        if (JSON.stringify(currentValues) !== JSON.stringify(prevValuesRef.current)) {
          dispatch(updateFrom({ key: "step6", value: currentValues }));
          prevValuesRef.current = { ...currentValues };
        }
      });
      
      return () => subscription.unsubscribe();
    }, [form, dispatch]);
  
    useEffect(() => {
      if (initialRenderRef.current && step6Init) {
        form.reset({
          day: step6Init.day || "",
          month: step6Init.month || "",
          address: step6Init.address || "",
        });
        initialRenderRef.current = false;
      }
    }, [step6Init, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    // handleNext(); 
    handleComplete();
  }

  return (
    <div className="w-full h-full flex flex-col space-y-6 px-2">
      <div className="space-y-1">
        <h3 className="text-xl font-bold capitalize">revenue</h3>
        <p className="text-md text-muted-foreground">
          Set the selling price of the tweet.
        </p>
      </div>
      <div className="flex-1 h-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="day"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormControl>
                    <div className="space-y-2 w-full">
                      <dl>
                        <dt className="text-md font-bold">
                          Post 2 tweets for 24 Hours.
                        </dt>
                        <dd className="text-sm text-muted-foreground">
                          It is recommended 100 USDT per 24 Hours.
                        </dd>
                      </dl>
                      <div className="border rounded-md px-2 shadow-sm group flex items-center justify-between space-x-2 py-2">
                        <Input
                          {...field}
                          placeholder="Enter amount"
                          className="text-md w-full border-none shadow-none p-2"
                        />
                        <p className="whitespace-nowrap text-md text-muted-foreground">
                          USDT / <strong className="text-primary">24</strong>{" "}
                          Hours
                        </p>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormControl>
                    <div className="space-y-2 w-full">
                      <dl>
                        <dt className="text-md font-bold">
                          Post at least 5 tweets.
                        </dt>
                        <dd className="text-sm text-muted-foreground">
                          It is recommended 200 USDT per 30 Days.
                        </dd>
                      </dl>
                      <div className="border rounded-md px-2 shadow-sm group flex items-center justify-between space-x-2 py-2">
                        <Input
                          {...field}
                          placeholder="Enter amount"
                          className="text-md w-full border-none shadow-none p-2"
                        />
                        <p className="whitespace-nowrap text-md text-muted-foreground">
                          USDT / <strong className="text-primary">30</strong>{" "}
                          Days
                        </p>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-2">
                      <dl>
                        <dt className="text-md font-bold capitalize">
                          recevie address
                        </dt>
                        <dd className="text-sm text-muted-foreground">
                          Input erc20 wallet address.
                        </dd>
                      </dl>
                      <div className="border rounded-md shadow-sm">
                        <Input
                          {...field}
                          placeholder="Enter wallet address"
                          className="text-md w-full border-none shadow-none p-4"
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <dl>
                <dt className="text-md font-bold capitalize">
                  X hosting automation
                </dt>
                <dd className="text-sm text-muted-foreground">
                  Run Tasks Remotely Flexible & Always On.
                </dd>
              </dl>
              <div className="border rounded-md shadow-sm flex justify-center items-center p-4">
                <Button
                  className="duration-350 flex items-center justify-center font-bold"
                  onClick={(evt) => {
                    evt.preventDefault();
                  }}
                >
                  Connect
                </Button>
              </div>
            </div>
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
                Create
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
