"use client";

import { startTransition, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => {
      continuous: boolean;
      interimResults: boolean;
      lang: string;
      onresult: ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start: () => void;
      stop: () => void;
    };
    SpeechRecognition?: Window["webkitSpeechRecognition"];
  }
}

export function RecordingPanel({
  transcript,
  setTranscript
}: {
  transcript: string;
  setTranscript: (value: string) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const recognitionRef = useRef<InstanceType<NonNullable<typeof window.webkitSpeechRecognition>> | null>(null);

  useEffect(() => {
    if (!isRecording) {
      setSecondsLeft(60);
      return;
    }

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          recognitionRef.current?.stop();
          setIsRecording(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRecording]);

  function toggleRecording() {
    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      startTransition(() => {
        setTranscript(
          transcript ||
            "Speech recognition is unavailable in this browser. Type your response here, then run evaluation."
        );
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const nextTranscript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ");

      startTransition(() => {
        setTranscript(nextTranscript.trim());
      });
    };
    recognition.onerror = () => {
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }

  return (
    <section className="glass-panel">
      <span className="eyebrow">Say your answer</span>
      <div className="score-footer">
        <strong>{isRecording ? "Listening now" : "Ready when you are"}</strong>
        <span className="pill">{secondsLeft}s</span>
      </div>
      <p className="muted">Use voice capture if your browser supports it, or type your answer below.</p>
      <button className={`button ${isRecording ? "button-secondary" : "button-primary"}`} onClick={toggleRecording}>
        {isRecording ? "Stop speaking" : "Start speaking"}
      </button>
    </section>
  );
}
