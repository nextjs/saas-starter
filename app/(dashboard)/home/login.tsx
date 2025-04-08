"use client";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { CircleIcon, Loader2 } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/app/store/hooks";
import { updateIsLoggedIn } from "@/app/store/reducers/userSlice";
import { AnimatePresence, motion } from "motion/react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";

const formSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // 只在重置密码流程中验证新密码
    if (data.newPassword !== undefined || data.confirmPassword !== undefined) {
      // 验证新密码长度
      if (data.newPassword !== undefined && data.newPassword.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 8,
          type: "string",
          inclusive: true,
          message: "Password must be at least 8 characters",
          path: ["newPassword"],
        });
      }

      // 验证确认密码长度
      if (
        data.confirmPassword !== undefined &&
        data.confirmPassword.length < 8
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 8,
          type: "string",
          inclusive: true,
          message: "Password must be at least 8 characters",
          path: ["confirmPassword"],
        });
      }

      // 验证两者是否匹配
      if (
        data.newPassword &&
        data.confirmPassword &&
        data.newPassword !== data.confirmPassword
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
      }

      // 确保两者都填写
      if (
        data.newPassword === undefined &&
        data.confirmPassword !== undefined
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "New password is required",
          path: ["newPassword"],
        });
      }

      if (
        data.confirmPassword === undefined &&
        data.newPassword !== undefined
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Confirm password is required",
          path: ["confirmPassword"],
        });
      }
    }
  });

enum Step {
  Login = 0,
  Register = 1,
  VerifyCode = 2,
  ForgotPassword = 3,
  ResetPassword = 4,
}

export default function Login() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(Step.Login);
  const [value, setValue] = useState("");
  const [countdown, setCountdown] = useState(0);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isRegister) {
      setStep(Step.Register);
    } else {
      setStep(Step.Login);
    }
  }, [isRegister]);

  useEffect(() => {
    setValue("");
  }, [step]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // 在提交前进行自定义验证
    if (step === Step.ResetPassword) {
      let hasError = false;

      // 验证新密码
      if (!values.newPassword || values.newPassword.length < 8) {
        form.setError("newPassword", {
          message: "Password must be at least 8 characters",
        });
        hasError = true;
      }

      // 验证确认密码
      if (!values.confirmPassword || values.confirmPassword.length < 8) {
        form.setError("confirmPassword", {
          message: "Password must be at least 8 characters",
        });
        hasError = true;
      }

      // 验证密码匹配
      if (values.newPassword !== values.confirmPassword) {
        form.setError("confirmPassword", {
          message: "Passwords do not match",
        });
        hasError = true;
      }

      if (hasError) return;
    }

    // 原有的提交逻辑
    console.log(values);
    if (step === Step.ForgotPassword) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setStep(Step.VerifyCode);
        setValue("");
        setCountdown(60);
      }, 2000);
    } else if (step === Step.ResetPassword) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setStep(Step.Login);
        form.reset();
        toast.success("Password reset successfully");
      }, 2000);
    } else if (step === Step.Register) {
      register();
    } else {
      login();
    }
  }

  const login = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOpen(false);
      dispatch(updateIsLoggedIn(true));
    }, 2000);
  };

  const encryptedEmail = () => {
    const email = form.getValues("email");
    return email.replace(/(.{2})(.*)(.{1})(?=@)/, "$1****$3");
  };

  const register = () => {
    setStep(Step.VerifyCode);
  };

  const handleVerify = () => {
    if (value.length !== 6) {
      toast.error("Please enter a valid code");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (step === Step.VerifyCode && !isRegister) {
        setStep(Step.ResetPassword);
      } else {
        setIsRegister(false);
        setStep(Step.Login);
      }
    }, 2000);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger asChild>
        <Button className="w-full flex items-center justify-center gap-2">
          <span className="inline-block text-base">Sign In</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="w-full h-full text-primary p-4 lg:p-10">
          <DrawerHeader>
            <DrawerTitle className="hidden"></DrawerTitle>
            <DrawerDescription className="hidden"></DrawerDescription>
          </DrawerHeader>
          <div className="w-full h-full flex flex-col items-start justify-center">
            <AnimatePresence mode="wait">
              {step === Step.Login || step === Step.Register ? (
                <motion.div
                  key="login-register-form"
                  className="w-full h-full flex flex-col items-start justify-center gap-4"
                >
                  <div className="w-full flex items-center justify-start gap-2">
                    <CircleIcon className="h-8 w-8 text-secondary" />
                    {isRegister ? (
                      <h1 className="text-2xl font-bold capitalize">
                        Welcome to register
                      </h1>
                    ) : (
                      <h1 className="text-2xl font-bold capitalize">Log In</h1>
                    )}
                  </div>
                  {isRegister ? (
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Button
                        variant="link"
                        className="p-0 text-secondary"
                        onClick={() => setIsRegister(false)}
                      >
                        Log in now
                      </Button>
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No Account?{" "}
                      <Button
                        variant="link"
                        className="p-0 text-secondary"
                        onClick={() => setIsRegister(true)}
                      >
                        Sign Up
                      </Button>
                    </p>
                  )}
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="w-full mt-6 flex flex-col gap-4"
                    >
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormControl>
                              <div className="w-full flex flex-col gap-2">
                                <p className="text-sm">Email</p>
                                <Input
                                  {...field}
                                  placeholder="Email"
                                  className="w-full"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormControl>
                              <div className="w-full flex flex-col gap-2">
                                <p className="text-sm">Password</p>
                                <Input
                                  {...field}
                                  type="password"
                                  placeholder="Password"
                                  className="w-full"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="w-full flex flex-col gap-2 mt-10">
                        {!isRegister ? (
                          <Button
                            type="submit"
                            variant="primary"
                            className="w-full duration-350 h-10 flex items-center justify-center font-bold px-10"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Log In"
                            )}
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            variant="primary"
                            className="w-full duration-350 h-10 flex items-center justify-center font-bold px-10"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Sign Up"
                            )}
                          </Button>
                        )}
                        {!isRegister && (
                          <Button
                            variant="link"
                            type="button"
                            className="justify-start text-sm text-muted-foreground p-0"
                            onClick={() => {
                              setStep(Step.ForgotPassword);
                              form.reset({ email: form.getValues("email") });
                            }}
                          >
                            Forgot Password?
                          </Button>
                        )}
                      </div>
                    </form>
                  </Form>
                </motion.div>
              ) : step === Step.ForgotPassword ? (
                <motion.div
                  key="forgot-password"
                  className="w-full h-full flex flex-col items-start justify-center gap-4"
                >
                  <div className="w-full flex items-center justify-start gap-2">
                    <CircleIcon className="h-8 w-8 text-secondary" />
                    <h1 className="text-xl font-bold capitalize">
                      Forgot Password
                    </h1>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter your email address and we'll send you a verification
                    code.
                  </p>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="w-full mt-6 flex flex-col gap-4"
                    >
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormControl>
                              <div className="w-full flex flex-col gap-2">
                                <p className="text-sm">Email</p>
                                <Input
                                  {...field}
                                  placeholder="Email"
                                  className="w-full"
                                  autoComplete="email"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex flex-col gap-2 mt-10">
                        <Button
                          type="submit"
                          variant="primary"
                          className="w-full duration-350 h-10 flex items-center justify-center font-bold px-10"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Next"
                          )}
                        </Button>
                        <Button
                          variant="link"
                          type="button"
                          className="justify-start text-sm text-muted-foreground p-0"
                          onClick={() => setStep(Step.Login)}
                        >
                          Back to Login
                        </Button>
                      </div>
                    </form>
                  </Form>
                </motion.div>
              ) : step === Step.VerifyCode ? (
                <motion.div
                  key="verification"
                  className="w-full h-full flex flex-col items-start justify-center gap-4"
                >
                  <div className="w-full flex items-center justify-start gap-2">
                    <CircleIcon className="h-8 w-8 text-secondary" />
                    <h1 className="text-xl font-bold capitalize">
                      Security Verification
                    </h1>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Please check email{" "}
                      <span className="font-bold text-secondary">
                        {encryptedEmail()}
                      </span>{" "}
                      for the verification code.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Didn't receive the code?{" "}
                      <Button
                        variant="link"
                        className="p-0 text-primary"
                        disabled={countdown > 0}
                        onClick={() => {
                          setCountdown(60);
                        }}
                      >
                        {countdown > 0
                          ? `Resend Code (${countdown}s)`
                          : "Resend Code"}
                      </Button>
                    </p>
                  </div>
                  <div className="w-full flex items-center justify-center py-4">
                    <InputOTP
                      maxLength={6}
                      value={value}
                      onChange={(value) => setValue(value)}
                      onComplete={handleVerify}
                      disabled={isLoading}
                      autoFocus
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button
                    variant="primary"
                    type="button"
                    className="w-full duration-350 h-10 flex items-center justify-center font-bold px-10"
                    disabled={isLoading}
                    onClick={handleVerify}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                </motion.div>
              ) : (
                step === Step.ResetPassword && (
                  <motion.div
                    key="reset-password"
                    className="w-full h-full flex flex-col items-start justify-center gap-4"
                  >
                    <div className="w-full flex items-center justify-start gap-2">
                      <CircleIcon className="h-8 w-8 text-secondary" />
                      <h1 className="text-xl font-bold capitalize">
                        Reset Password
                      </h1>
                    </div>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full mt-6 flex flex-col gap-4"
                      >
                        <FormField
                          control={form.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <div className="w-full flex flex-col gap-2">
                                  <p className="text-sm">New Password</p>
                                  <Input
                                    {...field}
                                    type="password"
                                    placeholder="New Password"
                                    className="w-full"
                                    disabled={isLoading}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormControl>
                                <div className="w-full flex flex-col gap-2">
                                  <p className="text-sm">Confirm Password</p>
                                  <Input
                                    {...field}
                                    type="password"
                                    placeholder="Confirm Password"
                                    className="w-full"
                                    disabled={isLoading}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          variant="primary"
                          className="w-full duration-350 h-10 flex items-center justify-center font-bold px-10 mt-10"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Reset Password"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
