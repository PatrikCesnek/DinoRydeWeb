// A pocket version of the game's ride model: gaits as a gearbox, breath as
// engine heat, logs that must be hopped. Tuned to feel like DinoRyde, not to
// reproduce DinoSimulation exactly.
import { gaits } from "../data.js";

const G = 9.81;
export const LOG_EVERY = 230; // metres between trail-wide logs
const LOG_FIRST = 120;

export function createSim(mount) {
  return {
    mount,
    gait: 3, // canter
    speed: 0, // km/h
    distance: 0, // metres
    breath: 1, // 0..1
    collapsed: 0, // seconds left lying in the dirt
    jumpH: 0, // metres off the ground
    jumpV: 0,
    phase: 0, // stride phase for the head bob
    curve: 0, // current trail curvature, -1..1
    heading: 0, // integrated curve, drives the hill parallax
    score: 0,
    nextLog: LOG_FIRST,
    event: null, // { kind, points } for the HUD toast, consumed by the view
  };
}

export function gaitMax(sim) {
  return sim.mount.topSpeed * gaits[sim.gait].share;
}

export function cadence(sim) {
  const max = gaitMax(sim);
  return max > 0 ? Math.min(1, sim.speed / max) : 0;
}

export function shift(sim, dir) {
  if (sim.collapsed > 0) return;
  sim.gait = Math.max(0, Math.min(gaits.length - 1, sim.gait + dir));
}

export function hop(sim) {
  if (sim.jumpH > 0 || sim.collapsed > 0) return;
  // Launch speed from DinoSpec: h = v^2 / 2g.
  sim.jumpV = Math.sqrt(2 * G * sim.mount.jump);
  sim.jumpH = 0.001;
}

function curvatureAt(s) {
  return Math.sin(s / 140) * 0.7 + Math.sin(s / 53 + 1.3) * 0.3;
}

export function step(sim, dt, input) {
  const { mount } = sim;
  const max = gaitMax(sim);

  if (sim.collapsed > 0) {
    sim.collapsed -= dt;
    sim.speed = Math.max(0, sim.speed - 45 * dt);
    if (sim.collapsed <= 0) {
      sim.breath = 0.6;
      sim.gait = 0;
    }
  } else if (input.whoa) {
    sim.speed = Math.max(0, sim.speed - 32 * dt);
  } else if (input.go && max > 0) {
    if (sim.speed < max) sim.speed += Math.max(2.5, (max - sim.speed) * 0.85) * dt;
    else sim.speed -= (sim.speed - max) * 2 * dt; // dropped a gait: the stride reins you in
    sim.speed = Math.min(sim.speed, mount.topSpeed);
  } else {
    sim.speed = Math.max(0, sim.speed - (sim.speed > max ? 14 : 5) * dt);
  }

  // Breath: the redline in the top two gaits drains it, anything else recovers.
  const straining = input.go && sim.gait >= 4 && cadence(sim) > 0.9;
  if (straining && sim.collapsed <= 0) {
    const rate = sim.gait === 5 ? 1 : 0.45;
    sim.breath -= (rate / (mount.stamina * 0.5)) * dt; // half the game's time, it is a demo
    if (sim.breath <= 0) {
      sim.breath = 0;
      sim.collapsed = 2.4;
      sim.event = { kind: "collapsed" };
    }
  } else if (sim.collapsed <= 0) {
    sim.breath = Math.min(1, sim.breath + 0.1 * dt);
  }

  if (sim.jumpH > 0) {
    sim.jumpV -= G * dt;
    sim.jumpH += sim.jumpV * dt;
    if (sim.jumpH <= 0) {
      sim.jumpH = 0;
      sim.jumpV = 0;
    }
  }

  const ms = sim.speed / 3.6;
  sim.distance += ms * dt;
  sim.score += ms * dt;
  sim.phase += (ms / 1.9) * dt * Math.PI;
  sim.curve = curvatureAt(sim.distance);
  sim.heading += sim.curve * ms * dt;

  if (sim.distance >= sim.nextLog) {
    if (sim.jumpH > 0.25) {
      sim.score += 60;
      sim.event = { kind: "hop", points: 60 };
    } else if (sim.speed > 6) {
      sim.speed *= 0.35;
      sim.event = { kind: "stumble" };
    }
    sim.nextLog += LOG_EVERY;
  }
}
