'use client';

import { useActionState } from 'react';
import { deleteArticle } from '@/lib/articles/actions';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';

type DeleteButtonProps = {
    articleId: number;
};

export function DeleteArticleButton({ articleId }: DeleteButtonProps) {
    const [state, formAction, isPending] = useActionState(deleteArticle, {});

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        if (!confirm('Are you sure you want to delete this article?')) {
            e.preventDefault();
        }
    };

    return (
        <form action={formAction} onSubmit={handleSubmit}>
            <input type="hidden" name="id" value={articleId} />
            <Button type="submit" variant="destructive" size="icon" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
            {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
        </form>
    );
}
