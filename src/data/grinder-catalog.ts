export type Grinder = {
  id: string;
  name: string;
  brand: string;
  drive: "Manual" | "Electric";
  image: string;
};

export const grinderCatalog: Grinder[] = [
  { id: "comandante-c40-walnut", name: "C40 Virginia Walnut", brand: "Comandante", drive: "Manual", image: "/Grinders/comandante_walnut.png" },
  { id: "comandante-c60", name: "C60 Baracuda Nautilus Blue", brand: "Comandante", drive: "Manual", image: "/Grinders/comandante_c60.png" },
  { id: "comandante-x25", name: "X25 Trailmaster Dune", brand: "Comandante", drive: "Manual", image: "/Grinders/x25_trailmaster.png" },
  { id: "1zpresso-q-air", name: "Q Air", brand: "1Zpresso", drive: "Manual", image: "/Grinders/1zpresso_q_air.png" },
  { id: "1zpresso-x-ultra", name: "X Ultra", brand: "1Zpresso", drive: "Manual", image: "/Grinders/1zpresso_x_ultra.png" },
  { id: "kingrinder-k6", name: "K6", brand: "KINGrinder", drive: "Manual", image: "/Grinders/kingrinder_k6.png" },
  { id: "timemore-c2s", name: "Chestnut C2S", brand: "Timemore", drive: "Manual", image: "/Grinders/timemore_c2s.png" },
  { id: "timemore-c3", name: "Chestnut C3", brand: "Timemore", drive: "Manual", image: "/Grinders/timemore_c3.png" },
  { id: "timemore-c3s", name: "Chestnut C3S", brand: "Timemore", drive: "Manual", image: "/Grinders/timemore_c3s.png" },
  { id: "timemore-c5s", name: "Chestnut C5S", brand: "Timemore", drive: "Manual", image: "/Grinders/timemore_c5s.png" },
  { id: "baratza-encore", name: "Encore", brand: "Baratza", drive: "Electric", image: "/Grinders/baratza_encore.png" },
  { id: "baratza-encore-esp", name: "Encore ESP", brand: "Baratza", drive: "Electric", image: "/Grinders/baratza_encore_esp.png" },
  { id: "baratza-sette-30", name: "Sette 30", brand: "Baratza", drive: "Electric", image: "/Grinders/baratza_sette_30.png" },
  { id: "mahlkonig-x54", name: "X54", brand: "Mahlkönig", drive: "Electric", image: "/Grinders/mahlkonig_x54.png" },
];
