// Edge-safe Auth.js config — no Prisma imports.
// Used by middleware.ts. The full config in auth.ts spreads this and adds
// the PrismaAdapter, providers, and callbacks that need database access.

import type { NextAuthConfig } from "next-auth";

const isDev =
  process.env.NODE_ENV === "development" ||
  process.env.VERCEL_ENV === "preview";

export const authConfig = {
  session: {
    strategy: isDev ? "jwt" : "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    error: "/error",
  },

  callbacks: {
    // These callbacks run in edge (middleware) — no Prisma allowed.
    jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    session({ session, user, token }) {
      const userId = user?.id ?? token?.sub;
      if (userId) session.user.id = userId;
      return session;
    },
  },

  // Providers are added in auth.ts — empty here so middleware
  // doesn't pull in Prisma or other Node.js-only dependencies.
  providers: [],
} satisfies NextAuthConfig;
