import { getNote } from '@/lib/db/queries';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function NotePage({ params }: { params: { id: string } }) {
  const note = await getNote(Number(params.id));
  if (!note) {
    notFound();
  }

  return (
    <div className="p-6 flex flex-col gap-4">
      {note.title && <h1 className="text-2xl font-bold">{note.title}</h1>}
      <p className="whitespace-pre-wrap">{note.content}</p>
      <Button asChild className="w-fit rounded-full">
        <a href="/dashboard">Back</a>
      </Button>
    </div>
  );
}
