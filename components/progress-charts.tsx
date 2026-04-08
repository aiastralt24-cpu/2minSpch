import { ProgressSummary } from "@/lib/types";

export function ProgressCharts({ summary }: { summary: ProgressSummary }) {
  return (
    <div className="grid-2">
      <section className="glass-panel">
        <span className="eyebrow">By framework</span>
        <div className="chart">
          {summary.frameworkAverages.length > 0 ? (
            summary.frameworkAverages.map((framework) => (
              <div key={framework.framework} className="chart-row">
                <div className="score-header">
                  <strong>{framework.framework}</strong>
                  <span>
                    {framework.averageScore}/10
                  </span>
                </div>
                <div className="chart-track">
                  <span style={{ width: `${framework.averageScore * 10}%` }} />
                </div>
                <p className="muted">{framework.attempts} practice {framework.attempts === 1 ? "round" : "rounds"}</p>
              </div>
            ))
          ) : (
            <div className="empty-state">Take one practice round and your framework scores will appear here.</div>
          )}
        </div>
      </section>

      <section className="glass-panel">
        <span className="eyebrow">Focus areas</span>
        <div className="chart">
          {summary.weakestComponents.length > 0 ? (
            summary.weakestComponents.map((item) => (
              <div key={`${item.framework}-${item.component}`} className="chart-row">
                <div className="score-header">
                  <strong>
                    {item.framework} · {item.component}
                  </strong>
                  <span>{item.averageScore}/10</span>
                </div>
                <div className="chart-track">
                  <span style={{ width: `${item.averageScore * 10}%` }} />
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">After a few answers, this section will show where to focus next.</div>
          )}
        </div>
      </section>
    </div>
  );
}
