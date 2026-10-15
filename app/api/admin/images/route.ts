import { isAdminAuthenticated } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const categories = ["hero-image", "about-me", "brand-identity", "marketing-design", "print-editorial", "digital-motion", "others"] as const;
const root = "/portfolio/";

type StoredImage = {
  fileId: string;
  name: string;
  url: string;
  filePath: string;
  fileType?: string;
  createdAt?: string;
  size?: number;
};

function credentials() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) throw new Error("ImageKit is not configured.");
  return { Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}` };
}

async function callImageKit(endpoint: string, init: RequestInit = {}) {
  const response = await fetch(`https://api.imagekit.io/v1${endpoint}`, {
    ...init,
    headers: { ...credentials(), ...(init.headers ?? {}) },
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`ImageKit returned ${response.status}: ${detail.slice(0, 200)}`);
  }
  return response;
}

function isManagedPath(path: string) {
  return categories.some((category) => path.startsWith(`${root}${category}/`));
}

async function listCategory(category: string): Promise<StoredImage[]> {
  const images: StoredImage[] = [];
  for (let skip = 0; skip < 10000; skip += 100) {
    const query = new URLSearchParams({ path: `${root}${category}`, limit: "100", skip: String(skip) });
    const response = await callImageKit(`/files?${query}`);
    const page = (await response.json()) as StoredImage[];
    images.push(...page.filter((image) => image.fileType !== "non-image" && image.url && image.fileId && isManagedPath(image.filePath)));
    if (page.length < 100) break;
  }
  return images;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const results = await Promise.all(categories.map(listCategory));
    return Response.json({ images: results.flat().sort((a, b) => (Date.parse(b.createdAt ?? "") || 0) - (Date.parse(a.createdAt ?? "") || 0)) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load images." }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const body = (await request.json()) as { fileId?: string; filePath?: string };
    if (!body.fileId || !body.filePath || !isManagedPath(body.filePath)) return Response.json({ error: "Invalid file." }, { status: 400 });
    const file = await callImageKit(`/files/${encodeURIComponent(body.fileId)}/details`);
    const current = (await file.json()) as { filePath?: string };
    if (current.filePath !== body.filePath) return Response.json({ error: "File has changed. Refresh and try again." }, { status: 409 });
    await callImageKit(`/files/${encodeURIComponent(body.fileId)}`, { method: "DELETE" });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Delete failed." }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const body = (await request.json()) as { fileId?: string; filePath?: string; category?: string };
    if (!body.fileId || !body.filePath || !isManagedPath(body.filePath) || !body.category || !categories.some((category) => category === body.category)) {
      return Response.json({ error: "Invalid image or category." }, { status: 400 });
    }
    const file = await callImageKit(`/files/${encodeURIComponent(body.fileId)}/details`);
    const current = (await file.json()) as { filePath?: string };
    if (current.filePath !== body.filePath) return Response.json({ error: "File has changed. Refresh and try again." }, { status: 409 });
    if (body.filePath.startsWith(`${root}${body.category}/`)) return Response.json({ success: true });
    await callImageKit("/files/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceFilePath: body.filePath, destinationPath: `${root}${body.category}` }),
    });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Update failed." }, { status: 502 });
  }
}
