"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getAuthenticatedProfile,
  registerAccount,
  requestPasswordReset,
  signInAccount,
  signOutAccount,
  updateAccountPassword
} from "@/lib/client/progress-store";
import { LocalUserProfile } from "@/lib/types";

type AuthMode = "sign_in" | "create_account" | "forgot_password" | "update_password";

export default function SignInPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/dashboard");
  const [reason, setReason] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("sign_in");
  const [profile, setProfile] = useState<LocalUserProfile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getAuthenticatedProfile().then(setProfile);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    setNextPath(params.get("next") || "/dashboard");
    setReason(params.get("reason") || "");

    if (window.location.hash.includes("type=recovery") || params.get("type") === "recovery") {
      setAuthMode("update_password");
      setMessage("Enter a new password for your account.");
    }
  }, []);

  function resetCreateAccountFlow() {
    setName("");
    setEmail("");
    setPassword("");
    setNewPassword("");
    setMessage("");
    setIsSubmitting(false);
  }

  async function handleSignIn() {
    setMessage("");
    if (!email.trim() || !password.trim()) {
      setMessage("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    const result = await signInAccount(email, password);
    if (!result.ok) {
      setMessage(result.message);
      setIsSubmitting(false);
      return;
    }

    setProfile(result.profile);
    setEmail("");
    setPassword("");
    setIsSubmitting(false);
    router.push(nextPath);
  }

  async function handleCreateAccount() {
    setMessage("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setMessage("Please complete all account details.");
      return;
    }

    setIsSubmitting(true);
    const result = await registerAccount({ name, email, password });
    if (!result.ok) {
      setMessage(result.message);
      setIsSubmitting(false);
      return;
    }

    if ("needsEmailConfirmation" in result && result.needsEmailConfirmation) {
      setIsSubmitting(false);
      setMessage("Account created. Please confirm your email before signing in.");
      setAuthMode("sign_in");
      setPassword("");
      return;
    }

    setProfile(result.profile);
    resetCreateAccountFlow();
    setIsSubmitting(false);
    router.push(nextPath);
  }

  async function handlePasswordResetRequest() {
    setMessage("");
    if (!email.trim()) {
      setMessage("Enter your email first.");
      return;
    }

    setIsSubmitting(true);
    const result = await requestPasswordReset(email);
    setMessage(result.message);
    setIsSubmitting(false);
  }

  async function handleUpdatePassword() {
    setMessage("");
    if (!newPassword.trim()) {
      setMessage("Enter your new password.");
      return;
    }

    setIsSubmitting(true);
    const result = await updateAccountPassword(newPassword);
    setMessage(result.message);
    setIsSubmitting(false);

    if (result.ok) {
      setPassword("");
      setNewPassword("");
      setAuthMode("sign_in");
    }
  }

  async function handleSignOut() {
    await signOutAccount();
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
            <p className="muted">Account ID: {profile.id}</p>
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
                  <button className="button button-primary" onClick={handleSignIn} disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </button>
                  <button
                    className="link-button"
                    type="button"
                    onClick={() => {
                      setAuthMode("forgot_password");
                      setMessage("");
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              </>
            ) : authMode === "create_account" ? (
              <>
                <h1 className="auth-title">Create your account</h1>
                <p className="auth-subtext">
                  {reason === "practice"
                    ? "Create an account once, then every practice round stays attached to you."
                    : "Create an account to save your speaking progress."}
                </p>

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
                    <button className="button button-primary" onClick={handleCreateAccount} disabled={isSubmitting}>
                      {isSubmitting ? "Creating account..." : "Create account"}
                    </button>
                  </div>
                </div>

                {message ? <p className="auth-message">{message}</p> : null}
              </>
            ) : authMode === "forgot_password" ? (
              <>
                <h1 className="auth-title">Reset password</h1>
                <p className="auth-subtext">Enter your email and we’ll send a reset link.</p>

                <div className="auth-form-grid">
                  <div className="field-card">
                    <label className="label" htmlFor="reset-email">
                      Email
                    </label>
                    <input
                      id="reset-email"
                      className="input"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="name@example.com"
                      type="email"
                    />
                  </div>
                  <div className="auth-submit-row">
                    <button className="button button-primary" onClick={handlePasswordResetRequest} disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send reset link"}
                    </button>
                    <button className="button button-secondary" type="button" onClick={() => setAuthMode("sign_in")}>
                      Back to sign in
                    </button>
                  </div>
                </div>

                {message ? <p className="auth-message">{message}</p> : null}
              </>
            ) : (
              <>
                <h1 className="auth-title">Set new password</h1>
                <p className="auth-subtext">Choose a new password for your account.</p>

                <div className="auth-form-grid">
                  <div className="field-card">
                    <label className="label" htmlFor="new-password">
                      New password
                    </label>
                    <input
                      id="new-password"
                      className="input"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="Enter a new password"
                      type="password"
                    />
                  </div>
                  <div className="auth-submit-row">
                    <button className="button button-primary" onClick={handleUpdatePassword} disabled={isSubmitting}>
                      {isSubmitting ? "Updating..." : "Update password"}
                    </button>
                  </div>
                </div>

                {message ? <p className="auth-message">{message}</p> : null}
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
