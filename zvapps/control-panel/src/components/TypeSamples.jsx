function pickKey(row, ...candidates) {
  for (const c of candidates) {
    for (const k of Object.keys(row)) {
      if (k.toLowerCase() === c.toLowerCase()) return row[k];
    }
  }
  return null;
}

function parseSize(value) {
  if (!value) return null;
  const m = value.match(/(\d+(\.\d+)?)\s*(px|rem|em)?/);
  if (!m) return null;
  return m[3] ? `${m[1]}${m[3]}` : `${m[1]}px`;
}

function parseLetterSpacing(value) {
  if (!value) return "normal";
  if (/normal/i.test(value)) return "normal";
  const m = value.match(/(-?\d+(\.\d+)?)\s*(px|em)?/);
  if (!m) return "normal";
  return m[3] ? `${m[1]}${m[3]}` : `${m[1]}px`;
}

function parseLineHeight(value) {
  if (!value) return "1.4";
  const m = value.match(/(\d+(\.\d+)?)/);
  return m ? m[1] : "1.4";
}

export default function TypeSamples({ fonts, hierarchy }) {
  if (!hierarchy || hierarchy.length === 0) {
    return <p>No typography hierarchy parsed.</p>;
  }
  const fontFamily = fonts?.primary
    ? `${fonts.primary}, system-ui, -apple-system, sans-serif`
    : "system-ui, -apple-system, sans-serif";

  return (
    <div>
      {fonts?.primary && (
        <p className="zv-typesample-fontline">
          <strong>Font:</strong> <code>{fonts.primary}</code>
          {fonts.mono && (
            <>
              {" · "}
              <strong>Mono:</strong> <code>{fonts.mono}</code>
            </>
          )}
        </p>
      )}
      <div>
        {hierarchy.map((row, i) => {
          const role = pickKey(row, "Role") || `Row ${i + 1}`;
          const size = parseSize(pickKey(row, "Size"));
          const weight = pickKey(row, "Weight") || "400";
          const lineHeight = parseLineHeight(pickKey(row, "Line Height", "Line-height"));
          const letterSpacing = parseLetterSpacing(pickKey(row, "Letter Spacing", "Tracking"));
          if (!size) return null;
          const cleanWeight = weight.match(/\d+/)?.[0] || "400";
          return (
            <div key={`${role}-${i}`} className="zv-typesample-row">
              <div className="zv-typesample-caption">
                {role} · {size} · {cleanWeight} · ls {letterSpacing}
              </div>
              <div
                style={{
                  fontFamily,
                  fontSize: size,
                  fontWeight: cleanWeight,
                  lineHeight,
                  letterSpacing,
                }}
              >
                The quick brown fox.
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
