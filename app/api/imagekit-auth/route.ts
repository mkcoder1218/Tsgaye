import { createHmac, randomUUID } from "node:crypto";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;

  if (!privateKey || !publicKey) {
    return Response.json(
      { error: "Upload service is not configured." },
      { status: 503 },
    );
  }

  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 30 * 60;
  const signature = createHmac("sha1", privateKey)
    .update(`${token}${expire}`)
    .digest("hex");

  return Response.json(
    { token, expire, signature, publicKey },
    { headers: { "Cache-Control": "no-store" } },
  );
}
