import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncGmailMessages } from "@/lib/email/gmail";

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const data: { emailAddress: string; historyId: string } = JSON.parse(
      Buffer.from(body.message.data, "base64").toString()
    );
    const integration = await db.emailIntegration.findFirst({
      where: { email: data.emailAddress, provider: "GOOGLE", isActive: true },
    });
    if (integration) syncGmailMessages(integration.id).catch(console.error);
  } catch { /* ignore malformed */ }
  return NextResponse.json({ ok: true });
}
