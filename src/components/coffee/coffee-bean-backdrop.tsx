import type { Coffee } from "@/types";

export function CoffeeBeanBackdrop({ coffee }: { coffee: Coffee }) {
  const tone = coffee.packaging.bagColor.toLowerCase();
  const palette = tone === "#c67249"
    ? ["#D7DDD0", "#E4E8DE", "#D4BEAF", "#DFCDC1"]
    : tone === "#a2a76d"
      ? ["#DDD1C5", "#E7DDD3", "#C7CEBC", "#D6DCCD"]
      : ["#D9D2C9", "#E5DFD7", "#CEBFC7", "#DCD0D6"];

  return (
    <svg aria-hidden="true" viewBox="0 0 520 560" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible select-none">
      {[
        { transform: "translate(260 280) rotate(-20)", scale: 1, body: palette[0], light: palette[1], cleft: 16 },
        { transform: "translate(425 425) rotate(32) scale(0.42)", scale: 0.42, body: palette[2], light: palette[3], cleft: 20 },
      ].map((bean) => (
        <g key={bean.transform} transform={bean.transform}>
          <path d="M0-252C138-252 214-154 214 0S138 252 0 252-214 154-214 0-138-252 0-252Z" fill={bean.body} className="transition-[fill] duration-500" />
          <path d="M6-248C136-244 208-148 208 0S134 244 10 248C-14 148 44 58 12-14-20-86 24-166 6-248Z" fill={bean.light} opacity=".65" className="transition-[fill] duration-500" />
          <path d="M10-244C24-152-24-74 8 6 40 86-16 162 4 244" fill="none" stroke="#EAE0CE" strokeWidth={bean.cleft} strokeLinecap="round" />
          <path d="M18-236C30-148-16-72 16 6 48 84-8 160 12 238" fill="none" stroke="#2E2025" strokeWidth="2" strokeLinecap="round" opacity=".08" />
        </g>
      ))}
    </svg>
  );
}
