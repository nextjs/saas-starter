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
import { signIn } from '@/app/auth/actions'
import { Loader2 } from 'lucide-react'
import { SiGoogle } from '@icons-pack/react-simple-icons';
import { createClient } from '@/lib/supabase/client'
import { ActionState } from "@/lib/auth/middleware";
import { useSearchParams } from 'next/navigation';

function LoginFormFields() {
  const searchParams = useSearchParams();
  const priceId = searchParams.get('priceId');
  const deviceCount = searchParams.get('deviceCount');
  const interval = searchParams.get('interval');

  return (
      <>
        {priceId && (
            <>
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
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot-password" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
              Forgot your password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required />
        </div>
      </>
  );
}

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(signIn, {error:''});
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
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your email below to login to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction}>
              <div className="flex flex-col gap-6">
                <Suspense fallback={<div>Loading...</div>}>
                  <LoginFormFields />
                </Suspense>

                {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
                <Button type="submit" className="w-full" disabled={pending || isSocialLoading}>
                  {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</> : 'Login'}
                </Button>
              </div>
            </form>

            <div className="relative my-6"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div></div>
            <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('google')} disabled={pending || isSocialLoading}>{isSocialLoading ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<SiGoogle className="mr-2 h-4 w-4" />)}{' '}Google</Button>
            <div className="mt-6 text-center text-sm">Don't have an account?{' '}<Link href="/auth/sign-up" className="underline underline-offset-4">Sign up</Link></div>
          </CardContent>
        </Card>
      </div>
  )
}