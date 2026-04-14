function specToStyle(specs, fontFamily) {
  const style = {};
  if (specs.Background && !/transparent/i.test(specs.Background)) {
    const m = specs.Background.match(/(#[0-9a-f]{3,8}|rgba?\([^)]+\))/i);
    if (m) style.backgroundColor = m[1];
  } else {
    style.backgroundColor = "transparent";
  }
  if (specs.Text) {
    const m = specs.Text.match(/(#[0-9a-f]{3,8}|rgba?\([^)]+\))/i);
    if (m) style.color = m[1];
  }
  if (specs.Padding) style.padding = specs.Padding;
  if (specs.Radius) {
    const r = specs.Radius.match(/\d+\s*px/);
    if (r) style.borderRadius = r[0];
  }
  if (specs.Border) {
    style.border = specs.Border.replace(/`/g, "");
  } else {
    style.border = "1px solid transparent";
  }
  if (specs.Font) {
    const sizeMatch = specs.Font.match(/(\d+)\s*px/);
    const weightMatch = specs.Font.match(/weight\s*(\d+)/i);
    if (sizeMatch) style.fontSize = `${sizeMatch[1]}px`;
    if (weightMatch) style.fontWeight = weightMatch[1];
  }
  if (fontFamily) style.fontFamily = fontFamily;
  style.cursor = "pointer";
  return style;
}

export default function ButtonPreview({ buttonGroup, fonts }) {
  if (!buttonGroup || !buttonGroup.variants?.length) {
    return <p>No button variants parsed.</p>;
  }
  const fontFamily = fonts?.primary
    ? `${fonts.primary}, system-ui, sans-serif`
    : "system-ui, sans-serif";
  return (
    <div>
      <h4 className="zv-dashboard-subhead">{buttonGroup.name}</h4>
      <div className="zv-buttonpreview-row">
        {buttonGroup.variants.map((variant, i) => (
          <div key={`${variant.name}-${i}`} className="zv-buttonpreview-cell">
            <button type="button" style={specToStyle(variant.specs, fontFamily)}>
              {variant.name}
            </button>
            <div className="zv-typesample-caption">{variant.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
