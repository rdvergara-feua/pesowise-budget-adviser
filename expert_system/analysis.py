"""STEP 3b: ANALYSIS
Turns raw user data into the facts used by every rule.
"""

import math

from .knowledge_base import NEEDS, WANTS


def analyze(profile):
    """Turn raw user data into facts used by every rule."""
    expenses = profile["expenses"]
    income = profile["monthly_income"]
    total = sum(expenses.values())
    surplus = income - total
    remaining_goal = max(0, profile["savings_goal"] - profile["current_savings"])
    required = remaining_goal / profile["target_months"]
    return {
        "income": income,
        "expenses": expenses,
        "total": total,
        "surplus": surplus,
        "savings_rate": surplus / income,
        "required": required,
        "shortfall": max(0, required - surplus),
        "shares": {name: value / income for name, value in expenses.items()},
        "needs": sum(expenses[name] for name in NEEDS),
        "wants": sum(expenses[name] for name in WANTS),
        "emergency_months": profile["emergency_savings"] / total if total else math.inf,
        "goal_achieved": remaining_goal == 0,
    }
