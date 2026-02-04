# Journal Platform

Academic journal management system: open access, peer-reviewed, with paper submission, editorial workflow, and public-facing pages.

## Features

### Pages (8 main sections)

| Page | Content |
|------|--------|
| **Home** | Journal name & ISSN, scope & aim, Open Access / Peer-Reviewed badges, Call for Papers CTA, current issue highlights, indexing logos, quick stats (impact, acceptance rate), latest announcements |
| **About** | Journal introduction, aims & scope, publication ethics, peer review policy, open access policy, plagiarism policy, copyright & licensing |
| **Editorial Board** | Editor-in-Chief, Associate Editors, Reviewers; affiliation & country; contact/profile |
| **Paper Submission** | Author registration & login, online paper upload (PDF/DOC), manuscript details form, track status, revision upload, email notifications (API-ready) |
| **Current & Past Issues** | Year → Volume → Issue; article title, authors, abstract, DOI link, PDF download, citation (APA / IEEE) |
| **Guidelines** | Author guidelines, paper template (Word / LaTeX), review process, publication charges, withdrawal policy |
| **Indexing & Metrics** | Indexing databases, impact factor / metrics, Google Scholar, CrossRef / DOI |
| **Contact** | Editorial address, email IDs, phone/WhatsApp (optional), contact form, Google Map placeholder |

### User roles

| Role | Access |
|------|--------|
| Admin | Full control |
| Editor | Review & decision |
| Reviewer | Review papers |
| Author | Submit & track |
| Reader | View & download |

### Core features (API & DB)

- Secure login system (session-based)
- Paper upload & storage (multer, `uploads/`)
- Review workflow (schema: submissions, reviews, revisions)
- Status tracking (`/api/submissions`, `/track`)
- DOI integration (schema ready)
- Email automation (nodemailer-ready; configure SMTP in `.env`)
- Search & filter (schema indexed; UI filters on issues)
- SEO-friendly URLs (e.g. `/issues`, `/about`)

## Technology stack

- **Frontend:** HTML5, CSS3, JavaScript, Tailwind CSS (CDN)
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (schema in `db/schema.sql`)
- **Auth:** express-session, bcryptjs (for password hashing when DB connected)
- **File upload:** multer
- **Validation:** express-validator
- **Email:** nodemailer (configure in `.env`)

## Setup

### 1. Install dependencies

```bash
cd journal-platform
npm install
```

### 2. Environment

Copy `.env.example` to `.env` and set:

- `PORT` (default 3000)
- `SESSION_SECRET` (required in production)
- `DATABASE_URL` (PostgreSQL connection string) — optional for running without DB (pages and static API stubs work)
- `SMTP_*` and `MAIL_FROM` for email (contact form, submission confirmations)
- Optional: `RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY` for reCAPTCHA

### 3. Database (optional)

Create a PostgreSQL database and run the schema:

```bash
createdb journal_db
psql -d journal_db -f db/schema.sql
```

Then implement `db/client.js` that exports a pool/client and use it in `routes/auth.js` and `routes/api.js` (replace `getDb()` placeholders).

### 4. Run

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
journal-platform/
├── server.js           # Express app, routes, static & page serving
├── routes/
│   ├── api.js          # /api/submissions, /api/issues, /api/announcements, /api/contact
│   └── auth.js         # /auth/login, /auth/register, /auth/logout, /auth/me
├── db/
│   └── schema.sql      # Users, submissions, articles, issues, reviews, etc.
├── public/
│   ├── css/style.css   # Custom + Tailwind-friendly variables
│   ├── js/app.js       # Nav active state
│   └── pages/          # HTML pages (index, about, editorial-board, submit, issues, guidelines, indexing, contact, login, register, track, dashboard)
├── uploads/            # Created at runtime; manuscript uploads
├── .env.example
├── .gitignore
└── README.md
```

## Next steps

1. **Database client:** Add `db/client.js` using `pg` and wire it in auth and API routes (user lookup, submission CRUD, announcements, issues).
2. **Auth:** Hash passwords with bcrypt on register; compare on login; restrict routes by role (e.g. Editor/Admin dashboards).
3. **Email:** Use nodemailer in `POST /api/contact` and on submission/revision events (confirmations, reviewer invites).
4. **DOI:** Integrate with CrossRef or your DOI provider when publishing articles.
5. **reCAPTCHA:** Add to contact form and registration if desired.
6. **Production:** Use HTTPS, set `SESSION_SECRET`, restrict CORS, and consider rate limiting and backups.

## License

MIT.
