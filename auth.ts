// Auth.js v5 configuration — Microsoft Entra ID only
// See spec §5.6
//
// This is the FULL config (Node.js runtime only).
// Middleware uses the edge-safe auth.config.ts instead.

import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

// Dev credentials login: local only (NODE_ENV=development).
// Vercel preview uses Microsoft SSO like production.
const isDev = process.env.NODE_ENV === "development";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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

              // Upsert so dev login works even before seed runs
              const user = await prisma.user.upsert({
                where: { email: credentials.email as string },
                update: {},
                create: {
                  name: "Dev User",
                  email: credentials.email as string,
                  emailVerified: new Date(),
                },
              });
              return user;
            },
          }),
        ]
      : []),
  ],

  callbacks: {
    ...authConfig.callbacks,
    async session({ session, user, token }) {
      // Inherit base callback (sets session.user.id)
      const base = authConfig.callbacks?.session;
      if (base) session = await base({ session, user, token } as Parameters<typeof base>[0]);

      // Initialize workspaces — loaded on demand via getSessionWithWorkspaces()
      session.user.workspaces = session.user.workspaces ?? [];

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
