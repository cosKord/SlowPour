"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Modal } from "@/components/dashboard-dialogs";
import { useDashboard } from "@/components/dashboard-store";
import { equipmentCatalog, type EquipmentItem, type EquipmentType } from "@/data/equipment-catalog";
import s from "@/components/dashboard.module.css";

const types: EquipmentType[] = ["Grinder", "Brewer", "Scale", "Kettle"];

function EquipmentImage({ item }: { item: EquipmentItem }) {
  return (
    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-white/65 to-[#e5e5d5]/55">
      <Image src={item.image} alt="" fill sizes="96px" className="object-contain p-2 drop-shadow-[0_8px_10px_rgba(46,32,37,.15)]" />
    </div>
  );
}

export default function EquipmentPage() {
  const store = useDashboard();
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<EquipmentType | null>(null);
  const selectedIds = [...store.grinderIds, ...store.equipmentIds];
  const selected = equipmentCatalog.filter((item) => selectedIds.includes(item.id));
  const choices = equipmentCatalog.filter((item) => item.type === type);

  const addItem = (item: EquipmentItem) => {
    if (item.type === "Grinder") {
      if (!store.grinderIds.includes(item.id)) store.update({ grinderIds: [...store.grinderIds, item.id] });
    } else if (!store.equipmentIds.includes(item.id)) {
      store.update({ equipmentIds: [...store.equipmentIds, item.id] });
    }
    setAdding(false);
    setType(null);
  };

  const removeItem = (item: EquipmentItem) => {
    if (item.type === "Grinder") store.update({ grinderIds: store.grinderIds.filter((id) => id !== item.id) });
    else store.update({ equipmentIds: store.equipmentIds.filter((id) => id !== item.id) });
  };

  return (
    <div className={`${s.dashboard} ${s.equipmentDashboard}`}>
      <header className={s.header}>
        <div>
          <p className="meta">Your setup</p>
          <h1>Equipment</h1>
          <p>The tools behind each recipe and brew.</p>
        </div>
      </header>

      <section aria-labelledby="my-equipment-title">
        <h2 id="my-equipment-title" className="mb-5 text-2xl font-semibold">My setup</h2>
        <div className={s.metrics}>
          {selected.map((item) => (
            <article className={`${s.card} relative flex min-w-0 items-center gap-4 overflow-hidden`} key={item.id}>
              <EquipmentImage item={item} />
              <div className="min-w-0 flex-1 pr-8">
                <p className="meta">{item.detail ? `${item.detail} ${item.type.toLowerCase()}` : item.type}</p>
                <h3 className="mt-2 text-lg font-semibold">{item.name}</h3>
                <p className="mt-1 text-sm text-muted">{item.brand}</p>
              </div>
              <button
                type="button"
                aria-label={`Remove ${item.name} from setup`}
                title={`Remove ${item.name} from setup`}
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-[#2e2025]/15 bg-white/55 text-[#2e2025]/75 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2e2025]/50"
                onClick={() => removeItem(item)}
              >
                <X size={16} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </article>
          ))}
          <button type="button" onClick={() => setAdding(true)} className={`${s.card} grid min-w-0 place-content-center gap-3 border-dashed text-center transition hover:bg-white/50`}>
            <Plus className="mx-auto" size={26} />
            <span className="font-semibold">Add equipment</span>
          </button>
        </div>
      </section>

      {adding && (
        <Modal title="Add equipment" onClose={() => { setAdding(false); setType(null); }}>
          {type === null ? (
            <>
              <p className="mb-5 text-sm text-muted">What kind of equipment would you like to add?</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {types.map((option) => (
                  <button key={option} type="button" onClick={() => setType(option)} className="rounded-2xl border border-white/70 bg-white/45 px-5 py-6 text-left text-lg font-semibold shadow-sm backdrop-blur-xl transition hover:bg-white/70">{option}<span className="ml-2 text-sm font-normal text-muted">{equipmentCatalog.filter((item) => item.type === option).length} options</span></button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setType(null)} className="mb-5 flex items-center gap-2 text-sm font-semibold"><ArrowLeft size={16} /> Equipment types</button>
              <p className="mb-4 text-sm text-muted">Choose a {type.toLowerCase()} for your setup.</p>
              <div className="grid max-h-[min(56vh,560px)] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                {choices.map((item) => {
                  const inSetup = selectedIds.includes(item.id);
                  return (
                    <button key={item.id} type="button" disabled={inSetup} onClick={() => addItem(item)} className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/70 bg-white/45 p-3 text-left backdrop-blur-xl transition hover:bg-white/70 disabled:cursor-default disabled:opacity-60">
                      <EquipmentImage item={item} />
                      <span className="min-w-0 flex-1"><span className="block text-xs text-muted">{item.brand}</span><span className="block font-semibold">{item.name}</span><span className="mt-1 block text-xs text-muted">{inSetup ? "Already in your setup" : `Add ${item.type.toLowerCase()}`}</span></span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
