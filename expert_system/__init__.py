"""Personal Budget Adviser: rule-based expert system.

Architecture:
    knowledge_base -> validation -> analysis -> rules -> inference
    -> allocation -> adjustment -> advisor (full pipeline)
"""

from .advisor import advise
from .charts import build_charts_png
from .knowledge_base import CATEGORIES, LIMITS, NEEDS, SAMPLE, TARGETS, WANTS
from .rules import RULE_INFO
from .self_tests import run_tests

__all__ = ["advise", "build_charts_png", "run_tests", "CATEGORIES", "LIMITS",
           "NEEDS", "RULE_INFO", "SAMPLE", "TARGETS", "WANTS"]
