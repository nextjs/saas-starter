import aiopData from '@/aiop.json';
import React from 'react';
import AiOpPageClient from './AiOpPageClient';

export const metadata = {
  title: 'AI-Driven Operating Procedures',
};

export default function AiOpPage() {
  const items = aiopData.aiop;
  return <AiOpPageClient items={items} />;
} 