'use client';

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
import { useActionState } from "react"
import { signIn as signInOriginal, signUp as signUpOriginal } from "@/app/(login)/actions"
import { ActionState } from "@/lib/auth/middleware"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

// Create a wrapper function for signIn that ensures it always returns an ActionState
const signIn = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
  const result = await signInOriginal(prevState, formData);
  // If result is undefined, return a default ActionState
  if (!result) {
    return { error: '' };
  }
  // Otherwise, return the result
  return result as ActionState;
};

// Create a wrapper function for signUp that ensures it always returns an ActionState
const signUp = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
  const result = await signUpOriginal(prevState, formData);
  // If result is undefined, return a default ActionState
  if (!result) {
    return { error: '' };
  }
  // Otherwise, return the result
  return result as ActionState;
};

export function LoginForm({
  className,
  mode = "signin",
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { mode?: "signin" | "signup" }) {
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '';
  const priceId = searchParams?.get('priceId') || '';
  const inviteId = searchParams?.get('inviteId') || '';
  
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' },
  );

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
          <form action={formAction}>
            <input type="hidden" name="redirect" value={redirect} />
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
                disabled={pending}
                isLoading={pending}
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
                redirect ? `?redirect=${redirect}` : ''
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
  )
}
