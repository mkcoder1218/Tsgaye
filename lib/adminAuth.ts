import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "tsegaye_admin_session";
const SESSION_SECONDS = 60 * 60 * 12;

function secureEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);

  return a.length === b.length && timingSafeEqual(a, b);
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export function createAdminSession(email: string) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `${email}:${expires}`;
  return `${payload}:${sign(payload)}`;
}

export function verifyAdminSession(value?: string | null) {
  if (!value || !getSessionSecret()) {
    return false;
  }

  const parts = value.split(":");
  if (parts.length < 3) {
    return false;
  }

  const signature = parts.pop() ?? "";
  const expiresRaw = parts.pop() ?? "";
  const email = parts.join(":");
  const expires = Number(expiresRaw);

  if (!email || !Number.isFinite(expires) || expires < Date.now() / 1000) {
    return false;
  }

  const payload = `${email}:${expires}`;
  return secureEqual(signature, sign(payload));
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(COOKIE_NAME)?.value);
}

export const adminSession = {
  cookieName: COOKIE_NAME,
  maxAge: SESSION_SECONDS,
};
