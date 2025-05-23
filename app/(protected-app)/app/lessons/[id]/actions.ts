'use server';

import { cookies } from 'next/headers';

export async function saveViewAction(lessonId: string, partId: string | number) {
  // Set the cookie for the last viewed lesson
  const cookieStore = await cookies();
  
  await cookieStore.set('lastViewedLessonId', lessonId.toString(), {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Set the cookie for the open part
  await cookieStore.set('openPartId', partId.toString(), {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return { success: true };
} 