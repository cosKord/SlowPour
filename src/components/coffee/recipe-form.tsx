"use client";

import { useDashboard, type JournalRecipe } from "@/components/dashboard-store";
import { formatMethod } from "@/lib/utils";
import type { BrewMethod } from "@/types";
import s from "@/components/dashboard.module.css";
import styles from "./coffee-recipe-folder.module.css";

const methods: BrewMethod[] = ["v60", "aeropress", "moka_pot", "french_press", "espresso"];
const fields = [
  { key: "doseG", label: "Dose (g)", min: 1, max: 100, fallback: 15 },
  { key: "waterMl", label: "Water (ml)", min: 1, max: 1000, fallback: 250 },
  { key: "temperatureC", label: "Temperature (°C)", min: 50, max: 100, fallback: 94 },
  { key: "targetTimeSec", label: "Time (seconds)", min: 1, max: 3600, fallback: 165 },
] as const;

export function RecipeForm({ recipe, coffeeId, onSaved }: {
  recipe?: JournalRecipe;
  coffeeId?: string;
  onSaved: () => void;
}) {
  const store = useDashboard();
  return (
    <form className={`${s.form} ${coffeeId ? styles.recipeForm : ""}`} onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const value = (name: string) => String(data.get(name) ?? "").trim();
      store.saveRecipe({
        ...recipe,
        id: recipe?.id ?? crypto.randomUUID(),
        coffeeId: coffeeId ?? (value("coffee") || undefined),
        name: value("name"), method: value("method") as BrewMethod,
        doseG: Number(data.get("doseG")), waterMl: Number(data.get("waterMl")),
        temperatureC: Number(data.get("temperatureC")), targetTimeSec: Number(data.get("targetTimeSec")),
        grind: value("grind"), grindClicks: Number(data.get("grindClicks")),
        favourite: recipe?.favourite ?? false,
      });
      onSaved();
    }}>
      <label>Recipe name<input name="name" required maxLength={80} defaultValue={recipe?.name ?? ""} /></label>
      {!coffeeId && <label>Coffee<select name="coffee" defaultValue={recipe?.coffeeId ?? ""}><option value="">Any coffee</option>{store.coffees.map((coffee) => <option key={coffee.id} value={coffee.id}>{coffee.name}</option>)}</select></label>}
      <label>Method<select name="method" defaultValue={recipe?.method ?? "v60"}>{methods.map((method) => <option key={method} value={method}>{formatMethod(method)}</option>)}</select></label>
      <div className={coffeeId ? styles.recipeFields : "grid grid-cols-2 gap-3"}>
        {fields.map(({ key, label, min, max, fallback }) => <label key={key}>{label}<input name={key} type="number" min={min} max={max} step={key === "doseG" ? 0.1 : 1} required defaultValue={recipe?.[key] ?? fallback} /></label>)}
      </div>
      <div className={coffeeId ? styles.recipeFields : "grid grid-cols-2 gap-3"}>
        <label>Grind<input name="grind" required maxLength={50} defaultValue={recipe?.grind ?? "Medium-fine"} /></label>
        <label>Grinder clicks<input name="grindClicks" type="number" min="0" max="200" required defaultValue={recipe?.grindClicks ?? 24} /></label>
      </div>
      <div className={s.formActions}><button type="submit" className="button button--primary">Save recipe</button></div>
    </form>
  );
}
