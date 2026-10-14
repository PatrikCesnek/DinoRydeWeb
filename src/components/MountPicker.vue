<script setup>
import { computed } from "vue";
import { mounts } from "../data.js";
import { num, t } from "../i18n/index.js";
import { ride } from "../store.js";

const current = computed(() => mounts.find((m) => m.id === ride.mount) || mounts[0]);
const statKeys = ["speed", "power", "agility", "hop", "stamina"];

function onKey(e, index) {
  const dir = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
  if (!dir) return;
  e.preventDefault();
  const next = mounts[(index + dir + mounts.length) % mounts.length];
  ride.mount = next.id;
  e.currentTarget.parentElement.children[mounts.indexOf(next)]?.focus();
}
</script>

<template>
  <div class="picker">
    <div class="picker-list" role="radiogroup" :aria-label="t('mounts.title')">
      <button
        v-for="(m, i) in mounts"
        :key="m.id"
        type="button"
        role="radio"
        class="picker-item"
        :class="{ on: m.id === current.id }"
        :aria-checked="m.id === current.id"
        :tabindex="m.id === current.id ? 0 : -1"
        @click="ride.mount = m.id"
        @keydown="onKey($event, i)"
      >
        <span class="picker-dot">
          <i v-for="c in m.colors" :key="c" :style="{ background: c }"></i>
        </span>
        <span class="picker-name">{{ m.name }}</span>
        <span class="picker-class">{{ t(`mount.${m.id}.class`) }}</span>
        <span v-if="m.paid" class="badge">{{ t("mounts.store") }}</span>
      </button>
    </div>

    <transition name="swap" mode="out-in">
      <article class="picker-card" :key="current.id">
        <header>
          <p class="eyebrow">{{ t(`mount.${current.id}.class`) }}</p>
          <h3>{{ current.name }}</h3>
          <p class="picker-tag">{{ t(`mount.${current.id}.tag`) }}</p>
        </header>
        <p>{{ t(`mount.${current.id}.text`) }}</p>

        <dl class="picker-specs">
          <div>
            <dt>{{ t("mounts.spec.top") }}</dt>
            <dd>{{ num(current.topSpeed) }}<small>km/h</small></dd>
          </div>
          <div>
            <dt>{{ t("mounts.spec.breath") }}</dt>
            <dd>{{ num(current.stamina) }}<small>s</small></dd>
          </div>
          <div>
            <dt>{{ t("mounts.spec.hop") }}</dt>
            <dd>{{ num(current.jump, 1) }}<small>m</small></dd>
          </div>
          <div>
            <dt>{{ t("mounts.spec.mass") }}</dt>
            <dd>{{ num(current.mass) }}<small>kg</small></dd>
          </div>
        </dl>

        <div class="stats">
          <div v-for="k in statKeys" :key="k" class="stat">
            <span>{{ t(`mounts.stat.${k}`) }}</span>
            <div class="stat-track">
              <i :style="{ transform: `scaleX(${current.stats[k]})` }"></i>
            </div>
          </div>
        </div>

        <div class="picker-actions">
          <p class="picker-note">{{ current.paid ? t("mounts.paidNote") : t("mounts.freeNote") }}</p>
        </div>
      </article>
    </transition>
  </div>
</template>
