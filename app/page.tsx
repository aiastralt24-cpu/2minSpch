import Link from "next/link";

export default function HomePage() {
  return (
    <main className="hero-shell">
      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <strong>CARE Speak AI</strong> Multi-Framework Coach
          </div>
          <nav className="nav-links">
            <Link href="/sign-in?next=%2Fpractice&reason=practice">Practice</Link>
            <Link href="/dashboard">Progress</Link>
          </nav>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">A speaking coach for real situations</span>
            <h1>Find the right structure, then say it clearly.</h1>
            <p>Practice answers for interviews, opinions, and everyday speaking without overthinking how to begin.</p>
            <div className="hero-notes">
              <span>Interview stories</span>
              <span>Opinion answers</span>
              <span>Everyday speaking</span>
            </div>
            <div className="hero-actions">
              <Link href="/sign-in?next=%2Fpractice&reason=practice" className="button button-primary">
                Start practice
              </Link>
              <Link href="/sign-in" className="button button-secondary">
                Save progress
              </Link>
            </div>
            <p className="hero-caption">Most rounds take about two minutes from prompt to feedback.</p>
          </div>

          <aside className="poster">
            <div className="poster-band">
              <strong>Your speaking guide</strong>
              <span>Prompt, structure, answer, feedback</span>
            </div>
            <div className="poster-grid">
              <div className="hero-panel">
                <strong>General prompts</strong>
                <p className="muted">Use CARE when you want a calm, well-reasoned answer.</p>
              </div>
              <div className="hero-panel">
                <strong>Opinion prompts</strong>
                <p className="muted">Use PREP when you need a clear point of view and a strong example.</p>
              </div>
              <div className="hero-panel">
                <strong>Interview prompts</strong>
                <p className="muted">Use STAR when you need to tell a focused story with an outcome.</p>
              </div>
              <div className="hero-panel">
                <strong>After each round</strong>
                <p className="muted">See your score, the parts you missed, and a cleaner version of the answer.</p>
              </div>
            </div>
          </aside>
        </section>
      </div>

      <section className="section">
        <div className="shell">
          <h2>Simple enough to use daily.</h2>
          <p className="section-copy">
            The experience should stay calm from start to finish: one prompt, one answer, one next step.
          </p>
          <div className="grid-3">
            <div className="glass-panel metric-card">
              <span className="eyebrow">Before you speak</span>
              <h3>Know how to answer</h3>
              <p className="muted">Each prompt comes with a simple structure so you are never staring at a blank screen.</p>
            </div>
            <div className="glass-panel metric-card">
              <span className="eyebrow">While you speak</span>
              <h3>Stay focused</h3>
              <p className="muted">The speaking screen keeps attention on the prompt, the timer, and your answer.</p>
            </div>
            <div className="glass-panel metric-card">
              <span className="eyebrow">After you finish</span>
              <h3>Improve one thing at a time</h3>
              <p className="muted">Feedback points to the weakest part first, instead of burying you in analysis.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
