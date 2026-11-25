// Text-to-speech for the Adviser, using the browser's built-in voices
// (Web Speech API). Nothing is sent to the server and no library is needed.

export const supported =
  "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

// Make a chat bubble sound natural: "₱5,500.00" -> "5,500 pesos", drop the
// decorative symbols, read "[HIGH]" as "High priority".
export function toSpeech(text) {
  return text
    .replace(/₱(-?)([\d,]+(?:\.\d+)?)/g, (_, minus, n) =>
      `${minus ? "minus " : ""}${n.replace(/\.00$/, "")} pesos`)
    .replace(/\/month/g, " per month")
    .replace(/\[(\w+)\]/g, (_, level) => `${level.toLowerCase()} priority.`)
    .replace(/→/g, " to ")
    .replace(/[•]/g, ", ")
    .replace(/[♡♥✦★☺✓✗]/g, "")
    .replace(/([.!?:])\s*\n+\s*/g, "$1 ") // line already ends a sentence
    .replace(/\s*\n+\s*/g, ". ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function speak(text) {
  if (!supported) return;
  const spoken = toSpeech(text);
  if (spoken) window.speechSynthesis.speak(new SpeechSynthesisUtterance(spoken));
}

export function stopSpeaking() {
  if (supported) window.speechSynthesis.cancel();
}
