"use client";

import { useId, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Modal } from "@/components/dashboard-dialogs";
import { useDashboard } from "@/components/dashboard-store";
import type { TastingProfile } from "@/types";
import styles from "./coffee-tasting-profile.module.css";

const dimensions: { key: keyof TastingProfile; label: string }[] = [
  { key: "sweetness", label: "Sweetness" },
  { key: "acidity", label: "Acidity" },
  { key: "body", label: "Body" },
  { key: "mouthfeel", label: "Mouthfeel" },
  { key: "bitterness", label: "Bitterness" },
  { key: "finish", label: "Finish" },
];

const startingProfile: TastingProfile = {
  sweetness: 2.5,
  bitterness: 2.5,
  acidity: 2.5,
  body: 2.5,
  mouthfeel: 2.5,
  finish: 2.5,
};

function point(index: number, radius: number) {
  const angle = -Math.PI / 2 + index * Math.PI / 3;
  return { x: 150 + Math.cos(angle) * radius, y: 132 + Math.sin(angle) * radius };
}

function polygon(radii: number[]) {
  return radii.map((radius, index) => {
    const { x, y } = point(index, radius);
    return `${x},${y}`;
  }).join(" ");
}

function Radar({ profile, name }: { profile?: TastingProfile; name: string }) {
  const titleId = useId();
  const descId = useId();
  const values = dimensions.map(({ key }) => Math.max(0, Math.min(5, profile?.[key] ?? 0)));

  return <svg className={styles.chart} viewBox="0 0 300 260" role="img" aria-labelledby={`${titleId} ${descId}`}>
    <title id={titleId}>{name} tasting profile</title>
    <desc id={descId}>{profile ? dimensions.map(({ label }, index) => `${label} ${values[index]} out of 5`).join(", ") : "No tasting scores added yet."}</desc>
    {[1, 2, 3, 4, 5].map((ring) => <polygon key={ring} points={polygon(dimensions.map(() => ring * 15))} className={styles.grid} />)}
    {dimensions.map(({ key }, index) => {
      const end = point(index, 75);
      return <line key={key} x1="150" y1="132" x2={end.x} y2={end.y} className={styles.axis} />;
    })}
    {profile && <>
      <polygon points={polygon(values.map((value) => value * 15))} className={styles.area} />
    </>}
    {dimensions.map(({ key, label }, index) => {
      const p = point(index, 106);
      return <text key={key} x={p.x} y={p.y + 4} textAnchor="middle" className={styles.label}>{label}</text>;
    })}
  </svg>;
}

export function CoffeeTastingProfile({ coffeeId }: { coffeeId: string }) {
  const store = useDashboard();
  const coffee = store.coffees.find((item) => item.id === coffeeId);
  const profile = coffee?.tastingProfile;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<TastingProfile>(startingProfile);
  if (!coffee) return null;

  const openEditor = () => {
    setDraft(profile ? { ...profile } : { ...startingProfile });
    setEditing(true);
  };

  return <>
    <article className={styles.card}>
      <div className={styles.cardHead}>
        <div><span className={styles.eyebrow}>For this coffee</span><h2>Taste profile</h2></div>
        <button type="button" className={styles.iconButton} onClick={openEditor} aria-label={profile ? "Edit tasting profile" : "Add tasting profile"} title={profile ? "Edit tasting profile" : "Add tasting profile"}>
          {profile ? <Pencil size={17} aria-hidden="true" /> : <Plus size={20} aria-hidden="true" />}
        </button>
      </div>
      <Radar profile={profile} name={coffee.name} />
      <p className={styles.cardFoot}>{profile ? "Your tasting notes · scored from 0 to 5" : "Add scores to map how this coffee tastes."}</p>
    </article>
    {editing && <Modal title={profile ? "Edit tasting profile" : "Add tasting profile"} onClose={() => setEditing(false)}>
      <form className={styles.editor} onSubmit={(event) => {
        event.preventDefault();
        store.update({ coffees: store.coffees.map((item) => item.id === coffeeId ? { ...item, tastingProfile: draft } : item) });
        setEditing(false);
      }}>
        <p>Rate each quality from 0 to 5. These are your impressions of this coffee.</p>
        <div className={styles.preview}><Radar profile={draft} name={coffee.name} /></div>
        <div className={styles.controls}>
          {dimensions.map(({ key, label }) => <label className={styles.control} key={key}>
            <span><span>{label}</span><strong>{draft[key].toFixed(1)}</strong></span>
            <input type="range" min="0" max="5" step="0.5" value={draft[key]} onChange={(event) => setDraft((current) => ({ ...current, [key]: Number(event.target.value) }))} />
          </label>)}
        </div>
        <div className={styles.actions}><button type="button" className="button button--secondary" onClick={() => setEditing(false)}>Cancel</button><button type="submit" className="button button--primary">Save profile</button></div>
      </form>
    </Modal>}
  </>;
}
