export default function LoadingPulse({ icon = '◧', label = 'Loading…' }) {
  return (
    <div className="zv-loading">
      <div className="zv-loading-icon">{icon}</div>
      {label && <div className="zv-loading-text">{label}</div>}
    </div>
  );
}
