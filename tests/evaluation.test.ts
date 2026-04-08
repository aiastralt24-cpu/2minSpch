import { describe, expect, it } from "vitest";

import { evaluateHeuristically } from "@/lib/evaluation/heuristic-evaluator";

describe("heuristic evaluation", () => {
  it("flags missing CARE example sections", () => {
    const result = evaluateHeuristically(
      "Time management is important because it helps people stay organized and reduce stress in daily life.",
      "CARE"
    );

    const example = result.structural_scores.find((score) => score.key === "example");
    expect(example?.score).toBeLessThanOrEqual(5);
    expect(result.missing_components).toContain("Example");
  });

  it("penalizes weak PREP restatement", () => {
    const result = evaluateHeuristically(
      "I think remote work is better because it gives people flexibility. For example, parents can manage family schedules more easily.",
      "PREP"
    );

    const repoint = result.structural_scores.find((score) => score.key === "point_close");
    expect(repoint?.score).toBeLessThanOrEqual(5);
  });

  it("rewards strong STAR action and result signals", () => {
    const result = evaluateHeuristically(
      "When I was leading a delayed launch, my role was to coordinate the team. I created a new check-in rhythm, spoke with every owner, and handled blockers directly. As a result, we improved delivery speed by 20%.",
      "STAR"
    );

    const action = result.structural_scores.find((score) => score.key === "action");
    const resultScore = result.structural_scores.find((score) => score.key === "result");
    expect(action?.score).toBeGreaterThanOrEqual(7);
    expect(resultScore?.score).toBeGreaterThanOrEqual(7);
  });
});
