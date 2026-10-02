# AI Code Auditor — Frontend (FE)

A modern, responsive React and TypeScript single-page application (SPA) for analyzing pull request diffs, visualizing AI-generated code review findings, and tracking code quality across repositories.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation & Getting Started](#installation--getting-started)
- [Available Scripts](#available-scripts)
- [Authentication & Quota System](#authentication--quota-system)
- [API Integration](#api-integration)
- [Production Build](#production-build)

---

## Overview

The AI Code Auditor frontend provides an intuitive, developer-focused interface to submit unified git diffs for automated code review. Powered by an AI backend, it inspects code changes for potential security vulnerabilities, performance bottlenecks, syntax bugs, and stylistic improvements, rendering interactive findings with inline code suggestions.

---

## Key Features

- **Unified Diff Submission**:
  - Submit diffs with repository name, optional PR identifier (e.g., `#42` or branch name), and unified diff text.
  - Built-in **Sample Diff** button to quickly test and preview audit capabilities.
- **Detailed Findings & Severity Matrix**:
  - Classifies findings across 5 severity levels: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, and `INFO`.
  - Categorizes issues by type: `SECURITY`, `BUG`, `PERFORMANCE`, `STYLE`, and `MAINTAINABILITY`.
  - Highlights affected file paths, line numbers, issue descriptions, and remediation code snippets.
- **Real-Time Workspace Metrics**:
  - Overview dashboard displaying Total Reviews, Total Findings Discovered, Monitored Repositories, and Live Backend Service Health status.
- **Review History**:
  - Browse past review reports with status indicators (`COMPLETED` / `FAILED`), finding counts, and timestamps.
- **Tiered Access & Quota Tracking**:
  - **Guest Mode**: 3 free reviews out-of-the-box (tracked anonymously per browser via persistent client UUID).
  - **Registered Account**: 5 free reviews upon signing in.
  - Live quota counter and quota-exhaustion prompts guiding users to register or upgrade.
- **Dual Authentication**:
  - Email & password sign-up and sign-in.
  - One-click Google Sign-In via Google Identity Services (`VITE_GOOGLE_CLIENT_ID`).

---

## Tech Stack

| Category | Technology |
| --- | --- |
| **Framework** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Build Tool & Dev Server** | [Vite 7](https://vitejs.dev/) |
| **Styling** | Modern CSS3 (CSS custom properties, flex/grid layouts, dark theme) |
| **Auth** | Cookie-based sessions & Google Identity Services SDK |

---

## Project Architecture

```
CodeAuditorFE/
├── public/                 # Static assets
├── src/
│   ├── app/
│   │   └── App.tsx         # Main application shell, state coordinator & routing views
│   ├── features/
│   │   ├── auth/
│   │   │   └── AuthDialog.tsx  # Sign-in / register modal supporting email & Google OAuth
│   │   └── reviews/
│   │       ├── api/
│   │       │   └── reviews-api.ts # Strongly-typed API client, guest ID manager & error parser
│   │       └── components/
│   │           ├── ReviewDetail.tsx   # Detailed review view with finding cards & suggestions
│   │           ├── ReviewForm.tsx     # Submission form with sample diff loader
│   │           ├── ReviewList.tsx     # Historical review table & filter list
│   │           └── SeverityBadge.tsx  # Color-coded severity badge component
│   ├── styles/
│   │   └── global.css      # Core theme, variables, components, and responsive typography
│   ├── types/
│   │   ├── google-identity.d.ts # TypeScript declarations for Google Identity Services
│   │   └── review.ts       # Domain interfaces (Review, Finding, Quota, User, Severity)
│   ├── main.tsx            # React application root entrypoint
│   └── vite-env.d.ts       # Vite client environment type declarations
├── .env.example            # Template for environment configuration
├── package.json            # Scripts and dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build and proxy configuration
```

---

## Prerequisites

Before running the frontend, ensure you have:

- **Node.js**: `v20.19.0+` or `v22.12.0+`
- **npm**: `v10+`
- **Backend API**: The [CodeAuditorBE](../CodeAuditorBE) NestJS server running (by default on `http://localhost:3000`).

---

## Environment Variables

Copy `.env.example` to create your local `.env` file:

```powershell
cp .env.example .env
```

| Variable | Default Value | Description |
| --- | --- | --- |
| `API_BASE_URL` | `/api/v1` | Base route path for backend API endpoints. |
| `API_PROXY_TARGET` | `http://localhost:3000` | Target URL where Vite proxies `/api` calls during development. |
| `VITE_GOOGLE_CLIENT_ID` | `""` | *(Optional)* Google OAuth 2.0 Web Client ID for Google Sign-In. |

> **Note on Google Sign-In**: To enable Google OAuth, register your OAuth Web Client ID in the Google Cloud Console and add `http://localhost:5173` to **Authorized JavaScript origins**.

---

## Installation & Getting Started

1. **Install dependencies**:

   ```powershell
   npm install
   ```

2. **Start the development server**:

   ```powershell
   npm run dev
   ```

3. **Open the application**:  
   Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

> Vite automatically proxies any HTTP request starting with `/api` to the backend address specified in `API_PROXY_TARGET` (defaulting to port `3000`), preventing local CORS issues.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts Vite local development server with hot-module reloading (HMR) at port `5173`. |
| `npm run build` | Runs TypeScript type-checks (`tsc --noEmit`) and compiles optimized production assets into `dist/`. |
| `npm run preview` | Serves the production build locally to test bundle behavior prior to deployment. |

---

## Authentication & Quota System

The application implements a progression-based quota lifecycle:

1. **Guest Sessions**:
   - New visitors receive a persistent UUID stored in `localStorage` (`ai-code-auditor.guest-id`), sent in the `x-guest-id` HTTP header.
   - Guests have an initial allowance of **3 free reviews**.
2. **Account Sign-Up & Sign-In**:
   - When the guest quota is reached (or manually via the top navigation), users are prompted to log in or register.
   - Creating an account grants an independent allowance of **5 free reviews**.
3. **Usage Limits**:
   - The UI displays current usage (`X / Y reviews used`). When the limit is exhausted, review submissions are blocked with an upgrade prompt until billing integration is implemented.

---

## API Integration

The frontend connects to the following backend REST routes:

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/health` | Checks backend service health and availability. |
| `GET` | `/api/v1/auth/me` | Fetches current user status and quota consumption. |
| `POST` | `/api/v1/auth/register` | Registers a new account with email, password, and display name. |
| `POST` | `/api/v1/auth/login` | Authenticates with email and password credentials. |
| `POST` | `/api/v1/auth/google` | Validates Google ID token for single sign-on. |
| `POST` | `/api/v1/auth/logout` | Clears authentication session cookies. |
| `GET` | `/api/v1/reviews?limit=100` | Retrieves review history for the active user/guest. |
| `GET` | `/api/v1/reviews/:id` | Fetches full report including diff, summary, and findings. |
| `POST` | `/api/v1/reviews` | Submits a new PR diff for AI analysis. |

Interactive API documentation and schema definitions are hosted by the backend Swagger UI at [http://localhost:3000/api/docs](http://localhost:3000/api/docs).

---

## Production Build

To build the application for deployment:

```powershell
npm run build
```

This generates a static build in the `dist/` directory, ready to be deployed to any static hosting provider (e.g., Firebase Hosting, Vercel, Netlify, Nginx, or AWS S3/CloudFront). For production hosting, ensure the reverse proxy or API gateway maps `/api` requests to the production backend URL.

