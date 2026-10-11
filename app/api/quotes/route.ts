import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getUser } from "@/lib/db/queries";
import { zipStl } from "@/lib/zip-stl";
import {
  analyzeStl,
  calculateStlEstimate,
  materials,
  stlSettingsSchema,
} from "@/lib/stl-estimate";

export const runtime = "nodejs";

const MAX_STL_SIZE = 20 * 1024 * 1024;
const MAX_REQUEST_SIZE = MAX_STL_SIZE + 128 * 1024;

const quoteSchema = z.object({
  projectName: z.string().trim().min(1).max(120),
  requestedByDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    }),
  settings: stlSettingsSchema,
  quantity: z.number().int().min(1).max(10000),
});

type Quote = z.infer<typeof quoteSchema>;

function formatQuote(
  quote: Quote,
  customerName: string | null,
  customerEmail: string,
  fileName: string,
  model: ReturnType<typeof analyzeStl>,
  estimate: ReturnType<typeof calculateStlEstimate>,
) {
  const material = materials[quote.settings.materialId];
  return [
    "New STL print quote request",
    "",
    `Project: ${quote.projectName}`,
    `Customer: ${customerName || "(not provided)"}`,
    `Contact email: ${customerEmail}`,
    `Requested by: ${quote.requestedByDate}`,
    `STL file: ${fileName}`,
    "",
    "Model analysis",
    `Volume: ${(model.volumeMm3 / 1000).toFixed(2)} cm³`,
    `Surface area: ${(model.areaMm2 / 100).toFixed(1)} cm²`,
    `Dimensions (X × Y × Z): ${(model.bbox.maxX - model.bbox.minX).toFixed(1)} × ${(model.bbox.maxY - model.bbox.minY).toFixed(1)} × ${(model.bbox.maxZ - model.bbox.minZ).toFixed(1)} mm`,
    `Triangles: ${model.triangles.toLocaleString()}`,
    `Format: ${model.format.toUpperCase()}`,
    "",
    "Print settings",
    `Material: ${material.name}`,
    `Infill: ${quote.settings.infillPct}%`,
    `Wall thickness: ${quote.settings.wallThicknessMm} mm`,
    `Top/bottom layers: ${quote.settings.topBottomLayers}`,
    `Supports: ${quote.settings.supportsPct}%`,
    `Multi-color: ${quote.settings.multiColor ? "Yes" : "No"}`,
    `Number of colors/materials: ${quote.settings.numberOfColors}`,
    `Quantity: ${quote.quantity}`,
    "",
    "Estimate",
    `Total for quantity: $${estimate.totalCost.toFixed(2)}`,
    `Cost per print: $${estimate.costPerPrint.toFixed(2)}`,
    `Estimated print time per print: ${estimate.timeStr}`,
    `Model material: ${estimate.modelGrams.toFixed(1)} g`,
    `Support material: ${estimate.supportGrams.toFixed(1)} g`,
    `Purge material: ${estimate.purgeGrams.toFixed(1)} g`,
    `Startup/waste: ${estimate.startupWaste.toFixed(1)} g`,
    `Total filament per print: ${estimate.totalGrams.toFixed(1)} g`,
    `Material cost per print: $${estimate.materialCost.toFixed(2)}`,
    `Electricity cost per print: $${estimate.electricityCost.toFixed(2)}`,
  ].join("\n");
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (
    session?.user?.provider !== "google" &&
    session?.user?.provider !== "facebook" &&
    session?.user?.provider !== "email"
  ) {
    return Response.json(
      { error: "Sign in with a verified account before submitting a quote." },
      { status: 401 },
    );
  }
  const user = await getUser();
  if (!user?.email) {
    return Response.json(
      { error: "Your account is unavailable. Please sign in again." },
      { status: 401 },
    );
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return Response.json({ error: "Invalid request origin." }, { status: 403 });
      }
    } catch {
      return Response.json({ error: "Invalid request origin." }, { status: 403 });
    }
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_REQUEST_SIZE) {
    return Response.json(
      { error: "The STL file is too large. Maximum size is 20 MB." },
      { status: 413 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Invalid quote submission." }, { status: 400 });
  }

  const quoteField = form.get("quote");
  const stlFile = form.get("stl");
  if (
    typeof quoteField !== "string" ||
    !stlFile ||
    typeof stlFile === "string"
  ) {
    return Response.json(
      { error: "Quote details and an STL file are required." },
      { status: 400 },
    );
  }
  if (stlFile.size === 0 || stlFile.size > MAX_STL_SIZE) {
    return Response.json(
      { error: "The STL file must be between 1 byte and 20 MB." },
      { status: 413 },
    );
  }
  if (!stlFile.name.toLowerCase().endsWith(".stl")) {
    return Response.json({ error: "The attachment must be an STL file." }, { status: 400 });
  }

  let quote: Quote;
  try {
    quote = quoteSchema.parse(JSON.parse(quoteField));
  } catch {
    return Response.json(
      { error: "Quote details are invalid. Please recalculate and try again." },
      { status: 400 },
    );
  }

  let model: ReturnType<typeof analyzeStl>;
  let estimate: ReturnType<typeof calculateStlEstimate>;
  try {
    model = analyzeStl(Buffer.from(await stlFile.arrayBuffer()));
    estimate = calculateStlEstimate(model, quote.settings, quote.quantity);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to analyze the STL file.";
    return Response.json({ error: message }, { status: 400 });
  }

  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAILGUN_FROM_EMAIL;
  const apiBaseUrl = process.env.MAILGUN_API_BASE_URL ?? "https://api.mailgun.net";

  if (!apiKey || !domain || !from) {
    console.error("Quote email is not configured: Mailgun environment variables are missing.");
    return Response.json(
      { error: "Quote email is not configured. Please contact us directly." },
      { status: 503 },
    );
  }
  if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
    console.error("Quote email is not configured: MAILGUN_DOMAIN is invalid.");
    return Response.json(
      { error: "Quote email is not configured. Please contact us directly." },
      { status: 503 },
    );
  }

  let apiUrl: URL;
  try {
    apiUrl = new URL(apiBaseUrl);
  } catch {
    console.error("Quote email is not configured: MAILGUN_API_BASE_URL is invalid.");
    return Response.json(
      { error: "Quote email is not configured. Please contact us directly." },
      { status: 503 },
    );
  }
  if (
    apiUrl.protocol !== "https:" ||
    !["api.mailgun.net", "api.eu.mailgun.net"].includes(apiUrl.hostname)
  ) {
    console.error("Quote email is not configured: MAILGUN_API_BASE_URL is not a Mailgun API URL.");
    return Response.json(
      { error: "Quote email is not configured. Please contact us directly." },
      { status: 503 },
    );
  }

  const zip = zipStl(Buffer.from(await stlFile.arrayBuffer()));
  const message = new FormData();
  message.set("from", from);
  message.set("to", "quotes@lastlayer.ca");
  message.set(
    "subject",
    `${quote.projectName.replace(/[\r\n]+/g, " ")} - STL print quote request`,
  );
  message.set(
    "text",
    formatQuote(
      quote,
      user.name,
      user.email,
      stlFile.name,
      model,
      estimate,
    ),
  );
  message.set("h:Reply-To", user.email);
  const zipArrayBuffer = new ArrayBuffer(zip.length);
  new Uint8Array(zipArrayBuffer).set(zip);
  message.set(
    "attachment",
    new Blob([zipArrayBuffer], { type: "application/zip" }),
    "stl-quote.zip",
  );

  try {
    const response = await fetch(
      `${apiUrl.origin}/v3/${encodeURIComponent(domain)}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
        },
        body: message,
        signal: AbortSignal.timeout(15000),
      },
    );

    if (!response.ok) {
      console.error(`Mailgun quote delivery failed with status ${response.status}.`);
      return Response.json(
        { error: "We couldn't send your quote request. Please try again later." },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("Mailgun quote delivery request failed.", error);
    return Response.json(
      { error: "We couldn't send your quote request. Please try again later." },
      { status: 502 },
    );
  }

  return Response.json({ sent: true });
}
