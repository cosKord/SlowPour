"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import styles from "@/app/landing.module.css";

type Variant = "collection" | "journal" | "palate";

export function LandingAccents({ variant }: { variant: Variant }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], [-48, 48]);

  return <div ref={ref} className={styles.ornament} aria-hidden="true">
    <motion.svg viewBox="0 0 1440 840" preserveAspectRatio="xMidYMid slice" className={styles.ornamentSvg} style={{ y: reducedMotion ? 0 : drift }}>
      {variant === "collection" && <>
        <g fill="none" stroke="#382838" strokeWidth="1.4" opacity=".2">
          {[0, 1, 2, 3, 4].map((n) => <path key={n} d={`M${1090 + n * 38} -100 C${815 + n * 35} 115 ${990 + n * 42} 195 1450 ${260 + n * 38}`} />)}
          <path d="M-130 640C130 580 340 650 460 880" />
          <path d="M-100 680C100 630 270 690 340 880" />
        </g>
        <path d="M1238 27c102-27 182 23 214 134-88 8-151-25-214-134Z" fill="#A2A76D" opacity=".18"/>
        <path d="M1280 60c52 14 96 41 137 83" fill="none" stroke="#382838" strokeWidth="2" opacity=".18"/>
      </>}
      {variant === "journal" && <>
        <g fill="none" stroke="#382838" opacity=".2">
          <circle cx="56" cy="90" r="148" strokeWidth="2"/>
          <circle cx="56" cy="90" r="176" strokeWidth="1"/>
          <path d="M-140 670c240-88 408-56 514 96M-155 708c216-62 355-19 444 99" strokeWidth="1.5"/>
        </g>
        <path d="M1220 660c86-46 171-39 247 23-46 90-140 118-247-23Z" fill="#F9F7EF" opacity=".16"/>
      </>}
      {variant === "palate" && <>
        <g fill="none" strokeWidth="2">
          <path d="M-70 770C160 630 308 805 538 690s357-5 565-70 298-19 405 14" stroke="#A2A76D" opacity=".3"/>
          <path d="M-80 810C150 660 316 842 540 732s358-12 570-84 278-19 410 6" stroke="#C67249" opacity=".28"/>
          <path d="M-100 850C130 700 315 880 554 770s364-21 568-90 288-18 426 11" stroke="#F9F7EF" opacity=".16"/>
          <circle cx="1280" cy="90" r="187" stroke="#F9F7EF" strokeWidth="1" opacity=".14"/>
          <circle cx="1280" cy="90" r="234" stroke="#F9F7EF" strokeWidth="1" opacity=".12"/>
        </g>
      </>}
    </motion.svg>
  </div>;
}
