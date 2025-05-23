import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import DocumentCompleteButton from '../../DocumentCompleteButton';
import { getUser, getUserGuideProgress } from '@/lib/db/queries';

export default async function AiOpDocumentDetail({ params }: { params: { id: string; documentid: string } }) {
  const { id, documentid } = await params;
  const filePath = path.join(process.cwd(), 'aiguide.json');
  if (!fs.existsSync(filePath)) notFound();
  const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const lessons = jsonData.data?.[id];
  const lesson = lessons?.find((entry: any) => String(entry.id) === documentid);
  if (!lesson) notFound();
  const course = jsonData.aiop?.find((c: any) => c.id === id);
  if (!course) notFound();
  const { body } = lesson;

  // Fetch user and guide document progress
  const user = await getUser();
  let isRead = false;
  if (user) {
    const progress = await getUserGuideProgress(user.id, id, documentid);
    isRead = Boolean(progress);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href={`/ai-guides/${id}`} className="inline-flex items-center text-blue-600 hover:underline">
          <i className="fa-solid fa-arrow-left mr-2" aria-hidden="true"></i>
          Back
        </Link>
        <DocumentCompleteButton guideId={id} documentId={documentid} initialCompleted={isRead} />
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-white p-8 rounded-2xl shadow-xl text-center mb-8">
        {course.image && (
          <img src={course.image} alt={course.name} className="w-32 h-32 mx-auto rounded-full mb-4" />
        )}
        <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
        {course.subtitle && <p className="text-lg text-gray-600 mt-2">{course.subtitle}</p>}
      </div>

      <div className="grid gap-8">
        {body && Array.isArray(body) ? (
          body.map((section: any) => (
            <div key={section.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {section.image && (
                <img
                  src={section.image}
                  alt={section.title}
                  className="w-full h-[400px] object-contain"
                />
              )}
              <div className="p-6">
                <div className="flex items-center mb-4">
                  {section.icon && (
                    <i className={`${section.icon} text-2xl text-blue-600 mr-4`} aria-hidden="true"></i>
                  )}
                  <h2 className="text-2xl font-semibold text-gray-900">{section.title}</h2>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            </div>
          ))
        ) : body && typeof body === 'object' ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {body.image && (
              <img
                src={body.image}
                alt={body.title}
                className="w-full h-[400px] object-contain"
              />
            )}
            <div className="p-6">
              <div className="flex items-center mb-4">
                {body.icon && (
                  <i className={`${body.icon} text-2xl text-blue-600 mr-4`} aria-hidden="true"></i>
                )}
                <h2 className="text-2xl font-semibold text-gray-900">{body.title}</h2>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{body.content}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
} 