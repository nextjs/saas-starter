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
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import GooeyNav from "@/components/Components/GooeyNav/GooeyNav";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <FormLabel className="flex items-center">
      {children} <span className="text-red-500 ml-1">*</span>
    </FormLabel>
  );
}

const formSchema = z.object({
  name: z.string().min(2).max(32),
  gender: z.enum(["1", "2"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  character: z.string().min(1).max(200),
  region: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], {
    errorMap: () => ({ message: "Please select a region" }),
  }),
  language: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], {
    errorMap: () => ({ message: "Please select a language" }),
  }),
});

const frameworks = [
  {
    value: "1",
    label: "Next.js",
  },
  {
    value: "2",
    label: "SvelteKit",
  },
  {
    value: "3",
    label: "Nuxt.js",
  },
  {
    value: "4",
    label: "Remix",
  },
  {
    value: "5",
    label: "Astro",
  },
];

export default function StepOne() {
  const { handleNext, handleBack, currentStep } = useStepperContext();
  const [open, setOpen] = useState(false);
  const [openLanguage, setOpenLanguage] = useState(false);
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      gender: "1",
      character: "",
      region: "1",
      language: "1",
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
    <div className="w-full h-full flex flex-col gap-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel>Name</RequiredLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      placeholder="Enter your name"
                      maxLength={32}
                      minLength={2}
                      className="pr-10 text-md"
                    />
                    <div className="absolute bottom-1 right-2 text-xs text-gray-400">
                      {field.value?.length || 0}/32
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel>Gender</RequiredLabel>
                <FormControl>
                  <div className="relative">
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="r1" />
                        <Label htmlFor="r1">Man</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="r2" />
                        <Label htmlFor="r2">Woman</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="character"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel>Character</RequiredLabel>
                <FormControl>
                  <div className="border rounded-md px-2 shadow-sm group transition-colors focus-within:border-primary">
                    <div className="w-full relative">
                      <Textarea
                        {...field}
                        placeholder="Enter your character"
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
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel>Region</RequiredLabel>
                <FormControl>
                  <div className="w-full">
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-[200px] justify-between hover:bg-gray-100 hover:text-primary px-2"
                        >
                          {field.value
                            ? frameworks.find(
                                (framework) => framework.value === field.value
                              )?.label
                            : "Select region..."}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search region..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>No region found.</CommandEmpty>
                            <CommandGroup>
                              {frameworks.map((framework) => (
                                <CommandItem
                                  key={framework.value}
                                  value={framework.value}
                                  onSelect={(currentValue) => {
                                    field.onChange(
                                      currentValue === field.value
                                        ? ""
                                        : currentValue
                                    );
                                    setOpen(false);
                                  }}
                                >
                                  {framework.label}
                                  <Check
                                    className={cn(
                                      "ml-auto text-primary",
                                      field.value === framework.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel>Language</RequiredLabel>
                <FormControl>
                  <div className="w-full">
                    <Popover open={openLanguage} onOpenChange={setOpenLanguage}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openLanguage}
                          className="w-[200px] justify-between hover:bg-gray-100 hover:text-primary px-2"
                        >
                          {field.value
                            ? frameworks.find(
                                (framework) => framework.value === field.value
                              )?.label
                            : "Select language..."}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search language..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>No language found.</CommandEmpty>
                            <CommandGroup>
                              {frameworks.map((framework) => (
                                <CommandItem
                                  key={framework.value}
                                  value={framework.value}
                                  onSelect={(currentValue) => {
                                    field.onChange(
                                      currentValue === field.value
                                        ? ""
                                        : currentValue
                                    );
                                    setOpenLanguage(false);
                                  }}
                                >
                                  {framework.label}
                                  <Check
                                    className={cn(
                                      "ml-auto text-primary",
                                      field.value === framework.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              className="duration-350 h-10 flex items-center justify-center font-bold px-10 mt-10"
            >
              Next
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
