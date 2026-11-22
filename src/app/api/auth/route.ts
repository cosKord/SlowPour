import { randomUUID } from "node:crypto";
import { createSession, endSession, hashPassword, userIdFromSession, verifyPassword } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

export async function GET() {
  const userId = await userIdFromSession();
  return Response.json({ authenticated: Boolean(userId) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = body?.password;
  const action = body?.action;
  if (!/^\S+@\S+\.\S+$/.test(email) || typeof password !== "string" || password.length < 12 || password.length > 256) {
    return Response.json({ error: "Enter a valid email and a password of at least 12 characters." }, { status: 400 });
  }
  if (action === "register") {
    const id = randomUUID();
    const existing = await db()`SELECT 1 FROM users WHERE email = ${email}`;
    if (existing.length) return Response.json({ error: "An account already exists for this email." }, { status: 409 });
    await db()`INSERT INTO users (id, email, password_hash) VALUES (${id}, ${email}, ${hashPassword(password)})`;
    await createSession(id);
    return Response.json({ authenticated: true });
  }
  if (action !== "login") return Response.json({ error: "Invalid action." }, { status: 400 });
  const rows = await db()`SELECT id, password_hash FROM users WHERE email = ${email}`;
  if (!rows[0] || !verifyPassword(password, rows[0].password_hash as string)) {
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }
  await createSession(rows[0].id as string);
  return Response.json({ authenticated: true });
}

export async function DELETE() {
  await endSession();
  return Response.json({ authenticated: false });
}
