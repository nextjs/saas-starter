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
import React, { useActionState } from 'react'
import {updatePassword} from '@/app/auth/actions'
import { Loader2 } from 'lucide-react'
import {ActionState} from "@/lib/auth/middleware";

export function UpdatePasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updatePassword, {error:''});

  return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Reset Your Password</CardTitle>
            <CardDescription>Please enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="password">New password</Label>
                  <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="New password"
                      required
                      minLength={8}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password">Repeat new password</Label>
                  <Input
                      id="repeat-password"
                      name="repeatPassword"
                      type="password"
                      placeholder="Repeat new password"
                      required
                      minLength={8}
                  />
                </div>
                {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save new password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  )
}