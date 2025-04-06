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

const formSchema = z.object({
  post: z
    .string()
    .refine(
      (val) => Number.isInteger(Number(val)) && Number(val) > 0,
      "Must be a positive integer"
    ),
  repost: z
    .string()
    .refine(
      (val) => Number.isInteger(Number(val)) && Number(val) > 0,
      "Must be a positive integer"
    ),
  quote: z
    .string()
    .refine(
      (val) => Number.isInteger(Number(val)) && Number(val) > 0,
      "Must be a positive integer"
    ),
  like: z
    .string()
    .refine(
      (val) => Number.isInteger(Number(val)) && Number(val) > 0,
      "Must be a positive integer"
    ),
  reply: z
    .string()
    .refine(
      (val) => Number.isInteger(Number(val)) && Number(val) > 0,
      "Must be a positive integer"
    ),
  comment: z
    .string()
    .refine(
      (val) => Number.isInteger(Number(val)) && Number(val) > 0,
      "Must be a positive integer"
    ),
});

export default function StepFive() {
  const { handleNext, handleBack, currentStep } = useStepperContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      post: "10",
      repost: "10",
      quote: "10",
      like: "10",
      reply: "10",
      comment: "10",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    handleNext();
  }

  return (
    <div className="w-full h-full flex flex-col space-y-6 px-2">
      <div className="space-y-1">
        <h3 className="text-xl font-bold capitalize">configuration</h3>
        <p className="text-md text-muted-foreground">
          Set the frequency at which you want to execute the options.
        </p>
      </div>
      <div className="flex-1 h-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="post"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-2">
                      <dl>
                        <dt className="text-md font-semibold capitalize">
                          post
                        </dt>
                        <dd className="text-sm text-muted-foreground">
                          It is recommended not to exceed 10 responses per day.
                        </dd>
                      </dl>
                      <div className="border rounded-md px-2 shadow-sm group flex items-center justify-between space-x-2 py-2">
                        <Input
                          {...field}
                          placeholder="Enter post frequency"
                          className="text-md w-40 border-none shadow-none p-2"
                        />
                        <p className="whitespace-nowrap text-md text-muted-foreground px-2">
                          Counts / <strong className="text-primary">24</strong>{" "}
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
              name="repost"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-2">
                      <dl>
                        <dt className="text-md font-semibold capitalize">
                          repost
                        </dt>
                        <dd className="text-sm text-muted-foreground">
                          It is recommended not to exceed 10 responses per day.
                        </dd>
                      </dl>
                      <div className="border rounded-md px-2 shadow-sm group flex items-center justify-between space-x-2 py-2">
                        <Input
                          {...field}
                          placeholder="Enter repost frequency"
                          className="text-md w-40 border-none shadow-none p-2"
                        />
                        <p className="whitespace-nowrap text-md text-muted-foreground px-2">
                          Counts / <strong className="text-primary">24</strong>{" "}
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
              name="quote"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-2">
                      <dl>
                        <dt className="text-md font-semibold capitalize">
                          quote
                        </dt>
                        <dd className="text-sm text-muted-foreground">
                          It is recommended not to exceed 10 responses per day.
                        </dd>
                      </dl>
                      <div className="border rounded-md px-2 shadow-sm group flex items-center justify-between space-x-2 py-2">
                        <Input
                          {...field}
                          placeholder="Enter quote frequency"
                          className="text-md w-40 border-none shadow-none p-2"
                        />
                        <p className="whitespace-nowrap text-md text-muted-foreground px-2">
                          Counts / <strong className="text-primary">24</strong>{" "}
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
              name="like"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-2">
                      <dl>
                        <dt className="text-md font-semibold capitalize">
                          like
                        </dt>
                        <dd className="text-sm text-muted-foreground">
                          It is recommended not to exceed 10 responses per day.
                        </dd>
                      </dl>
                      <div className="border rounded-md px-2 shadow-sm group flex items-center justify-between space-x-2 py-2">
                        <Input
                          {...field}
                          placeholder="Enter like frequency"
                          className="text-md w-40 border-none shadow-none p-2"
                        />
                        <p className="whitespace-nowrap text-md text-muted-foreground px-2">
                          Counts / <strong className="text-primary">24</strong>{" "}
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
              name="reply"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-2">
                      <dl>
                        <dt className="text-md font-semibold capitalize">
                          reply
                        </dt>
                        <dd className="text-sm text-muted-foreground">
                          It is recommended not to exceed 10 responses per day.
                        </dd>
                      </dl>
                      <div className="border rounded-md px-2 shadow-sm group flex items-center justify-between space-x-2 py-2">
                        <Input
                          {...field}
                          placeholder="Enter reply frequency"
                          className="text-md w-40 border-none shadow-none p-2"
                        />
                        <p className="whitespace-nowrap text-md text-muted-foreground px-2">
                          Counts / <strong className="text-primary">24</strong>{" "}
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
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-2">
                      <dl>
                        <dt className="text-md font-semibold capitalize">
                          comment
                        </dt>
                        <dd className="text-sm text-muted-foreground">
                          It is recommended not to exceed 10 responses per day.
                        </dd>
                      </dl>
                      <div className="border rounded-md px-2 shadow-sm group flex items-center justify-between space-x-2 py-2">
                        <Input
                          {...field}
                          placeholder="Enter comment frequency"
                          className="text-md w-40 border-none shadow-none p-2"
                        />
                        <p className="whitespace-nowrap text-md text-muted-foreground px-2">
                          Counts / <strong className="text-primary">24</strong>{" "}
                          Hours
                        </p>
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
