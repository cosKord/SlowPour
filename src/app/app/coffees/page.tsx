"use client";

import { useState } from "react";
import { CoffeeCard } from "@/components/coffee/coffee-card";
import { OpenBag } from "@/components/dashboard-dialogs";
import { useDashboard } from "@/components/dashboard-store";
import s from "@/components/dashboard.module.css";
import { Plus } from "lucide-react";

export default function CoffeesPage() {
  const store = useDashboard();
  const [search, setSearch] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [adding, setAdding] = useState(false);
  const filtered = store.coffees.filter(
    (coffee) =>
      `${coffee.name} ${coffee.roaster} ${coffee.origin}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!openOnly ||
        store.bags.some(
          (bag) => bag.coffeeId === coffee.id && bag.status === "in_rotation",
        )),
  );
  return (
    <>
      <header className={s.header}>
        <div>
          <h1>Coffee shelf</h1>
          <p>
            {store.coffees.length} coffees ·{" "}
            {store.bags.filter((bag) => bag.status === "in_rotation").length}{" "}
            open bags
          </p>
        </div>
      </header>
      <div className="toolbar">
        <input
          className="search"
          aria-label="Search coffees"
          placeholder="Search coffee, roaster, origin…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button
          className="button button--secondary"
          aria-pressed={openOnly}
          onClick={() => setOpenOnly(!openOnly)}
        >
          {openOnly ? "Open bags" : "All coffees"}
        </button>
      </div>
      <div className="collection-grid">
        {filtered.map((coffee) => (
          <CoffeeCard
            key={coffee.id}
            coffee={coffee}
            bag={store.bags.find(
              (bag) =>
                bag.coffeeId === coffee.id && bag.status === "in_rotation",
            )}
            hasFinishedBag={store.bags.some((bag) => bag.coffeeId === coffee.id && bag.status === "finished")}
            onRemove={() => {
              if (!window.confirm(`Remove ${coffee.name} and its saved bag, recipes, and brews from your shelf?`)) return;
              store.update({
                coffees: store.coffees.filter((item) => item.id !== coffee.id),
                bags: store.bags.filter((item) => item.coffeeId !== coffee.id),
                brews: store.brews.filter((item) => item.coffeeId !== coffee.id),
                recipes: store.recipes.filter((item) => item.coffeeId !== coffee.id),
                selectedCoffeeId: store.selectedCoffeeId === coffee.id
                  ? store.coffees.find((item) => item.id !== coffee.id)?.id ?? ""
                  : store.selectedCoffeeId,
              });
            }}
          />
        ))}
        <button
          type="button"
          className="group grid min-h-52 w-full max-w-64 place-content-center justify-self-center self-center gap-4 rounded-[24px] border border-white/70 bg-white/35 p-6 text-center text-inherit shadow-lg backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          onClick={() => setAdding(true)}
        >
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-white/50 transition group-hover:scale-110">
            <Plus size={24} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold">Open a new bag</span>
        </button>
      </div>
      {!filtered.length && <p>No coffees match your search.</p>}
      {adding && (
        <OpenBag
          onClose={() => setAdding(false)}
          onSaved={() => setAdding(false)}
        />
      )}
    </>
  );
}
