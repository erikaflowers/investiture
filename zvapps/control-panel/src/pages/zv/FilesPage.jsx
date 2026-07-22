import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { apiGet } from "../../zv/api.js";
import { relative } from "../../zv/time.js";
import { SystemLabel, EmptyState } from "../../zv/kit.jsx";

// Read-only markdown browser over the two territories the API exposes:
// doctrine files, the PRD, and backlog items. Editing arrives in M4.

export default function FilesPage() {
  const [doctrine, setDoctrine] = useState([]);
  const [backlog, setBacklog] = useState([]);
  const [prdExists, setPrdExists] = useState(false);
  const [selected, setSelected] = useState(null); // {kind, id, label}
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      apiGet("/api/zv/doctrine"),
      apiGet("/api/zv/backlog"),
      apiGet("/api/zv/prd"),
    ])
      .then(([d, b, p]) => {
        setDoctrine(d.files);
        setBacklog(b.items.filter((it) => !it.invalid));
        setPrdExists(p.exists);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setContent("");
    const load = async () => {
      if (selected.kind === "doctrine") {
        const d = await apiGet(`/api/zv/doctrine/${selected.id}`);
        return d.exists ? d.content : "_This file does not exist yet._";
      }
      if (selected.kind === "prd") {
        const d = await apiGet("/api/zv/prd");
        return d.exists ? d.content : "_No PRD yet. Onboarding seeds one._";
      }
      const d = await apiGet(`/api/zv/backlog/${selected.id}`);
      return `# ${d.title}\n\n\`${d.id}\` · ${d.status} · ${d.priority} · by ${d["created-by"]}\n\n${d.body ?? ""}`;
    };
    load().then(setContent).catch((e) => setError(e.message));
  }, [selected]);

  if (error) return <EmptyState label="error">{error}</EmptyState>;

  return (
    <>
      <SystemLabel>markdown browser</SystemLabel>
      <h1 className="cp-page-title">Files</h1>

      <div className="cp-files">
        <div className="cp-file-list">
          <div className="cp-nav-group-label">
            <SystemLabel>doctrine</SystemLabel>
          </div>
          {doctrine.map((f) => (
            <button
              key={f.name}
              className={`cp-file-btn${selected?.id === f.name ? " is-active" : ""}`}
              onClick={() => setSelected({ kind: "doctrine", id: f.name })}
            >
              {f.name}{" "}
              <span className="cp-file-meta">
                {f.exists ? relative(f.mtime) : "missing"}
              </span>
            </button>
          ))}

          <div className="cp-nav-group-label" style={{ marginTop: "var(--space-4)" }}>
            <SystemLabel>plans</SystemLabel>
          </div>
          <button
            className={`cp-file-btn${selected?.kind === "prd" ? " is-active" : ""}`}
            onClick={() => setSelected({ kind: "prd", id: "PRD" })}
          >
            PRD.md{" "}
            <span className="cp-file-meta">{prdExists ? "" : "not seeded"}</span>
          </button>

          {backlog.length > 0 && (
            <div className="cp-nav-group-label" style={{ marginTop: "var(--space-4)" }}>
              <SystemLabel>backlog</SystemLabel>
            </div>
          )}
          {backlog.map((it) => (
            <button
              key={it.id}
              className={`cp-file-btn${selected?.id === it.id ? " is-active" : ""}`}
              onClick={() => setSelected({ kind: "backlog", id: it.id })}
            >
              {it.id} <span className="cp-file-meta">{it.status}</span>
            </button>
          ))}
        </div>

        {selected ? (
          <div className="cp-md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        ) : (
          <EmptyState label="select a file">
            Doctrine, the PRD, and backlog items — everything the agents
            follow and everything the human plans, rendered from markdown.
          </EmptyState>
        )}
      </div>
    </>
  );
}
