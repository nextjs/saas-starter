'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import posthog from 'posthog-js';

interface AiOpItem {
  id: number;
  name: string;
  icon: string;
}

interface AiOpPageClientProps {
  items: AiOpItem[];
}

export default function AiOpPageClient({ items }: AiOpPageClientProps) {
  // Ensure PostHog is initialized
  useEffect(() => {
    if (!posthog.__loaded) {
      console.log('PostHog not loaded in AiOpPageClient, initializing directly');
      const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY;
      
      if (apiKey) {
        posthog.init(apiKey, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'
        });
      } else {
        // Demo key for testing
        posthog.init('phc_hX3OAIHMbd2tF40deCXLFyQWwHWnP3mExxsOSa4dNtJ', {
          api_host: 'https://app.posthog.com'
        });
      }
    }
  }, []);

  const handleItemClick = (id: number, name: string) => {
    console.log('AI-Op clicked:', id, name);
    posthog.capture('aiop_selected', { aiopId: id, name });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI-Driven Operating Procedures</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(({ id, name, icon }) => (
          <Link
            key={id}
            href={`/ai-op/${id}`}
            className="block w-full h-full"
            onClick={() => handleItemClick(id, name)}
          >
            <div className="w-full h-full bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 flex flex-col items-center">
              <i
                className={`fa-solid fa-${icon.toLowerCase()} text-4xl text-blue-600 mb-4`}
                aria-hidden="true"
              ></i>
              <h3 className="text-lg font-semibold text-center">{name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 