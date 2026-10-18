export async function sendMailgunMessage({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAILGUN_FROM_EMAIL;
  const apiBaseUrl = process.env.MAILGUN_API_BASE_URL ?? "https://api.mailgun.net";

  if (!apiKey || !domain || !from || !/^[a-zA-Z0-9.-]+$/.test(domain)) {
    throw new Error("Mailgun email delivery is not configured.");
  }

  let apiUrl: URL;
  try {
    apiUrl = new URL(apiBaseUrl);
  } catch {
    throw new Error("Mailgun API URL is invalid.");
  }
  if (
    apiUrl.protocol !== "https:" ||
    !["api.mailgun.net", "api.eu.mailgun.net"].includes(apiUrl.hostname)
  ) {
    throw new Error("Mailgun API URL is invalid.");
  }

  const body = new FormData();
  body.set("from", from);
  body.set("to", to);
  body.set("subject", subject);
  body.set("text", text);
  const response = await fetch(
    `${apiUrl.origin}/v3/${encodeURIComponent(domain)}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
      },
      body,
      signal: AbortSignal.timeout(15000),
    },
  );

  if (!response.ok) {
    throw new Error(`Mailgun delivery failed with status ${response.status}.`);
  }
}
