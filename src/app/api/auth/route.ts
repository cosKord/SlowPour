import { endSession, userIdFromSession } from "@/lib/server/auth";

export async function GET() {
  const userId = await userIdFromSession();
  return Response.json({ authenticated: Boolean(userId) });
}

export async function DELETE() {
  await endSession();
  return Response.json({ authenticated: false });
}
