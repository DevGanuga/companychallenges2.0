## Local development

### Prerequisites
- **Node.js**: `20.x` (see `.nvmrc`)
- **npm**: use `npm ci` for reproducible installs

### Install dependencies

```bash
npm ci
```

### Run the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

### Useful commands
- **Lint**:

```bash
npm run lint
```

- **Typecheck**:

```bash
npm run typecheck
```

- **Production build**:

```bash
npm run build
```

### Environment variables
This project currently runs without required env vars.

When env vars are added:
- Copy `env.example` → `.env.local`
- Keep `.env.local` out of git (see `.gitignore`)
- Add any new variables to `env.example` and document them here

### Project conventions (lightweight)
- **Keep participant UX stable**: changes that alter participant flows should be explicitly reviewed against the PRD.
- **Prefer reusable content**: model decisions should preserve the `Assignment` + `AssignmentUsage` separation described in the PRD.


