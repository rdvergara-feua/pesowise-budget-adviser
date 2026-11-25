// User settings (theme, sound, sparkles, animations, widgets), saved in the
// browser. Any module can read them with get() and react with onChange().

import { loadJSON, saveJSON } from "./dom.js";

const KEY = "pesowise.settings";

// `colors` only feed the little preview swatches in the Settings app.
// The real colors live in css/style.css under :root[data-theme="..."].
export const THEMES = [
  { id: "pastel", name: "Strawberry", colors: ["#ddd5fa", "#f5a5ca", "#b9b4ee", "#b9d8f7"] },
  { id: "mint", name: "Mint", colors: ["#cdeee0", "#8fd9b6", "#a9d3e8", "#bfe8f0"] },
  { id: "peach", name: "Peach", colors: ["#ffe3cf", "#ffb08a", "#f4b6c2", "#ffe0a8"] },
  { id: "night", name: "Night", colors: ["#1d1a33", "#a0457f", "#4b4590", "#28325a"] },
];

const DEFAULTS = { theme: "pastel", sound: true, sparkles: true, motion: true, widgets: true };
const reducedByOS = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let state = {
  ...DEFAULTS,
  ...(reducedByOS ? { motion: false, sparkles: false } : {}), // respect the OS setting until the user chooses
  ...loadJSON(KEY, {}),
};
if (!THEMES.some((t) => t.id === state.theme)) state.theme = DEFAULTS.theme;

const listeners = new Set();

function apply() {
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.dataset.motion = state.motion ? "on" : "off";
}

export const get = (key) => state[key];

export function set(key, value) {
  state = { ...state, [key]: value };
  saveJSON(KEY, state);
  apply();
  listeners.forEach((fn) => fn(key, value));
}

export function onChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

apply();
