"use client";

import { useDashboard } from "@/components/dashboard-store";
import { CoffeeBagArt } from "@/components/coffee/coffee-bag-art";
import { formatMethod } from "@/lib/utils";
import type { BrewMethod } from "@/types";
import s from "@/components/dashboard.module.css";

function mostFrequent(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1])[0];
}

export default function InsightsPage() {
  const { brews, coffees, bags } = useDashboard();
  const methodOrder: BrewMethod[] = ["v60", "aeropress", "french_press", "moka_pot", "espresso"];
  const methodCounts = methodOrder.map((method) => ({
    method,
    count: brews.filter((brew) => brew.method === method).length,
  }));
  const chartMax = Math.ceil(Math.max(4, ...methodCounts.map(({ count }) => count)) / 4) * 4;
  const mostBrewed = mostFrequent(brews.map((brew) => brew.coffeeId));
  const mostBrewedCoffee = coffees.find((coffee) => coffee.id === mostBrewed?.[0]);
  const favouriteMethod = mostFrequent(brews.map((brew) => brew.method));
  const flavourNotes = brews.flatMap((brew) =>
    coffees.find((coffee) => coffee.id === brew.coffeeId)?.notes.map((note) => note.trim().toLowerCase()) ?? [],
  );
  const favouriteFlavour = mostFrequent(flavourNotes);
  return (
    <div className={`${s.dashboard} ${s.insightsDashboard}`}>
      <header className={s.header}>
        <div>
          <h1>Insights</h1>
          <p>Based on the cups you have recorded.</p>
        </div>
      </header>
      <div className={s.metrics}>
        <section className={`${s.card} ${s.featuredInsight}`}>
          {mostBrewedCoffee && <CoffeeBagArt coffee={mostBrewedCoffee} className={s.featuredInsightArt} />}
          <div className={s.featuredInsightContent}>
            <p>Most brewed coffee</p>
            <strong className="coffee-name mt-3 block text-2xl font-semibold leading-tight">{mostBrewedCoffee?.name ?? "—"}</strong>
            {mostBrewed && <small>{mostBrewed[1]} {mostBrewed[1] === 1 ? "brew" : "brews"}</small>}
          </div>
        </section>
        <section className={s.card}>
          <p>Logged brews</p>
          <strong className={s.number}>{brews.length}</strong>
        </section>
        <section className={s.card}>
          <p>Total bags</p>
          <strong className={s.number}>{bags.length}</strong>
        </section>
        <section className={s.card}>
          <p>Favourite brew method</p>
          <strong className="mt-3 block text-xl font-semibold leading-tight">{favouriteMethod ? formatMethod(favouriteMethod[0]) : "—"}</strong>
          {favouriteMethod && <small>{favouriteMethod[1]} {favouriteMethod[1] === 1 ? "brew" : "brews"}</small>}
        </section>
        <section className={s.card}>
          <p>Favourite flavour profile</p>
          <strong className="mt-3 block text-xl font-semibold capitalize leading-tight">{favouriteFlavour?.[0] ?? "—"}</strong>
          {favouriteFlavour && <small>From your brewed coffees</small>}
        </section>
      </div>
      <section className={s.card}>
        <h2>Your brew methods</h2>
        <div className={s.methodChartScroll}>
          <svg className={s.methodChart} viewBox="0 0 720 300" role="img" aria-labelledby="method-chart-title method-chart-description">
            <title id="method-chart-title">Brews by method</title>
            <desc id="method-chart-description">{methodCounts.map(({ method, count }) => `${formatMethod(method)}: ${count}`).join(", ")}.</desc>
            {Array.from({ length: 5 }, (_, tick) => {
              const y = 230 - tick / 4 * 180;
              return <g key={tick}><line x1="46" x2="700" y1={y} y2={y} className={s.methodGridline} /><text x="30" y={y + 4} textAnchor="end" className={s.methodAxisLabel}>{tick * chartMax / 4}</text></g>;
            })}
            {methodCounts.map(({ method, count }, index) => {
              const x = 77 + index * 130;
              const height = count / chartMax * 180;
              return <g key={method}>
                <rect x={x} y={230 - height} width="82" height={height} rx="12" className={s.methodBar} />
                <text x={x + 41} y={count ? 218 - height : 218} textAnchor="middle" className={s.methodValue}>{count}</text>
                <text x={x + 41} y="260" textAnchor="middle" className={s.methodName}>{formatMethod(method)}</text>
              </g>;
            })}
          </svg>
        </div>
      </section>
    </div>
  );
}
