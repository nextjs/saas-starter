import { prisma } from "@/lib/prisma";

const XERO_AUTH_URL = "https://login.xero.com/identity/connect/authorize";
const XERO_TOKEN_URL = "https://identity.xero.com/connect/token";
const XERO_API_URL = "https://api.xero.com/api.xro/2.0";
const XERO_CONNECTIONS_URL = "https://api.xero.com/connections";

/**
 * Generate the Xero OAuth authorization URL.
 */
export function getXeroAuthUrl(workspaceId: string): string {
  const redirectUri = `${process.env.BASE_URL ?? process.env.NEXTAUTH_URL}/api/workspace/settings/integrations/xero/callback`;
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.XERO_CLIENT_ID!,
    redirect_uri: redirectUri,
    scope: "openid profile email accounting.transactions accounting.contacts offline_access",
    state: workspaceId,
  });
  return `${XERO_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange an authorization code for tokens.
 */
export async function exchangeXeroCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} | null> {
  const redirectUri = `${process.env.BASE_URL ?? process.env.NEXTAUTH_URL}/api/workspace/settings/integrations/xero/callback`;

  try {
    const res = await fetch(XERO_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.XERO_CLIENT_ID}:${process.env.XERO_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!res.ok) {
      console.error("Xero token exchange failed:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  } catch (err) {
    console.error("Xero token exchange error:", err);
    return null;
  }
}

/**
 * Refresh an expired Xero access token.
 */
export async function refreshXeroToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} | null> {
  try {
    const res = await fetch(XERO_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.XERO_CLIENT_ID}:${process.env.XERO_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  } catch {
    return null;
  }
}

/**
 * Get a valid Xero access token for a workspace, refreshing if needed.
 */
export async function getXeroToken(workspaceId: string): Promise<{
  accessToken: string;
  tenantId: string;
} | null> {
  const integration = await prisma.xeroIntegration.findUnique({
    where: { workspaceId },
  });

  if (!integration || !integration.isActive) return null;

  // Check expiry (5 min buffer)
  if (integration.expiresAt > new Date(Date.now() + 5 * 60 * 1000)) {
    return { accessToken: integration.accessToken, tenantId: integration.tenantId };
  }

  // Refresh
  const refreshed = await refreshXeroToken(integration.refreshToken);
  if (!refreshed) return null;

  await prisma.xeroIntegration.update({
    where: { workspaceId },
    data: {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      expiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
    },
  });

  return { accessToken: refreshed.accessToken, tenantId: integration.tenantId };
}

/**
 * Get Xero tenant connections for the authenticated user.
 */
export async function getXeroTenants(accessToken: string): Promise<
  Array<{ tenantId: string; tenantName: string; tenantType: string }>
> {
  try {
    const res = await fetch(XERO_CONNECTIONS_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Search for a contact in Xero by email or company name.
 */
export async function findXeroContact(
  accessToken: string,
  tenantId: string,
  search: { email?: string; name?: string }
): Promise<{ contactId: string; name: string } | null> {
  const where = search.email
    ? `EmailAddress="${search.email}"`
    : search.name
    ? `Name.Contains("${search.name}")`
    : null;

  if (!where) return null;

  try {
    const res = await fetch(`${XERO_API_URL}/Contacts?where=${encodeURIComponent(where)}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Xero-Tenant-Id": tenantId,
        Accept: "application/json",
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    const contact = data.Contacts?.[0];
    if (!contact) return null;

    return { contactId: contact.ContactID, name: contact.Name };
  } catch {
    return null;
  }
}

/**
 * Create a contact in Xero.
 */
export async function createXeroContact(
  accessToken: string,
  tenantId: string,
  contact: { name: string; email?: string; phone?: string }
): Promise<{ contactId: string; name: string } | null> {
  try {
    const res = await fetch(`${XERO_API_URL}/Contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Xero-Tenant-Id": tenantId,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        Name: contact.name,
        EmailAddress: contact.email,
        Phones: contact.phone
          ? [{ PhoneType: "DEFAULT", PhoneNumber: contact.phone }]
          : [],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const created = data.Contacts?.[0];
    return created ? { contactId: created.ContactID, name: created.Name } : null;
  } catch {
    return null;
  }
}

/**
 * Create a draft quote in Xero from an opportunity.
 */
export async function createXeroQuote(
  accessToken: string,
  tenantId: string,
  params: {
    contactId: string;
    reference: string; // opportunity name
    currency: string;
    lineItems: Array<{
      description: string;
      quantity: number;
      unitAmount: number;
      accountCode?: string;
    }>;
    expiryDate?: string; // YYYY-MM-DD
  }
): Promise<{
  quoteId: string;
  quoteNumber: string;
  status: string;
} | null> {
  try {
    const res = await fetch(`${XERO_API_URL}/Quotes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Xero-Tenant-Id": tenantId,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        Quotes: [
          {
            Contact: { ContactID: params.contactId },
            Reference: params.reference,
            CurrencyCode: params.currency,
            Status: "DRAFT",
            LineItems: params.lineItems.map((li) => ({
              Description: li.description,
              Quantity: li.quantity,
              UnitAmount: li.unitAmount,
              ...(li.accountCode && { AccountCode: li.accountCode }),
            })),
            ...(params.expiryDate && { ExpiryDate: params.expiryDate }),
          },
        ],
      }),
    });

    if (!res.ok) {
      console.error("Xero create quote failed:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const quote = data.Quotes?.[0];
    if (!quote) return null;

    return {
      quoteId: quote.QuoteID,
      quoteNumber: quote.QuoteNumber,
      status: quote.Status,
    };
  } catch (err) {
    console.error("Xero create quote error:", err);
    return null;
  }
}

/**
 * Get the status of a quote in Xero.
 */
export async function getXeroQuoteStatus(
  accessToken: string,
  tenantId: string,
  quoteId: string
): Promise<{ status: string; quoteNumber: string; total: number } | null> {
  try {
    const res = await fetch(`${XERO_API_URL}/Quotes/${quoteId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Xero-Tenant-Id": tenantId,
        Accept: "application/json",
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    const quote = data.Quotes?.[0];
    if (!quote) return null;

    return {
      status: quote.Status,
      quoteNumber: quote.QuoteNumber,
      total: quote.Total,
    };
  } catch {
    return null;
  }
}
