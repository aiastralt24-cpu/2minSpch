import { describe, expect, it } from "vitest";

import { selectTopic } from "@/lib/topics";

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
});
