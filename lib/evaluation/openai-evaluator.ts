import OpenAI from "openai";
import { z } from "zod";

import { FRAMEWORK_DEFINITIONS } from "@/lib/frameworks";
import { EvaluationResult, FrameworkKey } from "@/lib/types";
import { evaluateHeuristically } from "@/lib/evaluation/heuristic-evaluator";

const structuralScoreSchema = z.object({
  key: z.string(),
  label: z.string(),
  score: z.number(),
  evidence: z.string(),
  feedback: z.string()
});

const communicationScoreSchema = z.object({
  key: z.enum(["clarity", "confidence", "pacing", "filler_words"]),
  label: z.string(),
  score: z.number(),
  feedback: z.string()
});

const evaluationSchema = z.object({
  framework: z.enum(["CARE", "PREP", "STAR"]),
  overall_score: z.number(),
  structural_scores: z.array(structuralScoreSchema),
  communication_scores: z.array(communicationScoreSchema),
  missing_components: z.array(z.string()),
  improvement_tips: z.array(z.string()),
  ideal_answer: z.string(),
  transcript: z.string()
});

export async function evaluateWithOpenAI(
  transcript: string,
  framework: FrameworkKey,
  topicTitle?: string
): Promise<EvaluationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return evaluateHeuristically(transcript, framework, topicTitle);
  }

  const client = new OpenAI({ apiKey });
  const definition = FRAMEWORK_DEFINITIONS[framework];

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "You are CARE Speak AI, a framework-based speaking evaluator.",
            "Return strict JSON only.",
            `The framework is ${definition.name}.`,
            `Its components are: ${definition.components.map((component) => component.label).join(", ")}.`,
            "Score each structural component from 1 to 10.",
            "Also score clarity, confidence, pacing, and filler_words from 1 to 10.",
            "List missing components and three practical coaching tips.",
            "The ideal_answer must be the actual 10/10 spoken answer to the prompt, not an outline, instruction, rubric, or explanation of the framework.",
            "Write ideal_answer as a concise ready-to-say response using the selected framework."
          ].join(" ")
        },
        {
          role: "user",
          content: JSON.stringify({
            framework,
            topicTitle,
            transcript
          })
        }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return evaluateHeuristically(transcript, framework);
    }

    const parsed = evaluationSchema.parse(JSON.parse(content));
    return parsed;
  } catch {
    return evaluateHeuristically(transcript, framework, topicTitle);
  }
}
