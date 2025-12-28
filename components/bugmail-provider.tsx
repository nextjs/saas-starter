'use client';

import { BugMailProvider } from '@bugmail-js/next/client';

export function SafeBugMailProvider({ children }: { children: React.ReactNode }) {
    const apiKey = process.env.NEXT_PUBLIC_BUGMAIL_API_KEY;
    const projectId = process.env.NEXT_PUBLIC_BUGMAIL_PROJECT_ID;

    // 1. Check if configured. If not, return children directly (No-op).
    if (!apiKey || !projectId) {
        return <>{children}</>;
    }

    // 2. If configured, wrap with BugMail
    return (
        <BugMailProvider
            apiKey={apiKey}
            projectId={projectId}
            endpoint="https://api.bugmail.site"
        >
            {children}
        </BugMailProvider>
    );
}
