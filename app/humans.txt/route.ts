/**
 * app/humans.txt/route.ts
 * Genera il file humans.txt tramite Next.js Route Handler.
 * https://humanstxt.org/
 */
import { NextResponse } from "next/server";

export function GET() {
  const content = [
    "/* TEAM */",
    "Project: Librolo CMS",
    "Built with: Next.js, Supabase, Drizzle ORM, Tiptap, Stripe, Resend",
    "",
    "/* TECHNOLOGY COLOPHON */",
    "Framework: Next.js 16 (App Router)",
    "Database: PostgreSQL via Supabase",
    "ORM: Drizzle ORM",
    "Auth: Custom JWT (jose)",
    "Email: Resend",
    "Payments: Stripe",
    "Rich Text: Tiptap",
    "Testing: Vitest",
    "Language: TypeScript",
  ].join("\n");

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
