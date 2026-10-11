'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getProviders, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CircleIcon, Loader2 } from 'lucide-react';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const [pendingProvider, setPendingProvider] = useState<
    'google' | 'facebook' | null
  >(null);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailPending, setEmailPending] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [oauthProviders, setOauthProviders] = useState({
    google: false,
    facebook: false,
    loaded: false,
  });
  const oauthError = searchParams.get('error');
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const callbackUrl =
    redirect === 'checkout' && priceId
      ? `/api/stripe/checkout/start?priceId=${encodeURIComponent(priceId)}`
      : '/dashboard';

  useEffect(() => {
    let active = true;
    void getProviders()
      .then((providers) => {
        if (!active) return;
        setOauthProviders({
          google: Boolean(providers?.google),
          facebook: Boolean(providers?.facebook),
          loaded: true,
        });
      })
      .catch(() => {
        if (active) setOauthProviders((current) => ({ ...current, loaded: true }));
      });
    return () => {
      active = false;
    };
  }, []);

  async function continueWith(provider: 'google' | 'facebook') {
    setPendingProvider(provider);
    setError('');
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      setError('Unable to start sign-in. Please try again.');
      setPendingProvider(null);
    }
  }

  async function submitEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setEmailPending(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const body = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(body.error ?? 'Unable to start signup.');
        }
        setVerificationSent(true);
      } else {
        const result = await signIn('credentials', {
          email,
          password,
          callbackUrl,
          redirect: false,
        });
        if (result?.error || !result?.url) {
          throw new Error(
            'Unable to sign in. Check your email and password, and verify your email address.',
          );
        }
        window.location.assign(result.url);
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to continue. Please try again.',
      );
    } finally {
      setEmailPending(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full sm:max-w-md">
        <div className="flex justify-center">
          <CircleIcon className="h-12 w-12 text-orange-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
        </h2>
        <p className="mt-3 text-center text-sm text-gray-600">
          {mode === 'signin'
            ? 'Sign in with email or continue with Google or Facebook.'
            : 'Create an account with email, Google, or Facebook.'}
        </p>
      </div>

      <div className="mx-auto mt-8 w-full space-y-3 sm:max-w-md">
        {searchParams.get('verified') === '1' && (
          <p className="text-center text-sm text-green-700" role="status">
            Email verified. You can now sign in.
          </p>
        )}
        {oauthError && (
          <p className="text-center text-sm text-red-600" role="alert">
            {oauthError === 'OAuthSignin'
              ? 'Unable to start Google or Facebook sign-in. Check the OAuth client credentials and that the provider allows this site’s callback URL.'
              : oauthError === 'OAuthCallback'
                ? 'The identity provider returned an error. Check the provider app settings and try again.'
                : 'Social sign-in failed. Please try again or use email sign-in.'}
          </p>
        )}
        {verificationSent ? (
          <p className="text-center text-sm text-green-700" role="status">
            If this address can be registered, we’ve sent a verification link.
            Check your inbox and follow the link to activate your account.
          </p>
        ) : (
          <form className="space-y-3" onSubmit={submitEmail}>
            <Input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email address"
              maxLength={255}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              type="password"
              name="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              placeholder="Password"
              minLength={8}
              maxLength={100}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {mode === 'signup' && (
              <Input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Confirm password"
                minLength={8}
                maxLength={100}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            )}
            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={emailPending || pendingProvider !== null}
            >
              {emailPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'signup' ? 'Sign up with email' : 'Sign in with email'}
            </Button>
          </form>
        )}
        {(oauthProviders.google || oauthProviders.facebook) && (
          <>
            <div className="flex items-center gap-3 py-1 text-xs text-gray-500">
              <span className="h-px flex-1 bg-gray-300" />
              OR
              <span className="h-px flex-1 bg-gray-300" />
            </div>
            {oauthProviders.google && (
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full"
                disabled={pendingProvider !== null}
                onClick={() => void continueWith('google')}
              >
                {pendingProvider === 'google' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Continue with Google
              </Button>
            )}
            {oauthProviders.facebook && (
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full"
                disabled={pendingProvider !== null}
                onClick={() => void continueWith('facebook')}
              >
                {pendingProvider === 'facebook' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Continue with Facebook
              </Button>
            )}
          </>
        )}
        {oauthProviders.loaded &&
          !oauthProviders.google &&
          !oauthProviders.facebook && (
            <p className="text-center text-sm text-gray-500">
              Google and Facebook sign-in are unavailable until their OAuth
              credentials are configured.
            </p>
          )}
        {error && (
          <p className="text-center text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <p className="pt-2 text-center text-sm text-gray-600">
          {mode === 'signin' ? (
            <>
              New here? <Link className="underline" href="/sign-up">Create an account</Link>
            </>
          ) : (
            <>
              Already registered? <Link className="underline" href="/sign-in">Sign in</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
