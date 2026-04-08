import { EvaluationResult } from "@/lib/types";

function summaryLine(score: number) {
  if (score >= 8) {
    return "Strong answer overall. The structure mostly held together.";
  }

  if (score >= 6) {
    return "Good base. A little more structure will make this answer land better.";
  }

  return "The answer needs clearer structure, but the next improvement is straightforward.";
}

export function MainTakeawayCard({ result }: { result: EvaluationResult }) {
  const weakestStructuralScore = [...result.structural_scores].sort((a, b) => a.score - b.score)[0];
  const biggestWeakness = weakestStructuralScore?.label ?? result.missing_components[0] ?? "Structure";
  const nextAction =
    result.improvement_tips[0] ?? `Focus on your ${biggestWeakness.toLowerCase()} section in the next attempt.`;

  return (
    <section className="glass-panel">
      <span className="eyebrow">Main takeaway</span>
      <div className="stack">
        <div className="practice-card panel">
          <strong>{summaryLine(result.overall_score)}</strong>
          <p className="muted">Overall score: {result.overall_score}/10</p>
        </div>
        <div className="practice-card panel">
          <strong>Biggest gap</strong>
          <p className="muted">{biggestWeakness}</p>
        </div>
        <div className="practice-card panel">
          <strong>What to do next</strong>
          <p className="muted">{nextAction}</p>
        </div>
      </div>
    </section>
  );
}
