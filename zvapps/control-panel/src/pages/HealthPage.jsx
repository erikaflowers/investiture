import { Panel } from "zv-ui";

export default function HealthPage() {
  return (
    <Panel title="Repo Health">
      <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
        Check that your Investiture project has all required files, that doctrine is filled out (not still template placeholders), and that skills are properly installed.
      </p>
      <div className="zv-dashboard-section" style={{ marginTop: "16px" }}>
        <h4 className="zv-dashboard-subhead">Checks (coming soon)</h4>
        <ul className="zv-dashboard-list">
          <li>File presence — VECTOR.md, ARCHITECTURE.md, CLAUDE.md, /vector/ subdirectories</li>
          <li>Content completeness — are the key sections of VECTOR.md filled in?</li>
          <li>Skill inventory — are all expected skills installed in .claude/skills/?</li>
        </ul>
      </div>
    </Panel>
  );
}
