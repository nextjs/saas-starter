import { Suspense } from 'react';
import { Login } from '../login';

export default function SignInPage() {
  return (
    <Suspense>
      <Login mode="signin" />
    </Suspense>
  );
}
