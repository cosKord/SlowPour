import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { PageHillsBackdrop } from "@/components/page-hills-backdrop";

export function AmbientBackdrop({ visible }: { visible: boolean }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const show = visible && !/^\/app\/coffees(?:\/[^/]+)?\/?$/.test(pathname);
  const variant = pathname.startsWith("/app/recipes") ? "recipes"
    : pathname.startsWith("/app/brews") ? "journal"
    : pathname.startsWith("/app/insights") ? "insights"
    : pathname.startsWith("/app/equipment") ? "equipment"
    : pathname.startsWith("/app/settings") ? "settings"
    : "today";
  return (
    <motion.div
      aria-hidden="true"
      initial={false}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.45 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <AnimatePresence mode="sync">
      <motion.svg
        key={variant}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0.15 : 0.6, ease: "easeInOut" }}
        width="100%"
        height="100%"
        viewBox={variant === "today" ? "0 0 1440 900" : "0 0 1600 1000"}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <clipPath id="dashboard-topo-corner">
            <path d="M0 0H660V518H0Z" />
          </clipPath>
        </defs>
        {variant === "today" && <>
        <ellipse
          cx="1210"
          cy="240"
          rx="210"
          ry="135"
          fill="#623248"
          opacity=".18"
          transform="rotate(-25 1210 240)"
        />
        <ellipse
          cx="280"
          cy="700"
          rx="240"
          ry="130"
          fill="#8e9f72"
          opacity=".24"
        />
        <ellipse
          cx="1200"
          cy="820"
          rx="190"
          ry="120"
          fill="#c99b72"
          opacity=".2"
        />
        <g clipPath="url(#dashboard-topo-corner)" fill="none" stroke="#5a3544">
          {Array.from({ length: 7 }, (_, index) => (
            <path
              key={index}
              d="M-60 470C80 480 75 330 180 280S450 330 470 180 580 100 640-40"
              transform={`translate(${-index * 28} ${-index * 24})`}
              strokeWidth={1.5 - index * 0.075}
              opacity={0.4 - index * 0.043}
            />
          ))}
        </g>
        <text
          x="160"
          y="275"
          transform="rotate(-38 160 275)"
          fill="#4e2a3b"
          opacity=".46"
          fontSize="11"
        >
          1,850M
        </text>
        {[
          "translate(1210 20) rotate(20)",
          "translate(100 880) rotate(-145)",
          "translate(1350 890) rotate(-155)",
        ].map((transform, index) => (
          <g
            key={transform}
            transform={transform}
            opacity={index === 2 ? 0.55 : 0.8}
          >
            <path
              d="M0 0Q100 140 20 420"
              fill="none"
              stroke="#6e8454"
              strokeWidth="4"
            />
            <g transform="translate(30 385)">
              <circle cx="-6" cy="2" r="10" fill="#52263b" />
              <circle cx="8" cy="12" r="9" fill="#b85c43" />
              <circle cx="-8" cy="-1" r="2" fill="#f6e9dc" />
            </g>
            <g transform="translate(25 403)">
              <circle cx="-6" cy="2" r="10" fill="#b85c43" />
              <circle cx="8" cy="12" r="9" fill="#52263b" />
              <circle cx="-8" cy="-1" r="2" fill="#f6e9dc" />
            </g>
            <g transform="translate(20 420)">
              <circle cx="-6" cy="2" r="10" fill="#52263b" />
              <circle cx="8" cy="12" r="9" fill="#b85c43" />
              <circle cx="-8" cy="-1" r="2" fill="#f6e9dc" />
            </g>
            {[
              { x: 26, y: 45 },
              { x: 48, y: 115 },
              { x: 56, y: 190 },
              { x: 51, y: 270 },
              { x: 40, y: 340 },
            ].map(({ x, y }, i) => (
              <g
                key={y}
                transform={`translate(${x} ${y}) rotate(${i % 2 ? 35 : -145})`}
              >
                <path
                  d="M0 0C30-65 100-75 130-45C100-5 45 25 0 0"
                  fill={i % 2 ? "#7d9361" : "#6e8454"}
                />
                <path
                  d="M0 0Q65-27 120-44"
                  fill="none"
                  stroke="#eae0ce"
                  strokeWidth="1.3"
                />
                <circle cx="-6" cy="2" r="10" fill="#52263b" />
                <circle cx="8" cy="12" r="9" fill="#b85c43" />
                <circle cx="-8" cy="-1" r="2" fill="#f6e9dc" />
              </g>
            ))}
          </g>
        ))}
        </>}
        {variant !== "today" && <PageHillsBackdrop variant={variant} />}
      </motion.svg>
      </AnimatePresence>
    </motion.div>
  );
}
