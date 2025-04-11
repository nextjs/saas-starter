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

  const ability = useAppSelector((state: any) => state.userReducer.config.ability);

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
                      readOnly
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
                              items={ability.map((template: any) => (
                                <div
                                  className="w-full flex items-center justify-between bg-gray-100 rounded-md p-2"
                                  key={template.id}
                                >
                                  <div className="flex flex-col gap-1 w-full">
                                    <span className="text-sm font-bold">
                                      {template.name}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {template.desc}
                                    </span>
                                  </div>
                                  <Button
                                    className="w-fit flex items-center gap-1"
                                    onClick={() =>
                                      add(template.desc, template.id)
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
