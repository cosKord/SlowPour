"use client"

import * as React from "react"
import { CoffeeBagArt } from "@/components/coffee/coffee-bag-art"
import type { Coffee } from "@/types"

/** A photo pinned to a spread. x / y / w are percentages of the whole spread. */
export type JournalPrint = {
  src: string
  alt?: string
  x: number
  y: number
  w: number
  rotate?: number
  caption?: string
  /** A strip of washi tape across the top instead of a polaroid border. */
  tape?: boolean
}

/** A handwritten note on a spread. x / y / w are percentages of the whole spread. */
export type JournalNote = {
  x: number
  y: number
  w: number
  title?: string
  body?: string
  rotate?: number
  /** "card" sits on a torn paper slip; "ink" writes straight onto the photo. */
  style?: "card" | "ink"
}

/** One open double page. The image runs across both pages and folds at the spine. */
export type JournalSpread = {
  id?: string
  label?: string
  image?: string
  alt?: string
  imagePosition?: string
  /** Paper colour when there is no image, or under it while it loads. */
  paper?: string
  decorativeImage?: string
  decorativeCoffee?: Coffee
  fieldLog?: {
    date: string
    coffee: string
    origin: string
    method: string
    rating: string
    dose: string
    ratio: string
    grind: string
    temperatureAndTime: string
    tastingNotes: string
    notesLabel?: string
    nextLabel?: string
    nextBrew?: string
    milestones?: string
  }
  prints?: JournalPrint[]
  notes?: JournalNote[]
}

export type JournalAction = "more" | "share" | "delete" | "add"

export interface JournalSpreadCarouselProps {
  spreads: JournalSpread[]
  title?: string
  /** The line under the title. Defaults to the page count. */
  meta?: string
  height?: string
  initialIndex?: number
  /** Milliseconds between automatic page turns; false turns it off. Stops on the first touch. */
  autoPlay?: number | false
  onIndexChange?: (index: number) => void
  onAction?: (action: JournalAction, index: number) => void
  className?: string
  showFloor?: boolean
  variant?: "recipe"
  layout?: "field-log"
}

// #region pose
const OPEN = 5 // the centre spread's slight V at the spine, degrees
const SIDE = 80 // how far a stacked page turns towards the middle
const FOLD = 174 // a page folding shut over its partner

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

/** Spread shape for a stage: 5:4 on wide stages, taller pages on a portrait phone. */
export function spreadAspect(stageW: number, stageH: number): number {
  return stageW < 640 && stageH > stageW ? 0.86 : 1.25
}

/** Spread width for a stage, keeping room for the side stacks. */
export function spreadWidth(stageW: number, stageH: number): number {
  if (stageW <= 0 || stageH <= 0) return 0
  const narrow = stageW < 640
  return Math.round(Math.min(stageW * (narrow ? 0.84 : 0.54), stageH * 0.9 * spreadAspect(stageW, stageH), 980))
}

/**
 * Where spread `p` steps from the centre sits. 0 is open in the middle; ±1 is the first
 * page of each stack, and further ones step outwards and back.
 */
export function poseFor(p: number, w: number, sideAngle = SIDE) {
  const d = Math.abs(p)
  const a = d < 1 ? d : 1
  const s = p < 0 ? -1 : 1
  const out = d > 1 ? d - 1 : 0
  const x = s * (a * (w * 0.5 + w * 0.03) + out * w * 0.055)
  const z = -(a * w * 0.42 + out * w * 0.06)
  // Pages on the side they stack to turn edge-on; the other page folds shut over them.
  // The fold eases in (a * a) so the leaving and arriving spreads overlap mid-turn.
  const fold = a * a
  const left = p > 0 ? OPEN + (FOLD - OPEN) * fold : OPEN + (sideAngle - OPEN) * a
  const right = p < 0 ? -(OPEN + (FOLD - OPEN) * fold) : -(OPEN + (sideAngle - OPEN) * a)
  const shade = (deg: number) => clamp((Math.abs(deg) - OPEN) / 95, 0, 0.62)
  return {
    x,
    z,
    left,
    right,
    shadeLeft: shade(left),
    shadeRight: shade(right),
    opacity: clamp(7.2 - d, 0, 1),
    hidden: d > 7.2,
  }
}

/** Where a drag lets go: the nearest spread, nudged by the flick. */
export function settle(pos: number, velocity: number, n: number): number {
  return clamp(Math.round(pos + clamp(velocity * 0.18, -1.5, 1.5)), 0, Math.max(0, n - 1))
}

/** Tween length for a jump of `steps` spreads; longer jumps riffle faster per page. */
export function durationFor(steps: number): number {
  return steps <= 0 ? 0 : Math.round(560 * Math.sqrt(Math.min(steps, 12)))
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}
// #endregion

const CSS =
  ".jsc-root{position:relative;width:100%;display:grid;grid-template-rows:auto minmax(0,1fr) auto;overflow:hidden;" +
  "background:radial-gradient(120% 80% at 50% 35%,#eae0cb 0%,#d7c9af 100%);color:#382838;" +
  "font-family:ui-rounded,'SF Pro Rounded',system-ui,-apple-system,'Segoe UI',sans-serif;outline:none;user-select:none;-webkit-user-select:none;container-type:inline-size}" +
  ".jsc-root:focus-visible{box-shadow:inset 0 0 0 2px rgba(255,255,255,.55)}" +
  ".jsc-top{position:relative;padding:max(14px,1.6cqi) max(14px,1.8cqi) 0;display:flex;justify-content:space-between;align-items:flex-start}" +
  ".jsc-group{display:flex;gap:max(8px,.8cqi)}" +
  ".jsc-chip{display:grid;place-items:center;width:clamp(34px,3.4cqi,46px);height:clamp(34px,3.4cqi,46px);border-radius:50%;border:0;padding:0;cursor:pointer;" +
  "color:#382838;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1px rgba(255,255,255,.07);transition:background .2s}" +
  ".jsc-chip:hover{background:rgba(255,255,255,.16)}" +
  ".jsc-chip[aria-pressed=true]{box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.85)}" +
  ".jsc-chip svg{width:46%;height:46%}" +
  ".jsc-head{position:absolute;left:50%;top:max(40px,4.4cqi);transform:translateX(-50%);text-align:center;white-space:nowrap;pointer-events:none}" +
  ".jsc-title{margin:0;font-weight:700;font-size:clamp(22px,2.7cqi,40px);letter-spacing:-.01em;line-height:1.1}" +
  ".jsc-meta{display:inline-flex;align-items:center;gap:.45em;margin-top:.55em;font-size:clamp(11px,1cqi,14px);font-weight:600;opacity:.82}" +
  ".jsc-meta svg{width:1.15em;height:1.15em}" +
  ".jsc-stage{position:relative;margin-top:clamp(64px,7cqi,104px);touch-action:pan-y;cursor:grab}" +
  ".jsc-stage[data-drag]{cursor:grabbing}" +
  ".jsc-floor{position:absolute;left:50%;top:50%;width:calc(var(--jsc-w) * 1.55);height:calc(var(--jsc-h) * .62);transform:translate(-50%,calc(var(--jsc-h) * .2));" +
  "background:#20243a;opacity:.55;filter:blur(calc(var(--jsc-w) * .03));border-radius:calc(var(--jsc-w) * .04);pointer-events:none}" +
  ".jsc-view{position:absolute;inset:0;perspective:calc(var(--jsc-w) * 2.3);perspective-origin:50% 46%}" +
  ".jsc-scene{position:absolute;left:50%;top:50%;width:0;height:0;transform-style:preserve-3d}" +
  ".jsc-item{position:absolute;left:0;top:0;transform-style:preserve-3d;visibility:hidden}" +
  ".jsc-page{position:absolute;top:calc(var(--jsc-h) * -.5);width:calc(var(--jsc-w) * .5);height:var(--jsc-h);overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden;" +
  "background:#efebe3;box-shadow:0 1px 0 rgba(255,255,255,.35) inset}" +
  ".jsc-page[data-side=l]{left:calc(var(--jsc-w) * -.5);transform-origin:100% 50%;border-radius:calc(var(--jsc-w) * .034) 0 0 calc(var(--jsc-w) * .034)}" +
  ".jsc-page[data-side=r]{left:0;transform-origin:0 50%;border-radius:0 calc(var(--jsc-w) * .034) calc(var(--jsc-w) * .034) 0}" +
  ".jsc-sheet{position:absolute;top:0;width:var(--jsc-w);height:var(--jsc-h);pointer-events:none}" +
  ".jsc-page[data-side=l]>.jsc-sheet{left:0}" +
  ".jsc-page[data-side=r]>.jsc-sheet{left:calc(var(--jsc-w) * -.5)}" +
  ".jsc-bg{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;display:block}" +
  ".jsc-gutter{position:absolute;inset:0}" +
  ".jsc-page[data-side=l] .jsc-gutter{background:linear-gradient(90deg,rgba(255,255,255,0) 82%,rgba(20,18,30,.08) 93%,rgba(20,18,30,.26))}" +
  ".jsc-page[data-side=r] .jsc-gutter{background:linear-gradient(270deg,rgba(255,255,255,0) 82%,rgba(20,18,30,.08) 93%,rgba(20,18,30,.26))}" +
  ".jsc-shade{position:absolute;inset:0;background:#141729;opacity:var(--jsc-s,0)}" +
  ".jsc-print{position:absolute;margin:0;background:#fbfaf6;padding:3.5% 3.5% 0;box-shadow:0 .4em 1em rgba(18,16,30,.28),0 .1em .2em rgba(18,16,30,.2);font-size:calc(var(--jsc-w) * .01)}" +
  ".jsc-print img{display:block;width:100%;height:auto;max-width:none;aspect-ratio:4/5;object-fit:cover}" +
  ".jsc-print figcaption{font-family:'Instrument Serif',serif;font-weight:600;color:#2a2c3e;text-align:center;font-size:calc(var(--jsc-w) * .024);line-height:1;padding:.32em 0 .4em}" +
  ".jsc-print[data-tape]{padding:0;background:none}" +
  ".jsc-print[data-tape]::before{content:'';position:absolute;left:50%;top:-6%;width:46%;height:11%;transform:translateX(-50%) rotate(-3deg);background:rgba(236,226,196,.78);box-shadow:0 1px 2px rgba(0,0,0,.12)}" +
  ".jsc-print[data-tape] figcaption{position:absolute;left:0;right:0;bottom:-1.1em;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.55)}" +
  ".jsc-note{position:absolute;font-family:'Instrument Serif',serif;font-weight:600;line-height:1.02;color:#272a3f}" +
  ".jsc-note[data-style=card]{background:#f6f1e6;padding:.7em .85em .8em;box-shadow:0 .3em .9em rgba(18,16,30,.25);clip-path:polygon(0 3%,7% 0,18% 2%,31% 0,46% 2%,60% 0,74% 2%,88% 0,100% 2%,99% 100%,84% 98%,69% 100%,52% 98%,37% 100%,21% 98%,6% 100%,1% 97%)}" +
  ".jsc-note[data-style=ink]{color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.45),0 0 12px rgba(0,0,0,.25)}" +
  ".jsc-note b{display:block;font-weight:600;font-size:calc(var(--jsc-w) * .048);margin-bottom:.12em}" +
  ".jsc-note span{display:block;font-size:calc(var(--jsc-w) * .028)}" +
  ".jsc-bar{display:flex;justify-content:center;gap:clamp(12px,1.4cqi,20px);padding:clamp(14px,1.8cqi,28px) 0 clamp(22px,3cqi,44px);position:relative;z-index:2}" +
  ".jsc-btn{display:grid;place-items:center;width:clamp(40px,3.6cqi,52px);height:clamp(40px,3.6cqi,52px);border-radius:50%;border:0;padding:0;cursor:pointer;color:#262a40;background:#fff;" +
  "box-shadow:0 4px 14px rgba(10,12,28,.28);transition:transform .2s cubic-bezier(.2,.7,.2,1)}" +
  ".jsc-btn:hover{transform:translateY(-2px)}" +
  ".jsc-btn:active{transform:scale(.94)}" +
  ".jsc-btn svg{width:44%;height:44%}" +
  ".jsc-chip:focus-visible,.jsc-btn:focus-visible{outline:2px solid #fff;outline-offset:3px}" +
  ".jsc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}" +
  "@media (prefers-reduced-motion:reduce){.jsc-btn,.jsc-chip{transition:none}}" +
  ".jsc-root[data-variant=recipe]{background:rgba(250,247,242,.48);border:1px solid rgba(255,255,255,.72);border-radius:24px;backdrop-filter:blur(18px) saturate(145%);box-shadow:0 12px 34px rgba(71,49,45,.12),inset 0 1px rgba(255,255,255,.82)}" +
  ".jsc-root[data-variant=recipe] .jsc-top{z-index:3;min-height:130px;justify-content:center;padding:26px 20px 0}" +
  ".jsc-root[data-variant=recipe] .jsc-head{position:static;transform:none;white-space:normal}" +
  ".jsc-root[data-variant=recipe] .jsc-title{font-size:clamp(30px,3.6cqi,48px)}" +
  ".jsc-root[data-variant=recipe] .jsc-actions{position:absolute;right:26px;top:26px;display:flex;gap:8px}" +
  ".jsc-root[data-variant=recipe] .jsc-delete{display:grid;place-items:center;width:36px;height:36px;border:1px solid rgba(75,42,43,.22);border-radius:50%;background:#fffaf0a8;color:#4b2a2b;cursor:pointer}" +
  ".jsc-root[data-variant=recipe] .jsc-delete:hover{background:#fffaf0}" +
  ".jsc-root[data-variant=recipe] .jsc-delete svg{width:18px;height:18px}" +
  ".jsc-root[data-variant=recipe] .jsc-stage{margin-top:0}" +
  ".jsc-root[data-variant=recipe] .jsc-sheet::before{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,transparent 7.8%,rgba(174,108,92,.22) 8%,rgba(174,108,92,.22) 8.2%,transparent 8.4%,transparent 57.8%,rgba(174,108,92,.22) 58%,rgba(174,108,92,.22) 58.2%,transparent 58.4%),repeating-linear-gradient(180deg,transparent 0 37px,rgba(112,117,108,.13) 38px,transparent 39px);opacity:.75}" +
  ".jsc-root[data-variant=recipe] .jsc-method-art{position:absolute;left:0;bottom:-13%;width:48%;height:82%;object-fit:contain;opacity:.15;transform:rotate(-12deg);pointer-events:none}" +
  ".jsc-root[data-variant=recipe] .jsc-bag-art{position:absolute;left:56%;bottom:-12%;width:51%;height:88%;opacity:.18;transform:rotate(-8deg);pointer-events:none;display:grid;place-items:center}" +
  ".jsc-root[data-variant=recipe] .jsc-bag-art .coffee-bag-art{width:100%;height:100%;object-fit:contain}" +
  ".jsc-root[data-variant=recipe] .jsc-note{z-index:1}" +
  ".jsc-root[data-variant=recipe] .jsc-page{background:#f8f1e4;box-shadow:inset 0 0 0 1px rgba(106,80,64,.09),0 6px 16px rgba(77,52,44,.1)}" +
  ".jsc-root[data-variant=recipe] .jsc-chip{background:rgba(255,251,243,.42);box-shadow:inset 0 0 0 1px rgba(95,68,59,.16)}" +
  ".jsc-root[data-variant=recipe] .jsc-btn{background:#fffaf0;color:#4b2a2b;box-shadow:0 4px 12px rgba(77,52,44,.2)}" +
  ".jsc-root[data-variant=recipe] .jsc-title{font-family:var(--font-fraunces),Georgia,serif;color:#4b2a2b}" +
  ".jsc-root[data-variant=recipe] .jsc-note[data-style=card]{background:none;box-shadow:none;clip-path:none;padding:.15em 0 .5em;border-top:1px solid rgba(56,40,56,.3)}" +
  ".jsc-root[data-variant=recipe] .jsc-note:first-of-type{border-top:0}" +
  ".jsc-root[data-variant=recipe] .jsc-note b{font-family:var(--font-fraunces),Georgia,serif;font-weight:700;font-size:calc(var(--jsc-w) * .045);line-height:1.03;margin-bottom:.28em;color:#4b2a2b}" +
  ".jsc-root[data-variant=recipe] .jsc-note:first-of-type b{font-size:calc(var(--jsc-w) * .061)}" +
  ".jsc-root[data-variant=recipe] .jsc-note span{font-family:'DM Sans Variable',sans-serif;font-size:calc(var(--jsc-w) * .027);line-height:1.35;color:#6a564e}" +
  ".jsc-root[data-variant=recipe] .jsc-shade{background:#62475a;opacity:calc(var(--jsc-s,0) * .24)}" +
  ".jsc-root[data-layout=field-log] .jsc-page{background:#fbf8f1;box-shadow:inset 0 0 0 1px rgba(83,53,55,.08),0 6px 16px rgba(77,52,44,.1)}" +
  ".jsc-root[data-layout=field-log] .jsc-sheet::before{background-image:radial-gradient(rgba(87,63,65,.19) .85px,transparent .95px);background-size:20px 20px;opacity:.78}" +
  ".jsc-root[data-layout=field-log] .jsc-bag-art{left:62%;bottom:5%;width:35%;height:61%;opacity:.5;transform:rotate(-9deg)}" +
  ".jsc-root[data-layout=field-log] .jsc-method-art{left:61%;bottom:2%;width:38%;height:62%;opacity:.2;transform:rotate(-9deg)}" +
  ".jsc-fieldlog{position:absolute;inset:0;z-index:1;color:#402b35}" +
  ".jsc-fieldlog-page{position:absolute;top:0;width:50%;height:100%;display:flex;flex-direction:column;padding:7% 4% 5%;box-sizing:border-box}" +
  ".jsc-fieldlog-page--left{left:0;padding-right:3.7%}" +
  ".jsc-fieldlog-page--right{left:50%;padding-left:3.7%}" +
  ".jsc-fieldlog-kicker{font-family:'DM Sans Variable',sans-serif;font-size:calc(var(--jsc-w) * .019);font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#8b7975;line-height:1.3}" +
  ".jsc-fieldlog-intro{position:relative;min-height:28%;padding:2% 22% 3% 0}" +
  ".jsc-fieldlog-name{max-width:100%;margin:0;font-family:var(--font-handwriting),cursive;font-size:calc(var(--jsc-w) * .036);font-weight:700;line-height:1;overflow-wrap:anywhere;color:#3c2630}" +
  ".jsc-fieldlog-origin{margin:1.5% 0 0;font-family:'DM Sans Variable',sans-serif;font-size:calc(var(--jsc-w) * .024);line-height:1.3;color:#826f6c}" +
  ".jsc-fieldlog-stamp{position:absolute;top:0;right:0;min-width:18%;padding:1% 2%;border:2px solid #8b6c76;border-radius:20%;text-align:center;transform:rotate(-5deg);box-shadow:inset 0 0 0 3px #fbf8f1,inset 0 0 0 4px #8b6c76;background:rgba(251,248,241,.82);font-family:'DM Sans Variable',sans-serif}" +
  ".jsc-fieldlog-stamp strong{display:block;font-size:calc(var(--jsc-w) * .036);line-height:1.1}" +
  ".jsc-fieldlog-stamp small{font-size:calc(var(--jsc-w) * .019);font-weight:700;letter-spacing:.09em}" +
  ".jsc-fieldlog-details{display:grid;grid-template-columns:1fr 1fr;column-gap:7%;margin-top:4%}" +
  ".jsc-fieldlog-detail{min-height:calc(var(--jsc-h) * .2);padding:2% 0}" +
  ".jsc-fieldlog-detail b{display:block;margin-bottom:3%;font-family:'DM Sans Variable',sans-serif;font-size:calc(var(--jsc-w) * .017);font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:#887b77}" +
  ".jsc-fieldlog-detail span{display:block;font-family:var(--font-handwriting),cursive;font-size:calc(var(--jsc-w) * .032);font-weight:600;line-height:1.15}" +
  ".jsc-fieldlog-milestones{margin-top:4%;font-family:'DM Sans Variable',sans-serif;font-size:calc(var(--jsc-w) * .02);line-height:1.4;color:#826f6c}" +
  ".jsc-fieldlog-notes{margin-top:3%;min-height:44%}" +
  ".jsc-fieldlog-notes p{margin:0;font-family:var(--font-handwriting),cursive;font-size:calc(var(--jsc-w) * .032);font-weight:600;line-height:1.43;overflow-wrap:anywhere}" +
  ".jsc-fieldlog-next{margin-top:5%}" +
  ".jsc-fieldlog-next .jsc-fieldlog-kicker{color:#bd634e}" +
  ".jsc-fieldlog-next p{display:inline-block;margin:2% 0 0;border-bottom:2px solid rgba(189,99,78,.55);font-family:var(--font-handwriting),cursive;font-size:calc(var(--jsc-w) * .03);font-weight:600;line-height:1.25}" +
  ".jsc-fieldlog-next p{max-width:100%}"

const ICON = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24", "aria-hidden": true } as const

function Icon({ name }: { name: string }) {
  switch (name) {
    case "book":
      return (
        <svg {...ICON}>
          <path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
        </svg>
      )
    case "grid":
      return (
        <svg {...ICON}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      )
    case "search":
      return (
        <svg {...ICON}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.6-3.6" />
        </svg>
      )
    case "menu":
      return (
        <svg {...ICON}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      )
    case "lock":
      return (
        <svg {...ICON}>
          <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        </svg>
      )
    case "more":
      return (
        <svg {...ICON} strokeWidth={3}>
          <path d="M5 12h.01M12 12h.01M19 12h.01" />
        </svg>
      )
    case "share":
      return (
        <svg {...ICON}>
          <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
        </svg>
      )
    case "delete":
      return (
        <svg {...ICON}>
          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
        </svg>
      )
    default:
      return (
        <svg {...ICON}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      )
  }
}

function Sheet({ spread }: { spread: JournalSpread }) {
  return (
    <div className="jsc-sheet" style={{ background: spread.paper }}>
      {spread.image ? (
        <img className="jsc-bg" src={spread.image} alt="" draggable={false} decoding="async" style={{ maxWidth: "none", objectPosition: spread.imagePosition }} />
      ) : null}
      {spread.decorativeImage ? <img className="jsc-method-art" src={spread.decorativeImage} alt="" draggable={false} decoding="async" /> : null}
      {spread.decorativeCoffee ? <div className="jsc-bag-art" aria-hidden="true"><CoffeeBagArt coffee={spread.decorativeCoffee} /></div> : null}
      {spread.fieldLog ? (
        <div className="jsc-fieldlog">
          <div className="jsc-fieldlog-page jsc-fieldlog-page--left">
            <span className="jsc-fieldlog-kicker">{spread.fieldLog.date}</span>
            <div className="jsc-fieldlog-intro">
              <h3 className="jsc-fieldlog-name">{spread.fieldLog.coffee}</h3>
              <p className="jsc-fieldlog-origin">{spread.fieldLog.origin}</p>
            </div>
            <div className="jsc-fieldlog-details">
              <div className="jsc-fieldlog-detail"><b>Dose / water</b><span>{spread.fieldLog.dose}</span></div>
              <div className="jsc-fieldlog-detail"><b>Ratio</b><span>{spread.fieldLog.ratio}</span></div>
              <div className="jsc-fieldlog-detail"><b>Grind</b><span>{spread.fieldLog.grind}</span></div>
              <div className="jsc-fieldlog-detail"><b>Temp &amp; time</b><span>{spread.fieldLog.temperatureAndTime}</span></div>
            </div>
            {spread.fieldLog.milestones ? <p className="jsc-fieldlog-milestones">{spread.fieldLog.milestones}</p> : null}
          </div>
          <div className="jsc-fieldlog-page jsc-fieldlog-page--right">
            <span className="jsc-fieldlog-kicker">{spread.fieldLog.notesLabel ?? "Tasting notes"}</span>
            <div className="jsc-fieldlog-notes"><p>{spread.fieldLog.tastingNotes}</p></div>
            {spread.fieldLog.nextBrew ? <div className="jsc-fieldlog-next"><span className="jsc-fieldlog-kicker">{spread.fieldLog.nextLabel ?? "Next brew dial-in"}</span><p>{spread.fieldLog.nextBrew}</p></div> : null}
          </div>
        </div>
      ) : null}
      {spread.prints?.map((p, k) => (
        <figure
          key={k}
          className="jsc-print"
          data-tape={p.tape ? "" : undefined}
          style={{ left: p.x + "%", top: p.y + "%", width: p.w + "%", transform: "rotate(" + (p.rotate ?? 0) + "deg)" }}
        >
          <img src={p.src} alt="" draggable={false} decoding="async" style={{ maxWidth: "none" }} />
          {p.caption ? <figcaption>{p.caption}</figcaption> : null}
        </figure>
      ))}
      {!spread.fieldLog && spread.notes?.map((t, k) => (
        <div
          key={k}
          className="jsc-note"
          data-style={t.style ?? "card"}
          style={{ left: t.x + "%", top: t.y + "%", width: t.w + "%", transform: "rotate(" + (t.rotate ?? 0) + "deg)" }}
        >
          {t.title ? <b>{t.title}</b> : null}
          {t.body ? <span>{t.body}</span> : null}
        </div>
      ))}
    </div>
  )
}

export default function JournalSpreadCarousel({
  spreads,
  title = "Journal",
  meta,
  height = "min(70vw, 680px)",
  initialIndex = 0,
  autoPlay = false,
  onIndexChange,
  className,
  showFloor = true,
  variant,
  layout,
  onAction,
}: JournalSpreadCarouselProps) {
  const n = spreads.length
  const start = clamp(Math.round(initialIndex), 0, Math.max(0, n - 1))
  const [index, setIndex] = React.useState(start)
  const [reduced, setReduced] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const rootRef = React.useRef(null as HTMLDivElement | null)
  const stageRef = React.useRef(null as HTMLDivElement | null)
  const items = React.useRef([] as (HTMLDivElement | null)[])
  const pages = React.useRef([] as (HTMLDivElement | null)[])
  const width = React.useRef(0) // cached on resize; the frame loop never measures
  const pos = React.useRef(start)
  const target = React.useRef(start)
  const tween = React.useRef(null as null | { from: number; to: number; t0: number; dur: number; ease: (t: number) => number })
  const raf = React.useRef(0)
  const drag = React.useRef(null as null | { id: number; x: number; from: number; lastX: number; lastT: number; v: number; moved: boolean })
  const touched = React.useRef(false)
  const reducedRef = React.useRef(false)
  const onIndexRef = React.useRef(onIndexChange)
  React.useEffect(() => { onIndexRef.current = onIndexChange }, [onIndexChange])

  const paint = React.useCallback(() => {
    const w = width.current
    if (!w) return
    for (let i = 0; i < items.current.length; i++) {
      const el = items.current[i]
      if (!el) continue
      const q = poseFor(i - pos.current, w)
      if (q.hidden) {
        el.style.visibility = "hidden"
        continue
      }
      el.style.visibility = "visible"
      el.style.opacity = String(q.opacity)
      el.style.transform = "translate3d(" + q.x.toFixed(2) + "px,0," + q.z.toFixed(2) + "px)"
      const l = pages.current[i * 2]
      const r = pages.current[i * 2 + 1]
      if (l) {
        l.style.transform = "rotateY(" + q.left.toFixed(2) + "deg)"
        l.style.setProperty("--jsc-s", q.shadeLeft.toFixed(3))
      }
      if (r) {
        r.style.transform = "rotateY(" + q.right.toFixed(2) + "deg)"
        r.style.setProperty("--jsc-s", q.shadeRight.toFixed(3))
      }
    }
  }, [])

  const frame = React.useCallback(
    (t: number) => {
      raf.current = 0
      const tw = tween.current
      if (tw) {
        const k = tw.dur > 0 ? clamp((t - tw.t0) / tw.dur, 0, 1) : 1
        pos.current = tw.from + (tw.to - tw.from) * tw.ease(k)
        if (k >= 1) tween.current = null
      }
      paint()
      // eslint-disable-next-line react-hooks/immutability
      if (tween.current) raf.current = requestAnimationFrame(frame)
    },
    [paint],
  )

  const kick = React.useCallback(() => {
    if (!raf.current) raf.current = requestAnimationFrame(frame)
  }, [frame])

  const go = React.useCallback(
    (to: number, ease = easeInOut) => {
      const next = clamp(to, 0, Math.max(0, n - 1))
      if (next !== target.current) {
        target.current = next
        setIndex(next)
        onIndexRef.current?.(next)
      }
      const dur = reducedRef.current ? 0 : durationFor(Math.abs(next - pos.current))
      tween.current = { from: pos.current, to: next, t0: performance.now(), dur, ease }
      kick()
    },
    [n, kick],
  )

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const on = () => {
      reducedRef.current = mq.matches
      setReduced(mq.matches)
    }
    on()
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])

  // Measure once per resize and cache it; the per-frame paint reads only the cache.
  React.useEffect(() => {
    const stage = stageRef.current
    const root = rootRef.current
    if (!stage || !root) return
    const ro = new ResizeObserver(([entry]) => {
      const { width: sw, height: sh } = entry.contentRect
      const w = layout === "field-log"
        ? Math.round(Math.min(sw * 1.08, sh * 0.92 * spreadAspect(sw, sh) * 1.5, 1300))
        : variant === "recipe"
        ? Math.round(Math.min(sw * (sw < 640 ? 0.8 : 0.72), sh * 0.9 * spreadAspect(sw, sh), 980))
        : spreadWidth(sw, sh)
      width.current = w
      root.style.setProperty("--jsc-w", w + "px")
      root.style.setProperty("--jsc-h", layout === "field-log" ? Math.round(w / (spreadAspect(sw, sh) * 1.5)) + "px" : Math.round(w / spreadAspect(sw, sh)) + "px")
      paint()
    })
    ro.observe(stage)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf.current)
      raf.current = 0
    }
  }, [paint, variant, layout])

  React.useEffect(() => {
    if (pos.current > n - 1) go(n - 1)
    else paint()
  }, [n, go, paint])

  // Turns pages on its own until someone touches it; pauses off-screen and in a hidden tab.
  React.useEffect(() => {
    const root = rootRef.current
    if (!autoPlay || reduced || n < 2 || !root) return
    let visible = true
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
    })
    io.observe(root)
    const id = window.setInterval(() => {
      if (touched.current || !visible || document.hidden || drag.current) return
      go(target.current >= n - 1 ? 0 : target.current + 1)
    }, autoPlay)
    return () => {
      window.clearInterval(id)
      io.disconnect()
    }
  }, [autoPlay, reduced, n, go])

  const stop = () => {
    touched.current = true
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || n < 1) return
    stop()
    tween.current = null
    drag.current = { id: e.pointerId, x: e.clientX, from: pos.current, lastX: e.clientX, lastT: e.timeStamp, v: 0, moved: false }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    const w = width.current
    if (!d || d.id !== e.pointerId || !w) return
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true
      setDragging(true)
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }
    if (!d.moved) return
    const dt = Math.max(1, e.timeStamp - d.lastT)
    d.v = d.v * 0.6 + (-(e.clientX - d.lastX) / (w * 0.42) / (dt / 1000)) * 0.4
    d.lastX = e.clientX
    d.lastT = e.timeStamp
    pos.current = clamp(d.from - dx / (w * 0.42), -0.3, n - 0.7)
    kick()
  }

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    drag.current = null
    setDragging(false)
    if (d.moved) {
      go(settle(pos.current, d.v, n), easeOut)
      return
    }
    const hit = (e.target as HTMLElement).closest("[data-i]")
    const i = hit ? Number(hit.getAttribute("data-i")) : target.current
    go(i)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, PageDown: 1, ArrowLeft: -1, ArrowUp: -1, PageUp: -1 }
    if (e.target !== e.currentTarget) return
    if (e.key in map) go(target.current + map[e.key])
    else if (e.key === "Home") go(0)
    else if (e.key === "End") go(n - 1)
    else return
    e.preventDefault()
    stop()
  }

  // Trackpads swipe sideways; a vertical wheel is left to scroll the page.
  const wheel = React.useRef({ acc: 0, at: 0 })
  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      const w = wheel.current
      w.acc += e.deltaX
      if (Math.abs(w.acc) < 40 || e.timeStamp - w.at < 320) return
      touched.current = true
      w.at = e.timeStamp
      go(target.current + (w.acc > 0 ? 1 : -1))
      w.acc = 0
    }
    stage.addEventListener("wheel", onWheel, { passive: true })
    return () => stage.removeEventListener("wheel", onWheel)
  }, [go])

  const current = spreads[index]
  const pagesLabel = meta ?? n * 2 + " Pages"

  return (
    <div
      ref={rootRef}
      className={"jsc-root" + (className ? " " + className : "")}
      data-variant={variant}
      data-layout={layout}
      style={{ height }}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={title}
      onKeyDown={onKeyDown}
    >
      <style>{CSS}</style>
      <div className="jsc-top">
        {variant !== "recipe" && <div className="jsc-group">
          <button type="button" className="jsc-chip" aria-pressed="true" aria-label="Spread view">
            <Icon name="book" />
          </button>
          <button type="button" className="jsc-chip" aria-pressed="false" aria-label="Grid view">
            <Icon name="grid" />
          </button>
        </div>}
        <div className="jsc-head">
          <h2 className="jsc-title">{title}</h2>
          <div className="jsc-meta">
            <Icon name="lock" />
            {pagesLabel}
          </div>
        </div>
        {variant === "recipe" && onAction && current && <div className="jsc-actions"><button type="button" className="jsc-delete" aria-label="Add new entry" title="Add new entry" onClick={() => onAction("add", index)}><Icon name="add" /></button><button type="button" className="jsc-delete" aria-label={`Delete ${current.label ?? "recipe"}`} title={`Delete ${current.label ?? "recipe"}`} onClick={() => onAction("delete", index)}><Icon name="delete" /></button></div>}
        {variant !== "recipe" && <div className="jsc-group">
          <button type="button" className="jsc-chip" aria-label="Search">
            <Icon name="search" />
          </button>
          <button type="button" className="jsc-chip" aria-label="Menu">
            <Icon name="menu" />
          </button>
        </div>}
      </div>

      <div
        ref={stageRef}
        className="jsc-stage"
        data-drag={dragging ? "" : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {showFloor && <div className="jsc-floor" aria-hidden="true" />}
        <div className="jsc-view">
          <div className="jsc-scene">
            {spreads.map((s, i) => (
              <div
                key={s.id ?? i}
                ref={(el) => {
                  items.current[i] = el
                }}
                className="jsc-item"
                data-i={i}
                role="group"
                aria-roledescription="spread"
                aria-label={(s.label ?? "Spread " + (i + 1)) + ", " + (i + 1) + " of " + n}
                aria-hidden={i !== index}
              >
                {s.alt ? <span className="jsc-sr">{s.alt}</span> : null}
                {(["l", "r"] as const).map((side, k) => (
                  <div
                    key={side}
                    ref={(el) => {
                      pages.current[i * 2 + k] = el
                    }}
                    className="jsc-page"
                    data-side={side}
                  >
                    <Sheet spread={s} />
                    <div className="jsc-gutter" />
                    <div className="jsc-shade" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="jsc-bar">
        <button type="button" className="jsc-btn" aria-label="Previous spread" disabled={index === 0} onClick={() => { stop(); go(index - 1) }}>←</button>
        <button type="button" className="jsc-btn" aria-label="Next spread" disabled={index === n - 1} onClick={() => { stop(); go(index + 1) }}>→</button>
      </div>

      <p className="jsc-sr" aria-live="polite">
        {current ? (current.label ?? "Spread " + (index + 1)) + ", " + (index + 1) + " of " + n : ""}
      </p>
    </div>
  )
}
