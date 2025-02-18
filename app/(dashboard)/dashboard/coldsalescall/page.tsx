'use client';
import React from 'react';

import { startTransition, use, useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/lib/auth';
import { updateAccount, updateColdCallPrompt } from '@/app/(login)/actions';
import { Conversation } from 'components/ui/conversation';


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

  const [charCount, setCharCount] = React.useState(0);

 

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
      Roleplay Scenarios
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What’s the context of this cold sales call?</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-black">
              Add specific information about the product or service that will be discussed during the conversation. This is not shown to users.
              For the best results, write this in the form of directions to the AI. E.g. "You know that..." or "You should..."
            </p>
            <div className="my-4"></div>
            <Label htmlFor="context" className="text-sm text-black">
              Tell the AI what it already knows.
            </Label>
            
            <textarea
              id="coldSalesCallprompttText"
              name="context"
              className="mt-2 p-2 border rounded w-full"
              rows={4}
              maxLength={5000}
              placeholder="You're quite busy. You're open to a cold sales call, but only if the product being sold fills a specific need of yours, and the sales rep is very mindful of your time. Unless the caller has established the value of their product, you should not be helpful. If the caller is successful establishing rapport and trust, you are more likely to be helpful and willing to discuss further"
              onChange={(e) => setCharCount(e.target.value.length)}
            />
            <div className="text-sm text-gray-500 mt-2">
              {charCount} / 5000
            </div>
            <div className="flex justify-between mt-4">
              <Button type="button" className="bg-gray-500 text-white" onClick={() => window.location.href = '/dashboard/ActiveDashboard'}>
              Back
              </Button>
                <Button
                  type="button"
                  className="bg-blue-500 text-white"
                  onClick={() => {
                    startTransition(() => {
                      const textAreaValue = (document.getElementById('coldSalesCallprompttText') as HTMLTextAreaElement).value;
                      if (user) {
                        updateColdCallPrompt(textAreaValue, user);
                      } else {
                        console.error('User is null');
                      }
                    });
                  }}
                >
                  Finish
                </Button>
              
              </div>
        </CardContent>
      </Card>
    
    </section>
  );
}
