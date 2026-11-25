// The list of apps on the home screen, in icon order.
// To add an app: create js/apps/yourapp.js (copy a small one such as goals.js)
// and add it here.

import adviser from "./adviser.js";
import calculator from "./calculator.js";
import goals from "./goals.js";
import rules from "./rules.js";
import tests from "./tests.js";
import tracker from "./tracker.js";

export const APPS = [adviser, tracker, goals, calculator, rules, tests];
