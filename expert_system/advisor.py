"""STEP 8: COMPLETE DECISION-SUPPORT PIPELINE
validate -> analyze -> infer -> allocate -> adjust -> projection
"""

from .adjustment import adjust, months_to_goal
from .allocation import allocate
from .analysis import analyze
from .inference import infer
from .validation import validate


def advise(profile):
    errors = validate(profile)
    if errors:
        return {"valid": False, "errors": errors}
    facts = analyze(profile)
    advice = infer(facts)
    new_budget = adjust(profile, advice)
    before = months_to_goal(facts["surplus"], profile["savings_goal"], profile["current_savings"])
    after = months_to_goal(new_budget["savings"], profile["savings_goal"], profile["current_savings"])
    return {"valid": True, "profile": profile, "facts": facts,
            "advice": advice, "allocation": allocate(facts),
            "new_budget": new_budget, "before": before, "after": after}
