// Fails when a language is missing a key, has an extra one, or a page uses
// a data-i18n key no dictionary defines.
import { readFileSync } from "node:fs";
import en from "../src/i18n/en.js";
import sk from "../src/i18n/sk.js";
import cs from "../src/i18n/cs.js";

let failed = false;
const fail = (msg) => {
  failed = true;
  console.error("✗", msg);
};

const base = Object.keys(en);
for (const [name, dict] of Object.entries({ sk, cs })) {
  base.filter((k) => !(k in dict)).forEach((k) => fail(`${name} is missing ${k}`));
  Object.keys(dict).filter((k) => !(k in en)).forEach((k) => fail(`${name} has extra ${k}`));
}

const used = new Set();
for (const page of ["index", "support", "privacy", "404"]) {
  const html = readFileSync(new URL(`../${page}.html`, import.meta.url), "utf8");
  for (const m of html.matchAll(/data-i18n(?:-html|-alt|-label)?="([^"]+)"/g)) used.add(m[1]);
}
for (const file of ["MountPicker", "TrailPicker", "SkinPicker", "ScreenGallery"]) {
  const src = readFileSync(new URL(`../src/components/${file}.vue`, import.meta.url), "utf8");
  for (const m of src.matchAll(/\bt\(["']([a-z][a-z0-9.]+)["']/gi)) used.add(m[1]);
}
[...used].filter((k) => !(k in en)).forEach((k) => fail(`markup uses unknown key ${k}`));

if (failed) process.exit(1);
console.log(`✓ ${base.length} keys in en, sk and cs; ${used.size} static keys resolve`);
