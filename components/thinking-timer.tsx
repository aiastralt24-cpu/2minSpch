"use client";

import { useEffect, useState } from "react";

export function ThinkingTimer({
  seconds = 15,
  isActive = true
}: {
  seconds?: number;
  isActive?: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isActive]);

  return (
    <section className="glass-panel">
      <span className="eyebrow">Thinking time</span>
      <div className="big-number">{timeLeft}s</div>
      <p className="muted">
        {isActive
          ? "Sketch your structure now. Your first sentence should sound calm and clear."
          : "Listen to the full prompt first. The timer will begin as soon as it finishes."}
      </p>
    </section>
  );
}
