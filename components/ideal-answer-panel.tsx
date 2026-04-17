import { EvaluationResult } from "@/lib/types";

function classifySentence(sentence: string) {
  const lower = sentence.toLowerCase();

  if (
    lower.includes("in my experience") ||
    lower.includes("my role") ||
    lower.includes("responsible") ||
    lower.includes("i learned") ||
    lower.includes("balanced") ||
    lower.includes("responsibly")
  ) {
    return "ethos";
  }

  if (
    lower.includes("people") ||
    lower.includes("students") ||
    lower.includes("team") ||
    lower.includes("customer") ||
    lower.includes("stress") ||
    lower.includes("trust") ||
    lower.includes("human")
  ) {
    return "pathos";
  }

  if (
    lower.includes("because") ||
    lower.includes("for example") ||
    lower.includes("as a result") ||
    lower.includes("that is why") ||
    lower.includes("so overall") ||
    lower.includes("reason")
  ) {
    return "logos";
  }

  return null;
}

function splitSentences(answer: string) {
  return answer.match(/[^.!?]+[.!?]+/g) ?? [answer];
}

export function IdealAnswerPanel({ result }: { result: EvaluationResult }) {
  const sentences = splitSentences(result.ideal_answer);
  const hasPersuasionScores = Boolean(result.persuasion_scores?.length);

  return (
    <section className="glass-panel ideal-answer-card">
      <span className="eyebrow">10/10 answer</span>
      <h3>Say it like this</h3>
      {hasPersuasionScores ? (
        <div className="answer-legend">
          <span className="answer-legend-ethos">Ethos</span>
          <span className="answer-legend-pathos">Pathos</span>
          <span className="answer-legend-logos">Logos</span>
        </div>
      ) : null}
      <p>
        {sentences.map((sentence, index) => {
          const classification = hasPersuasionScores ? classifySentence(sentence) : null;
          return (
            <span
              className={classification ? `answer-highlight answer-highlight-${classification}` : undefined}
              key={`${sentence}-${index}`}
            >
              {sentence.trim()}{" "}
            </span>
          );
        })}
      </p>
    </section>
  );
}
