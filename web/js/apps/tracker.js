// App: Expense Tracker. Log what you spend, see each category against the
// knowledge-base limit (share of income). Data stays in this browser.

import { el, loadJSON, saveJSON, toNumber } from "../dom.js";
import { peso, percent } from "../format.js";

const KEY = "pesowise.tracker";
const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local time

function mount(body, ctx) {
  ctx.config.then((config) => {
    if (!config) {
      body.append(el("p", { class: "note bad pane", text: "Can't reach the PesoWise server.\nStart it with:  python app.py" }));
      return;
    }
    build(body, config);
  });
}

function build(body, config) {
  const state = loadJSON(KEY, { income: "", entries: [] });
  const save = () => saveJSON(KEY, state);

  const income = el("input", { id: "trk-income", class: "entry", type: "text", inputmode: "decimal", value: state.income, placeholder: "e.g. 35000", autocomplete: "off" });
  const month = el("input", { id: "trk-month", class: "entry", type: "month", value: today().slice(0, 7) });
  const desc = el("input", { id: "trk-desc", class: "entry", type: "text", placeholder: "What was it?", maxlength: 60, autocomplete: "off" });
  const category = el("select", { id: "trk-cat", class: "entry" }, config.categories.map((c) => el("option", { value: c, text: c })));
  const amount = el("input", { id: "trk-amount", class: "entry", type: "text", inputmode: "decimal", placeholder: "Amount", autocomplete: "off" });
  const date = el("input", { id: "trk-date", class: "entry", type: "date", value: today() });
  const message = el("p", { class: "note bad", role: "alert" });
  const summary = el("div", { class: "summary" });
  const list = el("div", { class: "entries" });
  const total = el("div", { class: "kv strong" });

  const form = el("form", { class: "add-form", autocomplete: "off" },
    el("div", { class: "form-row" }, desc, category),
    el("div", { class: "form-row" }, amount, date, el("button", { type: "submit", class: "btn btn-pink", text: "ADD ♥" })),
    message);

  body.append(el("div", { class: "pane scroll" },
    el("div", { class: "form-row between" },
      el("label", { class: "field inline", for: "trk-income" }, el("span", { text: "Monthly income ₱" }), income),
      el("label", { class: "field inline", for: "trk-month" }, el("span", { text: "Month" }), month)),
    form,
    el("h3", { class: "section-title", text: "Spending vs. guide limits" }),
    summary,
    el("h3", { class: "section-title", text: "Entries" }),
    list,
    total,
    el("div", { class: "actions left" },
      el("button", { type: "button", class: "btn btn-lavender", text: "CLEAR THIS MONTH", onClick: clearMonth }))));

  const inMonth = () => state.entries.filter((e) => e.date.startsWith(month.value));

  function render() {
    const entries = inMonth();
    const income_ = toNumber(income.value) ?? 0;
    const spent = Object.fromEntries(config.categories.map((c) => [c, 0]));
    for (const e of entries) if (e.category in spent) spent[e.category] += e.amount;
    const sum = Object.values(spent).reduce((a, b) => a + b, 0);

    summary.replaceChildren(...config.categories.map((c) => {
      const limitAmount = income_ * config.limits[c];
      const over = income_ > 0 && spent[c] > limitAmount;
      const fill = income_ > 0 ? Math.min(spent[c] / limitAmount, 1) : sum > 0 ? spent[c] / sum : 0;
      const detail = income_ > 0
        ? `${peso(spent[c])} · ${percent(spent[c] / income_)} of ${percent(config.limits[c]).replace(".0", "")} limit`
        : peso(spent[c]);
      return el("div", { class: "cat" },
        el("div", { class: "kv" }, el("span", { text: c }), el("span", { class: over ? "bad" : "", text: detail })),
        el("div", { class: "bar" + (over ? " over" : "") }, el("div", { class: "bar-fill", style: `width:${fill * 100}%` })));
    }));
    if (income_ === 0) summary.prepend(el("p", { class: "note", text: "Add your monthly income to compare against the limits." }));

    list.replaceChildren(...(entries.length === 0
      ? [el("p", { class: "note", text: "No entries this month yet." })]
      : entries.slice().sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).map((e) =>
        el("div", { class: "entry-row" },
          el("span", { class: "entry-date", text: e.date.slice(5) }),
          el("span", { class: "entry-desc", text: `${e.desc} · ${e.category}` }),
          el("span", { class: "entry-amt", text: peso(e.amount) }),
          el("button", { type: "button", class: "btn btn-pink mini", title: "Delete", "aria-label": "Delete entry", text: "×", onClick: () => remove(e.id) })))));

    total.replaceChildren(el("span", { text: "Total this month" }), el("span", { text: peso(sum) }));
    if (income_ > 0) total.append(el("span", { class: sum > income_ ? "bad" : "good", text: sum > income_ ? " (over income!)" : ` (${peso(income_ - sum)} left)` }));
  }

  function remove(id) {
    state.entries = state.entries.filter((e) => e.id !== id);
    save();
    render();
  }

  function clearMonth() {
    const count = inMonth().length;
    if (count === 0 || !confirm(`Delete all ${count} entries for this month?`)) return;
    state.entries = state.entries.filter((e) => !e.date.startsWith(month.value));
    save();
    render();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = toNumber(amount.value);
    if (value === null || value <= 0) { message.textContent = "Enter an amount greater than zero."; return; }
    if (!date.value) { message.textContent = "Pick a date."; return; }
    message.textContent = "";
    state.entries.push({
      id: Date.now(), date: date.value, category: category.value,
      desc: desc.value.trim() || category.value, amount: value,
    });
    save();
    desc.value = amount.value = "";
    month.value = date.value.slice(0, 7); // jump to the month just added to
    render();
    desc.focus();
  });

  income.addEventListener("input", () => { state.income = income.value; save(); render(); });
  month.addEventListener("input", render);
  render();
}

export default {
  id: "tracker",
  title: "Expense Tracker",
  icon: "🧾",
  width: 560,
  height: 600,
  mount,
};
