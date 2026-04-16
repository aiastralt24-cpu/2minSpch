import { EvaluationResult } from "@/lib/types";

export function IdealAnswerPanel({ result }: { result: EvaluationResult }) {
  return (
    <section className="glass-panel ideal-answer-card">
      <span className="eyebrow">10/10 answer</span>
      <h3>Say it like this</h3>
      <p>{result.ideal_answer}</p>
    </section>
  );
}
