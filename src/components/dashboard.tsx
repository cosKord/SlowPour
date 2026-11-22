"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { BrewTimer, LogBrew, OpenBag, type BrewSetup } from "./dashboard-dialogs";
import { duration, temperature, useDashboard } from "./dashboard-store";
import { BrewMethodIcon } from "./brew-method-icon";
import { useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Star, X } from "lucide-react";
import { CoffeeBagArt } from "@/components/coffee/coffee-bag-art";

import { formatMethod } from "@/lib/utils";
import s from "./dashboard.module.css";

export function Dashboard() {
  const store = useDashboard();
  if (!store.bags.some((bag) => bag.status === "in_rotation")) {
    return (
      <div className={s.dashboard} data-surface="glass">
        <header className={s.header}><div><p>Your shelf</p><h1>Ready for a new bag?</h1><p>All your open bags are finished. Your brew history is saved.</p></div></header>
        <div className="panel"><h2>No bags in rotation</h2><p className="mt-3 text-sm text-muted">Open a new bag to see it here and start logging brews.</p><Link className="button button--primary mt-5" href="/app/coffees/new">Open a new bag</Link></div>
      </div>
    );
  }
  return <ActiveDashboard />;
}

function ActiveDashboard() {
  const store = useDashboard();
  const { bags, brews, recipeFor } = store;
  const coffeeById = (id: string) =>
    store.coffees.find((coffee) => coffee.id === id);
  const active = bags.filter((bag) => bag.status === "in_rotation");
  const selected = Math.max(
    0,
    active.findIndex((bag) => bag.coffeeId === store.selectedCoffeeId),
  );
  const setSelected = (index: number) =>
    store.update({ selectedCoffeeId: active[index].coffeeId });
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [method, setMethod] = useState("all");
  const [modal, setModal] = useState<"timer" | "log" | "bag" | null>(null);
  const [elapsed, setElapsed] = useState<number | undefined>();
  const [brewSetup, setBrewSetup] = useState<BrewSetup | undefined>();
  const [toast, setToast] = useState("");
  const heroRef = useRef<HTMLElement>(null);
  const rotationCardRef = useRef<HTMLElement>(null);
  const bag = active[selected];
  const coffee = coffeeById(bag.coffeeId)!;
  const recipe = recipeFor(coffee.id);
  useLayoutEffect(() => {
    const hero = heroRef.current;
    const rotationCard = rotationCardRef.current;
    if (!hero || !rotationCard) return;

    const matchHeight = () => {
      rotationCard.style.height = `${hero.getBoundingClientRect().height}px`;
    };
    matchHeight();
    const observer = new ResizeObserver(matchHeight);
    observer.observe(hero);
    return () => observer.disconnect();
  }, [coffee.id]);
  const end = new Date().getTime();
  const weekly = brews.filter(
    (brew) => new Date(brew.brewedAt).getTime() > end - 7 * 86400000,
  );
  const dose = weekly.reduce((sum, brew) => sum + brew.doseG, 0);
  const average =
    weekly.reduce((sum, brew) => sum + brew.rating, 0) / (weekly.length || 1);
  const days = Array.from(
    { length: 7 },
    (_, index) =>
      weekly.filter(
        (brew) =>
          Math.floor((end - new Date(brew.brewedAt).getTime()) / 86400000) ===
          6 - index,
      ).length,
  );
  const cue = brews.find(
    (brew) =>
      Boolean(brew.dialInCue) &&
      active.some((bag) => bag.coffeeId === brew.coffeeId),
  );
  const roastAge = (date: string) =>
    Math.max(0, Math.floor((end - new Date(date).getTime()) / 86400000));
  return (
    <div className={s.dashboard} data-surface="glass">
      <header className={s.header}>
        <div>
          <p>
            {new Date(end).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1>Good evening, user.</h1>
          <p>Your shelf is ready for one more thoughtful cup.</p>
        </div>
        <div className={s.actions}>
          <button
            className="button button--primary"
            onClick={() => {
              setElapsed(undefined);
              setBrewSetup(undefined);
              setModal("log");
            }}
          >
            Log a brew <ArrowRight size={16} />
          </button>
        </div>
      </header>
      <div className={s.primary}>
        <motion.section
          ref={heroRef}
          className={s.hero}
          key={coffee.id}
          initial={{ opacity: 0.7, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={s.heroTop}>
            <span>READY TO BREW</span>
            <span>
              {roastAge(bag.roastedAt)}d off roast ·{" "}
              {roastAge(bag.roastedAt) < 7
                ? "Resting"
                : roastAge(bag.roastedAt) <= 21
                  ? "Peak window"
                  : "Mellowing"}
            </span>
          </div>
          <h2 className="coffee-name">{coffee.name}</h2>
          <p>{coffee.notes.join(" · ")}</p>
          <div className={s.recipe}>
            <div>
              <button
                className="button button--secondary"
                onClick={() => setModal("timer")}
              >
                Brew this coffee <ArrowRight size={16} />
              </button>
              <p>{recipe.name}</p>
              <strong>
                {recipe.doseG}g · {recipe.waterMl}ml ·{" "}
                {temperature(recipe.temperatureC, store.tempUnit)}
              </strong>
              <p>
                {recipe.grindClicks} clicks · ~{duration(recipe.targetTimeSec)}{" "}
                · 1:{(recipe.waterMl / recipe.doseG).toFixed(1)}
              </p>
            </div>
            <CoffeeBagArt coffee={coffee} className={s.bag} />
          </div>
          <div className={s.switcher}>
            <button
              aria-label="Previous bag"
              onClick={() =>
                setSelected((selected + active.length - 1) % active.length)
              }
            >
              <ArrowLeft size={17} />
            </button>
            <span>
              Bag {selected + 1} of {active.length}
            </span>
            <button
              aria-label="Next bag"
              onClick={() => setSelected((selected + 1) % active.length)}
            >
              <ArrowRight size={17} />
            </button>
          </div>
        </motion.section>
        <section ref={rotationCardRef} className={`${s.card} ${s.rotationCard}`}>
          <div className={s.sectionHead}>
            <h2>Current rotation</h2>
            <Link href="/app/coffees">View shelf →</Link>
          </div>
          <div className={s.rotation}>
            {active.map((item, index) => {
              const entry = coffeeById(item.coffeeId)!;
              const pct = Math.min(
                100,
                Math.max(
                  0,
                  Math.round(
                    (item.remainingWeightG / item.startingWeightG) * 100,
                  ),
                ),
              );
              return (
                <button
                  key={item.id}
                  aria-pressed={selected === index}
                  onClick={() => setSelected(index)}
                >
                  <div className={s.bagRow}>
                    <span
                      className={s.swatch}
                      style={{
                        background: entry.packaging.bagColor,
                        color: entry.packaging.textColor,
                      }}
                    >
                      {entry.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <strong>
                        {entry.name} {pct <= 35 && <small>Low</small>}
                      </strong>
                      <p>
                        {item.remainingWeightG}g · ~
                        {Math.floor(
                          item.remainingWeightG / recipeFor(entry.id).doseG,
                        )}{" "}
                        cups left
                      </p>
                      <p>{roastAge(item.roastedAt)}d off roast</p>
                    </div>
                    <span>{pct}%</span>
                  </div>
                  <span
                    className={s.stock}
                    role="meter"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={pct}
                    aria-label={`${entry.name} remaining`}
                  >
                    <motion.span
                      initial={false}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.45 }}
                      style={{ background: pct <= 35 ? "#c48a47" : "#8e9f72" }}
                    />
                  </span>
                </button>
              );
            })}
          </div>
          <button type="button" className={s.add} aria-label="Open a new bag" title="Open a new bag" onClick={() => setModal("bag")}>
            <Plus size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </section>
      </div>
      <AnimatePresence>
        {cue && dismissed !== cue.id && (
          <motion.aside
            className={s.cue}
            initial={false}
            exit={{
              opacity: 0,
              height: 0,
              paddingTop: 0,
              paddingBottom: 0,
              marginTop: 0,
              marginBottom: 0,
            }}
          >
            <div>
              <p>
                {coffeeById(cue.coffeeId)?.name} · {cue.dialInCue}
              </p>
            </div>
            <button
              onClick={() => {
                setSelected(
                  active.findIndex((item) => item.coffeeId === cue.coffeeId),
                );
                setDismissed(cue.id);
                const nextGrind = cue.dialInCue?.match(/→\s*(\d+)/)?.[1];
                store.update({
                  selectedCoffeeId: cue.coffeeId,
                  ...(nextGrind
                    ? {
                        grindOverrides: {
                          ...store.grindOverrides,
                          [cue.coffeeId]: Number(nextGrind),
                        },
                      }
                    : {}),
                });
                setToast(
                  nextGrind
                    ? "Coffee selected and grind adjustment applied."
                    : "Coffee selected. Your reminder is ready for the next cup.",
                );
              }}
            >
              Switch & apply →
            </button>
            <button
              aria-label="Dismiss reminder"
              onClick={() => setDismissed(cue.id)}
            >
              <X size={18} />
            </button>
          </motion.aside>
        )}
      </AnimatePresence>
      <motion.div layout className={s.metrics}>
        <section className={s.card}>
          <p>Brews this week</p>
          <strong className={s.number}>{weekly.length}</strong>
          <div
            className={s.spark}
            aria-label="Daily brew counts over the seven-day demo period"
          >
            {days.map((count, index) => (
              <div
                key={index}
                role="img"
                aria-label={`${new Date(end - (6 - index) * 86400000).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}: ${count} brews`}
                title={`${new Date(end - (6 - index) * 86400000).toLocaleDateString("en-GB", { weekday: "long" })}: ${count} brews`}
              >
                <motion.span
                  initial={false}
                  animate={{ height: 8 + count * 15 }}
                  style={{ background: count ? "#3e2231" : "#2e20251a" }}
                />
                <small>
                  {new Date(end - (6 - index) * 86400000).toLocaleDateString(
                    "en-GB",
                    { weekday: "narrow" },
                  )}
                </small>
              </div>
            ))}
          </div>
          <small>Last 7 days</small>
        </section>
        <section className={s.card}>
          <p>Coffee logged · this week</p>
          <strong className={s.number}>
            {dose}
            <small>g</small>
          </strong>
          <p>Avg {(dose / (weekly.length || 1)).toFixed(1)}g per cup</p>
          <small>
            {active.reduce((sum, item) => sum + item.remainingWeightG, 0)}g on
            shelf
          </small>
        </section>
        <section className={s.card}>
          <p>Average rating</p>
          <strong className={s.number}>
            {average.toFixed(1)}
            <small> / 5</small>
          </strong>
          <p>
            Best cup ·{" "}
            {coffeeById(
              [...weekly].sort((a, b) => b.rating - a.rating)[0]?.coffeeId,
            )?.name ?? "No cups yet"}
          </p>
          <small>
            ★ {Math.max(0, ...weekly.map((brew) => brew.rating)).toFixed(1)}{" "}
            personal best this week
          </small>
        </section>
      </motion.div>
      <section className={s.card}>
        <div className={s.sectionHead}>
          <h2>Recent brews</h2>
          <Link href="/app/brews">Full journal →</Link>
        </div>
        <div className={s.filters}>
          {["all", ...new Set(brews.map((brew) => brew.method))].map(
            (value) => (
              <button
                key={value}
                aria-pressed={method === value}
                onClick={() => setMethod(value)}
              >
                {method === value && (
                  <motion.span
                    className={s.selectedPill}
                    layoutId="method-filter-pill"
                    transition={{ type: "spring", stiffness: 320, damping: 32 }}
                  />
                )}
                {value === "all"
                  ? "All"
                  : formatMethod(value as (typeof brews)[number]["method"])}
              </button>
            ),
          )}
        </div>
        {brews
          .filter((brew) => method === "all" || brew.method === method)
          .map((brew) => (
            <motion.article
              layout
              initial={false}
              animate={{ opacity: 1 }}
              className={s.brew}
              key={brew.id}
            >
              <BrewMethodIcon method={brew.method} />
              <div>
                <h3>{coffeeById(brew.coffeeId)?.name}</h3>
                <time dateTime={brew.brewedAt}>
                  {new Intl.DateTimeFormat("en", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(new Date(brew.brewedAt))}
                </time>
                <p>
                  {formatMethod(brew.method)} · {brew.doseG}g ·{" "}
                  {brew.grindClicks} clicks · {brew.notes}
                </p>
              </div>
              <span
                className={s.rating}
                data-rating={
                  brew.rating < 4
                    ? "low"
                    : brew.rating < 4.4
                      ? "neutral"
                      : "high"
                }
              >
                <Star size={13} /> {brew.rating.toFixed(1)} / 5
              </span>
            </motion.article>
          ))}
      </section>
      <AnimatePresence>
        {toast && (
          <motion.p
            role="status"
            className={s.toast}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {toast}
            <button
              aria-label="Dismiss notification"
              onClick={() => setToast("")}
            >
              <X size={16} />
            </button>
          </motion.p>
        )}
      </AnimatePresence>
      {modal === "timer" && (
        <BrewTimer
          coffeeId={coffee.id}
          onClose={() => setModal(null)}
          onLog={(seconds, setup) => {
            setElapsed(seconds);
            setBrewSetup(setup);
            setModal("log");
          }}
        />
      )}
      {modal === "log" && (
        <LogBrew
          coffeeId={coffee.id}
          initialSetup={brewSetup}
          elapsed={elapsed}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            setToast("Brew saved. Your shelf and journal are updated.");
          }}
        />
      )}
      {modal === "bag" && (
        <OpenBag
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            setToast("Your new bag is ready to brew.");
          }}
        />
      )}
    </div>
  );
}
