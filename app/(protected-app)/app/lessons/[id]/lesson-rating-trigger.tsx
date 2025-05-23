'use client';

import { useState, useEffect } from 'react';
import { LessonRating } from './lesson-rating';

interface LessonRatingTriggerProps {
  lessonId: string;
  trigger: boolean;
}

export default function LessonRatingTrigger({ lessonId, trigger }: LessonRatingTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (trigger) {
      // Delay opening the rating dialog until after confetti animation completes
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 7000); // 7 seconds delay matches confetti duration
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return <LessonRating lessonId={lessonId} isOpen={isOpen} onClose={handleClose} />;
} 