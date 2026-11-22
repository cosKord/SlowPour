import { grinderCatalog } from "./grinder-catalog";

export type EquipmentType = "Grinder" | "Brewer" | "Scale" | "Kettle";
export type EquipmentItem = {
  id: string;
  name: string;
  brand: string;
  type: EquipmentType;
  image: string;
  detail?: string;
};

export const equipmentCatalog: EquipmentItem[] = [
  ...grinderCatalog.map((grinder) => ({ ...grinder, type: "Grinder" as const, detail: grinder.drive })),
  { id: "hario-v60", name: "V60 02", brand: "Hario", type: "Brewer", image: "/Brewers/cutouts/v60.png" },
  { id: "aeropress", name: "AeroPress", brand: "AeroPress", type: "Brewer", image: "/Brewers/cutouts/aeropress.png" },
  { id: "chemex-6", name: "6 Cup Chemex", brand: "Chemex", type: "Brewer", image: "/Brewers/cutouts/chemex.png" },
  { id: "french-press", name: "French press", brand: "Generic", type: "Brewer", image: "/Brewers/cutouts/french_press.png" },
  { id: "kalita-wave", name: "Kalita Wave", brand: "Kalita", type: "Brewer", image: "/Brewers/cutouts/kalita.png" },
  { id: "moka-pot", name: "Moka pot", brand: "Generic", type: "Brewer", image: "/Brewers/cutouts/moka.png" },
  { id: "phin", name: "Phin", brand: "Generic", type: "Brewer", image: "/Brewers/cutouts/phin.png" },
  { id: "siphon", name: "Siphon", brand: "Generic", type: "Brewer", image: "/Brewers/cutouts/siphon.png" },
  { id: "south-indian-filter", name: "South Indian filter", brand: "Generic", type: "Brewer", image: "/Brewers/cutouts/south_indian_filter.png" },
  { id: "drip-coffee-maker", name: "Drip coffee maker", brand: "Generic", type: "Brewer", image: "/Brewers/cutouts/drip_coffee_maker.png" },
  { id: "delonghi-dedica", name: "Dedica", brand: "De'Longhi", type: "Brewer", image: "/Brewers/cutouts/delonghi_dedica.png", detail: "Espresso machine" },
  { id: "delonghi-la-specialista", name: "La Specialista", brand: "De'Longhi", type: "Brewer", image: "/Brewers/cutouts/delonghi_la_specialista.png", detail: "Espresso machine" },
  { id: "delonghi-dedica-duo", name: "Dedica Duo", brand: "De'Longhi", type: "Brewer", image: "/Brewers/cutouts/delonghi_dedica_duo.png", detail: "Espresso machine" },
  { id: "timemore-black-mirror", name: "Black Mirror", brand: "Timemore", type: "Scale", image: "/Scales-Kettles-others/timemore_black_mirror.png" },
  { id: "timemore-basic-scale", name: "Basic Scale", brand: "Timemore", type: "Scale", image: "/Scales-Kettles-others/timemore_basic_scale.png" },
  { id: "timemore-basic-3", name: "Basic 3.0", brand: "Timemore", type: "Scale", image: "/Scales-Kettles-others/timemore_basic_3.png" },
  { id: "generic-scale", name: "Coffee scale", brand: "Generic", type: "Scale", image: "/Scales-Kettles-others/generic_scale.png" },
  { id: "fellow-stagg-ekg", name: "Stagg EKG", brand: "Fellow", type: "Kettle", image: "/Scales-Kettles-others/fellow_stagg_ekg.png" },
  { id: "gooseneck-kettle", name: "Gooseneck kettle", brand: "Generic", type: "Kettle", image: "/Scales-Kettles-others/gooseneck_kettle.png" },
];
