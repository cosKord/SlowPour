import { userIdFromSession } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

export async function GET() {
  const userId = await userIdFromSession();
  if (!userId) return Response.json({ error: "Sign in required." }, { status: 401 });
  const rows = await db()`SELECT document, revision FROM journal_snapshots WHERE user_id = ${userId}`;
  return Response.json(rows[0] ?? { document: null, revision: 0 }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  const userId = await userIdFromSession();
  if (!userId) return Response.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const document = body?.document;
  if (!document || !Array.isArray(document.coffees) || !Array.isArray(document.bags) ||
    !Array.isArray(document.brews) || !Array.isArray(document.recipes) ||
    JSON.stringify(document).length > 2_000_000) {
    return Response.json({ error: "Invalid journal data." }, { status: 400 });
  }
  const rows = await db()`INSERT INTO journal_snapshots (user_id, document)
    VALUES (${userId}, ${JSON.stringify(document)}::jsonb)
    ON CONFLICT (user_id) DO UPDATE SET document = EXCLUDED.document,
      revision = journal_snapshots.revision + 1, updated_at = now()
    RETURNING revision`;
  return Response.json({ revision: rows[0].revision });
}
