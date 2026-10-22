# Portfolio Design System & "Pluto" Guide Concept

Based on the reference design you shared, this report documents the exact **color codes**, **font pairing**, and a full concept for **Pluto** — a named mascot/guide that acts like a personal assistant and adapts what it says based on who's visiting (recruiter, client, fellow developer, or casual browser).

---

## 1. Color Palette (Extracted from Reference)

| Swatch                     | Hex       | Usage                                                                      |
| -------------------------- | --------- | -------------------------------------------------------------------------- |
| 🟫 Cream Background        | `#F9F4EE` | Page background, base canvas                                               |
| ⬜ Card / Panel Background | `#EFEFE5` | "About Me" card, skills cards, section panels                              |
| 🟢 Primary CTA Green       | `#4E8549` | Primary buttons ("Explore My Work"), links, active nav underline           |
| 🌲 Deep Forest Green       | `#33573D` | Stats box background, footer background, dark panels                       |
| 🍃 Sage Accent Green       | `#5C7B61` | Italic accent words in headline ("clean", "scalable", "meaningful"), icons |
| ⚫ Primary Text            | `#1A1A1A` | Headlines, body copy                                                       |
| ⚪ Text on Dark            | `#F5F1E8` | Text/labels placed on the deep green panels                                |
| ➖ Muted Grey-Green        | `#8A9A8C` | Secondary/supporting text, captions                                        |

**Usage pattern:** cream is the dominant surface (~70% of the page), deep forest green is used sparingly for 2–3 high-contrast panels (stats box, footer, chat widget), and sage green is reserved for accent/emphasis only — never large blocks. This restraint is what keeps the palette feeling premium instead of "loud."

---

## 2. Font Family Pairing

The reference uses a **serif + sans-serif pairing**, which is what gives it that editorial, slightly warm feel instead of a generic startup look.

| Role                 | Recommended Font                                                   | Notes                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Headlines (H1/H2)    | **Fraunces** (Google Fonts)                                        | Use the italic weight for accent words within a headline, regular weight for the rest — matches the "clean, scalable & meaningful" treatment exactly |
| Body / Nav / UI text | **General Sans** or **Inter**                                      | Clean geometric sans for nav links, paragraph text, buttons, and card labels                                                                         |
| Numbers / Stats      | **Fraunces** (regular, tabular numbers) or **General Sans Medium** | For the "10+ / 5+ / 2+" stat callouts                                                                                                                |

**Pairing rule:** never use the serif for body paragraphs — it's a display/accent font only. Everything a visitor needs to _read quickly_ (nav, cards, bullet points) stays in the sans-serif.

---

## 3. The "Pluto" Guide Concept

Pluto (the golden retriever in the reference) isn't just a decorative mascot — it's positioned as an **interactive, role-aware guide**. The idea: instead of making every visitor scroll through the same content in the same order, Pluto asks a visitor what they're here for and tailors the conversation and suggested next steps accordingly — like a lightweight personal assistant layered on top of the static portfolio flow from the earlier report.

### 3.1 Where Pluto Appears

- **Hero section:** a small greeting bubble next to Pluto's avatar — first contact point.
- **Floating widget (bottom-right, persistent):** collapsible chat bubble, always accessible while scrolling.
- **Contextual nudges:** Pluto resurfaces near the Projects section ("Want to see more projects? Click here!") and near Contact, timed to when a visitor is most likely deciding whether to act.

### 3.2 The Opening Flow (Role Selection)

Pluto's first message should **ask, not assume**. This is the key mechanic — a lightweight branch that routes the rest of the experience.

**Pluto's opening line:**

> "Hi, I'm Pluto 🐾 I'll be your guide today! What brings you here?"

**Quick-reply options shown as buttons:**

- 👔 I'm hiring / reviewing candidates
- 🤝 I'm looking to hire a freelancer
- 💻 I'm a fellow developer, just browsing
- 👀 Just exploring

This single branch point is what makes it feel like a "personal assistant" rather than a static chatbot — the visitor feels _seen_, and Pluto's tone/suggestions shift accordingly.

---

### 3.3 Role-Based Scripts

#### A. Recruiter / Hiring Manager

**Goal:** get them to skills + resume + top project fast.

> "Great — I'll keep this quick. Here's what you probably want: Srinivas's top skills, his strongest project, and his resume, all in one place."

Suggested quick replies:

- "Show me his top 3 skills"
- "What's his best project?"
- "Download resume"

Sample Pluto follow-up (after "top 3 skills"):

> "He's strongest in JavaScript, REST APIs, and backend work with Django REST Framework — want me to show a project that proves it?"

#### B. Client / Freelance Lead

**Goal:** build trust fast — proof of delivery, communication, and reliability.

> "Nice to meet a potential collaborator! Srinivas has delivered freelance projects end-to-end — from build to client handoff. Want to see one?"

Suggested quick replies:

- "Show me a client project"
- "How does he communicate during a project?"
- "How do I get in touch?"

Sample Pluto follow-up:

> "Here's a business website he built for an interior design firm — fully responsive, fast-loading, with a lead form that syncs straight to Google Sheets. Want his contact details?"

#### C. Fellow Developer / Peer

**Goal:** speak their language — stack, architecture, code quality.

> "Ah, a fellow builder! Want the technical rundown — stack, architecture decisions, repos?"

Suggested quick replies:

- "What's the tech stack?"
- "Show me the GitHub repos"
- "Any interesting technical challenges he solved?"

Sample Pluto follow-up:

> "One project uses a JSON-driven content architecture so non-technical stakeholders can update the site without touching code — check the repo for how it's structured."

#### D. Just Exploring / General Visitor

**Goal:** low pressure, let them wander, but keep a gentle nudge available.

> "No worries, take your time! Scroll around — and if you want a shortcut, just ask me anything."

Suggested quick replies:

- "Tell me about Srinivas"
- "Show me the projects"
- "Surprise me"

---

### 3.4 Pluto's Personality & Voice Guidelines

Pluto should read as **warm, brief, and a little playful** — never corporate, never verbose.

| Do                                                                             | Don't                                             |
| ------------------------------------------------------------------------------ | ------------------------------------------------- |
| Short sentences, 1–2 lines max per message                                     | Long paragraphs in a chat bubble                  |
| Occasional dog-themed flavor ("fetching that for you 🐾") — used sparingly     | Overusing the dog gimmick in every message        |
| Action-oriented replies (buttons, not open text fields, for most flows)        | Forcing visitors to type when a button would do   |
| Matches the section it appears near (e.g., near Projects: "Want to see more?") | Generic "How can I help you?" repeated everywhere |

**Sample sign-off (after Contact section):**

> "That's everything I've got! If you'd rather talk to the human directly, here's his email 📩"

---

### 3.5 Implementation Notes

- Keep Pluto's dialogue tree **shallow** (2–3 levels deep max) — it's a portfolio, not a support bot. The goal is guided discovery, not a full conversational AI.
- If built with a real AI backend (optional upgrade), constrain it with a system prompt limited to Srinivas's actual resume/project data, so it can't improvise false claims about his experience.
- If kept static (no AI backend), this entire flow can be built as a simple decision-tree widget (a JSON of role → messages → quick replies) — lightweight, fast, and consistent with the site's own performance-first philosophy from the earlier flow report.
- Visually, keep Pluto's chat bubble in the same deep forest green (`#33573D`) with cream text (`#F5F1E8`), so it feels native to the palette rather than a bolted-on plugin.

---

## 4. How This Connects to the Portfolio Flow

This guide concept layers on top of the section flow from the earlier report:

```
Hero (Pluto greets + asks role)
   │
   ▼
Role-based routing ─────┬── Recruiter path   → Skills → Best Project → Resume
                         ├── Client path      → Case Study → Contact
                         ├── Developer path   → Stack → GitHub
                         └── Explorer path    → Free scroll + on-demand help
   │
   ▼
Contact (Pluto offers a final nudge + direct email)
```

The static scroll flow still works for visitors who ignore Pluto entirely — Pluto is an **optional accelerant**, not a requirement to navigate the site.
