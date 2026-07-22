import { useEffect, useState } from "react";
import { useProject } from "../zv/useProject.jsx";
import { SystemLabel } from "../zv/kit.jsx";

// The onboarding wizard — a thin client over POST /api/zv/onboarding,
// which is the proof-run of the whole write layer (ZV-CONTRACT.md §6.4).
// Re-running is safe by contract: it can rename the project, it can
// never destroy a PRD, backlog, or history.

export default function OnboardingWizard({ open, onClose }) {
  const { project, onboarded, refresh } = useProject();
  const [form, setForm] = useState({ name: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null); // {written}

  useEffect(() => {
    if (open) {
      setForm({
        name: project?.name ?? "",
        description: project?.description ?? "",
      });
      setDone(null);
      setError(null);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/zv/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      await refresh();
      window.dispatchEvent(new Event("zv:project-changed"));
      setDone(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <form className="cp-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <SystemLabel>{onboarded ? "project setup (re-run)" : "welcome"}</SystemLabel>
        <div className="cp-modal-title">
          {onboarded ? "Update your project" : "Name your project"}
        </div>

        {done ? (
          <>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Done. {done.written.length > 0 ? `Wrote ${done.written.join(", ")}.` : "Nothing needed writing."}{" "}
              The panel is now tracking <strong>{form.name}</strong> — the PRD
              and backlog are yours to fill from here.
            </p>
            <div className="cp-modal-actions">
              <button type="button" className="cp-btn is-active" onClick={onClose}>
                Open the panel
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "16px" }}>
              {onboarded
                ? "Rename or re-describe the project. Existing PRD, backlog, and history are never touched."
                : "Two questions. This seeds your PRD, creates an empty backlog, and puts your name on the panel."}
            </p>

            <div className="cp-field">
              <label className="cp-field-label">
                <SystemLabel>project name</SystemLabel>
              </label>
              <input
                className="cp-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoFocus
                required
              />
            </div>

            <div className="cp-field">
              <label className="cp-field-label">
                <SystemLabel>what are you building? (one line)</SystemLabel>
              </label>
              <input
                className="cp-input"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
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
              <button
                type="submit"
                className="cp-btn is-active"
                disabled={busy || !form.name.trim()}
              >
                {busy ? "Writing…" : onboarded ? "Update" : "Create"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
