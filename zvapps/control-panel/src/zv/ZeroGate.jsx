import { useProject } from "./useProject.jsx";
import { SystemLabel } from "./kit.jsx";

// Before onboarding, every sidecar page explains what it will be
// instead of showing an empty view (ZV-CONTRACT.md §6.2).

const EXPLAINERS = {
  overview:
    "This is where you will view your project — its recency, its backlog, its pulse. Run setup to give it a name.",
  activity:
    "This will be your project's session feed: agent sessions, skill runs, file updates — every telemetry event, newest first.",
  board:
    "This will be your backlog as a kanban board. Each card is a markdown file in zvapps/backlog/; the board is just a view of their front-matter.",
  editor:
    "This is where you will edit doctrine and the PRD. Doctrine files snapshot on every save, with one-click restore.",
  files:
    "This will be your project's reading room — doctrine, the PRD, and backlog items rendered from markdown.",
};

export default function ZeroGate({ page, onSetup, children }) {
  const { onboarded, loading, error } = useProject();

  if (loading) return null;
  if (onboarded || error) return children;

  return (
    <div className="cp-empty">
      <SystemLabel>before onboarding</SystemLabel>
      <p>{EXPLAINERS[page]}</p>
      <p style={{ marginTop: "20px" }}>
        <button className="cp-btn is-active" onClick={onSetup}>
          Set up your project
        </button>
      </p>
    </div>
  );
}
