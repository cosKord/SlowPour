"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Check, MoreHorizontal, PackageCheck } from "lucide-react";
import { CoffeeBagArt } from "@/components/coffee/coffee-bag-art";
import { CoffeeBeanBackdrop } from "@/components/coffee/coffee-bean-backdrop";
import { CoffeeRecipeFolder } from "@/components/coffee/coffee-recipe-folder";
import { BrewTimer, LogBrew, Modal, type BrewSetup } from "@/components/dashboard-dialogs";
import { useDashboard } from "@/components/dashboard-store";
import type { Coffee } from "@/types";

const ease = [0.22, 1, 0.36, 1] as const;

function splitCoffeeName(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length < 2) return { line1: name, line2: "" };
  return { line1: words.slice(0, -1).join(" "), line2: words.at(-1) ?? "" };
}

function methodName(method: string) {
  return { v60: "V60", aeropress: "AeroPress", moka_pot: "Moka pot", french_press: "French press", espresso: "Espresso" }[method] ?? method;
}

function CoffeeHero({ coffee, onBrew, canBrew }: { coffee: Coffee; onBrew: () => void; canBrew: boolean }) {
  const { line1, line2 } = splitCoffeeName(coffee.name);
  const reduceMotion = useReducedMotion();
  return (
    <div className="relative isolate mx-auto flex h-[370px] w-[340px] max-w-full flex-col justify-between p-7 sm:h-[510px] sm:w-[490px] sm:p-11">
      <div className="absolute inset-0 -z-10"><CoffeeBeanBackdrop coffee={coffee} /></div>
      <div className="relative z-10">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.16em] text-[#2E2025]/65 sm:text-xs">{coffee.roaster} · {coffee.origin}</p>
        <motion.h1 initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: .36, ease }} className={`max-w-full break-words font-extrabold leading-[.86] tracking-[-.05em] text-[#2E2025] ${line1.length > 14 ? "text-4xl sm:text-6xl" : "text-6xl sm:text-[82px]"}`}>{line1}</motion.h1>
      </div>
      <motion.div initial={{ opacity: 0, y: 18, rotate: 11, scale: .95 }} animate={{ opacity: 1, y: 0, rotate: 7, scale: 1 }} whileHover={!reduceMotion ? { rotate: 5, y: -4, scale: 1.015, transition: { duration: .38, ease } } : undefined} transition={{ duration: .55, ease }} className="relative z-20 mx-auto -mb-8 -mt-8 w-44 drop-shadow-[0_24px_32px_rgba(46,32,37,.22)] sm:-mb-12 sm:-mt-12 sm:w-56">
        <CoffeeBagArt coffee={coffee} className="h-auto w-full" />
      </motion.div>
      <motion.p initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 14 }} transition={{ duration: .4, delay: .05, ease }} className={`coffee-name pointer-events-none relative z-30 -mt-2 mb-3 pr-1 text-right font-extrabold leading-[.85] tracking-[-.05em] text-[#3E2231] drop-shadow-sm ${line2 ? "text-5xl sm:text-[74px]" : "text-2xl"}`}>{line2 || coffee.origin.split(",")[0]}</motion.p>
      <div className="relative z-40 -mb-10 px-2 sm:-mb-12">
        <button type="button" onClick={onBrew} disabled={!canBrew} style={{ color: "#fff" }} className="w-full rounded-full border border-white/40 bg-[#3E2231]/90 px-5 py-4 font-semibold shadow-[0_12px_30px_rgba(46,32,37,.24)] backdrop-blur-xl transition hover:bg-[#3E2231] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3E2231]">{canBrew ? "Brew this coffee" : "No open bag"}</button>
      </div>
    </div>
  );
}

export default function CoffeeDetailPage({ params }: { params: Promise<{ coffeeId: string }> }) {
  const { coffeeId } = use(params);
  const store = useDashboard();
  const [timer, setTimer] = useState(false);
  const [brewingRecipeId, setBrewingRecipeId] = useState<string | undefined>();
  const [brewSetup, setBrewSetup] = useState<BrewSetup | undefined>();
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [openedAt] = useState(() => Date.now());
  if (!store.ready) return null;
  const coffee = store.coffees.find((item) => item.id === coffeeId);
  if (!coffee) notFound();

  const bag = store.bags.find((item) => item.coffeeId === coffeeId && item.status === "in_rotation");
  const finishedCount = store.bags.filter((item) => item.coffeeId === coffeeId && item.status === "finished").length;
  const history = store.brews.filter((brew) => brew.coffeeId === coffeeId);
  const recipe = store.recipeFor(coffeeId);
  const availableRecipes = store.recipes.filter((item) => !item.coffeeId || item.coffeeId === coffeeId);
  const latest = history[0];
  const avgRating = history.length ? (history.reduce((sum, brew) => sum + brew.rating, 0) / history.length).toFixed(1) : null;
  const remaining = bag?.remainingWeightG ?? 0;
  const total = bag?.startingWeightG ?? 0;
  const percent = total ? Math.min(100, Math.round(remaining / total * 100)) : 0;
  const daysOffRoast = bag ? Math.max(0, Math.floor((openedAt - new Date(`${bag.roastedAt}T00:00:00`).getTime()) / 86400000)) : null;
  const shelf = store.bags.filter((item) => item.status !== "finished").map((item) => ({ bag: item, coffee: store.coffees.find((entry) => entry.id === item.coffeeId) })).filter((item) => item.coffee);

  return (
    <div className="mx-auto max-w-5xl pb-12 text-[#2E2025]">
      <Link href="/app/coffees" className="inline-flex items-center gap-2 text-sm font-medium hover:underline"><ArrowLeft size={16} /> Back to shelf</Link>
      <section className="mt-8 grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 lg:col-span-6">
          <AnimatePresence mode="wait"><motion.div key={coffee.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .25 }}><CoffeeHero coffee={coffee} canBrew={Boolean(bag)} onBrew={() => { setBrewingRecipeId(undefined); setTimer(true); }} /></motion.div></AnimatePresence>
        </div>
        <div className="rounded-[28px] border border-white/80 bg-[#FAF7F2]/55 p-5 text-[#2E2025] shadow-[0_18px_45px_rgba(46,32,37,.14),inset_0_1px_0_rgba(255,255,255,.7)] backdrop-blur-2xl sm:p-7 lg:col-span-6">
          <p className="inline-flex rounded-full bg-[#D7DDD0] px-3.5 py-1.5 text-xs font-semibold text-[#2E2025]">{daysOffRoast === null ? "Roast date unavailable" : `${daysOffRoast}d off roast · ${daysOffRoast < 21 ? "Fresh" : "Rested"}`}</p>
          {coffee.description?.trim() && <p className="mt-5 text-[clamp(1.35rem,2.3vw,1.8rem)] italic leading-[1.35] tracking-[-.02em]">“{coffee.description.trim()}”</p>}
          <p className="mt-4 text-sm leading-6 text-[#2E2025]/70">{coffee.notes.join(" · ")}</p>

          <div className="mt-5 rounded-[22px] bg-[#F7F2E8] p-5">
            <div className="grid grid-cols-3 divide-x divide-[#2E2025]/15">
              <div className="pr-3"><strong className="block text-[clamp(1.6rem,3vw,2.25rem)] font-bold leading-none tabular-nums">{remaining}g</strong><span className="mt-2 block text-[11px] leading-4 text-[#2E2025]/65">of {total}g · ~{recipe.doseG ? Math.floor(remaining / recipe.doseG) : 0} cups</span></div>
              <div className="px-3"><strong className="block text-[clamp(1.6rem,3vw,2.25rem)] font-bold leading-none tabular-nums">{history.length}</strong><span className="mt-2 block text-[11px] text-[#2E2025]/65">brews</span></div>
              <div className="pl-3"><strong className="block text-[clamp(1.6rem,3vw,2.25rem)] font-bold leading-none tabular-nums">{avgRating ?? "—"}</strong><span className="mt-2 block text-[11px] text-[#2E2025]/65">avg ★</span></div>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#2E2025]/15" role="meter" aria-label="Coffee remaining" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><div className={`h-full rounded-full ${percent <= 35 ? "bg-[#C67249]" : "bg-[#879B79]"}`} style={{ width: `${percent}%` }} /></div>
            <div className="mt-3 flex min-h-9 items-center justify-between gap-3 text-xs text-[#2E2025]/60"><span>{finishedCount ? `${finishedCount} finished ${finishedCount === 1 ? "bag" : "bags"}` : ""}</span>{bag && <button type="button" aria-label="Finish this bag" title="Finish this bag" onClick={() => store.finishBag(bag.id)} className="grid size-9 place-items-center rounded-full border border-[#3E2231]/20 bg-white/55 text-[#3E2231] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3E2231]"><PackageCheck size={17} strokeWidth={1.8} aria-hidden="true" /></button>}</div>
          </div>

          <div className="mt-4 rounded-[22px] bg-[#F7F2E8] p-5">
            <div className="flex items-center justify-between gap-3"><p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#2E2025]/60">Go-to recipe</p><button type="button" aria-label="Change go-to recipe" title="Change go-to recipe" onClick={() => setShowRecipePicker(true)} className="grid size-8 place-items-center rounded-full border border-[#3E2231]/20 bg-white/55 text-[#3E2231] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3E2231]"><MoreHorizontal size={18} aria-hidden="true" /></button></div>
            <h2 className="mt-2 text-lg font-bold">{recipe.name}</h2>
            <p className="mt-1 text-sm text-[#2E2025]/55">{methodName(recipe.method)} · 1:{(recipe.waterMl / recipe.doseG).toFixed(1)}</p>
            <dl className="mt-5 grid grid-cols-4 gap-2 tabular-nums"><div><dt className="text-[11px] text-[#2E2025]/60">Dose</dt><dd className="mt-1 text-sm font-semibold">{recipe.doseG}g</dd></div><div><dt className="text-[11px] text-[#2E2025]/60">Water</dt><dd className="mt-1 text-sm font-semibold">{recipe.waterMl}ml</dd></div><div><dt className="text-[11px] text-[#2E2025]/60">Temp</dt><dd className="mt-1 text-sm font-semibold">{recipe.temperatureC}°C</dd></div><div><dt className="text-[11px] text-[#2E2025]/60">Time</dt><dd className="mt-1 text-sm font-semibold">{Math.floor(recipe.targetTimeSec / 60)}:{String(recipe.targetTimeSec % 60).padStart(2, "0")}</dd></div></dl>
            <p className="mt-4 border-t border-[#2E2025]/15 pt-3 text-sm text-[#3E2231]">{latest?.recipeId === recipe.id && latest.dialInCue ? latest.dialInCue : `${recipe.grindClicks} clicks · ${recipe.grind} grind`}</p>
          </div>
        </div>
      </section>
      <CoffeeRecipeFolder coffeeId={coffeeId} onBrew={(recipeId) => { if (!bag) return; setBrewingRecipeId(recipeId); setTimer(true); }} />
      {showRecipePicker && <Modal title="Choose go-to recipe" onClose={() => setShowRecipePicker(false)}>
        <div className="space-y-3 text-[#2E2025]">
          <p className="text-sm text-[#2E2025]/65">Choose which recipe appears here for {coffee.name}.</p>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {availableRecipes.map((item) => <button key={item.id} type="button" aria-pressed={store.goToRecipeIds?.[coffeeId] === item.id} onClick={() => { store.update({ goToRecipeIds: { ...store.goToRecipeIds, [coffeeId]: item.id } }); setShowRecipePicker(false); }} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#3E2231]/10 bg-[#F7F2E8] px-4 py-3 text-left transition hover:border-[#3E2231]/30 hover:bg-[#F1E8DC]"><span><strong className="block text-sm">{item.name}</strong><small className="mt-1 block text-[#2E2025]/60">{methodName(item.method)} · {item.doseG}g / {item.waterMl}ml</small></span>{store.goToRecipeIds?.[coffeeId] === item.id && <Check size={18} className="shrink-0 text-[#3E2231]" aria-hidden="true" />}</button>)}
          </div>
        </div>
      </Modal>}
      {shelf.length > 0 && <section className="mt-20 border-t border-[#2E2025]/10 pt-6"><h2 className="mb-5 text-lg font-bold">On your shelf</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{shelf.map(({ bag: item, coffee: other }) => other && <Link key={item.id} href={`/app/coffees/${other.id}`} aria-current={other.id === coffeeId ? "page" : undefined} className="flex items-center gap-3 rounded-2xl bg-[#F7F2E8] p-3 transition hover:-translate-y-0.5"><CoffeeBagArt coffee={other} tilt={4} className="h-16 w-12 shrink-0" /><span className="min-w-0 flex-1"><strong className="coffee-name block truncate text-sm">{other.name}</strong><small className="tabular-nums text-[#2E2025]/65">{item.remainingWeightG}g · {Math.round(item.remainingWeightG / item.startingWeightG * 100)}%</small></span><span className="text-xs font-semibold">{other.id === coffeeId ? "Viewing" : "Open →"}</span></Link>)}</div></section>}
      {timer && <BrewTimer coffeeId={coffeeId} recipeId={brewingRecipeId} onClose={() => setTimer(false)} onLog={(seconds, setup) => { setTimer(false); setElapsed(seconds); setBrewSetup(setup); }} />}
      {elapsed !== null && <LogBrew coffeeId={coffeeId} initialRecipeId={brewingRecipeId} initialSetup={brewSetup} elapsed={elapsed} onClose={() => setElapsed(null)} onSaved={() => { setElapsed(null); setBrewingRecipeId(undefined); setBrewSetup(undefined); }} />}
    </div>
  );
}
