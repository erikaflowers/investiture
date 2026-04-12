import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PageLayout } from "zv-ui";

const DOCTRINE_FILES = [
  { id: "VECTOR.md", label: "VECTOR.md" },
  { id: "ARCHITECTURE.md", label: "ARCHITECTURE.md" },
  { id: "CLAUDE.md", label: "CLAUDE.md" },
];

function DoctrineEditor({ file }) {
  const [content, setContent] = useState("");
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/doctrine/read?file=${encodeURIComponent(file)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setContent(data.content);
      setDraft(data.content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [file]);

  useEffect(() => {
    load();
    setEditing(false);
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/doctrine/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file, content: draft }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setContent(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(content);
    setEditing(false);
  };

  const dirty = draft !== content;

  return (
    <div className="zv-doctrine-wrapper">
      <div className="zv-doctrine-toolbar">
        <div className="zv-doctrine-filename">{file}</div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span className={`zv-doctrine-status${saved ? " visible" : ""}`}>Saved</span>
          {editing ? (
            <>
              <button type="button" className="zv-button" onClick={handleCancel}>
                Cancel
              </button>
              <button
                type="button"
                className="zv-button zv-button-primary"
                onClick={handleSave}
                disabled={saving || !dirty}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button type="button" className="zv-button" onClick={() => setEditing(true)}>
              Edit
            </button>
          )}
        </div>
      </div>

      {error && <div className="zv-alert zv-alert-error">{error}</div>}

      <div className="zv-doctrine-scroll">
        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Loading...</p>
        ) : editing ? (
          <textarea
            className="zv-doctrine-editor"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            spellCheck={false}
          />
        ) : content ? (
          <div className="zv-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
            File is empty or does not exist yet. Click Edit to create it.
          </p>
        )}
      </div>
    </div>
  );
}

export default function DoctrinePage() {
  const [activeFile, setActiveFile] = useState("VECTOR.md");

  return (
    <PageLayout
      title="Doctrine"
      description="Your project's source of truth. VECTOR.md defines intent, audience, and constraints. ARCHITECTURE.md specifies layers, stack, and conventions. CLAUDE.md onboards any contributor — human or AI."
      tabs={DOCTRINE_FILES}
      activeTab={activeFile}
      onTabChange={setActiveFile}
    >
      <DoctrineEditor key={activeFile} file={activeFile} />
    </PageLayout>
  );
}
