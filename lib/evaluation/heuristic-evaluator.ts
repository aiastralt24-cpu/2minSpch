import { FRAMEWORK_DEFINITIONS } from "@/lib/frameworks";
import {
  CommunicationScore,
  EvaluationResult,
  FrameworkKey,
  StructuralScore
} from "@/lib/types";
import { average, clampScore, containsAny, excerpt, sentenceCount } from "@/lib/utils";

const FILLER_WORDS = ["um", "uh", "like", "you know", "basically", "actually"];

function buildCommunicationScores(transcript: string): CommunicationScore[] {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const fillers = FILLER_WORDS.filter((word) => transcript.toLowerCase().includes(word)).length;
  const sentences = Math.max(sentenceCount(transcript), 1);
  const averageWordsPerSentence = words.length / sentences;

  const clarity = clampScore(6 + Math.min(sentences, 4) - (averageWordsPerSentence > 24 ? 2 : 0));
  const confidence = clampScore(6 + (containsAny(transcript, ["i believe", "i think", "my view"]) ? 1 : 0));
  const pacing = clampScore(7 - (averageWordsPerSentence > 26 ? 2 : 0) + (averageWordsPerSentence < 8 ? -1 : 0));
  const fillerWords = clampScore(9 - fillers * 2);

  return [
    {
      key: "clarity",
      label: "Clarity",
      score: clarity,
      feedback: clarity >= 7 ? "Clear overall flow." : "Tighten the structure so the main idea lands faster."
    },
    {
      key: "confidence",
      label: "Confidence",
      score: confidence,
      feedback: confidence >= 7 ? "Your stance comes through with conviction." : "State your answer more directly up front."
    },
    {
      key: "pacing",
      label: "Pacing",
      score: pacing,
      feedback: pacing >= 7 ? "Comfortable rhythm." : "Use shorter sentences and clearer pauses between ideas."
    },
    {
      key: "filler_words",
      label: "Filler Words",
      score: fillerWords,
      feedback: fillerWords >= 7 ? "Few distracting fillers." : "Cut filler words to sound more polished."
    }
  ];
}

function careScores(transcript: string): StructuralScore[] {
  const lower = transcript.toLowerCase();
  return [
    {
      key: "context",
      label: "Context",
      score: clampScore(containsAny(lower, ["when", "in many cases", "in my experience", "today"]) ? 8 : 5),
      evidence: excerpt(transcript),
      feedback: "Set the scene faster so the listener knows the lens you are using."
    },
    {
      key: "answer",
      label: "Answer",
      score: clampScore(containsAny(lower, ["important", "because", "my answer"]) ? 8 : 6),
      evidence: excerpt(transcript),
      feedback: "State your direct answer in one sentence before expanding."
    },
    {
      key: "reason",
      label: "Reason",
      score: clampScore(containsAny(lower, ["because", "this matters", "the reason"]) ? 8 : 5),
      evidence: excerpt(transcript),
      feedback: "Strengthen the logical link between your answer and why it matters."
    },
    {
      key: "example",
      label: "Example",
      score: clampScore(containsAny(lower, ["for example", "for instance", "once", "at work"]) ? 8 : 4),
      evidence: excerpt(transcript),
      feedback: "Add a sharper real-world example so the answer feels concrete."
    }
  ];
}

function prepScores(transcript: string): StructuralScore[] {
  const lower = transcript.toLowerCase();
  return [
    {
      key: "point_open",
      label: "Point",
      score: clampScore(containsAny(lower, ["i think", "i believe", "my view", "in my opinion"]) ? 8 : 5),
      evidence: excerpt(transcript),
      feedback: "Open with a firmer opinion so the answer feels decisive."
    },
    {
      key: "reason",
      label: "Reason",
      score: clampScore(containsAny(lower, ["because", "the reason", "mainly"]) ? 8 : 5),
      evidence: excerpt(transcript),
      feedback: "Explain the logic right after your opinion."
    },
    {
      key: "example",
      label: "Example",
      score: clampScore(containsAny(lower, ["for example", "for instance", "one case"]) ? 8 : 4),
      evidence: excerpt(transcript),
      feedback: "Back the opinion with a tangible example."
    },
    {
      key: "point_close",
      label: "Re-point",
      score: clampScore(containsAny(lower, ["that is why", "so overall", "which is why", "so yes"]) ? 8 : 4),
      evidence: excerpt(transcript),
      feedback: "Close by restating the opinion with confidence."
    }
  ];
}

function starScores(transcript: string): StructuralScore[] {
  const lower = transcript.toLowerCase();
  return [
    {
      key: "situation",
      label: "Situation",
      score: clampScore(containsAny(lower, ["when i was", "at my previous", "on one project", "during"]) ? 8 : 5),
      evidence: excerpt(transcript),
      feedback: "Anchor the story with a clearer situation."
    },
    {
      key: "task",
      label: "Task",
      score: clampScore(containsAny(lower, ["my role", "i was responsible", "i needed to"]) ? 8 : 5),
      evidence: excerpt(transcript),
      feedback: "Clarify the responsibility you personally owned."
    },
    {
      key: "action",
      label: "Action",
      score: clampScore(containsAny(lower, ["i decided", "i spoke", "i created", "i handled", "i led"]) ? 8 : 6),
      evidence: excerpt(transcript),
      feedback: "Spend more time on what you actually did."
    },
    {
      key: "result",
      label: "Result",
      score: clampScore(containsAny(lower, ["as a result", "we improved", "it led to", "%", "outcome"]) ? 8 : 4),
      evidence: excerpt(transcript),
      feedback: "Finish with the impact and what changed because of your actions."
    }
  ];
}

function buildIdealAnswer(framework: FrameworkKey): string {
  const definition = FRAMEWORK_DEFINITIONS[framework];
  const labels = definition.components.map((component) => component.label).join(" -> ");

  return `${definition.name} outline: ${labels}. Deliver a direct answer, keep each section to 1-2 sentences, and end with a memorable final line.`;
}

export function evaluateHeuristically(transcript: string, framework: FrameworkKey): EvaluationResult {
  const structuralScores =
    framework === "CARE" ? careScores(transcript) : framework === "PREP" ? prepScores(transcript) : starScores(transcript);
  const communicationScores = buildCommunicationScores(transcript);
  const missingComponents = structuralScores.filter((score) => score.score <= 5).map((score) => score.label);
  const overallScore = average([
    ...structuralScores.map((score) => score.score),
    ...communicationScores.map((score) => score.score)
  ]);

  return {
    framework,
    overall_score: overallScore,
    structural_scores: structuralScores,
    communication_scores: communicationScores,
    missing_components: missingComponents,
    improvement_tips: [
      missingComponents.length > 0
        ? `Focus on missing structure: ${missingComponents.join(", ")}.`
        : "Your structure is solid. Tighten wording to sound sharper.",
      "Use shorter sentences and clearer transitions between framework steps.",
      "End with a stronger final takeaway instead of trailing off."
    ],
    ideal_answer: buildIdealAnswer(framework),
    transcript
  };
}
