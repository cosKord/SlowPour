import { PublicNavbar } from "@/components/layout/public-navbar";
import { ButtonLink } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-beige">
      <PublicNavbar />
      <section className="section pt-40">
        <h1 className="section__heading max-w-5xl">
          Coffee tastes different when you remember{" "}
          <span className="editorial text-terracotta">how you got there.</span>
        </h1>
        <div className="mt-16 grid gap-12 md:grid-cols-2">
          <p className="text-xl leading-9">
            SlowPour is a personal home for the coffees you buy, the recipes you
            trust, and the cups you want to learn from.
          </p>
          <div className="space-y-6 leading-8 text-muted">
            <p>
              Most coffee notes disappear into spreadsheets, phone notes, or
              memory. SlowPour connects the bag on your shelf to the recipe you
              intended and the cup you actually brewed.
            </p>
            <p>
              This frontend prototype stores its demo data locally in your
              browser. It is designed to show how the complete experience can
              work before a production backend exists.
            </p>
            <ButtonLink href="/login">Enter the demo</ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
