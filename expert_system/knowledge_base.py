"""STEP 2: KNOWLEDGE BASE
Constants that every other module reads: categories, limits, targets, sample.
Change a limit here and every rule, chart and report follows automatically.
"""

CATEGORIES = [
    "Housing", "Food", "Transportation", "Utilities", "Healthcare",
    "Entertainment", "Shopping", "Other expenses"
]
NEEDS = CATEGORIES[:5]
WANTS = CATEGORIES[5:]

# Share of income each category should stay under.
LIMITS = {
    "Housing": .30, "Food": .15, "Transportation": .10, "Utilities": .10,
    "Healthcare": .05, "Entertainment": .05, "Shopping": .05,
    "Other expenses": .05,
}

# 50/30/20 rule.
TARGETS = {"Needs": .50, "Wants": .30, "Savings": .20}

PRIORITY = {"High": 0, "Medium": 1, "Low": 2, "Informational": 3}

SAMPLE = {
    "monthly_income": 35000,
    "expenses": {
        "Housing": 10000, "Food": 6500, "Transportation": 4500,
        "Utilities": 2500, "Healthcare": 1000, "Entertainment": 2500,
        "Shopping": 2000, "Other expenses": 1000,
    },
    "savings_goal": 60000,
    "target_months": 10,
    "current_savings": 5000,
    "emergency_savings": 15000,
}
