import "server-only";
import { createHash, createPublicKey, randomBytes, timingSafeEqual, verify } from "node:crypto";
import { cookies } from "next/headers";

const flowCookie = "slowpour_google_flow";
const flowLifetime = 10 * 60;

function config() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const origin = process.env.APP_ORIGIN;
  if (!clientId || !clientSecret || !origin) throw new Error("Google sign-in is not configured");
  const url = new URL(origin);
  if (url.pathname !== "/" || url.search || url.hash || (process.env.NODE_ENV === "production" && url.protocol !== "https:")) {
    throw new Error("APP_ORIGIN must be an HTTPS origin in production");
  }
  return { clientId, clientSecret, redirectUri: new URL("/api/auth/google/callback", url).toString() };
}

function random() {
  return randomBytes(32).toString("base64url");
}

function equal(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function beginGoogleSignIn() {
  const { clientId, redirectUri } = config();
  const state = random();
  const nonce = random();
  const verifier = random();
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  (await cookies()).set(flowCookie, JSON.stringify({ state, nonce, verifier }), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/api/auth/google", maxAge: flowLifetime,
  });
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: clientId, redirect_uri: redirectUri, response_type: "code",
    scope: "openid email", state, nonce, code_challenge: challenge,
    code_challenge_method: "S256",
  }).toString();
  return url;
}

type GoogleIdentity = { sub: string; email: string; emailAuthority: boolean };

export async function finishGoogleSignIn(code: string, state: string): Promise<GoogleIdentity> {
  const jar = await cookies();
  const raw = jar.get(flowCookie)?.value;
  jar.delete(flowCookie);
  if (!raw) throw new Error("Sign-in request expired");
  let flow: { state: string; nonce: string; verifier: string };
  try { flow = JSON.parse(raw); } catch { throw new Error("Invalid sign-in request"); }
  if (typeof flow.state !== "string" || !equal(state, flow.state) ||
      typeof flow.nonce !== "string" || typeof flow.verifier !== "string") {
    throw new Error("Invalid sign-in request");
  }
  const { clientId, clientSecret, redirectUri } = config();
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret,
      redirect_uri: redirectUri, grant_type: "authorization_code", code_verifier: flow.verifier }),
    cache: "no-store",
  });
  if (!tokenResponse.ok) throw new Error("Google did not complete sign-in");
  const token = await tokenResponse.json();
  if (typeof token.id_token !== "string") throw new Error("Google did not provide an ID token");
  return verifyGoogleIdToken(token.id_token, clientId, flow.nonce);
}

async function verifyGoogleIdToken(token: string, clientId: string, nonce: string): Promise<GoogleIdentity> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid Google ID token");
  const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  if (header.alg !== "RS256" || typeof header.kid !== "string") throw new Error("Invalid Google ID token");
  const keyResponse = await fetch("https://www.googleapis.com/oauth2/v3/certs", { cache: "no-store" });
  if (!keyResponse.ok) throw new Error("Google signing keys are unavailable");
  const keys = await keyResponse.json();
  const jwk = keys.keys?.find((key: { kid?: string; kty?: string; use?: string }) =>
    key.kid === header.kid && key.kty === "RSA" && key.use === "sig");
  if (!jwk || !verify("RSA-SHA256", Buffer.from(`${parts[0]}.${parts[1]}`),
    createPublicKey({ key: jwk, format: "jwk" }), Buffer.from(parts[2], "base64url"))) {
    throw new Error("Invalid Google ID token signature");
  }
  const now = Math.floor(Date.now() / 1000);
  if (!(["https://accounts.google.com", "accounts.google.com"].includes(payload.iss)) ||
      payload.aud !== clientId || typeof payload.exp !== "number" || payload.exp <= now ||
      typeof payload.iat !== "number" || payload.iat > now + 60 ||
      payload.nonce !== nonce || payload.email_verified !== true ||
      typeof payload.sub !== "string" || !payload.sub ||
      typeof payload.email !== "string" || !/^\S+@\S+\.\S+$/.test(payload.email)) {
    throw new Error("Invalid Google identity");
  }
  const email = payload.email.toLowerCase();
  return { sub: payload.sub, email,
    emailAuthority: email.endsWith("@gmail.com") || (typeof payload.hd === "string" && Boolean(payload.hd)) };
}
