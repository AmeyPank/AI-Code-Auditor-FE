import type { CurrentAccess } from '../../../types/review';

interface QuotaBannerProps {
  access: CurrentAccess;
  onOpenAuth: () => void;
}

export function QuotaBanner({ access, onOpenAuth }: QuotaBannerProps) {
  const isLimitReached = access.quota.remaining === 0;
  const isGuest = access.type === 'guest';
  const labelPrefix = isGuest ? 'Guest reviews' : 'Free reviews';

  return (
    <section className={`quota-banner ${isLimitReached ? 'quota-empty' : ''}`}>
      <span className="quota-symbol" aria-hidden="true">
        {access.type === 'user' ? '✓' : 'G'}
      </span>
      <div className="quota-copy">
        <strong>
          {labelPrefix}: {access.quota.used} of {access.quota.limit} used
        </strong>
        <span>
          {access.quota.remaining > 0
            ? `${access.quota.remaining} free ${access.quota.remaining === 1 ? 'review' : 'reviews'} remaining.`
            : 'Your free review limit is used. Payment options will be added later.'}
        </span>
      </div>
      {isGuest && (
        <button
          type="button"
          className="quota-action"
          onClick={onOpenAuth}
        >
          {isLimitReached ? 'Sign in or create account' : 'Create account'}
        </button>
      )}
    </section>
  );
}

