"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue } from "motion/react";
import { ArrowRight, Check, ChevronDown, Coffee, Pause, Play, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { Select } from "@base-ui/react/select";
import {
  coffeeCatalog,
  processOptions,
  roastOptions,
} from "@/data/coffee-catalog";
import {
  duration,
  journalRecipes,
  temperature,
  useDashboard,
  type JournalRecipe,
} from "./dashboard-store";
import type { BrewMethod } from "@/types";
import { BrewTimerMotion } from "@/components/coffee/brew-timer-motion";
import s from "./dashboard.module.css";

const DialogPortalContext =
  createContext<React.RefObject<HTMLDialogElement | null> | null>(null);

function GlassSelect({
  label,
  name,
  options,
  placeholder,
  value,
  onValueChange,
  disabled,
}: {
  label: string;
  name: string;
  options: readonly string[];
  placeholder: string;
  value?: string;
  onValueChange?: (value: string | null) => void;
  disabled?: boolean;
}) {
  const dialogRef = useContext(DialogPortalContext);
  return (
    <div className={s.selectField}>
      <Select.Root
        name={name}
        modal={false}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        required
        items={options.map((option) => ({
          value: option,
          label: option === "__other__" ? "Other coffee (enter name)" : option,
        }))}
      >
        <Select.Label className={s.selectLabel}>{label}</Select.Label>
        <Select.Trigger className={s.selectTrigger}>
          <Select.Value placeholder={placeholder} />
          <Select.Icon className={s.selectIcon}>
            <ChevronDown size={17} aria-hidden="true" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal container={dialogRef ?? undefined}>
          <Select.Positioner
            className={s.selectPositioner}
            alignItemWithTrigger={false}
            align="start"
            sideOffset={6}
          >
            <Select.Popup className={s.selectPopup}>
              <Select.List className={s.selectList}>
                {options.map((option) => (
                  <Select.Item
                    key={option}
                    value={option}
                    className={s.selectItem}
                  >
                    <Select.ItemText>
                      {option === "__other__"
                        ? "Other coffee (enter name)"
                        : option}
                    </Select.ItemText>
                    <Select.ItemIndicator className={s.selectIndicator}>
                      <Check size={15} aria-hidden="true" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
  background,
  variant,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  background?: React.ReactNode;
  variant?: "brew";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <DialogPortalContext.Provider value={ref}>
      <dialog
        ref={ref}
        aria-label={title}
        className={`${s.modal} ${variant === "brew" ? s.brewModal : ""}`}
        data-surface="glass"
        onCancel={onClose}
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div className={s.modalScroll}>
          {background}
          <div className={s.sectionHead}>
            <h2>{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close dialog">
              <X />
            </button>
          </div>
          {children}
        </div>
      </dialog>
    </DialogPortalContext.Provider>
  );
}

export type BrewSetup = {
  recipeId: string;
  name: string;
  method: BrewMethod;
  doseG: number;
  waterMl: number;
  temperatureC: number;
  grindClicks: number;
  targetTimeSec: number;
  bloomWaterMl: number;
  bloomSec: number;
  checkpoints?: { label: string; timeSec: number }[];
};

const brewMethods: { method: BrewMethod; label: string; detail: string; timeLabel: string }[] = [
  { method: "v60", label: "V60", detail: "Bloom and staged pours", timeLabel: "Drawdown time" },
  { method: "aeropress", label: "AeroPress", detail: "Steep, then press", timeLabel: "Steep and press time" },
  { method: "moka_pot", label: "Moka pot", detail: "Stovetop extraction", timeLabel: "Brew time" },
  { method: "french_press", label: "French press", detail: "Immersion and plunge", timeLabel: "Steep time" },
  { method: "espresso", label: "Espresso", detail: "Dial in your yield", timeLabel: "Shot time" },
];

const brewGuidance: Record<string, string> = {
  Bloom: "Wet the grounds evenly and let them bloom.",
  "First pour": "Pour gently toward the center.",
  "Final pour": "Finish the pour and let it flow let flowww.",
  "Add water and stir": "Add the water, then stir gently.",
  "Press gently": "Press with steady, even pressure.",
  "Start on the stove": "Let the chamber warm gradually.",
  "Watch the flow": "Watch for coffee rising into the upper chamber.",
  "Add water": "Add the water and begin steeping.",
  "Break the crust": "Gently break the surface before plunging.",
  "Start the shot": "Begin the extraction.",
  "Watch the first drops": "Watch the first coffee reach the cup.",
};

function setupFromRecipe(recipe: JournalRecipe): BrewSetup {
  return {
    recipeId: recipe.id,
    name: recipe.name,
    method: recipe.method,
    doseG: recipe.doseG,
    waterMl: recipe.waterMl,
    temperatureC: recipe.temperatureC,
    grindClicks: recipe.grindClicks,
    targetTimeSec: recipe.targetTimeSec,
    bloomWaterMl: Math.min(50, recipe.waterMl),
    bloomSec: 30,
  };
}

export function BrewTimer({
  coffeeId,
  recipeId,
  onClose,
  onLog,
}: {
  coffeeId: string;
  recipeId?: string;
  onClose: () => void;
  onLog: (seconds: number, setup: BrewSetup) => void;
}) {
  const store = useDashboard();
  const savedRecipes = store.recipes.filter((item) => item.coffeeId === coffeeId);
  const [setup, setSetup] = useState<BrewSetup | null>(() => {
    const recipe = store.recipes.find((item) => item.id === recipeId && (!item.coffeeId || item.coffeeId === coffeeId));
    return recipe ? setupFromRecipe(recipe) : null;
  });
  const [phase, setPhase] = useState<"choose" | "adjust" | "timer">(recipeId ? "adjust" : "choose");
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [checkpoints, setCheckpoints] = useState<{ label: string; timeSec: number }[]>([]);
  const elapsedRef = useRef(0);
  const firstExtractionAtRef = useRef<number | null>(null);
  const settledRef = useRef(false);
  const displayedSecondRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const progress = useMotionValue(0);
  const visualProgress = useMotionValue(0);
  const freeform = setup?.method === "espresso" || setup?.method === "moka_pot";
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const tick = (now: number) => {
      elapsedRef.current += Math.min(0.1, (now - last) / 1000);
      last = now;
      progress.set(Math.min(1, elapsedRef.current / Math.max(1, setup?.targetTimeSec ?? 1)));
      if (freeform && firstExtractionAtRef.current !== null && !settledRef.current) {
        visualProgress.set(Math.min(0.88, 0.12 + (elapsedRef.current - firstExtractionAtRef.current) / 40 * 0.76));
      }
      const second = Math.floor(elapsedRef.current);
      if (second !== displayedSecondRef.current) {
        displayedSecondRef.current = second;
        setElapsed(second);
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [running, setup?.targetTimeSec, progress, freeform, visualProgress]);
  const resetTimer = () => {
    setRunning(false);
    elapsedRef.current = 0;
    displayedSecondRef.current = 0;
    progress.set(0);
    visualProgress.set(0);
    firstExtractionAtRef.current = null;
    settledRef.current = false;
    setCheckpoints([]);
    setElapsed(0);
  };
  const chooseRecipe = (recipe: JournalRecipe) => {
    setSetup(setupFromRecipe(recipe));
    resetTimer();
    setPhase("adjust");
  };
  const steps = setup && !freeform ? (() => {
    const finish = setup.targetTimeSec;
    switch (setup.method) {
      case "v60": {
        const bloom = Math.min(setup.bloomSec, Math.floor(finish / 2));
        return [
          { time: 0, label: "Bloom", water: setup.bloomWaterMl },
          { time: bloom, label: "First pour", water: Math.round(setup.waterMl * 0.6) },
          { time: Math.round(finish * 0.55), label: "Final pour", water: setup.waterMl },
          { time: finish, label: "Drawdown complete" },
        ];
      }
      case "aeropress":
        return [
          { time: 0, label: "Add water and stir", water: setup.waterMl },
          { time: Math.round(finish * 0.75), label: "Press gently" },
          { time: finish, label: "Finish pressing" },
        ];
      case "french_press":
        return [
          { time: 0, label: "Add water", water: setup.waterMl },
          { time: Math.round(finish * 0.75), label: "Break the crust" },
          { time: finish, label: "Plunge and pour" },
        ];
      case "moka_pot":
      case "espresso":
        return [];
    }
  })() : [];
  const current = steps.findLastIndex((step) => elapsed >= step.time);
  const activeStep = steps[Math.max(0, current)];
  const checkpointLabels = setup?.method === "espresso" ? ["First drop", "Blonding", "Stop"] : ["First trickle", "Cut heat", "Done"];
  const nextCheckpoint = checkpointLabels[checkpoints.length];
  const complete = freeform ? checkpoints.length === 3 : Boolean(setup && elapsed >= setup.targetTimeSec);
  const addCheckpoint = () => {
    if (!freeform || !nextCheckpoint || !running) return;
    const timeSec = Math.floor(elapsedRef.current);
    if (checkpoints.length === 0) firstExtractionAtRef.current = elapsedRef.current;
    if (nextCheckpoint === "Stop" || nextCheckpoint === "Cut heat" || nextCheckpoint === "Done") {
      settledRef.current = true;
      visualProgress.set(1);
    }
    if (nextCheckpoint === "Stop" || nextCheckpoint === "Done") setRunning(false);
    setCheckpoints([...checkpoints, { label: nextCheckpoint, timeSec }]);
  };
  const seekTo = (time: number) => {
    elapsedRef.current = time;
    displayedSecondRef.current = time;
    setElapsed(time);
    progress.set(Math.min(1, time / Math.max(1, setup?.targetTimeSec ?? 1)));
  };
  return (
    <Modal
      title={`Brew ${store.coffees.find((coffee) => coffee.id === coffeeId)?.name}`}
      onClose={onClose}
      variant={phase === "timer" ? "brew" : undefined}
      background={phase === "timer" && setup ? <BrewTimerMotion method={setup.method} progress={freeform ? visualProgress : progress} running={running} complete={complete} /> : undefined}
    >
      {phase === "choose" && (
        <div>
          <p className={s.brewIntro}>Choose how you want to brew this coffee.</p>
          <h3 className={s.brewGroupTitle}>Brew method</h3>
          <div className={s.brewChoices}>
            {brewMethods.map(({ method, label, detail }) => (
              <button key={method} type="button" className={s.brewChoice} onClick={() => {
                const recipe = store.recipes.find((item) => !item.coffeeId && item.method === method) ?? journalRecipes.find((item) => item.method === method);
                if (recipe) chooseRecipe(recipe);
              }}>
                <strong>{label}</strong><span>{detail}</span>
              </button>
            ))}
          </div>
          {savedRecipes.length > 0 && (
            <>
              <h3 className={s.brewGroupTitle}>Saved for this coffee</h3>
              <div className={s.brewChoices}>
                {savedRecipes.map((recipe) => (
                  <button key={recipe.id} type="button" className={s.brewChoice} onClick={() => chooseRecipe(recipe)}>
                    <strong>{recipe.name}</strong><span>{brewMethods.find((item) => item.method === recipe.method)?.label} · {recipe.doseG}g / {recipe.waterMl}{recipe.method === "espresso" ? "g yield" : "ml"}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      {phase === "adjust" && setup && (
        <form className={s.form} key={setup.recipeId} onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const number = (name: string) => Number(data.get(name));
          setSetup({
            ...setup,
            doseG: number("dose"),
            waterMl: number("water"),
            temperatureC: store.tempUnit === "F" ? Math.round((number("temperature") - 32) * 5 / 9) : number("temperature"),
            grindClicks: number("grind"),
            targetTimeSec: number("time"),
            bloomWaterMl: setup.method === "v60" ? Math.min(number("bloomWater"), number("water")) : setup.bloomWaterMl,
            bloomSec: setup.method === "v60" ? number("bloomTime") : setup.bloomSec,
          });
          resetTimer();
          setPhase("timer");
        }}>
          <p className={s.brewIntro}>{setup.name} · Adjust this brew before starting the timer.</p>
          <div className={s.formGrid}>
            <label>Dose (g)<input name="dose" type="number" min="1" max="100" step="0.1" defaultValue={setup.doseG} required /></label>
            <label>{setup.method === "espresso" ? "Target yield (g)" : "Water (ml)"}<input name="water" type="number" min="1" max="2000" defaultValue={setup.waterMl} required /></label>
            <label>Temperature (°{store.tempUnit})<input name="temperature" type="number" min={store.tempUnit === "C" ? 1 : 34} max={store.tempUnit === "C" ? 100 : 212} defaultValue={store.tempUnit === "C" ? setup.temperatureC : Math.round(setup.temperatureC * 9 / 5 + 32)} required /></label>
            <label>Grinder clicks<input name="grind" type="number" min="0" max="200" defaultValue={setup.grindClicks} required /></label>
            <label>{brewMethods.find((item) => item.method === setup.method)?.timeLabel} (seconds)<input name="time" type="number" min="1" max="7200" defaultValue={setup.targetTimeSec} required /></label>
            {setup.method === "v60" && <>
              <label>Bloom water (ml)<input name="bloomWater" type="number" min="1" max={setup.waterMl} defaultValue={setup.bloomWaterMl} required /></label>
              <label>Bloom time (seconds)<input name="bloomTime" type="number" min="1" max="120" defaultValue={setup.bloomSec} required /></label>
            </>}
          </div>
          <div className={s.formActions}>
            <button className={`${s.brewAction} ${s.brewActionPrimary}`} type="submit">Continue to timer <ArrowRight size={16} aria-hidden="true" /></button>
            <button className={`${s.brewAction} ${s.brewActionSecondary}`} type="button" onClick={() => setPhase("choose")}><SlidersHorizontal size={16} aria-hidden="true" /> Change method or recipe</button>
          </div>
        </form>
      )}
      {phase === "timer" && setup && <>
        <div className={s.brewTimerBody}>
          <p className={s.brewSpecs}>{setup.name} · {setup.doseG}g · {setup.waterMl}{setup.method === "espresso" ? "g yield" : "ml"} · {temperature(setup.temperatureC, store.tempUnit)}{freeform ? setup.method === "espresso" ? " · Typical shot 0:25–0:32" : " · Open stopwatch" : ` · target ${duration(setup.targetTimeSec)}`}</p>
          <output className={s.timer} aria-label="Elapsed brew time">{duration(elapsed)}</output>
          <div className={s.brewTimeline} aria-label="Brew milestones">
            <span className={s.brewTrack}><motion.span className={s.brewTrackFill} style={{ scaleX: freeform ? visualProgress : progress }} /></span>
            {freeform ? checkpoints.map((checkpoint, index) => <span key={index} className={s.brewMilestone} style={{ left: `${Math.min(96, checkpoint.timeSec / Math.max(1, elapsed) * 100)}%` }} aria-label={`${checkpoint.label} at ${duration(checkpoint.timeSec)}`}><span className={s.brewDot} /><small>{duration(checkpoint.timeSec)}</small></span>) : steps.map((step, index) => <button key={`${step.time}-${index}`} type="button" className={s.brewMilestone} style={{ left: `${Math.min(100, step.time / setup.targetTimeSec * 100)}%` }} onClick={() => seekTo(step.time)} aria-label={`Go to ${step.label} at ${duration(step.time)}`} aria-current={current === index ? "step" : undefined}><span className={s.brewDot} /><small>{duration(step.time)}</small></button>)}
          </div>
          <div className={s.brewCueArea}>
            <AnimatePresence mode="wait">
              <motion.div key={freeform ? `checkpoint-${checkpoints.length}` : complete ? "done" : current} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }} className={s.brewCue}>
                <div className={s.brewCueTitle}><strong>{complete ? "Brew complete" : freeform ? checkpoints.at(-1)?.label ?? "Ready to brew" : activeStep?.label}</strong>{!freeform && !complete && activeStep?.water !== undefined && <span>{activeStep.water}{setup.method === "espresso" ? "g yield" : "ml total"}</span>}</div>
                <p>{complete ? "Ready to log your cup." : freeform ? checkpoints.length ? `${checkpoints.at(-1)?.label} at ${duration(checkpoints.at(-1)?.timeSec ?? 0)}` : "Start the stopwatch, then mark each moment as it happens." : brewGuidance[activeStep?.label ?? ""] ?? "Keep an eye on the brew."}</p>
              </motion.div>
            </AnimatePresence>
            {freeform && nextCheckpoint && <button type="button" className={s.checkpointButton} onClick={addCheckpoint} disabled={!running}>{nextCheckpoint === "Stop" || nextCheckpoint === "Done" ? nextCheckpoint : `+ ${nextCheckpoint}`}</button>}
          </div>
        </div>
        <div className={s.brewDock}>
          <button className="button button--secondary" onClick={resetTimer} aria-label="Reset timer" title="Reset timer"><RotateCcw size={20} aria-hidden="true" /></button>
          <button className="button button--primary" onClick={() => setRunning(!running)} aria-label={running ? "Pause timer" : elapsed ? "Resume timer" : "Start timer"} title={running ? "Pause timer" : elapsed ? "Resume timer" : "Start timer"}>{running ? <Pause size={20} aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}</button>
          <button className="button button--secondary" onClick={() => { setRunning(false); onLog(Math.floor(elapsedRef.current), { ...setup, checkpoints: freeform ? checkpoints : undefined }); }} aria-label="Log cup" title="Log cup"><Coffee size={20} aria-hidden="true" /></button>
        </div>
      </>}
    </Modal>
  );
}

export function LogBrew({
  coffeeId,
  initialRecipeId,
  initialSetup,
  elapsed,
  onClose,
  onSaved,
}: {
  coffeeId: string;
  initialRecipeId?: string;
  initialSetup?: BrewSetup;
  elapsed?: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const store = useDashboard();
  const [selected, setSelected] = useState(coffeeId);
  const [recipeId, setRecipeId] = useState(
    initialSetup?.recipeId ?? initialRecipeId ?? store.recipeFor(coffeeId).id,
  );
  const baseRecipe = store.recipes.find((item) => item.id === recipeId) ?? store.recipeFor(selected);
  const recipe = initialSetup && recipeId === initialSetup.recipeId && selected === coffeeId
    ? { ...baseRecipe, ...initialSetup }
    : { ...baseRecipe, grindClicks: store.grindOverrides[selected] ?? baseRecipe.grindClicks };
  return (
    <Modal title="Log your cup" onClose={onClose}>
      <form
        className={s.form}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const number = (key: string) => Number(data.get(key));
          const displayedTemp = number("temperature");
          store.logBrew({
            coffeeId: selected,
            recipeId,
            method: recipe.method,
            doseG: number("dose"),
            waterMl: number("water"),
            temperatureC:
              store.tempUnit === "F"
                ? Math.round(((displayedTemp - 32) * 5) / 9)
                : displayedTemp,
            grindClicks: number("grind"),
            timeSec: number("seconds"),
            rating: number("rating"),
            notes: String(data.get("notes")).trim(),
            dialInCue: String(data.get("cue")).trim(),
            checkpoints: selected === coffeeId && recipeId === initialSetup?.recipeId ? initialSetup.checkpoints : undefined,
          });
          onSaved();
        }}
      >
        {initialSetup?.checkpoints?.length ? <p className={s.brewIntro}>Checkpoints: {initialSetup.checkpoints.map((point) => `${point.label} ${duration(point.timeSec)}`).join(" · ")} · Total {duration(elapsed ?? 0)}</p> : null}
        <label>
          Coffee
          <select
            value={selected}
            onChange={(event) => {
              setSelected(event.target.value);
              setRecipeId(store.recipeFor(event.target.value).id);
            }}
          >
            {store.coffees.map((coffee) => (
              <option value={coffee.id} key={coffee.id}>
                {coffee.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Recipe
          <select
            value={recipeId}
            onChange={(event) => setRecipeId(event.target.value)}
          >
            {store.recipes.filter((item) => !item.coffeeId || item.coffeeId === selected).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <div className={s.formGrid} key={recipeId}>
          <label>
            Dose (g)
            <input
              name="dose"
              type="number"
              min="1"
              max="100"
              step="0.1"
              defaultValue={recipe.doseG}
              required
            />
          </label>
          <label>
            {recipe.method === "espresso" ? "Yield (g)" : "Water (ml)"}
            <input
              name="water"
              type="number"
              min="1"
              max="2000"
              defaultValue={recipe.waterMl}
              required
            />
          </label>
          <label>
            Temperature (°{store.tempUnit})
            <input
              name="temperature"
              type="number"
              min={store.tempUnit === "C" ? 1 : 34}
              max={store.tempUnit === "C" ? 100 : 212}
              defaultValue={
                store.tempUnit === "C"
                  ? recipe.temperatureC
                  : Math.round((recipe.temperatureC * 9) / 5 + 32)
              }
              required
            />
          </label>
          <label>
            Grind clicks
            <input
              name="grind"
              type="number"
              min="0"
              max="200"
              defaultValue={recipe.grindClicks}
              required
            />
          </label>
          <label>
            Time (seconds)
            <input
              name="seconds"
              type="number"
              min="0"
              max="7200"
              defaultValue={elapsed ?? recipe.targetTimeSec}
              required
            />
          </label>
          <label>
            Rating / 5
            <input
              name="rating"
              type="number"
              min="1"
              max="5"
              step="0.1"
              defaultValue="4"
              required
            />
          </label>
        </div>
        <label>
          Tasting note
          <textarea
            name="notes"
            maxLength={2000}
            placeholder="What did you notice?"
          />
        </label>
        <label>
          Next time
          <textarea
            name="cue"
            maxLength={500}
            placeholder="One useful adjustment for tomorrow"
          />
        </label>
        <button className="button button--primary" type="submit">
          Save brew
        </button>
      </form>
    </Modal>
  );
}

export function OpenBag({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const store = useDashboard();
  const [roaster, setRoaster] = useState("");
  const [coffeeName, setCoffeeName] = useState("");
  return (
    <Modal title="Open a new bag" onClose={onClose}>
      <form
        className={s.form}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const value = (key: string) => String(data.get(key)).trim();
          store.openBag(
            {
              id: crypto.randomUUID(),
              name:
                coffeeName === "__other__"
                  ? value("customName")
                  : value("name"),
              roaster: value("roaster"),
              origin: value("origin"),
              process: value("process"),
              roast: value("roast"),
              notes: value("notes")
                .split(",")
                .map((note) => note.trim())
                .filter(Boolean),
              description: value("description"),
              packaging: {
                bagColor: "#8e9f72",
                labelColor: "#3e2231",
                accentColor: "#eae0ce",
                textColor: "#faf7f2",
              },
            },
            Number(value("grams")),
            value("date"),
          );
          onSaved();
        }}
      >
        <GlassSelect
          label="Roaster"
          name="roaster"
          options={Object.keys(coffeeCatalog)}
          placeholder="Select a roaster"
          value={roaster}
          onValueChange={(next) => {
            setRoaster(next ?? "");
            setCoffeeName("");
          }}
        />
        <GlassSelect
          label="Coffee name"
          name="name"
          options={roaster ? [...coffeeCatalog[roaster], "__other__"] : []}
          placeholder={roaster ? "Select a coffee" : "Choose a roaster first"}
          value={coffeeName}
          onValueChange={(next) => setCoffeeName(next ?? "")}
          disabled={!roaster}
        />
        {coffeeName === "__other__" && (
          <label>
            Other coffee name
            <input name="customName" required maxLength={100} />
          </label>
        )}
        <label>
          Origin
          <input name="origin" required maxLength={100} />
        </label>
        <GlassSelect
          label="Process"
          name="process"
          options={processOptions}
          placeholder="Select a process"
        />
        <div className={s.formGrid}>
          <label>
            Bag weight (g)
            <input
              name="grams"
              type="number"
              className={s.noSpinner}
              min="1"
              max="10000"
              defaultValue="250"
              required
            />
          </label>
          <label>
            Roasted on
            <input
              name="date"
              type="date"
              max={new Date().toLocaleDateString("en-CA")}
              required
            />
          </label>
        </div>
        <GlassSelect
          label="Roast"
          name="roast"
          options={roastOptions}
          placeholder="Select a roast"
        />
        <label>
          Tasting notes, separated by commas
          <input name="notes" maxLength={300} />
        </label>
        <label>
          Describe the cup (optional)
          <textarea
            name="description"
            rows={3}
            maxLength={220}
            placeholder="Juicy red fruit with a tea-like finish and a cocoa undertone."
          />
        </label>
        <button className="button button--primary" type="submit">
          Open bag
        </button>
      </form>
    </Modal>
  );
}
