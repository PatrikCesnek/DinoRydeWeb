// State shared between islands: the mount picked in the roster is the one
// the skin preview names.
import { reactive } from "vue";

export const ride = reactive({ mount: "raptor" });

export const reducedMotion =
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
