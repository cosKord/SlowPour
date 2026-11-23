import type { Coffee } from "@/types";

// Fictional display-only bags for the public landing page. Never add these to a user's journal.
export const landingCoffees: Coffee[] = [
  {
    id: "sample-attikan",
    name: "Attikan Estate",
    roaster: "Sample Roastery",
    origin: "Karnataka, India",
    process: "Washed",
    roast: "Medium",
    notes: ["Dark chocolate", "Fig", "Roasted almond"],
    description: "A rounded, quietly sweet cup built for slow mornings.",
    packaging: { bagColor: "#C67249", labelColor: "#F9F7EF", accentColor: "#382838", textColor: "#382838" },
  },
  {
    id: "sample-kibingo",
    name: "Kibingo Hills",
    roaster: "Field Notes Coffee",
    origin: "Kayanza, Burundi",
    process: "Natural",
    roast: "Light",
    notes: ["Red currant", "Cacao", "Black tea"],
    description: "Juicy red fruit with a tea-like finish and a cocoa undertone.",
    packaging: { bagColor: "#A2A76D", labelColor: "#382838", accentColor: "#EAE0CB", textColor: "#F9F7EF" },
  },
  {
    id: "sample-el-paraiso",
    name: "El Paraíso",
    roaster: "Quiet Sun",
    origin: "Huila, Colombia",
    process: "Honey",
    roast: "Light",
    notes: ["Apricot", "Caramel", "Jasmine"],
    description: "Floral and honeyed, with a soft apricot brightness.",
    packaging: { bagColor: "#382838", labelColor: "#EAE0CB", accentColor: "#C67249", textColor: "#382838" },
  },
  {
    id: "sample-konga",
    name: "Konga",
    roaster: "Common Ground",
    origin: "Yirgacheffe, Ethiopia",
    process: "Washed",
    roast: "Light",
    notes: ["Bergamot", "Peach", "Honey"],
    description: "A lifted, aromatic cup with a clean stone-fruit finish.",
    packaging: { bagColor: "#D8DFC7", labelColor: "#5B3426", accentColor: "#C67249", textColor: "#F9F7EF" },
  },
];
