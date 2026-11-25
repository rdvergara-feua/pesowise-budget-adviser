# Personal Budget Adviser

**Expert System Using Rule-Based Reasoning for Decision Support**

**PesoWise** is a pixel-style "home screen" that runs locally in your browser. Each
budget tool is an app icon that opens in its own draggable window. The expert
system stays in Python; the interface is plain HTML, CSS and JavaScript.

| App | What it does |
|---|---|
| PesoWise Adviser | The chat + IF-THEN expert system (the original Budget Buddy window) |
| Expense Tracker | Log spending, compare each category to its limit (saved in the browser) |
| Savings Goals | How much to save per month, or how long a monthly amount takes |
| Calculator | Everyday calculator with keyboard support |
| Rules & Limits | Read-only view of the knowledge base: limits, 50/30/20, the nine rules |
| System Tests | Runs the Python self-tests and shows pass/fail |

## Project structure

```text
personal_budget_adviser/
├── app.py                    Local web server (Flask) + API routes
├── requirements.txt          Python libraries
├── README.md
│
├── expert_system/            All the reasoning (Python)
│   ├── knowledge_base.py     Step 2   Categories, limits, 50/30/20, sample profile
│   ├── validation.py         Step 3   Rejects invalid profiles
│   ├── analysis.py           Step 3   Raw input -> facts
│   ├── rules.py              Step 4   The nine IF-THEN rules (RULES list)
│   ├── inference.py          Step 5   Runs every rule, sorts by priority
│   ├── allocation.py         Step 6   50/30/20 comparison
│   ├── adjustment.py         Step 7   Safe budget adjustment + goal timing
│   ├── advisor.py            Step 8   Full pipeline: advise(profile)
│   ├── charts.py             Step 9   Matplotlib charts -> PNG
│   └── self_tests.py         Step 10  Six test cases + boundary checks
│
├── web/                      The interface
│   ├── index.html            Home screen: icons, taskbar, popup
│   ├── css/style.css         All colors, fonts, borders (pixel theme)
│   └── js/
│       ├── desktop.js        Icons, windows (drag/minimize/close), taskbar
│       ├── dom.js            Small helpers: el(), storage, number parsing
│       ├── api.js            Calls to the Python server
│       ├── chat-ui.js        Chat bubbles, buttons, popup
│       ├── questions.js      The question list
│       ├── report.js         Turns results into chat bubbles
│       ├── format.js         Peso / percent / month formatting
│       └── apps/             One file per app
│           ├── index.js      The list of apps (icon order)
│           ├── adviser.js    calculator.js   tracker.js
│           └── goals.js      rules.js        tests.js
│
└── guided/
    └── guided.py             Short TODO learning version
```

## Run it

Open this folder in VS Code (or any terminal), then:

```bash
python -m pip install -r requirements.txt
python app.py
```

Your browser opens at <http://127.0.0.1:8000>. Press `Ctrl+C` in the terminal to
stop the server. Opening `index.html` directly from the folder will not work
because the page needs the Python server for its calculations.

Run the built-in tests from the terminal with:

```bash
python -m expert_system.self_tests
```

## How it works

1. In the Adviser window, the page asks questions in a chat and sends the finished profile to
   `POST /api/advise`.
2. `advisor.advise()` runs the pipeline: validate -> analyze -> infer ->
   allocate -> adjust -> goal projection.
3. The page renders every triggered rule with its priority, IF explanation,
   THEN action and suggested reduction.

| Endpoint | Purpose |
|---|---|
| `GET /api/config` | Categories, limits, targets, rule list and sample profile from the knowledge base |
| `POST /api/advise` | Full report as JSON |
| `POST /api/charts` | The three comparison charts as a PNG |
| `GET /api/tests` | Results of the self-tests |

## Why it is still an expert system

1. **User input** — the chat collects income, expenses and savings data.
2. **Knowledge base** — `knowledge_base.py` and the rule functions.
3. **Inference engine** — `infer()` executes all nine rules, ignores rules that
   do not trigger, and sorts conclusions by priority.
4. **Explanation output** — each recommendation shows its rule, priority, IF
   reason, THEN action and suggested reduction.
5. **Decision support** — spending changes are simulated safely and goal
   timing is compared before and after.

It is not machine learning: every conclusion comes from readable rules.

## Nine rules

| Rule | Condition | Priority |
|---|---|---|
| Overspending | Expenses exceed income | High |
| Goal Gap | Surplus is below required savings | High |
| Low Savings | Savings rate is below 20% | Medium |
| Housing Limit | Housing is above its limit | Medium |
| Food Limit | Food is above its limit | Medium |
| Transport Limit | Transportation is above its limit | Medium |
| Entertainment Limit | Entertainment is above its limit | Medium |
| Emergency Fund | Coverage is below three months | Low |
| On Track | Goal schedule and 20% target are met | Informational |

Housing can be flagged but is never reduced automatically. Exactly meeting a
limit does not trigger a category rule. Invalid profiles are rejected before the
inference engine runs, and adjustments cannot produce negative expenses.

## Where to make future changes

| I want to... | Edit |
|---|---|
| Change a spending limit or the sample | `expert_system/knowledge_base.py` |
| Add or change a rule | `expert_system/rules.py` (add to `RULES`) |
| Add a question or category | `knowledge_base.py` (the chat picks it up) |
| Change colors, fonts, spacing | `web/css/style.css` |
| Change how results are worded | `web/js/report.js` |
| Add a new API route | `app.py` |
| Add a new app to the home screen | New file in `web/js/apps/`, then list it in `apps/index.js` |
| Rename the project / an app | `title` in `index.html`, and each app's `title` / `icon` in its file |
