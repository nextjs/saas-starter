import {
  analyzeStl,
  calculateStlEstimate,
  stlSettingsSchema,
} from "@/lib/stl-estimate";

export const runtime = "nodejs";

const MAX_STL_SIZE = 20 * 1024 * 1024;
const MAX_REQUEST_SIZE = MAX_STL_SIZE + 128 * 1024;

export async function POST(request: Request) {
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
    return Response.json({ error: "Invalid estimate request." }, { status: 400 });
  }

  const file = form.get("stl");
  const settingsField = form.get("settings");
  const quantityField = form.get("quantity");
  if (
    !file ||
    typeof file === "string" ||
    typeof settingsField !== "string" ||
    typeof quantityField !== "string"
  ) {
    return Response.json(
      { error: "An STL file and print settings are required." },
      { status: 400 },
    );
  }
  if (file.size === 0 || file.size > MAX_STL_SIZE) {
    return Response.json(
      { error: "The STL file must be between 1 byte and 20 MB." },
      { status: 413 },
    );
  }
  if (!file.name.toLowerCase().endsWith(".stl")) {
    return Response.json(
      { error: "The uploaded file must be an STL." },
      { status: 400 },
    );
  }

  const quantity = Number(quantityField);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) {
    return Response.json(
      { error: "Quantity must be a whole number between 1 and 10,000." },
      { status: 400 },
    );
  }

  let settings;
  try {
    settings = stlSettingsSchema.parse(JSON.parse(settingsField));
  } catch {
    return Response.json(
      { error: "Print settings are invalid." },
      { status: 400 },
    );
  }

  try {
    const mesh = analyzeStl(Buffer.from(await file.arrayBuffer()));
    const estimate = calculateStlEstimate(mesh, settings, quantity);
    return Response.json({ mesh, estimate });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to analyze the STL file.";
    return Response.json({ error: message }, { status: 400 });
  }
}
