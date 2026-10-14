<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { t } from "../i18n/index.js";
import { reducedMotion } from "../store.js";

// Real gameplay only: the hero must show what the game actually looks like.
const shots = [
  { id: "log", src: "/assets/screenshots/iphone/01-herd-2.jpg" },
  { id: "anky", src: "/assets/screenshots/iphone/03-herd-3.jpg" },
  { id: "corner", src: "/assets/screenshots/iphone/04-herd-5.jpg" },
  { id: "trike", src: "/assets/screenshots/iphone/05-herd-8.jpg" },
  { id: "bend", src: "/assets/screenshots/iphone/02-right-turn-1.jpg" },
  { id: "hill", src: "/assets/screenshots/iphone/06-right-turn-4.jpg" },
];

const active = ref(0);
const paused = ref(reducedMotion);
let timer = 0;

function next() {
  active.value = (active.value + 1) % shots.length;
}

function go(i) {
  active.value = i;
  restart();
}

function restart() {
  clearInterval(timer);
  if (!paused.value) timer = setInterval(next, 5200);
}

function setPaused(on) {
  if (reducedMotion) return;
  paused.value = on;
  restart();
}

onMounted(restart);
onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
  <figure
    class="reel"
    :class="{ still: reducedMotion }"
    @mouseenter="setPaused(true)"
    @mouseleave="setPaused(false)"
    @focusin="setPaused(true)"
    @focusout="setPaused(false)"
  >
    <div class="reel-frame">
      <img
        v-for="(s, i) in shots"
        :key="s.id"
        :src="s.src"
        :alt="i === active ? t(`shot.${s.id}.alt`) : ''"
        :aria-hidden="i !== active"
        :class="{ on: i === active }"
        width="1434"
        height="660"
        :loading="i === 0 ? 'eager' : 'lazy'"
        :fetchpriority="i === 0 ? 'high' : 'auto'"
        decoding="async"
      />
      <span class="reel-tag">{{ t("hero.real") }}</span>
    </div>
    <figcaption>
      <transition name="swap" mode="out-in">
        <span :key="active">{{ t(`shot.${shots[active].id}.caption`) }}</span>
      </transition>
      <div class="reel-dots" role="group" :aria-label="t('screens.title')">
        <button
          v-for="(s, i) in shots"
          :key="s.id"
          type="button"
          :class="{ on: i === active }"
          :aria-pressed="i === active"
          :aria-label="t(`shot.${s.id}.caption`)"
          @click="go(i)"
        ></button>
      </div>
    </figcaption>
  </figure>
</template>
