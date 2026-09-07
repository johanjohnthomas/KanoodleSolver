"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SoundCue = "pickup" | "rotate" | "flip" | "place" | "invalid" | "solve" | "error";

type Tone = Readonly<{
  frequency: number;
  endFrequency: number;
  duration: number;
  gain: number;
  wave: OscillatorType;
}>;

const cueTones: Record<Exclude<SoundCue, "solve">, Tone> = {
  pickup: { frequency: 310, endFrequency: 460, duration: 0.07, gain: 0.045, wave: "sine" },
  rotate: { frequency: 520, endFrequency: 610, duration: 0.055, gain: 0.035, wave: "triangle" },
  flip: { frequency: 440, endFrequency: 330, duration: 0.075, gain: 0.04, wave: "triangle" },
  place: { frequency: 220, endFrequency: 180, duration: 0.09, gain: 0.055, wave: "sine" },
  invalid: { frequency: 155, endFrequency: 112, duration: 0.12, gain: 0.05, wave: "square" },
  error: { frequency: 130, endFrequency: 92, duration: 0.17, gain: 0.045, wave: "sawtooth" },
};

const emitTone = (context: AudioContext, tone: Tone, delay = 0): void => {
  const startedAt = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = tone.wave;
  oscillator.frequency.setValueAtTime(tone.frequency, startedAt);
  oscillator.frequency.exponentialRampToValueAtTime(tone.endFrequency, startedAt + tone.duration);
  gain.gain.setValueAtTime(0.0001, startedAt);
  gain.gain.exponentialRampToValueAtTime(tone.gain, startedAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + tone.duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startedAt);
  oscillator.stop(startedAt + tone.duration + 0.02);
};

const emitCue = (context: AudioContext, cue: SoundCue): void => {
  if (cue !== "solve") {
    emitTone(context, cueTones[cue]);
    return;
  }
  emitTone(context, { ...cueTones.place, frequency: 262, endFrequency: 330, duration: 0.16 }, 0);
  emitTone(context, { ...cueTones.place, frequency: 330, endFrequency: 392, duration: 0.18 }, 0.055);
  emitTone(context, { ...cueTones.place, frequency: 392, endFrequency: 523, duration: 0.2 }, 0.11);
};

export function useSoundEffects() {
  const [enabled, setEnabled] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      setEnabled(window.localStorage.getItem("kanoodle-sound") === "on");
    } catch (error) {
      if (!(error instanceof DOMException)) throw error;
      setEnabled(false);
    }
  }, []);

  const getContext = useCallback((): AudioContext => {
    const current = contextRef.current;
    if (current !== null && current.state !== "closed") return current;
    const created = new AudioContext();
    contextRef.current = created;
    return created;
  }, []);

  const play = useCallback((cue: SoundCue): void => {
    if (!enabled) return;
    const context = getContext();
    if (context.state === "suspended") {
      context.resume().then(
        () => emitCue(context, cue),
        () => setEnabled(false),
      );
      return;
    }
    emitCue(context, cue);
  }, [enabled, getContext]);

  const toggle = useCallback((): void => {
    const next = !enabled;
    setEnabled(next);
    try {
      window.localStorage.setItem("kanoodle-sound", next ? "on" : "off");
    } catch (error) {
      if (!(error instanceof DOMException)) throw error;
    }
    if (next) {
      const context = getContext();
      context.resume().then(
        () => emitCue(context, "pickup"),
        () => setEnabled(false),
      );
    }
  }, [enabled, getContext]);

  return { enabled, play, toggle };
}
