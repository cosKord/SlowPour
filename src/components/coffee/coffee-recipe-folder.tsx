"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GlassFolder, { type FolderFile } from "@/components/ui/glass-folder-cards";
import { CoffeeTastingProfile } from "./coffee-tasting-profile";
import { Modal } from "@/components/dashboard-dialogs";
import { useDashboard, type JournalRecipe } from "@/components/dashboard-store";
import { RecipeForm } from "./recipe-form";
import { formatMethod } from "@/lib/utils";

export function CoffeeRecipeFolder({ coffeeId, onBrew }: { coffeeId: string; onBrew: (recipeId: string) => void }) {
  const router = useRouter();
  const store = useDashboard();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedBrewId, setSelectedBrewId] = useState<string | null>(null);
  const [editing, setEditing] = useState<JournalRecipe | "new" | null>(null);
  const recipes = store.recipes.filter((recipe) => recipe.coffeeId === coffeeId);
  const brews = store.brews.filter((brew) => brew.coffeeId === coffeeId);
  const selectedBrew = brews.find((brew) => brew.id === selectedBrewId);
  const selected = recipes.find((recipe) => recipe.id === selectedId);
  const files: FolderFile[] = recipes.map((recipe) => ({
    name: recipe.name,
    meta: `${formatMethod(recipe.method)} · ${recipe.doseG}g / ${recipe.waterMl}ml`,
  }));
  const journalFiles: FolderFile[] = brews.map((brew) => ({
    name: new Date(brew.brewedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    meta: `${formatMethod(brew.method)} · ${brew.rating.toFixed(1)}/5`,
  }));

  return (
    <section className="mt-16 border-t border-[#2E2025]/10 pt-8" aria-label="Recipes, journal, and tasting profile for this coffee">
      <div className="flex flex-wrap items-start gap-5">
        <GlassFolder
          key={coffeeId}
          label="Recipes"
          tone="light"
          image="/assets/folder-art/verdant.webp"
          files={files}
          width={280}
          onAdd={() => setEditing("new")}
          onFileSelect={(_, index) => setSelectedId(recipes[index]?.id ?? null)}
        />
        <GlassFolder
          key={`${coffeeId}-journal`}
          label="Journal"
          tone="light"
          image="/assets/folder-art/dusk.webp"
          files={journalFiles}
          width={280}
          onAdd={() => { store.update({ selectedCoffeeId: coffeeId }); router.push("/app/brews/new"); }}
          onFileSelect={(_, index) => setSelectedBrewId(brews[index]?.id ?? null)}
        />
        <CoffeeTastingProfile key={`${coffeeId}-taste`} coffeeId={coffeeId} />
      </div>
      {selectedBrew && <Modal title="Journal entry" onClose={() => setSelectedBrewId(null)}><div className="space-y-3 text-[#2E2025]"><p className="text-sm font-semibold">{new Date(selectedBrew.brewedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · {formatMethod(selectedBrew.method)}</p><p>{selectedBrew.notes || "No tasting notes recorded."}</p><p className="text-sm text-[#2E2025]/65">{selectedBrew.doseG}g coffee · {selectedBrew.waterMl}ml water · {selectedBrew.rating.toFixed(1)}/5</p></div></Modal>}
      {selected && (
        <Modal title={selected.name} onClose={() => setSelectedId(null)}>
          <div className="space-y-4 text-[#2E2025]">
            <p className="text-sm font-semibold">{formatMethod(selected.method)} · 1:{(selected.waterMl / selected.doseG).toFixed(1)}</p>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-[#2E2025]/55">Coffee</dt><dd className="font-semibold">{selected.doseG}g</dd></div>
              <div><dt className="text-[#2E2025]/55">Water</dt><dd className="font-semibold">{selected.waterMl}ml</dd></div>
              <div><dt className="text-[#2E2025]/55">Temperature</dt><dd className="font-semibold">{selected.temperatureC}°C</dd></div>
              <div><dt className="text-[#2E2025]/55">Time</dt><dd className="font-semibold">{Math.floor(selected.targetTimeSec / 60)}:{String(selected.targetTimeSec % 60).padStart(2, "0")}</dd></div>
              <div className="col-span-2"><dt className="text-[#2E2025]/55">Grind</dt><dd className="font-semibold">{selected.grind} · {selected.grindClicks} clicks</dd></div>
            </dl>
            <div className="form-actions">
              <button type="button" className="button button--primary" onClick={() => { onBrew(selected.id); setSelectedId(null); }}>Brew this recipe</button>
              <button type="button" className="button button--secondary" onClick={() => { setEditing(selected); setSelectedId(null); }}>Edit recipe</button>
            </div>
          </div>
        </Modal>
      )}
      {editing && (
        <Modal title={editing === "new" ? "Save a recipe" : "Edit recipe"} onClose={() => setEditing(null)}>
          <RecipeForm coffeeId={coffeeId} recipe={editing === "new" ? undefined : editing} onSaved={() => setEditing(null)} />
        </Modal>
      )}
    </section>
  );
}
