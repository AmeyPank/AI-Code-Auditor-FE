import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, reviewsApi } from '../features/reviews/api/reviews-api';
import { AuthDialog } from '../features/auth/AuthDialog';
import { ReviewDetail } from '../features/reviews/components/ReviewDetail';
import { ReviewForm } from '../features/reviews/components/ReviewForm';
import { ReviewList } from '../features/reviews/components/ReviewList';
import type { CreateReviewInput, CurrentAccess, HealthStatus, Review, ReviewListItem } from '../types/review';

type View = 'overview' | 'reviews';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong while loading the auditor.';
}

export default function App() {
  const [view, setView] = useState<View>('overview');
  const [reviews, setReviews] = useState<ReviewListItem[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [access, setAccess] = useState<CurrentAccess | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [pageError, setPageError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const detailRequestId = useRef(0);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    const [healthResult, reviewResult, accessResult] = await Promise.allSettled([
      reviewsApi.checkHealth(),
      reviewsApi.list(100),
      reviewsApi.access(),
    ]);

    if (healthResult.status === 'fulfilled') setHealth(healthResult.value);
    else setHealth(null);
    if (accessResult.status === 'fulfilled') setAccess(accessResult.value);

    if (reviewResult.status === 'fulfilled') {
      setReviews(reviewResult.value);
      setPageError('');
    } else {
      setPageError(getErrorMessage(reviewResult.reason));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const totalFindings = useMemo(
    () => reviews.reduce((total, review) => total + review.findingCount, 0),
    [reviews],
  );
  const repositoryCount = useMemo(
    () => new Set(reviews.map((review) => review.repository)).size,
    [reviews],
  );

  async function handleCreateReview(input: CreateReviewInput): Promise<Review> {
    setIsSubmitting(true);
    setPageError('');
    try {
      const created = await reviewsApi.create(input);
      if (created.quota && access) setAccess({ ...access, quota: created.quota });
      setSelectedReview(created);
      setView('overview');
      await loadReviews();
      return created;
    } catch (error) {
      if (error instanceof ApiError && error.status === 402) {
        const refreshedAccess = await reviewsApi.access();
        setAccess(refreshedAccess);
      }
      throw new Error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSelectReview(id: string) {
    const requestId = ++detailRequestId.current;
    setSelectedReview(null);
    setIsLoadingDetail(true);
    setPageError('');
    try {
      const review = await reviewsApi.get(id);
      if (requestId === detailRequestId.current) setSelectedReview(review);
    } catch (error) {
      if (requestId === detailRequestId.current) setPageError(getErrorMessage(error));
    } finally {
      if (requestId === detailRequestId.current) setIsLoadingDetail(false);
    }
  }

  async function handleAuthenticated(nextAccess: CurrentAccess) {
    setAccess(nextAccess);
    setIsAuthOpen(false);
    setSelectedReview(null);
    setReviews([]);
    await loadReviews();
  }

  async function handleLogout() {
    setSelectedReview(null);
    setReviews([]);
    detailRequestId.current += 1;
    try {
      await reviewsApi.logout();
      await loadReviews();
    } catch (error) {
      setPageError(getErrorMessage(error));
    }
  }

  const navItems: Array<{ id: View; label: string; icon: string }> = [
    { id: 'overview', label: 'Overview', icon: '▦' },
    { id: 'reviews', label: 'Review history', icon: '◷' },
  ];

  return (
    <>
      <div className="app-shell">
        <aside className="sidebar">
          <a className="brand" href="#top" onClick={() => setView("overview")}>
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
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-link ${view === item.id ? "active" : ""}`}
                onClick={() => setView(item.id)}
                type="button"
              >
                <span className="nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
                {item.id === "reviews" && (
                  <span className="nav-count">{reviews.length}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className={`connection-card ${health ? "online" : "offline"}`}>
              <span className="connection-indicator" />
              <span>
                <strong>API {health ? "connected" : "offline"}</strong>
                <small>
                  {health
                    ? "All systems operational"
                    : "Check your backend server"}
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
              <span className="user-avatar">
                {access?.user?.displayName.slice(0, 1).toUpperCase() ?? "G"}
              </span>
              <span>
                <strong>{access?.user?.displayName ?? "Guest Auditor"}</strong>
                <small>{access?.user?.email ?? "Guest account"}</small>
              </span>
              <span className="profile-menu">•••</span>
            </div>
          </div>
        </aside>

        <main className="main-content" id="top">
          <header className="topbar">
            <div className="breadcrumb">
              <span>Workspace</span>
              <b>/</b>
              <strong>
                {view === "overview" ? "Overview" : "Review history"}
              </strong>
            </div>
            <div className="topbar-actions">
              <span className={`api-status ${health ? "online" : "offline"}`}>
                <i /> {health ? "API online" : "API offline"}
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
                  onClick={() => void handleLogout()}
                  title="Sign out"
                >
                  {access.user.displayName} · Sign out
                </button>
              ) : (
                <button
                  type="button"
                  className="account-button"
                  onClick={() => setIsAuthOpen(true)}
                >
                  Sign in
                </button>
              )}
            </div>
          </header>

          <div className="page-content">
            <section className="page-intro">
              <div>
                <p className="eyebrow intro-eyebrow">
                  <span className="sparkle">✳</span> AI-POWERED CODE ANALYSIS
                </p>
                <h1>
                  {view === "overview" ? (
                    <>
                      Review code.
                      <br />
                      <span>Ship with confidence.</span>
                    </>
                  ) : (
                    <>
                      Your review
                      <br />
                      <span>history.</span>
                    </>
                  )}
                </h1>
                <p className="intro-copy">
                  {view === "overview"
                    ? "Catch security risks, bugs, and performance issues before they reach production."
                    : "Browse previous pull request scans and revisit their findings."}
                </p>
              </div>
              <div className="intro-orbit" aria-hidden="true">
                <div className="orbit-ring ring-one" />
                <div className="orbit-ring ring-two" />
                <span className="orbit-center">✳</span>
                <span className="orbit-node node-one" />
                <span className="orbit-node node-two" />
                <span className="orbit-node node-three" />
              </div>
            </section>

            {pageError && (
              <div className="page-error" role="alert">
                <span>!</span>
                <div>
                  <strong>Could not load the auditor</strong>
                  <p>{pageError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void loadReviews()}
                  aria-label="Retry"
                >
                  Retry
                </button>
              </div>
            )}

            {view === "overview" && (
              <>
                <section className="stats-grid" aria-label="Review statistics">
                  <article className="stat-card">
                    <span className="stat-icon violet">⌘</span>
                    <span className="stat-label">REVIEWS RUN</span>
                    <strong>{isLoading ? "—" : reviews.length}</strong>
                    <small>Saved code reviews</small>
                    <span className="stat-decoration" aria-hidden="true">
                      ↗
                    </span>
                  </article>
                  <article className="stat-card">
                    <span className="stat-icon teal">⌁</span>
                    <span className="stat-label">FINDINGS</span>
                    <strong>{isLoading ? "—" : totalFindings}</strong>
                    <small>Issues identified</small>
                    <span className="stat-decoration" aria-hidden="true">
                      ⌁
                    </span>
                  </article>
                  <article className="stat-card">
                    <span className="stat-icon amber">⌂</span>
                    <span className="stat-label">REPOSITORIES</span>
                    <strong>{isLoading ? "—" : repositoryCount}</strong>
                    <small>Repositories reviewed</small>
                    <span className="stat-decoration" aria-hidden="true">
                      ◌
                    </span>
                  </article>
                </section>

                {access && (
                  <section
                    className={`quota-banner ${access.quota.remaining === 0 ? "quota-empty" : ""}`}
                  >
                    <span className="quota-symbol" aria-hidden="true">
                      {access.type === "user" ? "✓" : "G"}
                    </span>
                    <div className="quota-copy">
                      <strong>
                        {access.type === "guest"
                          ? "Guest reviews"
                          : "Free reviews"}
                        : {access.quota.used} of {access.quota.limit} used
                      </strong>
                      <span>
                        {access.quota.remaining > 0
                          ? `${access.quota.remaining} free ${access.quota.remaining === 1 ? "review" : "reviews"} remaining.`
                          : "Your free review limit is used. Payment options will be added later."}
                      </span>
                    </div>
                    {access.type === "guest" && (
                      <button
                        type="button"
                        className="quota-action"
                        onClick={() => setIsAuthOpen(true)}
                      >
                        {access.quota.remaining === 0
                          ? "Sign in or create account"
                          : "Create account"}
                      </button>
                    )}
                  </section>
                )}
                <ReviewForm
                  isSubmitting={isSubmitting}
                  isLimitReached={access?.quota.remaining === 0}
                  onLoginRequired={
                    access?.type === "guest" && access.quota.remaining === 0
                      ? () => setIsAuthOpen(true)
                      : undefined
                  }
                  onSubmit={handleCreateReview}
                />
                <ReviewList
                  reviews={reviews.slice(0, 5)}
                  selectedId={selectedReview?.id}
                  onSelect={handleSelectReview}
                  onRefresh={() => void loadReviews()}
                  isLoading={isLoading}
                  isRecent
                />
              </>
            )}

            {view === "reviews" && (
              <ReviewList
                reviews={reviews}
                selectedId={selectedReview?.id}
                onSelect={handleSelectReview}
                onRefresh={() => void loadReviews()}
                isLoading={isLoading}
              />
            )}

            {isLoadingDetail && (
              <div className="detail-loading">
                <span className="spinner dark-spinner" /> Loading review
                details…
              </div>
            )}
            {selectedReview && !isLoadingDetail && (
              <ReviewDetail
                review={selectedReview}
                onClose={() => {
                  detailRequestId.current += 1;
                  setIsLoadingDetail(false);
                  setSelectedReview(null);
                }}
              />
            )}
          </div>
          <footer className="page-footer">
            <span>
              AI Code Auditor <span className="footer-dot">·</span> Review
              smarter, ship safer.
            </span>
            <span>Built for thoughtful code reviews</span>
          </footer>
        </main>
      </div>
      {isAuthOpen && (
        <AuthDialog
          googleClientId={
            import.meta.env.VITE_GOOGLE_CLIENT_ID?.startsWith("replace_")
              ? undefined
              : import.meta.env.VITE_GOOGLE_CLIENT_ID
          }
          onClose={() => setIsAuthOpen(false)}
          onAuthenticated={handleAuthenticated}
        />
      )}
    </>
  );
}
