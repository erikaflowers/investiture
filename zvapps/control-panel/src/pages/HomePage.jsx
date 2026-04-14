import { useState, useEffect, useCallback } from "react";
import { Panel } from "zv-ui";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(iso) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function freshnessColor(iso) {
  if (!iso) return "var(--error)";
  const days = (Date.now() - new Date(iso).getTime()) / 86400000;
  if (days < 7) return "var(--success)";
  if (days < 30) return "var(--warning)";
  return "var(--error)";
}

function freshnessLabel(iso) {
  if (!iso) return "Never run";
  return timeAgo(iso);
}

const CORE_SKILLS = [
  "invest-preflight",
  "invest-manifest",
  "invest-backfill",
  "invest-doctrine",
  "invest-architecture",
  "invest-repo-audit",
  "invest-remediate",
  "invest-verify-remediation",
];

export default function HomePage() {
  const [repo, setRepo] = useState(null);
  const [git, setGit] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [repoRes, gitRes, trackRes] = await Promise.all([
      fetch("/api/home/repo-scan").then((r) => r.json()).catch(() => null),
      fetch("/api/home/git-status").then((r) => r.json()).catch(() => null),
      fetch("/api/home/skill-tracking").then((r) => r.json()).catch(() => null),
    ]);
    setRepo(repoRes);
    setGit(gitRes);
    setTracking(trackRes);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div>
        <h2 className="zv-page-title">Welcome to your Investiture control panel.</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "12px" }}>Scanning repository...</p>
      </div>
    );
  }

  return (
    <div>
      <header style={{ marginBottom: "24px" }}>
        <h2 className="zv-page-title">Welcome to your Investiture control panel.</h2>
        <p className="zv-page-description">
          Investiture sits as a meta-layer on top of your project. Your project runs from the repository root — this panel helps you maintain doctrine, track skills, and browse your Zero Vector artifacts.
        </p>
      </header>

      <div className="zv-home-grid">
        {/* Repository overview */}
        {repo && (
          <Panel title={repo.repoName || "Repository"}>
            <div className="zv-home-stat-row">
              <div className="zv-home-stat">
                <span className="zv-home-stat-value">{repo.files}</span>
                <span className="zv-home-stat-label">files</span>
              </div>
              <div className="zv-home-stat">
                <span className="zv-home-stat-value">{repo.dirs}</span>
                <span className="zv-home-stat-label">directories</span>
              </div>
              <div className="zv-home-stat">
                <span className="zv-home-stat-value">{formatBytes(repo.totalBytes)}</span>
                <span className="zv-home-stat-label">total</span>
              </div>
            </div>

            {repo.topExtensions?.length > 0 && (
              <div className="zv-home-ext-bar">
                {repo.topExtensions.map(([ext, count]) => (
                  <div key={ext} className="zv-home-ext-item" title={`${ext}: ${count} files`}>
                    <code>{ext}</code>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        )}

        {/* Git status */}
        {git && (
          <Panel title="Git Status">
            <div className="zv-home-git-header">
              <span className="zv-home-git-branch">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 01-9 9" />
                </svg>
                {git.branch}
              </span>
              {git.dirty ? (
                <span className="zv-home-git-badge zv-home-git-dirty">{git.changedFiles} changed</span>
              ) : (
                <span className="zv-home-git-badge zv-home-git-clean">clean</span>
              )}
              {git.ahead > 0 && <span className="zv-home-git-badge">{git.ahead} ahead</span>}
              {git.behind > 0 && <span className="zv-home-git-badge">{git.behind} behind</span>}
            </div>

            {git.statusLines?.length > 0 && (
              <div className="zv-home-git-status">
                {git.statusLines.map((line, i) => (
                  <div key={i} className="zv-home-git-line">
                    <code>{line}</code>
                  </div>
                ))}
              </div>
            )}

            {git.recentCommits?.length > 0 && (
              <div className="zv-home-git-log">
                <div className="zv-dashboard-subhead" style={{ marginTop: "12px" }}>Recent commits</div>
                {git.recentCommits.map((line, i) => (
                  <div key={i} className="zv-home-git-line">
                    <code>{line}</code>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        )}

        {/* CLAUDE.md summary */}
        {repo?.claudeSummary && (
          <Panel title="CLAUDE.md">
            <pre className="zv-code" style={{ fontSize: "11px", maxHeight: "200px", overflow: "auto" }}>{repo.claudeSummary}</pre>
          </Panel>
        )}

        {/* Key files */}
        {repo?.keyFiles && (
          <Panel title="Key Files">
            <div className="zv-home-key-files">
              {Object.entries(repo.keyFiles).map(([file, exists]) => (
                <div key={file} className="zv-home-key-file">
                  <span className="zv-status-dot" style={{ background: exists ? "var(--success)" : "var(--error)" }} />
                  <code>{file}</code>
                  <span style={{ color: exists ? "var(--success)" : "var(--text-muted)", fontSize: "11px" }}>
                    {exists ? "present" : "missing"}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {/* Skill freshness */}
        <Panel title="Skill Activity">
          <p style={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: "12px" }}>
            Tracks when each core skill was last run. Data stored in <code>zvapps/control-panel/data/skill-tracking.json</code>.
          </p>
          <div className="zv-home-skill-tracker">
            {CORE_SKILLS.map((id) => {
              const lastRun = tracking?.skills?.[id]?.lastRun || null;
              return (
                <div key={id} className="zv-home-skill-row">
                  <span className="zv-status-dot" style={{ background: freshnessColor(lastRun) }} />
                  <code className="zv-home-skill-name">/{id}</code>
                  <span className="zv-home-skill-time" style={{ color: freshnessColor(lastRun) }}>
                    {freshnessLabel(lastRun)}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}
