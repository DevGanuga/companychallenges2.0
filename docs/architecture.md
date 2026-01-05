## Architecture (high-level)

### Context
This is a rebuild of the Company Challenges Platform with a strong constraint: **participant experience remains unchanged**, while the admin experience and underlying structure are improved.

See the PRD for the authoritative product requirements: `docs/prd.md`.

### Current state (in this repo)
- Next.js App Router application (UI + server components where applicable)
- Tailwind CSS for styling
- TypeScript + ESLint

### Target domain model (from PRD)
- **Client**: an organization using the platform
- **Challenge**: a container that sequences assignments
- **Assignment**: reusable atomic content unit
- **AssignmentUsage**: relationship entity that places an assignment into a challenge with per-challenge properties (order, visibility, release schedule, etc.)

The key architectural concept is the separation between **Assignment** and **AssignmentUsage**, enabling true content reuse across challenges.

### Non-goals for this rebuild
Avoid introducing architecture that assumes:
- participant identities / accounts
- participant submissions
- progress tracking

### Next architecture decisions (to capture as ADRs)
As implementation begins, capture decisions like:
- database choice + schema
- rich text editor choice + storage format (JSON vs HTML)
- media hosting strategy
- analytics approach (GA4 vs custom)


