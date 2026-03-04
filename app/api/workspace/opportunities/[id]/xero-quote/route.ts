import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import {
  getXeroToken,
  findXeroContact,
  createXeroContact,
  createXeroQuote,
  getXeroQuoteStatus,
} from "@/lib/integrations/xero";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace } = ctx;
  const { id } = await params;

  const opp = await prisma.opportunity.findFirst({
    where: { id, workspaceId: workspace.id },
    select: { xeroQuoteId: true, xeroQuoteUrl: true, xeroQuoteStatus: true },
  });
  if (!opp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If there's a quote, refresh status from Xero
  if (opp.xeroQuoteId) {
    const token = await getXeroToken(workspace.id);
    if (token) {
      const status = await getXeroQuoteStatus(token.accessToken, token.tenantId, opp.xeroQuoteId);
      if (status && status.status !== opp.xeroQuoteStatus) {
        await prisma.opportunity.update({
          where: { id },
          data: { xeroQuoteStatus: status.status },
        });
        opp.xeroQuoteStatus = status.status;
      }
    }
  }

  return NextResponse.json({
    hasQuote: !!opp.xeroQuoteId,
    quoteId: opp.xeroQuoteId,
    quoteUrl: opp.xeroQuoteUrl,
    quoteStatus: opp.xeroQuoteStatus,
  });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;
  const { id } = await params;

  if (member.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get Xero connection
  const token = await getXeroToken(workspace.id);
  if (!token) {
    return NextResponse.json({ error: "Xero not connected. Connect in Settings > Integrations." }, { status: 400 });
  }

  // Load opportunity with products and account/contact
  const opp = await prisma.opportunity.findFirst({
    where: { id, workspaceId: workspace.id },
    include: {
      account: { select: { name: true, domain: true } },
      contacts: {
        include: { contact: { select: { email: true, firstName: true, lastName: true } } },
        take: 1,
      },
      products: {
        include: { product: { select: { name: true, unitPrice: true } } },
      },
    },
  });
  if (!opp) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });

  if (opp.xeroQuoteId) {
    return NextResponse.json({ error: "Quote already exists for this opportunity" }, { status: 409 });
  }

  // Resolve or create Xero contact
  let xeroContactId = opp.xeroContactId;

  if (!xeroContactId) {
    const primaryContact = opp.contacts[0]?.contact;
    const searchEmail = primaryContact?.email;
    const searchName = opp.account?.name;

    // Try to find existing contact in Xero
    let xeroContact = searchEmail
      ? await findXeroContact(token.accessToken, token.tenantId, { email: searchEmail })
      : null;

    if (!xeroContact && searchName) {
      xeroContact = await findXeroContact(token.accessToken, token.tenantId, { name: searchName });
    }

    if (!xeroContact) {
      // Create a new contact in Xero
      const name = opp.account?.name ??
        (primaryContact ? `${primaryContact.firstName} ${primaryContact.lastName}` : opp.name);
      xeroContact = await createXeroContact(token.accessToken, token.tenantId, {
        name,
        email: searchEmail ?? undefined,
      });
    }

    if (!xeroContact) {
      return NextResponse.json({ error: "Failed to create or find contact in Xero" }, { status: 500 });
    }

    xeroContactId = xeroContact.contactId;

    // Cache the mapping
    await prisma.opportunity.update({
      where: { id },
      data: { xeroContactId },
    });
  }

  // Build line items from products, or a single line item from deal value
  const lineItems = opp.products.length > 0
    ? opp.products.map((po) => ({
        description: po.product.name,
        quantity: po.quantity ?? 1,
        unitAmount: Number(po.product.unitPrice ?? opp.value),
      }))
    : [
        {
          description: opp.name,
          quantity: 1,
          unitAmount: Number(opp.value),
        },
      ];

  // Create the quote
  const quote = await createXeroQuote(token.accessToken, token.tenantId, {
    contactId: xeroContactId,
    reference: opp.name,
    currency: opp.currency,
    lineItems,
  });

  if (!quote) {
    return NextResponse.json({ error: "Failed to create quote in Xero" }, { status: 500 });
  }

  // Build Xero deep link
  const xeroQuoteUrl = `https://go.xero.com/app/quotes/view/${quote.quoteId}`;

  // Store on opportunity
  await prisma.opportunity.update({
    where: { id },
    data: {
      xeroQuoteId: quote.quoteId,
      xeroQuoteUrl,
      xeroQuoteStatus: quote.status,
    },
  });

  return NextResponse.json({
    quoteId: quote.quoteId,
    quoteNumber: quote.quoteNumber,
    quoteUrl: xeroQuoteUrl,
    status: quote.status,
  }, { status: 201 });
}
