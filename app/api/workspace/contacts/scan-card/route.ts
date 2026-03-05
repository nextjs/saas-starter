import { NextRequest, NextResponse } from "next/server";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Business card scanning is not configured. Set ANTHROPIC_API_KEY." },
      { status: 501 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  // Convert to base64
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  // Determine media type
  const mimeType = file.type || "image/jpeg";
  if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mimeType)) {
    return NextResponse.json({ error: "Unsupported image format. Use JPEG, PNG, GIF, or WebP." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: base64,
            },
          },
          {
            type: "text",
            text: `Extract contact information from this business card image. Return ONLY a JSON object with these fields (use null for missing fields):
{
  "firstName": string,
  "lastName": string,
  "email": string | null,
  "phone": string | null,
  "jobTitle": string | null,
  "department": string | null,
  "company": string | null,
  "website": string | null,
  "address": string | null
}

Important:
- Split the full name into firstName and lastName
- Clean up phone numbers (keep country code if present)
- Only return the JSON, no markdown or explanation`,
          },
        ],
      },
    ],
  });

  // Extract text content from response
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }

  try {
    // Parse JSON from response (handle potential markdown wrapping)
    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    const contactData = JSON.parse(jsonStr);
    return NextResponse.json({ contact: contactData });
  } catch {
    return NextResponse.json({ error: "Failed to parse card data", raw: textBlock.text }, { status: 500 });
  }
}
