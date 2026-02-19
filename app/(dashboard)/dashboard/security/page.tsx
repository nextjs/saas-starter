'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, Trash2, Loader2, ShieldCheck } from 'lucide-react';
import { useActionState } from 'react';
import { updatePassword, deleteAccount } from '@/app/(login)/actions';

type PasswordState = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  error?: string;
  success?: string;
};

type DeleteState = {
  password?: string;
  error?: string;
  success?: string;
};

export default function SecurityPage() {
  const [passwordState, passwordAction, isPasswordPending] = useActionState<
    PasswordState,
    FormData
  >(updatePassword, {});

  const [deleteState, deleteAction, isDeletePending] = useActionState<
    DeleteState,
    FormData
  >(deleteAccount, {});

  return (
    <section className="flex-1 p-4 lg:p-8 bg-black">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 border-2 border-gold rounded-lg">
          <ShieldCheck className="size-6 text-gold" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white uppercase italic">
          Security <span className="text-gold">Settings</span>
        </h1>
      </div>

      <div className="max-w-3xl space-y-8">
        <Card className="bg-zinc-950 border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
          <CardHeader className="border-b border-zinc-900 pb-6">
            <CardTitle className="text-white text-xl uppercase italic font-black">Change Password</CardTitle>
            <CardDescription className="text-zinc-500">Ensure your account is using a strong, unique password.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form className="space-y-6" action={passwordAction}>
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-zinc-400 font-bold uppercase tracking-wider text-xs">
                  Current Password
                </Label>
                <Input
                  id="current-password"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={8}
                  maxLength={100}
                  className="bg-zinc-900 border-zinc-800 text-white rounded-xl h-12"
                  defaultValue={passwordState.currentPassword}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-zinc-400 font-bold uppercase tracking-wider text-xs">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={100}
                  className="bg-zinc-900 border-zinc-800 text-white rounded-xl h-12"
                  defaultValue={passwordState.newPassword}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-zinc-400 font-bold uppercase tracking-wider text-xs">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  maxLength={100}
                  className="bg-zinc-900 border-zinc-800 text-white rounded-xl h-12"
                  defaultValue={passwordState.confirmPassword}
                />
              </div>

              {passwordState.error && (
                <p className="text-rose-500 text-sm font-medium">{passwordState.error}</p>
              )}
              {passwordState.success && (
                <p className="text-emerald-500 text-sm font-medium">{passwordState.success}</p>
              )}

              <Button
                type="submit"
                className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 py-6 font-black tracking-widest uppercase transition-all"
                disabled={isPasswordPending}
              >
                {isPasswordPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-rose-900/30 rounded-3xl overflow-hidden shadow-xl">
          <CardHeader className="border-b border-rose-900/20 pb-6">
            <CardTitle className="text-rose-500 text-xl uppercase italic font-black">Danger Zone</CardTitle>
            <CardDescription className="text-zinc-500">Permanently remove your account and all of your data from LyricFlow.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form action={deleteAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="delete-password" className="text-zinc-400 font-bold uppercase tracking-wider text-xs">
                  Verify Password to Proceed
                </Label>
                <Input
                  id="delete-password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={100}
                  className="bg-zinc-900 border-zinc-800 text-white rounded-xl h-12"
                  defaultValue={deleteState.password}
                />
              </div>

              {deleteState.error && (
                <p className="text-rose-500 text-sm font-medium">{deleteState.error}</p>
              )}

              <Button
                type="submit"
                variant="destructive"
                className="bg-rose-600 hover:bg-rose-700 rounded-full px-8 py-6 font-black tracking-widest uppercase transition-all"
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
      </div>
    </section>
  );
}
