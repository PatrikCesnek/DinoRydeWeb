<script setup>
import { computed, ref } from "vue";
import { trails } from "../data.js";
import { t } from "../i18n/index.js";

const active = ref("herd");
const current = computed(() => trails.find((x) => x.id === active.value));
const kinds = ["herds", "logs", "rocks", "bogs"];

// A strip of obstacles whose density follows the trail. Seeded, so it never
// reshuffles on re-render.
const strip = computed(() => {
  const items = [];
  const d = current.value.density;
  let seed = active.value.length * 97;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let x = 4; x < 196; x += 6) {
    const r = rnd();
    let acc = 0;
    const kind = kinds.find((k) => r < (acc += d[k] * 0.2)) || null;
    if (kind) items.push({ x, kind, lane: rnd() > 0.5 ? 1 : 0 });
  }
  return items;
});

function onKey(e) {
  const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
  if (!dir) return;
  e.preventDefault();
  const i = trails.findIndex((x) => x.id === active.value);
  active.value = trails[(i + dir + trails.length) % trails.length].id;
  e.currentTarget.querySelector(".on")?.focus();
}
</script>

<template>
  <div class="trails">
    <div class="tabs" role="tablist" :aria-label="t('trails.title')" @keydown="onKey">
      <button
        v-for="(tr, i) in trails"
        :key="tr.id"
        type="button"
        role="tab"
        :id="`trail-tab-${tr.id}`"
        :aria-selected="tr.id === active"
        :aria-controls="`trail-panel`"
        :tabindex="tr.id === active ? 0 : -1"
        :class="{ on: tr.id === active }"
        @click="active = tr.id"
      >
        <small>{{ i + 1 }}</small>{{ t(`trail.${tr.id}.name`) }}
      </button>
    </div>

    <transition name="swap" mode="out-in">
      <div class="trail-panel" id="trail-panel" role="tabpanel" :aria-labelledby="`trail-tab-${active}`" :key="active">
        <div class="trail-copy">
          <h3>{{ t(`trail.${active}.name`) }}</h3>
          <p>{{ t(`trail.${active}.text`) }}</p>
          <div class="stats">
            <div v-for="k in kinds" :key="k" class="stat">
              <span>{{ t(`trails.${k}`) }}</span>
              <div class="stat-track" :class="`is-${k}`">
                <i :style="{ transform: `scaleX(${current.density[k]})` }"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="trail-strip" aria-hidden="true">
          <svg viewBox="0 0 200 40" preserveAspectRatio="none">
            <rect x="0" y="12" width="200" height="16" rx="3" class="strip-dirt" />
            <g class="strip-run">
              <g v-for="copy in [0, 200]" :key="copy" :transform="`translate(${copy} 0)`">
                <template v-for="o in strip" :key="o.x">
                  <g v-if="o.kind === 'herds'" :transform="`translate(${o.x} ${o.lane ? 22 : 17})`">
                    <ellipse rx="3.2" ry="2" class="o-herd" />
                    <ellipse cx="4" cy="-0.4" rx="2.6" ry="1.7" class="o-herd" />
                  </g>
                  <rect v-else-if="o.kind === 'logs'" :x="o.x" y="13" width="1.6" height="14" rx="0.8" class="o-log" />
                  <circle v-else-if="o.kind === 'rocks'" :cx="o.x" :cy="o.lane ? 23 : 17" r="1.6" class="o-rock" />
                  <ellipse v-else :cx="o.x" :cy="o.lane ? 23 : 17" rx="3.6" ry="1.6" class="o-bog" />
                </template>
              </g>
            </g>
          </svg>
          <ul class="strip-key">
            <li v-for="k in kinds" :key="k"><i :class="`k-${k}`"></i>{{ t(`trails.${k}`) }}</li>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>
