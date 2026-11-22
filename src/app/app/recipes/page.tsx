"use client";

import { useState } from "react";
import JournalSpreadCarousel, {
  type JournalSpread,
} from "@/components/ui/journal-spread-carousel";
import { ratio } from "@/data/seed";
import { duration, useDashboard } from "@/components/dashboard-store";
import { Modal } from "@/components/dashboard-dialogs";
import { RecipeForm } from "@/components/coffee/recipe-form";
import { equipmentCatalog } from "@/data/equipment-catalog";
import { formatMethod } from "@/lib/utils";
import type { BrewMethod } from "@/types";

const brewerByMethod: Record<BrewMethod, string> = {
  v60: "hario-v60",
  aeropress: "aeropress",
  moka_pot: "moka-pot",
  french_press: "french-press",
  espresso: "delonghi-dedica",
};

function recipeSpread(recipe: ReturnType<typeof useDashboard>["recipes"][number]): JournalSpread {
  return {
  id: recipe.id,
  label: recipe.name,
  paper: "#f3ead8",
  decorativeImage: equipmentCatalog.find((item) => item.id === brewerByMethod[recipe.method])?.image,
  fieldLog: {
    date: "Brew recipe",
    coffee: recipe.name,
    origin: formatMethod(recipe.method),
    method: formatMethod(recipe.method),
    rating: "",
    dose: `${recipe.doseG}g / ${recipe.waterMl}ml`,
    ratio: ratio(recipe.waterMl, recipe.doseG),
    grind: `${recipe.grindClicks} clicks · ${recipe.grind}`,
    temperatureAndTime: `${recipe.temperatureC}°C · ${duration(recipe.targetTimeSec)}`,
    notesLabel: "Brew method",
    tastingNotes: formatMethod(recipe.method),
    nextLabel: "Recipe status",
    nextBrew: recipe.favourite ? "Saved as a favourite." : "Ready to brew.",
  },
  };
}

export default function RecipesPage() {
  const store = useDashboard();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const entries = store.recipes.map(recipeSpread);
  return (
    <>
      <header className="page-head">
        <div>
          <h1>Recipes</h1>
          <p>
            Your collection of brewing starting points, laid out one spread at a
            time.
          </p>
        </div>
      </header>
      {entries.length ? <JournalSpreadCarousel
        key={entries.map((entry) => entry.id).join("|")}
        spreads={entries}
        title="The recipe notebook"
        meta={`${entries.length} recipes`}
        autoPlay={false}
        showFloor={false}
        height="clamp(600px, 72vw, 800px)"
        className="mx-auto max-w-[1360px]"
        variant="recipe"
        layout="field-log"
        initialIndex={Math.min(currentIndex, entries.length - 1)}
        onIndexChange={setCurrentIndex}
        onAction={(action, index) => {
          if (action === "add") { setIsAdding(true); return; }
          if (action !== "delete") return;
          const recipe = store.recipes[index];
          if (!recipe || !window.confirm(`Delete ${recipe.name} from your recipe notebook? Your logged brews will stay in the journal.`)) return;
          setCurrentIndex(Math.max(0, Math.min(index, store.recipes.length - 2)));
          store.update({ recipes: store.recipes.filter((item) => item.id !== recipe.id) });
        }}
      /> : <div className="mx-auto max-w-[1360px] rounded-3xl bg-[#faf7f2a8] p-10 text-center"><h2 className="text-2xl font-semibold">Your recipe notebook is empty</h2><p className="mt-3 text-muted">Recipes you save will appear here. You can restore the demo recipes from Settings.</p><button type="button" className="button button--primary mt-5" onClick={() => setIsAdding(true)}>+ Add recipe</button></div>}
      {isAdding && <Modal title="Add a recipe" onClose={() => setIsAdding(false)}><RecipeForm onSaved={() => setIsAdding(false)} /></Modal>}
    </>
  );
}
