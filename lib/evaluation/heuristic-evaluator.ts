import { FRAMEWORK_DEFINITIONS } from "@/lib/frameworks";
import {
  CommunicationScore,
  EvaluationResult,
  FrameworkKey,
  PersuasionScore,
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

function buildPersuasionScores(transcript: string): PersuasionScore[] {
  const lower = transcript.toLowerCase();
  const ethosSignals = [
    "in my experience",
    "my role",
    "i was responsible",
    "i learned",
    "i handled",
    "i led",
    "i believe",
    "balanced",
    "responsibly"
  ];
  const pathosSignals = [
    "people",
    "students",
    "customer",
    "team",
    "parents",
    "stress",
    "confidence",
    "trust",
    "feel",
    "impact",
    "human"
  ];
  const logosSignals = [
    "because",
    "the reason",
    "for example",
    "as a result",
    "therefore",
    "so overall",
    "data",
    "evidence",
    "%",
    "outcome"
  ];

  const ethosHits = ethosSignals.filter((signal) => lower.includes(signal)).length;
  const pathosHits = pathosSignals.filter((signal) => lower.includes(signal)).length;
  const logosHits = logosSignals.filter((signal) => lower.includes(signal)).length;

  const ethos = clampScore(4 + ethosHits * 1.4);
  const pathos = clampScore(4 + pathosHits * 1.2);
  const logos = clampScore(4 + logosHits * 1.3);

  return [
    {
      key: "ethos",
      label: "Credible",
      score: ethos,
      feedback: ethos >= 7 ? "The answer feels grounded and trustworthy." : "Add credibility with experience, ownership, or balanced wording."
    },
    {
      key: "pathos",
      label: "Human",
      score: pathos,
      feedback: pathos >= 7 ? "The listener can feel why it matters." : "Add the human impact so the answer feels more relatable."
    },
    {
      key: "logos",
      label: "Logical",
      score: logos,
      feedback: logos >= 7 ? "The reasoning is clear and easy to follow." : "Add clearer cause-effect logic, proof, or an example."
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

function stripPromptPrefix(topicTitle?: string) {
  return topicTitle?.replace(/^[^:]+:\s*/, "").trim();
}

function buildCareAnswer(topicTitle?: string): string {
  const prompt = stripPromptPrefix(topicTitle)?.toLowerCase() ?? "";

  if (prompt.includes("lifelong learner")) {
    return "A strong lifelong learner is someone who stays curious, reflects honestly, and keeps applying what they learn. The key is not just collecting information, but turning feedback and experience into better action. For example, if someone struggles with public speaking, a lifelong learner would practice, ask for feedback, adjust their approach, and try again instead of avoiding it. That is what makes learning a habit, not a one-time activity.";
  }

  if (prompt.includes("time management")) {
    return "Time management is important because it gives people control over their day instead of letting tasks control them. When someone plans their time well, they can focus better, reduce stress, and make space for important work instead of only reacting to urgent things. For example, a student who blocks time for study, rest, and revision is more likely to perform consistently than someone who waits until the last minute. Good time management is really about using attention wisely.";
  }

  if (prompt.includes("feedback")) {
    return "People should respond to difficult feedback with calm curiosity before defending themselves. Feedback can feel uncomfortable, but it often shows a gap between intention and impact. For example, if a manager says your updates are unclear, the useful response is to ask what would make them clearer and then adjust your next update. That turns criticism into growth instead of conflict.";
  }

  return "A strong answer starts by setting the context clearly, then gives a direct response, explains why it matters, and makes the idea concrete with an example. The main point is to help the listener understand both your thinking and its practical value. For example, when discussing an important skill, you can explain where it shows up in daily life and how it changes outcomes. That makes the answer complete, clear, and easy to remember.";
}

function buildPrepAnswer(topicTitle?: string): string {
  const prompt = stripPromptPrefix(topicTitle)?.toLowerCase() ?? "";

  if (prompt.includes("ai") && prompt.includes("school")) {
    return "Yes, AI should be a core part of school education, but it should be taught as a thinking tool, not a shortcut. Students will live in a world where AI is part of work, research, and problem-solving, so schools should teach them how to use it responsibly. For example, a student can use AI to compare ideas, check assumptions, or get feedback on writing, while still being expected to explain their own reasoning. That is why AI belongs in education: it prepares students for the real world while strengthening, not replacing, their thinking.";
  }

  if (prompt.includes("remote work")) {
    return "I believe remote work is better for many roles because it gives people more control over their focus and energy. When people avoid unnecessary commuting and interruptions, they can often do deeper work and manage their day more effectively. For example, a developer or writer may produce better results from a quiet home setup than from a noisy office. So overall, remote work is better when teams have clear communication, trust, and measurable outcomes.";
  }

  if (prompt.includes("four-day")) {
    return "Yes, a four-day workweek can improve productivity if teams use it to focus on outcomes instead of hours. A shorter week forces companies to remove low-value meetings, clarify priorities, and protect deep work. For example, a team that cuts status meetings and plans work more carefully may finish the same amount in fewer days with less burnout. That is why a four-day week can work, but only when the culture values focus and accountability.";
  }

  return "I believe the stronger position is to support the idea, as long as it is used with clear boundaries. The reason is that good tools improve results when people use them thoughtfully instead of blindly. For example, in a school or workplace setting, a tool can save time, create feedback, and help people compare options, but the person still needs to make the final judgment. So overall, the idea is valuable when it supports better thinking rather than replacing it.";
}

function buildStarAnswer(topicTitle?: string): string {
  const prompt = stripPromptPrefix(topicTitle)?.toLowerCase() ?? "";

  if (prompt.includes("conflict")) {
    return "In a previous team project, two teammates disagreed strongly about the direction of a launch plan. My task was to keep the project moving without making either person feel ignored. I spoke to each person separately, clarified the real concern behind their position, and then brought the group back to agree on one decision criteria: what would reduce risk for the customer. As a result, we chose a clearer plan, finished the launch on time, and the team worked together more calmly after that.";
  }

  if (prompt.includes("failed")) {
    return "Early in a project, I failed to communicate a delay quickly enough because I thought I could fix it before anyone noticed. My responsibility was to keep stakeholders informed, not just solve the problem alone. Once I realized the impact, I updated everyone honestly, explained the cause, and created a weekly checkpoint so risks were visible earlier. As a result, the project recovered, and I learned that ownership means communicating early, especially when the news is uncomfortable.";
  }

  if (prompt.includes("ownership")) {
    return "During a high-pressure deadline, our team discovered a major issue close to delivery. My task was to help stabilize the work and keep everyone focused. I took ownership of the issue list, grouped the problems by urgency, assigned clear owners, and checked progress twice a day until the release was stable. As a result, we delivered the most important parts on time and avoided confusion because everyone knew exactly what to do next.";
  }

  return "In a previous project, I faced a situation where the team needed clearer direction under pressure. My task was to help organize the work and make sure the most important priorities were handled first. I clarified the goal, broke the work into smaller steps, communicated owners, and followed up regularly until the issue was resolved. As a result, the team moved faster, avoided duplicated effort, and delivered a stronger outcome.";
}

function buildIdealAnswer(framework: FrameworkKey, topicTitle?: string): string {
  if (framework === "CARE") return buildCareAnswer(topicTitle);
  if (framework === "PREP") return buildPrepAnswer(topicTitle);
  return buildStarAnswer(topicTitle);
}

export function evaluateHeuristically(transcript: string, framework: FrameworkKey, topicTitle?: string): EvaluationResult {
  const structuralScores =
    framework === "CARE" ? careScores(transcript) : framework === "PREP" ? prepScores(transcript) : starScores(transcript);
  const communicationScores = buildCommunicationScores(transcript);
  const persuasionScores = buildPersuasionScores(transcript);
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
    persuasion_scores: persuasionScores,
    missing_components: missingComponents,
    improvement_tips: [
      missingComponents.length > 0
        ? `Focus on missing structure: ${missingComponents.join(", ")}.`
        : "Your structure is solid. Tighten wording to sound sharper.",
      "Use shorter sentences and clearer transitions between framework steps.",
      "End with a stronger final takeaway instead of trailing off."
    ],
    ideal_answer: buildIdealAnswer(framework, topicTitle),
    transcript
  };
}
