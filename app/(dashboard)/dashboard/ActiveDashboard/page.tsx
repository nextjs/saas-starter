'use client';

import { startTransition, use, useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/lib/auth';
import { updateAccount } from '@/app/(login)/actions';

type ActionState = {
  error?: string;
  success?: string;
};

export default function GeneralPage() {
  const { userPromise } = useUser();
  const user = use(userPromise);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateAccount,
    { error: '', success: '' }
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // If you call the Server Action directly, it will automatically
    // reset the form. We don't want that here, because we want to keep the
    // client-side values in the inputs. So instead, we use an event handler
    // which calls the action. You must wrap direct calls with startTransition.
    // When you use the `action` prop it automatically handles that for you.
    // Another option here is to persist the values to local storage. I might
    // explore alternative options.
    startTransition(() => {
      formAction(new FormData(event.currentTarget));
    });
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
      Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
        <CardTitle>
          <div className="flex items-center">
            <span className="mr-2">❄️</span> Cold Sales Call
          </div>
        </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Try your hand at booking a meeting from a cold sales call</p>
          <div className="flex justify-between mt-4">
            <Button 
              className="bg-white text-blue-500 border border-blue-500 font-bold"
              onClick={() => window.location.href = '/dashboard/coldsalescall'}
            >
              Customize
            </Button>
            <Button 
              className="bg-blue-500 text-white font-bold"
              onClick={() => window.location.href = '/dashboard/TalkingWithBot'}
            >
              Play
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
        <p>Recent activity content goes here...</p>
        </CardContent>
      </Card>

    
    <h2 className="text-lg lg:text-xl font-medium text-gray-900 mb-4">Insights</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 col-span-2">
        <Card>
          <CardHeader>
        <CardTitle>Strength</CardTitle>
          </CardHeader>
          <CardContent>
        <p>Sales content goes here...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
        <CardTitle>Improvement</CardTitle>
          </CardHeader>
          <CardContent>
        <p>Performance content goes here...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
        <CardTitle>Overall</CardTitle>
          </CardHeader>
          <CardContent>
        <p>Notifications content goes here...</p>
          </CardContent>
        </Card>
      </div>
      </div>
    </section>
  );
}
