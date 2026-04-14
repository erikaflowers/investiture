export default function TopNav({ logo, brand, tabs = [], right }) {
  return (
    <nav className="zv-top-nav">
      <div className="zv-top-nav-left">
        {logo && <span className="zv-top-nav-logo">{logo}</span>}
        {brand && <span className="zv-top-nav-brand">{brand}</span>}
      </div>

      <div className="zv-top-nav-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id || tab.label}
            type="button"
            className={`zv-top-nav-tab${tab.active ? ' active' : ''}`}
            onClick={tab.onClick}
            aria-pressed={!!tab.active}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {right && <div className="zv-top-nav-right">{right}</div>}
    </nav>
  );
}
