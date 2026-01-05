## Product Requirements Document (PRD)

### Company Challenges Platform — First Rebuild

- **Document version**: v1.0 (restructured)
- **Date**: 2026-01-05
- **Project type**: Platform rebuild (existing functionality + structural improvements)

---

### Executive summary
The Company Challenges Platform is a web-based content delivery system that enables organizations to share structured learning trajectories (“challenges”) with employees. This PRD defines requirements for the first rebuild, focusing on operational independence, improved admin content management, and elimination of structural inefficiencies **without changing the participant experience**.

### Goals
- **Operational independence**: deploy, run, and maintain on client-controlled infrastructure.
- **Admin productivity**: dramatically reduce repetitive work via reusable content and clearer relationships.
- **Clean foundation**: clear entity boundaries and extensibility for future iterations.

### Key constraint
- **Participant experience is intentionally unchanged** in this rebuild (URLs, anonymous access, reading experience, navigation flow).

---

### Table of contents
- Overview
- Users & principles
- Glossary & data model
- Functional requirements
- Admin interface requirements
- Analytics (privacy-light)
- Non-functional requirements (security, accessibility, performance, browser support)
- Out of scope (must not be blocked)
- Success metrics
- Delivery phases
- Risks & mitigations
- Open questions
- Appendix: reference materials

---

## Overview

### Problem statement
The current platform works but has structural issues that increase admin overhead and limit maintainability:
- **Content reuse is broken**: assignments cannot be reused across challenges without manual duplication.
- **Variant management is manual**: language/difficulty variants require full duplication + manual hyperlink management.
- **Administrative overhead is high**: repetitive operations are required for everyday challenge management.
- **Visual quality is inconsistent**: layout/scaling issues produce unpredictable presentation.
- **Operational dependency**: hosting/maintenance cannot be owned independently.

---

## Users & principles

### Target users
- **Primary**: Platform administrators
  - **Responsibilities**: create, manage, distribute challenges; author assignments; manage reuse/variants.
  - **Needs**: fast content management, reuse, visibility into relationships, safety, reliable preview.
- **Secondary**: Participants (end users)
  - **Responsibilities**: consume challenge content.
  - **Needs**: anonymous URL access, calm reading experience, reliable media playback, self-paced navigation.

### Core principles
- **No participant accounts**
  - No login required
  - No personal data collection
  - No participant uploads/submissions
  - Anonymous, frictionless access
- **URL-based access model**
  - Every challenge has a unique public URL
  - Every assignment has a unique public URL
  - Direct access (no navigation barriers)
- **Privacy-light architecture**
  - Anonymous analytics only
  - No individual tracking/profiling
  - Shared access passwords (access gate, not authentication)
- **Management over features**
  - Reduce admin effort before adding participant features
  - Content reuse and structural clarity are central goals
  - Future extensibility must not be blocked by architecture decisions

---

## Glossary & data model

### Entities

#### Client
- **Purpose**: an organization using the platform.
- **Properties**
  - Name (string, required)
  - Logo (image, optional)
- **Admin capabilities**
  - Create / edit / delete clients (with safeguards)

#### Challenge
- **Purpose**: a container that sequences assignments into a learning trajectory.
- **Properties**
  - Internal name (string, admin-only)
  - Public title (string, optional; display toggle)
  - Description (rich text)
  - Brand color (hex)
  - Support information (rich text)
  - Challenge visual (image)
  - Unique public URL (auto-generated)
  - Client ID (required)
  - Active/archived status (boolean)
  - Folder/project grouping (minimum one level)
- **Key behaviors**
  - A challenge **does not own** assignments; it references them via `AssignmentUsage`.
  - Challenge duplication copies **structure + references**, not assignment content.
  - Archiving is **soft-delete**.

#### Assignment
- **Purpose**: a standalone, reusable content unit (atomic building block).
- **Properties**
  - Internal title (string, admin-only)
  - Public title (string, optional)
  - Subtitle (string, optional)
  - Description (rich text)
  - Visual (image upload)
  - Media URL (optional; embedded video)
  - Password (optional; shared access key)
  - Unique public URL (auto-generated)
- **Key behaviors**
  - Exists independently of challenges.
  - Can be referenced by multiple challenges simultaneously.
  - Can be duplicated (new entity + new URL).
  - Can reference other assignments as **admin-only metadata** for variants.

#### AssignmentUsage (relationship entity)
- **Purpose**: defines how a specific assignment appears within a specific challenge.
- **Properties**
  - Challenge ID (FK)
  - Assignment ID (FK)
  - Order/position (int)
  - Visibility (boolean: shown/hidden)
  - Release date (datetime, optional)
  - Label (string, optional)
- **Why it matters**
  - Enables true reuse without duplication
  - Allows different sequencing/pacing per challenge
  - Creates a foundation for future conditional logic without breaking content structure

---

## Functional requirements

### Participant experience (unchanged)

#### Access flow
1. Participant receives challenge URL (email/chat/etc.)
2. Open URL → challenge overview page
3. View list of available assignments
4. Open assignment
   - If public: content loads
   - If gated: password prompt appears before content loads
5. Read content / play media if present
6. “Complete” button returns to challenge overview

#### Participant capabilities
- View challenge overview and description
- Navigate between assignments and back to overview
- Enter passwords when required
- Play embedded media

#### Explicitly not included (participant)
- No login/accounts
- No progress saving
- No submissions/uploads
- No social features
- No user profiles / identification

---

### Admin functional requirements

#### Content editing & rich text (critical)
All rich text fields (challenge description, support info, assignment description/instructions) must support:
- Headings (H1/H2/H3)
- Paragraphs with line breaks
- Bold / italic / underline
- Bulleted and numbered lists
- Hyperlinks (add/edit/remove)
- Inline images
- Emoji/icon insertion
- Embedded media (video, audio) where appropriate
- Copy/paste from external sources (Word/Google Docs) without breaking formatting
- Undo/redo

Implementation note: the editor is a **core daily-use component**; poor editing UX directly harms admin productivity.

#### Layout & visual scaling (critical)
Requirements:
- No fixed-height containers for user content
- Layout scales fluidly based on content length
- No clipped images, awkward whitespace, or scroll-within-scroll
- Responsive across desktop and mobile

Failures to avoid:
- Cropping long content via fixed windows
- Excess whitespace when content is short
- Non-proportional image scaling

#### Management & reuse (primary rebuild driver)
Required improvements:
- **Create once, reuse everywhere**
  - Assignments are standalone and reusable across challenges by reference
  - Single source of truth: editing an assignment updates all usages
- **Visibility & tracking**
  - View all challenges using an assignment
  - See usage count
  - Navigate from assignment → challenges where it’s used
- **Duplication when needed**
  - Explicit “Duplicate assignment” creates an independent copy (new ID + new URL)
  - Changes to duplicates do not affect the original
- **Challenge duplication**
  - Duplicating a challenge copies structure + assignment references (not content)
  - New challenge gets a new URL
- **Archival**
  - Challenges can be archived/restored (soft delete)

#### Assignment passwords (critical)
Purpose: staged access control without accounts.

Requirements:
- Passwords are **shared access keys**, not user authentication.
- Single password per assignment (set/change/remove).
- Password prompt appears before assignment content loads.
- Rate limiting on password attempts (see Security).

Clarifications:
- No user identity linkage
- No user/password tracking
- No “password reset” flows (admin can change the shared key)

#### Scheduled release (challenge-level)
Purpose: automate availability without manual admin intervention.

Requirements:
- Release logic is defined per `AssignmentUsage` (challenge-level), not per assignment.
- The same assignment can have different release schedules in different challenges.
- Before release: assignment is hidden or shows “Available on [date]”.
- After release: assignment is accessible normally.
- Scheduling can be combined with passwords.

Explicitly not required (this rebuild):
- Participant notifications (email/push)

#### Variants (minimum viable)
Goal: stop manual hyperlink spaghetti.

Requirements:
- Assignments can reference other assignments as **metadata relationships** (not in-body links).
- Admin can create, view, and navigate relationships.
- Not exposed to participants (yet).

Examples of relationship labels:
- “English version”
- “French translation”
- “Advanced version”

Explicitly not required (this rebuild):
- Automatic language detection/switching
- Participant-facing language/difficulty selection UI
- Multi-language UI

Future extension path: participant-facing variant selection without restructuring content.

---

## Admin interface requirements

### Client management
- List clients (name, logo thumbnail)
- Create client (name, logo upload)
- Edit client
- Delete client (confirm + safeguards if challenges exist)

### Challenge management (per client)
- List challenges for selected client
- Show status (active/archived)
- Folder/project grouping (minimum one level)
- Create challenge
- Edit challenge properties
- Duplicate challenge
- Archive/restore challenge
- Copy challenge URL
- Preview participant view

### Assignment management (within a challenge)
- List assignments in challenge order
- Drag-and-drop reordering
- Add existing assignment (reference)
- Create new assignment
- Remove assignment from challenge (break reference; does not delete assignment)
- Edit usage properties (visibility, release date, label)
- Quick link to edit assignment content

### Assignment library (cross-challenge)
- View all assignments (across all challenges)
- Search by title/content
- Filter by client and/or usage in challenges
- Show usage count per assignment
- Create / edit / duplicate assignment
- View “used in” (challenges list)

### Bulk operations (nice to have)
- CSV/Excel import for assignment list
- Bulk reordering
- Bulk release date setting

---

## Analytics (minimum viable, privacy-light)

### Purpose
Understand usage patterns without identifying individuals.

### Events to track
- Challenge page viewed
- Assignment page viewed
- Media play/clicked
- Password attempt (success/failure)

### Event metadata
- Client ID
- Challenge ID
- Assignment ID
- Timestamp

### Privacy constraints
- No personal identifiers
- No IP address storage
- No user tracking across sessions

### Reporting needs
- Views per challenge
- Views per assignment
- Media engagement rate (clicks/views)
- Comparisons between challenges/assignments

### Implementation
- GA4 preferred, or simple server-side event logging
- Must be anonymous and GDPR-compliant

Explicitly not required:
- Session recording
- Heatmaps
- A/B testing infrastructure
- Individual user profiles/funnels

---

## Non-functional requirements

### Hosting & operational independence (critical)
Delivery requirements:
- Complete source code access
- Clear deployment documentation
- Environment setup guide
- Dependency list and versions
- No proprietary/locked components
- No hidden external dependencies required to operate
- Deployable on client infrastructure
- Maintainable without relying on a third party

Technology preferences:
- Modern, well-documented frameworks
- Cloud-agnostic hosting where possible
- Clear separation of concerns
- Avoid vendor lock-in

### Performance & scalability (replace “LLM-y” guesses with testable SLOs)
This rebuild should be designed for **typical SMB-to-mid-market usage**, but we will not hardcode fake load projections in the PRD. Instead:

- **Sizing assumptions (to confirm)**:
  - Number of clients, challenges, assignments, and traffic must be confirmed from the current system and/or stakeholder input.
  - Data model and queries must remain efficient as counts grow by at least an order of magnitude from “today’s” usage.

- **Performance SLOs (measured at p95)**:
  - **Challenge overview load**: content usable within a reasonable budget on modern devices/browsers.
  - **Assignment page load**: render text/images without jank; avoid layout shifts.
  - **Media start**: when participant clicks play, media begins promptly (subject to provider/network).
  - **Admin CRUD actions**: create/edit operations feel responsive; long operations show progress states.

Measurement notes:
- Use **Web Vitals** (LCP/INP/CLS) for participant pages and capture p95 in production.
- Use **p95 API latency** for admin CRUD endpoints, plus UI responsiveness metrics where relevant.

Note: final numeric targets (e.g., “LCP <= Xs”) should be set after baseline measurements on the current platform and after choosing hosting + media delivery approach.

### Browser support
- Chrome: latest 2 versions
- Firefox: latest 2 versions
- Safari: latest 2 versions
- Edge: latest 2 versions
- Mobile Safari: last 2 major iOS versions
- Mobile Chrome: last 2 major Android versions

### Accessibility
- Target: WCAG 2.1 AA (contrast, keyboard nav, focus states, semantic structure)

### Security requirements
- HTTPS only
- Secure password storage (even if shared keys)
- SQL injection prevention
- XSS protection
- CSRF protection (where applicable)
- Rate limiting on password attempts
- No sensitive data in URLs (except opaque IDs)

---

## Explicitly out of scope (first rebuild)
These are excluded, but must not be architecturally blocked.

### Participant-side
- Accounts/login
- Progress saving/bookmarking
- Answer submission / quizzes / assessments
- Certificates / completion tracking
- Social features (comments/likes/forums)
- Notifications

### Admin-side
- LMS integrations
- SSO/SAML
- Advanced analytics (cohorts/funnels)
- A/B testing
- Automated email campaigns
- Public API for external systems

### Content/experience
- Interactive elements (polls/quizzes)
- Gamification (points/badges/leaderboards)
- Branching/conditional logic
- Personalization based on user data

### Technical
- Multi-language admin UI
- Native mobile apps
- Offline mode

---

## Success metrics

### Primary success criteria
- **Operational independence achieved**: platform can be deployed, run, and maintained entirely by the client team.
- **Assignment reuse works**: the same assignment can be used in multiple challenges without duplication.
- **Admin time reduced**: creating a new challenge using existing assignments takes **< 10 minutes**.
- **Visual quality consistent**: no layout/scaling issues across varied content lengths.
- **Zero regression**: participant-facing functionality matches current behavior.

### Secondary success criteria
- Positive admin feedback on management interface
- Fewer support requests about reuse/variants
- Codebase is understandable by external developers

---

## User stories

### Admin user stories
- **Client management**
  - As an admin, I can create a new client with name and logo so I can organize challenges by organization.
  - As an admin, I can edit client details so I can keep information current.
  - As an admin, I can delete a client so I can remove organizations no longer using the platform.
- **Challenge management**
  - As an admin, I can create a new challenge with title, description, and branding so participants have clear context.
  - As an admin, I can organize challenges into folders so I can manage multiple projects efficiently.
  - As an admin, I can duplicate a challenge so I can quickly create variations for different groups.
  - As an admin, I can archive a challenge so it’s hidden but recoverable if needed.
  - As an admin, I can preview a challenge so I see what participants will experience.
  - As an admin, I can copy a challenge URL so I can distribute it to participants.
- **Assignment creation & management**
  - As an admin, I can create a standalone assignment with rich text, images, and media so I build reusable content.
  - As an admin, I can add an existing assignment to a challenge so I avoid duplicating content.
  - As an admin, I can reorder assignments within a challenge so I control the sequence.
  - As an admin, I can see which challenges use an assignment so I understand content relationships.
  - As an admin, I can duplicate an assignment so I can create a modified version without affecting the original.
  - As an admin, I can edit an assignment knowing it updates everywhere it’s used.
  - As an admin, I can remove an assignment from a challenge without deleting the assignment itself.
- **Content editing**
  - As an admin, I can format content so I create professional-looking assignments.
  - As an admin, I can embed images inline so visuals enhance text.
  - As an admin, I can add hyperlinks so I can reference external resources.
  - As an admin, I can paste content from Docs/Word without formatting breaking.
- **Access control**
  - As an admin, I can add a password to an assignment so access is controlled.
  - As an admin, I can set a release date for an assignment so it unlocks automatically.
  - As an admin, I can combine passwords and release dates so I have flexible pacing options.
- **Variants**
  - As an admin, I can link related assignments (language/difficulty) so I track variants efficiently.
  - As an admin, I can navigate between variant assignments so I can find related content quickly.

### Participant user stories
- **Access**
  - As a participant, I can open a challenge via URL without logging in so access is frictionless.
  - As a participant, I see an overview of assignments so I understand the structure.
  - As a participant, I can open any available assignment so I progress at my own pace.
- **Consumption**
  - As a participant, I can read assignment content in a clean layout.
  - As a participant, I can play embedded video.
  - As a participant, I can return to the challenge overview easily.
- **Passwords**
  - As a participant, I can enter a password to unlock an assignment so I can access staged content.
  - As a participant, I see a clear error when a password is wrong so I can try again.

---

## Delivery phases (suggested)
- **Phase 1 (Weeks 1–3)**: core data model + admin foundation
  - Schema (Client, Challenge, Assignment, AssignmentUsage)
  - Basic CRUD for all entities
  - Admin authentication
  - Client management screen
  - Assignment library basics
- **Phase 2 (Weeks 4–6)**: challenge management + content editing
  - Challenge management screen
  - Rich text editor integration
  - Image upload/management
  - Assignment create/edit
  - Assignment-to-challenge relationship management
- **Phase 3 (Weeks 7–8)**: participant experience
  - Public challenge view
  - Public assignment view
  - Password functionality
  - Media embed/playback
  - Navigation flow
- **Phase 4 (Weeks 9–10)**: advanced admin features
  - Scheduled release
  - Drag/drop reordering
  - Challenge duplication
  - Variant relationships
  - Folder/project organization
- **Phase 5 (Weeks 11–12)**: analytics + polish
  - Analytics integration
  - Admin preview
  - Visual scaling fixes
  - Performance optimization
  - Bug fixes/refinement
- **Phase 6 (Week 13)**: deployment + handoff
  - Deployment documentation
  - Environment setup
  - Migration plan/execution (if needed)
  - Training materials
  - Final testing

---

## Risks & mitigations
- **Rich text editor complexity**
  - Impact: high
  - Mitigation: pick a proven editor early; allocate time for paste/import edge cases and content sanitization.
- **Layout scaling edge cases**
  - Impact: medium
  - Mitigation: test with extreme content lengths; build a fluid design system.
- **Assignment reuse architecture complexity**
  - Impact: high
  - Mitigation: document the entity model; prototype usage flows early.
- **Scope creep**
  - Impact: medium
  - Mitigation: keep out-of-scope list explicit; track future ideas separately.
- **Migration risk**
  - Impact: medium
  - Mitigation: define migration strategy; validate in staging; have rollback plan.

---

## Open questions
- Rich text editor: preference (TipTap vs Lexical vs other)?
- Tech stack constraints: must it remain Next.js, or open?
- Backend preference: Node/Python/etc?
- Database preference: Postgres vs other?
- Hosting preference: cloud provider vs on-prem?
- Image/media storage: local filesystem vs S3-compatible vs CDN?
- Analytics approach: GA4 sufficient or custom logging required?
- Migration strategy: big bang vs gradual?
- Assignment library UI: list vs cards vs hybrid?
- Folder depth: one level enough or nested?

---

## Appendix: reference materials

### Loom videos (provided)
- Client admin walkthrough
- Challenge admin walkthrough
- Assignment admin walkthrough

### Live examples (provided)
- Challenge example: `https://app.companychallenges.com/KK6wYjG`
- Admin interface: `https://app.companychallenges.com/`

Note: avoid storing real passwords inside the PRD. If specific example passwords are needed for testing, keep them in a separate, access-controlled place.

---

### Document control
- **Author**: [Your Name]
- **Stakeholders**: [Client Team Names]
- **Review status**: Draft for discussion
- **Next steps**: technical proposal and architecture discussion
- **Revision history**
  - v1.0 (2026-01-05): initial PRD based on client documentation and video walkthroughs

This PRD is a starting point for discussion and proposal development. Technical implementation details and UI/UX designs should be finalized collaboratively with the development team.