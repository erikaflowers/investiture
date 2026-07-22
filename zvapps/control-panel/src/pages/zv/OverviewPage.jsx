import { useProject } from "../../zv/useProject.jsx";
import { staleness, relative, absolute } from "../../zv/time.js";
import { SystemLabel, StalenessSquare, EmptyState } from "../../zv/kit.jsx";

// Zero state is handled by ZeroGate in App — by the time this renders,
// the project is onboarded (or state failed to load, which shows here).

const RECENCY_CARDS = [
  { key: "lastAudit", label: "Last architecture audit" },
  { key: "lastStabilityPass", label: "Last stability pass" },
  { key: "lastContextCatchup", label: "Last context catchup" },
  { key: "lastSessionEnd", label: "Last agent session" },
];

const STATUS_ORDER = ["proposed", "queued", "in-progress", "done", "parked"];

export default function OverviewPage() {
  const { project, recency, backlogCounts, loading, error } = useProject();

  if (error) return <EmptyState label="error">{error}</EmptyState>;
  if (loading || !project) return null;

  return (
    <>
      <SystemLabel>project overview</SystemLabel>
      <h1 className="cp-page-title">{project.name}</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
        {project.description}{" "}
        <button
          className="cp-btn-mini"
          style={{ marginLeft: "8px" }}
          onClick={() => window.dispatchEvent(new Event("zv:open-wizard"))}
        >
          edit
        </button>
      </p>

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
