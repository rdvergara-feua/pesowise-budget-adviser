// App: Rules & Limits. A read-only view of the knowledge base, so the class
// (and the user) can see exactly what the expert system reasons with.

import { el } from "../dom.js";

const pct = (x) => Math.round(x * 100) + "%";

function table(headers, rows) {
  return el("table", { class: "table" },
    el("thead", {}, el("tr", {}, headers.map((h) => el("th", { text: h })))),
    el("tbody", {}, rows.map((r) => el("tr", {}, r.map((cell) => el("td", { text: cell }))))));
}

function mount(body, ctx) {
  ctx.config.then((config) => {
    if (!config) {
      body.append(el("p", { class: "note bad pane", text: "Can't reach the PesoWise server.\nStart it with:  python app.py" }));
      return;
    }
    body.append(el("div", { class: "pane scroll" },
      el("h3", { class: "section-title", text: "Spending limits (share of income)" }),
      table(["Category", "Type", "Limit"], config.categories.map((c) => [
        c, config.needs.includes(c) ? "Need" : "Want", pct(config.limits[c])])),
      el("h3", { class: "section-title", text: "50 / 30 / 20 target" }),
      table(["Bucket", "Target"], Object.entries(config.targets).map(([k, v]) => [k, pct(v)])),
      el("h3", { class: "section-title", text: "The IF–THEN rules" }),
      table(["Rule", "IF…", "Priority"], config.rules.map((r) => [r.rule, r.condition, r.priority])),
      el("p", { class: "note", text: "Housing can be flagged but is never cut automatically. Landing exactly on a limit does not trigger its rule." })));
  });
}

export default {
  id: "rules",
  title: "Rules & Limits",
  icon: "📜",
  width: 560,
  height: 560,
  mount,
};
