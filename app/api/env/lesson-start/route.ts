import { NextResponse } from 'next/server';

export async function GET() {
  // Get LESSON_START value from environment
  const lessonStartEnv = process.env.LESSON_START;
  const lessonStart = lessonStartEnv ? parseInt(lessonStartEnv) : 0;

  return NextResponse.json({ lessonStart });
} 