# Deploying the portfolio

The recommended setup uses free or cheap managed services. Nothing here is deployed yet; follow these steps when you're ready.

| Part | Host | Why |
|---|---|---|
| PostgreSQL | **Neon** | Free tier, point-in-time restore |
| Backend API (+ Chrome for PDFs) | **Render** (Docker web service) or **Railway** | Runs the Docker image; needs a **persistent disk** for uploads and PDFs |
| Public website | **Vercel** | Native Next.js; cache refresh works out of the box |
| Admin panel | **Vercel** (static) or **Netlify** | A static build with rewrites to the API |

> **Storage:** uploaded images and generated resumes are written to `STORAGE_DIR` on disk. The host must give you a **persistent volume** (Render Disk, or a Railway Volume). Without one, files disappear on every restart. Moving storage to S3 or Cloudflare R2 later means implementing the 4-method `Storage` interface in `backend/src/services/storage.ts`; no other code changes.

## 1. Database (Neon)

1. Create a project, then copy the **pooled** connection string. It looks like `postgresql://user:pass@ep-…-pooler.neon.tech/neondb?sslmode=require`.
2. Keep it secret. It becomes `DATABASE_URL` for the backend.

## 2. Backend API (Render)

1. New → **Web Service** → connect the repo → **Docker**, with Dockerfile path `backend/Dockerfile` and build context = repo root.
2. Add a **Disk** mounted at `/data` (1 GB is plenty).
3. Environment variables:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `DATABASE_URL` | Neon connection string |
| `CORS_ORIGINS` | `https://your-domain.com,https://admin.your-domain.com` |
| `PUBLIC_SITE_URL` | `https://your-domain.com` |
| `FRONTEND_REVALIDATE_URL` | `https://your-domain.com/api/revalidate` |
| `REVALIDATE_SECRET` | `openssl rand -hex 32` (the same value goes on Vercel) |
| `IP_HASH_SALT` | `openssl rand -hex 16` |
| `STORAGE_DIR` | `/data` |
| `CHROME_PATH` | `/usr/bin/chromium` (already set in the image) |
| `COOKIE_SECURE` | `true` |
| `TRUST_PROXY` | `2` (Vercel's edge, then Render's proxy, so rate limits see real visitor IPs) |

4. Deploy. The container runs `prisma migrate deploy` before starting, which applies new migrations safely without wiping data.
5. One time only, from a Render **Shell**:
   ```bash
   npm run db:seed        # imports your content, publishes v1, generates the resume
   npm run create-admin   # your login
   ```
   Then in admin → **Website settings**, set **Public site URL** to your real domain and publish. That URL is used for SEO and on the resume.

## 3. Public website (Vercel)

1. Import the repo and set **Root Directory** to `frontend`.
2. Environment variables: `NEXT_PUBLIC_SITE_URL=https://your-domain.com`, `BACKEND_URL=https://<your-api>.onrender.com`, and `REVALIDATE_SECRET` (the same value as the backend).
3. Deploy. The build reads published content from the API, so **the API must be up before you deploy the site**.
4. After that, content changes never need a redeploy. Publishing calls `/api/revalidate`, and Vercel serves fresh pages right away.

## 4. Admin panel (Vercel)

1. New project, with **Root Directory** set to `admin-panel`.
2. Edit `admin-panel/vercel.json` and replace `YOUR-API-HOST` with your API host. The rewrites keep `/api` same-origin, so the session cookie stays first-party.
3. Optionally add `VITE_PUBLIC_SITE_URL=https://your-domain.com` (powers the "View site" link).
4. Put it on its own subdomain (e.g. `admin.your-domain.com`) and add that origin to the backend's `CORS_ORIGINS`.

## 5. Check the deployment

- [ ] `https://<api>/api/health` returns `{"ok":true}`
- [ ] The site loads, and `/sitemap.xml` and `/robots.txt` show your real domain
- [ ] Admin login works. Edit something → Publish → the live site updates within seconds
- [ ] `https://your-domain.com/api/public/resume/download` downloads the latest PDF
- [ ] Admin → Resume shows the latest version as **Generated**

## Database migrations

- **Locally:** edit `backend/prisma/schema.prisma`, run `npm run db:migrate` and give the migration a name. Commit the new folder under `backend/prisma/migrations/`.
- **In production:** migrations apply automatically on deploy (`prisma migrate deploy`). Never run `migrate dev` or `migrate reset` against production.

## Backups and recovery

- **Neon** keeps point-in-time history (24 hours on the free plan, longer on paid). To restore, go to Neon → Branches → Restore and pick a timestamp.
- **Manual backup:**
  ```bash
  pg_dump "$DATABASE_URL" --format=custom --file=portfolio-$(date +%F).dump
  ```
- **Restore drill** (practise once, into a scratch database):
  ```bash
  createdb -p 5433 restore_test
  pg_restore --no-owner --dbname=postgresql://$USER@localhost:5433/restore_test portfolio-YYYY-MM-DD.dump
  ```
- **Files:** back up the `/data` disk too (Render disk snapshots). It holds uploads and resume PDFs. Resumes can always be regenerated with admin → Resume → Regenerate; uploads cannot.

## Rollback

- **Code:** redeploy the previous successful build in Render or Vercel.
- **Content:** every publish is a numbered `ContentRevision`, and earlier ones are kept in the database. To undo a content mistake, fix it in the admin and publish again.
- **Resume:** the previous PDF stays live if a new one fails to generate.

## Security checklist for production

- [ ] `COOKIE_SECURE=true`, and every site served over HTTPS
- [ ] Strong, unique `REVALIDATE_SECRET` and `IP_HASH_SALT`, never committed
- [ ] `CORS_ORIGINS` lists only your site and admin domains
- [ ] Admin password of 12+ characters, used nowhere else
- [ ] Neon database user has access to this database only
