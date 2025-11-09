'use server';

import { getArticleById } from '@/lib/articles/queries';
import { updateArticle } from '@/lib/articles/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArticleForm } from '../../article-form';
import { notFound } from 'next/navigation';

type EditArticlePageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  const { id } = await params;
  const articleId = Number(id);
  const article = await getArticleById(articleId);

  if (!article) {
    notFound();
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Edit Article
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Edit your article</CardTitle>
        </CardHeader>
        <CardContent>
          <ArticleForm action={updateArticle} initialData={article} />
        </CardContent>
      </Card>
    </section>
  );
}
