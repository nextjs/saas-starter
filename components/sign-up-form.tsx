'use client'

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
import { useActionState } from 'react'
import {signUp} from '@/app/auth/actions'
import { Loader2 } from 'lucide-react'
import {ActionState} from "@/lib/auth/middleware";

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(signUp, {error:''});
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
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={8}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="repeat-password">Repeat Password</Label>
                  </div>
                  <Input
                      id="repeat-password"
                      name="repeatPassword"
                      type="password"
                      required
                      minLength={8}
                  />
                </div>
                {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating an account...</> : 'Sign up'}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/auth/login" className="underline underline-offset-4">
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  )
}
