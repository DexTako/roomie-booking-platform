# Deployment

## Current setup

| Part | Where | Notes |
|------|-------|-------|
| Frontend | Vercel (static) | Build `npm run build`, output `dist`. Set `VITE_API_URL` to the backend URL ending in `/api` |
| Backend | Render (Node web service, free plan) | `render.yaml` at the repository root creates it. Health check: `GET /health`. Free services sleep when idle (first request takes up to a minute) |
| Database | MongoDB Atlas | Network access must allow the backend's IP (or 0.0.0.0/0 for a class project) |

HTTPS is automatic on Vercel and Render. Add these environment variables on the **backend** service (never in the repo):

`NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL` (the Vercel URL, used for CORS and email links), `BREVO_API_KEY` and `EMAIL_FROM`, `GCASH_NUMBER`, `GCASH_ACCOUNT_NAME`, and optionally `PAYPAL_*`.

**Email on Render's free plan:** Render blocks the SMTP ports (25, 465, 587) on free services, so Gmail SMTP cannot work there. The backend therefore supports Brevo over HTTPS (`BREVO_API_KEY`); SMTP is still used on your own computer. Step-by-step: [GO_LIVE_CHECKLIST.md](GO_LIVE_CHECKLIST.md).

After changing dependencies, run `npm install` and commit the updated `package-lock.json` (the Dockerfile uses `npm ci`).

## CI/CD with GitHub

- **CI** – `.github/workflows/ci.yml` tests the backend and builds the frontend on every push and pull request.
- **CD** – Vercel and Render redeploy automatically when `main` changes. Protect `main` (Settings > Branches) so changes arrive through pull requests with a green CI check.

Suggested team workflow: one branch per feature (`feature/gcash-payment`), open a pull request using the template, a teammate reviews it, merge when CI is green.

## Option: deploy on Azure (if the rubric requires AWS/Azure)

1. **Backend – Azure App Service (Linux, Node 20).** Create a Web App, then Settings > Environment variables: add the backend variables above. Set the startup command to `npm start`.
2. **Frontend – Azure Static Web Apps.** Connect the GitHub repo, app location `roomie-prototype`, output location `dist`. Add `VITE_API_URL` as a build variable.
3. **Database** – keep MongoDB Atlas, or use Azure Cosmos DB for MongoDB.
4. **CI/CD** – the "Deployment Center" in App Service can create a GitHub Actions workflow for you. A minimal manual workflow looks like this:

```yaml
name: Deploy backend to Azure
on:
  workflow_dispatch:
  push:
    branches: [main]
    paths: ['roomie-backend/**']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd roomie-backend && npm install --omit=dev
      - uses: azure/webapps-deploy@v3
        with:
          app-name: YOUR-APP-NAME
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: roomie-backend
```

Add the app's publish profile (downloaded from the Azure portal) as the repository secret `AZURE_WEBAPP_PUBLISH_PROFILE`. Students can often get free Azure credits through Azure for Students.

## Option: AWS

Backend on Elastic Beanstalk (Node platform) or App Runner using the Dockerfile; frontend on S3 + CloudFront; keep Atlas for the database. Store secrets in the service's environment settings.

## Checklist before presenting

- [ ] Backend `/health` returns `healthy`
- [ ] `FRONTEND_URL` on the backend equals the real frontend URL
- [ ] Email works (`npm run test-email`) and a reset email arrives
- [ ] Seed/demo data exists and demo passwords are changed if the repo is public
- [ ] `.env` is not in the repository
