import type { CurrentAccess, HealthStatus } from '../../types/review';
import type { View } from '../types';

interface SidebarProps {
  view: View;
  onSelectView: (view: View) => void;
  reviewCount: number;
  health: HealthStatus | null;
  access: CurrentAccess | null;
}

const NAV_ITEMS: Array<{ id: View; label: string; icon: string }> = [
  { id: 'overview', label: 'Overview', icon: '▦' },
  { id: 'reviews', label: 'Review history', icon: '◷' },
];

export function Sidebar({
  view,
  onSelectView,
  reviewCount,
  health,
  access,
}: SidebarProps) {
  const avatarLetter = access?.user?.displayName.slice(0, 1).toUpperCase() ?? 'G';
  const displayName = access?.user?.displayName ?? 'Guest Auditor';
  const displayEmail = access?.user?.email ?? 'Guest account';

  return (
    <aside className="sidebar">
      <a className="brand" href="#top" onClick={() => onSelectView('overview')}>
        <span className="brand-mark" aria-hidden="true">
          <span />
        </span>
        <span className="brand-copy">
          <strong>Code Auditor</strong>
          <small>AI REVIEW WORKSPACE</small>
        </span>
      </a>

      <div className="workspace-switcher">
        <span className="workspace-avatar">AC</span>
        <span>
          <strong>Acme Company</strong>
          <small>Personal workspace</small>
        </span>
        <span className="switcher-chevron">⌄</span>
      </div>

      <p className="sidebar-label">WORKSPACE</p>
      <nav className="side-nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-link ${view === item.id ? 'active' : ''}`}
            onClick={() => onSelectView(item.id)}
            type="button"
          >
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
            {item.id === 'reviews' && (
              <span className="nav-count">{reviewCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className={`connection-card ${health ? 'online' : 'offline'}`}>
          <span className="connection-indicator" />
          <span>
            <strong>API {health ? 'connected' : 'offline'}</strong>
            <small>
              {health ? 'All systems operational' : 'Check your backend server'}
            </small>
          </span>
        </div>
        <a
          className="sidebar-docs"
          href="/api/docs"
          target="_blank"
          rel="noreferrer"
        >
          <span aria-hidden="true">↗</span> API documentation
        </a>
        <div className="user-profile">
          <span className="user-avatar">{avatarLetter}</span>
          <span>
            <strong>{displayName}</strong>
            <small>{displayEmail}</small>
          </span>
          <span className="profile-menu">•••</span>
        </div>
      </div>
    </aside>
  );
}

