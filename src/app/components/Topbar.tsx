import type { CurrentAccess, HealthStatus } from '../../types/review';
import type { View } from '../types';

interface TopbarProps {
  view: View;
  health: HealthStatus | null;
  access: CurrentAccess | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export function Topbar({
  view,
  health,
  access,
  onOpenAuth,
  onLogout,
}: TopbarProps) {
  const isOnline = Boolean(health);
  const viewLabel = view === 'overview' ? 'Overview' : 'Review history';

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>Workspace</span>
        <b>/</b>
        <strong>{viewLabel}</strong>
      </div>
      <div className="topbar-actions">
        <span className={`api-status ${isOnline ? 'online' : 'offline'}`}>
          <i /> {isOnline ? 'API online' : 'API offline'}
        </span>
        <a
          className="docs-button"
          href="/api/docs"
          target="_blank"
          rel="noreferrer"
        >
          Docs <span aria-hidden="true">↗</span>
        </a>
        {access?.user ? (
          <button
            type="button"
            className="account-button"
            onClick={onLogout}
            title="Sign out"
          >
            {access.user.displayName} · Sign out
          </button>
        ) : (
          <button
            type="button"
            className="account-button"
            onClick={onOpenAuth}
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}

