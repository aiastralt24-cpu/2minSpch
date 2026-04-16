"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";

import { CommunicationScoreCard } from "@/components/communication-score-card";
import { FrameworkBreakdown } from "@/components/framework-breakdown";
import { FrameworkCard } from "@/components/framework-card";
import { IdealAnswerPanel } from "@/components/ideal-answer-panel";
import { ImprovementTips } from "@/components/improvement-tips";
import { MainTakeawayCard } from "@/components/main-takeaway-card";
import { RecordingPanel } from "@/components/recording-panel";
import { ThinkingTimer } from "@/components/thinking-timer";
import { TopicPromptCard } from "@/components/topic-prompt-card";
import { TranscriptPanel } from "@/components/transcript-panel";
import {
  addLocalAttempt,
  getAccessToken,
  getAuthenticatedProfile,
  getGuestKey
} from "@/lib/client/progress-store";
import { FRAMEWORK_DEFINITIONS } from "@/lib/frameworks";
import {
  Difficulty,
  EvaluationResult,
  FrameworkKey,
  PracticeMode,
  PracticeStage,
  Topic
} from "@/lib/types";

function stageLabel(stage: PracticeStage) {
  if (stage === "setup") return "Step 1 of 4";
  if (stage === "prompt") return "Step 2 of 4";
  if (stage === "speaking") return "Step 3 of 4";
  return "Step 4 of 4";
}

const practiceModeOptions: {
  value: PracticeMode;
  title: string;
  description: string;
}[] = [
  {
    value: "auto",
    title: "Pick for me",
    description: "Best when you just want to start."
  },
  {
    value: "general",
    title: "Think clearly",
    description: "Explain ideas with calm structure."
  },
  {
    value: "opinion",
    title: "Share an opinion",
    description: "Make a point and support it."
  },
  {
    value: "interview",
    title: "Interview answer",
    description: "Tell a focused work story."
  },
  {
    value: "manual_framework",
    title: "Choose structure",
    description: "Pick CARE, PREP, or STAR yourself."
  }
];

const difficultyOptions: {
  value: Difficulty;
  title: string;
  description: string;
}[] = [
  {
    value: "easy",
    title: "Easy",
    description: "Warm up with a simple prompt."
  },
  {
    value: "medium",
    title: "Medium",
    description: "Balanced daily practice."
  },
  {
    value: "hard",
    title: "Hard",
    description: "Push your thinking."
  }
];

const frameworkOptions: {
  value: FrameworkKey;
  title: string;
  description: string;
}[] = [
  {
    value: "CARE",
    title: "CARE",
    description: "Context, answer, reason, example."
  },
  {
    value: "PREP",
    title: "PREP",
    description: "Point, reason, example, point."
  },
  {
    value: "STAR",
    title: "STAR",
    description: "Situation, task, action, result."
  }
];

export function PracticeShell() {
  const router = useRouter();
  const [guestKey, setGuestKey] = useState("");
  const [profileReady, setProfileReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [mode, setMode] = useState<PracticeMode>("auto");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [frameworkOverride, setFrameworkOverride] = useState<FrameworkKey>("CARE");
  const [topic, setTopic] = useState<Topic | null>(null);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [stage, setStage] = useState<PracticeStage>("setup");
  const [promptRevealComplete, setPromptRevealComplete] = useState(false);
  const [isLoadingTopic, setIsLoadingTopic] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setGuestKey(getGuestKey());
    getAuthenticatedProfile().then((profile) => {
      setIsSignedIn(Boolean(profile));
      setProfileId(profile?.id ?? null);
      setProfileReady(true);
    });
  }, []);

  const activeFramework = useMemo(() => {
    if (topic) {
      return FRAMEWORK_DEFINITIONS[topic.framework];
    }

    return FRAMEWORK_DEFINITIONS[frameworkOverride];
  }, [frameworkOverride, topic]);

  async function generateTopic() {
    setIsLoadingTopic(true);
    setError("");
    setResult(null);

    try {
      const accessToken = await getAccessToken();
      const response = await fetch("/api/topic/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          difficulty,
          frameworkOverride: mode === "manual_framework" ? frameworkOverride : undefined,
          guestKey
        })
      });

      if (!response.ok) {
        throw new Error("Unable to get a prompt right now.");
      }

      const data = (await response.json()) as { topic: Topic };
      setTopic(data.topic);
      setTranscript("");
      setStage("prompt");
      setPromptRevealComplete(false);

      await fetch("/api/practice/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          guestKey,
          mode,
          difficulty,
          framework: data.topic.framework,
          topicId: data.topic.id,
          status: "topic_generated"
        })
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to get a prompt right now.");
    } finally {
      setIsLoadingTopic(false);
    }
  }

  async function evaluate() {
    if (!topic || !transcript.trim()) {
      setError("Say or type your answer first, then review it.");
      return;
    }

    setIsEvaluating(true);
    setError("");

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestKey,
          topicId: topic.id,
          framework: topic.framework,
          transcript
        })
      });

      if (!response.ok) {
        throw new Error("Your answer could not be reviewed.");
      }

      const data = (await response.json()) as { result: EvaluationResult };
      startTransition(() => {
        setResult(data.result);
        setStage("feedback");
      });

      const accessToken = await getAccessToken();
      const ownerKey = profileId ?? guestKey;
      addLocalAttempt(ownerKey, {
        topicId: topic.id,
        topicTitle: topic.title,
        framework: topic.framework,
        transcript,
        overallScore: data.result.overall_score,
        evaluation: data.result
      });

      await fetch("/api/practice/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          guestKey,
          mode,
          difficulty,
          framework: topic.framework,
          topicId: topic.id,
          status: "completed",
          transcript,
          evaluation: data.result,
          topicTitle: topic.title
        })
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Your answer could not be reviewed.");
    } finally {
      setIsEvaluating(false);
    }
  }

  function handleStartSpeaking() {
    setStage("speaking");
    setError("");
  }

  function handleTryAnotherPrompt() {
    setResult(null);
    setTranscript("");
    setTopic(null);
    setError("");
    setPromptRevealComplete(false);
    setStage("setup");
  }

  function handleGoToSignIn() {
    router.push("/sign-in?next=%2Fpractice&reason=practice");
  }

  if (!profileReady) {
    return (
      <div className="section">
        <div className="shell stack">
          <section className="glass-panel">
            <span className="eyebrow">Loading</span>
            <h1 className="page-title">Getting your practice space ready.</h1>
          </section>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="section">
        <div className="shell stack">
          <section className="glass-panel auth-card auth-card-centered">
            <span className="eyebrow">Sign in first</span>
            <h1 className="auth-title">Save your rounds before you start.</h1>
            <p className="auth-subtext">
              Sign in to begin practice, keep your scores together, and come back to the same progress later.
            </p>
            <div className="auth-submit-row">
              <button className="button button-primary" onClick={handleGoToSignIn}>
                Sign in to start
              </button>
              <Link className="button button-secondary" href="/">
                Back home
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="shell stack">
        <div className="score-footer">
          <div>
            <span className="eyebrow">Practice</span>
            <h1 className="page-title">One clear step at a time.</h1>
            <p className="section-copy">Pick a prompt, speak your answer, then get one clear direction for the next try.</p>
          </div>
          <div className="header-actions">
            <Link className="button button-secondary desktop-inline-button" href="/dashboard">
              Your progress
            </Link>
            <Link className="button button-secondary desktop-inline-button" href="/sign-in">
              Sign in
            </Link>
          </div>
        </div>

        <div className="stage-line">
          <span className="eyebrow">{stageLabel(stage)}</span>
          <p className="muted">
            {stage === "setup" && "Choose what you want to practice."}
            {stage === "prompt" && "Read the prompt. The timer starts after it finishes."}
            {stage === "speaking" && "Say your answer out loud or type it below."}
            {stage === "feedback" && "Use the takeaway to make the next answer stronger."}
          </p>
        </div>

        {stage === "setup" ? (
          <section className="glass-panel practice-setup-card">
            <div className="setup-header">
              <span className="eyebrow">Choose your round</span>
              <h2>What do you want to practice?</h2>
              <p className="muted">Choose a speaking goal, choose the challenge level, then get your prompt.</p>
            </div>

            <div className="guided-setup">
              <div className="choice-section">
                <div>
                  <span className="choice-kicker">1</span>
                  <h3>I want to...</h3>
                </div>
                <div className="choice-grid mode-choice-grid">
                  {practiceModeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`choice-chip ${mode === option.value ? "choice-chip-active" : ""}`}
                      onClick={() => setMode(option.value)}
                    >
                      <strong>{option.title}</strong>
                      <span>{option.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="choice-section">
                <div>
                  <span className="choice-kicker">2</span>
                  <h3>Make it...</h3>
                </div>
                <div className="choice-grid difficulty-choice-grid">
                  {difficultyOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`choice-chip ${difficulty === option.value ? "choice-chip-active" : ""}`}
                      onClick={() => setDifficulty(option.value)}
                    >
                      <strong>{option.title}</strong>
                      <span>{option.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {mode === "manual_framework" ? (
                <div className="choice-section">
                  <div>
                    <span className="choice-kicker">3</span>
                    <h3>Use this structure</h3>
                  </div>
                  <div className="choice-grid difficulty-choice-grid">
                    {frameworkOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`choice-chip ${frameworkOverride === option.value ? "choice-chip-active" : ""}`}
                        onClick={() => setFrameworkOverride(option.value)}
                      >
                        <strong>{option.title}</strong>
                        <span>{option.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {error ? <p className="muted">{error}</p> : <p className="footer-note">Not sure? Keep “Pick for me” and Medium.</p>}
            <div className="sticky-action-bar setup-action-bar">
              <button className="button button-primary" onClick={generateTopic} disabled={isLoadingTopic}>
                {isLoadingTopic ? "Getting prompt..." : "Get prompt"}
              </button>
            </div>
          </section>
        ) : null}

        {topic && stage === "prompt" ? (
          <div className="stack">
            <TopicPromptCard topic={topic} animate onAnimationComplete={() => setPromptRevealComplete(true)}>
              <ThinkingTimer seconds={30} isActive={promptRevealComplete} compact />
            </TopicPromptCard>
            <details className="glass-panel detail-panel">
              <summary className="detail-summary">
                <span className="eyebrow">Need a structure?</span>
                <span className="muted">Open guide</span>
              </summary>
              <div className="detail-body">
                <FrameworkCard framework={activeFramework} />
              </div>
            </details>
            <div className="sticky-action-bar">
              <button className="button button-primary" onClick={handleStartSpeaking} disabled={!promptRevealComplete}>
                {promptRevealComplete ? "Start speaking" : "Wait for prompt"}
              </button>
            </div>
          </div>
        ) : null}

        {topic && stage === "speaking" ? (
          <div className="stack">
            <TopicPromptCard topic={topic} />
            <RecordingPanel transcript={transcript} setTranscript={setTranscript} />
            <TranscriptPanel transcript={transcript} onChange={setTranscript} />
            <details className="glass-panel detail-panel">
              <summary className="detail-summary">
                <span className="eyebrow">Need help with this structure?</span>
                <span className="muted">See the speaking guide</span>
              </summary>
              <div className="detail-body">
                <FrameworkCard framework={activeFramework} />
              </div>
            </details>
            {error ? <p className="muted">{error}</p> : null}
            <div className="sticky-action-bar">
              <button className="button button-primary" onClick={evaluate} disabled={isEvaluating}>
                {isEvaluating ? "Reviewing..." : "Review answer"}
              </button>
            </div>
          </div>
        ) : null}

        {result && stage === "feedback" ? (
          <div className="stack">
            <div>
              <span className="eyebrow">Feedback</span>
              <h2>Here is what to fix next.</h2>
            </div>
            <div className="result-layout">
              <div className="stack">
                <MainTakeawayCard result={result} />
                <ImprovementTips result={result} />
                <CommunicationScoreCard result={result} />
              </div>
              <div className="stack">
                <IdealAnswerPanel result={result} />
                <FrameworkBreakdown result={result} />
                <TranscriptPanel transcript={result.transcript} />
              </div>
            </div>
            <div className="sticky-action-bar">
              <button className="button button-primary" onClick={handleTryAnotherPrompt}>
                Try another prompt
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
