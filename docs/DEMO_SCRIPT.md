# Demo script (about 10 minutes)

Rehearse once with the deployed site, not only on localhost. Open three browser profiles (or private windows) logged in as **customer**, **host** and **admin** before you start.

Demo accounts come from the seed script (`npm run seed -- --yes`): `customer@roomie.com`, `host@roomie.com`, `admin@roomie.com`. Check the seed file for the passwords, and **change them before sharing the repository publicly**.

| Minute | What to show | What to say (rubric link) |
|--------|--------------|---------------------------|
| 0:00 | Home page, scroll, search by **dates and guests** | "Only rooms free for those dates appear, checked on the server." (Functionality, Front-end) |
| 1:30 | Open a room: **3D viewer**, reviews, gallery | "Three.js viewer; it is lazy-loaded so the home page stays fast." (Performance) |
| 2:30 | Sign up a new customer: show the **specific error messages**, then the **verify your email** banner and the email | "Email verification, hashed passwords, JWT." (Security) |
| 3:30 | **Forgot password** end to end | "One-time token, only its hash is stored, expires in 1 hour." (Security) |
| 4:30 | Book a room with **GCash**: copy the number, type a reference | "Server calculates the price, never the browser." (Back-end) |
| 5:30 | Host window: see the request with the GCash reference, **approve** | "Atomic status update; a cancelled booking can't be approved. RBAC: hosts only see their own rooms." (Back-end, Security) |
| 6:30 | Customer: booking turns **Approved**, open **Contact Host** chat, host replies | "Messaging per booking." (Extra features) |
| 7:30 | After a past stay: **leave a review** | "Only guests who finished a stay can review, once per room." |
| 8:00 | Admin: users, **ban** a user (their bookings are cancelled), contact inbox, **reply by email** | "Admin tools and role separation." (Functionality) |
| 9:00 | GitHub: commits, branches/pull requests, green **CI** check, `npm test` output | "20 automated tests, CI on every push, auto-deploy to production." (Version control, Deployment) |
| 9:45 | `docs/` folder and README | "Architecture, API, deployment and demo documentation." (Documentation) |

## Questions the instructor may ask

- **Where is HTTPS?** Provided by Vercel and Render for the deployed site; `helmet` adds secure headers (HSTS).
- **How is the price protected?** The server recalculates nights, subtotal and fee from the database room price.
- **What stops double booking?** A conflict query on dates before saving, and again before capturing PayPal payments.
- **How do you prevent brute force logins?** Rate limiting on the auth routes (30 attempts per 15 minutes per IP).
- **How is GCash verified?** The host checks the reference in their GCash app before approving; the same reference can't be used twice. A payment gateway (PayMongo/Xendit) would automate it and is the planned next step.
- **What would you improve next?** Pagination for the room list, image uploads and compression, real-time chat with WebSockets, a payment gateway for GCash/cards, end-to-end tests.
