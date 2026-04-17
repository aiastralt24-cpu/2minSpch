import { NextResponse } from "next/server";
import { z } from "zod";

import { writeGuestKeyCookie } from "@/lib/server/guest-key";
import { getRepository } from "@/lib/server/repository";
import { getSupabaseServerClient, getUserFromRequest } from "@/lib/supabase/server";

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
  persuasion_scores: z.array(
    z.object({
      key: z.enum(["ethos", "pathos", "logos"]),
      label: z.string(),
      score: z.number(),
      feedback: z.string()
    })
  ).optional(),
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
  const { user, token } = await getUserFromRequest(request);
  const supabase = token ? getSupabaseServerClient(token) : null;

  if (supabase && user) {
    await supabase.from("profiles").upsert({
      id: user.id,
      display_name: user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Speaker",
      updated_at: new Date().toISOString()
    });

    const { data: session, error: sessionError } = await supabase
      .from("practice_sessions")
      .insert({
        user_id: user.id,
        mode: payload.mode,
        difficulty: payload.difficulty,
        framework: payload.framework,
        topic_id: payload.topicId,
        status: payload.status
      })
      .select()
      .single();

    if (sessionError) {
      return NextResponse.json({ message: sessionError.message }, { status: 500 });
    }

    if (payload.status === "completed" && payload.evaluation && payload.topicTitle) {
      const { data: attempt, error: attemptError } = await supabase
        .from("practice_attempts")
        .insert({
          session_id: session.id,
          user_id: user.id,
          topic_id: payload.topicId,
          topic_title: payload.topicTitle,
          framework: payload.framework,
          transcript: payload.transcript ?? "",
          raw_evaluation: payload.evaluation,
          overall_score: payload.evaluation.overall_score
        })
        .select()
        .single();

      if (attemptError) {
        return NextResponse.json({ message: attemptError.message }, { status: 500 });
      }

      const componentRows = payload.evaluation.structural_scores.map((score) => ({
        attempt_id: attempt.id,
        framework: payload.framework,
        component_key: score.key,
        component_label: score.label,
        score: score.score,
        evidence: score.evidence,
        feedback: score.feedback
      }));

      const communicationRows = payload.evaluation.communication_scores.map((score) => ({
        attempt_id: attempt.id,
        metric_key: score.key,
        metric_label: score.label,
        score: score.score,
        feedback: score.feedback
      }));

      const [{ error: componentError }, { error: communicationError }] = await Promise.all([
        supabase.from("attempt_component_scores").insert(componentRows),
        supabase.from("attempt_communication_scores").insert(communicationRows)
      ]);

      if (componentError || communicationError) {
        return NextResponse.json(
          { message: componentError?.message ?? communicationError?.message ?? "Could not save scores." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ session });
  }

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
