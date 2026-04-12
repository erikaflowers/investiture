import { Panel } from "zv-ui";

const TABS = ["vector", "briefs", "personas", "jtbd", "pains", "insights", "opportunities", "metrics"];

const TAB_TO_DATA_KEY = {
  personas: "personas",
  jtbd: "jtbd",
  pains: "pain_points",
  insights: "insights",
  opportunities: "opportunities",
  metrics: "success_metrics",
};

export default function VectorMode({
  inputText,
  setInputText,
  processing,
  result,
  vectorMd,
  activeTab,
  setActiveTab,
  error,
  loadSample,
  handleProcess,
}) {
  const renderActiveTab = () => {
    if (!result) return null;
    if (activeTab === "vector") {
      return <pre className="zv-code">{vectorMd}</pre>;
    }
    if (activeTab === "briefs") {
      return (
        <div>
          {Object.entries(result.briefs || {}).map(([key, value]) => (
            <Panel key={key} title={key.replace(/_/g, " ")}>
              <p style={{ whiteSpace: "pre-wrap", maxWidth: "70ch" }}>{value}</p>
            </Panel>
          ))}
        </div>
      );
    }
    const dataKey = TAB_TO_DATA_KEY[activeTab];
    return <pre className="zv-code">{JSON.stringify(result.data?.[dataKey] ?? null, null, 2)}</pre>;
  };

  return (
    <div>
      <Panel title="Research input">
        <div className="zv-field">
          <label className="zv-field-label" htmlFor="zv-sample">Sample</label>
          <select
            id="zv-sample"
            className="zv-select zv-select-inline"
            onChange={(e) => loadSample(e.target.value)}
          >
            <option value="">— none —</option>
            <option value="Interview Notes">Interview Notes</option>
            <option value="Workshop Stickies">Workshop Stickies</option>
            <option value="Survey Data">Survey Data</option>
            <option value="All Sources">All Sources</option>
          </select>
        </div>

        <div className="zv-field">
          <label className="zv-field-label" htmlFor="zv-research">Raw research</label>
          <textarea
            id="zv-research"
            className="zv-textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={16}
            placeholder="Paste interview notes, workshop stickies, survey data…"
          />
        </div>

        <div className="zv-field-row">
          <button
            type="button"
            className="zv-button zv-button-primary"
            onClick={handleProcess}
            disabled={!inputText.trim() || processing}
          >
            {processing ? "Processing…" : "Transform"}
          </button>
        </div>

        {error && <div className="zv-alert zv-alert-error" role="alert">Error: {error}</div>}
      </Panel>

      {result && (
        <Panel title="Output">
          <div className="zv-tab-row">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                className="zv-tab"
                aria-pressed={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          {renderActiveTab()}
        </Panel>
      )}
    </div>
  );
}
