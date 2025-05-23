'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  Book as BookIcon,
  LockIcon as LockIconSvg
} from 'lucide-react';

interface Lesson {
  lessonId: number;
  subject: string;
  lesson: any[];
  part: number;
  desc?: string;
}

interface PartInfo {
  id: number;
  name: string;
  icon: string;
  lessons: Lesson[];
}

interface PartListProps {
  sortedParts: PartInfo[];
  initialOpenPartId: number;
  completedLessonIds: string[];
  availableLessonIds: string[];
  nextAvailableLessonId: string | null;
  lastViewedLessonId: string | null;
}

export default function PartList({
  sortedParts,
  initialOpenPartId,
  completedLessonIds,
  availableLessonIds,
  nextAvailableLessonId,
  lastViewedLessonId
}: PartListProps) {
  const [openPartId, setOpenPartId] = useState(initialOpenPartId);

  const togglePart = async (partId: number) => {
    const newOpen = openPartId === partId ? 0 : partId;
    setOpenPartId(newOpen);
    // Persist preference via API (no redirect)
    try {
      await fetch(`/api/toggle-part?partId=${partId}`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to persist open part:', err);
    }
  };

  return (
    <div className="space-y-6 mb-8 w-full">
      {sortedParts.map((part) => {
        const isOpen = part.id === openPartId;
        const IconComponent = part.icon && typeof part.icon === 'string' ? require('lucide-react')[part.icon] : null;
        return (
          <div key={part.id} className="rounded-lg overflow-hidden shadow-md border border-gray-200 w-full">
            <button
              type="button"
              onClick={() => togglePart(part.id)}
              className={`group block w-full relative p-0 text-left transition-colors ${isOpen ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
            >
              <div className="flex items-center justify-between p-4 hover:opacity-90 duration-200 w-full">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center mr-4">
                    {IconComponent && <IconComponent className="text-white" size={24} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-blue-700 truncate">{part.name}</h2>
                    <p className="text-sm text-blue-500">{part.lessons.length} lessons</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isOpen ? (
                    <div className="p-2 rounded-full bg-blue-100">
                      <ChevronDown className="text-blue-700" size={20} />
                    </div>
                  ) : (
                    <div className="p-2 rounded-full bg-gray-100 group-hover:bg-blue-50 duration-200">
                      <ChevronRight className="text-blue-600" size={20} />
                    </div>
                  )}
                </div>
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-blue-100 bg-white">
                <div className="grid grid-cols-1 gap-4 p-4 w-full overflow-hidden">
                  {part.lessons.map((lesson) => {
                    const lessonId = lesson.id || lesson["id:"] || `00000000-0000-0000-0000-${lesson.lessonId.toString().padStart(12, '0')}`;
                    const isCompleted = completedLessonIds.includes(lessonId);
                    const isAvailable = availableLessonIds.includes(lessonId);
                    const isNextLesson = lessonId === nextAvailableLessonId;
                    const isCurrentLesson = lessonId === lastViewedLessonId;

                    return (
                      <div key={lessonId} className="h-full w-full">
                        <Link
                          href={isAvailable ? `/app/lessons/${lessonId}` : '#'}
                          className={`${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} block w-full`}
                        >
                          <div
                            className={`w-full bg-white rounded-2xl shadow-sm hover:shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 transition-transform transform hover:-translate-y-1 h-full flex flex-col relative overflow-hidden`}>
                            {/* Left accent border */}
                            <div
                              className={`absolute top-0 bottom-0 left-0 w-2 rounded-l-2xl ${
                                isCompleted
                                  ? 'bg-teal-500'
                                  : isNextLesson
                                    ? 'bg-gradient-to-b from-blue-500 to-teal-400'
                                    : 'bg-gray-200'
                              } transition-all duration-300`}
                            />
                            <div className="p-5 flex flex-col flex-grow">
                              <div className="flex items-center mb-2">
                                <div
                                  className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-semibold mr-3 flex-shrink-0 ${
                                    isNextLesson
                                      ? 'bg-blue-500'
                                      : 'bg-gradient-to-r from-blue-500 to-teal-400'
                                  }`}
                                >
                                  {lesson.lessonId}
                                </div>
                                <h3 className={`text-lg font-medium truncate ${
                                  isCompleted
                                    ? 'text-teal-600'
                                    : isNextLesson
                                    ? 'text-blue-600'
                                    : isAvailable
                                    ? 'text-gray-800'
                                    : 'text-gray-400'
                                }`}>
                                  {lesson.subject}
                                </h3>
                              </div>
                              {lesson.desc && (
                                <p className="mb-4 text-sm text-gray-600 truncate line-clamp-2">
                                  {lesson.desc}
                                </p>
                              )}
                              <div className="mt-auto text-sm flex items-center gap-3">
                                {isCompleted && (
                                  <><BookIcon size={16} className="text-teal-600" /> <span className="text-teal-600">Completed</span></>
                                )}
                                {isNextLesson && !isCompleted && (
                                  <span className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full text-sm font-semibold">Next</span>
                                )}
                                {!isAvailable && !isCompleted && (
                                  <><LockIconSvg size={16} className="text-gray-400" /><span className="text-gray-400">Locked</span></>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 