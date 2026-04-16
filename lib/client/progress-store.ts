"use client";

import {
  EvaluationResult,
  LocalUserProfile,
  PracticeAttemptRecord,
  ProgressSummary
} from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { average } from "@/lib/utils";

const PROFILE_KEY = "care-speak-ai-profile";
const ACCOUNTS_KEY = "care-speak-ai-accounts";
const CURRENT_USER_KEY = "care-speak-ai-current-user";
const ATTEMPTS_KEY = "care-speak-ai-attempts";
const GUEST_KEY = "care-speak-ai-guest-key";

type StoredAttempt = PracticeAttemptRecord & {
  ownerKey: string;
};

type StoredAccount = LocalUserProfile & {
  password: string;
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function readAccounts() {
  return readJson<StoredAccount[]>(ACCOUNTS_KEY, []);
}

function writeAccounts(accounts: StoredAccount[]) {
  writeJson(ACCOUNTS_KEY, accounts);
}

function sanitizeAccount(account: StoredAccount): LocalUserProfile {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    createdAt: account.createdAt
  };
}

export function getGuestKey() {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem(GUEST_KEY);
  if (existing) {
    return existing;
  }

  const created = crypto.randomUUID();
  window.localStorage.setItem(GUEST_KEY, created);
  return created;
}

export function createTrackingId() {
  return `CARE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function setCurrentUser(profile: LocalUserProfile | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!profile) {
    window.localStorage.removeItem(CURRENT_USER_KEY);
    window.localStorage.removeItem(PROFILE_KEY);
    return;
  }

  writeJson(CURRENT_USER_KEY, profile.id);
  writeJson(PROFILE_KEY, profile);
}

function mapSupabaseUser(user: {
  id: string;
  email?: string;
  created_at?: string;
  user_metadata?: { name?: string; display_name?: string };
}): LocalUserProfile {
  return {
    id: user.id,
    name: user.user_metadata?.name ?? user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "Speaker",
    email: user.email ?? "",
    createdAt: user.created_at ?? new Date().toISOString()
  };
}

export function getAuthProviderLabel() {
  return isSupabaseConfigured() ? "Supabase Auth" : "Local development auth";
}

export async function getAccessToken() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function getAuthenticatedProfile(): Promise<LocalUserProfile | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return getCurrentUser();
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }

  return mapSupabaseUser(data.user);
}

export function getCurrentUser(): LocalUserProfile | null {
  const currentUserId = readJson<string | null>(CURRENT_USER_KEY, null);
  if (!currentUserId) {
    return null;
  }

  const account = readAccounts().find((item) => item.id === currentUserId);
  if (!account) {
    return null;
  }

  return sanitizeAccount(account);
}

export function getLocalProfile(): LocalUserProfile | null {
  return getCurrentUser();
}

export async function signInAccount(email: string, password: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return signInLocalAccount(email, password);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password
  });

  if (error || !data.user) {
    return {
      ok: false as const,
      message: error?.message ?? "Email or password did not match."
    };
  }

  return { ok: true as const, profile: mapSupabaseUser(data.user) };
}

export async function registerAccount(input: { name: string; email: string; password: string }) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return registerLocalAccount(input);
  }

  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: {
        name: input.name.trim()
      }
    }
  });

  if (error || !data.user) {
    return {
      ok: false as const,
      message: error?.message ?? "We could not create that account."
    };
  }

  return {
    ok: true as const,
    profile: mapSupabaseUser(data.user),
    needsEmailConfirmation: !data.session
  };
}

export function registerLocalAccount(input: { name: string; email: string; password: string }) {
  const accounts = readAccounts();
  const normalizedEmail = input.email.trim().toLowerCase();

  if (accounts.some((account) => account.email.toLowerCase() === normalizedEmail)) {
    return { ok: false as const, message: "An account with that email already exists." };
  }

  const account: StoredAccount = {
    id: createTrackingId(),
    name: input.name.trim(),
    email: normalizedEmail,
    password: input.password,
    createdAt: new Date().toISOString()
  };

  accounts.unshift(account);
  writeAccounts(accounts);
  migrateGuestAttempts(account.id);
  const profile = sanitizeAccount(account);
  setCurrentUser(profile);

  return { ok: true as const, profile };
}

export function signInLocalAccount(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const account = readAccounts().find(
    (item) => item.email.toLowerCase() === normalizedEmail && item.password === password
  );

  if (!account) {
    return { ok: false as const, message: "Email or password did not match." };
  }

  const profile = sanitizeAccount(account);
  setCurrentUser(profile);
  return { ok: true as const, profile };
}

export function signOutLocalAccount() {
  setCurrentUser(null);
}

export async function signOutAccount() {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  signOutLocalAccount();
}

export function clearLocalProfile() {
  signOutLocalAccount();
}

function migrateGuestAttempts(profileId: string) {
  const guestKey = getGuestKey();
  const attempts = readJson<StoredAttempt[]>(ATTEMPTS_KEY, []);
  const nextAttempts = attempts.map((attempt) =>
    attempt.ownerKey === guestKey ? { ...attempt, ownerKey: profileId, userId: profileId, guestKey: undefined } : attempt
  );

  writeJson(ATTEMPTS_KEY, nextAttempts);
}

export function addLocalAttempt(
  ownerKey: string,
  input: {
    topicId: string;
    topicTitle: string;
    framework: PracticeAttemptRecord["framework"];
    transcript: string;
    overallScore: number;
    evaluation: EvaluationResult;
  }
) {
  const attempts = readJson<StoredAttempt[]>(ATTEMPTS_KEY, []);
  const nextAttempt: StoredAttempt = {
    id: crypto.randomUUID(),
    ownerKey,
    userId: ownerKey.startsWith("CARE-") ? ownerKey : undefined,
    guestKey: ownerKey.startsWith("CARE-") ? undefined : ownerKey,
    topicId: input.topicId,
    topicTitle: input.topicTitle,
    framework: input.framework,
    transcript: input.transcript,
    overallScore: input.overallScore,
    evaluation: input.evaluation,
    createdAt: new Date().toISOString()
  };

  attempts.unshift(nextAttempt);
  writeJson(ATTEMPTS_KEY, attempts);
  return nextAttempt;
}

export function getProgressSummaryForOwner(ownerKey: string): ProgressSummary {
  const attempts = readJson<StoredAttempt[]>(ATTEMPTS_KEY, []).filter((attempt) => attempt.ownerKey === ownerKey);
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
}
