// Middleware — Auth.js v5 session guard + subdomain extraction
// See spec §5.7
//
// Imports edge-safe config only (no Prisma).

import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const url = req.nextUrl;
  const host = req.headers.get("host") ?? "";

  // Subdomain extraction
  const isLocalhost =
    host.includes("localhost") || host.includes("127.0.0.1");
  const isVercelPreview = host.endsWith(".vercel.app");
  const subdomain = isLocalhost || isVercelPreview ? null : host.split(".")[0];

  // Public routes — always allow
  const isPublic =
    url.pathname === "/login" ||
    url.pathname === "/error" ||
    url.pathname.startsWith("/api/auth/") ||
    url.pathname.startsWith("/api/stripe/") ||
    url.pathname.startsWith("/api/cron/") ||
    url.pathname.startsWith("/api/setup/") ||
    url.pathname === "/favicon.ico";

  if (isPublic) return NextResponse.next();

  // Auth guard
  if (!req.auth?.user?.id) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Inject workspace subdomain header
  const res = NextResponse.next();
  if (subdomain) res.headers.set("x-workspace-subdomain", subdomain);
  return res;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
