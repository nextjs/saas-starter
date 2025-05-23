import fs from 'fs';
import path from 'path';
import { notFound, redirect } from 'next/navigation';
import { Markdown } from '@/components/ui/markdown';
import { getUser, getTeamForUser, getAllUserProgress, trackLessonAccess } from '@/lib/db/queries';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle, ArrowRight, BookType, Book } from 'lucide-react';
import { LessonHeader } from '@/app/(protected-app)/app/lessons/[id]/lesson-header';
import { cookies } from 'next/headers';
import SlideshowClient from './slideshow-client';
import { SaveLessonView } from './save-lesson-view';
import ConfettiEffect from './confetti';
import Quiz from '@/components/Quiz';
import LessonRatingTrigger from './lesson-rating-trigger';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

// Get training plan data from the JSON file
async function getLessonPlan() {
  const filePath = path.join(process.cwd(), 'plan.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

// Get part/chapter names from part.json file
async function getPartNames() {
  const filePath = path.join(process.cwd(), 'part.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContents);
  
  // Transform the array into an object where the key is the part id
  const partMap: {[key: string]: string} = {};
  data.parts.forEach((part: {id: string, name: string}) => {
    partMap[part.id] = part.name;
  });
  
  return partMap;
}

export default async function LessonPage({ 
  params,
  searchParams 
}: { 
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Fix for searchParams - await before accessing properties
  const searchParamsResolved = await Promise.resolve(searchParams);
  const limitReached = searchParamsResolved?.limitReached === 'true';
  const successMessage = searchParamsResolved?.success === 'true';

  // Get the requested lesson ID from params
  const { id } = await Promise.resolve(params);
  
  // Get the lesson plan data
  const plan = await getLessonPlan();
  const lessons = plan.data;
  
  // Try to find the lesson - first by UUID if provided, or by index if numeric
  let lessonIndex = -1;
  let lesson;
  
  // Check if id is a UUID format
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(id)) {
    // Find lesson by UUID
    lessonIndex = lessons.findIndex(l => l.id === id || l["id:"] === id);
    lesson = lessons[lessonIndex];
  } else {
    // Try to use id as a numeric index (for backward compatibility)
    const numericId = parseInt(id);
    if (!isNaN(numericId) && numericId > 0 && numericId <= lessons.length) {
      lessonIndex = numericId - 1;
      lesson = lessons[lessonIndex];
    }
  }
  
  // If lesson not found, return 404
  if (!lesson) {
    console.log(`Lesson not found with ID: ${id}`);
    return notFound();
  }

  // Log for debugging
  console.log(`Found lesson at index ${lessonIndex} with ID ${id}`);
  
  // Extract the true lesson UUID (might be "id" or "id:" in the JSON)
  const lessonUuid = lesson.id || lesson["id:"] || ensureUuid(id);
  
  // Get the current user
  const user = await getUser();
  if (!user) {
    redirect('/login/sign-in');
  }

  // Get the team and check subscription
  const team = await getTeamForUser(user.id);
  if (!team) {
    redirect('/dashboard');
  }

  // Check if subscription is active or in trial period
  const hasActiveSubscription = 
    team.subscriptionStatus === 'active' || 
    team.subscriptionStatus === 'trialing';
  
  if (!hasActiveSubscription) {
    redirect('/pricing?access=premium');
  }
  
  // Determine if this lesson has rating enabled in plan.json
  const shouldRate = lesson.ocena === true;
  
  // Get lesson content directly from plan.json
  const content = lesson.content;
  if (!content) {
    return notFound();
  }
  
  // Get the course part number/ID
  const part = lesson.part || "1";
  
  // Get course part names from part.json file
  const partNames = await getPartNames();
  const partName = partNames[part] || `Part ${part}`;

  // Track that the user accessed this lesson - use the UUID format
  await trackLessonAccess(user.id, lessonUuid);

  // Get user progress from the database
  const userProgress = await getAllUserProgress(user.id);
  const completedLessonIds = userProgress
    .filter(progress => progress.completed)
    .map(progress => progress.lessonId);
  
  // Check if this lesson is completed - compare with UUID
  const isCompleted = completedLessonIds.includes(ensureUuid(lessonUuid));
  const completedLessons = completedLessonIds.length;
  const percentComplete = Math.round((completedLessons / lessons.length) * 100);

  // Display placeholder progress instead of trying to access the non-existent table
  const isPreviousLessonCompleted = true; // Allow marking any lesson as completed for now
  
  // Find adjacent lessons by index
  const prevLessonId = lessonIndex > 0 ? 
    (lessons[lessonIndex - 1].id || lessons[lessonIndex - 1]["id:"]) : 
    null;
    
  const nextLessonId = lessonIndex < lessons.length - 1 ? 
    (lessons[lessonIndex + 1].id || lessons[lessonIndex + 1]["id:"]) : 
    null;
  
  // Log for debugging
  console.log(`Previous lesson ID: ${prevLessonId}, Next lesson ID: ${nextLessonId}`);
  
  const showNextLessonButton = isCompleted && nextLessonId;
  const hasNextLesson = nextLessonId !== null;

  // Check if the user has access to this lesson
  let isAccessAllowed = false;
  let nextAvailableLessonId = lessons[0].id || lessons[0]["id:"]; // The first lesson is always available

  // Pobierz wartość LESSON_START z procesu środowiskowego
  const lessonStartEnv = process.env.LESSON_START;
  const lessonStart = lessonStartEnv ? parseInt(lessonStartEnv, 10) : 1;
  console.log('LESSON_START value (lesson page):', lessonStart);

  // Sprawdź, czy lekcja jest automatycznie dostępna jako jedna z pierwszych
  // W nowym systemie używamy indeksu w tablicy lekcji
  const isInStarterLessons = lessonIndex < lessonStart;
  
  // Znajdź pierwszą nieukończoną lekcję po LESSON_START
  let foundNextAvailable = false;
  for (let i = Math.max(lessonStart, 0); i < lessons.length; i++) {
    const currentLessonUuid = lessons[i].id || lessons[i]["id:"];
    // Zawsze używaj ensureUuid do porównania lekcji
    if (!completedLessonIds.includes(ensureUuid(currentLessonUuid))) {
      nextAvailableLessonId = currentLessonUuid;
      foundNextAvailable = true;
      break;
    }
  }

  // Log dla debugowania
  console.log('Next available lesson ID:', nextAvailableLessonId);
  console.log('Current lesson UUID:', lessonUuid);
  console.log('Is in starter lessons:', isInStarterLessons);
  
  // Lekcja jest dostępna jeśli: jest już ukończona, jest w startowych lekcjach, 
  // lub jest następną lekcją do ukończenia po lekcjach startowych
  isAccessAllowed = isCompleted || isInStarterLessons || lessonUuid === nextAvailableLessonId;

  // Get the cookie for last viewed lesson
  const cookieStore = await cookies();
  const lastViewedLessonId = cookieStore.get('lastViewedLessonId')?.value || lessons[0].id || lessons[0]["id:"];

  if (!isAccessAllowed) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V7a3 3 0 00-3-3H5a3 3 0 00-3 3v8a3 3 0 003 3h10a3 3 0 003-3v-4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No access to this lesson</h2>
            <p className="text-gray-600 mb-6">
              You need to complete previous lessons before you can access this one.
            </p>
            <div className="flex justify-center">
              <Button asChild className="mr-4">
                <a href={`/app/lessons/${nextAvailableLessonId}`}>
                  Go to next available lesson
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/app">
                  Return to course home
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modified component fragment that displays completion message or button
  const completionSection = () => {
    // Check if the lesson is already completed
    if (isCompleted) {
      return (
        <div className="flex items-center text-teal-600 gap-2 bg-teal-50 px-4 py-2 rounded-lg">
          <Book size={20} />
          <span className="font-medium">Lesson completed</span>
        </div>
      );
    } 
    
    // Check if this is a starter lesson (within LESSON_START)
    // Starter lessons can be completed without daily limit restrictions
    if (limitReached && isInStarterLessons) {
      return (
        <form action="/api/lessons/complete" method="POST">
          <input type="hidden" name="lessonId" value={lessonUuid} />
          <input type="hidden" name="partId" value={part} />
          <div className="flex flex-col items-center gap-2">
            <Button type="submit">
              Mark as completed
            </Button>
            <p className="text-xs text-gray-500 mt-1 text-center">
              This is a starter lesson - you can complete it without daily limits.
            </p>
          </div>
        </form>
      );
    }
    
    // Check if the daily lesson limit has been reached (for lessons beyond LESSON_START)
    if (limitReached) {
      return (
        <div className="flex flex-col items-center text-amber-600 gap-2">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Daily limit reached</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            You can complete only one lesson per day.<br />
            Come back tomorrow to continue learning.
          </p>
        </div>
      );
    }
    
    // Otherwise show the button to complete the lesson
    return (
      <form action="/api/lessons/complete" method="POST">
        <input type="hidden" name="lessonId" value={lessonUuid} />
        <input type="hidden" name="partId" value={part} />
        <Button type="submit">
          Mark as completed
        </Button>
      </form>
    );
  };

  // After fetching the lesson variable, before rendering, map quiz data
  // Support both 'test' and 'questions' arrays and nested 'ask' property
  const rawTests = Array.isArray(lesson.test)
    ? lesson.test
    : Array.isArray(lesson.questions)
    ? lesson.questions
    : [];
  const quizData = rawTests.length > 0 ? rawTests[0] : null;
  console.log('DEBUG - Quiz data found:', {
    hasTest: rawTests.length > 0,
    quizData,
    nestedQuestions: (quizData?.questions ?? quizData?.ask)?.length,
  });
  
  const rawQuestions = quizData
    ? Array.isArray(quizData.questions)
      ? quizData.questions
      : Array.isArray(quizData.ask)
      ? quizData.ask
      : []
    : [];
  const quizQuestions = rawQuestions.map((q: any, idx: number) => {
    // Determine if this is multi-choice: either 'correct' or 'correctIndexes' is an array
    const isMulti = Array.isArray(q.correct) || Array.isArray(q.correctIndexes);
    return {
      id: idx,
      // Determine question type based on JSON data
      type: isMulti ? 'multi_choice' : 'single_choice',
      question: q.question,
      hint: q.hint,
      if_wrong: q.if_wrong,
      // preserve explanation for single-choice feedback
      explanation: q.explanation,
      options: Array.isArray(q.answers) ? q.answers.map((ans: string, i: number) => ({ label: ans, value: i.toString() })) : [],
      ...(isMulti
        ? {
            // Support both q.correct and q.correctIndexes for multi-choice
            correctIndexes: (Array.isArray(q.correct)
              ? q.correct
              : Array.isArray(q.correctIndexes) ? q.correctIndexes : [])
              .map((i: number) => i.toString())
          }
        : {
            // For single-choice, use 'correctIndex' as that's what the Quiz component expects
            correctIndex: q.correct !== undefined ? q.correct.toString() : undefined
          }
      )
    };
  });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Component to save view info using client-side JS */}
      <SaveLessonView lessonId={lessonUuid} partId={part} />
      
      {/* Confetti effect only shows when success=true in URL */}
      <ConfettiEffect />
      
      {/* Show rating dialog only for lessons with ocena:true */}
      {shouldRate && (
        <LessonRatingTrigger lessonId={lessonUuid} trigger={successMessage} />
      )}
      
      <div className="mb-4 text-sm font-medium flex items-center">
        <BookType className="mr-2 text-blue-600" size={16} />
        <span className="text-blue-600">{partName}</span>
      </div>
      
      <LessonHeader 
        lessonNumber={lessonIndex + 1}
        title={lesson.subject}
        isCompleted={isCompleted}
        previousLessonId={prevLessonId}
        nextLessonId={nextLessonId}
      />

      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        {/* Render a lesson image inside the content card if provided */}
        {lesson.image && (
          <div className="mb-6 text-center">
            <img
              src={lesson.image}
              alt={lesson.subject}
              className="mx-auto max-h-64 object-contain rounded-lg shadow-md"
            />
          </div>
        )}
        {lesson.lesson ? (
          <div>
            {/* Display main content first if available */}
            {content && <Markdown>{content}</Markdown>}
            
            {/* Display sub-lessons as slides */}
            {lesson.lesson.length > 0 && (
              <div>
                {/* Import the client component for the slideshow */}
                <SlideshowClient subLessons={lesson.lesson} />
              </div>
            )}
          </div>
        ) : (
          // Display normal content if no sub-lessons
          <Markdown>{content}</Markdown>
        )}
      </div>

      {/* Render quiz if available in the lesson data */}
      {quizQuestions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-xl font-bold">{quizData.subject}</h2>
            <p className="text-gray-600">{quizData.desc}</p>
            <Quiz questions={quizQuestions} />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-8">
        {/* Previous lesson button - always visible if we're not on the first lesson */}
        {prevLessonId ? (
          <Button asChild className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-full shadow-sm hover:bg-gray-50">
            <a href={`/app/lessons/${prevLessonId}`}>
              <ChevronLeft className="w-5 h-5" />
              <span>Previous lesson</span>
            </a>
          </Button>
        ) : (
          <div></div>
        )}

        {/* Middle element - completion button or completion information */}
        <div className="flex flex-col items-center space-y-2">
          {completionSection()}
        </div>

        {/* Next lesson button - visible only if this lesson is completed and there is a next lesson */}
        {showNextLessonButton ? (
          <Button asChild className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full shadow-sm hover:bg-blue-700">
            <a href={`/app/lessons/${nextLessonId}`}>
              <span>Next lesson</span>
              <ChevronRight className="w-5 h-5" />
            </a>
          </Button>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
} 