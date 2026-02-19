'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Music2, Loader2 } from 'lucide-react';
import { signIn, signUp } from './actions';
import { ActionState } from '@/lib/auth/middleware';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-3 border-2 border-gold rounded-2xl bg-zinc-900 shadow-xl shadow-gold/5">
            <Music2 className="h-10 w-10 text-gold" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-black text-white uppercase italic tracking-tight">
          {mode === 'signin'
            ? 'Sign in to your account'
            : 'Create your account'}
        </h2>
        <p className="mt-2 text-center text-zinc-500 text-sm font-medium uppercase tracking-widest">
          {mode === 'signin' ? 'Welcome back to LyricFlow' : 'Start your creative journey'}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-950 border-2 border-zinc-900 py-10 px-6 shadow-2xl rounded-[2.5rem] sm:px-10">
          <form className="space-y-6" action={formAction}>
            <input type="hidden" name="redirect" value={redirect || ''} />
            <input type="hidden" name="priceId" value={priceId || ''} />
            <input type="hidden" name="inviteId" value={inviteId || ''} />

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="block text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1"
              >
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state.email}
                required
                maxLength={50}
                className="bg-zinc-900 border-zinc-800 text-white rounded-full h-12 px-5 focus:border-gold focus:ring-gold/20 transition-all placeholder:text-zinc-700"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="block text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1"
              >
                Password
              </Label>
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
                className="bg-zinc-900 border-zinc-800 text-white rounded-full h-12 px-5 focus:border-gold focus:ring-gold/20 transition-all placeholder:text-zinc-700"
                placeholder="••••••••"
              />
            </div>

            {state?.error && (
              <div className="text-rose-500 text-xs font-medium ml-1">{state.error}</div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full py-6 rounded-full bg-gold text-black hover:bg-yellow-500 font-black uppercase tracking-widest transition-all shadow-lg shadow-gold/10"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Processing...
                  </>
                ) : mode === 'signin' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-900" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black">
                <span className="px-4 bg-zinc-950 text-zinc-600">
                  OR
                </span>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${
                  redirect ? `?redirect=${redirect}` : ''
                }${priceId ? `&priceId=${priceId}` : ''}`}
                className="text-zinc-400 hover:text-gold text-xs font-bold uppercase tracking-widest transition-colors"
              >
                {mode === 'signin'
                  ? 'New to LyricFlow? Create an account'
                  : 'Already a member? Sign in here'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
