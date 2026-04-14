export default function StatusBar({ left, center, right }) {
  return (
    <div className="zv-status-bar">
      <div className="zv-status-bar-wave" />
      <div className="zv-status-bar-left">{left}</div>
      {center && <div className="zv-status-bar-center">{center}</div>}
      <div className="zv-status-bar-right">{right}</div>
    </div>
  );
}
