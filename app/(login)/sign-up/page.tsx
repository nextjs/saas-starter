import { Suspense } from 'react';
import { Login } from '../login';

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50" />
      }
    >
      <Login mode="signup" />
    </Suspense>
  );
}
