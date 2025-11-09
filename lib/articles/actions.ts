'use server';

import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { articles, NewArticle, users, teamMembers } from '@/lib/db/schema';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Generates a URL-friendly slug from a given string.
 * @param {string} text - The text to slugify.
 * @returns {string} The slugified text.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

const articleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  content: z.string().optional(),
});

/**
 * Creates a new article.
 * @param {object} data - The article data.
 * @param {string} data.title - The title of the article.
 * @param {string} [data.content] - The content of the article.
 * @param {User} user - The authenticated user.
 * @returns {Promise<{error?: string, success?: string}>} A promise that resolves to a success or error message.
 */
export const createArticle = validatedActionWithUser(
  articleSchema,
  async (data, _, user) => {
    try {
      const slug = slugify(data.title);
      const newArticle: NewArticle = {
        title: data.title,
        content: data.content,
        slug: slug,
        authorId: user.id,
        teamId: (await db.query.teamMembers.findFirst({ where: eq(teamMembers.userId, user.id) }))?.teamId ?? 0,
      };

      const [insertedArticle] = await db.insert(articles).values(newArticle).returning();

      if (!insertedArticle) {
        throw new Error('Failed to create article.');
      }

      revalidateTag(`user-${user.id}-articles`);
      revalidatePath('/dashboard/articles');

    } catch (error) {
      console.error(error);
      return { error: 'Failed to create article. Please try again.' };
    }
    redirect('/dashboard/articles');
  }
);

const updateArticleSchema = articleSchema.extend({
  id: z.coerce.number(),
});

/**
 * Updates an existing article.
 * @param {object} data - The article data.
 * @param {number} data.id - The ID of the article to update.
 * @param {string} data.title - The new title.
 * @param {string} [data.content] - The new content.
 * @param {User} user - The authenticated user.
 * @returns {Promise<{error?: string, success?: string}>} A promise that resolves to a success or error message.
 */
export const updateArticle = validatedActionWithUser(
  updateArticleSchema,
  async (data, _, user) => {
    try {
      const article = await db.query.articles.findFirst({
        where: and(eq(articles.id, data.id), eq(articles.authorId, user.id)),
      });

      if (!article) {
        return { error: 'Article not found or you do not have permission to edit it.' };
      }

      const slug = slugify(data.title);

      await db
        .update(articles)
        .set({ title: data.title, content: data.content, slug: slug, updatedAt: new Date() })
        .where(eq(articles.id, data.id));

      revalidateTag(`user-${user.id}-articles`);
      revalidateTag(`article-${slug}`);
      revalidatePath(`/dashboard/articles/${data.id}/edit`);

    } catch (error) {
      console.error(error);
      return { error: 'Failed to update article. Please try again.' };
    }
    redirect('/dashboard/articles');
  }
);

const deleteArticleSchema = z.object({
    id: z.coerce.number(),
});

/**
 * Deletes an article.
 * @param {object} data - The article data.
 * @param {number} data.id - The ID of the article to delete.
 * @param {User} user - The authenticated user.
 * @returns {Promise<{error?: string, success?: string}>} A promise that resolves to a success or error message.
 */
export const deleteArticle = validatedActionWithUser(
    deleteArticleSchema,
    async (data, _, user) => {
        try {
            const article = await db.query.articles.findFirst({
                where: and(eq(articles.id, data.id), eq(articles.authorId, user.id)),
            });

            if (!article) {
                return { error: 'Article not found or you do not have permission to delete it.' };
            }

            await db.delete(articles).where(eq(articles.id, data.id));

            revalidateTag(`user-${user.id}-articles`);
            revalidatePath('/dashboard/articles');

        } catch (error) {
            console.error(error);
            return { error: 'Failed to delete article. Please try again.' };
        }
        redirect('/dashboard/articles');
    }
);
