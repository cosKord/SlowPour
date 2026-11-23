"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/components/dashboard-store";
import s from "@/components/dashboard.module.css";

export default function SettingsPage() {
  const store = useDashboard();
  const router = useRouter();
  const [importMessage, setImportMessage] = useState("");
  return (
    <div className={`${s.dashboard} ${s.settingsDashboard}`}>
      <header className={s.header}>
        <div>
          <h1>Settings</h1>
          <p>Your preferences save to your account.</p>
        </div>
      </header>
      <section className={s.card}>
        <div className={s.form}>
          <label>
            Temperature
            <select
              value={store.tempUnit}
              onChange={(event) =>
                store.update({ tempUnit: event.target.value as "C" | "F" })
              }
            >
              <option value="C">Celsius (°C)</option>
              <option value="F">Fahrenheit (°F)</option>
            </select>
          </label>
          <label>
            Default cup dose (g)
            <input
              type="number"
              min="1"
              max="100"
              value={store.defaultDose}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (value >= 1 && value <= 100)
                  store.update({ defaultDose: value });
              }}
            />
          </label>
          <p>
            Your journal is saved to your account and available when you sign in again.
          </p>
          <button className="button button--secondary" disabled={!store.ready || Boolean(store.storageError)} onClick={() => {
            try {
              const raw = localStorage.getItem("slowpour-dashboard-v2");
              if (!raw) { setImportMessage("No earlier browser journal was found."); return; }
              const saved = JSON.parse(raw);
              if (!Array.isArray(saved.coffees) || !Array.isArray(saved.bags) || !Array.isArray(saved.brews) || !Array.isArray(saved.recipes)) throw new Error();
              store.update(saved);
              setImportMessage("Browser journal imported. Your earlier browser copy is still available.");
            } catch { setImportMessage("The earlier browser journal could not be read."); }
          }}>Import earlier browser journal</button>
          {importMessage && <p role="status">{importMessage}</p>}
          <button className="button button--quiet" onClick={async () => { await fetch("/api/auth", { method: "DELETE" }); router.push("/login"); router.refresh(); }}>Sign out</button>
          <Link href="/">Back to the story →</Link>
        </div>
      </section>
    </div>
  );
}
