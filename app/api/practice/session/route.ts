import { NextResponse } from "next/server";
import { z } from "zod";

import { writeGuestKeyCookie } from "@/lib/server/guest-key";
import { getRepository } from "@/lib/server/repository";

const evaluationSchema = z.object({
  framework: z.enum(["CARE", "PREP", "STAR"]),
  overall_score: z.number(),
  structural_scores: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      score: z.number(),
      evidence: z.string(),
      feedback: z.string()
    })
  ),
  communication_scores: z.array(
    z.object({
      key: z.enum(["clarity", "confidence", "pacing", "filler_words"]),
      label: z.string(),
      score: z.number(),
      feedback: z.string()
    })
  ),
  missing_components: z.array(z.string()),
  improvement_tips: z.array(z.string()),
  ideal_answer: z.string(),
  transcript: z.string()
});

const bodySchema = z.object({
  guestKey: z.string().optional(),
  userId: z.string().optional(),
  mode: z.enum(["auto", "general", "opinion", "interview", "manual_framework"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  framework: z.enum(["CARE", "PREP", "STAR"]),
  topicId: z.string(),
  topicTitle: z.string().optional(),
  status: z.enum(["topic_generated", "completed"]),
  transcript: z.string().optional(),
  evaluation: evaluationSchema.optional()
});

export async function POST(request: Request) {
  const payload = bodySchema.parse(await request.json());
  const repository = getRepository();

  if (payload.guestKey) {
    await writeGuestKeyCookie(payload.guestKey);
  }

  const session = repository.upsertSession({
    guestKey: payload.guestKey,
    userId: payload.userId,
    mode: payload.mode,
    difficulty: payload.difficulty,
    framework: payload.framework,
    topicId: payload.topicId,
    status: payload.status
  });

  if (payload.status === "completed" && payload.evaluation && payload.topicTitle) {
    repository.createAttempt({
      guestKey: payload.guestKey,
      userId: payload.userId,
      topicId: payload.topicId,
      topicTitle: payload.topicTitle,
      framework: payload.framework,
      transcript: payload.transcript ?? "",
      overallScore: payload.evaluation.overall_score,
      evaluation: payload.evaluation
    });
  }

  return NextResponse.json({ session });
}
