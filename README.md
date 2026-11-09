# Pavani VLN Charan · Portfolio

A full-stack portfolio with an admin dashboard and an automatically generated resume.

You edit your experience, projects, skills and other content in the **admin panel**, then click **Publish**:

1. The changes are saved in **PostgreSQL**.
2. The **public website** shows them within seconds. No code edits, no redeploy.
3. A new **PDF resume** is generated from the same published content.
4. Recruiters download it from one stable link: `/api/public/resume/download`.

Draft changes are never public: not on the website and not in the resume.

## The three apps

| Folder | What it is | Tech | Local URL |
|---|---|---|---|
| `frontend/` | Public portfolio website | Next.js 16, React 19, Tailwind CSS 4 | http://localhost:3000 |
| `admin-panel/` | Private admin dashboard | React 19, Vite 8, TanStack Query, React Hook Form, Tiptap | http://localhost:5173 |
| `backend/` | REST API, database, resume generator | Node.js, Express 5, Prisma 7, PostgreSQL 17, Puppeteer (Chrome) | http://localhost:4000 |
| `shared/` | Types and validation rules used by all three | TypeScript, Zod | – |

```
 Admin panel ──▶ Backend API ──▶ PostgreSQL
                     │  on Publish:
                     ├──▶ freezes a numbered snapshot (ContentRevision)
                     ├──▶ tells the website to refresh its cache
                     └──▶ generates a new resume PDF (ResumeVersion)

 Website ◀── reads only the latest published snapshot
 Recruiter ◀── /api/public/resume/download (always the latest good PDF)
```

## Run it locally (macOS)

### One-time setup

You need Node.js 22.12+ (`node -v`), PostgreSQL 17 and Google Chrome.

```bash
# 1. Install Postgres. On this Mac it runs on port 5433, because an
#    EnterpriseDB Postgres already uses 5432.
brew install postgresql@17 && brew services start postgresql@17
createdb -p 5433 portfolio_dev
createdb -p 5433 portfolio_test

# 2. Install dependencies (also generates the database client).
npm install

# 3. Environment files. Fill in the values; each file explains every variable.
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
#    REVALIDATE_SECRET must be the same in both files: openssl rand -hex 32

# 4. Create the tables and import your existing portfolio content.
npm run db:migrate
npm run db:seed

# 5. Create your admin login. You'll be asked for an email and password
#    (12+ characters with a number). There is no public sign-up page.
npm run create-admin
```

### Every day

```bash
npm run dev     # starts the API, website and admin together
```

Open http://localhost:5173, log in, edit something, click **Publish**, then refresh http://localhost:3000.

## How publishing works

- Every item (project, experience, skill, …) is either **Draft** or **Published**, and can be **hidden** without deleting it.
- **Save draft** stores your edits. The live site doesn't change.
- **Save & publish**, or **Publish** in the top bar, makes everything published and visible live, as a new numbered version of the site.
- The top bar shows how many unpublished changes you have.
- **Preview drafts** opens the real website showing your drafts. Only you can see it, and it expires after 30 minutes.

## How the resume works

- It's built from the latest **published** version, so it always matches the website.
- In admin → **Resume** you can choose the template (Classic or Modern), section order, which sections to include, the maximum number of projects and bullets, and the download file name.
- Each item also has **Include in resume** and an optional **short resume description**. For example, show 10 projects on the site but only 3 on the resume.
- If generation fails, recruiters keep getting the **previous** PDF. The error appears on the dashboard and the Resume page, with a **Retry** button.
- If nothing on the resume changed, no new PDF is made.
- **Preview with drafts** renders a private PDF that includes unpublished changes.

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Run all three apps |
| `npm test` | Backend tests (33 tests on the separate `portfolio_test` database, using real Chrome) |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint across all apps |
| `npm run build` | Production builds (the API must be running, because the site is prerendered from published content) |
| `npm run db:migrate` | Apply schema changes (creates a migration after you edit `backend/prisma/schema.prisma`) |
| `npm run db:seed` | Import the original content into an **empty** database |
| `npm run db:seed:reset -w backend` | ⚠️ Wipe all content and re-import the originals (keeps admin accounts) |
| `npm run db:studio` | Browse the database in your browser |
| `npm run create-admin` | Create the admin account, or reset its password |

## Project structure

```
backend/
  prisma/schema.prisma        database tables
  prisma/migrations/          versioned SQL migrations (commit these)
  prisma/seed.ts, seed-data.ts  content migrated from the old site
  prisma/seed-assets/         original photo and CV (archived)
  src/routes/                 public, auth and admin routes
  src/controllers/            HTTP handlers
  src/services/               business logic: publishing, snapshot, content, media, contact
  src/services/resume/        resume data, ATS templates, Chrome PDF renderer, version queue
  src/middleware/             auth, CSRF, rate limits, validation, uploads, errors
  test/                       acceptance tests
admin-panel/src/
  pages/                      one page per section (dashboard, projects, resume, …)
  components/                 list/editor building blocks, form fields, rich-text editor
  hooks/, services/api.ts     data fetching and API client
frontend/
  app/(site)/                 public pages
  app/api/revalidate, app/api/draft   cache refresh and preview mode
  lib/api.ts                  fetches published content (cached, refreshed on publish)
shared/src/                   SiteSnapshot types and Zod schemas
```

## Security at a glance

- **Login:** passwords are hashed with Argon2id. Sessions are server-side, and the cookie is `httpOnly`, `SameSite=Lax`, and `Secure` in production.
- **Attack protection:** CSRF header plus an Origin check on every write. Login is rate-limited (5 failures per 15 minutes) and so is the contact form.
- **Input checks:** every request is validated with Zod. URLs must be `http(s)`. Blog HTML is sanitized on save.
- **Uploads:** the file type is checked from the file's actual bytes (JPG, PNG, WebP, AVIF, PDF only; no SVG), with size limits and random file names.
- **Privacy:** drafts and admin data are never available through public endpoints. The website only proxies `/api/public/*` and `/uploads/*`.
- **Secrets:** they live only in `.env` files, which git ignores.

Deploying to production: see [DEPLOYMENT.md](DEPLOYMENT.md).

## Troubleshooting

- **Pages hang or installs take minutes:** keep the project outside iCloud-synced folders like `~/Documents`. It lives in `~/code` for this reason.
- **"Can't reach the API" in the admin, or the site build fails:** start the backend first (`npm run dev` does this).
- **Resume generation fails:** check `CHROME_PATH` in `backend/.env`, then click **Retry** on the admin Resume page.
- **Forgot your admin password:** run `npm run create-admin` with the same email to set a new one.
