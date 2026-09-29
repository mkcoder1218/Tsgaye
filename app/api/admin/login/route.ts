import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { adminSession, createAdminSession } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function secureEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);

  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  const sessionSecret = process.env.ADMIN_SESSION_SECRET ?? "";

  if (!adminEmail || !adminPassword || !sessionSecret) {
    return NextResponse.json(
      { error: "Admin login is not configured." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (
    !secureEqual(email, adminEmail.toLowerCase()) ||
    !secureEqual(password, adminPassword)
  ) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: adminSession.cookieName,
    value: createAdminSession(email),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: adminSession.maxAge,
  });

  return response;
}
