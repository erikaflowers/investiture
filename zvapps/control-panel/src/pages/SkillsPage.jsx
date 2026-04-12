import { Panel } from "zv-ui";

const INVESTITURE_SKILLS = [
  { name: "invest-backfill", group: "Foundation", desc: "Survey existing codebase, generate doctrine files" },
  { name: "invest-doctrine", group: "Foundation", desc: "Audit doctrine for completeness and consistency" },
  { name: "invest-architecture", group: "Foundation", desc: "Audit codebase against ARCHITECTURE.md" },
  { name: "invest-validate", group: "Research", desc: "Prioritize assumptions by risk, plan validation sprints" },
  { name: "invest-interview", group: "Research", desc: "Generate structured user research discussion guides" },
  { name: "invest-synthesize", group: "Research", desc: "Take raw research, propose doctrine patches" },
  { name: "invest-brief", group: "Design", desc: "Generate a design brief from personas + doctrine" },
  { name: "invest-adr", group: "Design", desc: "Capture architecture decision records" },
  { name: "invest-crew", group: "Fleet", desc: "Decompose a feature into scoped agent tasks" },
  { name: "invest-handoff", group: "Fleet", desc: "Role-specific onboarding docs" },
  { name: "invest-changelog", group: "Fleet", desc: "User-facing release notes from git log" },
];

const groups = [...new Set(INVESTITURE_SKILLS.map((s) => s.group))];

export default function SkillsPage() {
  return (
    <div>
      <Panel title="Investiture Skills">
        <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
          {INVESTITURE_SKILLS.length} skills installed. Run any skill from Claude Code with <code>/skill-name</code>.
        </p>
        {groups.map((group) => (
          <div key={group} className="zv-dashboard-section">
            <h4 className="zv-dashboard-subhead">{group}</h4>
            <ul className="zv-dashboard-list">
              {INVESTITURE_SKILLS.filter((s) => s.group === group).map((s) => (
                <li key={s.name}>
                  <strong><code>/{s.name}</code></strong> — {s.desc}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Panel>

      <Panel title="Impeccable.style Skills">
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
          Coming soon. This section will show the Impeccable design skills available in your repo.
        </p>
      </Panel>
    </div>
  );
}
