export type BrewMethod = "v60" | "aeropress" | "moka_pot" | "french_press" | "espresso";
export type BagStatus = "unopened" | "in_rotation" | "finished";

export type Packaging = {
  bagColor: string;
  labelColor: string;
  accentColor: string;
  textColor: string;
};

export type TastingProfile = {
  sweetness: number;
  bitterness: number;
  acidity: number;
  body: number;
  mouthfeel: number;
  finish: number;
};

export type Coffee = {
  id: string;
  name: string;
  roaster: string;
  origin: string;
  process: string;
  roast: string;
  notes: string[];
  description: string;
  tastingProfile?: TastingProfile;
  packaging: Packaging;
};

export type Bag = {
  id: string;
  coffeeId: string;
  startingWeightG: number;
  remainingWeightG: number;
  status: BagStatus;
  roastedAt: string;
};

export type Recipe = {
  id: string;
  name: string;
  method: BrewMethod;
  doseG: number;
  waterMl: number;
  temperatureC: number;
  grind: string;
  favourite: boolean;
};

export type Brew = {
  id: string;
  coffeeId: string;
  recipeId: string;
  brewedAt: string;
  method: BrewMethod;
  doseG: number;
  waterMl: number;
  rating: number;
  notes: string;
};
