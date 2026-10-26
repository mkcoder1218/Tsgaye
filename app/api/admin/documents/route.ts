import { Buffer } from "node:buffer";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOCUMENTS = {
  cv: "cv.pdf",
  resume: "resume.pdf",
} as const;

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const token = process.env.PORTFOLIO_CONTENT_GITHUB_TOKEN;
  const repository = process.env.PORTFOLIO_CONTENT_REPOSITORY || "mkcoder1218/Tsgaye";
  const branch = process.env.PORTFOLIO_CONTENT_BRANCH || "main";

  if (!token) {
    return Response.json(
      { error: "Document publishing is not configured. Add PORTFOLIO_CONTENT_GITHUB_TOKEN to the deployment environment." },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Choose a PDF file to upload." }, { status: 400 });
  }

  const kind = form.get("kind");
  const file = form.get("file");

  if ((kind !== "cv" && kind !== "resume") || !(file instanceof File)) {
    return Response.json({ error: "Choose either a CV or résumé PDF." }, { status: 400 });
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return Response.json({ error: "Only PDF files are supported." }, { status: 400 });
  }

  const maxBytes = 4 * 1024 * 1024;
  if (file.size === 0 || file.size > maxBytes) {
    return Response.json({ error: "PDF must be between 1 byte and 4 MB." }, { status: 400 });
  }

  const path = `public/${DOCUMENTS[kind]}`;
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const apiUrl = `https://api.github.com/repos/${repository}/contents/${encodedPath}`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };

  const currentResponse = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, {
    headers,
    cache: "no-store",
  });

  let sha: string | undefined;
  if (currentResponse.ok) {
    const current = (await currentResponse.json()) as { sha?: string };
    sha = current.sha;
  } else if (currentResponse.status !== 404) {
    const error = (await currentResponse.json().catch(() => ({}))) as { message?: string };
    return Response.json({ error: error.message || "Could not check the existing PDF on GitHub." }, { status: 502 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const updateResponse = await fetch(apiUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: `content: upload ${kind === "cv" ? "CV" : "resume"} PDF from admin`,
      content: bytes.toString("base64"),
      ...(sha ? { sha } : {}),
      branch,
    }),
    cache: "no-store",
  });

  const result = (await updateResponse.json()) as {
    message?: string;
    content?: { html_url?: string };
    commit?: { html_url?: string };
  };

  if (!updateResponse.ok) {
    return Response.json({ error: result.message || "GitHub rejected the PDF upload." }, { status: updateResponse.status >= 500 ? 502 : 400 });
  }

  return Response.json({
    ok: true,
    fileName: DOCUMENTS[kind],
    commitUrl: result.commit?.html_url ?? null,
  });
}
