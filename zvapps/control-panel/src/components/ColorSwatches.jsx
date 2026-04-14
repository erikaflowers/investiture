function isLight(hex) {
  const m = hex.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return false;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

export default function ColorSwatches({ groups }) {
  if (!groups || groups.length === 0) {
    return <p>No colors parsed.</p>;
  }
  return (
    <div className="zv-swatch-list">
      {groups.map((group) => (
        <div key={group.name} className="zv-swatch-group">
          <h4 className="zv-dashboard-subhead">{group.name}</h4>
          <div className="zv-swatch-grid">
            {group.items.map((item, i) => {
              const dark = !isLight(item.value);
              return (
                <div
                  key={`${item.name}-${i}`}
                  className="zv-swatch"
                  title={item.role}
                  style={{
                    backgroundColor: item.value,
                    color: dark ? "#fff" : "#000",
                  }}
                >
                  <div className="zv-swatch-name">{item.name}</div>
                  <div className="zv-swatch-value">{item.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
