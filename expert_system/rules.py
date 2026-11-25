"""STEP 4: NINE IF-THEN RULES
Each rule takes the facts and returns a recommendation, or None if it does
not trigger. To add a rule: write a function here and append it to RULES.
"""

from .knowledge_base import LIMITS, WANTS


def recommendation(rule, priority, why, action, cuts=None):
    return {"rule": rule, "priority": priority, "why": why,
            "action": action, "cuts": cuts or {}}


def rule_overspending(f):
    if f["total"] > f["income"]:
        return recommendation("Overspending", "High",
            f"Expenses exceed income by ₱{-f['surplus']:,.2f}.",
            "Reduce flexible spending immediately.")


def rule_goal_gap(f):
    if f["shortfall"] > 0 and not f["goal_achieved"]:
        left, cuts = f["shortfall"], {}
        for category in WANTS:                 # Cut wants first, up to 50% each.
            cut = min(f["expenses"][category] * .50, left)
            if cut > 0:
                cuts[category], left = cut, left - cut
        return recommendation("Goal Gap", "High",
            f"Monthly savings are ₱{f['shortfall']:,.2f} below the goal schedule.",
            "Reduce wants first or extend the target date.", cuts)


def rule_low_savings(f):
    if f["savings_rate"] < .20:
        return recommendation("Low Savings", "Medium",
            f"Savings rate is {f['savings_rate']:.1%}, below 20%.",
            "Work gradually toward saving 20% of income.")


def category_rule(f, category, rule_name):
    if f["shares"][category] > LIMITS[category]:
        excess = f["expenses"][category] - f["income"] * LIMITS[category]
        housing = category == "Housing"
        return recommendation(rule_name, "Medium",
            f"{category} is {f['shares'][category]:.1%} of income; guide is {LIMITS[category]:.0%}.",
            "Review this fixed cost later; no automatic cut." if housing
            else f"Reduce {category.lower()} gradually.",
            {} if housing else {category: excess})


def rule_housing(f):
    return category_rule(f, "Housing", "Housing Limit")


def rule_food(f):
    return category_rule(f, "Food", "Food Limit")


def rule_transport(f):
    return category_rule(f, "Transportation", "Transport Limit")


def rule_entertainment(f):
    return category_rule(f, "Entertainment", "Entertainment Limit")


def rule_emergency(f):
    if f["emergency_months"] < 3:
        return recommendation("Emergency Fund", "Low",
            f"Emergency fund covers only {f['emergency_months']:.1f} months.",
            "Build it until it covers at least three months of expenses.")


def rule_on_track(f):
    if f["shortfall"] == 0 and f["savings_rate"] >= .20:
        return recommendation("On Track", "Informational",
            "Savings meet both the goal schedule and 20% guide.",
            "Maintain the current budget.")


RULES = [rule_overspending, rule_goal_gap, rule_low_savings, rule_housing,
         rule_food, rule_transport, rule_entertainment, rule_emergency,
         rule_on_track]


# Plain-text description of each rule, shown in the desktop's "Rules & Limits"
# app. Keep in step with the functions above when you add or change a rule.
RULE_INFO = [
    {"rule": "Overspending", "condition": "Expenses exceed income", "priority": "High"},
    {"rule": "Goal Gap", "condition": "Surplus is below required savings", "priority": "High"},
    {"rule": "Low Savings", "condition": "Savings rate is below 20%", "priority": "Medium"},
    {"rule": "Housing Limit", "condition": "Housing is above its limit", "priority": "Medium"},
    {"rule": "Food Limit", "condition": "Food is above its limit", "priority": "Medium"},
    {"rule": "Transport Limit", "condition": "Transportation is above its limit", "priority": "Medium"},
    {"rule": "Entertainment Limit", "condition": "Entertainment is above its limit", "priority": "Medium"},
    {"rule": "Emergency Fund", "condition": "Coverage is below three months", "priority": "Low"},
    {"rule": "On Track", "condition": "Goal schedule and 20% target are met", "priority": "Informational"},
]
