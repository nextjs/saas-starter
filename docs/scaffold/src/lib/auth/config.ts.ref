// src/lib/auth/config.ts
// NextAuth v5 (Auth.js) configuration
// Primary: Microsoft Entra ID (Azure AD)
// Secondary: Google OAuth

import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),

  providers: [
    // ── Primary: Microsoft Entra ID (Azure AD) ──────────────
    // Supports personal MS accounts AND corporate tenants.
    // For Orangeleaf: use tenant-specific endpoint for internal use.
    // For reselling: set tenantId to "common" to allow any tenant.
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID ?? "common",
      authorization: {
        params: {
          scope: [
            "openid",
            "profile",
            "email",
            "offline_access",
            // Mail scopes for email sync
            "Mail.Read",
            "Mail.ReadWrite",
            "Mail.Send",
          ].join(" "),
        },
      },
    }),

    // ── Secondary: Google OAuth ─────────────────────────────
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            // Gmail scopes for email sync
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.send",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",       // Force refresh_token on first login
        },
      },
    }),
  ],

  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,    // 30 days
  },

  callbacks: {
    async session({ session, user }) {
      // Attach user ID and workspace memberships to the session
      session.user.id = user.id;

      const memberships = await db.workspaceMember.findMany({
        where: { userId: user.id },
        include: { workspace: { select: { id: true, slug: true, subdomain: true, name: true, plan: true } } },
      });

      session.user.workspaces = memberships.map((m) => ({
        ...m.workspace,
        role: m.role,
        memberId: m.id,
      }));

      return session;
    },

    async signIn({ user, account }) {
      if (!user.email) return false;

      // Auto-provision: if the user's email domain matches a workspace domain,
      // auto-join them with MEMBER role.
      // Useful for Orangeleaf SSO — all @orangeleaf.nl users auto-join.
      const emailDomain = user.email.split("@")[1];

      // Store the OAuth tokens for email sync (access + refresh tokens)
      // This runs after the adapter has created/updated the Account_ row.
      // The actual token storage happens via the adapter — we just confirm ok.
      return true;
    },
  },

  events: {
    // After OAuth, persist tokens to EmailIntegration table for email sync
    async linkAccount({ user, account }) {
      if (!user.email) return;
      if (account.provider !== "microsoft-entra-id" && account.provider !== "google") return;
      if (!account.access_token) return;

      const provider = account.provider === "microsoft-entra-id" ? "MICROSOFT" : "GOOGLE";

      // Find all workspaces this user belongs to
      const memberships = await db.workspaceMember.findMany({
        where: { userId: user.id },
      });

      for (const membership of memberships) {
        await db.emailIntegration.upsert({
          where: {
            workspaceId_userId_provider: {
              workspaceId: membership.workspaceId,
              userId: user.id,
              provider,
            },
          },
          update: {
            accessToken: account.access_token,
            refreshToken: account.refresh_token ?? undefined,
            expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : undefined,
            isActive: true,
          },
          create: {
            workspaceId: membership.workspaceId,
            userId: user.id,
            provider,
            email: user.email!,
            accessToken: account.access_token,
            refreshToken: account.refresh_token ?? undefined,
            expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : undefined,
            syncFromDate: new Date(),
          },
        });
      }
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
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
        name: string;
        plan: string;
        role: string;
        memberId: string;
      }>;
    };
  }
}
