import type { NextConfig } from "next";

/**
 * Static export: every route becomes an HTML file in `out/`, deployable to any
 * static host (Vercel, Netlify, Cloudflare Pages, S3). There is no server yet;
 * accounts and payments will need one later, at which point `output` is removed.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
