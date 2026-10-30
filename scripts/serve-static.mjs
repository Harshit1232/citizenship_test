#!/usr/bin/env node
/**
 * Serves the static export in `out/` the way the production host will:
 * trailing-slash URLs, the 404 page, and the security headers from
 * `out/_headers` (copied from public/_headers at build time). The end-to-end
 * tests run against this, so a Content-Security-Policy that breaks the site
 * fails a test instead of reaching users.
 *
 * Usage: node scripts/serve-static.mjs [port]   (default 4321)
 * No dependencies: Node's own http module only.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const ROOT = resolve(process.argv[3] ?? "out");
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 4321);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};

/** Parses a Netlify/Cloudflare-style _headers file into [pattern, headers] rules. */
function parseHeaders(text) {
  const rules = [];
  let current = null;
  for (const line of text.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      current = { pattern: line.trim(), headers: {} };
      rules.push(current);
    } else if (current) {
      const i = line.indexOf(":");
      if (i > 0) current.headers[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return rules;
}

function matches(pattern, path) {
  if (pattern.endsWith("*")) return path.startsWith(pattern.slice(0, -1));
  return pattern === path;
}

let rules = [];
try {
  rules = parseHeaders(await readFile(join(ROOT, "_headers"), "utf8"));
} catch {
  console.warn("No _headers file in", ROOT, "- serving without security headers.");
}

function headersFor(path) {
  const out = {};
  for (const r of rules) if (matches(r.pattern, path)) Object.assign(out, r.headers);
  // Plain http on localhost: HTTPS-only rules would only get in the way here.
  delete out["Strict-Transport-Security"];
  if (out["Content-Security-Policy"]) {
    out["Content-Security-Policy"] = out["Content-Security-Policy"].replace(/;\s*upgrade-insecure-requests/, "");
  }
  return out;
}

async function isFile(p) {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
}

async function isDir(p) {
  try {
    return (await stat(p)).isDirectory();
  } catch {
    return false;
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  let path;
  try {
    path = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400).end("Bad request");
    return;
  }
  const safe = normalize(path).replace(/^(\.\.[/\\])+/, "");
  const target = join(ROOT, safe);
  if (!target.startsWith(ROOT)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  // /about -> /about/ (trailingSlash: true)
  if (!path.endsWith("/") && (await isDir(target)) && (await isFile(join(target, "index.html")))) {
    res.writeHead(308, { Location: `${path}/${url.search}` }).end();
    return;
  }

  let file = target;
  let status = 200;
  if (path.endsWith("/")) file = join(target, "index.html");
  if (!(await isFile(file))) {
    file = join(ROOT, "404.html");
    status = 404;
  }
  try {
    const body = await readFile(file);
    res.writeHead(status, {
      "Content-Type": TYPES[extname(file)] ?? "application/octet-stream",
      ...headersFor(path),
    });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch {
    res.writeHead(500).end("Server error");
  }
});

server.listen(PORT, () => console.log(`Serving ${ROOT} at http://localhost:${PORT}`));
