import { NextResponse } from "next/server";

import { readGuestKeyFromCookie } from "@/lib/server/guest-key";
import { getProgressSummaryForScope } from "@/lib/server/progress";
import { getSupabaseServerClient, getUserFromRequest } from "@/lib/supabase/server";
import { PracticeAttemptRecord, ProgressSummary } from "@/lib/types";
import { average } from "@/lib/utils";

export async function GET(request: Request) {
  const { user, token } = await getUserFromRequest(request);
  const supabase = token ? getSupabaseServerClient(token) : null;

  if (supabase && user) {
    const { data, error } = await supabase
      .from("practice_attempts")
      .select("id, topic_id, topic_title, framework, transcript, overall_score, raw_evaluation, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const attempts: PracticeAttemptRecord[] = (data ?? []).map((attempt) => ({
      id: attempt.id,
      userId: user.id,
      topicId: attempt.topic_id,
      topicTitle: attempt.topic_title,
      framework: attempt.framework,
      transcript: attempt.transcript,
      overallScore: Number(attempt.overall_score),
      evaluation: attempt.raw_evaluation,
      createdAt: attempt.created_at
    }));

    const frameworkGroups = new Map<string, number[]>();
    const componentGroups = new Map<string, number[]>();

    for (const attempt of attempts) {
      const frameworkScores = frameworkGroups.get(attempt.framework) ?? [];
      frameworkScores.push(attempt.overallScore);
      frameworkGroups.set(attempt.framework, frameworkScores);

      for (const score of attempt.evaluation.structural_scores) {
        const key = `${attempt.framework}:${score.label}`;
        const componentScores = componentGroups.get(key) ?? [];
        componentScores.push(score.score);
        componentGroups.set(key, componentScores);
      }
    }

    const summary: ProgressSummary = {
      totalAttempts: attempts.length,
      averageScore: average(attempts.map((attempt) => attempt.overallScore)),
      frameworkAverages: [...frameworkGroups.entries()].map(([framework, values]) => ({
        framework: framework as PracticeAttemptRecord["framework"],
        averageScore: average(values),
        attempts: values.length
      })),
      weakestComponents: [...componentGroups.entries()]
        .map(([compositeKey, values]) => {
          const [framework, component] = compositeKey.split(":");
          return {
            framework: framework as PracticeAttemptRecord["framework"],
            component,
            averageScore: average(values)
          };
        })
        .sort((a, b) => a.averageScore - b.averageScore)
        .slice(0, 4),
      recentAttempts: attempts.slice(0, 6)
    };

    return NextResponse.json(summary);
  }

  const { searchParams } = new URL(request.url);
  const guestKey = searchParams.get("guestKey") ?? (await readGuestKeyFromCookie());
  const userId = searchParams.get("userId") ?? undefined;
  const summary = await getProgressSummaryForScope({ guestKey: guestKey ?? undefined, userId });

  return NextResponse.json(summary);
}
