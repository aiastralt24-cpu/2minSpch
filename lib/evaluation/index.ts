import { FrameworkKey } from "@/lib/types";
import { evaluateWithOpenAI } from "@/lib/evaluation/openai-evaluator";

export async function evaluateTranscript(transcript: string, framework: FrameworkKey, topicTitle?: string) {
  return evaluateWithOpenAI(transcript, framework, topicTitle);
}
