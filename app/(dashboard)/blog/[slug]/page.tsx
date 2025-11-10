import { getBlogPostBySlug } from '@/lib/db/queries';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarDays, User } from 'lucide-react';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const result = await getBlogPostBySlug(slug);

  if (!result) {
    return {
      title: 'Blogginnlegg ikke funnet',
    };
  }

  return {
    title: result.post.title,
    description: result.post.metaDescription || result.post.excerpt,
    keywords: result.post.metaKeywords,
    openGraph: {
      title: result.post.title,
      description: result.post.metaDescription || result.post.excerpt,
      type: 'article',
      publishedTime: result.post.publishedAt?.toISOString(),
      authors: [result.author?.name || 'Anonymous'],
      images: result.post.coverImage ? [result.post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const result = await getBlogPostBySlug(slug);

  if (!result) {
    notFound();
  }

  const { post, author } = result;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link href="/blog">
          <Button variant="ghost" className="mb-8 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Tilbake til blogg
          </Button>
        </Link>

        {/* Cover image */}
        {post.coverImage && (
          <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden mb-8">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

        {/* Meta info */}
        <div className="flex items-center gap-6 text-gray-600 mb-8 pb-8 border-b">
          {author?.name && (
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span>{author.name}</span>
            </div>
          )}
          {post.publishedAt && (
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              <span>
                {new Date(post.publishedAt).toLocaleDateString('nb-NO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className="prose prose-lg prose-orange max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Back button at bottom */}
        <div className="mt-12 pt-8 border-t">
          <Link href="/blog">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Tilbake til blogg
            </Button>
          </Link>
        </div>
      </article>
    </main>
  );
}
