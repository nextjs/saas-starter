import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LessonHeaderProps {
  lessonNumber: number;
  title: string;
  isCompleted: boolean;
  previousLessonId: string | null;
  nextLessonId: string | null;
}

export function LessonHeader({
  lessonNumber,
  title,
  isCompleted,
  previousLessonId,
  nextLessonId,
}: LessonHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Link 
            href="/app" 
            className="text-teal-600 hover:text-teal-700 flex items-center gap-1 mr-6"
          >
            <ArrowLeft size={16} />
            <span>Return to course</span>
          </Link>
          {isCompleted && (
            <div className="bg-teal-100 text-teal-800 text-xs rounded-full px-3 py-1 flex items-center gap-1">
              <Book size={14} />
              <span>Lesson completed</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {previousLessonId && (
            <Button asChild className="flex items-center gap-1 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 disabled:opacity-50">
              <Link href={`/app/lessons/${previousLessonId}`}> 
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Link>
            </Button>
          )}
          
          {nextLessonId && isCompleted && (
            <Button asChild className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-full shadow-sm hover:bg-blue-700 disabled:opacity-50">
              <Link href={`/app/lessons/${nextLessonId}`}> 
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900">
        Lesson {lessonNumber}: {title}
      </h1>
    </div>
  );
} 