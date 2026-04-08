import { EvaluationResult } from "@/lib/types";

export function IdealAnswerPanel({ result }: { result: EvaluationResult }) {
  return (
    <section className="glass-panel">
      <span className="eyebrow">A stronger version</span>
      <p className="muted">{result.ideal_answer}</p>
    </section>
  );
}
