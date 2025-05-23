import aiguideData from '@/aiguide.json';
import React from 'react';
import AiGuidePageClient from './AiGuidePageClient';

export const metadata = {
  title: 'AI Guides',
};

export default function AiGuidePage() {
  const items = aiguideData.aiop;
  return <AiGuidePageClient items={items} />;
} 