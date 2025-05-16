import { Suspense } from 'react';
import { Login } from '../login';

export default function SignUpPage() {
  return (
    <Suspense>
      <Login mode="signup" />
    </Suspense>
  );
}
