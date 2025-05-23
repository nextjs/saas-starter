'use client';

import { useState, useEffect } from 'react';
import posthog from 'posthog-js';

interface DocumentCompleteButtonProps {
  aiopId: string;
  documentId: string;
  initialCompleted?: boolean;
}

export default function DocumentCompleteButton({ aiopId, documentId, initialCompleted = false }: DocumentCompleteButtonProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  // Ensure PostHog is initialized
  useEffect(() => {
    if (!posthog.__loaded) {
      console.log('PostHog not loaded in AI-Op DocumentCompleteButton, initializing directly');
      const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY;
      if (apiKey) {
        posthog.init(apiKey, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'
        });
      }
    }
  }, []);

  const handleComplete = async () => {
    if (completed) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append('aiopId', aiopId);
      form.append('documentId', documentId.toString());
      const res = await fetch('/api/aiop/complete', { method: 'POST', body: form });
      if (res.ok) {
        setCompleted(true);
        
        try {
          console.log('Tracking AI-Op document completion:', aiopId, documentId);
          posthog.capture('aiop_document_completed', { 
            aiopId, 
            documentId,
            timestamp: new Date().toISOString() 
          });
        } catch (err) {
          console.error('Error sending PostHog event for completion:', err);
        }
      } else {
        console.error('Failed to mark AI-Op document as read');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return completed ? (
    <button
      disabled
      className="px-4 py-2 border border-teal-600 text-teal-600 rounded-lg mb-6"
    >
      Completed
    </button>
  ) : (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 mb-6 disabled:opacity-50"
    >
      {loading ? 'Saving...' : 'Mark as Read'}
    </button>
  );
} 