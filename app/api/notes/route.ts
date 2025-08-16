import { getNotes, createNote } from '@/lib/db/queries';

export async function GET() {
  const notes = await getNotes();
  return Response.json(notes);
}

export async function POST(req: Request) {
  const data = await req.json();
  const note = await createNote({ title: data.title, content: data.content });
  return Response.json(note);
}
