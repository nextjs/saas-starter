'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { forgotPassword } from '@/app/auth/actions'
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
import {useActionState, useState} from 'react'
import {Loader2} from "lucide-react";
import {ActionState} from "@/lib/auth/middleware";

export function ForgotPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(forgotPassword, {error:''});
  return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        {state?.success ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Check Your Email</CardTitle>
                <CardDescription>Password reset instructions sent</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{state.success}</p>
              </CardContent>
            </Card>
        ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Reset Your Password</CardTitle>
                <CardDescription>
                  Type in your email and we&apos;ll send you a link to reset your password
                </CardDescription>
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
                    {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
                    <Button type="submit" className="w-full" disabled={pending}>
                      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : 'Send reset email'}
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
        )}
      </div>
  )
}