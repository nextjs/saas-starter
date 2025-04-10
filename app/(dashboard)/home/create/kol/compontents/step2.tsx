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
import React, { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import AnimatedList from "@/app/components/comm/AnimatedList";
import { CheckIcon } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { updateFrom } from "@/app/store/reducers/userSlice";
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
  const step2Init = useAppSelector((state: any) => state.userReducer.from.step2);
  const dispatch = useAppDispatch();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ability: step2Init?.ability || "",
    },
  });

  const prevValuesRef = useRef(form.getValues());
  
  const initialRenderRef = useRef(true);

  useEffect(() => {
    const subscription = form.watch((values) => {
      const currentValues = form.getValues();
      
      if (JSON.stringify(currentValues) !== JSON.stringify(prevValuesRef.current)) {
        dispatch(updateFrom({ key: "step2", value: currentValues }));
        prevValuesRef.current = { ...currentValues };
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, dispatch]);

  useEffect(() => {
    if (initialRenderRef.current && step2Init) {
      form.reset({
        ability: step2Init.ability || "",
      });
      initialRenderRef.current = false;
    }
  }, [step2Init, form]);

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    handleNext();
  }

  const templates = [
    {
      id: 1,
      name: "幽默大师",
      description: "生成各种类型的笑话和段子，从冷幽默到谐音梗，适应不同笑点。",
    },
    {
      id: 2,
      name: "币圈分析师",
      description:
        "提供加密货币价格趋势分析、项目基本面解读和简单技术指标提醒。",
    },
    {
      id: 3,
      name: "故事编织者",
      description: "根据关键词生成短篇故事，支持悬疑、爱情或科幻等不同题材。",
    },
    {
      id: 4,
      name: "项目测评官",
      description: "对Web3/科技项目进行中立分析，总结优缺点和潜在风险。",
    },
    {
      id: 5,
      name: "语言风格转换",
      description: "将输入内容转化为指定风格（贴吧体/知乎体/微博体等）。",
    },
    {
      id: 6,
      name: "社交夸夸党",
      description: "用夸张语气赞美他人推文，适合互动涨粉场景。",
    },
    {
      id: 7,
      name: "辩论喷子模式",
      description: "以激进语气反驳观点（自动过滤敏感词避免封号）。",
    },
    {
      id: 8,
      name: "土味情话生成",
      description: "创作接地气的撩人金句，适合娱乐互动。",
    },
    {
      id: 9,
      name: "热点追踪器",
      description: "自动关联时事热点生成评论角度，保持内容时效性。",
    },
    {
      id: 10,
      name: "诗词创作",
      description: "生成现代诗或仿古诗词，支持指定主题和情感倾向。",
    },
    {
      id: 11,
      name: "阴阳大师",
      description: "用含蓄反讽方式表达观点（自动控制攻击性程度）。",
    },
    {
      id: 12,
      name: "舔狗日记",
      description: "自动生成卑微恋爱脑内容，适合情感类账号。",
    },
    {
      id: 13,
      name: "玄学占卜",
      description: "生成星座运程/塔罗牌解读等神秘学内容。",
    },
  ];

  const [abilityStr, setAbilityStr] = useState<string[]>([]);
  const add = (val: string, id: number) => {
    const newAbilityStr = [...abilityStr, val];
    setAbilityStr(newAbilityStr);
    form.setValue("ability", newAbilityStr.join("\n"));
    toast.success("Input Success");
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 px-2">
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
                <FormLabel>
                  <div className="flex flex-col gap-2">
                    <span className="text-lg font-bold">Ability</span>
                    <span className="text-sm text-gray-500">
                      Please enter the character's abilities and characteristics
                      of this Agent.
                    </span>
                  </div>
                </FormLabel>
                <FormControl>
                  <div className="w-full overflow-hidden relative">
                    <Textarea
                      {...field}
                      placeholder="Enter your ability"
                      className="pb-10 min-h-30 max-h-60"
                    />
                    <div className="absolute bottom-2 left-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className="w-fit flex items-center justify-center gap-2 relative"
                            variant="foreground"
                            type="button"
                          >
                            <span className="text-sm font-bold">Templates</span>
                            {/* <div className="absolute z-[-1] -inset-0.5 bg-gradient-to-r from-sky-400 to-fuchsia-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div> */}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-lg min-w-[300px] text-primary">
                          <DialogHeader>
                            <DialogTitle className="text-lg font-bold">
                              Ability Templates
                            </DialogTitle>
                            <DialogDescription>
                              Select a template to use for your ability
                            </DialogDescription>
                          </DialogHeader>
                          <div className="w-full max-h-[400px]">
                            <AnimatedList
                              items={templates.map((template) => (
                                <div
                                  className="w-full flex items-center justify-between bg-gray-100 rounded-md p-2"
                                  key={template.id}
                                >
                                  <div className="flex flex-col gap-1 w-full">
                                    <span className="text-sm font-bold">
                                      {template.name}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {template.description}
                                    </span>
                                  </div>
                                  <Button
                                    className="w-fit flex items-center gap-1"
                                    onClick={() =>
                                      add(template.description, template.id)
                                    }
                                  >
                                    <span>Input</span>
                                  </Button>
                                </div>
                              ))}
                              showGradients={true}
                              enableArrowNavigation={true}
                              displayScrollbar={true}
                            />
                            {/* <ScrollArea className="h-full">
                              <div className="flex flex-col gap-2">
                                {templates.map((template) => (
                                  <div
                                    className="w-full flex items-center justify-between bg-gray-100 rounded-md p-2"
                                    key={template.id}
                                  >
                                    <div className="flex flex-col gap-1 w-full">
                                      <span className="text-sm font-bold">
                                        {template.name}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        {template.description}
                                      </span>
                                    </div>
                                    <Button className="w-fit">Input</Button>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea> */}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between pt-10">
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
  );
}
