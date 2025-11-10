import { getPublishedBlogPosts } from '@/lib/db/queries';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { CalendarDays, User } from 'lucide-react';

export const metadata = {
  title: 'Blog - Prompt & E-post Forbedring',
  description: 'Tips og triks for å forbedre dine prompts og e-poster',
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts(20);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">
            Blogg
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Tips, triks og beste praksis for å forbedre dine prompts og e-poster
          </p>
        </div>

        {/* Blog Posts Grid */}
        {posts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">Ingen blogginnlegg publisert ennå.</p>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                  {post.coverImage && (
                    <div className="w-full h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {post.author?.name && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{post.author.name}</span>
                        </div>
                      )}
                      {post.publishedAt && (
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
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
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
