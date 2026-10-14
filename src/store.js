// State shared between islands: picking a mount in the roster also saddles
// it in the hero ride.
import { reactive } from "vue";

export const ride = reactive({ mount: "raptor" });

export const reducedMotion =
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
