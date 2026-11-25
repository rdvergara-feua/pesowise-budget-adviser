"""STEP 9: VISUALIZATION
Draws the three comparison charts with matplotlib and returns PNG bytes,
so the web page can show them as an image.
"""

import io

import matplotlib
matplotlib.use("Agg")  # Render to memory; no desktop window needed.
import matplotlib.pyplot as plt

from .knowledge_base import CATEGORIES, TARGETS


def build_charts_png(report):
    colors = ["#f49ac2", "#b9b4ef", "#a9cef4"]
    fig, axes = plt.subplots(1, 3, figsize=(13, 4.5))
    fig.patch.set_facecolor("#fff4fa")

    x = range(len(CATEGORIES))
    axes[0].bar([i - .2 for i in x], report["profile"]["expenses"].values(), .4,
                label="Current", color=colors[0])
    axes[0].bar([i + .2 for i in x], report["new_budget"]["expenses"].values(), .4,
                label="Adjusted", color=colors[1])
    axes[0].set_xticks(list(x), [c.replace("Transportation", "Transport").replace("Other expenses", "Other") for c in CATEGORIES], rotation=45, ha="right")
    axes[0].set_title("Current vs Adjusted")
    axes[0].legend()

    names = ["Needs", "Wants", "Savings"]
    actual, target = report["allocation"]["actual"], TARGETS
    axes[1].bar([i - .2 for i in range(3)], [actual[n] * 100 for n in names], .4, color=colors[2], label="Actual")
    axes[1].bar([i + .2 for i in range(3)], [target[n] * 100 for n in names], .4, color=colors[0], label="Target")
    axes[1].set_xticks(range(3), names)
    axes[1].set_ylabel("Percent of income")
    axes[1].set_title("Actual vs 50/30/20")
    axes[1].legend()

    axes[2].bar(["Before", "After"], [report["facts"]["surplus"], report["new_budget"]["savings"]], color=[colors[1], colors[0]])
    axes[2].set_title("Monthly Savings")
    axes[2].set_ylabel("Philippine peso")
    fig.suptitle("PesoWise • Financial Comparison", fontweight="bold")
    fig.tight_layout()

    buffer = io.BytesIO()
    fig.savefig(buffer, format="png", dpi=100, facecolor=fig.get_facecolor())
    plt.close(fig)  # Free memory; the server stays running.
    return buffer.getvalue()
