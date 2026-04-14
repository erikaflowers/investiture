import { useState, useEffect, useCallback } from "react";
import { PageLayout, Panel } from "zv-ui";

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/skills/list");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSkills(data.skills || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const active = skills.filter((s) => s.group === "active");
  const optional = skills.filter((s) => s.group === "optional");

  return (
    <PageLayout
      title="Skills"
      description="Investiture skills are Claude Code slash commands that read your doctrine and enforce your project's rules. Active skills are installed in .claude/skills/. Optional skills are available in .claude/skills-optional/."
    >
      <div className="zv-doctrine-toolbar" style={{ marginBottom: "16px" }}>
        <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          {loading ? "Scanning..." : `${active.length} active · ${optional.length} optional`}
        </span>
        <button
          type="button"
          className="zv-button"
          onClick={load}
          disabled={loading}
        >
          {loading ? "Scanning..." : "Refresh"}
        </button>
      </div>

      {error && <div className="zv-alert zv-alert-error">{error}</div>}

      {active.length > 0 && (
        <Panel title={`Active Skills (${active.length})`}>
          <div className="zv-skills-grid">
            {active.map((s) => (
              <div key={s.id} className="zv-skill-card">
                <div className="zv-skill-card-header">
                  <code className="zv-skill-card-name">/{s.id}</code>
                  {s.version && <span className="zv-skill-card-version">v{s.version}</span>}
                </div>
                <p className="zv-skill-card-desc">{s.description}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {optional.length > 0 && (
        <Panel title={`Optional Skills (${optional.length})`}>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "12px" }}>
            These skills are available but not active. Move them from <code>.claude/skills-optional/</code> to <code>.claude/skills/</code> to activate.
          </p>
          <div className="zv-skills-grid">
            {optional.map((s) => (
              <div key={s.id} className="zv-skill-card zv-skill-card-optional">
                <div className="zv-skill-card-header">
                  <code className="zv-skill-card-name">/{s.id}</code>
                  {s.version && <span className="zv-skill-card-version">v{s.version}</span>}
                </div>
                <p className="zv-skill-card-desc">{s.description}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel title="Impeccable.style Skills">
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
          Coming soon. This section will show the Impeccable design skills available in your repo.
        </p>
      </Panel>
    </PageLayout>
  );
}
