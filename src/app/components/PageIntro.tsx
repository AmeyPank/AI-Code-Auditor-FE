import type { View } from '../types';

interface PageIntroProps {
  view: View;
}

export function PageIntro({ view }: PageIntroProps) {
  const isOverview = view === 'overview';

  return (
    <section className="page-intro">
      <div>
        <p className="eyebrow intro-eyebrow">
          <span className="sparkle">✳</span> AI-POWERED CODE ANALYSIS
        </p>
        <h1>
          {isOverview ? (
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
          {isOverview
            ? 'Catch security risks, bugs, and performance issues before they reach production.'
            : 'Browse previous pull request scans and revisit their findings.'}
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
  );
}

