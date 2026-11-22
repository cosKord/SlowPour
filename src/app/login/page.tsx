"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/brand/wordmark";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: mode, email, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Sign in failed.");
      router.push("/app"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Sign in failed."); }
    finally { setBusy(false); }
  }
  return <main className="grid min-h-screen bg-beige lg:grid-cols-2"><section className="flex flex-col justify-between p-7 lg:p-12"><Wordmark/><div className="mx-auto w-full max-w-md py-16"><p className="meta">Your coffee journal</p><h1 className="mt-4 text-5xl font-bold tracking-[-.055em]">Your next cup starts here.</h1><p className="mt-5 leading-7 text-muted">{mode === "login" ? "Sign in to pick up where you left off." : "Create an account to save your brews and recipes."}</p><form onSubmit={submit} className="mt-9 grid gap-4"><label className="grid gap-2 text-sm">Email<input className="rounded-xl border border-walnut/20 bg-cream px-4 py-3" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)}/></label><label className="grid gap-2 text-sm">Password<input className="rounded-xl border border-walnut/20 bg-cream px-4 py-3" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={12} required value={password} onChange={event => setPassword(event.target.value)}/></label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button className="button button--primary mt-2" disabled={busy}>{busy ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}</button></form><button className="mt-5 text-sm underline" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}</button></div><p className="text-xs text-muted">SlowPour · Every cup has a story.</p></section><section className="relative hidden overflow-hidden bg-walnut text-cream lg:grid lg:place-items-center"><div className="absolute inset-10 rounded-[24px_24px_50%_50%/24px_24px_12%_12%] border border-cream/20"/><blockquote className="relative max-w-xl p-16 text-center font-serif text-6xl leading-[1.02] italic">“The cup gets better when the notes stay close.”</blockquote></section></main>;
}
