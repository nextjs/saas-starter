import aiopData from '@/aiop.json';
import { notFound } from 'next/navigation';
import React from 'react';
import AiOpDetailClient from './AiOpDetailClient';

export const metadata = {
  title: 'AI-Driven Operating Procedures Detail',
};

export default async function AiOpDetail({ params }: { params: { id: string } }) {
  const { id } = await params;
  const lessons = aiopData.data?.[id];
  const course = aiopData.aiop.find((entry: any) => String(entry.id) === id);
  if (!lessons || !course) notFound();

  // Group lessons by 'part'
  const groups: Record<string, any[]> = {};
  lessons.forEach((entry: any) => {
    const key = entry.part;
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  });

  return <AiOpDetailClient item={course} groups={groups} />;
} 