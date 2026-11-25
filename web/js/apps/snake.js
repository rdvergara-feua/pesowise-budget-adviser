// App: Coin Snake. Collect ₱ coins without hitting a wall or yourself.
// Rules live in snake-logic.js; this file draws and handles input.

import { el, loadJSON, saveJSON } from "../dom.js";
import * as sfx from "../sfx.js";
import { COLS, ROWS, delay, newGame, queueTurn, step } from "./snake-logic.js";

const CELL = 18;
const BEST_KEY = "pesowise.snake.best";
const KEYS = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
  w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
};

function mount(body) {
  const css = getComputedStyle(document.documentElement);
  const color = (name) => css.getPropertyValue(name).trim();

  const score = el("span", { class: "snake-score" });
  const best = el("span", { class: "snake-score" });
  const canvas = el("canvas", { class: "snake-canvas", width: COLS * CELL, height: ROWS * CELL, "aria-label": "Snake game board" });
  const ctx = canvas.getContext("2d");
  const pauseButton = el("button", { type: "button", class: "btn btn-lavender", text: "PAUSE", onClick: () => togglePause() });
  const restartButton = el("button", { type: "button", class: "btn btn-pink", text: "NEW GAME", onClick: () => restart() });

  // On-screen arrows for touch screens (hidden on desktop by CSS).
  const pad = (label, dx, dy, area) =>
    el("button", { type: "button", class: "btn btn-blue dpad-" + area, "aria-label": "Move " + area, text: label, onClick: () => turn(dx, dy) });
  const dpad = el("div", { class: "dpad" }, pad("▲", 0, -1, "up"), pad("◀", -1, 0, "left"),
    pad("▶", 1, 0, "right"), pad("▼", 0, 1, "down"));

  const root = el("div", { class: "snake", tabindex: "0" },
    el("div", { class: "snake-bar" }, score, best),
    canvas,
    el("div", { class: "actions" }, pauseButton, restartButton),
    el("p", { class: "note small", text: "Arrow keys or WASD · Space pauses" }),
    dpad);
  body.appendChild(root);

  let game, timer, started, paused, bestScore = Number(loadJSON(BEST_KEY, 0)) || 0;

  function restart() {
    clearTimeout(timer);
    game = newGame();
    started = false;
    paused = false;
    draw();
    root.focus();
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(tick, delay(game.score));
  }

  function tick() {
    const before = game.score;
    step(game);
    if (game.score > before) sfx.coin();
    if (game.over) (game.won ? sfx.win : sfx.lose)();
    if (game.score > bestScore) {
      bestScore = game.score;
      saveJSON(BEST_KEY, bestScore);
    }
    draw();
    if (!game.over) schedule();
  }

  function turn(dx, dy) {
    if (game.over) return;
    queueTurn(game, dx, dy);
    if (!started) { started = true; schedule(); }
    if (paused) togglePause(false);
    draw();
  }

  function togglePause(force) {
    if (!started || game.over) return;
    paused = force ?? !paused;
    if (paused) clearTimeout(timer);
    else schedule();
    draw();
  }

  function banner(lines) {
    ctx.fillStyle = "rgba(80, 39, 71, .72)";
    ctx.fillRect(0, canvas.height / 2 - 44, canvas.width, 88);
    ctx.fillStyle = "#fff7fb";
    ctx.textAlign = "center";
    lines.forEach(([text, size], i) => {
      ctx.font = `bold ${size}px "Courier New", monospace`;
      ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 10 + i * 28);
    });
  }

  function draw() {
    score.textContent = `Coins: ${game.score}`;
    best.textContent = `Best: ${bestScore}`;
    pauseButton.textContent = paused ? "RESUME" : "PAUSE";

    ctx.fillStyle = color("--blue");
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,255,255,.35)"; // checkerboard so cells are readable
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      if ((x + y) % 2) ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    }

    if (game.food) { // gold coin with a ₱
      const cx = game.food.x * CELL + CELL / 2, cy = game.food.y * CELL + CELL / 2;
      ctx.fillStyle = "#f5c542";
      ctx.fillRect(game.food.x * CELL + 2, game.food.y * CELL + 2, CELL - 4, CELL - 4);
      ctx.strokeStyle = color("--plum");
      ctx.lineWidth = 2;
      ctx.strokeRect(game.food.x * CELL + 2, game.food.y * CELL + 2, CELL - 4, CELL - 4);
      ctx.fillStyle = color("--plum");
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.textAlign = "center";
      ctx.fillText("₱", cx, cy + 4);
    }

    game.snake.forEach((part, i) => {
      ctx.fillStyle = i === 0 ? color("--plum") : color("--pink");
      ctx.fillRect(part.x * CELL + 1, part.y * CELL + 1, CELL - 2, CELL - 2);
      ctx.strokeStyle = color("--plum");
      ctx.lineWidth = 2;
      ctx.strokeRect(part.x * CELL + 1, part.y * CELL + 1, CELL - 2, CELL - 2);
    });

    if (game.over) banner([[game.won ? "YOU WIN! ♥" : "GAME OVER", 22], [`${game.score} coins saved`, 14]]);
    else if (paused) banner([["PAUSED", 22]]);
    else if (!started) banner([["Press an arrow key", 16], ["to start ♡", 16]]);
  }

  root.addEventListener("keydown", (event) => {
    const dir = KEYS[event.key] ?? KEYS[event.key.toLowerCase()];
    if (dir) turn(...dir);
    else if (event.key === " ") togglePause();
    else if (event.key === "Enter" && game.over) restart();
    else return;
    event.preventDefault();
  });
  root.addEventListener("blur", () => togglePause(true)); // clicking away pauses

  // Swipe to steer on touch screens.
  let touchStart = null;
  canvas.addEventListener("touchstart", (e) => { touchStart = e.touches[0]; }, { passive: true });
  canvas.addEventListener("touchend", (e) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.clientX;
    const dy = e.changedTouches[0].clientY - touchStart.clientY;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) turn(Math.sign(dx), 0);
    else turn(0, Math.sign(dy));
  });

  restart();
  return () => clearTimeout(timer); // window closed: stop the game loop
}

export default {
  id: "snake",
  title: "Coin Snake",
  icon: "🐍",
  width: 400,
  height: 560,
  mount,
};
