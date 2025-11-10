import { desc, and, eq, isNull, sql } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, teamMembers, teams, users, usageTracking, improvements, blogPosts } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
}

// Usage tracking functions
export async function getTodayUsage(userId: number | null, sessionId: string | null) {
  const today = new Date().toISOString().split('T')[0];

  const result = await db
    .select()
    .from(usageTracking)
    .where(
      and(
        eq(usageTracking.date, sql`${today}::date`),
        userId ? eq(usageTracking.userId, userId) : eq(usageTracking.sessionId, sessionId!)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function incrementUsage(userId: number | null, sessionId: string | null) {
  const today = new Date().toISOString().split('T')[0];
  const existing = await getTodayUsage(userId, sessionId);

  if (existing) {
    await db
      .update(usageTracking)
      .set({ count: existing.count + 1 })
      .where(eq(usageTracking.id, existing.id));
    return existing.count + 1;
  } else {
    await db.insert(usageTracking).values({
      userId,
      sessionId,
      date: sql`${today}::date`,
      count: 1,
    });
    return 1;
  }
}

export async function saveImprovement(
  userId: number | null,
  sessionId: string | null,
  type: 'prompt' | 'email',
  originalText: string,
  improvedText: string
) {
  await db.insert(improvements).values({
    userId,
    sessionId,
    type,
    originalText,
    improvedText,
  });
}

export async function getUserDailyLimit(userId: number | null) {
  if (!userId) {
    return 3; // Anonymous users get 3 per day
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length === 0) {
    return 3;
  }

  // Check if this is the user's first day (signup bonus)
  const userCreatedDate = new Date(user[0].createdAt).toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];

  if (userCreatedDate === today && !user[0].signupBonusUsed) {
    // First day: 5 prompts (signup bonus)
    return 5;
  }

  return user[0].dailyPromptLimit || 4;
}

export async function markSignupBonusUsed(userId: number) {
  await db
    .update(users)
    .set({ signupBonusUsed: true })
    .where(eq(users.id, userId));
}

// Blog functions
export async function getPublishedBlogPosts(limit: number = 10) {
  return await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      coverImage: blogPosts.coverImage,
      publishedAt: blogPosts.publishedAt,
      author: {
        name: users.name,
        email: users.email,
      },
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);
}

export async function getBlogPostBySlug(slug: string) {
  const result = await db
    .select({
      post: blogPosts,
      author: {
        name: users.name,
        email: users.email,
      },
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getAllBlogPosts() {
  return await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      published: blogPosts.published,
      publishedAt: blogPosts.publishedAt,
      createdAt: blogPosts.createdAt,
      author: {
        name: users.name,
      },
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .orderBy(desc(blogPosts.createdAt));
}

export async function createBlogPost(
  authorId: number,
  data: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    metaDescription?: string;
    metaKeywords?: string;
    coverImage?: string;
    published?: boolean;
  }
) {
  const result = await db.insert(blogPosts).values({
    authorId,
    ...data,
    publishedAt: data.published ? new Date() : null,
  }).returning();

  return result[0];
}

export async function updateBlogPost(
  postId: number,
  data: Partial<{
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    metaDescription: string;
    metaKeywords: string;
    coverImage: string;
    published: boolean;
  }>
) {
  await db
    .update(blogPosts)
    .set({
      ...data,
      updatedAt: new Date(),
      publishedAt: data.published ? new Date() : undefined,
    })
    .where(eq(blogPosts.id, postId));
}

export async function deleteBlogPost(postId: number) {
  await db.delete(blogPosts).where(eq(blogPosts.id, postId));
}
