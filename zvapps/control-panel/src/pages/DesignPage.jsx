import { useState, useEffect, useCallback, useMemo } from "react";
import { PageLayout } from "zv-ui";
import { parseDesignMd } from "../../core/parseDesignMd.js";
import ColorSwatches from "../components/ColorSwatches.jsx";
import TypeSamples from "../components/TypeSamples.jsx";
import ButtonPreview from "../components/ButtonPreview.jsx";
import DesignSystemView from "../components/DesignSystemView.jsx";

const PRESET_FILES = import.meta.glob("../../presets/*.md", { query: "?raw", import: "default", eager: true });

const PRESETS = [
  { slug: "stripe", label: "Stripe" },
  { slug: "linear", label: "Linear" },
  { slug: "notion", label: "Notion" },
  { slug: "vercel", label: "Vercel" },
  { slug: "apple", label: "Apple" },
  { slug: "claude", label: "Claude" },
  { slug: "figma", label: "Figma" },
  { slug: "spotify", label: "Spotify" },
  { slug: "supabase", label: "Supabase" },
];

function LivePreview({ parsed }) {
  if (!parsed) {
    return (
      <p style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "13px" }}>
        Add content to your DESIGN.md to see a live preview of colors, typography, and components.
      </p>
    );
  }

  const buttonGroup = parsed.components.groups.find((g) => /button/i.test(g.name));

  return (
    <div>
      {parsed.title && (
        <div className="zv-design-preview-section">
          <div className="zv-design-preview-section-title">{parsed.title}</div>
          {parsed.visualTheme.keyCharacteristics.length > 0 && (
            <ul className="zv-dashboard-list">
              {parsed.visualTheme.keyCharacteristics.slice(0, 5).map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {parsed.colors.all.length > 0 && (
        <div className="zv-design-preview-section">
          <div className="zv-design-preview-section-title">Colors ({parsed.colors.all.length})</div>
          <ColorSwatches groups={parsed.colors.groups} />
        </div>
      )}

      {parsed.typography.hierarchy.length > 0 && (
        <div className="zv-design-preview-section">
          <div className="zv-design-preview-section-title">Typography</div>
          <TypeSamples fonts={parsed.typography.fonts} hierarchy={parsed.typography.hierarchy.slice(0, 6)} />
        </div>
      )}

      {buttonGroup && (
        <div className="zv-design-preview-section">
          <div className="zv-design-preview-section-title">Buttons</div>
          <ButtonPreview buttonGroup={buttonGroup} fonts={parsed.typography.fonts} />
        </div>
      )}

      {(parsed.doDont.do.length > 0 || parsed.doDont.dont.length > 0) && (
        <div className="zv-design-preview-section">
          <div className="zv-design-preview-section-title">Do's and Don'ts</div>
          <div className="zv-dashboard-grid">
            <div>
              <h4 className="zv-dashboard-subhead">Do</h4>
              <ul className="zv-dashboard-list">
                {parsed.doDont.do.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="zv-dashboard-subhead">Don't</h4>
              <ul className="zv-dashboard-list">
                {parsed.doDont.dont.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function YourDesignSystem() {
  const [content, setContent] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/doctrine/read?file=DESIGN.md");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setContent(data.content);
      setDraft(data.content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/doctrine/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: "DESIGN.md", content: draft }),
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

  const parsed = useMemo(() => {
    if (!draft || !draft.trim()) return null;
    return parseDesignMd(draft);
  }, [draft]);

  const dirty = draft !== content;

  if (loading) {
    return <p style={{ color: "var(--text-muted)", fontSize: "13px", padding: "16px" }}>Loading DESIGN.md...</p>;
  }

  return (
    <div className="zv-design-split">
      <div className="zv-design-pane">
        <div className="zv-design-pane-header">
          <span className="zv-design-pane-label">DESIGN.md — Editor</span>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span className={`zv-doctrine-status${saved ? " visible" : ""}`}>Saved</span>
            <button
              type="button"
              className="zv-button zv-button-primary"
              onClick={handleSave}
              disabled={saving || !dirty}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
        {error && <div className="zv-alert zv-alert-error" style={{ margin: "8px 16px 0" }}>{error}</div>}
        <div className="zv-design-pane-body">
          <textarea
            className="zv-design-editor-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            spellCheck={false}
            placeholder={"# My Design System\n\n## 1. Visual Theme & Atmosphere\n\nDescribe your visual language...\n\n## 2. Color Palette & Roles\n\n### Primary\n- **Brand Blue** (`#1a6dd2`): Primary accent color\n- **Dark Text** (`#2c2825`): Heading and body text\n\n## 3. Typography Rules\n\n### Font Family\n- **Primary**: Inter\n- **Monospace**: JetBrains Mono"}
          />
        </div>
      </div>

      <div className="zv-design-pane">
        <div className="zv-design-pane-header">
          <span className="zv-design-pane-label">Live Preview</span>
        </div>
        <div className="zv-design-pane-body">
          <LivePreview parsed={parsed} />
        </div>
      </div>
    </div>
  );
}

function ExamplesTab() {
  const [designSlug, setDesignSlug] = useState("");
  const [designMd, setDesignMd] = useState("");
  const [designParsed, setDesignParsed] = useState(null);

  const presetMap = useMemo(() => {
    const map = {};
    for (const [path, content] of Object.entries(PRESET_FILES)) {
      const slug = path.split("/").pop().replace(/\.md$/, "");
      map[slug] = content;
    }
    return map;
  }, []);

  useEffect(() => {
    if (!designSlug) {
      setDesignMd("");
      setDesignParsed(null);
      return;
    }
    const text = presetMap[designSlug];
    if (text) {
      setDesignMd(text);
      setDesignParsed(parseDesignMd(text));
    }
  }, [designSlug, presetMap]);

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <p style={{ color: "var(--text-secondary)", marginBottom: "12px", fontSize: "13px", lineHeight: 1.6 }}>
          Reference design systems from the <a href="https://github.com/VoltAgent/awesome-design-md" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>awesome-design-md</a> collection. Use these as inspiration or starting points for your own DESIGN.md.
        </p>
        <div className="zv-field">
          <label className="zv-field-label" htmlFor="zv-example-preset">Example</label>
          <select
            id="zv-example-preset"
            className="zv-select zv-select-inline"
            value={designSlug}
            onChange={(e) => setDesignSlug(e.target.value)}
          >
            <option value="">— choose an example —</option>
            {PRESETS.map((p) => (
              <option key={p.slug} value={p.slug}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>
      <DesignSystemView parsed={designParsed} raw={designMd} />
    </div>
  );
}

const TABS = [
  { id: "yours", label: "Your Design System" },
  { id: "examples", label: "Examples" },
];

export default function DesignPage() {
  const [activeTab, setActiveTab] = useState("yours");

  return (
    <PageLayout
      title="Design System"
      description="Your project's visual language. Edit your DESIGN.md and see colors, typography, and components render live. Browse example design systems from major brands for reference."
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "yours" && <YourDesignSystem />}
      {activeTab === "examples" && <ExamplesTab />}
    </PageLayout>
  );
}
