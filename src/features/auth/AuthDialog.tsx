import { useEffect, useRef, useState, type FormEvent } from 'react';
import { reviewsApi } from '../reviews/api/reviews-api';
import type { CurrentAccess } from '../../types/review';

interface AuthDialogProps {
  googleClientId?: string;
  onClose: () => void;
  onAuthenticated: (access: CurrentAccess) => void;
}

/** Loads and renders Google's official sign-in button when a client ID is configured. */
function GoogleSignInButton({ clientId, onCredential }: { clientId: string; onCredential: (token: string) => void }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  callbackRef.current = onCredential;

  useEffect(() => {
    const mountButton = () => {
      if (!buttonRef.current || !window.google) return;
      buttonRef.current.replaceChildren();
      window.google.accounts.id.initialize({ client_id: clientId, callback: ({ credential }) => callbackRef.current(credential) });
      window.google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large', width: '320', text: 'continue_with' });
    };

    let script = document.querySelector<HTMLScriptElement>('#google-identity-services');
    if (!script) {
      script = document.createElement('script');
      script.id = 'google-identity-services';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', mountButton);
    if (window.google) mountButton();
    return () => script?.removeEventListener('load', mountButton);
  }, [clientId]);

  return <div className="google-button-slot" ref={buttonRef} />;
}

/** Modal for creating an account, signing in, and optionally using Google OAuth. */
export function AuthDialog({ googleClientId, onClose, onAuthenticated }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function finishAuthentication(action: () => Promise<CurrentAccess>) {
    setError('');
    setIsSubmitting(true);
    try {
      onAuthenticated(await action());
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Sign-in could not be completed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === 'register') {
      void finishAuthentication(() => reviewsApi.register({ displayName: displayName.trim(), email: email.trim(), password }));
    } else {
      void finishAuthentication(() => reviewsApi.login({ email: email.trim(), password }));
    }
  }

  const signInWithGoogle = (credential: string) =>
    void finishAuthentication(() => reviewsApi.googleLogin(credential));

  return (
    <div className="auth-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="auth-close" type="button" onClick={onClose} aria-label="Close sign in">×</button>
        <p className="eyebrow">YOUR REVIEW WORKSPACE</p>
        <h2 id="auth-title">{mode === 'register' ? 'Create your account' : 'Welcome back'}</h2>
        <p className="auth-intro">{mode === 'register' ? 'Save your code reviews to your own account.' : 'Sign in to continue reviewing your code.'}</p>

        {googleClientId
          ? <GoogleSignInButton clientId={googleClientId} onCredential={signInWithGoogle} />
          : <p className="google-setup-note">Google sign-in becomes available after `GOOGLE_CLIENT_ID` is configured.</p>}
        <div className="auth-divider"><span>or use email</span></div>

        <form className="auth-form" onSubmit={submit}>
          {mode === 'register' && <label className="field"><span>Your name</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" required maxLength={120} /></label>}
          <label className="field"><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required maxLength={320} /></label>
          <label className="field"><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={8} maxLength={128} required /></label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="primary-button auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <p className="auth-switch">
          {mode === 'register' ? 'Already have an account?' : 'New to Code Auditor?'}{' '}
          <button type="button" onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }}>
            {mode === 'register' ? 'Sign in' : 'Create account'}
          </button>
        </p>
      </section>
    </div>
  );
}
