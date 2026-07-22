import { useState } from "react";
import { SystemLabel } from "../zv/kit.jsx";

// "Add to backlog" quick capture — reachable from the top nav on every
// page. Creates a markdown file via POST /api/zv/backlog (created-by:
// human — this is the human's entry point; agents write through the
// API themselves).

const EMPTY = { title: "", body: "", priority: "p2", owner: "" };

export default function QuickCapture({ open, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/zv/backlog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          body: form.body,
          priority: form.priority,
          owner: form.owner.trim() || undefined,
          createdBy: "human",
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      window.dispatchEvent(new Event("zv:backlog-changed"));
      setForm(EMPTY);
      onCreated?.(data.id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <form
        className="cp-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <SystemLabel>quick capture</SystemLabel>
        <div className="cp-modal-title">Add to backlog</div>

        <div className="cp-field">
          <label className="cp-field-label">
            <SystemLabel>title</SystemLabel>
          </label>
          <input
            className="cp-input"
            value={form.title}
            onChange={set("title")}
            autoFocus
            required
          />
        </div>

        <div className="cp-field">
          <label className="cp-field-label">
            <SystemLabel>notes (markdown, optional)</SystemLabel>
          </label>
          <textarea className="cp-textarea-sm" value={form.body} onChange={set("body")} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div className="cp-field">
            <label className="cp-field-label">
              <SystemLabel>priority</SystemLabel>
            </label>
            <select className="cp-select" value={form.priority} onChange={set("priority")}>
              <option value="p0">p0 — now</option>
              <option value="p1">p1 — next</option>
              <option value="p2">p2 — soon</option>
              <option value="p3">p3 — someday</option>
            </select>
          </div>
          <div className="cp-field">
            <label className="cp-field-label">
              <SystemLabel>owner (optional)</SystemLabel>
            </label>
            <input className="cp-input" value={form.owner} onChange={set("owner")} />
          </div>
        </div>

        {error && (
          <div className="cp-editor-status" style={{ color: "var(--error)" }}>
            {error}
          </div>
        )}

        <div className="cp-modal-actions">
          <button type="button" className="cp-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="cp-btn is-active" disabled={busy || !form.title.trim()}>
            {busy ? "Adding…" : "Add item"}
          </button>
        </div>
      </form>
    </div>
  );
}
