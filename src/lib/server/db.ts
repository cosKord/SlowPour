import "server-only";
import postgres from "postgres";

let client: ReturnType<typeof postgres> | undefined;

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  return (client ??= postgres(url, { max: 5, prepare: false }));
}
