"""Short guided version. Complete the TODOs, then compare with the expert_system package."""

# The guided file focuses on the expert-system logic. The finished web
# interface (web/index.html) is already built so you do not have to rebuild it.

CATEGORIES = ["Housing", "Food", "Transportation", "Utilities", "Healthcare",
              "Entertainment", "Shopping", "Other expenses"]
LIMITS = {"Housing": .30, "Food": .15, "Transportation": .10,
          "Utilities": .10, "Healthcare": .05, "Entertainment": .05,
          "Shopping": .05, "Other expenses": .05}

SAMPLE = {
    "monthly_income": 35000,
    "expenses": {"Housing": 10000, "Food": 6500, "Transportation": 4500,
        "Utilities": 2500, "Healthcare": 1000, "Entertainment": 2500,
        "Shopping": 2000, "Other expenses": 1000},
    "savings_goal": 60000, "target_months": 10,
    "current_savings": 5000, "emergency_savings": 15000,
}


def check(condition, success, hint):
    print("✓ " + success if condition else "✗ " + hint)


# STEP 3
def validate(profile):
    errors = []
    # TODO: reject income <= 0, target_months <= 0, negative amounts,
    # non-numeric amounts, and missing expense categories.
    return errors


def analyze(profile):
    # TODO: return total expenses, surplus, savings rate, required monthly
    # savings, shortfall, category percentages, and emergency fund coverage.
    pass


# STEP 4 — Use this same structure for all nine rule functions.
def rule_overspending(facts):
    # TODO: IF expenses > income, THEN return a High recommendation.
    pass


def rule_goal_gap(facts): pass          # TODO
def rule_low_savings(facts): pass       # TODO
def rule_housing(facts): pass           # TODO; never suggest an automatic cut
def rule_food(facts): pass              # TODO; use >, not >=
def rule_transport(facts): pass         # TODO
def rule_entertainment(facts): pass     # TODO
def rule_emergency(facts): pass         # TODO; coverage below 3 months
def rule_on_track(facts): pass          # TODO; no shortfall and rate >= 20%

RULES = [rule_overspending, rule_goal_gap, rule_low_savings, rule_housing,
         rule_food, rule_transport, rule_entertainment, rule_emergency,
         rule_on_track]


# STEP 5
def infer(facts):
    # TODO: run every rule, ignore None, and sort by priority.
    pass


# STEP 6
def allocate(facts):
    # TODO: compare actual Needs/Wants/Savings with 50/30/20.
    pass


# STEP 7
def adjust(profile, advice):
    # TODO: copy the profile, apply suggested cuts, never cut Housing,
    # and never let an expense become negative.
    pass


def months_to_goal(monthly_savings, goal, current=0):
    # TODO: return 0 if achieved, None if savings <= 0, otherwise use ceil.
    pass


# STEP 8
def advise(profile):
    # TODO: connect validate → analyze → infer → allocate → adjust → projection.
    pass


if __name__ == "__main__":
    check(len(RULES) == 9, "All nine rules exist.", "Add all nine rules.")
    check(validate({"monthly_income": 0}) != [],
          "Invalid input is rejected.", "Complete validate() first.")
    try:
        facts = analyze(SAMPLE)
        check(facts["total"] == 30000, "Sample total is correct.",
              "Sample expenses must total ₱30,000.")
    except (TypeError, KeyError):
        print("✗ Complete analyze() next.")

