'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Article } from '@/lib/db/schema';

type ActionState = {
  title?: string;
  content?: string;
  error?: string;
  success?: string;
};

type ArticleFormProps = {
  action: (state: ActionState, data: FormData) => Promise<ActionState>;
  initialData?: Article;
};

export function ArticleForm({ action, initialData }: ArticleFormProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    action,
    {}
  );

  return (
    <form className="space-y-4" action={formAction}>
        <input type="hidden" name="id" value={initialData?.id} />
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Article Title"
          required
          defaultValue={state.title ?? initialData?.title}
        />
      </div>
      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          name="content"
          placeholder="Write your article here..."
          rows={10}
          defaultValue={state.content ?? initialData?.content ?? ''}
        />
      </div>

      {state.error && (
        <p className="text-red-500 text-sm">{state.error}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {initialData ? 'Saving...' : 'Creating...'}
          </>
        ) : (
            initialData ? 'Save Changes' : 'Create Article'
        )}
      </Button>
    </form>
  );
}
