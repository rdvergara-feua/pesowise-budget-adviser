// Turns the server's report into chat bubbles (the "explanation output").
// `chat` is the object returned by createChat() in chat-ui.js.

import { months, peso, percent } from "./format.js";

export function showErrors(chat, report) {
  chat.bubble("I found these errors:\n• " + report.errors.join("\n• "), { color: "error" });
}

export function showReport(chat, report) {
  const f = report.facts;

  chat.bubble(
    "ANALYSIS COMPLETE ✦\n" +
      `Income: ${peso(f.income)}\nExpenses: ${peso(f.total)}\n` +
      `Monthly surplus: ${peso(f.surplus)}\nSavings rate: ${percent(f.savings_rate)}\n` +
      `Required savings: ${peso(f.required)}/month`,
    { color: "green" }
  );

  chat.bubble("These IF–THEN rules were triggered:", { color: "lavender" });
  for (const item of report.advice) {
    const cuts = Object.values(item.cuts).reduce((a, b) => a + b, 0);
    const cutText = cuts ? `\nSuggested reduction: ${peso(cuts)}` : "";
    chat.bubble(
      `[${item.priority.toUpperCase()}] ${item.rule}\n` +
        `IF: ${item.why}\nTHEN: ${item.action}${cutText}`
    );
  }

  chat.bubble(
    "RECOMMENDED BUDGET ♥\n" +
      `New expenses: ${peso(report.new_budget.total)}\n` +
      `Expected savings: ${peso(report.new_budget.savings)}/month\n` +
      `Goal timing: ${months(report.before)} → ${months(report.after)}`,
    { color: "pink" }
  );
}
