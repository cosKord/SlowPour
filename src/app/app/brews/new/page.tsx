"use client";

import { useRouter } from "next/navigation";
import { LogBrew } from "@/components/dashboard-dialogs";
import { useDashboard } from "@/components/dashboard-store";
import Link from "next/link";

export default function NewBrewPage() {
  const router = useRouter();
  const store = useDashboard();
  if (!store.ready) return <p>Opening your journal…</p>;
  if (!store.coffees.length) return <div className="p-8"><h1 className="text-3xl font-semibold">Add your first coffee</h1><p className="mt-3">Open a bag before logging a brew.</p><Link className="button button--primary mt-6" href="/app/coffees/new">Open a new bag</Link></div>;
  return (
    <LogBrew
      coffeeId={store.selectedCoffeeId}
      onClose={() => router.push("/app")}
      onSaved={() => router.push("/app/brews")}
    />
  );
}
