"use client";

import { useRouter } from "next/navigation";
import { LogBrew } from "@/components/dashboard-dialogs";
import { useDashboard } from "@/components/dashboard-store";

export default function NewBrewPage() {
  const router = useRouter();
  const store = useDashboard();
  return (
    <LogBrew
      coffeeId={store.selectedCoffeeId}
      onClose={() => router.push("/app")}
      onSaved={() => router.push("/app/brews")}
    />
  );
}
