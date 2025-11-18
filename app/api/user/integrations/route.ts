"use server";

import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import { integrations } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userIntegrations = await db
      .select()
      .from(integrations)
      .where(eq(integrations.userId, user.id));

    return NextResponse.json(userIntegrations);
  } catch (error) {
    console.error("Failed to fetch integrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, enabled, metadata } = body;

    if (!type) {
      return NextResponse.json(
        { error: "Integration type is required" },
        { status: 400 }
      );
    }

    // Check if integration already exists
    const existing = await db
      .select()
      .from(integrations)
      .where(and(eq(integrations.userId, user.id), eq(integrations.type, type)))
      .limit(1);

    let result;
    if (existing.length > 0) {
      // Update existing integration
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (typeof enabled !== "undefined") {
        updateData.enabled = enabled;
      }

      if (metadata) {
        updateData.metadata = metadata;
      }

      result = await db
        .update(integrations)
        .set(updateData)
        .where(eq(integrations.id, existing[0].id))
        .returning();
    } else {
      // Create new integration
      result = await db
        .insert(integrations)
        .values({
          userId: user.id,
          type,
          enabled: enabled ?? false,
          metadata: metadata || null,
        })
        .returning();
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Failed to update integration:", error);
    return NextResponse.json(
      { error: "Failed to update integration" },
      { status: 500 }
    );
  }
}
