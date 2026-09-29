import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function secureEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);

  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const adminKey = process.env.ADMIN_UPLOAD_KEY;
  const suppliedKey = request.headers.get("x-admin-key") ?? "";

  if (!privateKey || !publicKey || !adminKey) {
    return Response.json(
      { error: "Upload service is not configured." },
      { status: 503 },
    );
  }

  if (!secureEqual(suppliedKey, adminKey)) {
    return Response.json({ error: "Invalid admin passcode." }, { status: 401 });
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
