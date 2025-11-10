import { getAllBlogPosts, getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

export default async function BlogAdminPage() {
  const user = await getUser();

  if (!user || user.role !== 'owner') {
    redirect('/dashboard');
  }

  const posts = await getAllBlogPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blogg Administrasjon</h1>
          <p className="text-gray-600 mt-2">Administrer dine blogginnlegg</p>
        </div>
        <Link href="/dashboard/blog-admin/new">
          <Button className="gap-2 bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4" />
            Nytt Innlegg
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">Ingen blogginnlegg ennå</p>
          <Link href="/dashboard/blog-admin/new">
            <Button className="bg-orange-500 hover:bg-orange-600">
              Opprett ditt første innlegg
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {post.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        post.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {post.published ? 'Publisert' : 'Utkast'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Forfatter: {post.author?.name || 'Ukjent'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Opprettet:{' '}
                    {new Date(post.createdAt).toLocaleDateString('nb-NO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {post.publishedAt && (
                    <p className="text-sm text-gray-500">
                      Publisert:{' '}
                      {new Date(post.publishedAt).toLocaleDateString('nb-NO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {post.published && (
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Vis
                      </Button>
                    </Link>
                  )}
                  <Link href={`/dashboard/blog-admin/${post.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="h-4 w-4" />
                      Rediger
                    </Button>
                  </Link>
                  <form action={`/api/blog/${post.id}`} method="DELETE">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-red-600 hover:text-red-700"
                      type="submit"
                    >
                      <Trash2 className="h-4 w-4" />
                      Slett
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
