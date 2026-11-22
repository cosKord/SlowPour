"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import type { BrewMethod } from "@/types";
import s from "./brew-timer-motion.module.css";

export function BrewTimerMotion({ method, progress, running, complete }: {
  method: BrewMethod;
  progress: MotionValue<number>;
  running: boolean;
  complete: boolean;
}) {
  const poolY = useTransform(progress, (value) => `${100 - value * (method === "moka_pot" ? 90 : 86)}%`);
  const aeroY = useTransform(progress, (value) => `${100 - Math.min(1, value / 0.15) * 65}%`);
  const frenchY = useTransform(progress, (value) => `${100 - Math.min(1, value / 0.15) * 78}%`);
  const pressY = useTransform(progress, (value) => `${Math.min(1, Math.max(0, (value - 0.7) / 0.3)) * 66}%`);
  const plungeY = useTransform(progress, (value) => `${Math.min(1, Math.max(0, (value - 0.75) / 0.25)) * 72}%`);
  const paused = !running || complete;

  return (
    <div className={`${s.backdrop} ${paused ? s.paused : ""}`} aria-hidden="true">
      {(method === "v60" || method === "moka_pot" || method === "espresso") && (
        <motion.div className={s.pool} style={{ y: poolY }}>
          {method === "moka_pot" && <>
            <svg className={`${s.wave} ${s.waveFirst}`} viewBox="0 0 800 30" preserveAspectRatio="none"><path d="M0 16 Q100 0 200 16 T400 16 T600 16 T800 16 V30 H0Z" /></svg>
            <svg className={`${s.wave} ${s.waveSecond}`} viewBox="0 0 800 30" preserveAspectRatio="none"><path d="M0 16 Q100 30 200 16 T400 16 T600 16 T800 16 V30 H0Z" /></svg>
          </>}
          {method === "v60" && <div className={s.ripple} />}
        </motion.div>
      )}
      {method === "v60" && <>
        <span className={s.pourGuide} />
        {Array.from({ length: 18 }, (_, index) => (
          <span key={index} className={s.drop} style={{ left: `${4 + index * 5.4}%`, animationDelay: `${-((index * 0.73) % 3.6)}s`, animationDuration: `${2.8 + (index % 4) * 0.3}s`, scale: `${0.7 + (index % 3) * 0.2}` }} />
        ))}
      </>}
      {method === "aeropress" && <>
        <motion.div className={s.immersion} style={{ y: aeroY }} />
        <motion.div className={s.plungerLayer} style={{ y: pressY }}><span className={s.plunger} /></motion.div>
      </>}
      {method === "french_press" && <>
        <motion.div className={s.immersion} style={{ y: frenchY }} />
        <motion.div className={s.plungerLayer} style={{ y: plungeY }}>
          <span className={s.mesh} />
          {[18, 39, 61, 82].map((left, index) => <span key={left} className={s.ground} style={{ left: `${left}%`, animationDelay: `${index * -0.7}s` }} />)}
        </motion.div>
      </>}
    </div>
  );
}
