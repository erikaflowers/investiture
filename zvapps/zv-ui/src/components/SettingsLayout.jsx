export default function SettingsLayout({ groups = [], onBack, children }) {
  return (
    <div className="zv-settings-layout">
      <aside className="zv-settings-sidebar">
        {onBack && (
          <button type="button" className="zv-settings-back" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
        <div className="zv-settings-sidebar-title">Settings</div>
        <nav className="zv-settings-nav">
          {groups.map((group) => (
            <div key={group.label} className="zv-settings-nav-group">
              <div className="zv-settings-nav-group-label">{group.label}</div>
              {group.items.map((item) => (
                <button
                  key={item.id || item.label}
                  type="button"
                  className={`zv-settings-nav-link${item.active ? ' active' : ''}`}
                  onClick={item.onClick}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <main className="zv-settings-content">{children}</main>
    </div>
  );
}
