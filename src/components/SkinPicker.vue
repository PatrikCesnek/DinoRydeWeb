<script setup>
import { computed, ref } from "vue";
import { mounts, skins } from "../data.js";
import { t } from "../i18n/index.js";
import { ride } from "../store.js";

const picked = ref("green");
const custom = ref("#c8925a");
const current = computed(() => skins.find((s) => s.id === picked.value));
const colour = computed(() => (picked.value === "custom" ? custom.value : current.value.color));
const mount = computed(() => mounts.find((m) => m.id === ride.mount) || mounts[0]);
const groups = ["free", "basic", "custom", "metal"];
</script>

<template>
  <div class="skins">
    <div
      class="skin-preview"
      :class="[`is-${current.kind}`, `is-${current.id}`]"
      :style="{ '--skin': colour }"
      role="img"
      :aria-label="t('skins.previewLabel', { skin: t(`skin.${current.id}`), mount: mount.name })"
    >
      <span class="skin-sheen" aria-hidden="true"></span>
      <div class="skin-caption">
        <strong>{{ mount.name }}</strong>
        <span>{{ t(`skin.${current.id}`) }}</span>
      </div>
    </div>

    <div class="skin-groups">
      <section v-for="g in groups" :key="g" class="skin-group">
        <h3>
          {{ t(`skins.group.${g}`) }}
          <small>{{ g === "free" ? t("skins.free") : t("skins.iap") }}</small>
        </h3>
        <div class="swatch-row" role="radiogroup" :aria-label="t(`skins.group.${g}`)">
          <template v-for="s in skins.filter((x) => x.kind === g)" :key="s.id">
            <button
              type="button"
              role="radio"
              class="swatch"
              :class="[`is-${s.kind}`, { on: picked === s.id }]"
              :aria-checked="picked === s.id"
              :style="{ '--skin': s.id === 'custom' ? custom : s.color }"
              @click="picked = s.id"
            >
              <i></i>
              <span>{{ t(`skin.${s.id}`) }}</span>
            </button>
          </template>
          <label v-if="g === 'custom'" class="mixer">
            <input type="color" v-model="custom" @input="picked = 'custom'" />
            <span>{{ t("skins.mix") }}</span>
          </label>
        </div>
      </section>
      <p class="skins-note">{{ t("skins.note") }}</p>
    </div>
  </div>
</template>
