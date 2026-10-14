// Facts lifted from the game (DinoSpec.cs, Track.cs, Shop.cs) so the site
// never promises something the 1.0 build does not do. Text lives in the
// i18n dictionaries under the same ids.

// Stat bars are the mount picker's own (MountInfo.Stats in MenuScreens.cs).
export const mounts = [
  {
    id: "raptor",
    name: "Velociraptor",
    paid: false,
    topSpeed: 78,
    stamina: 30,
    jump: 1.1,
    mass: 210,
    stats: { speed: 0.96, power: 0.7, agility: 0.9, hop: 0.95, stamina: 0.46 },
    colors: ["#4a3324", "#7a5230", "#d9c08f"],
  },
  {
    id: "iguanodon",
    name: "Iguanodon",
    paid: false,
    topSpeed: 60,
    stamina: 42,
    jump: 0.78,
    mass: 455,
    stats: { speed: 0.72, power: 0.95, agility: 0.5, hop: 0.74, stamina: 0.92 },
    colors: ["#4f5a2c", "#2f3a1a", "#a8a774"],
  },
  {
    id: "protoceratops",
    name: "Protoceratops",
    paid: false,
    topSpeed: 51,
    stamina: 36,
    jump: 0.66,
    mass: 375,
    stats: { speed: 0.6, power: 0.78, agility: 0.86, hop: 0.62, stamina: 0.8 },
    colors: ["#c8a46a", "#9c6b3a", "#b8432c"],
  },
  {
    id: "ornithomimus",
    name: "Ornithomimus",
    paid: true,
    topSpeed: 85,
    stamina: 40,
    jump: 1.0,
    mass: 240,
    stats: { speed: 1, power: 0.66, agility: 0.82, hop: 0.9, stamina: 0.72 },
    colors: ["#9aa0a3", "#1d1f22", "#d9a63a"],
  },
  {
    id: "oviraptor",
    name: "Oviraptor",
    paid: true,
    topSpeed: 70,
    stamina: 33,
    jump: 1.28,
    mass: 220,
    stats: { speed: 0.84, power: 0.68, agility: 0.94, hop: 1, stamina: 0.55 },
    colors: ["#2b2b2e", "#f1f1ec", "#3c6fd1"],
  },
  {
    id: "minmi",
    name: "Minmi",
    paid: true,
    topSpeed: 60,
    stamina: 38,
    jump: 0.7,
    mass: 365,
    stats: { speed: 0.7, power: 0.82, agility: 0.96, hop: 0.64, stamina: 0.86 },
    colors: ["#5c5232", "#3a3220", "#a39064"],
  },
];

// The gearbox pattern from the game: 1 N 2 3 4 5. Share of top speed each
// gait tops out at.
export const gaits = [
  { id: "walk", label: "1", share: 0.14 },
  { id: "halt", label: "N", share: 0 },
  { id: "trot", label: "2", share: 0.34 },
  { id: "canter", label: "3", share: 0.55 },
  { id: "gallop", label: "4", share: 0.78 },
  { id: "sprint", label: "5", share: 1 },
];

// Obstacle density per trail, 0..1, from the difficulty tiers.
export const trails = [
  { id: "quiet", density: { herds: 0.25, logs: 0.3, rocks: 0.3, bogs: 0.15 } },
  { id: "herd", density: { herds: 0.6, logs: 0.6, rocks: 0.6, bogs: 0.55 } },
  { id: "stampede", density: { herds: 1, logs: 0.85, rocks: 0.8, bogs: 0.75 } },
];

// Every dinosaur's skin options. Light and Dark are free.
export const skins = [
  { id: "light", kind: "free", color: "#b59a6a" },
  { id: "dark", kind: "free", color: "#4a3a28" },
  { id: "green", kind: "basic", color: "#3fae49" },
  { id: "yellow", kind: "basic", color: "#f2c230" },
  { id: "blue", kind: "basic", color: "#2f7fe0" },
  { id: "red", kind: "basic", color: "#d93a32" },
  { id: "pink", kind: "basic", color: "#ef6fae" },
  { id: "purple", kind: "basic", color: "#8a4fd8" },
  { id: "custom", kind: "custom", color: "#c8925a" },
  { id: "silver", kind: "metal", color: "#c9ced4" },
  { id: "gold", kind: "metal", color: "#e2b33c" },
];

export const scoring = [
  { id: "distance", points: 1, unit: "m" },
  { id: "close", points: 25 },
  { id: "corner", points: 50 },
  { id: "rearup", points: 2, unit: "m" },
  { id: "hop", points: 30 },
  { id: "log", points: 60 },
];
