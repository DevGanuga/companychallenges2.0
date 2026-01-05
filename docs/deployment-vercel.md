## Deployment (Vercel)

This repo is designed to work well with Vercel’s Git integration:
- **Preview Deployments** for every pull request
- **Production deployments** from your default branch (typically `main`)

### Vercel setup (once)
1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the GitHub repo.
3. Framework preset: **Next.js** (auto-detected).
4. Build command: `npm run build` (default)
5. Output: managed by Next.js / Vercel (default)

### Environment variables
If/when env vars are required:
1. Add them locally via `.env.local` (from `env.example`)
2. Add the same keys in Vercel:
   - **Production** environment
   - **Preview** environment (so PR previews work)

Notes:
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser.
- Don’t put secrets in `NEXT_PUBLIC_*`.

### Preview Deployments (PR previews)
With Vercel connected to GitHub:
- Opening a pull request automatically creates a **Preview Deployment**
- Each commit updates the preview URL
- Merge to `main` to ship to production (if configured)

### Recommended GitHub branch settings
In GitHub → Settings → Branches:
- Require status checks to pass before merging
  - Use the CI workflow included in `.github/workflows/ci.yml`

### Troubleshooting
- If a preview fails to build, check the Vercel build logs for the failing command.
- If the app depends on env vars, make sure Preview env vars are configured in Vercel.


