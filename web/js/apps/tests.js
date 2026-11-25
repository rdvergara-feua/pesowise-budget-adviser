// App: System Tests. Runs the Python self-tests and shows pass / fail.

import * as api from "../api.js";
import { el } from "../dom.js";

function mount(body) {
  const status = el("p", { class: "note", text: "Running tests…" });
  const results = el("div", { class: "test-list" });
  const rerun = el("button", { type: "button", class: "btn btn-lavender", text: "RUN AGAIN", onClick: run });
  body.append(el("div", { class: "pane scroll" }, status, results, el("div", { class: "actions left" }, rerun)));

  async function run() {
    rerun.disabled = true;
    status.className = "note";
    status.textContent = "Running tests…";
    try {
      const rows = await api.getTests();
      const failed = rows.filter((r) => !r.Status.startsWith("PASS")).length;
      results.replaceChildren(...rows.map((r) =>
        el("div", { class: "kv" }, el("span", { text: r.Test }), el("span", { class: r.Status.startsWith("PASS") ? "good" : "bad", text: r.Status }))));
      status.className = "note " + (failed ? "bad" : "good");
      status.textContent = failed ? `${failed} of ${rows.length} tests failed.` : `All ${rows.length} tests passed.`;
    } catch {
      results.replaceChildren();
      status.className = "note bad";
      status.textContent = "Can't reach the PesoWise server.\nStart it with:  python app.py";
    }
    rerun.disabled = false;
  }
  run();
}

export default {
  id: "tests",
  title: "System Tests",
  icon: "🧪",
  width: 420,
  height: 440,
  mount,
};
