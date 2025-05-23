'use client';

import { useEffect } from 'react';
import { saveViewAction } from './actions';
import posthog from 'posthog-js';

interface SaveLessonViewProps {
  lessonId: string;
  partId: string | number;
}

export function SaveLessonView({ lessonId, partId }: SaveLessonViewProps) {
  useEffect(() => {
    // Call the server action when the component mounts
    saveViewAction(lessonId, partId);
    
    // Track the view in PostHog
    try {
      if (!posthog.__loaded && typeof window !== 'undefined') {
        const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY;
        
        if (apiKey) {
          posthog.init(apiKey, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'
          });
        }
      }
      
      if (posthog.__loaded) {
        posthog.capture('lesson_viewed', {
          lessonId,
          partId,
          timestamp: new Date().toISOString()
        });
        console.log('Tracked lesson view in PostHog:', lessonId, partId);
      }
    } catch (err) {
      console.error('Error tracking lesson view in PostHog:', err);
    }
  }, [lessonId, partId]);

  // This component doesn't render anything, it just saves the view
  return null;
} 