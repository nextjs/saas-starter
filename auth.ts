// Auth.js v5 configuration — Microsoft Entra ID only
// See spec §5.6

import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

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
  ],

  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;

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
