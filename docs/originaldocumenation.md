Company Challenges Platform
First Rebuild – Extended Introduction & Scope Definition
How to use this document
This document should be read together with:
• Loom walkthrough videos showing the current platform for the admin side:
o Client admin
o Challenge admin
o Assignment admin
• A live example challenge on the current platform
o General example of a challenge (a little fun example we did for the partners in
our network – very simple, with no passwords)
o An example of an assignment with password and added media (Use this
link, choose Assignment ‘Jobs to be Done’, password is ‘tasks’, video link top
right under ‘Media’)
o Example of a challenge where we created different levels of difficulty - we
also use this manual way to make it multi-language. (Use this link. Go to the
2nd assignment –
‘Building a Prompt from Parts’. Password is ‘prompt’. You can
see the links you can use to switch between CORE and PRO assignments)
The videos and example illustrate:
• how the platform currently behaves
• what works well
• what causes friction in daily use
This document explains:
• what the platform is
• why a rebuild is needed
• what the first rebuild must deliver
• which constraints are intentional
It is a starting point for discussion and proposal, not a final or exhaustive specification.
1. Platform overview (what this platform is)
The Company Challenges platform is a web-based content platform used by organizations
to share short, structured learning or reflection trajectories with their employees.
Each trajectory (called a challenge) consists of a series of assignments that participants
read and engage with individually. Assignments typically include:
• written content
• a visual (image)
• optionally embedded media (such as video)
Participants access challenges via a direct URL, without logging in, and move through the
assignments at their own pace. The platform is intentionally calm, simple, and visually
supportive.
The platform is not designed for:
• submissions or homework
• discussion or community features
• assessment or scoring
• user profiles or social interaction
Its value lies in clarity, pacing, and presentation, combined with easy management and
reuse for admins.
Primary user groups:
• Participants – consume content anonymously
• Admins – create, manage, reuse, and distribute challenges and assignments
2. Background & motivation for the rebuild
The current platform works functionally, but has several structural problems:
• Assignments are hard to reuse across challenges
• Variants (language, difficulty, context) are handled via manual duplication and
hyperlinks
• Managing challenges requires unnecessary manual work
• UI and layout issues cause inconsistent visual quality
• Hosting and maintenance are not operationally independent
The rebuild is driven by three main goals:
1. Operational independence
2. 3. Significantly easier management and reuse
A clean, extensible foundation for future iterations
This rebuild is not primarily about adding new participant features.
3. Scope note – first rebuild only
This document describes only the first rebuild of the platform.
Some capabilities (e.g. participant login, saved progress, submissions) are explicitly out of
scope for this phase, but must not be technically blocked by architectural decisions.
The focus of the first rebuild is:
• rebuilding existing functionality
• removing major management pain points
• improving structure and robustness
• keeping future extensions possible
4. Core principles (first rebuild)
No participant accounts
• No login
• No personal data
• No participant uploads
URL-based access
• Every challenge has a unique public URL
• Every assignment has a unique public URL
Privacy-light
• Anonymous analytics only
• No individual tracking or profiling
Management over features
• Reducing admin effort is more important than adding participant functionality
• Reuse and structure are central design goals
5. Core entities and structure
Client
Represents an organization.
Properties:
• Name
• Logo (optional)
Admins can:
• create, edit, delete clients
Challenge
A challenge is a container that structures assignments.
Key properties:
• Internal name (admin only)
• Public title (display can be toggled on/off)
• Description (rich text)
• Brand color
• Support information (rich text)
• Challenge visual (image)
• Unique public URL
• Linked to one client
Additional (in scope for rebuild):
• Active / archived status
• Grouping into folders or projects (minimum: one level)
Important:
• A challenge does not own assignments
• It references assignments
Assignment (core building block)
An assignment is a standalone, reusable content unit.
Key properties:
• Internal title (admin)
• Public title (optional)
• Subtitle (optional)
• Rich text description
• Visual (image)
• Optional media (e.g. video URL)
• Optional password
• Unique public URL
Assignments:
• can be reused in multiple challenges
• are duplicated only when explicitly copied
Assignment usage (relationship)
Defines how an assignment appears within a specific challenge.
Per usage:
• Order / position
• Visibility (shown / hidden)
• Optional release date
• Optional label
This separation is essential for:
• reuse
• different pacing per challenge
• future extensions without duplication
6. Assignment passwords (key functionality)
Assignments may optionally be protected by a simple access password.
Important clarifications:
• Passwords are shared access keys
• They are not authentication
• They are not linked to users
• They do not identify individuals
Purpose:
• controlled access
• staged release
• engagement and pacing
Passwords are intentionally flexible and low-friction, and may be:
• shared verbally
• sent by email or chat
• distributed physically (e.g. scratch cards revealing the password for a specific day’s
assignment)
The platform must:
• allow easy setting and changing of passwords
• treat passwords as content access keys
• avoid coupling to login or identity
7. Scheduled release of assignments (challenge-level)
A challenge may define a release schedule for its assignments.
This allows:
• assignments to become available automatically
• pacing without manual admin actions
Key principles:
• Release logic is defined at the challenge level
• Release applies to the usage of an assignment within a challenge
• The same assignment can be released differently in different challenges
Release scheduling complements (but does not replace) password-based access.
No automated notifications are required in the first rebuild.
8. Content editing & layout behavior
Content editing
All editable text fields must support:
• rich text (headings, paragraphs, lists)
• links (add/remove)
• images and icons
• embedded media
• copy/paste without breaking formatting
The editor is a core component, not an afterthought.
Layout & scaling (critical)
All screens must scale fluidly with content.
Requirements:
• No fixed-height containers for content
• Layout adapts naturally to text length
• When text is limited, visuals may take more space
• When text is longer, content flows vertically
• No awkward empty areas or clipped visuals
Fixed-size windows that cause visual imbalance are explicitly not acceptable.
9. Management & reuse (main improvement vs current
platform)
The rebuild must make it easy to:
• create an assignment once
• reuse it in multiple challenges
• see where an assignment is used
• copy assignments (new independent version)
• copy challenges (structure + references)
• archive challenges
It must not require:
• manual hyperlinks between assignments
• duplicating content just to enable reuse
This is the primary reason for the rebuild.
10. Variants (limited but intentional)
Full variant logic (language switching, difficulty levels) is not required in the first rebuild.
Minimum requirement:
• assignments can reference other assignments internally (admin-only)
o e.g. “English version”, “Advanced version”
• these references are managed relationships, not text links
This alone already reduces significant admin overhead.
11. Participant experience (unchanged by design)
Participants can:
• open a challenge via URL
• see an assignment overview
• open assignments
• play embedded media
• navigate back to the overview
Participants cannot:
• log in
• submit answers
• upload content
• be identified
12. Analytics (minimum viable)
Analytics are required but must remain simple and anonymous.
Purpose:
• understand which challenges are accessed
• see which assignments are viewed
• compare relative engagement
Minimum requirements:
• page views for challenges and assignments
• events such as:
o assignment opened
o media button clicked
• metadata per event:
o client ID
o challenge ID
o assignment ID
• no personal identifiers
Implementation may use Google Analytics (GA4) or an equivalent approach.
13. Hosting & operational independence
A key driver for the rebuild is operational independence.
Requirements:
• the platform must be fully hostable by us
• we must be able to run, update, and maintain it independently
• no proprietary or hidden dependencies that lock us into a specific developer
Delivery must include:
• a clear deployment setup
• documented configuration and environment requirements
This is an operational requirement, not a legal one.
14. Explicitly out of scope (first rebuild)
Out of scope for this phase:
• participant accounts or login
• saving participant progress
• answer submission
• social features
• integrations with client systems
• LMS-style tracking
• treating passwords as authentication
These may be considered later, but must not drive this rebuild.
15. How to read this document
This document:
• defines what must be rebuilt
• explains why
• sets boundaries and priorities
It intentionally leaves room for:
• architectural discussion
• technical choices
• implementation proposals
It should be read together with:
• the Loom walkthrough videos
• the live example challenge