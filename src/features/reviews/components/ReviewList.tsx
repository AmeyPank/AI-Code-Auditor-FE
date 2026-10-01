import { useMemo, useState } from 'react';
import type { ReviewListItem } from '../../../types/review';

interface ReviewListProps {
  reviews: ReviewListItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  isRecent?: boolean;
}

function formatRelativeDate(value: string): string {
  const date = new Date(value);
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function ReviewList({ reviews, selectedId, onSelect, onRefresh, isLoading, isRecent = false }: ReviewListProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | 'COMPLETED' | 'FAILED'>('ALL');
  const visibleReviews = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return reviews.filter((review) => {
      const matchesSearch = !normalizedSearch || [review.repository, review.pullRequest ?? '', review.summary]
        .some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
      return matchesSearch && (status === 'ALL' || review.status === status);
    });
  }, [reviews, search, status]);

  return (
    <section className="panel history-panel" id="review-history">
      <div className="panel-heading history-heading">
        <div>
          <p className="eyebrow">ACTIVITY</p>
          <h2>Recent reviews</h2>
        </div>
        <div className="history-actions">
          <button className="secondary-button refresh-button" type="button" onClick={onRefresh} disabled={isLoading} aria-label="Refresh review history">
            {isLoading ? 'Refreshing…' : 'Refresh'}
          </button>
          <span className="count-pill">{isRecent ? `${reviews.length} recent` : `${reviews.length} total`}</span>
        </div>
      </div>

      {reviews.length > 0 && <div className="history-filters">
        <label className="history-search"><span className="visually-hidden">Search reviews</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search repository, PR, or summary" /></label>
        <label className="history-status"><span className="visually-hidden">Filter by review status</span><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="ALL">All statuses</option><option value="COMPLETED">Completed</option><option value="FAILED">Failed</option></select></label>
      </div>}

      {isLoading && reviews.length === 0 ? (
        <div className="empty-state">Loading review history…</div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">◷</span>
          <strong>No reviews yet</strong>
          <span>Your submitted code reviews will show up here.</span>
        </div>
      ) : (
        visibleReviews.length === 0 ? <div className="empty-state compact-empty">No reviews match these filters.</div> : <div className="review-list">
          {visibleReviews.map((review) => (
            <button
              className={`review-row ${selectedId === review.id ? 'selected' : ''}`}
              key={review.id}
              onClick={() => onSelect(review.id)}
              type="button"
            >
              <span className="review-row-icon" aria-hidden="true">⌘</span>
              <span className="review-row-main">
                <strong>{review.repository}</strong>
                <span className="review-row-meta">
                  {review.pullRequest ? `PR #${review.pullRequest}` : 'Manual review'}
                  <span className="meta-separator">·</span>
                  {review.findingCount} {review.findingCount === 1 ? 'finding' : 'findings'}
                </span>
              </span>
              <span className="review-row-date">{formatRelativeDate(review.createdAt)}</span>
              <span className={`review-status-chip ${review.status === 'FAILED' ? 'failed' : ''}`}>{review.status === 'FAILED' ? 'Failed' : 'Completed'}</span>
              <span className="row-chevron" aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
