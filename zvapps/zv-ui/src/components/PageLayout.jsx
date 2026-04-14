export default function PageLayout({ title, description, tabs = [], activeTab, onTabChange, aside, children }) {
  return (
    <div className="zv-page">
      <header className="zv-page-header">
        <h2 className="zv-page-title">{title}</h2>
        {description && <p className="zv-page-description">{description}</p>}
      </header>

      {tabs.length > 0 && (
        <div className="zv-page-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`zv-page-tab${activeTab === tab.id ? " active" : ""}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="zv-page-body">
        <div className="zv-page-body-main">
          {children}
        </div>
        {aside && (
          <aside className="zv-page-body-aside">
            {aside}
          </aside>
        )}
      </div>
    </div>
  );
}
