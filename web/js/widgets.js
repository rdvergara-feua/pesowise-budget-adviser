// Desktop widgets: a "this month" spending card and a savings-goal card.
// They read what the Expense Tracker and Savings Goals apps saved, and refresh
// whenever those apps save (see the "pesowise:data" event in dom.js).

import { el, loadJSON, toNumber } from "./dom.js";
import { peso, percent } from "./format.js";
import { countTo } from "./motion.js";
import * as settings from "./settings.js";

const thisMonth = () => new Date().toLocaleDateString("en-CA").slice(0, 7);

export function mountWidgets(container, openApp) {
  const bar = () => el("div", { class: "bar" }, el("div", { class: "bar-fill" }));

  const spendAmount = el("span", { class: "w-big" });
  const spendNote = el("span", { class: "w-note" });
  const spendBar = bar();
  const spendCard = el("button", { type: "button", class: "widget", title: "Open Expense Tracker", onClick: () => openApp("tracker") },
    el("span", { class: "w-title", text: "💸 This month" }), spendAmount, spendBar, spendNote);

  const goalPercent = el("span", { class: "w-big" });
  const goalNote = el("span", { class: "w-note" });
  const goalBar = bar();
  const goalCard = el("button", { type: "button", class: "widget", title: "Open Savings Goals", onClick: () => openApp("goals") },
    el("span", { class: "w-title", text: "🎯 Savings goal" }), goalPercent, goalBar, goalNote);

  container.append(spendCard, goalCard);

  const fill = (barNode, ratio) => { barNode.firstChild.style.width = Math.min(Math.max(ratio, 0), 1) * 100 + "%"; };

  function render() {
    // Spending
    const tracker = loadJSON("pesowise.tracker", { income: "", entries: [] });
    const month = thisMonth();
    const spent = (tracker.entries ?? []).filter((e) => e.date?.startsWith(month)).reduce((sum, e) => sum + e.amount, 0);
    const income = toNumber(tracker.income ?? "") ?? 0;
    countTo(spendAmount, spent, peso);
    spendBar.classList.toggle("over", income > 0 && spent > income);
    fill(spendBar, income > 0 ? spent / income : 0);
    spendNote.textContent = income > 0
      ? (spent > income ? `Over your ${peso(income)} income!` : `${percent(spent / income)} of ${peso(income)} income`)
      : spent > 0 ? "Add your income in Expense Tracker" : "Nothing logged yet";

    // Goal
    const goals = loadJSON("pesowise.goals", {});
    const goal = toNumber(goals.goal ?? "") ?? 0;
    const saved = Math.max(toNumber(goals.current ?? "") ?? 0, 0);
    const ratio = goal > 0 ? Math.min(saved / goal, 1) : 0;
    countTo(goalPercent, ratio, percent);
    fill(goalBar, ratio);
    goalNote.textContent = goal > 0 ? `${peso(saved)} of ${peso(goal)}` : "Set a goal in Savings Goals";
  }

  const applyVisibility = () => { container.hidden = !settings.get("widgets"); };

  window.addEventListener("pesowise:data", render);
  window.addEventListener("storage", render);
  setInterval(render, 60000); // month rollover
  settings.onChange((key) => { if (key === "widgets") applyVisibility(); });
  applyVisibility();
  render();
}
