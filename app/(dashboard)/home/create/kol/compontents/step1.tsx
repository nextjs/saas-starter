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
import React, { useEffect, useState, useRef } from "react";
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
import { updateConfig, updateFrom } from "@/app/store/reducers/userSlice";

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
  
  // 1. 从 Redux 获取已保存的表单数据
  const step1Init = useAppSelector((state: any) => state.userReducer.from.step1);
  
  const character = useAppSelector(
    (state: any) => state.userReducer.config.character
  );
  const region = useAppSelector(
    (state: any) => state.userReducer.config.region
  );
  const language = useAppSelector(
    (state: any) => state.userReducer.config.language
  );

  // 2. 初始化表单时使用已保存的数据
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // 如果 Redux 中有数据，使用 Redux 中的数据，否则使用默认值
      name: step1Init?.name || "",
      gender: step1Init?.gender || "male",
      character: step1Init?.character || "",
      region: step1Init?.region || 0,
      language: step1Init?.language || 0,
    },
  });

  // 3. 处理表单更新，避免无限循环
  // 使用 useRef 存储上一次的值，这样可以在 useEffect 中做比较
  const prevValuesRef = useRef(form.getValues());
  
  // 只在组件首次渲染后执行一次 dispatch
  const initialRenderRef = useRef(true);

  // 4. 使用 useEffect 监听表单变化并更新 Redux
  useEffect(() => {
    // 只设置一次监听器
    const subscription = form.watch((values) => {
      // 获取当前表单的完整值
      const currentValues = form.getValues();
      
      // 使用 JSON.stringify 进行深度比较，避免引用比较的问题
      if (JSON.stringify(currentValues) !== JSON.stringify(prevValuesRef.current)) {
        // 更新 Redux 状态
        dispatch(updateFrom({ key: "step1", value: currentValues }));
        // 更新保存的上一次值
        prevValuesRef.current = { ...currentValues };
      }
    });
    
    // 清理函数
    return () => subscription.unsubscribe();
  }, [form, dispatch]);

  // 5. 如果表单默认值与 Redux 中的数据不同，使用 Redux 中的数据重置表单
  useEffect(() => {
    if (initialRenderRef.current && step1Init) {
      // 重置表单值为 Redux 中的值
      form.reset({
        name: step1Init.name || "",
        gender: step1Init.gender || "male",
        character: step1Init.character || "",
        region: step1Init.region || 0,
        language: step1Init.language || 0,
      });
      initialRenderRef.current = false;
    }
  }, [step1Init, form]);

  // 定义提交处理函数
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    handleNext();
  }

  useEffect(() => {
    dispatch(updateConfig({ key: "currentStep", value: 1 }));
  }, []);

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
                    {character && character.length > 0 && (
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
                                    field.onChange(
                                      field.value + item.name + ","
                                    );
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
