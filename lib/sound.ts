// The dial's ratchet: a soft tick for each day that passes under the lens and a deeper tock at
// each new month, synthesized with Web Audio (no sound files), plus a light buzz on phones that
// support it. Browsers only allow audio after the person has touched the page, so the first tick
// comes with a drag or a tap. The on/off choice is a per-device convenience in browser storage.

const KEY = "orbit-sound";
const listeners = new Set<() => void>();
let ctx: AudioContext | null = null;
let lastTick = 0;

export function soundOn() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {}
  listeners.forEach((l) => l());
}

export function subscribeSound(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function audio() {
  if (typeof window === "undefined" || !("AudioContext" in window)) return null;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function tick(kind: "day" | "month" = "day") {
  if (!soundOn()) return;
  const now = performance.now();
  // A fast spin passes many days a frame; keep it a ratchet, not a buzz.
  if (kind === "day" && now - lastTick < 32) return;
  lastTick = now;
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = kind === "month" ? "sine" : "triangle";
  osc.frequency.setValueAtTime(kind === "month" ? 520 : 1650, t);
  if (kind === "month") osc.frequency.exponentialRampToValueAtTime(380, t + 0.09);
  gain.gain.setValueAtTime(kind === "month" ? 0.12 : 0.04, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + (kind === "month" ? 0.12 : 0.035));
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.14);
  if (kind === "month") navigator.vibrate?.(6);
}
