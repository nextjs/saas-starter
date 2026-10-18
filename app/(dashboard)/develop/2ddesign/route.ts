import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

const editorRoot = join(process.cwd(), "node_modules", "svgedit", "dist", "editor");

export async function GET() {
  const html = (await readFile(join(editorRoot, "index.html"), "utf8")).replace(
    "<head>",
    '<head>\n  <base href="/develop/2ddesign/">',
  );

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
