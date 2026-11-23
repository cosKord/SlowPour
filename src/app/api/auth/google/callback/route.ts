import { randomUUID } from "node:crypto";
import { createSession } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { finishGoogleSignIn } from "@/lib/server/google-auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const login = new URL("/login", url);
  if (url.searchParams.has("error")) {
    login.searchParams.set("error", "cancelled");
    return Response.redirect(login);
  }
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    login.searchParams.set("error", "invalid");
    return Response.redirect(login);
  }
  try {
    const identity = await finishGoogleSignIn(code, state);
    const sql = db();
    const existing = await sql`SELECT id FROM users WHERE google_sub = ${identity.sub}`;
    let userId = existing[0]?.id as string | undefined;
    if (!userId) {
      const rows = await sql`INSERT INTO users (id, email, google_sub)
        VALUES (${randomUUID()}, ${identity.email}, ${identity.sub})
        ON CONFLICT (email) DO UPDATE SET google_sub = EXCLUDED.google_sub
        WHERE users.google_sub IS NULL AND ${identity.emailAuthority} RETURNING id`;
      userId = rows[0]?.id as string | undefined;
    }
    if (!userId) throw new Error("Account is linked to another Google identity");
    await createSession(userId);
    return Response.redirect(new URL("/app", url));
  } catch {
    login.searchParams.set("error", "failed");
    return Response.redirect(login);
  }
}
