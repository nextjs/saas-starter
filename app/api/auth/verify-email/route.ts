import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureVerifiedUser } from "@/auth";
import { db } from "@/lib/db/drizzle";
import { emailSignupTokens } from "@/lib/db/schema";

export async function POST(request: Request) {
  let body: { token?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid verification request." }, { status: 400 });
  }

  if (typeof body.token !== "string" || body.token.length > 100) {
    return Response.json({ error: "This verification link is invalid." }, { status: 400 });
  }

  const tokenHash = createHash("sha256").update(body.token).digest("hex");
  const [verification] = await db
    .select()
    .from(emailSignupTokens)
    .where(eq(emailSignupTokens.tokenHash, tokenHash))
    .limit(1);
  if (!verification || verification.expiresAt.getTime() <= Date.now()) {
    if (verification) {
      await db
        .delete(emailSignupTokens)
        .where(eq(emailSignupTokens.email, verification.email));
    }
    return Response.json(
      { error: "This verification link is invalid or has expired. Sign up again to get a new link." },
      { status: 400 },
    );
  }

  await ensureVerifiedUser(
    verification.email,
    null,
    verification.passwordHash,
  );
  await db
    .delete(emailSignupTokens)
    .where(eq(emailSignupTokens.email, verification.email));

  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("verified", "1");
  return NextResponse.json({ verified: true, redirect: signInUrl.pathname + signInUrl.search });
}
