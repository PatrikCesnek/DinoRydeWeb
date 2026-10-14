<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { gaits, mounts } from "../data.js";
import { num, t } from "../i18n/index.js";
import { createSim, cadence, hop, shift, step } from "../ride/sim.js";
import { render } from "../ride/scene.js";
import { reducedMotion, ride } from "../store.js";

const stage = ref(null);
const canvas = ref(null);
const mount = computed(() => mounts.find((m) => m.id === ride.mount) || mounts[0]);
const sim = createSim(mount.value);
const input = reactive({ go: false, whoa: false });
const hud = reactive({ speed: 0, gait: sim.gait, breath: 1, distance: 0, score: 0, cadence: 0, collapsed: false });
const toast = ref(null);
const autopilot = ref(!reducedMotion);
let toastTimer = 0;
let raf = 0;
let last = 0;
let visible = true;
let ctx = null;
let size = { w: 0, h: 0 };

watch(mount, (m) => {
  sim.mount = m;
});

function takeOver() {
  autopilot.value = false;
}

function press(key, on) {
  takeOver();
  input[key] = on;
}

function gear(dir) {
  takeOver();
  shift(sim, dir);
}

function jump() {
  takeOver();
  hop(sim);
}

function showToast(event) {
  const text =
    event.kind === "hop"
      ? t("ride.toast.hop", { points: event.points })
      : event.kind === "stumble"
        ? t("ride.toast.stumble")
        : t("ride.toast.collapsed");
  toast.value = { text, kind: event.kind, id: Date.now() };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = null), 2200);
}

// Autopilot: canter along, hop every log, so the hero is alive on arrival.
function autopilotInput() {
  if (sim.gait < 3) shift(sim, 1);
  const toLog = sim.nextLog - sim.distance;
  const air = (2 * Math.sqrt(2 * 9.81 * sim.mount.jump)) / 9.81;
  if (toLog < (sim.speed / 3.6) * air * 0.5 + 0.4) hop(sim);
  return { go: true, whoa: false };
}

function resize() {
  const el = canvas.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  el.width = Math.round(rect.width * dpr);
  el.height = Math.round(rect.height * dpr);
  ctx = el.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  size = { w: rect.width, h: rect.height };
  draw();
}

function draw() {
  if (!ctx) return;
  render(ctx, size.w, size.h, sim, { bob: !reducedMotion, colors: mount.value.colors });
}

function frame(now) {
  raf = requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - (last || now)) / 1000);
  last = now;
  if (!visible || document.hidden) return;
  step(sim, dt, autopilot.value ? autopilotInput() : input);
  if (sim.event) {
    showToast(sim.event);
    sim.event = null;
  }
  hud.speed = Math.round(sim.speed);
  hud.gait = sim.gait;
  hud.breath = sim.breath;
  hud.distance = Math.floor(sim.distance);
  hud.score = Math.floor(sim.score);
  hud.cadence = cadence(sim);
  hud.collapsed = sim.collapsed > 0;
  draw();
}

const keys = {
  KeyW: ["go", true], ArrowUp: ["go", true],
  KeyS: ["whoa", true], ArrowDown: ["whoa", true],
};

function onKey(e, down) {
  if (keys[e.code]) {
    e.preventDefault();
    press(keys[e.code][0], down);
  } else if (down && (e.code === "KeyQ" || e.code === "ArrowLeft")) {
    e.preventDefault();
    gear(-1);
  } else if (down && (e.code === "KeyE" || e.code === "ArrowRight")) {
    e.preventDefault();
    gear(1);
  } else if (down && e.code === "Space") {
    e.preventDefault();
    jump();
  }
}

let ro;
let io;
onMounted(() => {
  resize();
  ro = new ResizeObserver(resize);
  ro.observe(canvas.value);
  io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
  io.observe(stage.value);
  raf = requestAnimationFrame(frame);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  ro?.disconnect();
  io?.disconnect();
  clearTimeout(toastTimer);
});

const cadenceCells = 20;
const breathCells = 10;
</script>

<template>
  <div class="ride" ref="stage">
    <div
      class="ride-stage"
      tabindex="0"
      role="application"
      :aria-label="t('ride.label')"
      @keydown="onKey($event, true)"
      @keyup="onKey($event, false)"
      @blur="input.go = input.whoa = false"
    >
      <canvas ref="canvas" class="ride-canvas" aria-hidden="true"></canvas>

      <div class="hud" aria-live="off">
        <div class="hud-cadence">
          <i
            v-for="n in cadenceCells"
            :key="n"
            :class="{ on: n / cadenceCells <= hud.cadence, red: n > cadenceCells - 3 }"
          ></i>
        </div>
        <div class="hud-row">
          <div class="hud-speed">
            <b>{{ hud.speed }}</b>
            <small>km/h</small>
          </div>
          <div class="hud-gait" :class="{ neutral: gaits[hud.gait].id === 'halt' }">
            <b>{{ gaits[hud.gait].label }}</b>
            <small>{{ t(`gait.${gaits[hud.gait].id}`) }}</small>
          </div>
          <div class="hud-breath">
            <small>{{ t("ride.breath") }}</small>
            <div class="hud-breath-cells">
              <i
                v-for="n in breathCells"
                :key="n"
                :class="{ on: n / breathCells <= hud.breath + 0.001, low: hud.breath < 0.3 }"
              ></i>
            </div>
            <small>{{ num(hud.distance) }} m · {{ num(hud.score) }} {{ t("ride.pts") }}</small>
          </div>
        </div>
      </div>

      <transition name="toast">
        <p v-if="toast" :key="toast.id" class="ride-toast" :class="`is-${toast.kind}`" role="status">
          {{ toast.text }}
        </p>
      </transition>

      <p v-if="autopilot" class="ride-hint">{{ t("ride.hint") }}</p>
    </div>

    <div class="ride-controls">
      <div class="ride-gears" role="group" :aria-label="t('ride.gaits')">
        <button type="button" class="ctl" @click="gear(-1)" :aria-label="t('ride.down')">Q ‹</button>
        <ol class="gearbox">
          <li v-for="(g, i) in gaits" :key="g.id" :class="{ on: i === hud.gait }">
            <span>{{ g.label }}</span>
            <small>{{ t(`gait.${g.id}`) }}</small>
          </li>
        </ol>
        <button type="button" class="ctl" @click="gear(1)" :aria-label="t('ride.up')">› E</button>
      </div>
      <div class="ride-pedals">
        <button type="button" class="ctl ctl-jump" @click="jump">{{ t("ride.jump") }} <kbd>Space</kbd></button>
        <button
          type="button"
          class="ctl ctl-whoa"
          :class="{ held: input.whoa }"
          @pointerdown="press('whoa', true)"
          @pointerup="press('whoa', false)"
          @pointerleave="input.whoa = false"
          @pointercancel="input.whoa = false"
        >
          {{ t("ride.whoa") }} <kbd>S</kbd>
        </button>
        <button
          type="button"
          class="ctl ctl-go"
          :class="{ held: input.go }"
          @pointerdown="press('go', true)"
          @pointerup="press('go', false)"
          @pointerleave="input.go = false"
          @pointercancel="input.go = false"
          @contextmenu.prevent
        >
          {{ t("ride.go") }} <kbd>W</kbd>
        </button>
      </div>
    </div>

    <div class="ride-mounts" role="radiogroup" :aria-label="t('ride.mount')">
      <button
        v-for="m in mounts"
        :key="m.id"
        type="button"
        role="radio"
        :aria-checked="ride.mount === m.id"
        :class="{ on: ride.mount === m.id }"
        @click="ride.mount = m.id"
      >
        <i :style="{ background: `linear-gradient(135deg, ${m.colors[1]}, ${m.colors[0]})` }"></i>
        {{ m.name }}
      </button>
    </div>
  </div>
</template>
