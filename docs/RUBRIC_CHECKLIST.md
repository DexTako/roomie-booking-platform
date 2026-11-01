# Rubric checklist – evidence and honest gaps

Use this to prepare. "Evidence" is what to show; "Gap" is what a strict grader could still criticise.

| Criterion (weight) | Evidence in the project | Gap / to do |
|--------------------|-------------------------|-------------|
| **Functionality & Features (25%)** | Full booking flow, 3 roles, date search, 3D viewer, wishlist and compare, reviews, messaging, GCash/PayPal, email notifications and verification, admin inbox with email replies | Card checkout is a demo. Real-time chat, maps and image upload are possible extras |
| **Front-End Design & UX (15%)** | React 18 + Tailwind, responsive layouts, specific error messages, loading states, footer/legal pages, FAQ | Rubric names React.js and Bootstrap: React is covered. Test on a phone and show it |
| **Back-End & Database (20%)** | Express REST API, MongoDB with Mongoose models, indexes, server-side validation and pricing, atomic updates, aggregate queries | Add pagination to the room list if time allows |
| **Security (10%)** | JWT, bcrypt, RBAC, rate limiting, helmet, NoSQL-injection sanitising, input type checks, hashed one-time tokens, email verification, CORS allow-list, HTTPS via host | Rotate any secret that was ever shared or committed. Consider moving the token from localStorage to an httpOnly cookie (mention as future work) |
| **Performance & Optimization (10%)** | Code splitting (`React.lazy`), 3D chunk loaded on demand, gzip compression, DB indexes, rating aggregate in one query | Image optimisation and room-list pagination are not done |
| **Deployment & Version Control (10%)** | Deployed (Vercel + Render + Atlas), GitHub Actions CI, auto-deploy on push | Rubric top score says AWS/Azure with CI/CD. Ask the instructor if Vercel/Render counts, or follow `DEPLOYMENT.md` (Azure). Use branches and pull requests, with commits from every member |
| **Documentation & Presentation (10%)** | README, `docs/ARCHITECTURE.md` (diagrams), `docs/API.md`, `docs/DEPLOYMENT.md`, `docs/DEMO_SCRIPT.md` | Add screenshots to the README and fill in the Team table. Write the report from these files |

## Before the demo

- [ ] Every team member has commits and at least one pull request on GitHub
- [ ] Secrets rotated, `.env` not in the repo, demo passwords changed
- [ ] Deployed site tested on phone and desktop with all three roles
- [ ] Email works in production (`FRONTEND_URL` set to the live site)
- [ ] CI badge is green on `main`
