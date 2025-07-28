//<file path="components/restaurant/agent-prompts-manager.tsx">
'use client';

import { useEffect } from 'react';
import { useActionState } from 'react';
import { mutate } from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Wand2 } from 'lucide-react';
import { ensureDefaultAgentPrompts, updateAgentPrompt } from '@/app/(dashboard)/dashboard/restaurants/actions';
import type { RestaurantDetails } from '@/lib/types';
import type { AgentPrompt } from '@/lib/db/schema';
import { ActionState } from '@/lib/auth/middleware';

function AgentPromptCard({ prompt }: { prompt: AgentPrompt }) {
    const [state, formAction, isPending] = useActionState<ActionState, FormData>(updateAgentPrompt, {});
    return (
        <form action={formAction}>
            <input type="hidden" name="promptId" value={prompt.id} />
            <Card>
                <CardHeader><CardTitle className="capitalize">{prompt.agentName} Agent</CardTitle></CardHeader>
                <CardContent>
                    <Textarea name="promptText" defaultValue={prompt.promptText} rows={5} />
                    {state.error && <p className="text-sm text-red-500 mt-2">{state.error}</p>}
                    {state.success && <p className="text-sm text-green-500 mt-2">{state.success}</p>}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Prompt
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}

export function AgentPromptsManager({ details }: { details: RestaurantDetails }) {
    const [ensureState, ensureAction, isEnsuring] = useActionState<ActionState, FormData>(ensureDefaultAgentPrompts, {});

    useEffect(() => {
        if (ensureState.success) {
            mutate(`/api/team/restaurants/${details.id}`);
        }
    }, [ensureState.success, details.id]);

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Default Prompts</CardTitle>
                    <CardDescription>Generate and manage default prompts for your AI agents.</CardDescription>
                </CardHeader>
                <CardFooter className='justify-between items-center'>
                    <form action={ensureAction}>
                        <input type="hidden" name="restaurantId" value={details.id} />
                        <input type="hidden" name="restaurantName" value={details.name} />
                        <Button type="submit" variant="outline" disabled={isEnsuring}>
                            {isEnsuring ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Generate Default Prompts
                        </Button>
                    </form>
                    {ensureState.error && <p className="text-sm text-red-500">{ensureState.error}</p>}
                </CardFooter>
            </Card>
            {details.agentPrompts.map((prompt) => (
                <AgentPromptCard key={prompt.id} prompt={prompt} />
            ))}
        </div>
    );
}