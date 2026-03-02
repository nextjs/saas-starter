// Auth.js v5 configuration — Microsoft Entra ID only
// See spec §5.6

import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const isDev = process.env.NODE_ENV === "development";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID ?? "common"}/v2.0`,
      authorization: {
        params: {
          scope:
            "openid profile email offline_access Mail.Read Mail.ReadWrite Mail.Send",
        },
      },
    }),
    // Dev-only credentials provider for local testing without SSO
    ...(isDev
      ? [
          Credentials({
            name: "Dev Login",
            credentials: {
              email: { label: "Email", type: "email" },
              password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
              if (!credentials?.email || !credentials?.password) return null;
              // Accept any password matching the dev secret (default: "admin")
              const devPassword =
                process.env.DEV_ADMIN_PASSWORD ?? "admin";
              if (credentials.password !== devPassword) return null;

              const user = await prisma.user.findUnique({
                where: { email: credentials.email as string },
              });
              return user;
            },
          }),
        ]
      : []),
  ],

  session: {
    // Credentials provider requires JWT strategy
    strategy: isDev ? "jwt" : "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, user, token }) {
      // database sessions pass `user`, JWT sessions pass `token`
      const userId = user?.id ?? token?.sub;
      if (!userId) return session;
      session.user.id = userId;

      const memberships = await prisma.workspaceMember.findMany({
        where: { userId: user.id },
        include: {
          workspace: {
            select: {
              id: true,
              slug: true,
              subdomain: true,
              plan: true,
            },
          },
        },
      });

      session.user.workspaces = memberships.map((m) => ({
        id: m.workspace.id,
        slug: m.workspace.slug,
        subdomain: m.workspace.subdomain,
        plan: m.workspace.plan,
        role: m.role,
        memberId: m.id,
      }));

      return session;
    },
  },

  events: {
    async linkAccount({ user, account }) {
      if (account.provider !== "microsoft-entra-id") return;
      if (!account.access_token) return;
      if (!user.email) return;

      // Store OAuth tokens in EmailIntegration for email sync
      const memberships = await prisma.workspaceMember.findMany({
        where: { userId: user.id },
      });

      for (const membership of memberships) {
        await prisma.emailIntegration.upsert({
          where: {
            workspaceId_userId_provider: {
              workspaceId: membership.workspaceId,
              userId: user.id!,
              provider: "MICROSOFT",
            },
          },
          update: {
            accessToken: account.access_token,
            refreshToken: account.refresh_token ?? undefined,
            expiresAt: account.expires_at
              ? new Date(account.expires_at * 1000)
              : undefined,
            isActive: true,
          },
          create: {
            workspaceId: membership.workspaceId,
            userId: user.id!,
            provider: "MICROSOFT",
            email: user.email!,
            accessToken: account.access_token,
            refreshToken: account.refresh_token ?? undefined,
            expiresAt: account.expires_at
              ? new Date(account.expires_at * 1000)
              : undefined,
            syncFromDate: new Date(),
          },
        });
      }
    },
  },

  pages: {
    signIn: "/login",
    error: "/error",
  },
});

// Extend session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      workspaces: Array<{
        id: string;
        slug: string;
        subdomain: string;
        plan: string;
        role: string;
        memberId: string;
      }>;
    };
  }
}
