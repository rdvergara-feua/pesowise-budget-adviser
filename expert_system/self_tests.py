"""STEP 10: SIX TEST CASES + BOUNDARIES

Run from the project folder:  python -m expert_system.self_tests
The web app's System Tests app calls run_tests() too.
"""

import copy

import pandas as pd

from .advisor import advise
from .knowledge_base import SAMPLE


def run_tests():
    def changed(**values):
        result = copy.deepcopy(SAMPLE)
        result.update(values)
        return result

    zero_expenses = {"Housing": 10000, "Food": 7000, "Transportation": 5000,
        "Utilities": 4000, "Healthcare": 2000, "Entertainment": 3000,
        "Shopping": 2000, "Other expenses": 2000}
    healthy = changed(monthly_income=50000, savings_goal=30000, target_months=6,
        emergency_savings=120000, expenses={"Housing": 12000, "Food": 6000,
        "Transportation": 3000, "Utilities": 2500, "Healthcare": 1000,
        "Entertainment": 1500, "Shopping": 1000, "Other expenses": 1000})

    cases = [
        ("Normal", SAMPLE, lambda r: r["valid"] and any(a["rule"] == "Goal Gap" for a in r["advice"])),
        ("Overspending", changed(expenses={**SAMPLE["expenses"], "Shopping": 10000}), lambda r: any(a["rule"] == "Overspending" for a in r["advice"])),
        ("Healthy", healthy, lambda r: any(a["rule"] == "On Track" for a in r["advice"])),
        ("Zero surplus", changed(expenses=zero_expenses), lambda r: r["facts"]["surplus"] == 0 and not any(a["rule"] == "Overspending" for a in r["advice"])),
        ("Goal achieved", changed(savings_goal=5000, current_savings=5000), lambda r: r["before"] == 0),
        ("Invalid", changed(monthly_income=0, target_months=0), lambda r: not r["valid"]),
    ]
    rows = []
    for name, profile, expected in cases:
        result = advise(profile)
        rows.append({"Test": name, "Status": "PASS ✓" if expected(result) else "FAIL ✗"})

    # Required exact-boundary checks.
    exact = changed(monthly_income=40000, expenses={**SAMPLE["expenses"], "Food": 6000})
    above = changed(monthly_income=40000, expenses={**SAMPLE["expenses"], "Food": 6000.01})
    boundaries_ok = (not any(a["rule"] == "Food Limit" for a in advise(exact)["advice"]) and
                     any(a["rule"] == "Food Limit" for a in advise(above)["advice"]))
    rows.append({"Test": "Category boundaries", "Status": "PASS ✓" if boundaries_ok else "FAIL ✗"})
    return pd.DataFrame(rows)


if __name__ == "__main__":
    print("\n", run_tests().to_string(index=False))
