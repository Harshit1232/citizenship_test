"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { IconSpeaker, IconStop } from "@/components/ui/icons";
import { cx } from "@/lib/cx";

const noop = () => () => {};

/**
 * Reads the question and its options aloud with the browser's built-in speech.
 * Some browsers use an online voice service for this (see the privacy page).
 * Hidden where unsupported.
 */
export function ListenButton({
  text,
  className,
  label = "Listen",
  compact,
}: {
  text: string;
  className?: string;
  /** Visible label when not speaking. */
  label?: string;
  /** Smaller, for use beside an explanation. */
  compact?: boolean;
}) {
  const supported = useSyncExternalStore(
    noop,
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    () => false,
  );
  const [speaking, setSpeaking] = useState(false);

  // Stop when the question changes or the screen goes away.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
      setSpeaking(false);
    };
  }, [text]);

  if (!supported) return null;

  function toggle() {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-AU";
    u.rate = 0.92;
    const voice = synth.getVoices().find((v) => v.lang === "en-AU") ?? synth.getVoices().find((v) => v.lang.startsWith("en"));
    if (voice) u.voice = voice;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(u);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      className={cx(
        "inline-flex items-center rounded-sm font-bold transition-colors",
        compact ? "min-h-8 gap-1.5 px-2 text-caption" : "min-h-11 gap-2 px-3 text-small",
        speaking ? "bg-euc-tint text-euc-deep" : "text-ink hover:bg-sunk",
        className,
      )}
    >
      {speaking ? <IconStop size={compact ? 15 : 18} /> : <IconSpeaker size={compact ? 15 : 18} />}
      <span>{speaking ? "Stop" : label}</span>
    </button>
  );
}
