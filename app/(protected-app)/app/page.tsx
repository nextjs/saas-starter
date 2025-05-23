import { redirect } from 'next/navigation';
import { getUser, getTeamForUser, getAllUserProgress } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { tools, prompts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { Book, LockIcon, BookType, ChevronDown, ChevronRight, Brain, Code, Lightbulb, FileText, Puzzle, DollarSign, Tag, Calendar, RefreshCw, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cookies } from 'next/headers';
import { CollapsibleText } from './components/CollapsibleText';
import PartList from './components/PartList';

// Helper function to convert numeric or string IDs to a valid UUID format
function ensureUuid(id: string | number | null | undefined): string | null {
  if (id === null || id === undefined) {
    return null;
  }
  
  // Convert to string if it's a number
  const idStr = typeof id === 'number' ? id.toString() : id;
  
  // Check if the ID is already a valid UUID
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(idStr)) {
    return idStr;
  }

  // If it's a simple number/string, convert it to a valid UUID format
  return `00000000-0000-0000-0000-${idStr.padStart(12, '0')}`;
}

// Pobierz dane planu szkoleniowego z pliku JSON
async function getLessonPlan() {
  const filePath = path.join(process.cwd(), 'plan.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

// Pobierz nazwy części/rozdziałów z pliku part.json
async function getPartDetails() {
  const filePath = path.join(process.cwd(), 'part.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContents);
  
  // Przekształć tablicę w obiekt, gdzie kluczem jest id części
  const partMap: {[key: number]: {name: string, icon: string}} = {};
  data.parts.forEach((part: {id: number, name: string, icon?: string}) => {
    partMap[part.id] = {
      name: part.name,
      icon: part.icon || 'BookType' // Default icon if not specified
    };
  });
  
  return partMap;
}

// Map string icons to actual icon components
const iconMap = {
  'BookType': BookType,
  'Brain': Brain,
  'Code': Code,
  'Lightbulb': Lightbulb,
  'FileText': FileText,
  'Puzzle': Puzzle
};

// Struktura dla części kursu
interface PartInfo {
  id: number;
  name: string;
  icon: string;
  lessons: any[];
}

// Struktura do przechowywania informacji o ukończonych lekcjach
interface CompletedLesson {
  id: number;
  completedAt: string; // ISO string z datą ukończenia
}

export default async function AppPage() {
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

  // Pobierz plan szkoleniowy
  const plan = await getLessonPlan();
  const lessons = plan.data;

  // Pobierz postęp użytkownika z bazy danych
  const userProgress = await getAllUserProgress(user.id);
  
  // Upewnij się, że wszystkie identyfikatory lekcji są w formacie UUID
  const completedLessonIds = userProgress
    .filter(progress => progress.completed)
    .map(progress => {
      // Sprawdź, czy ID jest w prawidłowym formacie UUID i konwertuj jeśli nie jest
      return ensureUuid(progress.lessonId) || progress.lessonId;
    })
    .filter(Boolean); // Usuń wszystkie null/undefined
  
  const completedLessons = completedLessonIds.length;
  const percentComplete = Math.round((completedLessons / lessons.length) * 100);
  
  // Log dla debugowania
  console.log('Completed lesson IDs:', completedLessonIds);
  
  // Sprawdź, czy można ukończyć lekcję dzisiaj (czy użytkownik już ukończył lekcję dzisiaj)
  let canCompleteToday = true;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Początek dzisiejszego dnia
  
  // Pobierz wartość LESSON_START z procesu środowiskowego
  const lessonStartEnv = process.env.LESSON_START;
  const lessonStart = lessonStartEnv ? parseInt(lessonStartEnv, 10) : 1;
  console.log('LESSON_START value:', lessonStart);
  
  // Sprawdź, czy użytkownik ukończył jakąś lekcję dzisiaj (z wyjątkiem lekcji w zakresie LESSON_START)
  const todayCompletedLessons = userProgress.filter(progress => {
    if (!progress.completed) return false;
    
    const completedDate = new Date(progress.updatedAt);
    completedDate.setHours(0, 0, 0, 0);
    
    // Spróbuj wyciągnąć numeryczne ID z UUID
    const progressUuidMatch = progress.lessonId.match(/^00000000-0000-0000-0000-(\d+)$/);
    let progressNumId = -1;
    
    if (progressUuidMatch) {
      progressNumId = parseInt(progressUuidMatch[1]);
    }
    
    const isNonStarterLesson = !isNaN(progressNumId) && progressNumId > lessonStart;
    return completedDate.getTime() === today.getTime() && isNonStarterLesson;
  });
  
  if (todayCompletedLessons.length > 0) {
    canCompleteToday = false;
  }

  // Określamy, które lekcje są dostępne dla użytkownika
  // 1. Ukończone lekcje są zawsze dostępne
  // 2. Lekcje do wartości LESSON_START są od razu dostępne
  // 3. Dodatkowo dostępna jest pierwsza nieukończona lekcja po LESSON_START
  
  // Po migracji na UUID, ta funkcja musi zostać dostosowana
  // zamiast numerycznych ID wykorzystujemy UUID i indeksy
  
  // Znajdź wszystkie dostępne lekcje
  const availableLessons: string[] = [];
  
  // Dodaj wszystkie ukończone lekcje jako dostępne
  completedLessonIds.forEach(completedId => {
    if (!availableLessons.includes(completedId)) {
      availableLessons.push(completedId);
    }
  });
  
  // Dodaj LESSON_START pierwszych lekcji jako dostępne
  for (let i = 0; i < lessonStart && i < lessons.length; i++) {
    const lessonUuid = lessons[i].id || lessons[i]["id:"] || ensureUuid((i+1).toString());
    if (!availableLessons.includes(lessonUuid)) {
      availableLessons.push(lessonUuid);
    }
  }
  
  // Znajdź pierwszą nieukończoną lekcję po LESSON_START i dodaj ją jako dostępną
  let nextAvailableLessonId = null;
  for (let i = lessonStart; i < lessons.length; i++) {
    const lessonUuid = lessons[i].id || lessons[i]["id:"] || ensureUuid((i+1).toString());
    if (!completedLessonIds.includes(ensureUuid(lessonUuid))) {
      nextAvailableLessonId = lessonUuid;
      if (!availableLessons.includes(lessonUuid)) {
        availableLessons.push(lessonUuid);
      }
      break;
    }
  }
  
  // Jeśli nie znaleziono następnej lekcji po LESSON_START, użyj pierwszej lekcji
  if (!nextAvailableLessonId && lessons.length > 0) {
    nextAvailableLessonId = lessons[0].id || lessons[0]["id:"] || ensureUuid("1");
  }
  
  // Logowanie dla debugowania
  console.log('AvailableLessons:', availableLessons);
  console.log('nextAvailableLessonId:', nextAvailableLessonId);

  // Pobierz nazwy części kursu z pliku part.json
  const partDetails = await getPartDetails();
  
  // Pobierz cookies
  const cookieStore = await cookies();
  
  // Pobierz z cookies informację o ostatnio otwartej części kursu
  const openPartCookie = cookieStore.get('openPartId');
  
  // Czytamy też ostatnio otwartą lekcję do podświetlenia
  const lastViewedLessonIdCookie = cookieStore.get('lastViewedLessonId');
  const lastViewedLessonId = lastViewedLessonIdCookie ? lastViewedLessonIdCookie.value : null;
  
  // Determine the part containing the last viewed lesson
  let lastViewedLessonPart = null;
  if (lastViewedLessonId !== null) {
    // Find the lesson by UUID
    const lastViewedLesson = lessons.find(l => 
      (l.id || l["id:"]) === lastViewedLessonId
    );
    if (lastViewedLesson) {
      lastViewedLessonPart = lastViewedLesson.part || 1;
    }
  }
  
  // Find the part that contains the next available lesson (marked as "Next")
  let nextLessonPart = null;
  if (nextAvailableLessonId) {
    // Find the lesson by UUID
    const nextAvailableLesson = lessons.find(l => 
      (l.id || l["id:"]) === nextAvailableLessonId
    );
    if (nextAvailableLesson) {
      nextLessonPart = nextAvailableLesson.part || 1;
    }
  }
  
  // Determine which part to expand:
  // 1. Use the cookie value if it exists
  // 2. If no cookie but user has viewed a lesson, use that lesson's part
  // 3. Otherwise, use the part containing the next lesson
  let openPartId;
  if (openPartCookie) {
    openPartId = parseInt(openPartCookie.value);
  } else if (lastViewedLessonPart !== null) {
    openPartId = lastViewedLessonPart;
  } else if (nextLessonPart !== null) {
    openPartId = nextLessonPart;
  } else {
    openPartId = 1; // Default to first part if all else fails
  }
  
  // Grupuj lekcje według części (part)
  const parts: { [key: number]: PartInfo } = {};
  
  lessons.forEach((lesson: any, index: number) => {
    const lessonId = index + 1;
    const part = lesson.part || 1;
    
    if (!parts[part]) {
      parts[part] = {
        id: part,
        name: partDetails[part]?.name || `Część ${part}`,
        icon: partDetails[part]?.icon || 'BookType',
        lessons: []
      };
    }
    
    parts[part].lessons.push({
      ...lesson,
      lessonId
    });
  });
  
  // Sortuj części według numeru
  const sortedParts = Object.values(parts).sort((a, b) => a.id - b.id);

  // Fetch prompt content for today from prompts table
  const todayDate = new Date();
  const promptResult = await db.select().from(prompts).where(eq(prompts.content_date, todayDate)).limit(1);
  const prompt = promptResult.length > 0 ? promptResult[0] : null;
  const codeContent = prompt?.code_content || '';
  const paragraphContent = prompt?.paragraph_content || '';
  // Fetch tool content for today from tools table
  const toolResult = await db.select().from(tools).where(eq(tools.content_date, todayDate)).limit(1);
  const tool = toolResult.length > 0 ? toolResult[0] : null;

  return (
    <div className="flex-1 p-4 lg:p-8 max-w-3xl mx-auto w-full overflow-hidden">
      <Card className="mb-8 border-0 shadow-lg rounded-2xl overflow-hidden bg-white py-0 w-full">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-teal-500 px-6 py-6 rounded-t-2xl m-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-white font-semibold flex items-center">
              AI Engineering Course
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-700 -mt-2">
            Welcome to the AI Engineering course! Below you'll find available lessons. Each one will help you understand key aspects of working as an AI Engineer.
          </p>
        </CardContent>
      </Card>

      {/* Additional Course Cards */}
      <Card className="mb-8 border-0 shadow-lg rounded-2xl overflow-hidden bg-white py-0 w-full">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-teal-500 px-6 py-6 rounded-t-2xl m-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-white font-semibold flex items-center">
              Today Prompt
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {codeContent && (
            <pre className="-mt-6 bg-black text-green-200 font-mono p-4 rounded-lg text-sm overflow-auto mb-4 whitespace-pre-wrap break-words">
              {codeContent}
            </pre>
          )}
          {paragraphContent && (
            <pre className="bg-gray-100 text-gray-800 font-mono p-4 rounded-lg text-sm overflow-auto whitespace-pre-wrap break-words">
              {paragraphContent}
            </pre>
          )}
        </CardContent>
      </Card>
      {/* Dynamic Tool Card */}
      {tool && (
        <Card className="mb-8 border-0 shadow-lg rounded-2xl overflow-hidden bg-white py-0 w-full">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-teal-500 px-6 py-6 rounded-t-2xl m-0">
            <CardTitle className="text-white font-semibold">
              Today AI tool
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {tool.icon && (
              <div className="-mt-6 mb-4 flex items-center space-x-4">
                <img src={tool.icon ?? ''} alt={tool.code_content ?? ''} className="max-h-24 object-contain" />
                <div className="flex flex-col">
                  <span className="self-start text-2xl font-semibold text-gray-800">{tool.code_content}</span>
                  {tool.type && (
                    <span className="mt-2 inline-flex items-center space-x-1 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-full px-3 py-1">
                     
                      <span>{tool.type}</span>
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <CollapsibleText 
              text={tool.paragraph_content || ''} 
              maxLength={180} 
              className="text-gray-700"
            />
            
            {tool.link && (
              <a href={tool.link} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-md">
                <span>Open Link</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            
            {(tool.price_model || tool.price || tool.billing || tool.refund) && (
              <div className="mt-4 flex justify-between border-t pt-4">
                {tool.price_model && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="text-blue-500" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Pricing model</p>
                      <p className="text-sm font-medium">{tool.price_model}</p>
                    </div>
                  </div>
                )}
                {tool.price && (
                  <div className="flex items-center space-x-2">
                    <Tag className="text-blue-500" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Paid options</p>
                      <p className="text-sm font-medium">{tool.price}</p>
                    </div>
                  </div>
                )}
                {tool.billing && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-blue-500" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Billing frequency</p>
                      <p className="text-sm font-medium">{tool.billing}</p>
                    </div>
                  </div>
                )}
                {tool.refund && (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="text-blue-500" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Refund policy</p>
                      <p className="text-sm font-medium">{tool.refund}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {tool.tags && (
              <div className="mt-2 flex flex-wrap gap-2">
                {(
                  Array.isArray(tool.tags)
                    ? tool.tags
                    : typeof tool.tags === 'string'
                    ? tool.tags.trim().startsWith('[')
                      ? (JSON.parse(tool.tags) as string[])
                      : tool.tags.split(',').map((t) => t.trim())
                    : []
                ).map((tag) => (
                  <span key={tag} className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Client-side part list to preserve scroll and focus */}
      <PartList
        sortedParts={sortedParts}
        initialOpenPartId={openPartId}
        completedLessonIds={completedLessonIds}
        availableLessonIds={availableLessons}
        nextAvailableLessonId={nextAvailableLessonId}
        lastViewedLessonId={lastViewedLessonId}
      />
    </div>
  );
} 