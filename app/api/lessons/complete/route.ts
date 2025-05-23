import { NextRequest, NextResponse } from 'next/server';
import { getUser, markLessonAsCompleted, getAllUserProgress, getTeamForUser } from '@/lib/db/queries';
import { activityLogs, ActivityType } from '@/lib/db/schema';
import { db } from '@/lib/db/drizzle';
import path from 'path';
import fs from 'fs';

// Helper function to convert numeric or string IDs to a valid UUID format
function ensureUuid(id: string): string {
  // Check if the ID is already a valid UUID
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(id)) {
    return id;
  }

  // If it's a simple number/string, convert it to a valid UUID format
  return `00000000-0000-0000-0000-${id.padStart(12, '0')}`;
}

// Struktura do przechowywania informacji o ukończonych lekcjach
interface CompletedLesson {
  id: number;
  completedAt: string; // ISO string z datą ukończenia
}

export async function POST(req: NextRequest) {
  try {
    // Sprawdź, czy użytkownik jest zalogowany
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Pobierz dane z formularza
    const formData = await req.formData();
    const lessonIdStr = formData.get('lessonId') as string;
    const lessonId = lessonIdStr; // Keep as string for UUID conversion
    const partId = parseInt(formData.get('partId') as string);
    
    // Sprawdź, czy lessonId jest prawidłowy
    if (!lessonId) {
      return NextResponse.json({ error: 'Invalid lesson ID' }, { status: 400 });
    }

    // Pobierz wszystkie ukończone lekcje użytkownika z bazy danych
    const userProgress = await getAllUserProgress(user.id);
    const completedLessons = userProgress
      .filter(progress => progress.completed)
      .map(progress => progress.lessonId);
    
    // Sprawdź, czy lekcja została już ukończona
    const isLessonCompleted = completedLessons.includes(ensureUuid(lessonId));
    if (isLessonCompleted) {
      const timestamp = Date.now();
      const url = new URL(req.url);
      const origin = url.origin;
      const redirectUrl = `${origin}/app/lessons/${lessonId}?t=${timestamp}`;
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }
    
    // Pobierz wartość LESSON_START z procesu środowiskowego
    const lessonStartEnv = process.env.LESSON_START;
    const lessonStart = lessonStartEnv ? parseInt(lessonStartEnv) : 0;
    console.log('LESSON_START value (complete API):', lessonStart);
    
    // Spróbuj wyciągnąć numeryczne ID z UUID, jeśli jest w formacie 00000000-0000-0000-0000-XXXXXXXXXXXX
    let lessonNumericIndex = -1;
    
    // Najpierw próbujemy standardowego formatu
    const uuidMatch = lessonIdStr.match(/^00000000-0000-0000-0000-(\d+)$/);
    if (uuidMatch) {
      lessonNumericIndex = parseInt(uuidMatch[1]);
      console.log(`Wyciągnięto numer ID: ${lessonNumericIndex} z UUID: ${lessonIdStr} (standard format)`);
    } else {
      // Alternatywne podejście - sprawdź, czy to jest UUID i wyciągnij ostatnią część
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidPattern.test(lessonIdStr)) {
        const parts = lessonIdStr.split('-');
        const lastPart = parts[4];
        try {
          // Spróbuj przekonwertować wartość szesnastkową na liczbę
          lessonNumericIndex = parseInt(lastPart, 16);
          if (lessonNumericIndex > 1000000) {
            // Jeśli liczba jest zbyt duża, to może to być losowy UUID,
            // spróbujmy znaleźć indeks lekcji w tablicy lessons
            const planFilePath = path.join(process.cwd(), 'plan.json');
            if (fs.existsSync(planFilePath)) {
              const planJson = fs.readFileSync(planFilePath, 'utf-8');
              const plan = JSON.parse(planJson);
              const lessons = plan.data || [];
              const lessonIndex = lessons.findIndex(l => l.id === lessonIdStr || l["id:"] === lessonIdStr);
              if (lessonIndex >= 0) {
                lessonNumericIndex = lessonIndex + 1; // Indeksowanie od 1
                console.log(`Znaleziono lekcję na pozycji ${lessonNumericIndex} w planie na podstawie UUID: ${lessonIdStr}`);
              }
            }
          } else {
            console.log(`Wyciągnięto numer ID: ${lessonNumericIndex} z ostatniej części UUID: ${lastPart}`);
          }
        } catch (e) {
          console.error(`Błąd przetwarzania UUID ${lessonIdStr}:`, e);
        }
      } else {
        // Jeśli to nie jest UUID, spróbuj bezpośrednio jako numer
        lessonNumericIndex = parseInt(lessonIdStr);
        console.log(`Bezpośrednie parsowanie numeru: ${lessonNumericIndex} z ID: ${lessonIdStr}`);
      }
    }
    
    console.log(`Sprawdzam lekcję: UUID=${lessonIdStr}, Index=${lessonNumericIndex}, LESSON_START=${lessonStart}`);
    
    // Lekcja jest zwolniona z limitu, jeśli jest w zakresie LESSON_START
    const isStarterLesson = !isNaN(lessonNumericIndex) && lessonNumericIndex <= lessonStart;
    
    if (isStarterLesson) {
      console.log(`Lekcja ${lessonIdStr} (index ${lessonNumericIndex}) jest w zakresie LESSON_START (${lessonStart}), pomijam sprawdzanie limitu dziennego`);
    } else {
      console.log(`Lekcja ${lessonIdStr} (index ${lessonNumericIndex}) NIE jest w zakresie LESSON_START (${lessonStart}), sprawdzam limit dzienny`);
      
      // Sprawdź limit dzienny tylko dla lekcji powyżej LESSON_START
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Początek dzisiejszego dnia
      console.log(`Dzisiaj: ${today.toISOString()}`);
      
      // Najpierw sprawdzimy, czy aktualnie przetwarzana lekcja jest rzeczywiście powyżej LESSON_START
      if (lessonNumericIndex > lessonStart) {
        console.log(`Lekcja ${lessonIdStr} jest powyżej LESSON_START (${lessonStart}), więc podlega limitowi dziennemu.`);
        
        // Pobierz wszystkie lekcje ukończone dzisiaj
        const todayCompletedLessons = userProgress.filter(progress => {
          if (!progress.completed) return false;
          
          const completedDate = new Date(progress.updatedAt);
          completedDate.setHours(0, 0, 0, 0);
          
          const isToday = completedDate.getTime() === today.getTime();
          console.log(`Lekcja ${progress.lessonId}, ukończona: ${progress.updatedAt}, po zresetowaniu godzin: ${completedDate.toISOString()}, czy dzisiaj: ${isToday}`);
          
          return isToday;
        });
        
        console.log(`Znaleziono ${todayCompletedLessons.length} lekcji ukończonych dzisiaj`);
        todayCompletedLessons.forEach((progress, index) => {
          console.log(`Dzisiejsza lekcja #${index + 1}: ${progress.lessonId}, ukończona: ${progress.updatedAt}`);
        });
        
        // Sprawdź, czy którakolwiek z dzisiejszych lekcji jest powyżej LESSON_START
        const hasCompletedNonStarterLessonToday = todayCompletedLessons.some(progress => {
          // Próbujemy różnych metod, aby uzyskać numeryczny indeks lekcji
          let progressNumId = -1;
          
          // Metoda 1: Standardowy format 00000000-0000-0000-0000-XXXXXXXXXXXX
          const progressUuidMatch = progress.lessonId.match(/^00000000-0000-0000-0000-(\d+)$/);
          if (progressUuidMatch) {
            progressNumId = parseInt(progressUuidMatch[1]);
            console.log(`Metoda 1: Wyciągnięto numer ID: ${progressNumId} z UUID: ${progress.lessonId}`);
          } 
          // Metoda 2: Podział UUID na części i analiza ostatniej części
          else {
            const parts = progress.lessonId.split('-');
            if (parts.length === 5) {
              // Najpierw sprawdź, czy to może być nasz format, ale z przedrostkiem innym niż zera
              if (parts[0].length === 8 && parts[1] === '0000' && parts[2] === '0000' && parts[3] === '0000') {
                const lastPart = parts[4];
                const numericPart = parseInt(lastPart);
                if (!isNaN(numericPart)) {
                  progressNumId = numericPart;
                  console.log(`Metoda 2a: Wyciągnięto ID: ${progressNumId} z UUID z alternatywnym przedrostkiem: ${progress.lessonId}`);
                }
              } 
              // Spróbuj odczytać ostatnią część jako liczbę szesnastkową
              else {
                try {
                  const lastPart = parts[4];
                  // Najpierw próbujemy jako liczba dziesiętna
                  let numericPart = parseInt(lastPart);
                  // Jeśli to nie zadziała, próbujemy jako liczba szesnastkowa
                  if (isNaN(numericPart)) {
                    numericPart = parseInt(lastPart, 16);
                  }
                  if (!isNaN(numericPart) && numericPart < 1000) {  // Zakładamy, że numery lekcji są < 1000
                    progressNumId = numericPart;
                    console.log(`Metoda 2b: Wyciągnięto ID: ${progressNumId} z ostatniej części UUID: ${lastPart}`);
                  }
                } catch (e) {
                  console.error(`Błąd przetwarzania UUID ${progress.lessonId}:`, e);
                }
              }
            }
          }
          
          // Metoda 3: Znajdź indeks lekcji w planie
          if (progressNumId === -1) {
            try {
              const planFilePath = path.join(process.cwd(), 'plan.json');
              if (fs.existsSync(planFilePath)) {
                const planJson = fs.readFileSync(planFilePath, 'utf-8');
                const plan = JSON.parse(planJson);
                const lessons = plan.data || [];
                const lessonIndex = lessons.findIndex(l => l.id === progress.lessonId || l["id:"] === progress.lessonId);
                if (lessonIndex >= 0) {
                  progressNumId = lessonIndex + 1; // Indeksowanie od 1
                  console.log(`Metoda 3: Znaleziono lekcję na pozycji ${progressNumId} w planie na podstawie UUID: ${progress.lessonId}`);
                }
              }
            } catch (e) {
              console.error(`Błąd odczytu planu dla ${progress.lessonId}:`, e);
            }
          }
          
          // Sprawdź, czy to jest lekcja powyżej limitu LESSON_START
          const isNonStarterLesson = progressNumId > lessonStart;
          console.log(`Lekcja ${progress.lessonId} (ID: ${progressNumId}), LESSON_START: ${lessonStart}, czy powyżej limitu: ${isNonStarterLesson}`);
          
          return isNonStarterLesson;
        });
        
        // Jeśli nie można ukończyć dzisiaj lekcji, przekieruj z komunikatem
        if (hasCompletedNonStarterLessonToday) {
          console.log(`Limit dzienny osiągnięty dla użytkownika: ${user.id}, przekierowuję z komunikatem`);
          const timestamp = Date.now();
          const url = new URL(req.url);
          const origin = url.origin;
          // Dodaj parametr z informacją o braku możliwości ukończenia
          const redirectUrl = `${origin}/app/lessons/${lessonId}?limitReached=true&t=${timestamp}`;
          
          const response = NextResponse.redirect(redirectUrl, { status: 303 });
          return response;
        } else {
          console.log(`Nie osiągnięto dziennego limitu, użytkownik może ukończyć lekcję: ${lessonIdStr}`);
        }
      } else {
        console.log(`Nie udało się ustalić numerycznego indeksu lekcji (${lessonNumericIndex}), ale zakładamy, że nie podlega limitowi.`);
      }
    }
    
    // Oznacz lekcję jako ukończoną w bazie danych
    await markLessonAsCompleted(user.id, lessonId);
    
    // Pobierz zespół użytkownika, aby zapisać aktywność z team_id
    const userTeam = await getTeamForUser(user.id);
    
    // Zapisz aktywność użytkownika
    await db.insert(activityLogs).values({
      teamId: userTeam?.id || ensureUuid('0'), // Use team ID or convert 0 to UUID format
      userId: user.id,
      action: ActivityType.LESSON_COMPLETED,
      ipAddress: req.headers.get('x-forwarded-for') || ''
    });
    
    // Przekieruj z powrotem do strony lekcji
    const timestamp = Date.now();
    const url = new URL(req.url);
    const origin = url.origin;
    const redirectUrl = `${origin}/app/lessons/${lessonId}?success=true&t=${timestamp}`;
    
    const response = NextResponse.redirect(redirectUrl, { status: 303 });
    
    // Ustaw ciasteczka dla ostatnio przeglądanej lekcji
    response.cookies.set({
      name: 'lastViewedLessonId',
      value: lessonIdStr,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30  // 30 dni
    });
    
    // Jeśli przekazano partId, ustaw również, który rozdział ma być rozwinięty
    if (partId && !isNaN(partId)) {
      response.cookies.set({
        name: 'openPartId',
        value: partId.toString(),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30  // 30 dni
      });
    }
    
    return response;
  } catch (error) {
    console.error('Error completing lesson:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 