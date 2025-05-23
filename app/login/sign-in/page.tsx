import { Suspense } from 'react';
import { Login } from '../login';

export default function SignInPage() {
  return (
    <>
    <Suspense>
      <Login mode="signin" />
    </Suspense>
      <div className="text-center text-gray-500 text-sm mt-4">
        Product by DexterLab 2025 ©All Rights Reserved.
      </div>
    </>
  );
}
