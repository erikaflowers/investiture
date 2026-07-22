import { useEffect, useState } from "react";
import { apiGet } from "../../zv/api.js";
import { staleness, relative, absolute } from "../../zv/time.js";
import { SystemLabel, StalenessSquare, EmptyState } from "../../zv/kit.jsx";

const RECENCY_CARDS = [
  { key: "lastAudit", label: "Last architecture audit" },
  { key: "lastStabilityPass", label: "Last stability pass" },
  { key: "lastContextCatchup", label: "Last context catchup" },
  { key: "lastSessionEnd", label: "Last agent session" },
];

const STATUS_ORDER = ["proposed", "queued", "in-progress", "done", "parked"];

export default function OverviewPage() {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiGet("/api/zv/state").then(setState).catch((e) => setError(e.message));
  }, []);

  if (error) return <EmptyState label="error">{error}</EmptyState>;
  if (!state) return null;

  const { project, recency, backlogCounts } = state;

  if (!project.onboarded) {
    return (
      <>
        <SystemLabel>project overview</SystemLabel>
        <h1 className="cp-page-title">Overview</h1>
        <EmptyState label="zero state">
          This is where you will view your project — its history, activity,
          and plans. Nothing is tracked yet because onboarding has not run.
          Onboarding arrives with the wizard; until then, this panel reads
          whatever the project writes.
        </EmptyState>
      </>
    );
  }

  return (
    <>
      <SystemLabel>project overview</SystemLabel>
      <h1 className="cp-page-title">{project.name}</h1>
      {project.description && (
        <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
          {project.description}
        </p>
      )}

      <SystemLabel>recency</SystemLabel>
      <div className="cp-card-grid">
        {RECENCY_CARDS.map(({ key, label }) => {
          const ts = recency[key];
          const level = staleness(ts);
          return (
            <div className="cp-card" key={key}>
              <SystemLabel>{label}</SystemLabel>
              <div className="cp-stat-value">
                <StalenessSquare level={level} />
                {relative(ts)}
              </div>
              <div className="cp-stat-detail">{absolute(ts)}</div>
            </div>
          );
        })}
      </div>

      <SystemLabel>backlog</SystemLabel>
      <div className="cp-card-grid">
        {STATUS_ORDER.map((s) => (
          <div className="cp-card" key={s}>
            <SystemLabel>{s}</SystemLabel>
            <div className="cp-stat-value">{backlogCounts[s] ?? 0}</div>
          </div>
        ))}
      </div>
    </>
  );
}
