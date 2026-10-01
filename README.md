# AI Code Auditor FE

React + TypeScript frontend for submitting pull request diffs and viewing AI review findings.

## Requirements

- Node.js 20.19+ or 22.12+
- The CodeAuditorBE API running locally (port 3000 by default)

## Start

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`. The development server proxies `/api` requests to the backend. If the backend uses a different port, set `API_PROXY_TARGET` in `.env`; see `.env.example`.

The app supports guest use (3 free reviews), email/password accounts (5 free reviews), and optional Google sign-in. Guests can use three reviews without an account. When they try to run a fourth review, the app prompts them to sign in or create an account; signing in provides a separate allowance of five reviews. Review history is tied to the guest ID in this browser or to the signed-in account. To enable Google, set `GOOGLE_CLIENT_ID` here and the matching `GOOGLE_CLIENT_ID` in the backend `.env`. Configure `http://localhost:5173` as an authorized JavaScript origin for that Google OAuth Web Client ID. Payment processing is not connected yet, so users who use all five account reviews cannot continue until billing is implemented.

## Build

```powershell
npm run build
npm run preview
```

## Source layout

- `src/app` — application shell, navigation, and page state.
- `src/features/reviews/api` — typed HTTP calls for review and health endpoints.
- `src/features/reviews/components` — review form, history, detail, and severity display.
- `src/types` — API request and response types.
- `src/styles` — global styles and responsive layout.
