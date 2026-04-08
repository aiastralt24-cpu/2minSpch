import {
  EvaluationResult,
  PracticeAttemptRecord,
  PracticeSessionRecord,
  ProgressSummary
} from "@/lib/types";
import { average } from "@/lib/utils";

type AttemptInput = Omit<PracticeAttemptRecord, "id" | "createdAt"> & {
  id?: string;
  createdAt?: string;
};

type SessionInput = Omit<PracticeSessionRecord, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

const store = {
  attempts: [] as PracticeAttemptRecord[],
  sessions: [] as PracticeSessionRecord[]
};

function nowIso() {
  return new Date().toISOString();
}

function scopedAttempts(scope: { guestKey?: string; userId?: string }) {
  return store.attempts.filter((attempt) => {
    if (scope.userId) {
      return attempt.userId === scope.userId;
    }

    return attempt.guestKey === scope.guestKey;
  });
}

export const memoryStore = {
  upsertSession(input: SessionInput) {
    const id = input.id ?? crypto.randomUUID();
    const existing = store.sessions.find((session) => session.id === id);
    const record: PracticeSessionRecord = {
      id,
      guestKey: input.guestKey,
      userId: input.userId,
      mode: input.mode,
      difficulty: input.difficulty,
      framework: input.framework,
      topicId: input.topicId,
      status: input.status,
      createdAt: existing?.createdAt ?? input.createdAt ?? nowIso(),
      updatedAt: input.updatedAt ?? nowIso()
    };

    if (existing) {
      Object.assign(existing, record);
      return existing;
    }

    store.sessions.unshift(record);
    return record;
  },

  createAttempt(input: AttemptInput) {
    const record: PracticeAttemptRecord = {
      ...input,
      id: input.id ?? crypto.randomUUID(),
      createdAt: input.createdAt ?? nowIso()
    };
    store.attempts.unshift(record);
    return record;
  },

  getProgressSummary(scope: { guestKey?: string; userId?: string }): ProgressSummary {
    const attempts = scopedAttempts(scope);
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

    const weakestComponents = [...componentGroups.entries()]
      .map(([compositeKey, values]) => {
        const [framework, component] = compositeKey.split(":");
        return {
          framework: framework as PracticeAttemptRecord["framework"],
          component,
          averageScore: average(values)
        };
      })
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 4);

    return {
      totalAttempts: attempts.length,
      averageScore: average(attempts.map((attempt) => attempt.overallScore)),
      frameworkAverages: [...frameworkGroups.entries()].map(([framework, values]) => ({
        framework: framework as PracticeAttemptRecord["framework"],
        averageScore: average(values),
        attempts: values.length
      })),
      weakestComponents,
      recentAttempts: attempts.slice(0, 6)
    };
  },

  getAttemptById(id: string) {
    return store.attempts.find((attempt) => attempt.id === id) ?? null;
  },

  seedAttempt(attempt: PracticeAttemptRecord) {
    store.attempts.unshift(attempt);
  }
};
