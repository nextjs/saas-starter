'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

async function markLessonAsCompleted(userId: number, lessonId: number) {
  const response = await fetch('/api/lessons/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      lessonId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to mark lesson as completed');
  }

  return response.json();
}

export function MarkAsCompletedButton({
  userId,
  lessonId,
  isCompleted,
}: {
  userId: number;
  lessonId: number;
  isCompleted: boolean;
}) {
  const [completed, setCompleted] = useState(isCompleted);
  const [loading, setLoading] = useState(false);

  const handleMarkAsCompleted = async () => {
    if (completed) return;
    
    setLoading(true);
    try {
      await markLessonAsCompleted(userId, lessonId);
      setCompleted(true);
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <Button
        variant="outline"
        className="flex items-center gap-2 text-teal-600 border-teal-200 bg-teal-50"
        disabled
      >
        <CheckCircle size={16} /> Ukończone
      </Button>
    );
  }

  return (
    <Button
      onClick={handleMarkAsCompleted}
      variant="outline"
      className="flex items-center gap-2"
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={16} /> Zapisywanie...
        </>
      ) : (
        'Oznacz jako ukończone'
      )}
    </Button>
  );
} 