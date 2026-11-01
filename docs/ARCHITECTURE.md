# Architecture

## System overview

```mermaid
flowchart TB
  subgraph Client["Browser"]
    UI["React 18 + Tailwind (Vite build)"]
    V3D["Three.js 3D room viewer (lazy loaded)"]
  end
  subgraph Server["Node.js / Express API"]
    MW["Middleware: helmet, compression, CORS, sanitize, rate limit"]
    AUTH["JWT auth + role check (customer / host / admin)"]
    CTRL["Controllers: auth, rooms, bookings, reviews, messages, contact, payments, admin"]
  end
  DB[("MongoDB Atlas")]
  MAIL["SMTP email"]
  PP["PayPal REST API (sandbox)"]
  UI -- "HTTPS, Authorization: Bearer JWT" --> MW --> AUTH --> CTRL
  UI --- V3D
  CTRL --> DB
  CTRL --> MAIL
  CTRL --> PP
```

## Database (MongoDB collections)

```mermaid
erDiagram
  USER ||--o{ ROOM : "hosts (hostId)"
  USER ||--o{ BOOKING : "books (renterId)"
  ROOM ||--o{ BOOKING : "is booked (roomId)"
  ROOM ||--o{ REVIEW : "has"
  USER ||--o{ REVIEW : "writes"
  BOOKING ||--o{ MESSAGE : "has a conversation"
  USER ||--o{ CONTACT_MESSAGE : "may send"

  USER {
    string name
    string email UK
    string password "bcrypt hash"
    string role "customer | host | admin"
    boolean isActive
    boolean isEmailVerified
  }
  ROOM {
    string name
    number pricePerNight
    number capacity
    string theme
    string location
    boolean isActive
    objectId hostId FK
  }
  BOOKING {
    objectId roomId FK
    objectId renterId FK
    date checkIn
    date checkOut
    number guests
    number subtotal
    number serviceFee
    number totalPrice
    string paymentMethod "card | gcash | paypal | cash"
    string paymentStatus "pending | completed | refunded"
    string status "pending | approved | declined | cancelled | completed"
  }
  REVIEW {
    objectId roomId FK
    objectId userId FK
    number rating "1-5"
    string comment
  }
  MESSAGE {
    objectId bookingId FK
    objectId senderId FK
    string text
    date readAt
  }
  CONTACT_MESSAGE {
    string name
    string email
    string subject
    string message
    string status "new | read | resolved"
    string adminReply
  }
```

Indexes: bookings by `(roomId, checkIn, checkOut)`, `renterId`, `status`; rooms by price, capacity, theme, active/available; unique review per `(roomId, userId)`; messages by `(bookingId, createdAt)`.

## Booking lifecycle

```mermaid
stateDiagram-v2
  [*] --> pending: guest sends request
  pending --> approved: host approves
  pending --> declined: host declines
  pending --> cancelled: guest or host cancels
  approved --> cancelled: guest or host cancels
  approved --> completed: stay finished
  declined --> [*]
  cancelled --> [*]
  completed --> [*]
```

The server enforces these transitions with one atomic database update, so a booking that was just cancelled can never be approved.

## Booking and payment flow (GCash example)

```mermaid
sequenceDiagram
  actor G as Guest
  participant FE as React app
  participant API as Express API
  participant DB as MongoDB
  actor H as Host
  G->>FE: choose dates, guests, GCash
  FE->>API: GET availability / config
  G->>G: sends money in the GCash app
  G->>FE: types the GCash reference number
  FE->>API: POST /api/bookings (JWT)
  API->>API: verify email, validate, check dates, compute price
  API->>DB: save booking (pending, payment pending)
  API-->>H: email "new booking request"
  H->>API: PUT /api/bookings/:id/status = approved
  API->>DB: atomic update (status approved, payment completed)
  API-->>G: email "booking approved"
```

PayPal works differently: the server creates the order and sets the price, the guest approves in PayPal, and the server captures the payment, re-checks the dates, creates the booking and refunds automatically if saving fails.

## Authentication and authorisation

1. `POST /api/auth/login` checks the bcrypt hash and returns a signed JWT (30 days with "Remember me", otherwise 1 day).
2. The React app sends `Authorization: Bearer <token>` on every request.
3. `protect` verifies the token and loads the user; deactivated accounts are rejected.
4. `authorize('host', 'admin')` and similar rules decide who can use each route (RBAC).
5. Extra rules inside controllers: guests only see their own bookings, hosts only manage bookings for their own rooms, admins can manage everything.

| Role | Can do |
|------|--------|
| Customer | Browse, book, pay, cancel own bookings, message hosts, review, manage profile |
| Host | Everything a customer can, plus manage own rooms and booking requests |
| Admin | Manage users (roles, activate, ban), view stats, answer contact messages |
