"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

export function HeroRibbon({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const ribbon = useRef<HTMLDivElement>(null);
  const clipped = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let frame = 0;
    let target = 0;
    let lean = 0;
    let width = 1;
    let height = 1;
    let center = .46;
    const measure = () => {
      const bounds = element.getBoundingClientRect();
      const word = element.querySelector('.hero-wordmark')?.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      if (word) center = (word.top + word.height / 2 - bounds.top) / height;
    };
    const pointer = (event: PointerEvent) => {
      target = (event.clientX - element.getBoundingClientRect().left) / width - .5;
    };
    const leave = () => { target = 0; };
    const draw = (time: number) => {
      lean += (target - lean) * .045;
      const phase = reducedMotion ? 0 : time / 18000 * Math.PI * 2;
      const lift = reducedMotion ? 0 : Math.min(1, Math.max(0, -element.getBoundingClientRect().top / height)) * .12;
      const upper: string[] = [];
      const lower: string[] = [];
      const angle = -25 * Math.PI / 180;
      const rotatePoint = (x: number, y: number) => {
        const dx = (x - .5) * width;
        const dy = (y - center + lift) * height;
        return `${50 + (dx * Math.cos(angle) - dy * Math.sin(angle)) / width * 100}% ${(center - lift + (dx * Math.sin(angle) + dy * Math.cos(angle)) / height) * 100}%`;
      };
      for (let i = 0; i <= 64; i++) {
        const x = -.5 + (i / 64) * 2;
        const y = center - lift + Math.sin(x * Math.PI * 2 + phase) * .07 + (reducedMotion ? 0 : lean * (x - .5) * .15);
        const half = .03 + .055 * Math.pow(Math.abs(2 * x - 1), 1.4) + .006 * Math.sin(x * Math.PI * 3 + phase);
        upper.push(rotatePoint(x, y - half));
        lower.unshift(rotatePoint(x, y + half));
      }
      const shape = `polygon(${[...upper, ...lower].join(',')})`;
      if (ribbon.current) ribbon.current.style.clipPath = shape;
      if (clipped.current) clipped.current.style.clipPath = shape;
      if (!reducedMotion) frame = requestAnimationFrame(draw);
    };
    measure();
    const observer = new ResizeObserver(() => { measure(); if (reducedMotion) draw(0); });
    observer.observe(element);
    document.fonts.ready.then(() => { measure(); if (reducedMotion) draw(0); });
    const scene = element.parentElement;
    scene?.addEventListener('pointermove', pointer);
    scene?.addEventListener('pointerleave', leave);
    draw(0);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); scene?.removeEventListener('pointermove', pointer); scene?.removeEventListener('pointerleave', leave); };
  }, [reducedMotion]);

  return <div ref={root} aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
    <div ref={ribbon} style={{ position: 'absolute', inset: 0, background: 'var(--ink)', clipPath: 'polygon(0 46%,100% 46%,100% 46%)' }} />
    {children}
    <div ref={clipped} className="hero-ribbon-inverse" style={{ position: 'absolute', inset: 0, zIndex: 4, clipPath: 'polygon(0 46%,100% 46%,100% 46%)' }}>{children}</div>
    <style>{`.hero-ribbon-inverse .hero-wordmark,.hero-ribbon-inverse .hero-word--pour{color:var(--cream)}`}</style>
  </div>;
}
