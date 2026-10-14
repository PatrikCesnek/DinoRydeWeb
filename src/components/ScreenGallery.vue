<script setup>
import { computed, nextTick, ref } from "vue";
import { t } from "../i18n/index.js";

const shots = [
  { id: "log", src: "/assets/screenshots/iphone/01-herd-2.jpg", w: 1434, h: 660, device: "iphone" },
  { id: "bend", src: "/assets/screenshots/iphone/02-right-turn-1.jpg", w: 1434, h: 660, device: "iphone" },
  { id: "anky", src: "/assets/screenshots/iphone/03-herd-3.jpg", w: 1434, h: 660, device: "iphone" },
  { id: "corner", src: "/assets/screenshots/iphone/04-herd-5.jpg", w: 1434, h: 660, device: "iphone" },
  { id: "trike", src: "/assets/screenshots/iphone/05-herd-8.jpg", w: 1434, h: 660, device: "iphone" },
  { id: "hill", src: "/assets/screenshots/iphone/06-right-turn-4.jpg", w: 1434, h: 660, device: "iphone" },
  { id: "picker", src: "/assets/screenshots/mac/mount-picker.jpg", w: 1440, h: 900, device: "mac" },
  { id: "store", src: "/assets/screenshots/mac/store.jpg", w: 1440, h: 900, device: "mac" },
  { id: "colours", src: "/assets/screenshots/mac/store-colours.jpg", w: 1440, h: 900, device: "mac" },
];

const device = ref("iphone");
const list = computed(() => shots.filter((s) => s.device === device.value));
const open = ref(-1);
const dialog = ref(null);
let opener = null;
let touchX = null;

async function show(i, e) {
  opener = e.currentTarget;
  open.value = i;
  await nextTick();
  dialog.value?.showModal();
}

function close() {
  dialog.value?.close();
}

function onClose() {
  open.value = -1;
  opener?.focus();
}

function go(dir) {
  open.value = (open.value + dir + list.value.length) % list.value.length;
}

function onKey(e) {
  if (e.key === "ArrowRight") go(1);
  else if (e.key === "ArrowLeft") go(-1);
}

function onBackdrop(e) {
  if (e.target === dialog.value) close();
}

function onTouchEnd(e) {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  touchX = null;
}
</script>

<template>
  <div class="gallery-wrap">
    <div class="tabs tabs-small" role="tablist" :aria-label="t('screens.title')">
      <button
        v-for="d in ['iphone', 'mac']"
        :key="d"
        type="button"
        role="tab"
        :aria-selected="device === d"
        :class="{ on: device === d }"
        @click="device = d"
      >
        {{ t(`screens.device.${d}`) }}
      </button>
    </div>

    <transition-group tag="div" name="shot" class="gallery" :class="`is-${device}`">
      <figure v-for="(s, i) in list" :key="s.id">
        <button type="button" class="shot" @click="show(i, $event)" :aria-label="t('screens.open', { caption: t(`shot.${s.id}.caption`) })">
          <img :src="s.src" :alt="t(`shot.${s.id}.alt`)" :width="s.w" :height="s.h" loading="lazy" decoding="async" />
        </button>
        <figcaption>{{ t(`shot.${s.id}.caption`) }}</figcaption>
      </figure>
    </transition-group>

    <dialog
      ref="dialog"
      class="lightbox"
      :aria-label="t('screens.title')"
      @close="onClose"
      @click="onBackdrop"
      @keydown="onKey"
      @touchstart.passive="touchX = $event.touches[0].clientX"
      @touchend="onTouchEnd"
    >
      <template v-if="open >= 0">
        <figure>
          <img :src="list[open].src" :alt="t(`shot.${list[open].id}.alt`)" :width="list[open].w" :height="list[open].h" />
          <figcaption>
            <span>{{ t(`shot.${list[open].id}.caption`) }}</span>
            <small>{{ open + 1 }} / {{ list.length }}</small>
          </figcaption>
        </figure>
        <button type="button" class="lb-btn lb-prev" @click="go(-1)" :aria-label="t('screens.prev')">‹</button>
        <button type="button" class="lb-btn lb-next" @click="go(1)" :aria-label="t('screens.next')">›</button>
        <button type="button" class="lb-btn lb-close" @click="close" :aria-label="t('screens.close')">×</button>
      </template>
    </dialog>
  </div>
</template>
