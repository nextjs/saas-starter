'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleIcon, Loader2 } from 'lucide-react';
import { signIn, signUp, forgotPassword, resetPassword } from './actions';
import { ActionState } from '@/lib/auth/middleware';

const actionMap = {
  signin: signIn,
  signup: signUp,
  forgotPassword: forgotPassword,
  resetPassword: resetPassword,
};

const defaultAction = signIn; // Default action if mode is not found

// ... existing imports ...

const MODES = {
  signin: {
    title: 'Sign in to your account',
    buttonText: 'Sign in',
    altLink: { text: 'Create an account', href: '/sign-up' },
    altPrompt: 'New to our platform?',
  },
  signup: {
    title: 'Create your account',
    buttonText: 'Sign up',
    altLink: { text: 'Sign in to existing account', href: '/sign-in' },
    altPrompt: 'Already have an account?',
  },
  forgotPassword: {
    title: 'Forgot Password',
    buttonText: 'Send reset link',
    altLink: { text: 'Sign in', href: '/sign-in' },
    altPrompt: 'Remembered your password?',
  },
  resetPassword: {
    title: 'Reset Password',
    buttonText: 'Reset password',
    altLink: { text: 'Sign in', href: '/sign-in' },
    altPrompt: 'Remembered your password?',
  },
};

export function Login({
  mode = 'signin',
}: {
  mode?: 'signin' | 'signup' | 'forgotPassword' | 'resetPassword';
}) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const token = searchParams.get('token');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    actionMap[mode] || defaultAction,
    { error: '' }
  );

  const { title, buttonText, altLink, altPrompt } = MODES[mode];

  return (
    <div className='min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='flex justify-center'>
          <CircleIcon className='h-12 w-12 text-orange-500' />
        </div>
        <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
          {title}
        </h2>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <form className='space-y-6' action={formAction}>
          <input type='hidden' name='redirect' value={redirect || ''} />
          <input type='hidden' name='priceId' value={priceId || ''} />
          <input type='hidden' name='inviteId' value={inviteId || ''} />
          {mode === 'resetPassword' && (
            <input type='hidden' name='token' value={token || ''} />
          )}
          {mode !== 'resetPassword' && (
            <div>
              <Label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'
              >
                Email
              </Label>
              <div className='mt-1'>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  maxLength={50}
                  className='appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm'
                  placeholder='Enter your email'
                />
              </div>
            </div>
          )}
          {(mode === 'signin' ||
            mode === 'signup' ||
            mode === 'resetPassword') && (
            <div>
              <Label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'
              >
                Password
              </Label>
              <div className='mt-1'>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  autoComplete={
                    mode === 'signin' ? 'current-password' : 'new-password'
                  }
                  required
                  minLength={8}
                  maxLength={100}
                  className='appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm'
                  placeholder='Enter your password'
                />
              </div>

              {mode === 'signin' && (
                <div className='text-sm mt-4'>
                  <Link
                    href='/forgot-password'
                    className='font-medium text-orange-600 hover:text-orange-500'
                  >
                    Forgot your password?
                  </Link>
                </div>
              )}
            </div>
          )}

          {state?.error && (
            <div className='text-red-500 text-sm'>{state.error}</div>
          )}
          {state?.success && (
            <div className='text-green-500 text-sm'>{state.success}</div>
          )}

          <div>
            <Button
              type='submit'
              className='w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className='animate-spin mr-2 h-4 w-4' />
                  Loading...
                </>
              ) : (
                buttonText
              )}
            </Button>
          </div>
        </form>

        <div className='mt-6'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-gray-50 text-gray-500'>{altPrompt}</span>
            </div>
          </div>

          <div className='mt-6'>
            <Link
              href={`${altLink.href}${redirect ? `?redirect=${redirect}` : ''}${
                priceId ? `&priceId=${priceId}` : ''
              }`}
              className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
            >
              {altLink.text}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
