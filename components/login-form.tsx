'use client';

import { type ReactNode, Suspense, useEffect } from 'react' // Import useEffect
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionState } from "@/lib/hooks/useActionState"
import { useSearchParams, useRouter } from "next/navigation" // Import useRouter
import Link from "next/link"
import { createClient } from '@/utils/supabase/client'
import { AuthError } from '@supabase/supabase-js'

export interface LoginFormProps extends React.HTMLAttributes<HTMLDivElement> {
  mode?: 'signin' | 'signup';
}

interface LoginState {
  error?: string;
  success?: string;
  email?: string;
  password?: string;
}

function isAuthError(error: unknown): error is AuthError {
  return error instanceof Error && 'status' in error;
}

const signIn = async (prevState: LoginState, formData: FormData): Promise<LoginState> => {
  const supabase = createClient();
  try {
    console.log("signIn called with formData:", formData);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });
    console.log("signIn result:", { data, error });

    if (error) throw error;
    if (!data.user) {
      return { error: 'Failed to sign in. No user data returned.'};
    }
    return { success: 'Signed in successfully' };
  } catch (error) {
    console.error("signIn error:", error);
    if (isAuthError(error)) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred' };
  }
};

const signUp = async (prevState: LoginState, formData: FormData): Promise<LoginState> => {
  const supabase = createClient();
  try {
    console.log("signUp called with formData:", formData);
    const { data, error } = await supabase.auth.signUp({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      options: {
        data: {
          first_name: formData.get('first_name'),
          last_name: formData.get('last_name'),
        },
      },
    });
    console.log("signUp result:", { data, error });

    if (error) throw error;
    if (!data.user) {
      return { error: 'Failed to sign up. No user data returned.'};
    }
    return { success: 'Check your email to confirm your account' };
  } catch (error) {
    console.error("signUp error:", error);
    if (isAuthError(error)) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred' };
  }
};

function LoginFormContent({
  className,
  mode = "signin",
  ...props
}: LoginFormProps) {
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get('redirect') || ''; // Get redirect parameter, rename to avoid conflict
  const priceId = searchParams?.get('priceId') || '';
  const inviteId = searchParams?.get('inviteId') || '';
    const router = useRouter(); // Get the router instance

  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );
    useEffect(() => {
        console.log("LoginForm state:", state);
        // Redirect on successful sign-in/sign-up
        if (state.success) {
            const redirectTo = redirectParam || '/dashboard';
            console.log("Redirecting to:", redirectTo)
            router.push(redirectTo);
        }
    }, [state, router, redirectParam]); // Depend on state AND router


  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Card className="shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-bold">
            {mode === 'signin' ? 'Sign in' : 'Create an account'}
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email below to {mode === 'signin' ? 'sign in to' : 'create'} your account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={(e) => {
            e.preventDefault();
            formAction(new FormData(e.currentTarget));
          }}>
           {/* Hidden Fields */}
            <input type="hidden" name="redirect" value={redirectParam} />
            <input type="hidden" name="priceId" value={priceId} />
            <input type="hidden" name="inviteId" value={inviteId} />

            <div className="grid gap-4">
              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      type="text"
                      autoComplete="given-name"
                      placeholder="First name"
                      className="rounded-md"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Last name"
                      className="rounded-md"
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  defaultValue={state.email}
                  className="rounded-md"
                  autoComplete="email"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === 'signin' && (
                    <Link
                      href="#"
                      className="text-sm text-orange-600 underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  defaultValue={state.password}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  className="rounded-md"
                />
              </div>

              {state?.error && (
                <div className="text-sm font-medium text-destructive" role="alert">
                  {state.error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                variant="orange"
                isLoading={isPending}
              >
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </Button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" type="button" className="rounded-md">
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                  fill="currentColor"
                />
              </svg>
              Apple
            </Button>
            <Button variant="outline" type="button" className="rounded-md">
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Google
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <Link
              href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${
                redirectParam ? `?redirect=${redirectParam}` : ''
              }${priceId ? `&priceId=${priceId}` : ''}`}
              className="text-orange-600 underline-offset-4 hover:underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </Link>
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link href="#" className="text-orange-600 underline-offset-4 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-orange-600 underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export function LoginForm(props: LoginFormProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginFormContent {...props} />
    </Suspense>
  );
}