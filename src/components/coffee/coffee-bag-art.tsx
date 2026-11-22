"use client";

import { useState } from "react";
import Image from "next/image";
import type { Coffee } from "@/types";
import { cn } from "@/lib/utils";

const blueTokaiBags: Record<string, string> = {
  "Amaltas Blend": "amaltas",
  "Attikan Estate": "attikan",
  "Baarbara Estate": "baarbara",
  "Dhak Blend": "dhak",
  "Elkhill Estates": "elkhill",
  "French Roast": "french",
  "Kalledevarapura Estate": "kalledevarapura",
  "Kolli Berri Estate": "kolli_berri",
  "Krishnagiri Estate": "krishnagiri",
  "Monsoon Malabar Hoysala Estate": "monsoon_malabar",
  "Sandalwood Estate": "sandalwood",
  "Silver Oak Café Blend": "silver_oak",
  "Silver Oak Blend": "silver_oak",
  "St. Joseph Estate": "st_joseph",
  "Unakki Estate": "unakki",
  "Vienna Roast": "vienna",
  "Yelnoorkhan Estate": "yelnoorkhan",
};

const naivoBags: Record<string, string> = {
  "Attikan White Mist": "attikan_white_mist",
  "Balanoor Chandragiri Washed": "balanoor_chandragiri",
  "Balanoor Selection 6 Washed": "balanoor_sel_6",
  "Balanoor Vontekad": "balanoor_vontekad",
  "Currant Affairs": "currant_affairs",
  "Dunduga Naturals": "dunduga_naturals",
  "Elkhill Estates Anaerobic Washed": "elkhill_aw",
  "Finca Las Brisas Geisha": "finca_las_brisas",
  "Green Apple Express": "green_apple_express",
  "Gulmi BTC Washed": "gulmi_btc",
  "Harley Kaapi Royale": "harley_kaapi_royale",
  "Mango Moonshine": "mango_moonshine",
  "Meadow – Kerehaklu 50H Cultured Sequential Washed": "meadow",
  "Monsoon Malabar AA": "monsoon_malabar",
  "Mooley Manay Honey": "mooley_manay_honey",
  "Nectar – Kerehaklu 66H Mosto Inoculated Naturals": "nectar",
  "Pichia Parables": "pichia_parables",
  "Ratnagiri Estate – Culture Naturals Strawberry": "ratnagiri_strawberry",
  "Solo – Kerehaklu 46H Cultured Peaberry Washed": "solo",
  "Unakki Estate Washed": "unakki_washed",
  "Venkids Valley Washed": "venkids_valley",
  "Yelnoorkhan Estate Anaerobic Washed": "yelnoorkhan_aw",
};

const catalogCoffeeBags: Record<string, string> = {
  "Araku:grand_reserve": "/coffee_bags/Araku/grand_reserve.png",
  "Araku:high_altitude": "/coffee_bags/Araku/high_altitude.png",
  "Araku:micro_climate": "/coffee_bags/Araku/micro_climate.png",
  "Araku:selection": "/coffee_bags/Araku/selection.png",
  "Araku:signature": "/coffee_bags/Araku/signature.png",
  "Bili Hu:80_20_arabica_robusta_blend": "/coffee_bags/Bili%20Hu/arabica_robusta_blend.png",
  "Bili Hu:anaerobic_arabica_naturals": "/coffee_bags/Bili%20Hu/anaerobic_naturals.png",
  "Bili Hu:arabica_blend_dark_roast": "/coffee_bags/Bili%20Hu/arabica_blend_dark.png",
  "Bili Hu:kalledevarapura_estate": "/coffee_bags/Bili%20Hu/kalledevarapura_estate.png",
  "Bili Hu:wild_fig_co_ferment": "/coffee_bags/Bili%20Hu/wild_fig_coferment.png",
  "Fraction 9:everyday_gold": "/coffee_bags/Fraction%209/everyday_gold.png",
  "Fraction 9:fermented_washed_bale_thota": "/coffee_bags/Fraction%209/fermented_washed_bale_thota.png",
  "Fraction 9:funk_club_bale_thota": "/coffee_bags/Fraction%209/funk_club_bale_thota.png",
  "Fraction 9:udayagiri_fruit_theory_naturals": "/coffee_bags/Fraction%209/udayagiri_fruit_theory.png",
  "Fraction 9:velvet_cask": "/coffee_bags/Fraction%209/velvet_cask.png",
  "Grey Soul:mogra": "/coffee_bags/Grey%20Soul/mogra.png",
  "Grey Soul:mizoram_reserve": "/coffee_bags/Grey%20Soul/mizoram_reserve.png",
  "Grey Soul:odisha_naturals": "/coffee_bags/Grey%20Soul/odisha_naturals.png",
  "Grey Soul:shevaroys_washed": "/coffee_bags/Grey%20Soul/shevaroys_washed.png",
  "Grey Soul:summer_in_kodaikanal": "/coffee_bags/Grey%20Soul/summer_in_kodaikanal.png",
  "Grey Soul:supernaturals": "/coffee_bags/Grey%20Soul/supernaturals.png",
  "Grey Soul:the_yellow_lot": "/coffee_bags/Grey%20Soul/yellow_lot.png",
  "Savorworks:bluepine_mooleh_manay_estate": "/coffee_bags/Savorworks/bluepine_mooleh_manay.png",
  "Savorworks:boss_s_wife_house_blend": "/coffee_bags/Savorworks/boss_wife.png",
  "Savorworks:fruits_bomb": "/coffee_bags/Savorworks/fruits_bomb.png",
  "Savorworks:heisenberg_season_7": "/coffee_bags/Savorworks/heisenberg.png",
  "Savorworks:honey_i_m_nuts": "/coffee_bags/Savorworks/honey_im_nuts.png",
  "Savorworks:riverdale": "/coffee_bags/Savorworks/riverdale.png",
  "Savorworks:vienna_dark_roast": "/coffee_bags/Savorworks/vienna_dark_roast.png",
};

function coffeeNameKey(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function CoffeeBagArt({ coffee, className, tilt = 0 }: { coffee: Coffee; className?: string; tilt?: number }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const blueTokaiBag = coffee.roaster === "Blue Tokai" ? blueTokaiBags[coffee.name] : undefined;
  const naivoBag = coffee.roaster === "Naivo" ? naivoBags[coffee.name] : undefined;
  const catalogBag = catalogCoffeeBags[`${coffee.roaster}:${coffeeNameKey(coffee.name)}`];
  const imageSrc = blueTokaiBag
    ? `/coffee_bags/BT/${blueTokaiBag}.png`
    : naivoBag
      ? `/coffee_bags/Naivo/${naivoBag}.png`
      : catalogBag ?? null;
  if (imageSrc && failedSrc !== imageSrc) {
    return (
      <Image
        src={imageSrc}
        alt={`${coffee.name} bag by ${coffee.roaster}`}
        width={220}
        height={300}
        className={cn("coffee-bag-art object-contain", className)}
        style={{ rotate: `${tilt}deg` }}
        onError={() => setFailedSrc(imageSrc)}
      />
    );
  }
  const p = coffee.packaging;
  return (
    <svg className={cn("coffee-bag-art", className)} style={{ rotate: `${tilt}deg` }} viewBox="0 0 220 300" role="img" aria-label={`Illustrated bag of ${coffee.name} by ${coffee.roaster}`}>
      <path d="M38 35 55 16h110l17 19 12 232c1 10-7 18-17 18H43c-10 0-18-8-17-18L38 35Z" fill={p.bagColor}/>
      <path d="M39 38h142l3 56c-22-9-38-12-65-8-31 4-52 2-75-8Z" fill={p.accentColor} opacity=".16"/>
      <path d="m42 35 8-11 8 11 8-11 8 11 8-11 8 11 8-11 8 11 8-11 8 11 8-11 8 11 8-11 8 11 8-11 8 11 8-11 8 11" fill="none" stroke={p.accentColor} strokeWidth="7" strokeLinejoin="round"/>
      <path d="M58 84c0-10 8-18 18-18h68c10 0 18 8 18 18v125c0 10-8 18-18 18H76c-10 0-18-8-18-18V84Z" fill={p.labelColor}/>
      <text x="110" y="95" textAnchor="middle" fill={p.textColor} fontSize="8" fontFamily="var(--font-sans)" fontWeight="700" letterSpacing="2">{coffee.roaster.toUpperCase()}</text>
      <text x="110" y="132" textAnchor="middle" fill={p.textColor} fontSize={coffee.name.length > 14 ? "14" : "17"} fontFamily="var(--font-fraunces), Georgia, serif" fontWeight="700">{coffee.name}</text>
      <text x="110" y="157" textAnchor="middle" fill={p.textColor} fontSize="9" fontFamily="var(--font-sans)">{coffee.origin}</text>
      <path d="M81 181c14-14 44-14 58 0-17 5-19 27-29 27s-12-22-29-27Z" fill={p.accentColor}/>
      {[0,1,2,3,4].map((dot)=><circle key={dot} cx={86+dot*12} cy="246" r="4" fill={dot < (coffee.roast === "Medium" ? 3 : 2) ? p.textColor : p.accentColor} opacity={dot < (coffee.roast === "Medium" ? 3 : 2) ? 1 : .3}/>) }
    </svg>
  );
}
