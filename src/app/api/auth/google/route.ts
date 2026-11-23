import { beginGoogleSignIn } from "@/lib/server/google-auth";
import { connection } from "next/server";

export async function GET() {
  await connection();
  try {
    return Response.redirect(await beginGoogleSignIn());
  } catch {
    return Response.redirect(new URL("/login?error=unavailable", process.env.APP_ORIGIN || "http://localhost:3000"));
  }
}
