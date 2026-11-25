"""STEP 3a: VALIDATION
Invalid profiles are rejected before the inference engine ever runs.
"""

from .knowledge_base import CATEGORIES


def validate(profile):
    """Return a list of errors; an empty list means the profile is valid."""
    errors = []
    numbers = ["monthly_income", "savings_goal", "target_months",
               "current_savings", "emergency_savings"]
    for field in numbers:
        if not isinstance(profile.get(field), (int, float)):
            errors.append(f"{field.replace('_', ' ').title()} must be numeric.")
    if isinstance(profile.get("monthly_income"), (int, float)) and profile["monthly_income"] <= 0:
        errors.append("Monthly income must be greater than zero.")
    if isinstance(profile.get("target_months"), (int, float)) and profile["target_months"] <= 0:
        errors.append("Target months must be greater than zero.")
    for field in ["savings_goal", "current_savings", "emergency_savings"]:
        if isinstance(profile.get(field), (int, float)) and profile[field] < 0:
            errors.append(f"{field.replace('_', ' ').title()} cannot be negative.")
    if not isinstance(profile.get("expenses"), dict):
        return errors + ["Expenses must be a dictionary."]
    for category in CATEGORIES:
        value = profile["expenses"].get(category)
        if not isinstance(value, (int, float)):
            errors.append(f"{category} must be numeric.")
        elif value < 0:
            errors.append(f"{category} cannot be negative.")
    return errors
