import { useEffect, useState } from "react";
import { apiGet } from "../../zv/api.js";
import { absolute } from "../../zv/time.js";
import { SystemLabel, ActorChip, EmptyState } from "../../zv/kit.jsx";

const TYPES = [
  "all",
  "session-start",
  "session-end",
  "skill-invoked",
  "file-updated",
  "audit-run",
  "context-catchup-written",
];

function describe(e) {
  const p = e.payload ?? {};
  switch (e.event) {
    case "session-start":
      return `Session started${p.agent ? ` (${p.agent})` : ""}`;
    case "session-end":
      return p.summary || "Session ended";
    case "skill-invoked":
      return `Ran ${p.skill ?? "a skill"}`;
    case "file-updated":
      return `Updated ${p.file ?? "a file"}${p.snapshot ? ` (snapshot ${p.snapshot})` : ""}`;
    case "audit-run":
      return `Audit ${p.skill ?? ""} — ${p.result ?? "unknown"}`;
    case "context-catchup-written":
      return "Context catchup written";
    default:
      return e.event;
  }
}

export default function ActivityPage() {
  const [events, setEvents] = useState(null);
  const [type, setType] = useState("all");
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = type === "all" ? "" : `&type=${type}`;
    apiGet(`/api/zv/telemetry?limit=200${q}`)
      .then((d) => setEvents(d.events))
      .catch((e) => setError(e.message));
  }, [type]);

  return (
    <>
      <SystemLabel>session activity</SystemLabel>
      <h1 className="cp-page-title">Activity</h1>

      <div className="cp-btn-row">
        {TYPES.map((t) => (
          <button
            key={t}
            className={`cp-btn${type === t ? " is-active" : ""}`}
            onClick={() => setType(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {error && <EmptyState label="error">{error}</EmptyState>}
      {events && events.length === 0 && (
        <EmptyState label="no events">
          The telemetry log is empty. Agent sessions, skill runs, and file
          updates will appear here as they happen.
        </EmptyState>
      )}
      {events && events.length > 0 && (
        <div className="cp-feed">
          {events.map((e, i) => (
            <div className="cp-feed-row" key={i}>
              <span className="cp-feed-ts">{absolute(e.ts)}</span>
              <span>
                <ActorChip actor={e.actor} />
              </span>
              <span className="cp-feed-detail">{describe(e)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
