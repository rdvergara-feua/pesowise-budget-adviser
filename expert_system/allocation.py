"""STEP 6: 50/30/20 ALLOCATION"""

from .knowledge_base import TARGETS


def allocate(facts):
    actual = {
        "Needs": facts["needs"] / facts["income"],
        "Wants": facts["wants"] / facts["income"],
        "Savings": facts["surplus"] / facts["income"],
    }
    return {"actual": actual, "target": TARGETS,
            "difference": {name: actual[name] - TARGETS[name] for name in TARGETS}}
