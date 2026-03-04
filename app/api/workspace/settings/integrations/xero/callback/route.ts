import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exchangeXeroCode, getXeroTenants } from "@/lib/integrations/xero";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state"); // workspaceId
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code || !state) {
    const baseUrl = process.env.BASE_URL ?? process.env.NEXTAUTH_URL ?? "";
    return NextResponse.redirect(`${baseUrl}/settings/integrations?error=xero_auth_failed`);
  }

  // Exchange code for tokens
  const tokens = await exchangeXeroCode(code);
  if (!tokens) {
    const baseUrl = process.env.BASE_URL ?? process.env.NEXTAUTH_URL ?? "";
    return NextResponse.redirect(`${baseUrl}/settings/integrations?error=xero_token_exchange_failed`);
  }

  // Get tenant info
  const tenants = await getXeroTenants(tokens.accessToken);
  const tenant = tenants[0]; // Use the first connected org

  if (!tenant) {
    const baseUrl = process.env.BASE_URL ?? process.env.NEXTAUTH_URL ?? "";
    return NextResponse.redirect(`${baseUrl}/settings/integrations?error=no_xero_org`);
  }

  // Store integration
  await prisma.xeroIntegration.upsert({
    where: { workspaceId: state },
    update: {
      tenantId: tenant.tenantId,
      tenantName: tenant.tenantName,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
      isActive: true,
    },
    create: {
      workspaceId: state,
      tenantId: tenant.tenantId,
      tenantName: tenant.tenantName,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
    },
  });

  const baseUrl = process.env.BASE_URL ?? process.env.NEXTAUTH_URL ?? "";
  return NextResponse.redirect(`${baseUrl}/settings/integrations?xero=connected`);
}
