import { Panel } from "zv-ui";

export default function DesignPage() {
  return (
    <Panel title="Design System">
      <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
        Attach a <strong>DESIGN.md</strong> to your project, browse design tokens, preview color palettes, and view the full visual language in one place.
      </p>
      <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "12px" }}>
        Coming soon. This page will include a token viewer, theme previewer, and DESIGN.md browser.
      </p>
    </Panel>
  );
}
