"""STEP 5: INFERENCE ENGINE"""

from .knowledge_base import PRIORITY
from .rules import RULES


def infer(facts):
    """Execute every rule, keep triggered rules, then sort by priority."""
    results = [answer for rule in RULES if (answer := rule(facts))]
    return sorted(results, key=lambda answer: PRIORITY[answer["priority"]])
