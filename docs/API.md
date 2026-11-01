# API reference

Base URL: `/api`. Send `Authorization: Bearer <token>` on protected routes. Responses are JSON with `success` and either data or `message`.

## Auth `/api/auth`

| Method | Path | Access | Purpose |
|--------|------|--------|---------|
| POST | `/register` | Public | Create a customer account (sends a verification email when email is set up) |
| POST | `/login` | Public | Log in, returns JWT. Body: `email`, `password`, optional `rememberMe` |
| POST | `/forgot-password` | Public | Email a one-hour reset link |
| POST | `/reset-password` | Public | Set a new password with the emailed token |
| POST | `/verify-email` | Public | Confirm the email address with the emailed token |
| POST | `/resend-verification` | User | Send the verification email again |
| GET | `/me` | User | Current user |
| PUT | `/profile` | User | Update name, phone, address, bio, profile picture |
| PUT | `/change-password` | User | Change password (needs the current one) |
| POST | `/logout` | User | Log out |

## Rooms `/api/rooms`

| Method | Path | Access | Purpose |
|--------|------|--------|---------|
| GET | `/` | Public | List rooms. Query: `search`, `theme`, `minPrice`, `maxPrice`, `capacity`, `checkIn` + `checkOut` (only rooms free for those dates). Includes average rating and review count |
| GET | `/:id` | Public | One room |
| GET | `/:id/availability` | Public | Is the room free for `checkIn`..`checkOut`? |
| GET | `/:id/occupied-dates` | Public | Booked dates for the calendar |
| POST | `/` | Host, Admin | Create a room |
| PUT | `/:id` | Owner host, Admin | Update a room |
| DELETE | `/:id` | Owner host, Admin | Soft-delete a room (blocked while approved bookings are upcoming) |

## Bookings `/api/bookings`

| Method | Path | Access | Purpose |
|--------|------|--------|---------|
| GET | `/my-bookings` | User | The user's bookings |
| POST | `/` | Verified user | Create a booking (price is computed on the server) |
| GET | `/` | User | Bookings (all for admin, own rooms for hosts, own for customers) |
| GET | `/:id` | Owner, host, admin | One booking |
| DELETE | `/:id` | Owner | Cancel a booking |
| PUT | `/:id/status` | Host, Admin | Approve, decline, cancel or complete |

## Reviews

| Method | Path | Access | Purpose |
|--------|------|--------|---------|
| GET | `/api/rooms/:roomId/reviews` | Public | Reviews and average rating |
| GET | `/api/rooms/:roomId/can-review` | User | Did the user finish a stay here? |
| POST | `/api/rooms/:roomId/reviews` | User | Write a review (once per room) |
| PUT / DELETE | `/api/reviews/:id` | Author (delete: author or admin) | Edit or delete a review |

## Messages `/api/messages`

| Method | Path | Access | Purpose |
|--------|------|--------|---------|
| GET | `/unread` | User | Unread counts per booking |
| GET | `/booking/:bookingId` | Guest, host, admin | Conversation (marks as read) |
| POST | `/booking/:bookingId` | Guest, host, admin | Send a message |

## Payments `/api/payments`

| Method | Path | Access | Purpose |
|--------|------|--------|---------|
| GET | `/gcash/config` | Public | GCash number and account name |
| GET | `/paypal/config` | Public | Is PayPal set up? (client id) |
| POST | `/paypal/create-order` | Verified user | Create a PayPal order for a stay |
| POST | `/paypal/capture-order` | Verified user | Capture the payment and create the booking |

## Contact `/api/contact`

| Method | Path | Access | Purpose |
|--------|------|--------|---------|
| POST | `/` | Public | Send a message to support (5 per hour per IP) |

## Admin `/api/admin` (admin only)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/users`, `/stats` | Users list, system statistics |
| PUT | `/users/:id/role`, `/status`, `/ban`, `/unban` | Manage a user (a ban cancels their bookings) |
| GET | `/contact-messages` | Support inbox |
| PUT | `/contact-messages/:id` | Mark new / read / resolved |
| POST | `/contact-messages/:id/reply` | Email a reply to the sender |

## Error format

```json
{ "success": false, "message": "A clear, human-readable reason" }
```
Typical status codes: 400 validation, 401 not logged in, 403 not allowed, 404 not found, 409 conflict, 429 too many requests, 503 feature not configured.
