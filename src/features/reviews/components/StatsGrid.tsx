interface StatsGridProps {
  reviewsCount: number;
  totalFindings: number;
  repositoryCount: number;
  isLoading: boolean;
}

export function StatsGrid({
  reviewsCount,
  totalFindings,
  repositoryCount,
  isLoading,
}: StatsGridProps) {
  return (
    <section className="stats-grid" aria-label="Review statistics">
      <article className="stat-card">
        <span className="stat-icon violet">⌘</span>
        <span className="stat-label">REVIEWS RUN</span>
        <strong>{isLoading ? '—' : reviewsCount}</strong>
        <small>Saved code reviews</small>
        <span className="stat-decoration" aria-hidden="true">
          ↗
        </span>
      </article>
      <article className="stat-card">
        <span className="stat-icon teal">⌁</span>
        <span className="stat-label">FINDINGS</span>
        <strong>{isLoading ? '—' : totalFindings}</strong>
        <small>Issues identified</small>
        <span className="stat-decoration" aria-hidden="true">
          ⌁
        </span>
      </article>
      <article className="stat-card">
        <span className="stat-icon amber">⌂</span>
        <span className="stat-label">REPOSITORIES</span>
        <strong>{isLoading ? '—' : repositoryCount}</strong>
        <small>Repositories reviewed</small>
        <span className="stat-decoration" aria-hidden="true">
          ◌
        </span>
      </article>
    </section>
  );
}

