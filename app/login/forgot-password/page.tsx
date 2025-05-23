'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { requestPasswordReset } from '../actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, { success: false, error: '' });

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Forgot your password?</h2>
        {state.success ? (
          <p className="text-green-600">If an account with that email exists, a reset link has been sent.</p>
        ) : (
          <form className="space-y-4" action={formAction}>
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full"
                placeholder="Enter your email"
              />
            </div>
            {state.error && <div className="text-red-600 text-sm">{state.error}</div>}
            <div>
              <Button
                type="submit"
                className="w-full flex justify-center items-center bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:from-blue-700 hover:to-teal-600"
                disabled={pending}
              >
                {pending ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Send reset link'}
              </Button>
            </div>
          </form>
        )}
        <div className="mt-4 text-center">
          <Link href="/login/sign-in" className="text-blue-600 hover:underline">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
} 