import { FrameworkKey } from "@/lib/types";
import { evaluateWithOpenAI } from "@/lib/evaluation/openai-evaluator";

export async function evaluateTranscript(transcript: string, framework: FrameworkKey) {
  return evaluateWithOpenAI(transcript, framework);
}
