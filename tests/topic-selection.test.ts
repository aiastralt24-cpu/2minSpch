import { describe, expect, it } from "vitest";

import { selectTopic, TOPIC_BANK } from "@/lib/topics";

describe("topic selection", () => {
  it("maps auto general thinking prompts to CARE", () => {
    const topic = selectTopic({ mode: "general", difficulty: "easy" });
    expect(topic.framework).toBe("CARE");
  });

  it("maps opinion prompts to PREP", () => {
    const topic = selectTopic({ mode: "opinion", difficulty: "medium" });
    expect(topic.framework).toBe("PREP");
  });

  it("respects manual framework override", () => {
    const topic = selectTopic({
      mode: "manual_framework",
      frameworkOverride: "STAR",
      difficulty: "medium"
    });
    expect(topic.framework).toBe("STAR");
  });

  it("has a large topic bank across frameworks and difficulty levels", () => {
    expect(TOPIC_BANK.length).toBeGreaterThan(2000);
    expect(TOPIC_BANK.some((topic) => topic.title.includes("Imagine you are answering"))).toBe(false);
  });
});
