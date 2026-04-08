import { EvaluationResult } from "@/lib/types";

export function FrameworkBreakdown({ result }: { result: EvaluationResult }) {
  return (
    <details className="glass-panel detail-panel">
      <summary className="detail-summary">
        <span className="eyebrow">See full breakdown</span>
        <span className="muted">Detailed structure scores</span>
      </summary>
      <div className="detail-body">
        <div className="big-number">{result.overall_score}/10</div>
        <p className="muted">This score combines your structure and how the answer sounded.</p>
        <div className="score-row">
          {result.structural_scores.map((score) => (
            <div key={score.key} className="score-card panel">
              <div className="score-header">
                <strong>{score.label}</strong>
                <span>{score.score}/10</span>
              </div>
              <div className="score-bar">
                <span style={{ width: `${score.score * 10}%` }} />
              </div>
              <p className="muted">{score.feedback}</p>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
