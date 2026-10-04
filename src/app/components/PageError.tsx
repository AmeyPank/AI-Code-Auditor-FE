interface PageErrorProps {
  error: string;
  onRetry: () => void;
}

export function PageError({ error, onRetry }: PageErrorProps) {
  if (!error) return null;

  return (
    <div className="page-error" role="alert">
      <span>!</span>
      <div>
        <strong>Could not load the auditor</strong>
        <p>{error}</p>
      </div>
      <button type="button" onClick={onRetry} aria-label="Retry">
        Retry
      </button>
    </div>
  );
}

