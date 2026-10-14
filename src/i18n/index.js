// One reactive language for the whole page. Static markup is translated by
// walking [data-i18n] / [data-i18n-html]; Vue islands read t() and re-render
// on their own because `state.lang` is reactive.
import { reactive } from "vue";
import en from "./en.js";
import sk from "./sk.js";
import cs from "./cs.js";

export const dictionaries = { en, sk, cs };
export const languages = Object.keys(dictionaries);
const STORAGE_KEY = "dinoryde.lang";

function stored() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function detect() {
  const saved = stored();
  if (languages.includes(saved)) return saved;
  const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
  return languages.includes(nav) ? nav : "en";
}

export const state = reactive({ lang: detect() });

export function t(key, vars) {
  const text = dictionaries[state.lang][key] ?? en[key] ?? key;
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? "");
}

// Number formatting follows the language (1 234 in SK/CS, 1,234 in EN).
export function num(value, digits = 0) {
  return new Intl.NumberFormat(state.lang, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function applyStatic(page) {
  document.documentElement.lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  // Only for strings that must carry a link; dictionaries are ours, not user input.
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    el.alt = t(el.dataset.i18nAlt);
  });
  document.querySelectorAll("[data-i18n-label]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nLabel));
  });
  const title = dictionaries[state.lang][`meta.${page}.title`];
  if (title) document.title = title;
  const description = dictionaries[state.lang][`meta.${page}.description`];
  if (description) document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.lang === state.lang));
  });
}

export function setLang(lang, page) {
  if (!languages.includes(lang)) return;
  state.lang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* private mode: the choice just isn't remembered */
  }
  applyStatic(page);
}

export function initI18n(page) {
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang, page));
  });
  applyStatic(page);
}
