import type { Bag, Brew, Coffee, Recipe } from "@/types";

export const coffees: Coffee[] = [
  {
    id: "araku-grand-reserve",
    name: "Grand Reserve",
    roaster: "Araku",
    origin: "Araku Valley, Andhra Pradesh",
    process: "Natural & washed",
    roast: "Medium",
    notes: ["Tropical fruit", "Citrus", "Floral", "Dates"],
    description: "A layered, fruit-forward cup with citrus, florals, and dates.",
    packaging: { bagColor: "#B8A99B", labelColor: "#F9F7EF", accentColor: "#A83246", textColor: "#382838" },
  },
  {
    id: "bili-hu-kalledevarapura",
    name: "Kalledevarapura Estate",
    roaster: "Bili Hu",
    origin: "Chikmagalur, Karnataka",
    process: "Washed",
    roast: "Medium",
    notes: ["Milk chocolate", "Orange"],
    description: "A washed single-estate coffee with a full body and chocolate-citrus notes.",
    packaging: { bagColor: "#D6D4C9", labelColor: "#F9F7EF", accentColor: "#302E2C", textColor: "#302E2C" },
  },
  {
    id: "blue-tokai-amaltas",
    name: "Amaltas Blend",
    roaster: "Blue Tokai",
    origin: "Nelliyampathy and Shevaroy, India",
    process: "Washed + natural",
    roast: "Light",
    notes: ["Blueberry", "Milk chocolate", "Fruity"],
    description: "A light, fruity blend that works well as a pour-over or cold brew.",
    packaging: { bagColor: "#D9B843", labelColor: "#F9F7EF", accentColor: "#2D392F", textColor: "#2D392F" },
  },
  {
    id: "fraction-9-everyday-gold",
    name: "Everyday Gold",
    roaster: "Fraction 9",
    origin: "Aldur, Chikmagalur",
    process: "Washed",
    roast: "Medium",
    notes: ["Toasted almond", "Golden raisin", "Milk chocolate"],
    description: "A smooth daily coffee with a clean finish and mellow sweetness.",
    packaging: { bagColor: "#B7C45A", labelColor: "#F9F7EF", accentColor: "#302E2C", textColor: "#302E2C" },
  },
  {
    id: "grey-soul-mogra",
    name: "Mogra",
    roaster: "Grey Soul",
    origin: "Ratnagiri Estate, Chikmagalur",
    process: "Anaerobic fermented naturals",
    roast: "Light",
    notes: ["Vanilla", "Sweet lime", "Jasmine"],
    description: "A light roast with sweet-lime brightness and expressive jasmine florals.",
    packaging: { bagColor: "#252423", labelColor: "#F5F2EC", accentColor: "#D9C7A1", textColor: "#252423" },
  },
  {
    id: "naivo-attikan-white-mist",
    name: "Attikan White Mist",
    roaster: "Naivo",
    origin: "Biligirirangana Hills, India",
    process: "Washed, double fermented",
    roast: "Medium-dark",
    notes: ["Baker's chocolate", "Cedar", "Roasted nuts"],
    description: "A bold, rounded espresso roast with chocolate, nut, and cedar notes.",
    packaging: { bagColor: "#E9E6DF", labelColor: "#FAF8F3", accentColor: "#27332A", textColor: "#27332A" },
  },
  {
    id: "savorworks-bluepine",
    name: "Bluepine Mooleh Manay Estate",
    roaster: "Savorworks",
    origin: "Mooleh Manay Estate, Coorg",
    process: "Natural carbonic maceration",
    roast: "Light-medium",
    notes: ["Lavender", "Blueberry", "Pineapple", "Prune"],
    description: "A juicy, fruit-led coffee with lifted florals and a silky finish.",
    packaging: { bagColor: "#4A4B35", labelColor: "#F5F0E3", accentColor: "#8D9C64", textColor: "#302E2C" },
  },
];

export const bags: Bag[] = [
  { id: "bag-araku", coffeeId: "araku-grand-reserve", startingWeightG: 250, remainingWeightG: 233, status: "in_rotation", roastedAt: "2026-11-10" },
  { id: "bag-bili-hu", coffeeId: "bili-hu-kalledevarapura", startingWeightG: 250, remainingWeightG: 250, status: "unopened", roastedAt: "2026-11-14" },
  { id: "bag-blue-tokai", coffeeId: "blue-tokai-amaltas", startingWeightG: 250, remainingWeightG: 235, status: "in_rotation", roastedAt: "2026-11-08" },
  { id: "bag-fraction-9", coffeeId: "fraction-9-everyday-gold", startingWeightG: 250, remainingWeightG: 250, status: "unopened", roastedAt: "2026-11-16" },
  { id: "bag-grey-soul", coffeeId: "grey-soul-mogra", startingWeightG: 200, remainingWeightG: 200, status: "unopened", roastedAt: "2026-11-17" },
  { id: "bag-naivo", coffeeId: "naivo-attikan-white-mist", startingWeightG: 250, remainingWeightG: 232, status: "in_rotation", roastedAt: "2026-11-09" },
  { id: "bag-savorworks", coffeeId: "savorworks-bluepine", startingWeightG: 250, remainingWeightG: 250, status: "unopened", roastedAt: "2026-11-18" },
];

export const recipes: Recipe[] = [
  { id: "recipe-1", name: "Bright morning V60", method: "v60", doseG: 15, waterMl: 250, temperatureC: 94, grind: "Medium-fine", favourite: true },
  { id: "recipe-2", name: "Gentle AeroPress", method: "aeropress", doseG: 17, waterMl: 230, temperatureC: 88, grind: "Medium", favourite: true },
  { id: "recipe-3", name: "Sunday moka", method: "moka_pot", doseG: 18, waterMl: 150, temperatureC: 96, grind: "Fine", favourite: false },
  { id: "recipe-4", name: "Classic French press", method: "french_press", doseG: 20, waterMl: 320, temperatureC: 93, grind: "Coarse", favourite: false },
  { id: "recipe-5", name: "Everyday espresso", method: "espresso", doseG: 18, waterMl: 36, temperatureC: 93, grind: "Fine", favourite: false },
];

export const brews: Brew[] = [
  { id: "brew-1", coffeeId: "blue-tokai-amaltas", recipeId: "recipe-1", brewedAt: "2026-11-16T07:40:00", method: "v60", doseG: 15, waterMl: 250, rating: 4.6, notes: "Blueberry sweetness up front, with a milk-chocolate finish." },
  { id: "brew-2", coffeeId: "araku-grand-reserve", recipeId: "recipe-2", brewedAt: "2026-11-15T16:15:00", method: "aeropress", doseG: 17, waterMl: 230, rating: 4.2, notes: "Bright citrus and fruit, with a soft floral aroma." },
  { id: "brew-3", coffeeId: "naivo-attikan-white-mist", recipeId: "recipe-3", brewedAt: "2026-11-13T08:10:00", method: "moka_pot", doseG: 18, waterMl: 150, rating: 3.9, notes: "Rich chocolate and roasted nuts, with a rounded finish." },
];

export const coffeeById = (id: string) => coffees.find((coffee) => coffee.id === id);
export const ratio = (water: number, dose: number) => `1:${(water / dose).toFixed(1)}`;
