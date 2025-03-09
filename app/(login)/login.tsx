'use client';

import React from 'react';
import { GalleryVerticalEnd } from 'lucide-react';
import { LoginForm } from '@/components/login-form';

interface LoginProps {
  mode?: 'signin' | 'signup';
}

export function Login({ mode = 'signin' }: LoginProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary">
            <GalleryVerticalEnd className="h-3 w-3 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === 'signin' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'signin' 
              ? 'Enter your email below to sign in to your account' 
              : 'Enter your email below to create your account'}
          </p>
        </div>
        <LoginForm mode={mode} />
      </div>
    </div>
  );
}
