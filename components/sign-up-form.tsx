//<file path="components/sign-up-form.tsx">
'use client';

import { Suspense } from 'react';
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useActionState, useState } from 'react'
import { signUp } from '@/app/auth/actions'
import { Loader2 } from 'lucide-react'
import { ActionState } from "@/lib/auth/middleware";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from 'next/navigation';

function SignUpFormFields() {
  const searchParams = useSearchParams();
  const priceId = searchParams.get('priceId');
  const deviceCount = searchParams.get('deviceCount');
  const interval = searchParams.get('interval');

  return (
      <>
        {priceId && (
            <>
              <input type="hidden" name="redirect" value="checkout" />
              <input type="hidden" name="priceId" value={priceId} />
              <input type="hidden" name="deviceCount" value={deviceCount || '0'} />
              <input type="hidden" name="interval" value={interval || 'month'} />
            </>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={8} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="repeat-password">Repeat Password</Label>
          <Input id="repeat-password" name="repeatPassword" type="password" required minLength={8} />
        </div>
      </>
  );
}

function DynamicLoginLink() {
  const searchParams = useSearchParams();
  const loginHref = `/auth/login?${searchParams.toString()}`;

  return (
      <div className="mt-6 text-center text-sm">
        Already have an account?{' '}
        <Link href={loginHref} className="underline underline-offset-4">
          Login
        </Link>
      </div>
  );
}

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(signUp, {error:''});
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  const handleSocialLogin = async (provider: 'google') => {
    setIsSocialLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      console.error("Social login error:", error);
      setIsSocialLoading(false);
    }
  };

  return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sign up</CardTitle>
            <CardDescription>Create a new account</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction}>
              <div className="flex flex-col gap-6">
                <Suspense fallback={<div>Loading...</div>}>
                  <SignUpFormFields />
                </Suspense>

                {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
                <Button type="submit" className="w-full" disabled={pending || isSocialLoading}>
                  {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating an account...</> : 'Sign up'}
                </Button>
              </div>
            </form>

            <div className="relative my-6"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or sign up with</span></div></div>
            <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('google')} disabled={pending || isSocialLoading}>{isSocialLoading ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<SiGoogle className="mr-2 h-4 w-4" />)}{' '}Google</Button>
            <Suspense fallback={<div className="mt-6 h-5" />}>
              <DynamicLoginLink />
            </Suspense>
          </CardContent>
        </Card>
      </div>
  )
}