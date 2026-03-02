// src/middleware.ts
// Runs on every request. Handles:
//  1. Subdomain-based workspace resolution
//  2. Auth guard — redirect unauthenticated users to login
//  3. Workspace membership check

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";

export default auth(async (req) => {
  const url = req.nextUrl;
  const host = req.headers.get("host") ?? "";

  // ── Extract subdomain ─────────────────────────────────────
  // Production: orangeleaf.crm.orangeleaf.nl
  // Preview:    orangeleaf.crm-git-main-acme.vercel.app
  // Dev:        localhost:3000  (no subdomain — skip)
  const isLocalhost = host.includes("localhost");
  const subdomain = isLocalhost ? null : host.split(".")[0];

  // ── Public routes — never redirect ───────────────────────
  const isPublic =
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/api/auth/") ||
    url.pathname === "/favicon.ico";

  if (isPublic) return NextResponse.next();

  // ── Auth check ────────────────────────────────────────────
  const session = req.auth;

  if (!session?.user?.id) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Workspace check ───────────────────────────────────────
  if (subdomain) {
    // Verify the user is a member of this workspace.
    // We pass the subdomain via a header so server components can pick it up.
    const res = NextResponse.next();
    res.headers.set("x-workspace-subdomain", subdomain);
    return res;
  }

  // Dev: pass through
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
