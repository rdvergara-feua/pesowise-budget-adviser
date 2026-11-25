// App: Calculator. Plain "type, operator, type, equals" calculator with
// keyboard support. No eval(): every operation goes through compute().

import { el } from "../dom.js";

const KEYS = [
  ["C", "clear", "fn"], ["⌫", "back", "fn"], ["%", "percent", "fn"], ["÷", "÷", "op"],
  ["7", "7"], ["8", "8"], ["9", "9"], ["×", "×", "op"],
  ["4", "4"], ["5", "5"], ["6", "6"], ["−", "−", "op"],
  ["1", "1"], ["2", "2"], ["3", "3"], ["+", "+", "op"],
  ["±", "sign", "fn"], ["0", "0"], [".", "."], ["=", "equals", "eq"],
];

const KEYBOARD_OPS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

// Trim floating-point noise (0.1 + 0.2 -> 0.3).
const tidy = (n) => String(Number(n.toPrecision(12)));

function compute(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "−": return a - b;
    case "×": return a * b;
    case "÷": return b === 0 ? null : a / b;
  }
}

function withCommas(text) {
  const [whole, decimals] = text.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimals === undefined ? grouped : grouped + "." + decimals;
}

function mount(body) {
  let current = "0";   // what is typed / shown
  let stored = null;   // left-hand number waiting for an operator
  let op = null;
  let overwrite = true; // next digit starts a new number
  let error = false;
  let history = "";

  const expression = el("div", { class: "calc-expr" });
  const display = el("div", { class: "calc-display", "aria-live": "polite" });
  const root = el("div", { class: "calc", tabindex: "0" }, expression, display,
    el("div", { class: "calc-keys" }, KEYS.map(([label, action, kind = "num"]) =>
      el("button", { type: "button", class: "calc-key " + kind, text: label, onClick: () => press(action) }))));
  body.appendChild(root);

  function render() {
    display.textContent = error ? "Cannot divide by zero" : withCommas(current);
    display.classList.toggle("error", error);
    expression.textContent = history || " ";
  }

  function reset() {
    current = "0"; stored = null; op = null; overwrite = true; error = false; history = "";
  }

  function digit(d) {
    if (overwrite) {
      current = d === "." ? "0." : d;
      overwrite = false;
    } else {
      if (d === "." && current.includes(".")) return;
      if (current.replace(/[-.]/g, "").length >= 15) return;
      current = current === "0" && d !== "." ? d : current + d;
    }
  }

  function setOperator(next) {
    if (op && !overwrite) {
      const result = compute(stored, Number(current), op);
      if (result === null) { error = true; return; }
      stored = result;
      current = tidy(result);
    } else {
      stored = Number(current);
    }
    op = next;
    overwrite = true;
    history = `${withCommas(tidy(stored))} ${op}`;
  }

  function equals() {
    if (op === null) return;
    const right = Number(current);
    const result = compute(stored, right, op);
    if (result === null) { error = true; return; }
    history = `${withCommas(tidy(stored))} ${op} ${withCommas(tidy(right))} =`;
    current = tidy(result);
    stored = null;
    op = null;
    overwrite = true;
  }

  function press(action) {
    if (error && action !== "clear") return;
    if (/^[0-9.]$/.test(action)) digit(action);
    else if ("+−×÷".includes(action)) setOperator(action);
    else if (action === "equals") equals();
    else if (action === "clear") reset();
    else if (action === "back") {
      if (!overwrite) current = current.length > 1 && current !== "-" ? current.slice(0, -1) || "0" : "0";
      if (current === "-") current = "0";
    } else if (action === "sign") {
      if (current !== "0") current = current.startsWith("-") ? current.slice(1) : "-" + current;
    } else if (action === "percent") {
      current = tidy(Number(current) / 100);
      overwrite = true;
    }
    render();
  }

  root.addEventListener("keydown", (event) => {
    const { key } = event;
    if (/^[0-9.]$/.test(key)) press(key);
    else if (key in KEYBOARD_OPS) press(KEYBOARD_OPS[key]);
    else if (key === "Enter" || key === "=") press("equals");
    else if (key === "Backspace") press("back");
    else if (key === "Escape" || key === "Delete") press("clear");
    else if (key === "%") press("percent");
    else return;
    event.preventDefault();
  });

  render();
  root.focus();
}

export default {
  id: "calculator",
  title: "Calculator",
  icon: "🧮",
  width: 300,
  height: 440,
  mount,
};
