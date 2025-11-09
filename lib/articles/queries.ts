'use server';

import { db } from '@/lib/db/drizzle';
import { articles, users } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { unstable_cache as cache } from 'next/cache';

/**
 * Fetches all articles for the currently authenticated user.
 * This function is cached to improve performance.
 * @returns {Promise<Array<typeof articles.$inferSelect>>} A promise that resolves to an array of articles.
 * @throws {Error} If the user is not authenticated.
 */
export async function getArticlesForUser() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await cache(
    async () => {
      return db
        .select()
        .from(articles)
        .where(eq(articles.authorId, user.id));
    },
    [`user-${user.id}-articles`],
    { revalidate: 60, tags: [`user-${user.id}-articles`] }
  )();
}

/**
 * Fetches a single article by its ID for the authenticated user.
 * It ensures that only the author of the article can access it.
 * @param {number} id - The ID of the article to fetch.
 * @returns {Promise<(typeof articles.$inferSelect) | undefined>} A promise that resolves to the article, or undefined if not found or not authorized.
 * @throws {Error} If the user is not authenticated.
 */
export async function getArticleById(id: number) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return db.query.articles.findFirst({
    where: and(eq(articles.id, id), eq(articles.authorId, user.id)),
  });
}

/**
 * Fetches a single published article by its slug.
 * This function is for public access and is cached.
 * @param {string} slug - The slug of the article to fetch.
 * @returns {Promise<(typeof articles.$inferSelect) | undefined>} A promise that resolves to the published article, or undefined if not found.
 */
export async function getPublishedArticleBySlug(slug: string) {
  return await cache(
    async () => {
      return db.query.articles.findFirst({
        where: and(eq(articles.slug, slug), eq(articles.status, 'published')),
      });
    },
    [`article-${slug}`],
    { revalidate: 60, tags: [`article-${slug}`] }
  )();
}

/**
 * Fetches all published articles.
 * This function is for public access and is cached.
 * @returns {Promise<Array<typeof articles.$inferSelect>>} A promise that resolves to an array of published articles.
 */
export async function getAllPublishedArticles() {
  return await cache(
    async () => {
      return db
        .select()
        .from(articles)
        .where(eq(articles.status, 'published'))
        .orderBy(articles.createdAt);
    },
    ['all-published-articles'],
    { revalidate: 60, tags: ['all-published-articles'] }
  )();
}
