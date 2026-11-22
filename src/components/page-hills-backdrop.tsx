"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

type PageVariant = "recipes" | "journal" | "insights" | "equipment" | "settings";
type Layer = { y: number; a: number; p: number; fill: string; opacity?: number };
type ObjectName = "dripper" | "kettle" | "pencil" | "leaf" | "burr" | "moka" | "scale";
type ObjectPlacement = [number, number, ObjectName, number];
type Config = { sky: [string, string]; glow: string; glowAt: [number, number]; ink: string; layers: Layer[]; objects: ObjectPlacement[] };

const configs: Record<PageVariant, Config> = {
  recipes: {
    sky: ["#faf7f2", "#eae0cb"], glow: "#c67249", glowAt: [310, 260], ink: "#5b3426",
    layers: [
      { y: 600, a: 26, p: .4, fill: "#eae0cb", opacity: .78 },
      { y: 690, a: 30, p: 1.5, fill: "#c99b72", opacity: .34 },
      { y: 775, a: 34, p: 2.6, fill: "#c67249", opacity: .22 },
      { y: 855, a: 30, p: 3.7, fill: "#8e9f72", opacity: .29 },
      { y: 930, a: 22, p: 4.8, fill: "#5b3426", opacity: .25 },
    ], objects: [[1, 1260, "kettle", 1.5], [2, 330, "dripper", 1.5]],
  },
  journal: {
    sky: ["#faf7f2", "#eae0ce"], glow: "#c67249", glowAt: [1380, 170], ink: "#623248",
    layers: [
      { y: 620, a: 20, p: .9, fill: "#eae0cb", opacity: .8 },
      { y: 700, a: 26, p: 2, fill: "#c99b72", opacity: .27 },
      { y: 780, a: 30, p: 3.1, fill: "#c67249", opacity: .18 },
      { y: 860, a: 26, p: 4.2, fill: "#623248", opacity: .15 },
      { y: 935, a: 20, p: 5.3, fill: "#623248", opacity: .23 },
    ], objects: [[1, 1130, "pencil", 1.3], [2, 300, "leaf", 1.6], [2, 380, "leaf", 1.1], [3, 1330, "leaf", 1.4]],
  },
  insights: {
    sky: ["#faf7f2", "#eae0cb"], glow: "#623248", glowAt: [1250, 220], ink: "#623248",
    layers: [
      { y: 610, a: 24, p: .2, fill: "#eae0cb", opacity: .75 },
      { y: 700, a: 36, p: 1.3, fill: "#8e9f72", opacity: .22 },
      { y: 785, a: 32, p: 2.4, fill: "#623248", opacity: .19 },
      { y: 860, a: 28, p: 3.5, fill: "#c67249", opacity: .22 },
      { y: 932, a: 20, p: 4.6, fill: "#623248", opacity: .32 },
    ], objects: [],
  },
  equipment: {
    sky: ["#faf7f2", "#eae0cb"], glow: "#c67249", glowAt: [1280, 240], ink: "#5b3426",
    layers: [
      { y: 610, a: 24, p: .6, fill: "#eae0cb", opacity: .74 },
      { y: 695, a: 30, p: 1.7, fill: "#8e9f72", opacity: .25 },
      { y: 780, a: 32, p: 2.8, fill: "#8e9f72", opacity: .34 },
      { y: 858, a: 28, p: 3.9, fill: "#5b3426", opacity: .18 },
      { y: 932, a: 20, p: 5, fill: "#6e8454", opacity: .37 },
    ], objects: [],
  },
  settings: {
    sky: ["#faf7f2", "#eae0cb"], glow: "#c99b72", glowAt: [1300, 200], ink: "#5b3426",
    layers: [
      { y: 720, a: 22, p: .5, fill: "#eae0cb", opacity: .76 },
      { y: 815, a: 26, p: 1.8, fill: "#c99b72", opacity: .17 },
      { y: 905, a: 20, p: 3.2, fill: "#8e9f72", opacity: .23 },
    ], objects: [],
  },
};

const nodeY = (layer: Layer, i: number) => layer.y + layer.a * Math.sin(layer.p + i * 1.7);
const ridgeY = (layer: Layer, x: number) => {
  const i = Math.min(4, Math.max(0, Math.floor(x / 320)));
  const t = Math.max(0, Math.min(1, (x - i * 320) / 320));
  const smooth = t * t * (3 - 2 * t);
  return nodeY(layer, i) * (1 - smooth) + nodeY(layer, i + 1) * smooth;
};
const wavePath = (layer: Layer) => {
  let path = `M0 ${nodeY(layer, 0)}`;
  for (let i = 0; i < 5; i++) path += `C${i * 320 + 160} ${nodeY(layer, i)} ${(i + 1) * 320 - 160} ${nodeY(layer, i + 1)} ${(i + 1) * 320} ${nodeY(layer, i + 1)}`;
  return `${path}V1000H0Z`;
};

function Silhouette({ name }: { name: ObjectName }) {
  switch (name) {
    case "dripper": return <><path d="M-40-100h80l-24 46h-32zM-46-104h92" /><path d="M-30-40h60v32a8 8 0 0 1-8 8h-44a8 8 0 0 1-8-8z" /></>;
    case "kettle": return <><path d="M-45-62h90v52a8 8 0 0 1-8 8h-74a8 8 0 0 1-8-8zM-30-62q30-28 60 0z" /><path d="M-45-44c-30 0-42-18-54-38M45-52c30 0 30 38 0 38" fill="none" strokeWidth="8" /></>;
    case "pencil": return <g transform="rotate(-24)"><rect x="-90" y="-16" width="150" height="16" rx="2" /><path d="M60-16l28 8-28 8z" /></g>;
    case "leaf": return <><path d="M0 0c-10-30 4-60 34-78 8 32-6 62-34 78z" /><path d="M0 0c10-26 20-48 34-78" fill="none" strokeWidth="2" /></>;
    case "burr": return <><circle cy="-56" r="56" fill="none" strokeWidth="10" strokeDasharray="6 8" /><circle cy="-56" r="40" /><circle cy="-56" r="14" fill="#faf7f2" fillOpacity=".5" /></>;
    case "moka": return <><path d="M-30 0l8-52h44l8 52zM-26-54h52l8-62h-68zM-38-118q38-26 76 0z" /><path d="M38-100q34 0 30 34-4 10-22 12" fill="none" strokeWidth="8" /></>;
    case "scale": return <><path d="M-70 0v-40a10 10 0 0 1 10-10h120a10 10 0 0 1 10 10v40z" /><circle cy="-26" r="12" fill="#faf7f2" fillOpacity=".55" /></>;
  }
}

function PreMotif({ variant, ink }: { variant: PageVariant; ink: string }) {
  if (variant === "recipes") return <g fill="none" stroke={ink}>
    {[130, 180, 230, 280].map((r) => <circle key={r} cx="1580" cy="30" r={r} strokeWidth="2" strokeDasharray="2 12" opacity=".2" />)}
    <path d="M1075 520C1040 465 1115 425 1070 365S1100 270 1075 230M1105 540C1070 480 1140 445 1100 390S1130 295 1105 255" strokeWidth="3" opacity=".17" />
    {[0, 1, 2].map((i) => <circle key={i} cx={1010 - i * 9} cy={300 + i * 45} r={5 - i} fill={ink} stroke="none" opacity=".22" />)}
  </g>;
  if (variant === "journal") return <g fill="none" stroke={ink}>
    {Array.from({ length: 17 }, (_, i) => <path key={i} d={`M0 ${60 + 34 * i}H1600`} strokeWidth="1.5" opacity=".075" />)}
    <path d="M150 0V620" stroke="#c67249" opacity=".2" />
    <circle cx="1400" cy="170" r="62" strokeWidth="2" opacity=".19" />
    <circle cx="1400" cy="170" r="55" strokeDasharray="70 18 12 20" opacity=".19" />
  </g>;
  if (variant === "insights") return <g fill="none" stroke={ink}>
    <ellipse cx="240" cy="470" rx="190" ry="60" transform="rotate(-22 240 470)" strokeWidth="2" opacity=".2" />
    {[[1380, 120, 34], [1480, 230, 16], [1260, 90, 12], [150, 100, 18], [260, 190, 9]].map(([x, y, s]) => <path key={`${x}-${y}`} d={`M${x} ${y-s}Q${x} ${y} ${x+s} ${y}Q${x} ${y} ${x} ${y+s}Q${x} ${y} ${x-s} ${y}Q${x} ${y} ${x} ${y-s}Z`} fill={ink} stroke="none" opacity=".22" />)}
  </g>;
  if (variant === "equipment") return null;
  return null;
}

export function PageHillsBackdrop({ variant }: { variant: PageVariant }) {
  const config = configs[variant];
  const id = `page-hills-${variant}`;
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const farDrift = useTransform(scrollY, (value) => reducedMotion ? 0 : value * -.04);
  const middleDrift = useTransform(scrollY, (value) => reducedMotion ? 0 : value * -.065);
  const nearDrift = useTransform(scrollY, (value) => reducedMotion ? 0 : value * -.1);
  const drifts = [farDrift, farDrift, middleDrift, middleDrift, nearDrift];
  return <>
    <defs>
      <linearGradient id={`${id}-sky`} x2="0" y2="1"><stop stopColor={config.sky[0]} /><stop offset="1" stopColor={config.sky[1]} /></linearGradient>
      <radialGradient id={`${id}-glow`}><stop stopColor={config.glow} stopOpacity=".38" /><stop offset="1" stopColor={config.glow} stopOpacity="0" /></radialGradient>
      <linearGradient id={`${id}-mist`} x2="0" y2="1"><stop stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".27" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
      <pattern id={`${id}-dots`} width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.8" fill={config.ink} opacity=".13" /></pattern>
      <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="7" stitchTiles="stitch" /></filter>
    </defs>
    <rect width="1600" height="1000" fill={`url(#${id}-sky)`} />
    <motion.circle cx={config.glowAt[0]} cy={config.glowAt[1]} r="260" fill={`url(#${id}-glow)`} style={{ y: farDrift }} />
    <g className="ambient-pre"><PreMotif variant={variant} ink={config.ink} />{variant === "insights" && <rect width="1600" height="560" fill={`url(#${id}-dots)`} />}</g>
    {config.layers.map((layer, layerIndex) => <motion.g key={layerIndex} style={{ y: drifts[layerIndex] }}>
      {config.objects.filter(([index]) => index === layerIndex).map(([, x, name, scale]) => <g key={`${name}-${x}`} transform={`translate(${x} ${ridgeY(layer, x) + 16}) scale(${scale})`} fill={config.ink} stroke={config.ink} strokeLinecap="round" strokeLinejoin="round" opacity=".28"><Silhouette name={name} /></g>)}
      <path d={wavePath(layer)} fill={layer.fill} opacity={layer.opacity ?? 1} />
      {layerIndex === 0 && <rect y="565" width="1600" height="140" fill={`url(#${id}-mist)`} />}
    </motion.g>)}
    {variant === "journal" && <g><path d="M0 0H190L0 190Z" fill="#fff" opacity=".24" /><path d="M190 0L0 190L120 120Z" fill="#c67249" opacity=".12" /></g>}
    {variant === "insights" && <g fill="none" stroke={config.ink} opacity=".28"><path d={config.layers[1] ? `M0 ${nodeY(config.layers[1],0)-40} ${Array.from({length:5},(_,i) => `C${i*320+160} ${nodeY(config.layers[1],i)-40} ${(i+1)*320-160} ${nodeY(config.layers[1],i+1)-40} ${(i+1)*320} ${nodeY(config.layers[1],i+1)-40}`).join(" ")}` : ""} strokeWidth="3" />{Array.from({length:6},(_,i) => <circle key={i} cx={i*320} cy={nodeY(config.layers[1],i)-40} r="7" fill={config.sky[0]} strokeWidth="2" />)}</g>}
    {variant === "settings" && <g opacity=".48"><path d="M1610 10C1520 60 1460 120 1410 215" fill="none" stroke="#6e8454" strokeWidth="4" /><path d="M1480 90q-70-65-105-10 50 42 105 10M1450 143q55-72 100-30-38 48-100 30M1415 205q-58-42-88 5 51 30 88-5" fill="#8e9f72" /><circle cx="1428" cy="188" r="12" fill="#c67249" /><circle cx="1448" cy="206" r="11" fill="#623248" /></g>}
    <rect width="1600" height="1000" filter={`url(#${id}-grain)`} opacity={variant === "settings" ? ".045" : ".03"} />
  </>;
}

