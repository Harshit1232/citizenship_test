import localFont from "next/font/local";

/**
 * Self-hosted fonts (no Google Fonts request at runtime).
 * Bricolage Grotesque — display, with optical sizing.
 * Atkinson Hyperlegible Next — reading text; designed by the Braille Institute
 * for legibility, which matters for second-language readers.
 */
export const bricolage = localFont({
  src: "./fonts/bricolage-grotesque-opsz.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
});

export const atkinson = localFont({
  src: [
    { path: "./fonts/atkinson-hyperlegible-next.woff2", style: "normal", weight: "200 800" },
    { path: "./fonts/atkinson-hyperlegible-next-italic.woff2", style: "italic", weight: "200 800" },
  ],
  variable: "--font-atkinson",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
});
