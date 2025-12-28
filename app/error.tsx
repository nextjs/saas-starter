'use client';

import { useEffect } from 'react';
import { useBugMail } from '@bugmail-js/next/client';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    // Use the hook which safely handles missing provider
    let captureException: ((error: Error) => void) | null = null;

    try {
        const bugmail = useBugMail();
        captureException = bugmail?.captureException || null;
    } catch {
        // BugMail not configured, continue without it
    }

    useEffect(() => {
        // Only report if BugMail is configured
        if (captureException) {
            captureException(error);
        }
        // Fallback: Log to console
        console.error(error);
    }, [error, captureException]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
            <h2 className="text-xl font-semibold">Something went wrong!</h2>
            <button
                onClick={() => reset()}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700"
            >
                Try again
            </button>
        </div>
    );
}
