'use client';

import { useEffect, useState } from 'react';
import { Markdown } from '@/components/ui/markdown';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import posthog from 'posthog-js';

export default function SlideshowClient({ subLessons }) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = subLessons?.length || 0;

  useEffect(() => {
    // Initialize with first slide
  }, []);

  const goToSlide = (slideNumber) => {
    if (slideNumber < 1 || slideNumber > totalSlides) return;
    setCurrentSlide(slideNumber);
  };

  const handlePrevious = () => {
    if (currentSlide > 1) {
      // Capture slide navigation event
      posthog.capture('slideshow navigate', {
        direction: 'previous',
        from_step: currentSlide,
        to_step: currentSlide - 1,
      });
      goToSlide(currentSlide - 1);
    }
  };

  const handleNext = () => {
    if (currentSlide < totalSlides) {
      // Capture slide navigation event
      posthog.capture('slideshow navigate', {
        direction: 'next',
        from_step: currentSlide,
        to_step: currentSlide + 1,
      });
      goToSlide(currentSlide + 1);
    }
  };

  if (!subLessons || !subLessons.length) return null;

  return (
    <div className="mt-8 pt-8">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 mb-8">
        {/* Card header with navigation */}
        <div className="flex items-center mb-4">
          <button
            onClick={handlePrevious}
            disabled={currentSlide === 1}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-full shadow-sm disabled:opacity-50"
            aria-label="Previous step"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="relative flex-grow h-1 mx-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-500 to-teal-400 transition-all duration-300 rounded-r-full"
              style={{ width: `${(currentSlide / totalSlides) * 100}%` }}
            />
          </div>
          <button
            onClick={handleNext}
            disabled={currentSlide === totalSlides}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-full shadow-sm disabled:opacity-50"
            aria-label="Next step"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        {/* Slide content area */}
        {subLessons.map((subLesson, index) => (
          <div
            key={index}
            className={`slide p-8 transition-opacity duration-300 ${
              currentSlide === index + 1 ? 'block' : 'hidden'
            }`}
          >
            <div className="flex items-center mb-6">
              {/* Modern step indicator */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold mr-4 shadow-md">
                {index + 1}
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">
                {subLesson.subject}
              </h3>
            </div>
            <div className="mb-6 bg-white p-4 rounded-xl shadow-sm ring-1 ring-gray-100">
              <p className="text-blue-700 font-medium leading-relaxed">
                {subLesson.desc}
              </p>
            </div>
            {/* Render sub-lesson image if provided */}
            {subLesson.image && (
              <div className="mb-6 text-center">
                <img
                  src={subLesson.image}
                  alt={subLesson.subject}
                  className="mx-auto max-h-48 object-contain rounded-lg shadow-md"
                />
              </div>
            )}
            {subLesson.content && (
              <div className="pt-6 border-t border-gray-100">
                <Markdown>{subLesson.content}</Markdown>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 