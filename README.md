# Bidify Web

Frontend web app for the Bidify auction platform, built with React, TypeScript, Vite, Tailwind CSS, and TanStack Query.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- Auction backend API running and reachable from the browser

## Setup

Install dependencies:

```bash
npm install
```

Create local environment config:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Update `.env` with the backend URL and third-party client keys.

## Environment Variables

```env
VITE_API_URL=http://localhost:8080
VITE_MIDTRANS_CLIENT_KEY=
VITE_MIDTRANS_IS_PRODUCTION=false
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_VAPID_KEY=
```

Notes:

- `VITE_API_URL` should point to the auction service API.
- `VITE_MIDTRANS_IS_PRODUCTION=false` uses the Midtrans sandbox script.
- Firebase variables are used for web push notification registration.

## Development

Run the dev server:

```bash
npm run dev
```

Vite will print the local URL, usually `http://localhost:5173`.

## Production Build

Run TypeScript and Vite production build:

```bash
npm run build
```

Preview the built app locally:

```bash
npm run preview
```

## Quality Checks

Run ESLint:

```bash
npm run lint
```

Recommended pre-deploy check:

```bash
npm run lint
npm run build
```

## Deployment Notes

- Build output is generated in `dist/`.
- Serve `dist/` with SPA fallback to `index.html` so routes like `/auction-rules` and `/own/bids` work after refresh.
- Make sure production environment variables are configured in the hosting platform before building.
- Do not commit `.env`; use `.env.example` as the shared template.
