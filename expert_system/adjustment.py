"""STEP 7: SAFE ADJUSTMENT AND GOAL TIMING"""

import copy
import math

from .knowledge_base import CATEGORIES


def adjust(profile, advice):
    new_profile = copy.deepcopy(profile)       # Preserve the original profile.
    reductions = {category: 0 for category in CATEGORIES}
    for item in advice:
        for category, amount in item["cuts"].items():
            if category != "Housing":         # Housing is never auto-cut.
                reductions[category] = max(reductions[category], amount)
    for category in CATEGORIES:
        reductions[category] = min(reductions[category], profile["expenses"][category])
        new_profile["expenses"][category] -= reductions[category]
    new_total = sum(new_profile["expenses"].values())
    return {"expenses": new_profile["expenses"], "reductions": reductions,
            "total": new_total, "savings": profile["monthly_income"] - new_total}


def months_to_goal(monthly_savings, goal, current=0):
    remaining = max(0, goal - current)
    if remaining == 0:
        return 0
    return None if monthly_savings <= 0 else math.ceil(remaining / monthly_savings)
