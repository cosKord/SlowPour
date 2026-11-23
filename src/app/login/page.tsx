import { Wordmark } from "@/components/brand/wordmark";

export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="grid min-h-screen bg-beige lg:grid-cols-2">
      <section className="flex flex-col justify-between p-7 lg:p-12">
        <Wordmark />
        <div className="mx-auto w-full max-w-md py-16">
          <p className="meta">Your coffee journal</p>
          <h1 className="mt-4 text-5xl font-bold tracking-[-.055em]">Your next cup starts here.</h1>
          <p className="mt-5 leading-7 text-muted">Sign in with Google to save your brews and pick up where you left off.</p>
          {error && <p role="alert" className="mt-6 text-sm text-red-700">
            {error === "cancelled" ? "Google sign-in was cancelled." :
              error === "unavailable" ? "Google sign-in is not configured yet." :
                "Google sign-in could not be completed. Please try again."}
          </p>}
          <a className="button button--primary mt-9 inline-flex" href="/api/auth/google">Continue with Google</a>
        </div>
        <p className="text-xs text-muted">SlowPour · Every cup has a story.</p>
      </section>
      <section className="relative hidden overflow-hidden bg-walnut text-cream lg:grid lg:place-items-center">
        <div className="absolute inset-10 rounded-[24px_24px_50%_50%/24px_24px_12%_12%] border border-cream/20" />
        <blockquote className="relative max-w-xl p-16 text-center font-serif text-6xl leading-[1.02] italic">
          “The cup gets better when the notes stay close.”
        </blockquote>
      </section>
    </main>
  );
}
