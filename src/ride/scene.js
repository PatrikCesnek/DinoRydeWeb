// Pseudo-3D forest trail, drawn scanline by scanline like an old arcade
// racer, in the game's own greens and trail browns.
import { LOG_EVERY } from "./sim.js";

const CAM_H = 2.3; // metres: rider's eye on a mount
const ROAD_HALF = 1.7; // metres
const FAR = 320;

const SKY_TOP = [126, 176, 214];
const SKY_LOW = [233, 228, 202];
const FOG = [205, 214, 190];
const GRASS_A = [122, 150, 58];
const GRASS_B = [132, 160, 64];
const DIRT_A = [139, 104, 66];
const DIRT_B = [148, 113, 73];
const VERGE = [104, 82, 50];

const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
const hash = (n) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

export function render(ctx, w, h, sim, opts) {
  const bob = opts.bob ? Math.sin(sim.phase * 2) * Math.min(1, sim.speed / 40) * h * 0.006 : 0;
  const horizon = Math.round(h * 0.4 + bob + sim.jumpH * h * 0.07);
  const focal = h * 0.95;
  const camH = CAM_H + sim.jumpH;
  const bend = sim.curve * w * 0.000055;
  const centre = (z) => w / 2 + bend * z * z;

  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, `rgb(${SKY_TOP})`);
  sky.addColorStop(1, `rgb(${SKY_LOW})`);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizon + 1);

  // Hills, two parallax layers
  hills(ctx, w, horizon, sim.heading * 0.6, h * 0.11, "#93a978", 0.0045);
  hills(ctx, w, horizon, sim.heading * 1.4, h * 0.07, "#6f8a4a", 0.009);

  // Ground, two pixel rows at a time
  for (let y = horizon + 1; y < h; y += 2) {
    const z = (camH * focal) / (y - horizon);
    if (z > FAR * 1.4) continue;
    const s = sim.distance + z;
    const fog = Math.min(1, Math.pow(z / FAR, 1.3));
    const cx = centre(z);
    const half = (ROAD_HALF * focal) / z;
    ctx.fillStyle = mix(Math.floor(s / 7) % 2 ? GRASS_A : GRASS_B, FOG, fog);
    ctx.fillRect(0, y, w, 2);
    ctx.fillStyle = mix(VERGE, FOG, fog);
    ctx.fillRect(cx - half * 1.22, y, half * 2.44, 2);
    ctx.fillStyle = mix(Math.floor(s / 2.5) % 2 ? DIRT_A : DIRT_B, FOG, fog);
    ctx.fillRect(cx - half, y, half * 2, 2);
  }

  // Trees and logs, far to near
  const project = (z, x) => ({
    x: centre(z) + (x * focal) / z,
    y: horizon + (camH * focal) / z,
    k: focal / z,
  });
  const items = [];
  const first = Math.floor(sim.distance / 5);
  for (let i = first + FAR / 5; i > first; i--) {
    const z = i * 5 - sim.distance;
    if (z < 1.2) continue;
    const r = hash(i);
    const side = r > 0.5 ? 1 : -1;
    items.push({ z, kind: "tree", x: side * (3.6 + hash(i + 7) * 8), r });
    if (hash(i + 3) > 0.35) items.push({ z: z + 3, kind: "tree", x: -side * (5 + hash(i + 11) * 12), r: hash(i + 5) });
    if (hash(i + 13) > 0.6) items.push({ z: z + 5, kind: "fern", x: side * (2.4 + hash(i + 17) * 2), r });
  }
  for (let n = 0; n < 2; n++) {
    const z = sim.nextLog + n * LOG_EVERY - sim.distance;
    if (z > 1 && z < FAR) items.push({ z, kind: "log" });
  }
  items.sort((a, b) => b.z - a.z);
  for (const it of items) {
    if (it.z > FAR) continue;
    const p = project(it.z, it.x || 0);
    const fog = Math.min(1, Math.pow(it.z / FAR, 1.2));
    if (it.kind === "tree") tree(ctx, p, it.r, fog);
    else if (it.kind === "fern") fern(ctx, p, fog);
    else log(ctx, p, (ROAD_HALF * focal) / it.z, fog);
  }

  rider(ctx, w, h, sim, opts.colors, bob);

  // Speed streaks once the mount really moves
  const rush = Math.max(0, (sim.speed - 45) / 40);
  if (rush > 0) {
    ctx.strokeStyle = `rgba(255,255,255,${0.12 * rush})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const a = hash(i + Math.floor(sim.distance / 3)) * Math.PI * 2;
      const r0 = w * (0.38 + hash(i + 1) * 0.1);
      ctx.beginPath();
      ctx.moveTo(w / 2 + Math.cos(a) * r0, horizon + Math.sin(a) * r0 * 0.5);
      ctx.lineTo(w / 2 + Math.cos(a) * r0 * 1.4, horizon + Math.sin(a) * r0 * 0.7);
      ctx.stroke();
    }
  }
}

function hills(ctx, w, horizon, offset, amp, color, freq) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, horizon + 1);
  for (let x = 0; x <= w; x += 8) {
    const u = x + offset * 40;
    const y = horizon - amp * (0.55 + 0.3 * Math.sin(u * freq) + 0.15 * Math.sin(u * freq * 2.7 + 1));
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, horizon + 1);
  ctx.closePath();
  ctx.fill();
}

function tree(ctx, p, r, fog) {
  const s = p.k;
  const height = (6 + r * 6) * s;
  const trunk = Math.max(1, 0.35 * s);
  ctx.fillStyle = mix([88, 62, 40], FOG, fog);
  ctx.fillRect(p.x - trunk / 2, p.y - height * 0.45, trunk, height * 0.45);
  if (r > 0.45) {
    // conifer: three stacked tiers
    const dark = mix([38, 72, 34], FOG, fog);
    const light = mix([56, 96, 44], FOG, fog);
    for (let t = 0; t < 3; t++) {
      const base = p.y - height * (0.3 + t * 0.2);
      const apex = p.y - height * (0.66 + t * 0.17);
      const half = height * (0.22 - t * 0.05);
      ctx.fillStyle = t % 2 ? light : dark;
      ctx.beginPath();
      ctx.moveTo(p.x, apex);
      ctx.lineTo(p.x - half, base);
      ctx.lineTo(p.x + half, base);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    // broadleaf: lumpy round canopy
    ctx.fillStyle = mix([70, 112, 46], FOG, fog);
    const cy = p.y - height * 0.62;
    const rad = height * 0.24;
    blob(ctx, p.x, cy, rad);
    ctx.fillStyle = mix([92, 134, 58], FOG, fog);
    blob(ctx, p.x - rad * 0.35, cy - rad * 0.3, rad * 0.6);
  }
}

function blob(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.5, r), 0, Math.PI * 2);
  ctx.fill();
}

function fern(ctx, p, fog) {
  const s = p.k * 0.9;
  ctx.strokeStyle = mix([88, 140, 52], FOG, fog);
  ctx.lineWidth = Math.max(1, s * 0.08);
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.quadraticCurveTo(p.x + i * s * 0.25, p.y - s * 0.9, p.x + i * s * 0.45, p.y - s * 0.5);
    ctx.stroke();
  }
}

function log(ctx, p, half, fog) {
  const thick = Math.max(2, p.k * 0.5);
  const width = half * 2.6;
  ctx.fillStyle = mix([92, 64, 38], FOG, fog);
  roundRect(ctx, p.x - width / 2, p.y - thick, width, thick, thick / 2);
  ctx.fillStyle = mix([124, 90, 56], FOG, fog);
  roundRect(ctx, p.x - width / 2, p.y - thick, width, thick * 0.4, thick / 4);
  ctx.fillStyle = mix([196, 160, 112], FOG, fog);
  blob(ctx, p.x - width / 2 + thick / 2, p.y - thick / 2, thick * 0.42);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
  ctx.fill();
}

// First person: the top of a feathered neck, two gloved hands, the reins.
function rider(ctx, w, h, sim, colors, bob) {
  const [base, mid, light] = colors;
  const cy = h * 1.08 + bob * 2.5 - sim.jumpH * h * 0.02;
  const rw = w * 0.15;
  const rh = h * 0.36;

  const g = ctx.createRadialGradient(w / 2, cy - rh * 0.6, rh * 0.1, w / 2, cy, rw * 1.1);
  g.addColorStop(0, mid);
  g.addColorStop(1, base);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(w / 2, cy, rw, rh, 0, Math.PI, 0);
  ctx.fill();

  // Shaggy feathers over the neck, darker toward the edges
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, w * 0.0025);
  for (let k = 0; k < 90; k++) {
    const u = hash(k + 0.5) * 2 - 1; // -1..1 across
    const v = hash(k + 9.1); // 0..1 down from the crest
    const edge = Math.sqrt(Math.max(0, 1 - u * u));
    const x = w / 2 + u * rw * 0.92;
    const y = cy - rh * edge * (1 - v * 0.85);
    ctx.strokeStyle = hash(k + 3.3) > 0.5 ? light : base;
    ctx.globalAlpha = 0.35 + hash(k + 7.7) * 0.4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + u * h * 0.02, y + h * (0.03 + hash(k + 1.9) * 0.03));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Reins and hands
  const handY = h * 0.9 + bob * 1.5;
  const hands = [w * 0.33, w * 0.67];
  ctx.strokeStyle = "#3b2716";
  ctx.lineWidth = Math.max(2, w * 0.004);
  hands.forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, handY);
    ctx.quadraticCurveTo((x + w / 2) / 2, handY - h * 0.04, w / 2 + (x < w / 2 ? -1 : 1) * rw * 0.25, cy - rh * 0.92);
    ctx.stroke();
  });
  // Sleeves from the bottom corners, then gloves on the reins
  ctx.strokeStyle = "#3f4b2c";
  ctx.lineCap = "round";
  ctx.lineWidth = w * 0.07;
  hands.forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x + (x < w / 2 ? -1 : 1) * w * 0.1, h * 1.12);
    ctx.lineTo(x, handY + h * 0.06);
    ctx.stroke();
  });
  ctx.fillStyle = "#7a5232";
  hands.forEach((x) => {
    ctx.beginPath();
    ctx.ellipse(x, handY + h * 0.05, w * 0.05, h * 0.08, x < w / 2 ? -0.5 : 0.5, 0, Math.PI * 2);
    ctx.fill();
  });
}
