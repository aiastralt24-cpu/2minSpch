import { EvaluationResult } from "@/lib/types";

function summaryLine(score: number) {
  if (score >= 8) {
    return "Strong structure. Now make it sharper.";
  }

  if (score >= 6) {
    return "Good base. Add the missing structure.";
  }

  return "Needs structure first.";
}

export function MainTakeawayCard({ result }: { result: EvaluationResult }) {
  const weakestStructuralScore = [...result.structural_scores].sort((a, b) => a.score - b.score)[0];
  const biggestWeakness = weakestStructuralScore?.label ?? result.missing_components[0] ?? "structure";
  const nextAction =
    result.improvement_tips[0] ?? `Focus on your ${biggestWeakness.toLowerCase()} section in the next attempt.`;

  return (
    <section className="glass-panel sharp-feedback-card">
      <span className="eyebrow">Coach note</span>
      <div className="score-header">
        <h3>{summaryLine(result.overall_score)}</h3>
        <span className="feedback-score">{result.overall_score}/10</span>
      </div>
      <p className="sharp-line">
        <strong>Fix first:</strong> {biggestWeakness}.
      </p>
      <p className="muted">{nextAction}</p>
    </section>
  );
}
