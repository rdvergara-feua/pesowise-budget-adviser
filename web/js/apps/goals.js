// App: Savings Goal planner. Pure client-side maths: how much per month to hit
// a goal on time, and how long a chosen monthly amount would take.

import { el, loadJSON, saveJSON, toNumber } from "../dom.js";
import { peso, percent } from "../format.js";

const KEY = "pesowise.goals";

function mount(body) {
  const saved = loadJSON(KEY, {});
  const field = (id, label, value) => {
    const input = el("input", { id: "goal-" + id, class: "entry", type: "text", inputmode: "decimal", value: value ?? "", autocomplete: "off" });
    return { input, row: el("label", { class: "field", for: "goal-" + id }, el("span", { text: label }), input) };
  };

  const goal = field("goal", "Savings goal (₱)", saved.goal);
  const current = field("current", "Saved so far (₱)", saved.current);
  const months = field("months", "Months to reach it", saved.months);
  const monthly = field("monthly", "OR: I can save per month (₱)", saved.monthly);
  const result = el("div", { class: "goal-result" });

  body.append(el("div", { class: "pane" },
    el("p", { class: "note", text: "Plan a savings goal. Fill the first three to see what to set aside each month." }),
    goal.row, current.row, months.row, monthly.row, result));

  function line(label, value, strong = false) {
    return el("div", { class: "kv" + (strong ? " strong" : "") }, el("span", { text: label }), el("span", { text: value }));
  }

  function update() {
    const g = toNumber(goal.input.value);
    const c = toNumber(current.input.value) ?? 0;
    const m = toNumber(months.input.value);
    const per = toNumber(monthly.input.value);
    saveJSON(KEY, {
      goal: goal.input.value, current: current.input.value,
      months: months.input.value, monthly: monthly.input.value,
    });
    result.replaceChildren();

    if (g === null || g <= 0) return result.append(el("p", { class: "note", text: "Enter a savings goal to begin." }));
    if (c < 0 || (m !== null && m <= 0) || (per !== null && per < 0)) {
      return result.append(el("p", { class: "note bad", text: "Amounts can't be negative and months must be more than zero." }));
    }

    const left = Math.max(g - c, 0);
    const progress = Math.min(c / g, 1);
    const bar = el("div", { class: "bar" }, el("div", { class: "bar-fill", style: `width:${progress * 100}%` }));
    result.append(el("div", { class: "kv-block" }, line("Progress", percent(progress)), bar, line("Still needed", peso(left))));

    if (left === 0) return result.append(el("p", { class: "note good", text: "Goal reached! ♡" }));
    if (m !== null) result.append(line("Save each month", peso(left / m), true));
    if (per !== null && per > 0) {
      const needed = Math.ceil(left / per);
      result.append(line(`At ${peso(per)}/month`, `${needed} month${needed === 1 ? "" : "s"}`, true));
      if (m !== null) {
        result.append(el("p", {
          class: "note " + (needed <= m ? "good" : "bad"),
          text: needed <= m ? "That pace reaches the goal on time ✓" : `That is ${needed - m} month(s) later than your target.`,
        }));
      }
    }
  }

  for (const f of [goal, current, months, monthly]) f.input.addEventListener("input", update);
  update();
  goal.input.focus();
}

export default {
  id: "goals",
  title: "Savings Goals",
  icon: "🎯",
  width: 420,
  height: 500,
  mount,
};
