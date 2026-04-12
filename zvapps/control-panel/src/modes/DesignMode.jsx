import { Panel } from "zv-ui";
import DesignSystemView from "../components/DesignSystemView.jsx";

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

export default function DesignMode({
  designSlug,
  setDesignSlug,
  designParsed,
  designMd,
  designError,
}) {
  return (
    <div>
      <Panel title="Design system">
        <div className="zv-field">
          <label className="zv-field-label" htmlFor="zv-preset">Preset</label>
          <select
            id="zv-preset"
            className="zv-select zv-select-inline"
            value={designSlug}
            onChange={(e) => setDesignSlug(e.target.value)}
          >
            <option value="">— none —</option>
            {PRESETS.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        {designError && <div className="zv-alert zv-alert-error" role="alert">Error: {designError}</div>}
      </Panel>

      <DesignSystemView parsed={designParsed} raw={designMd} />
    </div>
  );
}

export { PRESETS };
