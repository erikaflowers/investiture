import { Panel } from "zv-ui";
import ColorSwatches from "./ColorSwatches.jsx";
import TypeSamples from "./TypeSamples.jsx";
import ButtonPreview from "./ButtonPreview.jsx";

export default function DesignSystemView({ parsed, raw }) {
  if (!parsed) {
    return (
      <Panel>
        <p>No design system attached. Pick a preset above.</p>
      </Panel>
    );
  }
  const buttonGroup = parsed.components.groups.find((g) => /button/i.test(g.name));

  return (
    <div>
      <Panel title={parsed.title}>
        {parsed.visualTheme.prose && (
          <section className="zv-dashboard-section">
            <h4 className="zv-dashboard-subhead">Visual Theme</h4>
            <p className="zv-dashboard-prose">{parsed.visualTheme.prose}</p>
            {parsed.visualTheme.keyCharacteristics.length > 0 && (
              <ul className="zv-dashboard-list">
                {parsed.visualTheme.keyCharacteristics.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            )}
          </section>
        )}
      </Panel>

      <Panel title={`Colors (${parsed.colors.all.length})`}>
        <ColorSwatches groups={parsed.colors.groups} />
      </Panel>

      <Panel title="Typography">
        <TypeSamples fonts={parsed.typography.fonts} hierarchy={parsed.typography.hierarchy} />
      </Panel>

      {buttonGroup && (
        <Panel title="Buttons">
          <ButtonPreview buttonGroup={buttonGroup} fonts={parsed.typography.fonts} />
        </Panel>
      )}

      {(parsed.doDont.do.length > 0 || parsed.doDont.dont.length > 0) && (
        <Panel title="Do's and Don'ts">
          <div className="zv-dashboard-grid">
            <div>
              <h4 className="zv-dashboard-subhead">Do</h4>
              <ul className="zv-dashboard-list">
                {parsed.doDont.do.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="zv-dashboard-subhead">Don't</h4>
              <ul className="zv-dashboard-list">
                {parsed.doDont.dont.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          </div>
        </Panel>
      )}

      {raw && (
        <Panel>
          <details>
            <summary style={{ cursor: "pointer", color: "var(--text-secondary)", fontSize: "13px" }}>Raw markdown</summary>
            <pre className="zv-code" style={{ marginTop: "12px", maxHeight: "400px", overflow: "auto", fontSize: "11px" }}>{raw}</pre>
          </details>
        </Panel>
      )}
    </div>
  );
}
