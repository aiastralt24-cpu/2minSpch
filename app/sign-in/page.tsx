"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getCurrentUser,
  registerLocalAccount,
  signInLocalAccount,
  signOutLocalAccount
} from "@/lib/client/progress-store";
import { LocalUserProfile } from "@/lib/types";

type AuthMode = "sign_in" | "create_account";
type SignupStep = "email" | "verify" | "details";

export default function SignInPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/dashboard");
  const [reason, setReason] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("sign_in");
  const [signupStep, setSignupStep] = useState<SignupStep>("email");
  const [profile, setProfile] = useState<LocalUserProfile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [devOtpPreview, setDevOtpPreview] = useState("");
  const [sendOtpCooldown, setSendOtpCooldown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  useEffect(() => {
    setProfile(getCurrentUser());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    setNextPath(params.get("next") || "/dashboard");
    setReason(params.get("reason") || "");
  }, []);

  useEffect(() => {
    if (sendOtpCooldown <= 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setSendOtpCooldown((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [sendOtpCooldown]);

  function resetCreateAccountFlow() {
    setSignupStep("email");
    setName("");
    setEmail("");
    setPassword("");
    setOtp("");
    setDevOtpPreview("");
    setMessage("");
    setSendOtpCooldown(0);
    setIsSendingOtp(false);
    setIsVerifyingOtp(false);
  }

  async function requestOtp() {
    setMessage("");
    setIsSendingOtp(true);
    if (!email.trim()) {
      setMessage("Please enter your email first.");
      setIsSendingOtp(false);
      return;
    }

    const response = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = (await response.json()) as {
      ok?: boolean;
      message?: string;
      previewCode?: string;
      retryAfterSeconds?: number;
    };

    if (!response.ok) {
      setMessage(data.message ?? "We could not send a code right now.");
      setSendOtpCooldown(data.retryAfterSeconds ?? 0);
      setIsSendingOtp(false);
      return;
    }

    setSignupStep("verify");
    setDevOtpPreview(data.previewCode ?? "");
    setSendOtpCooldown(data.retryAfterSeconds ?? 0);
    setMessage("We generated a verification code for your email.");
    setIsSendingOtp(false);
  }

  async function verifyEmailCode() {
    setMessage("");
    setIsVerifyingOtp(true);
    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: otp })
    });

    const data = (await response.json()) as { ok?: boolean; message?: string };
    if (!response.ok) {
      setMessage(data.message ?? "The code could not be verified.");
      setIsVerifyingOtp(false);
      return;
    }

    setSignupStep("details");
    setMessage("Email verified. Finish your account details below.");
    setIsVerifyingOtp(false);
  }

  function handleSignIn() {
    setMessage("");
    if (!email.trim() || !password.trim()) {
      setMessage("Please enter your email and password.");
      return;
    }

    const result = signInLocalAccount(email, password);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setProfile(result.profile);
    setEmail("");
    setPassword("");
    router.push(nextPath);
  }

  function handleCreateAccount() {
    setMessage("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setMessage("Please complete all account details.");
      return;
    }

    const result = registerLocalAccount({ name, email, password });
    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setProfile(result.profile);
    resetCreateAccountFlow();
    router.push(nextPath);
  }

  function handleSignOut() {
    signOutLocalAccount();
    setProfile(null);
    resetCreateAccountFlow();
  }

  return (
    <main className="section auth-center-page">
      <div className="shell auth-center-shell">
        {profile ? (
          <section className="glass-panel auth-card auth-card-centered">
            <span className="eyebrow">Signed in</span>
            <h1 className="auth-title">{profile.name}</h1>
            <p className="auth-subtext">{profile.email}</p>
            <p className="muted">Tracker ID: {profile.id}</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/dashboard">
                View progress
              </Link>
              <Link className="button button-secondary" href={nextPath}>
                Continue practice
              </Link>
              <button className="button button-secondary" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          </section>
        ) : (
          <section className="glass-panel auth-card auth-card-centered">
            <div className="auth-switch">
              <button
                className={`switch-pill ${authMode === "sign_in" ? "switch-pill-active" : ""}`}
                onClick={() => {
                  setAuthMode("sign_in");
                  resetCreateAccountFlow();
                }}
              >
                Sign in
              </button>
              <button
                className={`switch-pill ${authMode === "create_account" ? "switch-pill-active" : ""}`}
                onClick={() => {
                  setAuthMode("create_account");
                  resetCreateAccountFlow();
                }}
              >
                Create account
              </button>
            </div>

            {authMode === "sign_in" ? (
              <>
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtext">
                  {reason === "practice"
                    ? "Sign in to start practicing and keep every round in one place."
                    : "Sign in to continue your practice."}
                </p>

                <div className="auth-form-grid">
                  <div className="field-card">
                    <label className="label" htmlFor="account-email">
                      Email
                    </label>
                    <input
                      id="account-email"
                      className="input"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="name@example.com"
                      type="email"
                    />
                  </div>

                  <div className="field-card">
                    <label className="label" htmlFor="account-password">
                      Password
                    </label>
                    <input
                      id="account-password"
                      className="input"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      type="password"
                    />
                  </div>
                </div>

                {message ? <p className="auth-message">{message}</p> : null}

                <div className="auth-submit-row">
                  <button className="button button-primary" onClick={handleSignIn}>
                    Sign in
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 className="auth-title">Create your account</h1>
                <p className="auth-subtext">
                  {reason === "practice"
                    ? "Verify your email, finish your account, and then go straight into practice."
                    : "First verify your email, then finish your account details."}
                </p>

                {signupStep === "email" ? (
                  <div className="auth-form-grid">
                    <div className="field-card">
                      <label className="label" htmlFor="create-email">
                        Email
                      </label>
                      <input
                        id="create-email"
                        className="input"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="name@example.com"
                        type="email"
                      />
                    </div>
                    <div className="auth-submit-row">
                      <button className="button button-primary" onClick={requestOtp} disabled={isSendingOtp || sendOtpCooldown > 0}>
                        {isSendingOtp ? "Sending..." : sendOtpCooldown > 0 ? `Resend in ${sendOtpCooldown}s` : "Send code"}
                      </button>
                    </div>
                  </div>
                ) : null}

                {signupStep === "verify" ? (
                  <div className="auth-form-grid">
                    <div className="field-card">
                      <label className="label" htmlFor="otp-code">
                        Verification code
                      </label>
                      <input
                        id="otp-code"
                        className="input"
                        value={otp}
                        onChange={(event) => setOtp(event.target.value)}
                        placeholder="Enter the 6-digit code"
                        inputMode="numeric"
                      />
                      <p className="field-note">Enter the code sent to {email}.</p>
                    </div>
                    {devOtpPreview ? (
                      <p className="field-note">Local preview code: {devOtpPreview}</p>
                    ) : null}
                    <div className="auth-submit-row">
                      <button className="button button-primary" onClick={verifyEmailCode} disabled={isVerifyingOtp}>
                        {isVerifyingOtp ? "Verifying..." : "Verify email"}
                      </button>
                      <button className="button button-secondary" onClick={requestOtp} disabled={isSendingOtp || sendOtpCooldown > 0}>
                        {isSendingOtp ? "Sending..." : sendOtpCooldown > 0 ? `Resend in ${sendOtpCooldown}s` : "Resend code"}
                      </button>
                    </div>
                  </div>
                ) : null}

                {signupStep === "details" ? (
                  <div className="auth-form-grid">
                    <div className="field-card">
                      <label className="label" htmlFor="account-name">
                        Your name
                      </label>
                      <input
                        id="account-name"
                        className="input"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="field-card">
                      <label className="label" htmlFor="create-password">
                        Password
                      </label>
                      <input
                        id="create-password"
                        className="input"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Create a password"
                        type="password"
                      />
                    </div>
                    <div className="auth-submit-row">
                      <button className="button button-primary" onClick={handleCreateAccount}>
                        Create account
                      </button>
                    </div>
                  </div>
                ) : null}

                {message ? <p className="auth-message">{message}</p> : null}
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
