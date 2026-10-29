import { cx } from "@/lib/cx";

/**
 * Layered ridgelines in the landscape palette: ranges, an ochre escarpment and
 * a low sun. Each layer drifts at its own rate as the section scrolls past,
 * using CSS scroll-driven animations (no JavaScript). Browsers without support,
 * and people who prefer reduced motion, get the still scene.
 *
 * Paths come from a seed, so the SVG is identical on every render.
 */

const W = 1440;
const H = 320;

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A smooth ridge: a sum of sines with seeded phases, closed to the bottom edge. */
function ridge(seed: number, base: number, amp: number, detail = 3, mesa = 0): string {
  const r = rng(seed);
  const waves = Array.from({ length: detail }, (_, i) => ({
    f: (i + 1) * (0.7 + r() * 0.9),
    p: r() * Math.PI * 2,
    a: amp / (i + 1.2),
  }));
  const step = 24;
  const pts: Array<[number, number]> = [];
  for (let x = -step; x <= W + step; x += step) {
    let y = base;
    for (const w of waves) y -= w.a * Math.sin((x / W) * Math.PI * 2 * w.f + w.p);
    // Mesa: flatten the tops into tablelands, like the ranges of central Australia.
    if (mesa) y = Math.max(y, base - amp * mesa);
    pts.push([x, y]);
  }
  let d = `M${pts[0][0]},${H + 60} L${pts[0][0]},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const c = (x0 + step / 2).toFixed(1);
    d += ` C${c},${y0.toFixed(1)} ${c},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
  }
  return `${d} L${W + step},${H + 60} Z`;
}

interface LandscapeProps {
  seed?: number;
  className?: string;
  sun?: boolean;
}

export function Landscape({ seed = 7, className, sun = true }: LandscapeProps) {
  const layers = [
    { d: ridge(seed + 1, 150, 46, 4), fill: "var(--land-far)", depth: 46 },
    { d: ridge(seed + 2, 196, 52, 3, 0.55), fill: "var(--land-ochre)", depth: 30, opacity: 0.85 },
    { d: ridge(seed + 3, 222, 40, 4), fill: "var(--land-mid)", depth: 20 },
    { d: ridge(seed + 4, 258, 30, 3), fill: "var(--land-near)", depth: 10 },
    { d: ridge(seed + 5, 292, 18, 2), fill: "var(--land-front)", depth: 0 },
  ];
  const glow = `sun-glow-${seed}`;

  return (
    <div aria-hidden="true" className={cx("parallax-scope pointer-events-none relative w-full", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <radialGradient id={glow} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--land-sun)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--land-sun)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {sun && (
          <g className="parallax-layer" style={{ "--depth": "64px" } as React.CSSProperties}>
            <circle cx="1080" cy="120" r="150" fill={`url(#${glow})`} />
            <circle cx="1080" cy="120" r="54" fill="var(--land-sun)" />
          </g>
        )}
        {layers.map((l, i) => (
          <path
            key={i}
            d={l.d}
            fill={l.fill}
            opacity={l.opacity ?? 1}
            className={l.depth ? "parallax-layer" : undefined}
            style={l.depth ? ({ "--depth": `${l.depth}px` } as React.CSSProperties) : undefined}
          />
        ))}
      </svg>
    </div>
  );
}

/** Drifting wattle pollen: a handful of gold dots on slow, offset loops. */
export function Pollen({
  count = 14,
  seed = 3,
  className,
  topRange = [0, 100],
}: {
  count?: number;
  seed?: number;
  className?: string;
  /** Vertical band (percent) the dots start in, so they stay clear of body text. */
  topRange?: [number, number];
}) {
  const r = rng(seed);
  const dots = Array.from({ length: count }, () => ({
    left: r() * 100,
    top: topRange[0] + r() * (topRange[1] - topRange[0]),
    size: 3 + r() * 5,
    dur: 9 + r() * 10,
    delay: -r() * 12,
    dx: (r() - 0.5) * 40,
    dy: -10 - r() * 30,
    o: 0.35 + r() * 0.45,
  }));
  return (
    <div aria-hidden="true" className={cx("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {dots.map((d, i) => (
        <span
          key={i}
          className="motion-drift absolute rounded-full bg-wattle"
          style={
            {
              left: `${d.left.toFixed(2)}%`,
              top: `${d.top.toFixed(2)}%`,
              width: d.size,
              height: d.size,
              opacity: d.o,
              animation: `drift ${d.dur.toFixed(2)}s ease-in-out ${d.delay.toFixed(2)}s infinite`,
              "--dx": `${d.dx.toFixed(1)}px`,
              "--dy": `${d.dy.toFixed(1)}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
