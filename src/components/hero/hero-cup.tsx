"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

export function HeroCup() {
  const reducedMotion = useReducedMotion();

  return <div aria-hidden="true" style={{ position: "absolute", zIndex: 4, left: "51%", top: "64%", width: "min(58vw, 620px)", aspectRatio: "620 / 430", transform: "translate(-50%, -43%)", pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: "40%", bottom: "1%", width: "54%", height: "25px", translate: "-50% 0", borderRadius: "70%", background: "rgb(56 40 56 / 70%)", filter: "blur(20px)" }} />
    <motion.div style={{ position: "absolute", zIndex: 1, left: "50%", bottom: "22%", width: "78%", translate: "-50% 0" }} initial={reducedMotion ? false : { opacity: 0, y: 24, scale: .96 }} animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: [24, -8, 24], scale: 1 }} transition={reducedMotion ? { duration: 0 } : { opacity: { delay: 1, duration: .6 }, scale: { delay: 1, duration: .6 }, y: { delay: 1, duration: 7, ease: "easeInOut", repeat: Infinity } }}>
      <Image src="/assets/hero-cup.png" alt="" width={1092} height={749} sizes="(max-width: 640px) 76vw, 500px" priority style={{ display: "block", width: "100%", height: "auto", rotate: "-6deg" }} />
    </motion.div>
  </div>;
}
