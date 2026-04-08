"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Topic } from "@/lib/types";

export function TopicPromptCard({
  topic,
  animate = false,
  onAnimationComplete
}: {
  topic: Topic;
  animate?: boolean;
  onAnimationComplete?: () => void;
}) {
  const words = useMemo(() => topic.title.split(" "), [topic.title]);
  const [visibleWords, setVisibleWords] = useState(animate ? 0 : words.length);
  const animationRunRef = useRef(0);
  const completionRef = useRef(false);

  useEffect(() => {
    if (!animate) {
      completionRef.current = true;
      setVisibleWords(words.length);
      return;
    }

    animationRunRef.current += 1;
    const currentRun = animationRunRef.current;
    completionRef.current = false;
    setVisibleWords(0);

    const interval = window.setInterval(() => {
      setVisibleWords((current) => {
        if (animationRunRef.current !== currentRun) {
          return current;
        }

        if (current >= words.length) {
          window.clearInterval(interval);
          return current;
        }

        const next = current + 1;
        if (next >= words.length) {
          window.clearInterval(interval);

          if (!completionRef.current) {
            completionRef.current = true;
            window.setTimeout(() => {
              if (animationRunRef.current === currentRun) {
                onAnimationComplete?.();
              }
            }, 320);
          }
        }
        return next;
      });
    }, 280);

    return () => {
      window.clearInterval(interval);
    };
  }, [animate, onAnimationComplete, topic.id, words.length]);

  const renderedText = animate ? words.slice(0, visibleWords).join(" ") : topic.title;

  return (
    <section className="glass-panel">
      <span className="eyebrow">Your prompt</span>
      <h3 className={animate && visibleWords < words.length ? "typewriter-line" : undefined}>
        {renderedText}
        {animate && visibleWords < words.length ? <span className="typewriter-caret" aria-hidden="true" /> : null}
      </h3>
      <div className="pill-row">
        <span className="pill">{topic.category.replace("_", " ")}</span>
        <span className="pill">{topic.difficulty}</span>
      </div>
      <p className="muted">Take a breath, decide your opening line, then move through the structure one part at a time.</p>
    </section>
  );
}
