"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { Topic } from "@/lib/types";

export function TopicPromptCard({
  topic,
  animate = false,
  children,
  onAnimationComplete
}: {
  topic: Topic;
  animate?: boolean;
  children?: ReactNode;
  onAnimationComplete?: () => void;
}) {
  const words = useMemo(() => topic.title.split(" "), [topic.title]);
  const [activeWordIndex, setActiveWordIndex] = useState(animate ? -1 : words.length);
  const animationRunRef = useRef(0);
  const completionRef = useRef(false);

  useEffect(() => {
    if (!animate) {
      completionRef.current = true;
      setActiveWordIndex(words.length);
      return;
    }

    animationRunRef.current += 1;
    const currentRun = animationRunRef.current;
    completionRef.current = false;
    setActiveWordIndex(0);

    const interval = window.setInterval(() => {
      setActiveWordIndex((current) => {
        if (animationRunRef.current !== currentRun) {
          return current;
        }

        if (current >= words.length - 1) {
          window.clearInterval(interval);

          if (!completionRef.current) {
            completionRef.current = true;
            window.setTimeout(() => {
              if (animationRunRef.current === currentRun) {
                onAnimationComplete?.();
              }
            }, 650);
          }

          return words.length;
        }

        return current + 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [animate, onAnimationComplete, topic.id, words.length]);

  return (
    <section className="glass-panel prompt-focus-card">
      <span className="eyebrow">Your prompt</span>
      <h3 className="prompt-question">
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className={animate && activeWordIndex === index ? "prompt-word prompt-word-active" : "prompt-word"}
          >
            {word}
          </span>
        ))}
      </h3>
      <div className="pill-row">
        <span className="pill">{topic.category.replace("_", " ")}</span>
        <span className="pill">{topic.difficulty}</span>
      </div>
      {children ? <div className="prompt-card-footer">{children}</div> : null}
    </section>
  );
}
