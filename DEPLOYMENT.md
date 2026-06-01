# Deployment Guide — Coopvest Africa Admin Dashboard

This project deploys the **frontend to Vercel** and the **backend to Render**.

---

## Current Deployment Status

| Service | URL | Status |
|---------|-----|--------|
| Backend (Render) | https://coopvest-api-v3.onrender.com | ✅ Live |
| Frontend (Vercel) | TBD — follow step 2 below | — |

---

## How the Backend Build Works (important)

Render's free plan cannot run `pnpm` or `npm install -g` reliably during build.
The solution: **the API server dist is pre-built and committed to the repo**.

- `artifacts/api-server/dist/` contains the esbuild bundle (committed).
- `artifacts/api-server/dist/package.json` lists only `@supabase/supabase-js` as a runtime dep.
- Render's build command just runs `cd artifacts/api-server/dist && npm install --omit=dev` (installs supabase only).
- The start command runs `node artifacts/api-server/dist/index.mjs`.

**When you make backend code changes**, you must rebuild and commit the dist:
```bash
pnpm --filter @workspace/api-server run build
# then commit artifacts/api-server/dist/ to git and push
```

---

## 1. Deploy / Redeploy the Backend on Render

The service `coopvest-api-v3` already exists at https://coopvest-api-v3.onrender.com.

### Render service settings
- **Build command**: `cd artifacts/api-server/dist && npm install --omit=dev`
- **Start command**: `node --enable-source-maps artifacts/api-server/dist/index.mjs`
- **Plan**: Free

### Required environment variables (already set)
| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `SUPABASE_URL` | `https://nyoauzqezpxeonmrxxgi.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | *(set in Render dashboard — keep secret)* |
| `ALLOWED_ORIGIN` | Your Vercel frontend URL (or `*` temporarily) |

### To redeploy after backend changes
1. Rebuild locally: `pnpm --filter @workspace/api-server run build`
2. Commit the updated `artifacts/api-server/dist/` files and push to GitHub.
3. Go to [dashboard.render.com](https://dashboard.render.com/web/srv-d8epoj42m8qs7396p1tg) → **Manual Deploy**.

---

## 2. Deploy the Frontend to Vercel

The `vercel.json` at the repo root configures everything.

### Steps

1. Go to [vercel.com](https://vercel.com) and sign in (or create a free account).
2. Click **Add New** → **Project**.
3. Import your `Admin-Dashboard` GitHub repository.
4. Vercel auto-detects `vercel.json`. Leave Framework Preset as detected.
5. Before deploying, click **Environment Variables** and add:

   | Key | Value |
   |-----|-------|
   | `VITE_SUPABASE_URL` | `https://nyoauzqezpxeonmrxxgi.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase **anon/public** key (safe to expose) |
   | `VITE_API_URL` | `https://coopvest-api-v3.onrender.com` |

6. Click **Deploy**.
7. Once done, copy your Vercel URL (e.g. `https://your-app.vercel.app`).

### After frontend deployment: update Render's ALLOWED_ORIGIN

Go to [Render dashboard](https://dashboard.render.com/web/srv-d8epoj42m8qs7396p1tg) → **Environment** → update `ALLOWED_ORIGIN` to your exact Vercel URL, then redeploy.

---

## Where to find Supabase keys

1. Go to your [Supabase dashboard](https://supabase.com/dashboard).
2. Open your project → **Settings** → **API**.
3. Copy **Project URL** → `SUPABASE_URL` / `VITE_SUPABASE_URL`.
4. Copy **anon public** key → `VITE_SUPABASE_ANON_KEY`.
5. Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (backend only — never expose).

---

## Environment Variables Summary

### Backend (Render)
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | yes | Set to `10000` |
| `NODE_ENV` | yes | Set to `production` |
| `SUPABASE_URL` | **yes** | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **yes** | Supabase service role key (keep secret) |
| `ALLOWED_ORIGIN` | **yes** | The Vercel frontend URL for CORS |

### Frontend (Vercel)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | **yes** | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | **yes** | Supabase anon key (safe to expose) |
| `VITE_API_URL` | **yes** | `https://coopvest-api-v3.onrender.com` |
| `BASE_PATH` | auto | Set to `/` by vercel.json |
