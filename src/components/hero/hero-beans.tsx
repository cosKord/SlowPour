import Image from "next/image";
import type { CSSProperties } from "react";

const beans = [
  [14, 58, 54, -30, 9, 0, 1, 349, 360, false],
  [26, 18, 40, 20, 7.5, -2, 2, 220, 360, false],
  [78, 16, 58, 40, 10, -4, 3, 360, 330, false],
  [86, 52, 44, -15, 8, -1, 4, 356, 360, false],
  [66, 72, 36, 60, 7, -3, 2, 220, 360, false],
  [34, 78, 64, 10, 11, -5, 3, 360, 330, true],
  [92, 82, 88, -40, 12, -2, 4, 356, 360, true],
  [4, 86, 96, 25, 13, -6, 1, 349, 360, true],
  [52, 8, 30, -50, 8.5, -1, 2, 220, 360, false],
] as const;

export function HeroBeans() {
  return <div className="hero-beans" aria-hidden="true">
    {beans.map(([left, top, width, rotation, period, delay, bean, assetWidth, assetHeight, blur], index) => <span className={`hero-bean hero-bean--${index + 1}`} key={index} style={{ left: `${left}%`, top: `${top}%`, width, filter: blur ? "blur(3px)" : undefined, "--bean-rotation": `${rotation}deg`, "--bean-period": `${period}s`, "--bean-delay": `${delay}s` } as CSSProperties}>
      <Image src={`/assets/coffee-bean-${bean}.webp`} alt="" width={assetWidth} height={assetHeight} sizes="96px" />
    </span>)}
  </div>;
}
