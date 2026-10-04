import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, reviewsApi } from '../../features/reviews/api/reviews-api';
import type { CreateReviewInput, CurrentAccess, HealthStatus, Review, ReviewListItem } from '../../types/review';
import type { View } from '../types';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong while loading the auditor.';
}

export function useReviewWorkspace() {
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

    if (healthResult.status === 'fulfilled') {
      setHealth(healthResult.value);
    } else {
      setHealth(null);
    }

    if (accessResult.status === 'fulfilled') {
      setAccess(accessResult.value);
    }

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
      if (created.quota && access) {
        setAccess({ ...access, quota: created.quota });
      }
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
      if (requestId === detailRequestId.current) {
        setSelectedReview(review);
      }
    } catch (error) {
      if (requestId === detailRequestId.current) {
        setPageError(getErrorMessage(error));
      }
    } finally {
      if (requestId === detailRequestId.current) {
        setIsLoadingDetail(false);
      }
    }
  }

  function handleCloseDetail() {
    detailRequestId.current += 1;
    setIsLoadingDetail(false);
    setSelectedReview(null);
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

  return {
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
  };
}

