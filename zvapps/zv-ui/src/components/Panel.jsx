export default function Panel({ title, children, className = '' }) {
  return (
    <div className={`zv-card ${className}`.trim()}>
      {title && <h3 className="zv-card-title">{title}</h3>}
      {children}
    </div>
  );
}
