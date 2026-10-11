import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

export async function GET() {
  const designFile = join(
    process.cwd(),
    "app",
    "(dashboard)",
    "develop",
    "jumpstart_3d_v1.904.htm",
  );
  const html = await readFile(designFile);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
