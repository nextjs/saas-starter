'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, User as UserIcon } from 'lucide-react';
import { updateAccount } from '@/app/(login)/actions';
import { User } from '@/lib/db/schema';
import useSWR from 'swr';
import { Suspense } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ActionState = {
  name?: string;
  error?: string;
  success?: string;
};

type AccountFormProps = {
  state: ActionState;
  nameValue?: string;
  emailValue?: string;
};

function AccountForm({
  state,
  nameValue = '',
  emailValue = ''
}: AccountFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-zinc-400 font-bold uppercase tracking-wider text-xs">
          Name
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter your name"
          defaultValue={state.name || nameValue}
          required
          className="bg-zinc-900 border-zinc-800 text-white rounded-xl h-12"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-zinc-400 font-bold uppercase tracking-wider text-xs">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          defaultValue={emailValue}
          required
          className="bg-zinc-900 border-zinc-800 text-white rounded-xl h-12"
        />
      </div>
    </div>
  );
}

function AccountFormWithData({ state }: { state: ActionState }) {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  return (
    <AccountForm
      state={state}
      nameValue={user?.name ?? ''}
      emailValue={user?.email ?? ''}
    />
  );
}

export default function GeneralPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateAccount,
    {}
  );

  return (
    <section className="flex-1 p-4 lg:p-8 bg-black">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 border-2 border-gold rounded-lg">
          <UserIcon className="size-6 text-gold" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white uppercase italic">
          General <span className="text-gold">Settings</span>
        </h1>
      </div>

      <Card className="bg-zinc-950 border-zinc-800 rounded-3xl overflow-hidden max-w-2xl shadow-xl">
        <CardHeader className="border-b border-zinc-900 pb-6">
          <CardTitle className="text-white text-xl uppercase italic font-black">Account Information</CardTitle>
          <CardDescription className="text-zinc-500">Update your profile details and email address.</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form className="space-y-8" action={formAction}>
            <Suspense fallback={<AccountForm state={state} />}>
              <AccountFormWithData state={state} />
            </Suspense>

            {state.error && (
              <p className="text-rose-500 text-sm font-medium">{state.error}</p>
            )}
            {state.success && (
              <p className="text-emerald-500 text-sm font-medium">{state.success}</p>
            )}

            <Button
              type="submit"
              className="bg-gold text-black hover:bg-yellow-500 rounded-full px-8 py-6 font-black tracking-widest uppercase transition-all"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
