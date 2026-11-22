export default function Loading() {
  return (
    <section
      aria-label="Loading coffee details"
      aria-busy="true"
      className="mt-8 grid gap-10 lg:grid-cols-[.75fr_1.25fr]"
    >
      <p role="status" className="sr-only">
        Loading coffee details…
      </p>
      <div className="min-h-[520px] animate-pulse rounded-[24px_24px_48%_48%/24px_24px_12%_12%] bg-pistachio-light" />
      <div className="space-y-5 py-4">
        <div className="h-3 w-40 animate-pulse rounded bg-cream" />
        <div className="h-14 max-w-lg animate-pulse rounded bg-cream" />
        <div className="h-24 max-w-xl animate-pulse rounded bg-cream" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <div className="h-32 animate-pulse rounded-2xl bg-cream" />
          <div className="h-32 animate-pulse rounded-2xl bg-cream" />
        </div>
      </div>
    </section>
  );
}
