import { Panel } from "zv-ui";
import ColorSwatches from "./ColorSwatches.jsx";
import ButtonPreview from "./ButtonPreview.jsx";

function topN(arr, n) {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, n);
}

function shortHierarchy(hierarchy) {
  if (!hierarchy || hierarchy.length === 0) return null;
  const display = hierarchy.find((r) =>
    Object.values(r).some((v) => /display|hero/i.test(v))
  );
  const body = hierarchy.find((r) => Object.values(r).some((v) => /^body$/i.test(v)));
  return [display, body].filter(Boolean);
}

function pickKey(row, ...candidates) {
  for (const c of candidates) {
    for (const k of Object.keys(row)) {
      if (k.toLowerCase() === c.toLowerCase()) return row[k];
    }
  }
  return null;
}

function styleForRow(row, fontFamily) {
  const sizeRaw = pickKey(row, "Size") || "16px";
  const sizeMatch = sizeRaw.match(/(\d+(\.\d+)?)\s*(px|rem)?/);
  const size = sizeMatch ? `${sizeMatch[1]}${sizeMatch[3] || "px"}` : "16px";
  const weightRaw = pickKey(row, "Weight") || "400";
  const weight = weightRaw.match(/\d+/)?.[0] || "400";
  const lhRaw = pickKey(row, "Line Height", "Line-height");
  const lh = lhRaw ? lhRaw.match(/(\d+(\.\d+)?)/)?.[1] || "1.4" : "1.4";
  const lsRaw = pickKey(row, "Letter Spacing", "Tracking");
  let ls = "normal";
  if (lsRaw && !/normal/i.test(lsRaw)) {
    const m = lsRaw.match(/(-?\d+(\.\d+)?)\s*(px|em)?/);
    if (m) ls = `${m[1]}${m[3] || "px"}`;
  }
  return { fontFamily, fontSize: size, fontWeight: weight, lineHeight: lh, letterSpacing: ls };
}

export default function Dashboard({ vector, vectorMd, design, designRaw }) {
  const hasVector = !!vector;
  const hasDesign = !!design;

  if (!hasVector && !hasDesign) {
    return (
      <Panel title="Dashboard">
        <p>Run a vector transform <em>and</em> attach a design system to populate the dashboard.</p>
      </Panel>
    );
  }

  const personas = topN(vector?.data?.personas, 3);
  const topJtbd = topN(vector?.data?.jtbd, 1)[0];
  const topPains = topN(vector?.data?.pain_points, 3);
  const summary = vector?.briefs?.summary;
  const meta = vector?.meta || {};

  const buttonGroup = design?.components?.groups?.find((g) => /button/i.test(g.name));
  const fontFamily = design?.typography?.fonts?.primary
    ? `${design.typography.fonts.primary}, system-ui, sans-serif`
    : "system-ui, sans-serif";
  const typeRows = shortHierarchy(design?.typography?.hierarchy);

  return (
    <div>
      <Panel title="Dashboard">
        <div className="zv-dashboard-meta">
          {hasVector && (
            <div>
              <strong>Vector:</strong> {meta.sources || "?"} sources ({(meta.source_types || []).join(", ")}) · {meta.confidence || "?"} confidence
            </div>
          )}
          {hasDesign && (
            <div>
              <strong>Design:</strong> {design.title}
            </div>
          )}
        </div>
      </Panel>

      <div className="zv-dashboard-grid">
        <Panel title="Audience">
          {!hasVector && <p><em>No vector attached.</em></p>}

          {personas.length > 0 && (
            <section className="zv-dashboard-section">
              <h4 className="zv-dashboard-subhead">Personas</h4>
              <ul className="zv-dashboard-list">
                {personas.map((p, i) => (
                  <li key={i}>
                    <strong>{p.name}</strong> ({p.role}) — {p.context}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {topJtbd && (
            <section className="zv-dashboard-section">
              <h4 className="zv-dashboard-subhead">Top job to be done</h4>
              <p className="zv-dashboard-jtbd">{topJtbd.job}</p>
            </section>
          )}

          {topPains.length > 0 && (
            <section className="zv-dashboard-section">
              <h4 className="zv-dashboard-subhead">Top pains</h4>
              <ul className="zv-dashboard-list">
                {topPains.map((p, i) => (
                  <li key={i}>
                    <strong>[{(p.severity || "").toUpperCase()}]</strong> {p.description}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </Panel>

        <Panel title="Brand">
          {!hasDesign && <p><em>No design system attached.</em></p>}

          {hasDesign && design.colors.all.length > 0 && (
            <section className="zv-dashboard-section">
              <h4 className="zv-dashboard-subhead">Colors</h4>
              <ColorSwatches groups={design.colors.groups.slice(0, 3)} />
            </section>
          )}

          {hasDesign && typeRows && typeRows.length > 0 && (
            <section className="zv-dashboard-section">
              <h4 className="zv-dashboard-subhead">Type</h4>
              {typeRows.map((row, i) => (
                <div key={i} className="zv-dashboard-typesample">
                  <div style={styleForRow(row, fontFamily)}>The quick brown fox.</div>
                  <div className="zv-dashboard-typecaption">
                    {pickKey(row, "Role")} · {pickKey(row, "Size")}
                  </div>
                </div>
              ))}
            </section>
          )}

          {hasDesign && buttonGroup && (
            <section className="zv-dashboard-section">
              <h4 className="zv-dashboard-subhead">Buttons</h4>
              <ButtonPreview buttonGroup={{ ...buttonGroup, variants: buttonGroup.variants.slice(0, 3) }} fonts={design.typography.fonts} />
            </section>
          )}
        </Panel>
      </div>

      {(summary || design?.visualTheme?.prose) && (
        <div className="zv-dashboard-grid">
          <Panel title="Executive summary">
            <p className="zv-dashboard-prose">{summary || <em>No vector summary.</em>}</p>
          </Panel>
          <Panel title="Visual theme">
            <p className="zv-dashboard-prose">{design?.visualTheme?.prose || <em>No design theme.</em>}</p>
          </Panel>
        </div>
      )}
    </div>
  );
}
