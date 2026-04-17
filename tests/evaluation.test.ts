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

  it("returns an actual ideal answer for the topic, not a framework outline", () => {
    const result = evaluateHeuristically(
      "AI should be used in schools because students will need it in the future.",
      "PREP",
      "Should AI be a core part of school education?"
    );

    expect(result.ideal_answer).toContain("AI should be a core part of school education");
    expect(result.ideal_answer).not.toContain("PREP outline");
  });

  it("returns ethos pathos logos persuasion scores", () => {
    const result = evaluateHeuristically(
      "In my experience, students trust tools more when teachers explain the purpose. AI should be used carefully because it can help people compare ideas and improve writing. For example, students can use it for feedback while still explaining their own reasoning.",
      "PREP",
      "Should AI be a core part of school education?"
    );

    expect(result.persuasion_scores?.map((score) => score.key)).toEqual(["ethos", "pathos", "logos"]);
  });

  it("scores logic-heavy answers higher on logos", () => {
    const result = evaluateHeuristically(
      "AI should be part of education because students will use it in work. For example, it can improve feedback, compare ideas, and produce better outcomes as a result.",
      "PREP",
      "Should AI be a core part of school education?"
    );

    const logos = result.persuasion_scores?.find((score) => score.key === "logos");
    expect(logos?.score).toBeGreaterThanOrEqual(7);
  });

  it("scores experience-based answers higher on ethos", () => {
    const result = evaluateHeuristically(
      "In my experience, my role as a team lead taught me that responsible AI use requires balance. I was responsible for helping people use tools without losing ownership.",
      "PREP",
      "Should AI be a core part of school education?"
    );

    const ethos = result.persuasion_scores?.find((score) => score.key === "ethos");
    expect(ethos?.score).toBeGreaterThanOrEqual(7);
  });

  it("scores human-impact answers higher on pathos", () => {
    const result = evaluateHeuristically(
      "AI affects students, teachers, parents, and people who feel stress when learning is unclear. It should help build trust and confidence for the human side of education.",
      "PREP",
      "Should AI be a core part of school education?"
    );

    const pathos = result.persuasion_scores?.find((score) => score.key === "pathos");
    expect(pathos?.score).toBeGreaterThanOrEqual(7);
  });
});
