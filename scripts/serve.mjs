#!/usr/bin/env node
// Local preview of dist/ that mirrors netlify.toml: /support and /privacy
// resolve without .html, unknown paths get 404.html with a real 404, and the
// same security headers (including the CSP) are sent, so a CSP slip shows up
// here before it shows up live.
//
//   npm run build && npm run serve        # http://localhost:4173
//   npm run serve -- 8080                 # or pick a port
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../dist", import.meta.url)));
const PORT = Number(process.argv[2]) || 4173;
const REWRITES = { "/support": "/support.html", "/privacy": "/privacy.html" };
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};
const HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy":
    "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'",
  "Cache-Control": "no-store",
};

async function file(path) {
  const full = normalize(join(ROOT, path));
  if (!full.startsWith(ROOT)) return null;
  try {
    const info = await stat(full);
    const target = info.isDirectory() ? join(full, "index.html") : full;
    return { body: await readFile(target), type: TYPES[extname(target)] || "application/octet-stream" };
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const clean = path.replace(/\/+$/, "") || "/";
  if (REWRITES[clean]) path = REWRITES[clean];
  let found = await file(path);
  let status = 200;
  if (!found) {
    found = await file("/404.html");
    status = 404;
  }
  res.writeHead(status, { ...HEADERS, "Content-Type": found?.type || "text/plain" });
  res.end(req.method === "HEAD" ? undefined : found?.body || "Not found");
  console.log(`  ${status} ${req.url}`);
}).listen(PORT, "127.0.0.1", () => {
  console.log(`DinoRyde site on http://localhost:${PORT}`);
  console.log("  /support and /privacy rewrite like Netlify; anything else is the 404 page.");
});
