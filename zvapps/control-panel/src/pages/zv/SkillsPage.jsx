import { useEffect, useState } from "react";
import { apiGet } from "../../zv/api.js";
import { staleness, relative } from "../../zv/time.js";
import { SystemLabel, StalenessSquare, EmptyState } from "../../zv/kit.jsx";

export default function SkillsPage() {
  const [skills, setSkills] = useState(null);
  const [lastUsed, setLastUsed] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      apiGet("/api/skills/list"),
      apiGet("/api/zv/telemetry?type=skill-invoked&limit=1000"),
    ])
      .then(([skillsData, telemetryData]) => {
        setSkills(skillsData.skills);
        // Events arrive newest first — first hit per skill wins.
        const used = {};
        for (const e of telemetryData.events) {
          const name = e.payload?.skill;
          if (name && !(name in used)) used[name] = e.ts;
        }
        setLastUsed(used);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <EmptyState label="error">{error}</EmptyState>;
  if (!skills) return null;

  return (
    <>
      <SystemLabel>skills inventory</SystemLabel>
      <h1 className="cp-page-title">Skills</h1>

      {skills.length === 0 ? (
        <EmptyState label="no skills">
          No skills found under .claude/skills/ or .claude/skills-optional/.
        </EmptyState>
      ) : (
        <table className="cp-table">
          <thead>
            <tr>
              <th>Skill</th>
              <th>Group</th>
              <th>Last used</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((s) => {
              const ts = lastUsed[s.id] ?? lastUsed[s.name] ?? null;
              return (
                <tr key={`${s.group}/${s.id}`}>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{s.name}</td>
                  <td>
                    <span className="cp-syslabel">{s.group}</span>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <StalenessSquare level={staleness(ts)} />
                    {relative(ts)}
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{s.description}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
