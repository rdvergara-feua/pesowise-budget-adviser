// The question list the chat walks through: [key, question text, input label].
// Categories come from the Python knowledge base, so they are never duplicated.

export function buildQuestions(categories) {
  return [
    ["monthly_income", "What is your monthly income?", "Monthly income"],
    ...categories.map((c) => [`expense:${c}`, `How much do you spend on ${c.toLowerCase()}?`, c]),
    ["savings_goal", "What is your savings goal?", "Savings goal"],
    ["target_months", "How many months do you have to reach it?", "Target months"],
    ["current_savings", "How much have you already saved for this goal?", "Current savings"],
    ["emergency_savings", "How much is in your emergency fund?", "Emergency savings"],
  ];
}
