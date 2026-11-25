// Tiny helpers shared by every app. Text always goes in with textContent,
// never innerHTML, so typed input can't inject markup.

export function el(tag, props = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (value !== false && value != null) node.setAttribute(key, value === true ? "" : value);
  }
  node.append(...kids.flat().filter((kid) => kid != null && kid !== false));
  return node;
}

// localStorage can throw (private window, blocked site data), so never trust it.
export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: the app still works for this session */
  }
}

// Parse "35,000" -> 35000. Returns null for blank / non-numeric input.
export function toNumber(text) {
  const clean = String(text).trim().replaceAll(",", "");
  if (clean === "") return null;
  const value = Number(clean);
  return Number.isFinite(value) ? value : null;
}
