"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { bags, brews, coffees, recipes } from "@/data/seed";
import type { Bag, Brew, Coffee, Recipe } from "@/types";

export type JournalBrew = Brew & {
  temperatureC: number;
  grindClicks: number;
  timeSec: number;
  dialInCue?: string;
  checkpoints?: { label: string; timeSec: number }[];
};
export type JournalRecipe = Recipe & {
  coffeeId?: string;
  grindClicks: number;
  targetTimeSec: number;
};
type State = {
  coffees: Coffee[];
  bags: Bag[];
  brews: JournalBrew[];
  recipes: JournalRecipe[];
  grinderIds: string[];
  equipmentIds: string[];
  tempUnit: "C" | "F";
  defaultDose: number;
  selectedCoffeeId: string;
  grindOverrides: Record<string, number>;
  goToRecipeIds: Record<string, string>;
};
export const journalRecipes: JournalRecipe[] = recipes.map((recipe, index) => ({
  ...recipe,
  grindClicks: [24, 20, 12, 28, 8][index],
  targetTimeSec: [165, 120, 240, 240, 30][index],
}));
const initial: State = {
  coffees,
  bags,
  recipes: journalRecipes,
  grinderIds: ["comandante-c40-walnut"],
  equipmentIds: ["hario-v60", "timemore-black-mirror", "fellow-stagg-ekg"],
  brews: brews.map((brew) => {
    const recipe = journalRecipes.find((item) => item.id === brew.recipeId) ?? journalRecipes[0];
    return {
      ...brew,
      temperatureC: recipe.temperatureC,
      grindClicks: recipe.grindClicks,
      timeSec: recipe.targetTimeSec,
      dialInCue: brew.id === "brew-2" ? "Try one click finer next time (20 → 19 clicks)." : undefined,
    };
  }),
  tempUnit: "C",
  defaultDose: 15,
  selectedCoffeeId: "blue-tokai-amaltas",
  grindOverrides: {},
  goToRecipeIds: {},
};
type Store = State & {
  ready: boolean;
  storageError: string;
  update: (patch: Partial<State>) => void;
  logBrew: (brew: Omit<JournalBrew, "id" | "brewedAt">) => void;
  openBag: (coffee: Coffee, grams: number, roastedAt: string) => void;
  finishBag: (bagId: string) => void;
  saveRecipe: (recipe: JournalRecipe) => void;
  reset: () => void;
  recipeFor: (coffeeId: string) => JournalRecipe;
};
const Context = createContext<Store | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initial);
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    let cancelled = false;
    // The old local snapshot is retained for an explicit import in Settings.
    Promise.resolve().then(async () => {
      if (cancelled) return;
      try {
        const response = await fetch("/api/journal", { cache: "no-store" });
        if (!response.ok) throw new Error("Journal request failed");
        const remote = await response.json();
        const saved = remote.document ? JSON.stringify(remote.document) : null;
        if (saved) {
          const parsed = JSON.parse(saved);
          if (
            Array.isArray(parsed.coffees) &&
            parsed.coffees.length &&
            Array.isArray(parsed.bags) &&
            Array.isArray(parsed.brews)
          ) {
            const savedRecipes = Array.isArray(parsed.recipes) ? parsed.recipes as JournalRecipe[] : [];
            setState({
              ...initial,
              ...parsed,
              bags: (parsed.bags as Bag[]).map((bag) =>
                bag.status === "in_rotation" && bag.remainingWeightG <= 0
                  ? { ...bag, remainingWeightG: 0, status: "finished" as const }
                  : bag,
              ),
              recipes: [
                ...journalRecipes.filter((recipe) => !savedRecipes.some((saved) => saved.id === recipe.id)),
                ...savedRecipes,
              ],
            });
          }
        }
        setLoaded(true);
      } catch {
        setStorageError(
          "Your journal could not be loaded. Changes will not be saved until the connection returns.",
        );
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (!ready || !loaded) return;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/journal", {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ document: state }),
        });
        if (!response.ok) throw new Error("Save failed");
        setStorageError("");
      } catch {
        setStorageError("Changes could not be saved. Please check your connection.");
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [state, ready, loaded]);
  const recipeFor = (coffeeId: string) => {
    const chosen = state.recipes.find((recipe) => recipe.id === state.goToRecipeIds?.[coffeeId] && (!recipe.coffeeId || recipe.coffeeId === coffeeId));
    if (chosen) return chosen;
    const latest = state.brews.find((brew) => brew.coffeeId === coffeeId);
    const recipe =
      state.recipes.find((recipe) => recipe.id === latest?.recipeId) ??
      state.recipes.find((recipe) => recipe.coffeeId === coffeeId) ??
      state.recipes[0] ?? journalRecipes[0];
    return {
      ...recipe,
      doseG: latest ? recipe.doseG : state.defaultDose,
      grindClicks: state.grindOverrides[coffeeId] ?? recipe.grindClicks,
    };
  };
  return (
    <Context.Provider
      value={{
        ...state,
        ready,
        storageError,
        recipeFor,
        saveRecipe: (recipe) =>
          setState((current) => ({
            ...current,
            recipes: current.recipes.some((item) => item.id === recipe.id)
              ? current.recipes.map((item) => item.id === recipe.id ? recipe : item)
              : [...current.recipes, recipe],
          })),
        update: (patch) => setState((current) => ({ ...current, ...patch })),
        reset: () => setState(initial),
        finishBag: (bagId) => setState((current) => ({
          ...current,
          bags: current.bags.map((bag) => bag.id === bagId
            ? { ...bag, status: "finished" as const }
            : bag),
        })),
        logBrew: (input) =>
          setState((current) => {
            const activeBag = current.bags.find((bag) => bag.coffeeId === input.coffeeId && bag.status === "in_rotation");
            if (!activeBag) return current;
            const remaining = Math.max(0, activeBag.remainingWeightG - input.doseG);
            return {
            ...current,
            brews: [
              {
                ...input,
                id: crypto.randomUUID(),
                brewedAt: new Date().toISOString(),
              },
              ...current.brews,
            ],
            bags: current.bags.map((bag) =>
              bag.id === activeBag.id
                ? {
                    ...bag,
                    remainingWeightG: remaining,
                    status: remaining === 0 ? "finished" as const : "in_rotation" as const,
                  }
                : bag,
            ),
          };
          }),
        openBag: (coffee, grams, roastedAt) =>
          setState((current) => ({
            ...current,
            coffees: [...current.coffees, coffee],
            selectedCoffeeId: coffee.id,
            bags: [
              ...current.bags,
              {
                id: crypto.randomUUID(),
                coffeeId: coffee.id,
                startingWeightG: grams,
                remainingWeightG: grams,
                roastedAt,
                status: "in_rotation",
              },
            ],
          })),
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useDashboard() {
  const context = useContext(Context);
  if (!context) throw new Error("DashboardProvider is required");
  return context;
}

export function temperature(value: number, unit: "C" | "F") {
  return unit === "F" ? `${Math.round((value * 9) / 5 + 32)}°F` : `${value}°C`;
}

export function duration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
