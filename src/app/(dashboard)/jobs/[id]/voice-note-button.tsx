"use client";

import { useState, useCallback } from "react";

interface SpeechRecognitionResultEvent {
  results: Iterable<{ 0: { transcript: string }; length: number }>;
}
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onend: () => void;
  onresult: (e: SpeechRecognitionResultEvent) => void;
  onerror: () => void;
  start: () => void;
}

type Props = {
  onTranscript: (text: string) => void;
  disabled?: boolean;
};

export function VoiceNoteButton({ onTranscript, disabled }: Props) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState<boolean | null>(null);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const w = window as Window & {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    setSupported(true);
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-GB";
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e: SpeechRecognitionResultEvent) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ")
        .trim();
      if (transcript) onTranscript(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.start();
  }, [onTranscript]);

  if (supported === false) {
    return (
      <p className="text-xs text-stone-500">
        Voice input not supported in this browser. Try Chrome or Edge.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={startListening}
      disabled={disabled || listening}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 active:bg-stone-100 disabled:opacity-60"
    >
      <span className="text-lg" aria-hidden>
        {listening ? "🔴" : "🎤"}
      </span>
      {listening ? "Listening…" : "Add voice note"}
    </button>
  );
}
