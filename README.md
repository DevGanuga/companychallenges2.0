## Company Challenges Platform (Rebuild)

Web platform for delivering structured learning trajectories (“challenges”) composed of reusable “assignments”, with an admin-focused rebuild to fix reuse/variants and operational independence.

### What’s in this repo
- **App**: Next.js (App Router) web application.
- **Docs**: product + engineering docs (see `docs/`).

### Key product constraints
- **No participant accounts** (anonymous access via URL).
- **Participant experience unchanged** for this rebuild; focus is admin + architecture improvements.

---

## Quick start

### Prerequisites
- **Node.js**: `20.x` (see `.nvmrc`)
- **npm**: comes with Node; use `npm ci` for reproducible installs

### Install

```bash
npm ci
```

### Run locally

```bash
npm run dev
```

Then open `http://localhost:3000`.

---

## Scripts
- **dev**: `npm run dev` — start the Next.js dev server
- **build**: `npm run build` — production build
- **start**: `npm run start` — run production server locally
- **lint**: `npm run lint` — ESLint
- **typecheck**: `npm run typecheck` — TypeScript checks (no emit)

---

## Environment variables
This project currently runs without required environment variables.

When env vars are introduced:
- Create a local file named `.env.local`
- Use `env.example` as the template
- Never commit secrets

---

## Tech stack
- **Framework**: Next.js
- **UI**: React
- **Styling**: Tailwind CSS
- **Language**: TypeScript

---

## Repository structure
- `app/`: Next.js App Router pages/layouts
- `public/`: static assets
- `docs/`: product + engineering documentation (start here: `docs/README.md`)

---

## Documentation
- **PRD**: `docs/prd.md`
- **Docs index**: `docs/README.md`
- **Local development**: `docs/development.md`
- **Deployment / Vercel preview**: `docs/deployment-vercel.md`
- **Architecture (high-level)**: `docs/architecture.md`

---

## Deployment (Vercel)
See `docs/deployment-vercel.md` for:
- Connecting the GitHub repo to Vercel
- Automatic **Preview Deployments** on pull requests
- Promoting to production

---

## Contributing / security
- Contributing guide: `CONTRIBUTING.md`
- Security policy: `SECURITY.md`

