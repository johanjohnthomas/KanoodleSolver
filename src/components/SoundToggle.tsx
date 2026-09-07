"use client";

import { SpeakerHighIcon, SpeakerSlashIcon } from "@phosphor-icons/react";
import { m, useReducedMotion } from "motion/react";

type SoundToggleProps = Readonly<{
  enabled: boolean;
  onToggle: () => void;
}>;

export function SoundToggle({ enabled, onToggle }: SoundToggleProps) {
  const reduceMotion = useReducedMotion();
  return (
    <m.button
      type="button"
      className="sound-toggle"
      aria-pressed={enabled}
      aria-label={enabled ? "Mute interaction sounds" : "Enable interaction sounds"}
      onClick={onToggle}
      whileTap={reduceMotion ? undefined : { scale: 0.94 }}
    >
      {enabled ? <SpeakerHighIcon aria-hidden="true" /> : <SpeakerSlashIcon aria-hidden="true" />}
      <span>Sound {enabled ? "on" : "off"}</span>
    </m.button>
  );
}
