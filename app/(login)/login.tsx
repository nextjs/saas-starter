'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Loader2 } from 'lucide-react';
import { signIn, signUp } from './actions';
import { ActionState } from '@/lib/auth/middleware';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
          <img src="/Logo_all.svg" alt="Logo" className="h-40 w-40" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {mode === 'signin'
            ? 'Sign in to your account'
            : 'Create your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-lg rounded-xl border border-gray-100">
          <form className="space-y-5" action={formAction}>
            <input type="hidden" name="redirect" value={redirect || ''} />
            <input type="hidden" name="priceId" value={priceId || ''} />
            <input type="hidden" name="inviteId" value={inviteId || ''} />
            
            {/* Name field - only show in signup mode */}
            {mode === 'signup' && (
              <div>
                <Label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </Label>
                <div>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    defaultValue={state.name}
                    required
                    maxLength={50}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}
            
            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </Label>
              <div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={state.email}
                  required
                  maxLength={50}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </Label>
              <div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={
                    mode === 'signin' ? 'current-password' : 'new-password'
                  }
                  defaultValue={state.password}
                  required
                  minLength={8}
                  maxLength={100}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Forgot password link only for sign-in mode */}
            {mode === 'signin' && (
              <div className="text-right mt-1">
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            )}

            {/* Terms acceptance checkbox - only show in signup mode */}
            {mode === 'signup' && (
              <div className="flex items-start mt-4">
                <div className="flex items-center h-5 mt-0.5">
                  <Checkbox 
                    id="terms-accept" 
                    name="terms-accept" 
                    required
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">
                    I accept the{' '}
                    <Link href="/terms" target="_blank" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                      Terms and Conditions
                    </Link>
                    ,{' '}
                    <Link href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                      Privacy Policy
                    </Link>
                    {' '}and{' '}
                    <Link href="/earnings-disclaimer" target="_blank" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                      Earnings Disclaimer
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {state?.error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-100">{state.error}</div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 transition-colors"
                disabled={pending || (mode === 'signup' && !termsAccepted)}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Loading...
                  </>
                ) : mode === 'signin' ? (
                  'Sign in'
                ) : (
                  'Sign up'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {mode === 'signin'
                    ? 'New to our platform?'
                    : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href={`${mode === 'signin' ? '/login/sign-up' : '/login/sign-in'}${
                  redirect ? `?redirect=${redirect}` : ''
                }${priceId ? `&priceId=${priceId}` : ''}`}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                {mode === 'signin'
                  ? 'Create an account'
                  : 'Sign in to existing account'}
              </Link>
            </div>
          </div>
          
          {/* Footer links */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/terms" className="hover:text-blue-600 hover:underline transition-colors">
                Terms and Conditions
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/privacy" className="hover:text-blue-600 hover:underline transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/earnings-disclaimer" className="hover:text-blue-600 hover:underline transition-colors">
                Earnings Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Product by DexterLab 2025 ©All Rights Reserved.</p>
      </div>
    </div>
  );
}
