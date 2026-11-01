# Go-live checklist (Vercel + Render + MongoDB Atlas, all free)

Do the steps in order. Total time: about 45 minutes. Never paste secrets into the repository, chat or documents; type them only into the Render and Vercel dashboards.

## 0. Before you start (on your computer)
- [ ] `git pull`, then in `roomie-backend` run `npm install` and `npm test` (all tests pass)
- [ ] `package-lock.json` is committed in both `roomie-backend` and `roomie-prototype`
- [ ] `.env` is NOT in the repository (`git ls-files | findstr /i "\.env"` shows only `.env.example`)
- [ ] Old config files removed: delete `roomie-backend/render.yaml` and `roomie-prototype/render.yaml` (the new `render.yaml` is at the repository root)
- [ ] Everything is pushed to GitHub `main`

## 1. MongoDB Atlas
- [ ] Network Access > Add IP Address > **Allow access from anywhere** (`0.0.0.0/0`). Render's addresses change, so a fixed IP will not work
- [ ] Decide the live database name, e.g. `roomie-live`. In your connection string the name goes before the `?`: `...mongodb.net/roomie-live?retryWrites=true&w=majority`
- [ ] Use a database user with a **new** password (rotate any password that was ever shared)

## 2. Email with Brevo (needed because Render's free plan blocks SMTP)
1. Sign up at brevo.com (free plan: 300 emails per day). Brevo may ask you to confirm your account before it allows sending.
2. **Senders, Domains & Dedicated IPs > Senders > Add a sender.** Use an address you can open and verify it from the email Brevo sends.
   - Sending as a Gmail address can end up in Spam, or be rejected by some mailboxes. If you can, verify a school or domain address instead. For a class demo, check the Spam folder.
3. **SMTP & API > API Keys > Generate a new API key.** Copy it once.
4. You will paste it into Render as `BREVO_API_KEY`, and the sender as `EMAIL_FROM` (format: `Roomie <your-verified-address>`).

## 3. Backend on Render
Option A (Blueprint): Render > New > **Blueprint** > pick your repo. It reads `render.yaml` and asks for the values below.
Option B (manual): New > **Web Service** > pick your repo. Root directory `roomie-backend`, runtime Node, build `npm install`, start `npm start`, plan Free, region Singapore, health check path `/health`.

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `20` |
| `MONGODB_URI` | your Atlas connection string with the live database name |
| `JWT_SECRET` | a new long random string (Blueprint generates one) |
| `FRONTEND_URL` | your Vercel address, e.g. `https://roomie-booking-platform-ub23.vercel.app` (no trailing slash). Set it after step 4 |
| `GCASH_NUMBER` | your 11-digit GCash number |
| `GCASH_ACCOUNT_NAME` | the name on that GCash account |
| `BREVO_API_KEY` | the key from step 2 |
| `EMAIL_FROM` | `Roomie <your-verified-address>` |

- [ ] After the first deploy open `https://YOUR-BACKEND.onrender.com/health`. It must say healthy.

## 4. Frontend on Vercel
- [ ] Vercel > Add New > Project > pick the repo
- [ ] **Root Directory:** `roomie-prototype`. Framework preset: Vite
- [ ] Environment variable: `VITE_API_URL` = `https://YOUR-BACKEND.onrender.com/api` (note the `/api`)
- [ ] Deploy. Your site address is shown when it finishes
- [ ] Go back to Render and set `FRONTEND_URL` to that address (CORS and email links need it), then let Render redeploy

## 5. Put demo data in the live database (once)
Run this on your computer in `roomie-backend`. It uses a temporary setting, so your `.env` is not changed:

PowerShell:
```
$env:MONGODB_URI="YOUR-LIVE-CONNECTION-STRING"
npm run seed -- --yes
Remove-Item Env:MONGODB_URI
```
- [ ] Log in to the live site as each demo role, then **change the demo passwords** (Change password)
- [ ] Optionally change the demo admin and host emails to real ones in Atlas (see earlier steps)

## 6. Check the live site
- [ ] Home page loads rooms (the first load can take up to a minute: the server is waking up)
- [ ] Sign up a new account, receive the verification email, click the link
- [ ] Forgot password sends an email and the link works
- [ ] Book a room, approve it as the host, see it under My Bookings
- [ ] Contact form message appears in the admin inbox and an admin reply arrives by email
- [ ] Open a room with the 3D viewer (see the note below)

## 7. Before presenting
- [ ] Open `/health` and the site a few minutes early so the server is awake
- [ ] Optional: a free pinger (e.g. UptimeRobot) hitting `/health` every 5 minutes keeps it awake
- [ ] Keep localhost ready as a backup
- [ ] Send your prof the site link, the demo accounts for each role, and a note that the first load may take about a minute

## 3D model files
Large files such as `luxury_penthouse.glb` are not in GitHub, so room 3's 3D tour will not exist on the live site. Check the file size: under 100 MB can be added in a separate commit; larger files need Git LFS, a smaller (compressed) model, or a link to storage.

## If something goes wrong
| What you see | Likely cause and fix |
|--------------|----------------------|
| Browser console says CORS error | `FRONTEND_URL` on Render does not match your Vercel address exactly (check `https`, no trailing slash). Fix it and redeploy |
| "Can't reach the server" or the page never loads rooms | The backend is still waking up (wait a minute), or `VITE_API_URL` is wrong or missing `/api`. Fix it in Vercel and redeploy |
| Emails do not arrive | Render logs show `[Roomie] Could not send ...`. Check `BREVO_API_KEY`, that the `EMAIL_FROM` address is verified in Brevo, and the Spam folder |
| New accounts are stuck on "verify your email" | Email is not working yet. Set `REQUIRE_EMAIL_VERIFICATION=false` on Render until it is fixed |
| Blank page on Vercel | The Root Directory is not `roomie-prototype`, or the build failed (read the Vercel build log) |
| Too many requests message | You hit the rate limit (30 login attempts per 15 minutes per IP). Wait or restart the backend |
