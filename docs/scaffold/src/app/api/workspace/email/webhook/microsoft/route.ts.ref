import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncOutlookMessages } from "@/lib/email/microsoft";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("validationToken");
  if (token) return new NextResponse(decodeURIComponent(token), { headers: { "Content-Type": "text/plain" } });
  return NextResponse.json({ error: "Bad request" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  for (const notification of body.value ?? []) {
    const integrationId = notification.clientState;
    if (integrationId) syncOutlookMessages(integrationId).catch(console.error);
  }
  return NextResponse.json({ ok: true });
}
