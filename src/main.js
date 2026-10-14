import { createApp, defineAsyncComponent } from "vue";
import { initI18n } from "./i18n/index.js";
import { reducedMotion } from "./store.js";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/sections.css";
import "./styles/picker.css";
import "./styles/showcase.css";
import "./styles/pages.css";

// Islands: each [data-island] element is replaced by a Vue component. The
// markup inside it is the no-JS / crawler fallback.
const islands = {
  ride: () => import("./components/RideDemo.vue"),
  mounts: () => import("./components/MountPicker.vue"),
  trails: () => import("./components/TrailPicker.vue"),
  skins: () => import("./components/SkinPicker.vue"),
  gallery: () => import("./components/ScreenGallery.vue"),
};

const page = document.body.dataset.page || "home";
initI18n(page);

document.querySelectorAll("[data-island]").forEach((el) => {
  const load = islands[el.dataset.island];
  if (!load) return;
  el.innerHTML = "";
  createApp(defineAsyncComponent(load)).mount(el);
});

// Header: solid once the page scrolls; mobile menu toggle.
const header = document.querySelector(".site-header");
const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const toggle = document.querySelector(".nav-toggle");
toggle?.addEventListener("click", () => {
  const open = header.classList.toggle("nav-open");
  toggle.setAttribute("aria-expanded", String(open));
});
document.querySelectorAll(".nav a").forEach((a) =>
  a.addEventListener("click", () => {
    header?.classList.remove("nav-open");
    toggle?.setAttribute("aria-expanded", "false");
  }),
);

// Scroll reveals and count-ups.
function countUp(el) {
  const target = Number(el.dataset.count);
  if (reducedMotion || !Number.isFinite(target)) return;
  const start = performance.now();
  const dur = 900;
  const step = (now) => {
    const p = Math.min(1, (now - start) / dur);
    el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

if ("IntersectionObserver" in window && !reducedMotion) {
  document.documentElement.classList.add("can-reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        entry.target.querySelectorAll("[data-count]").forEach(countUp);
        io.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}
