import { useEffect, useState } from "react";
import { apiGet } from "../../zv/api.js";
import { absolute, relative } from "../../zv/time.js";
import { SystemLabel, EmptyState, Toast, useToast } from "../../zv/kit.jsx";
import { DOCTRINE_FILES, PRD_TEMPLATE } from "../../zv/editorMeta.js";

// Markdown editor for doctrine + PRD (ZV-CONTRACT.md §2, §3, §4.6).
// Doctrine saves snapshot first — the history rail makes that visible,
// and restore is always undoable (the API snapshots current before
// restoring). Concurrency is last-write-wins, stated in the docs.

export default function EditorPage() {
  const [selected, setSelected] = useState(null); // {kind:'doctrine'|'prd', name}
  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snapshots, setSnapshots] = useState([]);
  const { toast, showToast } = useToast();

  const isDoctrine = selected?.kind === "doctrine";

  async function open(kind, name) {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setSelected({ kind, name });
    setDirty(false);
    if (kind === "doctrine") {
      const d = await apiGet(`/api/zv/doctrine/${name}`);
      setContent(d.content);
      const h = await apiGet(`/api/zv/history?file=${name}`);
      setSnapshots(h.snapshots);
    } else {
      const d = await apiGet("/api/zv/prd");
      setContent(d.exists ? d.content : PRD_TEMPLATE);
      setSnapshots([]);
    }
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    try {
      const url = isDoctrine ? `/api/zv/doctrine/${selected.name}` : "/api/zv/prd";
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      setDirty(false);
      if (isDoctrine) {
        showToast(
          data.snapshot
            ? `Saved — prior version snapshotted (${data.snapshot})`
            : "Saved (first version — nothing to snapshot)"
        );
        const h = await apiGet(`/api/zv/history?file=${selected.name}`);
        setSnapshots(h.snapshots);
      } else {
        showToast("PRD saved");
      }
    } catch (e) {
      showToast(e.message, { error: true });
    } finally {
      setSaving(false);
    }
  }

  async function restore(snapId) {
    try {
      const res = await fetch("/api/zv/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: selected.name, snapshot: snapId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      const d = await apiGet(`/api/zv/doctrine/${selected.name}`);
      setContent(d.content);
      setDirty(false);
      const h = await apiGet(`/api/zv/history?file=${selected.name}`);
      setSnapshots(h.snapshots);
      showToast(`Restored ${snapId} — current was snapshotted first`);
    } catch (e) {
      showToast(e.message, { error: true });
    }
  }

  async function loadSnapshot(snapId) {
    try {
      const d = await apiGet(
        `/api/zv/history/content?file=${selected.name}&snapshot=${snapId}`
      );
      setContent(d.content);
      setDirty(true);
      showToast(`Loaded ${snapId} into the editor — save to apply`);
    } catch (e) {
      showToast(e.message, { error: true });
    }
  }

  useEffect(() => {
    const beforeUnload = (e) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  return (
    <>
      <SystemLabel>doctrine & prd editor</SystemLabel>
      <h1 className="cp-page-title">Editor</h1>

      <div className={`cp-editor${isDoctrine ? "" : " no-history"}`}>
        <div className="cp-file-list">
          <div className="cp-list-label">
            <SystemLabel>doctrine</SystemLabel>
          </div>
          {DOCTRINE_FILES.map((name) => (
            <button
              key={name}
              className={`cp-file-btn${
                isDoctrine && selected.name === name ? " is-active" : ""
              }`}
              onClick={() => open("doctrine", name)}
            >
              {name}
            </button>
          ))}
          <div className="cp-list-label" style={{ marginTop: "16px" }}>
            <SystemLabel>plans</SystemLabel>
          </div>
          <button
            className={`cp-file-btn${selected?.kind === "prd" ? " is-active" : ""}`}
            onClick={() => open("prd", "PRD.md")}
          >
            PRD.md
          </button>
        </div>

        {selected ? (
          <div className="cp-editor-main">
            <div className="cp-editor-toolbar">
              <button className="cp-btn" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
              <span className="cp-editor-status">
                {selected.name}
                {dirty ? " — unsaved changes" : ""}
                {isDoctrine ? " · snapshot-on-save · last write wins" : " · last write wins"}
              </span>
            </div>
            <textarea
              className="cp-textarea"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setDirty(true);
              }}
              spellCheck={false}
            />
          </div>
        ) : (
          <EmptyState label="select a file">
            Doctrine files snapshot to .zv-history/ on every save, with
            one-click restore. The PRD validates its required sections on
            save. A bad save to CLAUDE.md degrades every future agent
            session — that is why the history rail exists.
          </EmptyState>
        )}

        {isDoctrine && selected && (
          <div className="cp-history">
            <div className="cp-list-label">
              <SystemLabel>history ({snapshots.length})</SystemLabel>
            </div>
            {snapshots.length === 0 && (
              <div className="cp-snap-row">no snapshots yet — first save creates one</div>
            )}
            {snapshots.map((s) => (
              <div className="cp-snap-row" key={s.id} title={absolute(s.ts)}>
                <span>{relative(s.ts)}</span>
                <span className="cp-snap-actions">
                  <button className="cp-btn-mini" onClick={() => loadSnapshot(s.id)}>
                    load
                  </button>
                  <button className="cp-btn-mini" onClick={() => restore(s.id)}>
                    restore
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Toast toast={toast} />
    </>
  );
}
