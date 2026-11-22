"use client";

import Link from "next/link";
import { useState } from "react";
import { useDashboard } from "@/components/dashboard-store";
import s from "@/components/dashboard.module.css";

export default function SettingsPage() {
  const store = useDashboard();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className={`${s.dashboard} ${s.settingsDashboard}`}>
      <header className={s.header}>
        <div>
          <h1>Settings</h1>
          <p>Your preferences save automatically in this browser.</p>
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
            Demo entries and preferences stay in this browser. They are not
            synced between devices.
          </p>
          {confirm ? (
            <div>
              <p>Replace your saved brews and bags with the original demo?</p>
              <button
                className="button button--primary"
                onClick={() => {
                  store.reset();
                  setConfirm(false);
                }}
              >
                Reset demo data
              </button>
              <button
                className="button button--quiet"
                onClick={() => setConfirm(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="button button--secondary"
              onClick={() => setConfirm(true)}
            >
              Reset seeded demo
            </button>
          )}
          <Link href="/">Leave demo →</Link>
        </div>
      </section>
    </div>
  );
}
