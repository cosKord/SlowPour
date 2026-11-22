"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { duration, useDashboard } from "@/components/dashboard-store";
import JournalSpreadCarousel, {
  type JournalSpread,
} from "@/components/ui/journal-spread-carousel";
import { ratio } from "@/data/seed";
import { formatMethod } from "@/lib/utils";

export default function BrewsPage() {
  const router = useRouter();
  const store = useDashboard();
  const { brews, coffees } = store;
  const [currentIndex, setCurrentIndex] = useState(0);
  const coffeeById = (id: string) => coffees.find((coffee) => coffee.id === id);
  const entries: JournalSpread[] = brews.map((brew) => {
      const coffee = coffeeById(brew.coffeeId);
      const brewedAt = new Date(brew.brewedAt);
      return {
        id: brew.id,
        label: coffee?.name ?? "Coffee entry",
        paper: "#f3ead8",
        decorativeCoffee: coffee,
        fieldLog: {
          date: `${brewedAt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · ${brewedAt.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" })}`,
          coffee: coffee?.name ?? "Coffee",
          origin: [coffee?.roaster, coffee?.origin].filter(Boolean).join(" · "),
          method: formatMethod(brew.method),
          rating: brew.rating.toFixed(1),
          dose: `${brew.doseG}g / ${brew.waterMl}ml`,
          ratio: ratio(brew.waterMl, brew.doseG),
          grind: `${brew.grindClicks} clicks`,
          temperatureAndTime: `${brew.temperatureC}°C · ${duration(brew.timeSec)}`,
          tastingNotes: brew.notes || "No tasting notes yet.",
          nextBrew: brew.dialInCue,
          milestones: brew.checkpoints?.length
            ? brew.checkpoints.map((point) => `${point.label} ${duration(point.timeSec)}`).join(" · ")
            : undefined,
        },
      };
    });

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Brew journal</h1>
          <p>
            Turn through the cups, small adjustments, and discoveries worth
            keeping.
          </p>
        </div>
      </header>
      {entries.length ? (
        <JournalSpreadCarousel
          key={entries.map((entry) => entry.id).join("|")}
          spreads={entries}
          title="The brew journal"
          meta={`${entries.length} ${entries.length === 1 ? "entry" : "entries"}`}
          autoPlay={false}
          showFloor={false}
          height="clamp(600px, 72vw, 800px)"
          className="mx-auto max-w-[1360px]"
          variant="recipe"
          layout="field-log"
          initialIndex={Math.min(currentIndex, entries.length - 1)}
          onIndexChange={setCurrentIndex}
          onAction={(action, index) => {
            if (action === "add") { router.push("/app/brews/new"); return; }
            if (action !== "delete") return;
            const entry = entries[index];
            if (!entry || !window.confirm(`Delete this ${entry.label} brew from your journal?`)) return;
            setCurrentIndex(Math.max(0, Math.min(index, entries.length - 2)));
            store.update({ brews: store.brews.filter((brew) => brew.id !== entry.id) });
          }}
        />
      ) : (
        <div className="rounded-3xl bg-[#faf7f2a8] p-10 text-center"><p>Your brew journal is empty.</p><a className="button button--primary mt-4" href="/app/brews/new">+ Log a brew</a></div>
      )}
    </>
  );
}
