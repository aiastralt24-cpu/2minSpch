import { EvaluationResult, PersuasionScore } from "@/lib/types";

function nextAction(score: PersuasionScore) {
  if (score.key === "ethos") {
    return "Add a credibility signal: experience, ownership, or a balanced caveat.";
  }

  if (score.key === "pathos") {
    return "Add human impact: who is affected and why it matters to them.";
  }

  return "Add clearer proof: cause-effect logic, evidence, or a concrete example.";
}

export function PersuasionCheckCard({ result }: { result: EvaluationResult }) {
  const scores = result.persuasion_scores;
  if (!scores?.length) {
    return null;
  }

  const weakest = [...scores].sort((a, b) => a.score - b.score)[0];

  return (
    <section className="glass-panel persuasion-card">
      <span className="eyebrow">Persuasion check</span>
      <div className="stack">
        {scores.map((score) => (
          <div className="persuasion-row" key={score.key}>
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
      {weakest ? (
        <p className="sharp-line">
          <strong>Fix this first:</strong> {nextAction(weakest)}
        </p>
      ) : null}
    </section>
  );
}
