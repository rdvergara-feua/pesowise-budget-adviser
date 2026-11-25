// Small animation helpers: the "animations" setting, count-up numbers and the
// sparkle trail behind the cursor. Everything here switches off with the setting.

import * as settings from "./settings.js";

export const on = () => settings.get("motion");

const ease = (t) => 1 - Math.pow(1 - t, 3); // ease-out cubic

// Tween a number inside `node` from what it showed before to `to`.
// `format` turns the number into text (e.g. peso()).
export function countTo(node, to, format, ms = 650) {
  const from = Number(node.dataset.value ?? 0);
  node.dataset.value = to;
  cancelAnimationFrame(node._frame);
  if (!on() || from === to || !node.isConnected) {
    node.textContent = format(to);
    return;
  }
  const start = performance.now();
  const frame = (now) => {
    const t = Math.min((now - start) / ms, 1);
    node.textContent = format(from + (to - from) * ease(t));
    if (t < 1) node._frame = requestAnimationFrame(frame);
  };
  node._frame = requestAnimationFrame(frame);
}

// ---------- Sparkle trail ----------
const GLYPHS = ["✦", "♡", "★", "✧"];
const COLORS = ["var(--pink)", "var(--lavender)", "var(--hover)", "var(--blue)"];
let last = 0;
let alive = 0;

export function startSparkles() {
  window.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || !settings.get("sparkles") || !on()) return;
    const now = performance.now();
    if (now - last < 55 || alive >= 22) return;
    last = now;
    alive += 1;

    const spark = document.createElement("span");
    spark.className = "spark";
    spark.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    spark.style.left = event.clientX + 6 + "px";
    spark.style.top = event.clientY + 10 + "px";
    spark.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    document.body.appendChild(spark);

    const dx = (Math.random() - 0.5) * 26;
    const dy = 12 + Math.random() * 20;
    const animation = spark.animate(
      [
        { transform: "translate(-50%, -50%) scale(1) rotate(0deg)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.2) rotate(120deg)`, opacity: 0 },
      ],
      { duration: 600 + Math.random() * 300, easing: "ease-out" }
    );
    animation.onfinish = () => { spark.remove(); alive -= 1; };
  }, { passive: true });
}
