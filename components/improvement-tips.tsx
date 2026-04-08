import { EvaluationResult } from "@/lib/types";

export function ImprovementTips({ result }: { result: EvaluationResult }) {
  return (
    <section className="glass-panel">
      <span className="eyebrow">What to improve next</span>
      <div className="stack">
        {result.improvement_tips.map((tip) => (
          <div key={tip} className="practice-card panel">
            <p>{tip}</p>
          </div>
        ))}
        {result.missing_components.length > 0 ? (
          <p className="muted">Focus first on: {result.missing_components.join(", ")}</p>
        ) : (
          <p className="muted">Your structure is holding up well. Next step: make the answer sound tighter and more confident.</p>
        )}
      </div>
    </section>
  );
}
