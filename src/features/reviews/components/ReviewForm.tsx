import { useState, type FormEvent } from 'react';
import type { CreateReviewInput, Review } from '../../../types/review';

interface ReviewFormProps {
  isSubmitting: boolean;
  isLimitReached?: boolean;
  onLoginRequired?: () => void;
  onSubmit: (input: CreateReviewInput) => Promise<Review>;
}

const sampleDiff = `diff --git a/src/auth.ts b/src/auth.ts
new file mode 100644
--- /dev/null
+++ b/src/auth.ts
@@ -0,0 +1,4 @@
+export function findUser(db, token: string) {
+  return db.query(\`SELECT * FROM users WHERE token = '\${token}'\`);
+}
`;

export function ReviewForm({ isSubmitting, isLimitReached = false, onLoginRequired, onSubmit }: ReviewFormProps) {
  const [repository, setRepository] = useState('');
  const [pullRequest, setPullRequest] = useState('');
  const [diff, setDiff] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      await onSubmit({
        repository: repository.trim(),
        pullRequest: pullRequest.trim() || undefined,
        diff,
      });
      setPullRequest('');
      setDiff('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Review could not be created.');
    }
  }

  return (
    <section className="panel submit-panel" id="new-review">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">NEW ANALYSIS</p>
          <h2>Review a pull request</h2>
          <p className="muted">Paste a unified diff to scan for risks and improvements.</p>
        </div>
        <span className="panel-icon" aria-hidden="true">⌘</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="field">
            <span>Repository <span className="required">*</span></span>
            <input
              value={repository}
              onChange={(event) => setRepository(event.target.value)}
              placeholder="acme/payments-api"
              maxLength={300}
              required
            />
          </label>
          <label className="field pull-request-field">
            <span>Pull request</span>
            <span className="input-with-prefix">
              <span className="input-prefix">#</span>
              <input
                value={pullRequest}
                onChange={(event) => setPullRequest(event.target.value)}
                placeholder="42"
                maxLength={100}
              />
            </span>
          </label>
        </div>

        <label className="field diff-field">
          <span>Unified diff <span className="required">*</span></span>
          <div className="editor-shell">
            <div className="editor-toolbar">
              <span className="editor-dots"><i /><i /><i /></span>
              <span>PATCH</span>
              <button type="button" className="text-button" onClick={() => setDiff(sampleDiff)}>
                Use sample diff
              </button>
            </div>
            <textarea
              value={diff}
              onChange={(event) => setDiff(event.target.value)}
              placeholder={'diff --git a/src/file.ts b/src/file.ts\n--- a/src/file.ts\n+++ b/src/file.ts\n@@ -1,2 +1,3 @@\n ...'}
              rows={10}
              required
              spellCheck={false}
              aria-label="Unified diff text"
            />
            <div className="editor-footer">
              <span><span className="green-dot" /> Diff input</span>
              <span>{diff.length.toLocaleString()} characters</span>
            </div>
          </div>
        </label>

        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="form-actions">
          <span className="privacy-note">Your diff is sent to Gemini for analysis.</span>
          <button
            className="primary-button"
            type={isLimitReached && onLoginRequired ? 'button' : 'submit'}
            onClick={isLimitReached ? onLoginRequired : undefined}
            disabled={isSubmitting || (isLimitReached ? !onLoginRequired : !repository.trim() || !diff.trim())}
          >
            {isLimitReached ? onLoginRequired ? 'Sign in to continue' : 'Free review limit reached' : isSubmitting ? <><span className="spinner" /> Reviewing…</> : <>Run code review <span aria-hidden="true">↗</span></>}
          </button>
        </div>
      </form>
    </section>
  );
}
