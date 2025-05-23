import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import path from 'path';
import fs from 'fs';

// Pomocnicza funkcja do pobierania części kursu na podstawie lessonId
async function getPartForLesson(lessonId: number): Promise<number> {
  try {
    const filePath = path.join(process.cwd(), 'plan.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const plan = JSON.parse(fileContents);
    
    if (lessonId < 1 || lessonId > plan.data.length) {
      return 1; // Domyślnie pierwsza część
    }
    
    const lesson = plan.data[lessonId - 1];
    return lesson.part || 1;
  } catch (error) {
    console.error('Error getting part for lesson:', error);
    return 1; // Domyślnie pierwsza część
  }
}

export async function POST(req: NextRequest) {
  try {
    // Pobierz id lekcji z formularza
    const contentType = req.headers.get('content-type') || '';
    let lessonId: number | null = null;
    
    if (contentType.includes('application/json')) {
      const body = await req.json();
      lessonId = parseInt(body.lessonId);
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      lessonId = parseInt(formData.get('lessonId') as string);
    } else {
      // Obsługa innych typów treści
      const url = new URL(req.url);
      lessonId = parseInt(url.searchParams.get('lessonId') || '');
    }

    // Sprawdź, czy lessonId jest prawidłowy
    if (!lessonId || isNaN(lessonId)) {
      return NextResponse.json({ error: 'Invalid lesson ID' }, { status: 400 });
    }
    
    // Pobierz partId dla tej lekcji
    const partId = await getPartForLesson(lessonId);

    // Utwórz respons
    const response = NextResponse.redirect(new URL(`/app/lessons/${lessonId}`, req.url));
    
    // Ustaw ciasteczko lastViewedLessonId
    response.cookies.set({
      name: 'lastViewedLessonId',
      value: lessonId.toString(),
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 dni
    });
    
    // Ustaw ciasteczko dla aktywnej części kursu
    response.cookies.set({
      name: 'openPartId',
      value: partId.toString(),
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 dni
    });

    return response;
  } catch (error) {
    console.error('Error setting lastViewedLessonId cookie:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 