import { EvaluationResult } from "@/lib/types";

const FRIENDLY_LABELS: Record<string, string> = {
  clarity: "Easy to follow",
  confidence: "Confident",
  pacing: "Good pace",
  filler_words: "Too many filler words"
};

export function CommunicationScoreCard({ result }: { result: EvaluationResult }) {
  return (
    <section className="glass-panel">
      <span className="eyebrow">How it sounded</span>
      <div className="score-row">
        {result.communication_scores.map((score) => (
          <div key={score.key} className="score-card panel">
            <div className="score-header">
              <strong>{FRIENDLY_LABELS[score.key] ?? score.label}</strong>
              <span>{score.score}/10</span>
            </div>
            <div className="score-bar">
              <span style={{ width: `${score.score * 10}%` }} />
            </div>
            <p className="muted">{score.feedback}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
