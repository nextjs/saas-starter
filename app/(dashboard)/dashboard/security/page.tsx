'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Trash2, Loader2 } from 'lucide-react';
import { useActionState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { deleteAccount } from '@/app/(login)/actions';

type DeleteState = {
  confirmation?: string;
  error?: string;
  success?: string;
};

export default function SecurityPage() {
  const [deleteState, deleteAction, isDeletePending] = useActionState<
    DeleteState,
    FormData
  >(deleteAccount, {});

  useEffect(() => {
    if (deleteState.success) {
      void signOut({ callbackUrl: '/sign-in' });
    }
  }, [deleteState.success]);

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium bold text-gray-900 mb-6">
        Security Settings
      </h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sign-in method</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Sign in using the Google or Facebook account connected to this
            profile. Manage your password through that provider.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Account deletion is non-reversable. Please proceed with caution.
          </p>
          <form action={deleteAction} className="space-y-4">
            <div>
              <Label htmlFor="delete-password" className="mb-2">
                Type DELETE to confirm
              </Label>
              <Input
                id="delete-password"
                name="confirmation"
                type="text"
                required
                pattern="DELETE"
                defaultValue={deleteState.confirmation}
              />
            </div>
            {deleteState.error && (
              <p className="text-red-500 text-sm">{deleteState.error}</p>
            )}
            <Button
              type="submit"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeletePending}
            >
              {isDeletePending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
