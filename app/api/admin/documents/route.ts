import { Buffer } from "node:buffer";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getDocumentLinks } from "@/lib/livePortfolio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DocumentKind = "cv" | "resume";
const path = "content/document-links.json";

function validUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  return Response.json(await getDocumentLinks(), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const token = process.env.PORTFOLIO_CONTENT_GITHUB_TOKEN;
  const repository = process.env.PORTFOLIO_CONTENT_REPOSITORY || "mkcoder1218/Tsgaye";
  const branch = process.env.PORTFOLIO_CONTENT_BRANCH || "main";
  if (!token) return Response.json({ error: "Set PORTFOLIO_CONTENT_GITHUB_TOKEN in Vercel to enable saving." }, { status: 503 });
  let input: { kind?: DocumentKind; url?: string };
  try { input = (await request.json()) as typeof input; }
  catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if ((input.kind !== "cv" && input.kind !== "resume") || !validUrl(input.url)) {
    return Response.json({ error: "Select CV or résumé and enter a valid HTTPS download URL." }, { status: 400 });
  }
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
  const endpoint = `https://api.github.com/repos/${repository}/contents/${path}`;
  const currentResponse = await fetch(`${endpoint}?ref=${encodeURIComponent(branch)}`, { headers, cache: "no-store" });
  if (!currentResponse.ok) return Response.json({ error: "Could not load current links from GitHub." }, { status: 502 });
  const current = await currentResponse.json() as { sha?: string; content?: string };
  if (!current.sha || !current.content) return Response.json({ error: "GitHub returned incomplete link data." }, { status: 502 });
  let links: { cv: string; resume: string };
  try { links = JSON.parse(Buffer.from(current.content.replace(/\s/g, ""), "base64").toString("utf8")) as typeof links; }
  catch { return Response.json({ error: "Stored document links are invalid." }, { status: 502 }); }
  links[input.kind] = input.url.trim();
  const response = await fetch(endpoint, {
    method: "PUT", headers, cache: "no-store",
    body: JSON.stringify({
      message: `content: update ${input.kind} download link`,
      content: Buffer.from(JSON.stringify(links, null, 2) + "\n", "utf8").toString("base64"),
      sha: current.sha, branch,
    }),
  });
  const result = await response.json() as { message?: string; commit?: { html_url?: string } };
  if (!response.ok) return Response.json({ error: result.message || "GitHub rejected the link." }, { status: response.status >= 500 ? 502 : 400 });
  return Response.json({ ok: true, links, commitUrl: result.commit?.html_url ?? null });
}
