// The site's link swell, for every button and link in Lineup.
// Same spring as baselinetalent.xyz (k 520, c 30): a mouse hover grows the control to 1.035,
// leaving springs it back. It is a transform, so nothing reflows, and the rAF loop runs only
// while something moves. Off for touch, coarse pointers and reduced motion.

const TARGETS = 'a, button, summary';
const GROW = 1.035;
const K = 520;
const C = 30;
const EPS = 0.01;

interface Spring {
  el: HTMLElement;
  x: number;
  v: number;
  t: number;
}

const springs = new WeakMap<HTMLElement, Spring>();
const active = new Set<Spring>();
let raf = 0;
let last = 0;

function paint(s: Spring) {
  s.el.style.transform = s.x === 1 ? '' : `scale(${s.x.toFixed(4)})`;
}

function tick(time: number) {
  const dt = Math.min(1 / 30, (time - (last || time)) / 1000) || 1 / 60;
  last = time;
  for (const s of active) {
    const a = -K * (s.x - s.t) - C * s.v;
    s.v += a * dt;
    s.x += s.v * dt;
    if (Math.abs(s.x - s.t) < 0.01 * EPS && Math.abs(s.v) < 0.01 * EPS) {
      s.x = s.t;
      s.v = 0;
      active.delete(s);
      paint(s);
      if (s.x === 1) s.el.style.willChange = '';
      continue;
    }
    paint(s);
  }
  raf = active.size ? requestAnimationFrame(tick) : 0;
  if (!raf) last = 0;
}

function to(el: HTMLElement, target: number) {
  let s = springs.get(el);
  if (!s) {
    if (target === 1) return;
    s = { el, x: 1, v: 0, t: 1 };
    springs.set(el, s);
  }
  s.t = target;
  if (s.x === target && s.v === 0) return;
  el.style.willChange = 'transform';
  active.add(s);
  if (!raf) raf = requestAnimationFrame(tick);
}

function springable(node: EventTarget | null): HTMLElement | null {
  if (!(node instanceof Element)) return null;
  const el = node.closest<HTMLElement>(TARGETS);
  if (!el || el.matches(':disabled') || el.closest('[data-no-spring]')) return null;
  return el;
}

export function installSpring() {
  if (typeof window === 'undefined') return;
  const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fineHover || reduce) return;

  let current: HTMLElement | null = null;
  const release = () => {
    if (current) to(current, 1);
    current = null;
  };

  document.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse' || e.buttons) return;
    const el = springable(e.target);
    if (el === current) return;
    release();
    if (el) {
      current = el;
      to(el, GROW);
    }
  });
  document.addEventListener('pointerout', (e) => {
    if (!current) return;
    const next = e.relatedTarget instanceof Node ? e.relatedTarget : null;
    if (!next || !current.contains(next)) release();
  });
  // A press or a drag settles the control back first, so nothing drags at 103.5%.
  document.addEventListener('pointerdown', release);
}
