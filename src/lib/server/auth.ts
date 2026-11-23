import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";

const cookieName = "slowpour_session";
const duration = 60 * 60 * 24 * 30;

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
  const rows = await db()`SELECT sessions.user_id FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE token_hash = ${digest(token)} AND expires_at > now() AND users.google_sub IS NOT NULL`;
  return (rows[0]?.user_id as string | undefined) ?? null;
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) await db()`DELETE FROM sessions WHERE token_hash = ${digest(token)}`;
  jar.delete(cookieName);
}
