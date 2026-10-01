import type { Review } from '../../../types/review';
import { SeverityBadge } from './SeverityBadge';

interface ReviewDetailProps {
  review: Review;
  onClose: () => void;
}

export function ReviewDetail({ review, onClose }: ReviewDetailProps) {
  const criticalCount = review.findings.filter((finding) => finding.severity === 'CRITICAL').length;

  return (
    <section className="panel detail-panel" id="review-detail">
      <div className="panel-heading detail-heading">
        <div>
          <p className="eyebrow">REVIEW RESULT <span className={`result-status ${review.status === 'FAILED' ? 'failed' : ''}`}><i /> {review.status}</span></p>
          <h2>{review.repository}</h2>
          <p className="muted">
            {review.pullRequest ? `Pull request #${review.pullRequest}` : 'Manual review'}
            <span className="meta-separator">·</span>
            {new Date(review.createdAt).toLocaleString()}
          </p>
        </div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close review details">×</button>
      </div>

      <div className="summary-box">
        <span className="summary-icon" aria-hidden="true">✳</span>
        <div>
          <span className="summary-label">AI SUMMARY</span>
          <p>{review.summary}</p>
        </div>
      </div>

      <div className="findings-heading">
        <div>
          <h3>Findings <span className="count-pill small">{review.findings.length}</span></h3>
          <p className="muted">Actionable issues detected in this diff.</p>
        </div>
        {criticalCount > 0 && <span className="critical-summary">{criticalCount} critical</span>}
      </div>

      {review.status === 'FAILED' ? (
        <div className="failed-result"><span>!</span><div><strong>Review failed</strong><p>{review.summary || 'The review could not be completed. Please try again.'}</p></div></div>
      ) : review.findings.length === 0 ? (
        <div className="clean-result"><span>✓</span><div><strong>No issues found</strong><p>The submitted diff did not surface actionable findings.</p></div></div>
      ) : (
        <div className="finding-list">
          {review.findings.map((finding) => (
            <article className="finding-card" key={finding.id}>
              <div className="finding-card-header">
                <div className="finding-title-group">
                  <span className="finding-marker" aria-hidden="true">!</span>
                  <h4>{finding.title}</h4>
                </div>
                <SeverityBadge severity={finding.severity} />
              </div>
              <p className="finding-description">{finding.description}</p>
              <div className="finding-meta">
                <span className="category-chip">{finding.category}</span>
                {finding.filePath && <code>{finding.filePath}{finding.line ? `:${finding.line}` : ''}</code>}
              </div>
              {finding.suggestion && (
                <div className="suggestion-box">
                  <span className="suggestion-label">SUGGESTED FIX</span>
                  <p>{finding.suggestion}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <details className="diff-disclosure">
        <summary>View submitted diff <span>{review.diff.length.toLocaleString()} characters</span></summary>
        <pre>{review.diff}</pre>
      </details>
    </section>
  );
}
