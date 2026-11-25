// Sound effects, synthesized with the Web Audio API (no audio files).
// Everything checks the "sound" setting, so the mute toggle silences it all.

import * as settings from "./settings.js";

const MASTER = 0.12; // keep it gentle
let audio = null;

function context() {
  if (!audio) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audio = new Ctx();
  }
  if (audio.state === "suspended") audio.resume();
  return audio;
}

function tone(freq, start, length, { type = "square", vol = 1, to = null } = {}) {
  const ctx = context();
  if (!ctx) return;
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + length);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(MASTER * vol, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + length + 0.02);
}

const sound = (play) => () => {
  if (!settings.get("sound")) return;
  try { play(); } catch { /* audio blocked: stay silent */ }
};

export const click = sound(() => tone(660, 0, 0.05, { vol: 0.5 }));
export const pop = sound(() => tone(300, 0, 0.09, { type: "sine", to: 700, vol: 0.9 }));
export const open = sound(() => { tone(392, 0, 0.08, { type: "triangle" }); tone(587, 0.07, 0.12, { type: "triangle" }); });
export const close = sound(() => { tone(587, 0, 0.07, { type: "triangle" }); tone(392, 0.06, 0.1, { type: "triangle" }); });
export const coin = sound(() => { tone(988, 0, 0.07, { vol: 0.8 }); tone(1319, 0.07, 0.18, { vol: 0.8 }); });
export const error = sound(() => tone(180, 0, 0.16, { type: "sawtooth", to: 120, vol: 0.8 }));
export const win = sound(() => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.14, { vol: 0.8 })));
export const lose = sound(() => [392, 330, 262, 196].forEach((f, i) => tone(f, i * 0.12, 0.16, { type: "triangle" })));
