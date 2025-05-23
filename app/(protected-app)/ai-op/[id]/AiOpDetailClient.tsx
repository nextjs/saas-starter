'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';

interface AiOpItem {
  id: number;
  part: string;
  subject: string;
  desc: string;
  icon: string;
  name: string;
  subtitle: string;
  image: string;
}

interface AiOpDetailClientProps {
  item: AiOpItem;
  groups: Record<string, AiOpItem[]>;
}

export default function AiOpDetailClient({ item, groups }: AiOpDetailClientProps) {
  const pathname = usePathname();
  const match = pathname.match(/lesson\/(\d+)$/);
  const currentLessonId = match ? match[1] : null;
  const [completedDocs, setCompletedDocs] = useState<number[]>([]);

  // Ensure PostHog is initialized
  useEffect(() => {
    if (!posthog.__loaded) {
      console.log('PostHog not loaded in AiOpDetailClient, initializing directly');
      const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY;
      
      if (apiKey) {
        posthog.init(apiKey, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'
        });
        console.log('PostHog manually initialized in AiOpDetailClient');
      }
    }
  }, []);

  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch(`/api/aiop/progress?aiopId=${item.id}`);
        if (res.ok) {
          const json = await res.json();
          setCompletedDocs(json.docs || []);
        }
      } catch (err) {
        console.error('Failed to load AI-Op progress', err);
      }
    }
    loadProgress();
  }, [item.id]);

  const trackSectionToggle = (part: string, isOpen: boolean) => {
    try {
      console.log('Tracking section toggle:', part, isOpen);
      posthog.capture('aiop_section_toggled', { 
        aiopId: item.id, 
        part, 
        isOpen, 
        timestamp: new Date().toISOString() 
      });
    } catch (err) {
      console.error('Error tracking section toggle:', err);
    }
  };

  const trackDocumentOpen = (documentId: number) => {
    try {
      console.log('Tracking document open:', documentId);
      posthog.capture('aiop_document_opened', { 
        aiopId: item.id, 
        documentId,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error tracking document open:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link href="/ai-op" className="inline-flex items-center text-blue-600 hover:underline mb-4">
        <i className="fa-solid fa-arrow-left mr-2" aria-hidden="true"></i>
        Back
      </Link>
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2 text-center">{item.name}</h1>
      <p className="text-xl text-gray-600 mb-4 text-center">{item.subtitle}</p>
      <img src={item.image} alt={item.name} className="mx-auto max-w-[300px] h-auto rounded mb-6" />

      {/* Sections accordion */}
      {Object.entries(groups).map(([part, entries]) => (
        <details 
          key={part} 
          className="group mb-6" 
          onToggle={(e) => trackSectionToggle(part, (e.currentTarget as HTMLDetailsElement).open)}
        >
          <summary className="flex items-center justify-between p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm group-open:bg-white group-open:shadow-md group-open:border-blue-300 cursor-pointer">
            <span className="text-lg font-semibold text-gray-800">{part}</span>
            <span className="flex items-center text-gray-500">
              <span className="text-sm">{entries.length} {entries.length === 1 ? 'document' : 'documents'}</span>
              <i className="fa-solid fa-chevron-down ml-2 transform group-open:rotate-180 transition-transform"></i>
            </span>
          </summary>
          <div className="mt-4 space-y-4">
            {entries.map((entry) => {
              const isActive = String(entry.id) === currentLessonId;
              const baseClass = 'flex items-center p-4 rounded-lg shadow-sm transition-transform duration-200 transform';
              const hoverClass = 'hover:shadow-md hover:-translate-y-0.5';
              const activeClass = 'bg-blue-50 border-2 border-blue-400 pointer-events-none opacity-80';
              const inactiveClass = 'bg-white cursor-pointer';
              const cardClass = isActive
                ? `${baseClass} ${activeClass}`
                : `${baseClass} ${inactiveClass} ${hoverClass}`;
              const iconCircle = (
                <span className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className={`fa-solid fa-${entry.icon.toLowerCase()} text-xl text-blue-600`} aria-hidden="true"></i>
                </span>
              );
              const isRead = completedDocs.includes(entry.id);
              return isActive ? (
                <div key={entry.id} className={cardClass} aria-current="page">
                  {iconCircle}
                  <div className="ml-4">
                    <h3 className="text-base font-medium text-gray-900">{entry.subject}</h3>
                    <p className="text-sm text-gray-500">{entry.desc}</p>
                  </div>
                  {isRead && <i className="fa-solid fa-check ml-auto text-green-500" aria-hidden="true"></i>}
                </div>
              ) : (
                <Link
                  key={entry.id}
                  href={`/ai-op/${item.id}/document/${entry.id}`}
                  className={cardClass}
                  onClick={() => trackDocumentOpen(entry.id)}
                >
                  {iconCircle}
                  <div className="ml-4">
                    <h3 className="text-base font-medium text-gray-900">{entry.subject}</h3>
                    <p className="text-sm text-gray-500">{entry.desc}</p>
                  </div>
                  {isRead && <i className="fa-solid fa-check ml-auto text-green-500" aria-hidden="true"></i>}
                </Link>
              );
            })}
          </div>
        </details>
      ))}
    </div>
  );
} 