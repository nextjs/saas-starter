import { randomBytes } from "node:crypto";
import type { NextAuthOptions } from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { Redis } from "@upstash/redis";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { invitations, teamMembers, teams, users } from "@/lib/db/schema";
import { comparePasswords, hashPassword } from "@/lib/auth/session";

process.env.NEXTAUTH_URL ??= process.env.BASE_URL;

const redisUrl =
  process.env.SASSStarter_KV_REST_API_URL ??
  process.env.KV_REST_API_URL ??
  process.env.UPSTASH_REDIS_REST_URL;
const redisToken =
  process.env.SASSStarter_KV_REST_API_TOKEN ??
  process.env.KV_REST_API_TOKEN ??
  process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  throw new Error(
    "NextAuth requires the Upstash Redis REST URL and token for the upstash-kv-beige-grass database.",
  );
}

const redis = new Redis({ url: redisUrl, token: redisToken });
const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  );
}

providers.push(
  CredentialsProvider({
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email?.trim().toLowerCase();
      const password = credentials?.password;
      if (!email || !password) return null;

      const [user] = await db
        .select()
        .from(users)
        .where(
          and(
            sql`lower(${users.email}) = ${email}`,
            isNull(users.deletedAt),
          ),
        )
        .limit(1);
      if (
        !user?.emailVerified ||
        !(await comparePasswords(password, user.passwordHash))
      ) {
        return null;
      }
      return { id: String(user.id), email: user.email, name: user.name };
    },
  }),
);

export async function ensureVerifiedUser(
  email: string,
  name: string | null,
  passwordHash?: string,
) {
  email = email.trim().toLowerCase();
  await db.transaction(async (tx) => {
    let [existingUser] = await tx
      .select({ id: users.id, deletedAt: users.deletedAt })
      .from(users)
      .where(sql`lower(${users.email}) = ${email}`)
      .limit(1);

    if (existingUser?.deletedAt) {
      throw new Error("This account is no longer available.");
    }

    let userId = existingUser?.id;
    if (!userId) {
      const [createdUser] = await tx
        .insert(users)
        .values({
          email,
          name,
          role: "owner",
          passwordHash:
            passwordHash ??
            (await hashPassword(randomBytes(32).toString("hex"))),
          emailVerified: new Date(),
        })
        .onConflictDoNothing({ target: users.email })
        .returning({ id: users.id });
      userId = createdUser?.id;
    }

    if (!userId) {
      [existingUser] = await tx
        .select({ id: users.id, deletedAt: users.deletedAt })
        .from(users)
        .where(and(sql`lower(${users.email}) = ${email}`, isNull(users.deletedAt)))
        .limit(1);
      userId = existingUser?.id;
    }

    if (!userId) {
      throw new Error("Unable to create an account for this user.");
    }

    await tx
      .update(users)
      .set({
        emailVerified: new Date(),
        ...(passwordHash ? { passwordHash } : {}),
        ...(name ? { name } : {}),
      })
      .where(eq(users.id, userId));

    const [membership] = await tx
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.userId, userId))
      .limit(1);

    if (!membership) {
      const [invitation] = await tx
        .select()
        .from(invitations)
        .where(
          and(
            sql`lower(${invitations.email}) = ${email}`,
            eq(invitations.status, "pending"),
          ),
        )
        .limit(1);
      const teamId =
        invitation?.teamId ??
        (
          await tx
            .insert(teams)
            .values({ name: `${name || email}'s Team` })
            .returning({ id: teams.id })
        )[0]?.id;

      if (!teamId) throw new Error("Unable to create a team for this user.");
      await tx.insert(teamMembers).values({
        userId,
        teamId,
        role: invitation?.role ?? "owner",
      });
      if (invitation) {
        await tx
          .update(invitations)
          .set({ status: "accepted" })
          .where(eq(invitations.id, invitation.id));
      }
    }
  });
}

export const authOptions: NextAuthOptions = {
  adapter: UpstashRedisAdapter(redis, {
    baseKeyPrefix: "upstash-kv-beige-grass:",
  }),
  providers,
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (
        account?.provider === "credentials"
      ) {
        return true;
      }
      if (
        (account?.provider !== "google" && account?.provider !== "facebook") ||
        !user.email
      ) {
        return false;
      }

      if (
        account.provider === "google" &&
        (profile as { email_verified?: boolean }).email_verified !== true
      ) {
        return false;
      }

      await ensureVerifiedUser(user.email, user.name ?? null);
      return true;
    },
    async jwt({ token, account }) {
      if (account?.provider === "google" || account?.provider === "facebook") {
        token.provider = account.provider;
      } else if (account?.provider === "credentials") {
        token.provider = "email";
      }
      return token;
    },
    async session({ session, token }) {
      if (
        session.user &&
        (token.provider === "google" ||
          token.provider === "facebook" ||
          token.provider === "email")
      ) {
        session.user.provider = token.provider;
      }
      return session;
    },
  },
};
