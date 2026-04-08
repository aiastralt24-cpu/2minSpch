import { FrameworkDefinition } from "@/lib/types";

export function FrameworkCard({ framework }: { framework: FrameworkDefinition }) {
  return (
    <section className="glass-panel">
      <span className="eyebrow">Use this structure</span>
      <h3>{framework.name}</h3>
      <p className="muted">{framework.summary}</p>
      <div className="stack">
        {framework.components.map((component, index) => (
          <div key={component.key} className="practice-card panel">
            <div className="score-header">
              <strong>
                {index + 1}. {component.label}
              </strong>
            </div>
            <p className="muted">{component.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
