'use client';
import posthog from 'posthog-js';

const handleComplete = async () => {
  if (completed) return;
  setLoading(true);
  try {
    const form = new FormData();
    form.append('guideId', guideId);
    form.append('documentId', documentId.toString());
    const res = await fetch('/api/aiguides/complete', { method: 'POST', body: form });
    if (res.ok) {
      setCompleted(true);
      posthog.capture('aiguides_document_completed', { guideId, documentId });
    } else {
      console.error('Failed to mark guide document as read');
    }
  } catch (error) {
    console.error('Error marking guide document as read:', error);
  } finally {
    setLoading(false);
  }
}; 