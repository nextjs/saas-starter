'use client';
import React from 'react';

import { startTransition, use, useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/lib/auth';
import { updateAccount, updateColdCallPrompt } from '@/app/(login)/actions';


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
            <CardTitle>What’s the context of this interview?</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-black">
              Add specific information about the product or service that will be discussed during the conversation. This is not shown to users.
              For the best results, write this in the form of directions to the AI. E.g. "1. Can you ..." or "2. What are ...",
            </p>
            <p className="text-sm text-black mt-4">
              What type of interview questions would you like to ask? Please provide 5 questions.
            </p>
            <textarea
              id="interviewQuestions"
              name="interviewQuestions"
              className="mt-2 p-2 border rounded w-full"
              placeholder={user?.ColdCallPrompt || "1. Can you tell me about yourself?\n2. What are your strengths and weaknesses?\n3. Why do you want to work here?\n4. Can you describe a challenging situation you faced and how you handled it?\n5. Where do you see yourself in five years?"}
              rows={5}
              maxLength={5000}
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
                    const textAreaValue = (document.getElementById('interviewQuestions') as HTMLTextAreaElement).value;
                    if (user && textAreaValue.trim() !== '') {
                    updateColdCallPrompt(textAreaValue, user);
                      
                    } 
                    window.location.href = '/dashboard/TalkingWithBot';
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
