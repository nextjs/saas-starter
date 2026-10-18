import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { emailSignupTokens } from "@/lib/db/schema";
import { sendMailgunMessage } from "@/lib/mailgun";

const registrationSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(100),
});

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return Response.json(
          { error: "Invalid request origin." },
          { status: 403 },
        );
      }
    } catch {
      return Response.json({ error: "Invalid request origin." }, { status: 403 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid signup request." }, { status: 400 });
  }
  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Enter a valid email and a password of at least 8 characters." },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const [existingToken] = await db
    .select({ createdAt: emailSignupTokens.createdAt })
    .from(emailSignupTokens)
    .where(eq(emailSignupTokens.email, email))
    .limit(1);
  if (
    existingToken &&
    Date.now() - existingToken.createdAt.getTime() < 60_000
  ) {
    return Response.json({ sent: true });
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const passwordHash = await hashPassword(parsed.data.password);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await db
    .insert(emailSignupTokens)
    .values({ email, passwordHash, tokenHash, expiresAt })
    .onConflictDoUpdate({
      target: emailSignupTokens.email,
      set: {
        passwordHash,
        tokenHash,
        expiresAt,
        createdAt: new Date(),
      },
    });

  let verificationUrl: URL;
  try {
    verificationUrl = new URL("/verify-email", process.env.NEXTAUTH_URL);
  } catch {
    await db
      .delete(emailSignupTokens)
      .where(eq(emailSignupTokens.email, email));
    console.error(
      "Email signup verification is not configured: NEXTAUTH_URL is missing or invalid.",
    );
    return Response.json(
      { error: "Email verification is not configured. Please contact us." },
      { status: 503 },
    );
  }
  verificationUrl.searchParams.set("token", token);
  try {
    await sendMailgunMessage({
      to: email,
      subject: "Verify your Last Layer account",
      text: `Verify your email address using the link below. This link expires in 30 minutes.\n\n${verificationUrl.toString()}\n\nIf you did not request an account, you can ignore this email.`,
    });
  } catch (error) {
    await db
      .delete(emailSignupTokens)
      .where(eq(emailSignupTokens.email, email));
    console.error("Email signup verification delivery failed.", error);
    return Response.json(
      { error: "We couldn't send the verification email. Please try again later." },
      { status: 502 },
    );
  }

  return Response.json({ sent: true });
}
