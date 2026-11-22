import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";

const cookieName = "slowpour_session";
const duration = 60 * 60 * 24 * 30;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected || expected.length !== 128) return false;
  const actual = scryptSync(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(expected, "hex"));
}

const digest = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  await db()`INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (${digest(token)}, ${userId}, now() + interval '30 days')`;
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: duration,
  });
}

export async function userIdFromSession() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  const rows = await db()`SELECT user_id FROM sessions WHERE token_hash = ${digest(token)} AND expires_at > now()`;
  return (rows[0]?.user_id as string | undefined) ?? null;
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) await db()`DELETE FROM sessions WHERE token_hash = ${digest(token)}`;
  jar.delete(cookieName);
}
