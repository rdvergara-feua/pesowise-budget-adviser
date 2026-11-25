// App: PesoWise Adviser. The chat flow from the original single-window version:
// ask questions, validate input, call the server, show results.

import * as api from "../api.js";
import { createChat, showPopup } from "../chat-ui.js";
import { el } from "../dom.js";
import { buildQuestions } from "../questions.js";
import { showErrors, showReport } from "../report.js";

function mount(body, ctx) {
  const chatBox = el("div", { class: "chat" });
  const prompt = el("label", { class: "prompt", text: "Type amount:" });
  const entry = el("input", { class: "entry", type: "text", inputmode: "decimal", autocomplete: "off" });
  const sendButton = el("button", { type: "submit", class: "btn btn-pink", text: "SEND ♥" });
  const sampleButton = el("button", { type: "button", class: "btn btn-lavender", text: "SAMPLE" });
  const form = el("form", { class: "input-bar", autocomplete: "off" }, prompt, entry, sendButton, sampleButton);
  prompt.htmlFor = entry.id = "adviser-entry";

  body.append(
    el("div", { class: "status-bar", text: "☺  ♥  ★  Rule-Based Decision Support • Online" }),
    el("section", { class: "chat-area" }, chatBox),
    form
  );

  const chat = createChat(chatBox);
  let questions = [];
  let sample = {};
  let data = {};
  let index = 0;

  // ---------- Chat flow ----------
  function startChat() {
    chat.bubble("Hi! I'm PesoWise ♡\nI'll ask a few questions, then my IF–THEN rules will explain where your spending could change.");
    ask();
  }

  function ask() {
    if (index >= questions.length) return finish();
    const [, text, label] = questions[index];
    chat.bubble(text);
    prompt.textContent = label + ":";
    entry.focus();
  }

  function send() {
    if (index >= questions.length) return;
    const value = Number(entry.value.trim().replaceAll(",", ""));
    if (entry.value.trim() === "" || Number.isNaN(value)) {
      return alert("Please enter numbers only, such as 35000.");
    }
    if (value < 0) return alert("Amounts cannot be negative.");

    const [key] = questions[index];
    if ((key === "monthly_income" || key === "target_months") && value === 0) {
      return alert("This value must be greater than zero.");
    }

    if (key.startsWith("expense:")) {
      (data.expenses ??= {})[key.split(":")[1]] = value;
    } else {
      data[key] = value;
    }

    const shown = key === "target_months"
      ? `${value} months`
      : "₱" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    chat.bubble(shown, { user: true });
    entry.value = "";
    index += 1;
    setTimeout(ask, 100);
  }

  function useSample() {
    data = structuredClone(sample);
    index = questions.length;
    chat.bubble("Use the sample young-professional profile.", { user: true });
    finish();
  }

  async function finish() {
    setBusy(true);
    let report;
    try {
      report = await api.advise(data);
    } catch (error) {
      return chat.bubble("Could not reach the adviser: " + error.message, { color: "error" });
    }
    if (!report.valid) return showErrors(chat, report);
    showReport(chat, report);
    chat.actionButtons([
      { label: "VIEW CHARTS", color: "pink", onClick: viewCharts },
      { label: "SYSTEM TESTS", color: "lavender", onClick: () => ctx.openApp("tests") },
      { label: "START AGAIN", color: "green", onClick: restart },
    ]);
  }

  function setBusy(busy) {
    entry.disabled = sendButton.disabled = sampleButton.disabled = busy;
  }

  function restart() {
    chat.clear();
    data = {};
    index = 0;
    setBusy(false);
    startChat();
  }

  async function viewCharts() {
    try {
      const image = new Image();
      image.alt = "PesoWise financial comparison charts";
      image.src = await api.getChartsUrl(data);
      showPopup("PesoWise • Financial Comparison", image);
    } catch (error) {
      alert(error.message);
    }
  }

  // ---------- Wiring ----------
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    send();
  });
  sampleButton.addEventListener("click", useSample);

  ctx.config.then((config) => {
    if (!config) {
      chat.bubble("Can't reach the PesoWise server.\nStart it with:  python app.py", { color: "error" });
      setBusy(true);
      return;
    }
    questions = buildQuestions(config.categories);
    sample = config.sample;
    setTimeout(startChat, 150);
  });
}

export default {
  id: "adviser",
  title: "PesoWise Adviser",
  icon: "🐷",
  width: 720,
  height: 560,
  mount,
};
