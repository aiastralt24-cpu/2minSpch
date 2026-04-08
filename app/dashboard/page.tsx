"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ProgressCharts } from "@/components/progress-charts";
import { getGuestKey, getLocalProfile, getProgressSummaryForOwner } from "@/lib/client/progress-store";
import { LocalUserProfile, ProgressSummary } from "@/lib/types";

export default function DashboardPage() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [profile, setProfile] = useState<LocalUserProfile | null>(null);

  useEffect(() => {
    const localProfile = getLocalProfile();
    const ownerKey = localProfile?.id ?? getGuestKey();
    setProfile(localProfile);
    setSummary(getProgressSummaryForOwner(ownerKey));
  }, []);

  if (!summary) {
    return (
      <main className="section">
        <div className="shell empty-state">Loading progress...</div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="shell stack">
        <div className="score-footer">
          <div>
            <span className="eyebrow">Your progress</span>
            <h1 className="page-title">See what is getting stronger and what needs more reps.</h1>
            <p className="section-copy">This page should answer three things fast: how much you practiced, what is improving, and what to work on next.</p>
            <div className="pill-row">
              <span className="pill">{profile ? `Signed in as ${profile.name}` : "Guest mode"}</span>
              <span className="pill">{profile ? `Tracker ${profile.id}` : "Practice is only stored on this device"}</span>
            </div>
          </div>
          <div className="header-actions">
            <Link href="/practice" className="button button-primary">
              Practice again
            </Link>
            <Link href="/sign-in" className="button button-secondary">
              {profile ? "Manage account" : "Sign in"}
            </Link>
          </div>
        </div>

        <div className="grid-3">
          <section className="glass-panel metric-card">
            <span className="eyebrow">Practice rounds</span>
            <div className="big-number">{summary.totalAttempts}</div>
            <p className="muted">Completed practice rounds.</p>
          </section>
          <section className="glass-panel metric-card">
            <span className="eyebrow">Overall score</span>
            <div className="big-number">{summary.averageScore}/10</div>
            <p className="muted">How your answers are doing overall.</p>
          </section>
          <section className="glass-panel metric-card">
            <span className="eyebrow">Tracked areas</span>
            <div className="big-number">{summary.frameworkAverages.length}</div>
            <p className="muted">Speaking structures with enough practice to show progress.</p>
          </section>
        </div>

        <ProgressCharts summary={summary} />

        <section className="glass-panel">
          <span className="eyebrow">Recent practice</span>
          <div className="stack">
            {summary.recentAttempts.length > 0 ? (
              summary.recentAttempts.map((attempt) => (
                <div key={attempt.id} className="practice-card panel">
                  <div className="score-header">
                    <strong>{attempt.topicTitle}</strong>
                    <span>{attempt.framework}</span>
                  </div>
                  <p className="muted">
                    {attempt.overallScore}/10 · {new Date(attempt.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="empty-state">No practice yet. Complete one round and your recent history will show up here.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
