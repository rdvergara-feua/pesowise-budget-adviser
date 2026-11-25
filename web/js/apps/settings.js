// App: Settings. Theme, sound, sparkles, animations and widgets.
// All values live in settings.js and are saved in this browser.

import { el } from "../dom.js";
import * as settings from "../settings.js";

const TOGGLES = [
  ["sound", "🔊 Sound effects", "Soft blips, coin dings and window sounds."],
  ["sparkles", "✦ Sparkle trail", "Little stars follow the mouse."],
  ["motion", "🎞 Animations", "Window pops, typing bubbles, count-up numbers. Turn off if they bother you."],
  ["widgets", "🧩 Desktop widgets", "Spending and goal cards on the home screen."],
];

function mount(body) {
  const swatches = settings.THEMES.map((theme) => {
    const button = el("button", { type: "button", class: "swatch", "data-theme-id": theme.id, onClick: () => settings.set("theme", theme.id) },
      el("span", { class: "swatch-colors" }, theme.colors.map((c) => el("i", { style: `background:${c}` }))),
      el("span", { text: theme.name }));
    return button;
  });

  const boxes = TOGGLES.map(([key, label, help]) => {
    const input = el("input", { type: "checkbox", id: "set-" + key });
    input.checked = settings.get(key);
    input.addEventListener("change", () => settings.set(key, input.checked));
    return { key, input, row: el("label", { class: "toggle", for: "set-" + key }, input, el("span", {}, el("strong", { text: label }), el("small", { text: help }))) };
  });

  body.append(el("div", { class: "pane scroll" },
    el("h3", { class: "section-title", text: "Theme" }),
    el("div", { class: "swatches", role: "group", "aria-label": "Theme" }, swatches),
    el("h3", { class: "section-title", text: "Feel" }),
    boxes.map((b) => b.row),
    el("p", { class: "note small", text: "Settings are saved in this browser. The Adviser's voice has its own button in its window." })));

  const sync = () => {
    swatches.forEach((s) => s.setAttribute("aria-pressed", String(s.dataset.themeId === settings.get("theme"))));
    boxes.forEach((b) => { b.input.checked = settings.get(b.key); });
  };
  sync();
  return settings.onChange(sync); // stays in step with the taskbar sound button
}

export default {
  id: "settings",
  title: "Settings",
  icon: "⚙️",
  width: 440,
  height: 470,
  mount,
};
