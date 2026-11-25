// The home screen: icons, draggable windows and the taskbar.
// Apps live in js/apps/. To add one, create a file there and list it in
// apps/index.js; nothing in this file changes.

import * as api from "./api.js";
import { APPS } from "./apps/index.js";
import { el } from "./dom.js";

const desktop = document.getElementById("desktop");
const iconBar = document.getElementById("icons");
const tasks = document.getElementById("tasks");
const clock = document.getElementById("clock");

const phone = window.matchMedia("(max-width: 700px)");
const touch = window.matchMedia("(pointer: coarse)");

const open = new Map(); // app id -> { win, task, app, unmount }
let zTop = 10;
let cascade = 0;
// Apps await this; it resolves to null if the Python server can't be reached.
const config = api.getConfig().catch(() => null);

// ---------- Windows ----------
function openApp(id) {
  const existing = open.get(id);
  if (existing) return restore(existing);

  const app = APPS.find((a) => a.id === id);
  const body = el("div", { class: "win-body" });
  const controls = [
    ["min", "—", "Minimize", () => minimize(entry)],
    ["max", "□", "Maximize", () => toggleMax(entry)],
    ["close", "×", "Close", () => close(entry)],
  ].map(([cls, label, title, onClick]) =>
    el("button", { type: "button", class: "win-btn " + cls, title, "aria-label": title, text: label, onClick })
  );
  const titleBar = el("header", { class: "title-bar" },
    el("span", { class: "title-text", text: `${app.icon}  ${app.title}` }),
    el("span", { class: "title-controls" }, controls));
  const win = el("section", { class: "win", role: "dialog", "aria-label": app.title }, titleBar, body);
  const task = el("button", { type: "button", class: "task", text: `${app.icon} ${app.title}` });

  const entry = { id, win, task, app, unmount: null };
  place(win, app);
  desktop.appendChild(win);
  tasks.appendChild(task);
  open.set(id, entry);

  win.addEventListener("pointerdown", () => focus(entry));
  task.addEventListener("click", () => {
    if (entry.win.hidden || !entry.win.classList.contains("active")) restore(entry);
    else minimize(entry);
  });
  titleBar.addEventListener("dblclick", (event) => {
    if (!event.target.closest(".win-btn")) toggleMax(entry);
  });
  enableDrag(titleBar, entry);

  entry.unmount = app.mount(body, { config, openApp }) || null;
  focus(entry);
}

function place(win, app) {
  const room = desktop.getBoundingClientRect();
  const width = Math.min(app.width, room.width - 20);
  const height = Math.min(app.height, room.height - 20);
  const step = (cascade++ % 6) * 28;
  const left = Math.max(10, Math.min(130 + step, room.width - width - 10));
  const top = Math.max(10, Math.min(24 + step, room.height - height - 10));
  Object.assign(win.style, { width: width + "px", height: height + "px", left: left + "px", top: top + "px" });
  if (phone.matches) win.classList.add("max");
}

function focus(entry) {
  for (const other of open.values()) {
    other.win.classList.toggle("active", other === entry);
    other.task.classList.toggle("active", other === entry);
  }
  entry.win.style.zIndex = ++zTop;
}

function restore(entry) {
  entry.win.hidden = false;
  entry.task.classList.remove("minimized");
  focus(entry);
}

function minimize(entry) {
  entry.win.hidden = true;
  entry.win.classList.remove("active");
  entry.task.classList.remove("active");
  entry.task.classList.add("minimized");
}

function toggleMax(entry) {
  entry.win.classList.toggle("max");
}

function close(entry) {
  entry.unmount?.();
  entry.win.remove();
  entry.task.remove();
  open.delete(entry.id);
}

function enableDrag(handle, entry) {
  handle.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".win-btn") || entry.win.classList.contains("max")) return;
    if (event.button !== 0) return;
    const win = entry.win;
    const startX = event.clientX - win.offsetLeft;
    const startY = event.clientY - win.offsetTop;
    handle.setPointerCapture(event.pointerId);

    const move = (e) => {
      const room = desktop.getBoundingClientRect();
      // Keep part of the title bar on screen so the window can't get lost.
      const left = Math.min(Math.max(e.clientX - startX, 80 - win.offsetWidth), room.width - 80);
      const top = Math.min(Math.max(e.clientY - startY, 0), room.height - 40);
      win.style.left = left + "px";
      win.style.top = top + "px";
    };
    const stop = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", stop);
      handle.removeEventListener("pointercancel", stop);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
  });
}

// ---------- Icons ----------
function buildIcons() {
  for (const app of APPS) {
    const icon = el("button", { type: "button", class: "icon", title: app.title },
      el("span", { class: "icon-art", "aria-hidden": "true", text: app.icon }),
      el("span", { class: "icon-label", text: app.title }));
    icon.addEventListener("click", () => {
      if (touch.matches) return openApp(app.id); // tap opens on phones
      iconBar.querySelectorAll(".icon").forEach((i) => i.classList.toggle("selected", i === icon));
    });
    icon.addEventListener("dblclick", () => openApp(app.id));
    icon.addEventListener("keydown", (event) => {
      if (event.key === "Enter") openApp(app.id);
    });
    iconBar.appendChild(icon);
  }
  desktop.addEventListener("pointerdown", (event) => {
    if (!event.target.closest(".icon")) {
      iconBar.querySelectorAll(".icon.selected").forEach((i) => i.classList.remove("selected"));
    }
  });
}

// ---------- Clock ----------
function tick() {
  clock.textContent = new Date().toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
}

// ---------- Start ----------
(function init() {
  buildIcons();
  tick();
  setInterval(tick, 15000);
})();
