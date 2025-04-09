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
import React, { useEffect, useState } from "react";
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
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { ScrollArea } from "@/components/ui/scroll-area";

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <FormLabel className="flex items-center">
      {children} <span className="text-red-500 ml-1">*</span>
    </FormLabel>
  );
}

const formSchema = z.object({
  name: z.string().min(2).max(32),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  character: z.string().min(1).max(200),
  region: z.number().min(1, {
    message: "Please select a region",
  }),
  language: z.number().min(1, {
    message: "Please select a language",
  }),
});

export default function StepOne() {
  const { handleNext, handleBack, currentStep } = useStepperContext();
  const [open, setOpen] = useState(false);
  const [openLanguage, setOpenLanguage] = useState(false);
  const dispatch = useAppDispatch();
  const character = useAppSelector(
    (state: any) => state.userReducer.config.character
  );
  const region = useAppSelector(
    (state: any) => state.userReducer.config.region
  );
  const language = useAppSelector(
    (state: any) => state.userReducer.config.language
  );

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      gender: "male",
      character: "",
      region: 0,
      language: 0,
    },
  });

  // 监听表单中的字段变化
  const watchedFields = form.watch(); // 监听所有字段
  // 或者只监听特定字段：
  // const watchedName = form.watch("name");
  // const watchedRegion = form.watch("region");

  // 使用 useEffect 来响应字段变化
  useEffect(() => {
    console.log("表单所有字段的当前值:", watchedFields);
    // 你可以在这里根据字段的变化执行一些操作
  }, [watchedFields]); // 当任何字段变化时重新执行

  // 如果只想监听特定字段的变化：
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === "region") {
        console.log("区域已更改为:", value.region);
        // 这里可以根据区域的变化执行一些操作
      }
      
      if (name === "language") {
        console.log("语言已更改为:", value.language);
        // 这里可以根据语言的变化执行一些操作
      }
    });
    
    // 在组件卸载时清理订阅
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    handleNext();
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 px-2">
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
                        <RadioGroupItem value="male" id="r1" />
                        <Label htmlFor="r1">Man</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="r2" />
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
              <FormItem className="flex flex-col">
                <RequiredLabel>Character</RequiredLabel>
                <FormControl>
                  <div className="w-full border rounded-md px-2 shadow-sm group transition-colors focus-within:border-primary">
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
                    {character.length > 0 && (
                      <>
                        <div className="w-full">
                          <p className="text-sm text-slate-500 mb-2">
                            Suggested keywords
                          </p>
                          <ScrollArea className="h-[100px] pb-2">
                            <div className="flex flex-wrap gap-1 pb-2">
                              {character.map((item: any) => (
                                <Badge
                                  key={item.id}
                                  onClick={() => {
                                    field.onChange(field.value + item.name + ",");
                                  }}
                                >
                                  {item.name}
                                </Badge>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </>
                    )}
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
                            ? region.find(
                                (item: any) => item.id === field.value
                              )?.name
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
                              {region.map((item: any) => (
                                <CommandItem
                                  key={item.id}
                                  value={item.id}
                                  onSelect={(currentValue) => {
                                    const value = region.find(
                                      (item: any) => item.name === currentValue
                                    );
                                    field.onChange(
                                      value.id === field.value ? "" : value.id
                                    );
                                    setOpen(false);
                                  }}
                                >
                                  {item.name}
                                  <Check
                                    className={cn(
                                      "ml-auto text-primary",
                                      field.value === item.id
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
                            ? language.find(
                                (item: any) => item.id === field.value
                              )?.name
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
                              {language.map((item: any) => (
                                <CommandItem
                                  key={item.id}
                                  value={item.id}
                                  onSelect={(currentValue) => {
                                    const value = language.find(
                                      (item: any) => item.name === currentValue
                                    );
                                    field.onChange(
                                      value.id === field.value ? "" : value.id
                                    );
                                    setOpenLanguage(false);
                                  }}
                                >
                                  {item.name}
                                  <Check
                                    className={cn(
                                      "ml-auto text-primary",
                                      field.value === item.id
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
              variant="primary"
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
