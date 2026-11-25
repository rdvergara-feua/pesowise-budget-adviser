"""Personal Budget Adviser: local web server.

Run:  python app.py
Then open http://127.0.0.1:8000  (it opens automatically)
"""

import math
import threading
import webbrowser
from pathlib import Path

from flask import Flask, Response, jsonify, request, send_from_directory

from expert_system import (CATEGORIES, LIMITS, NEEDS, RULE_INFO, SAMPLE, TARGETS,
                           WANTS, advise, build_charts_png, run_tests)

WEB_DIR = Path(__file__).parent / "web"
HOST, PORT = "127.0.0.1", 8000

app = Flask(__name__, static_folder=None)
app.json.sort_keys = False  # Keep expense categories in their original order.


def clean(value):
    """Make a report JSON-safe (math.inf / NaN become null)."""
    if isinstance(value, dict):
        return {key: clean(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [clean(item) for item in value]
    if isinstance(value, float) and not math.isfinite(value):
        return None
    return value


# --- Pages and static files (web/index.html, web/css, web/js) ----------------
@app.get("/")
def index():
    return send_from_directory(WEB_DIR, "index.html")


@app.get("/<path:filename>")
def assets(filename):
    return send_from_directory(WEB_DIR, filename)


# --- API ---------------------------------------------------------------------
@app.get("/api/config")
def config():
    """Knowledge-base values the page needs (single source of truth)."""
    return jsonify({
        "categories": CATEGORIES, "needs": NEEDS, "wants": WANTS,
        "limits": LIMITS, "targets": TARGETS, "rules": RULE_INFO,
        "sample": SAMPLE,
    })


@app.post("/api/advise")
def api_advise():
    profile = request.get_json(silent=True) or {}
    return jsonify(clean(advise(profile)))


@app.post("/api/charts")
def api_charts():
    report = advise(request.get_json(silent=True) or {})
    if not report["valid"]:
        return jsonify(clean(report)), 400
    return Response(build_charts_png(report), mimetype="image/png")


@app.get("/api/tests")
def api_tests():
    return jsonify(run_tests().to_dict(orient="records"))


if __name__ == "__main__":
    threading.Timer(1.0, lambda: webbrowser.open(f"http://{HOST}:{PORT}")).start()
    app.run(host=HOST, port=PORT)
