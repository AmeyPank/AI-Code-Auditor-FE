import { AuthDialog } from '../features/auth/AuthDialog';
import { QuotaBanner } from '../features/reviews/components/QuotaBanner';
import { ReviewDetail } from '../features/reviews/components/ReviewDetail';
import { ReviewForm } from '../features/reviews/components/ReviewForm';
import { ReviewList } from '../features/reviews/components/ReviewList';
import { StatsGrid } from '../features/reviews/components/StatsGrid';
import { PageError } from './components/PageError';
import { PageFooter } from './components/PageFooter';
import { PageIntro } from './components/PageIntro';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { useReviewWorkspace } from './hooks/useReviewWorkspace';

export default function App() {
  const {
    view,
    setView,
    reviews,
    selectedReview,
    health,
    access,
    isAuthOpen,
    setIsAuthOpen,
    pageError,
    isLoading,
    isSubmitting,
    isLoadingDetail,
    totalFindings,
    repositoryCount,
    loadReviews,
    handleCreateReview,
    handleSelectReview,
    handleCloseDetail,
    handleAuthenticated,
    handleLogout,
  } = useReviewWorkspace();

  const isLimitReached = access?.quota.remaining === 0;
  const onLoginRequired =
    access?.type === 'guest' && isLimitReached ? () => setIsAuthOpen(true) : undefined;

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.startsWith('replace_')
    ? undefined
    : import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <>
      <div className="app-shell">
        <Sidebar
          view={view}
          onSelectView={setView}
          reviewCount={reviews.length}
          health={health}
          access={access}
        />

        <main className="main-content" id="top">
          <Topbar
            view={view}
            health={health}
            access={access}
            onOpenAuth={() => setIsAuthOpen(true)}
            onLogout={() => void handleLogout()}
          />

          <div className="page-content">
            <PageIntro view={view} />

            <PageError error={pageError} onRetry={() => void loadReviews()} />

            {view === 'overview' && (
              <>
                <StatsGrid
                  reviewsCount={reviews.length}
                  totalFindings={totalFindings}
                  repositoryCount={repositoryCount}
                  isLoading={isLoading}
                />

                {access && (
                  <QuotaBanner
                    access={access}
                    onOpenAuth={() => setIsAuthOpen(true)}
                  />
                )}

                <ReviewForm
                  isSubmitting={isSubmitting}
                  isLimitReached={isLimitReached}
                  onLoginRequired={onLoginRequired}
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

            {view === 'reviews' && (
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
                <span className="spinner dark-spinner" /> Loading review details…
              </div>
            )}

            {selectedReview && !isLoadingDetail && (
              <ReviewDetail
                review={selectedReview}
                onClose={handleCloseDetail}
              />
            )}
          </div>

          <PageFooter />
        </main>
      </div>

      {isAuthOpen && (
        <AuthDialog
          googleClientId={googleClientId}
          onClose={() => setIsAuthOpen(false)}
          onAuthenticated={handleAuthenticated}
        />
      )}
    </>
  );
}

