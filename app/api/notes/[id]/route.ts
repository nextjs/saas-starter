import { getNote, updateNote } from '@/lib/db/queries';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const note = await getNote(Number(params.id));
  if (!note) {
    return new Response('Not Found', { status: 404 });
  }
  return Response.json(note);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await req.json();
  const note = await updateNote(Number(params.id), {
    title: data.title,
    content: data.content,
  });
  return Response.json(note);
}
