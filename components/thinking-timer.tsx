"use client";

import { useEffect, useState } from "react";

export function ThinkingTimer({
  seconds = 15,
  isActive = true,
  compact = false
}: {
  seconds?: number;
  isActive?: boolean;
  compact?: boolean;
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

  const timerContent = (
    <>
      <span className="eyebrow">Thinking time</span>
      <div className="big-number">{timeLeft}s</div>
      <p className="muted">
        {isActive ? "Prepare your first sentence." : "Timer starts after the prompt finishes."}
      </p>
    </>
  );

  if (compact) {
    return <div className="timer-compact">{timerContent}</div>;
  }

  return (
    <section className="glass-panel">
      {timerContent}
    </section>
  );
}
