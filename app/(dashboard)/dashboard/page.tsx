'use client';

import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const { data: notes, mutate } = useSWR('/api/notes', fetcher);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    setTitle('');
    setContent('');
    mutate();
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <form onSubmit={create} className="mb-6 flex flex-col gap-2 max-w-md">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full rounded-md border p-2"
          placeholder="Write a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button type="submit" className="self-start rounded-full">
          Add Note
        </Button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {notes?.map((note: any) => (
          <Link key={note.id} href={`/dashboard/notes/${note.id}`}>
            <div className="p-4 bg-yellow-200 rounded-md shadow-md min-h-[8rem] transform rotate-[-1deg] hover:rotate-0 transition">
              {note.title && (
                <h3 className="font-semibold mb-2">{note.title}</h3>
              )}
              <p className="whitespace-pre-wrap">{note.content}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
