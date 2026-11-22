"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { LayoutGroup, motion, MotionConfig } from "motion/react";
import {
  BookOpen,
  Coffee,
  Gauge,
  Menu,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { AmbientBackdrop } from "@/components/ambient-backdrop";
import { useDashboard } from "@/components/dashboard-store";
import s from "./app-shell.module.css";

const navigation = [
  { href: "/app", label: "Today", icon: Gauge },
  { href: "/app/coffees", label: "Coffees", icon: Coffee },
  { href: "/app/recipes", label: "Recipes", icon: SlidersHorizontal },
  { href: "/app/brews", label: "Journal", icon: BookOpen },
  { href: "/app/insights", label: "Insights", icon: Sparkles },
  { href: "/app/equipment", label: "Equipment", icon: Wrench },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const coffeeLandscape = /^\/app\/coffees(?:\/[^/]+)?\/?$/.test(pathname);
  const coffeeDetail = /^\/app\/coffees\/[^/]+\/?$/.test(pathname) && !/^\/app\/coffees\/new\/?$/.test(pathname);
  const store = useDashboard();
  const drawer = useRef<HTMLDialogElement>(null);
  const nav = navigation.map(({ href, label, icon: Icon }) => {
    const active =
      href === "/app" ? pathname === href : pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={`${s.link} ${active ? s.active : ""}`}
        onClick={() => drawer.current?.close()}
      >
        {active && (
          <motion.span
            className={s.navPill}
            layoutId="sidebar-active-pill"
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          />
        )}
        <Icon size={19} />
        {label}
      </Link>
    );
  });
  return (
    <MotionConfig reducedMotion="user">
      <div className={`${s.shell} ${s.glass} ${coffeeLandscape ? s.coffeeLandscape : ""} ${coffeeDetail ? s.coffeeDetail : ""}`}>
        <AmbientBackdrop visible />
        <aside className={s.sidebar}>
          <Wordmark />
          <LayoutGroup id="desktop-navigation">
            <nav aria-label="Application navigation">{nav}</nav>
          </LayoutGroup>
          <div className={s.profile}>
            <strong>user</strong>
            <small>Your coffee journal</small>
          </div>
        </aside>
        <header className={s.mobileHeader}>
          <button
            aria-label="Open navigation"
            onClick={() => drawer.current?.showModal()}
          >
            <Menu />
          </button>
          <Wordmark />
          <Link className="button button--primary" href="/app/brews/new">
            Log a brew →
          </Link>
        </header>
        <dialog
          ref={drawer}
          className={s.drawer}
          aria-label="Navigation"
          onClick={(event) => {
            if (event.target === event.currentTarget) drawer.current?.close();
          }}
        >
          <div className={s.drawerHeader}>
            <Wordmark />
            <button
              aria-label="Close navigation"
              onClick={() => drawer.current?.close()}
            >
              <X />
            </button>
          </div>
          <LayoutGroup id="mobile-navigation">
            <nav aria-label="Mobile navigation">{nav}</nav>
          </LayoutGroup>
        </dialog>
        <main className={s.main}>
          <p className={s.mobileDisclosure}>
            Your coffee journal
          </p>
          {store.storageError && (
            <p role="status" className={s.status}>
              {store.storageError}
            </p>
          )}
          {!store.ready && <p role="status">Opening your journal…</p>}
          <div
            hidden={!store.ready}
            aria-hidden={!store.ready}
            inert={!store.ready}
          >
            {children}
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}
