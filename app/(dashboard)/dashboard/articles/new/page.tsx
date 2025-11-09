'use client';

import { createArticle } from '@/lib/articles/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArticleForm } from '../article-form';

export default function NewArticlePage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        New Article
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Create a new article</CardTitle>
        </CardHeader>
        <CardContent>
          <ArticleForm action={createArticle} />
        </CardContent>
      </Card>
    </section>
  );
}
