# 🏠 Roomie – Room Booking Platform

> **Full-stack Airbnb-style booking platform built for IT 305W at Bulacan State University**

[![Grade](https://img.shields.io/badge/Grade-91%2F100-brightgreen)](https://github.com/DexTako/roomie-booking-platform)
[![Status](https://img.shields.io/badge/Status-Presentation%20Ready-success)](https://github.com/DexTako/roomie-booking-platform)
[![CI](https://img.shields.io/badge/CI-Passing-brightgreen)](https://github.com/DexTako/roomie-booking-platform)

Guests explore rooms with interactive 3D viewers, book by dates, pay via GCash/PayPal, message hosts, and leave reviews. Hosts manage bookings and rooms. Admins moderate users and handle support messages with email replies.

---

## ✨ Features

### 👤 **Guests**
- 🔍 Browse and search rooms by text, theme, price, capacity, amenities and **available dates**
- 🎮 Interactive **3D room viewer** with physics-based navigation (6 rooms)
- 💝 Wishlist and room comparison (per account)
- 📅 Booking wizard with server-side price calculation and live availability checks
- 💳 **Payments**: Demo card, **GCash** (manual reference), **PayPal** (sandbox)
- 📊 Booking status tracking (pending → approved → declined/cancelled)
- 💬 Message the host, leave reviews after stay, save receipts as PDF
- ✉️ Email verification, forgot/reset password, change password

### 🏠 **Hosts**
- 📋 Dashboard with booking requests (approve/decline, GCash payment verification)
- 📅 Availability calendar with room switcher
- 💬 Guest messaging per booking

### 👨‍💼 **Admins**
- 👥 User management (roles, activate, ban with auto-cancellation of bookings)
- 📊 System statistics and revenue tracking
- 📧 Contact message inbox with **email replies**
- 📥 CSV exports for business analytics

### 🔐 **Platform**
- 📧 Email notifications for bookings, approvals, declines, cancellations
- 🛡️ Role-based access control (customer / host / admin)
- 🔑 JWT authentication with secure token management

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)

### Installation
```bash
# 1. Clone repository
git clone https://github.com/DexTako/roomie-booking-platform
cd roomie-booking-platform

# 2. Backend setup
cd roomie-backend
cp .env.example .env        # Fill in MongoDB URI and JWT_SECRET
npm install
npm run seed -- --yes       # Creates demo users and rooms
npm run dev                 # http://localhost:5000

# 3. Frontend setup (new terminal)
cd roomie-prototype
npm install
npm run dev                 # http://localhost:3000
```

### ⚠️ Room 3 Model (Optional)
Room 3's 3D model (469MB) is excluded from Git. Download from [Releases](https://github.com/DexTako/roomie-booking-platform/releases) and place at:
```
roomie-prototype/public/models/room3/source/luxury_penthouse.glb
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Three.js (@react-three/fiber, drei) |
| **Backend** | Node.js 18+, Express 4 |
| **Database** | MongoDB Atlas with Mongoose |
| **Auth & Security** | JWT, bcrypt, helmet, express-rate-limit, input sanitising, CORS |
| **Email** | Nodemailer (SMTP) + Brevo (production) |
| **Payments** | GCash (manual), PayPal REST API (sandbox), Demo card |
| **Testing & CI** | Node test runner, GitHub Actions |
| **Hosting** | Vercel (frontend), Render (backend), MongoDB Atlas |

---

## 📋 Environment Variables

### Backend (`roomie-backend/.env`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Random string (32+ chars) for token signing |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS & email links |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` | 📧 Local | SMTP config (Gmail needs App Password) |
| `BREVO_API_KEY` + `EMAIL_FROM` | 📧 Production | Brevo API for email (use on Render) |
| `GCASH_NUMBER`, `GCASH_ACCOUNT_NAME` | 💰 | GCash payment details |
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE` | 💳 | PayPal sandbox credentials |
| `REQUIRE_EMAIL_VERIFICATION` | ⚙️ | Set `false` to skip email verification |

**Test email setup:** `npm run test-email`

---

## 📜 Scripts

### Backend Commands
```bash
npm run dev          # Development with auto-reload
npm start            # Production mode
npm test             # Run automated tests
npm run seed -- --yes # Reset DB with demo data
npm run test-email   # Send test email
```

### Frontend Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

---

## 🔒 Security Features

- ✅ **Password security**: bcrypt hashing, strong validation
- ✅ **Authentication**: JWT tokens (30 days with "Remember me", 1 day default)
- ✅ **Authorization**: Role-based access control (RBAC) on all routes
- ✅ **Rate limiting**: 30 login attempts per 15 min per IP
- ✅ **Headers**: helmet security headers, CORS allow-list
- ✅ **Input validation**: NoSQL injection prevention, type checking
- ✅ **Token security**: One-time hashed tokens for password reset
- ✅ **Server-side**: Price calculation and availability checks
- ✅ **HTTPS**: Automatic on Vercel and Render

---

## 🚀 Deployment

**Full deployment guide:** See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for step-by-step instructions.

**Quick deployment (45 minutes):**
1. MongoDB Atlas → Network access 0.0.0.0/0
2. Brevo → Get API key for email
3. Render → Deploy backend via Blueprint (`render.yaml`)
4. Vercel → Deploy frontend from `roomie-prototype`
5. Seed production database
6. Test all features

**Deployment platforms (all FREE):**
- Frontend: Vercel
- Backend: Render (Node web service)
- Database: MongoDB Atlas
- Email: Brevo (300 emails/day)
- CI/CD: GitHub Actions

**Complete checklist:** [docs/GO_LIVE_CHECKLIST.md](docs/GO_LIVE_CHECKLIST.md)

---

## 🎯 Default Accounts

After seeding (`npm run seed -- --yes`):

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@roomie.com | admin123 |
| **Host** | host@roomie.com | host123 |
| **Customer** | customer@roomie.com | customer123 |

⚠️ **Change these passwords before deploying publicly!**

---

## 📚 Documentation

- 📖 **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System diagrams and database schema
- 📡 **[API.md](docs/API.md)** - Complete API endpoint reference
- 🚀 **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Deployment guide (Vercel + Render + Atlas)
- ✅ **[GO_LIVE_CHECKLIST.md](docs/GO_LIVE_CHECKLIST.md)** - 45-minute deployment checklist
- 🎤 **[DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)** - 10-minute presentation script
- 📋 **[RUBRIC_CHECKLIST.md](docs/RUBRIC_CHECKLIST.md)** - Grading criteria evidence

---

## 🧪 Testing & CI/CD

- **Automated tests**: 20+ tests covering auth, bookings, payments, security
- **GitHub Actions**: Runs tests and builds on every push/PR
- **CI Status**: [![CI](https://github.com/DexTako/roomie-booking-platform/workflows/CI/badge.svg)](https://github.com/DexTako/roomie-booking-platform/actions)

Run tests locally:
```bash
cd roomie-backend
npm test
```

---

## 📁 Project Structure

```
roomie-booking-platform/
├── roomie-backend/          # Express REST API
│   ├── controllers/         # Route handlers
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth & validation
│   ├── utils/              # Helper functions
│   └── __tests__/          # Automated tests
├── roomie-prototype/       # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   ├── context/        # React contexts
│   │   └── utils/          # Helper functions
│   └── public/
│       └── models/         # 3D model files
├── docs/                   # Documentation
├── .github/                # CI/CD workflows
└── render.yaml            # Render deployment config
```

---

## 🎓 Academic Information

- **Course**: IT 305W - Advanced Web Applications
- **Institution**: Bulacan State University - Hagonoy Campus
- **Grade Achieved**: 91/100 (Excellent - Grade 1.25)

### Learning Outcomes
- ✅ Full-stack web development with modern technologies
- ✅ Database design and management (MongoDB + Mongoose)
- ✅ Authentication and authorization systems (JWT + RBAC)
- ✅ Payment processing integration (GCash, PayPal)
- ✅ 3D web graphics with Three.js
- ✅ Responsive web design principles
- ✅ CI/CD pipeline setup with GitHub Actions
- ✅ Production deployment and monitoring

---

## 👥 Team

| Name | Role |
|------|------|
| [Your Name] | Lead Developer |
| [Team Member] | Frontend Specialist |
| [Team Member] | Backend Developer |
| [Team Member] | UI/UX Designer |

---

## 📞 Support

- **Repository**: https://github.com/DexTako/roomie-booking-platform
- **Issues**: [Report bugs](https://github.com/DexTako/roomie-booking-platform/issues)
- **Documentation**: See `docs/` folder

---

## 📄 License

Academic project for IT 305W at Bulacan State University. All rights reserved to the development team.

---

<div align="center">

**🎉 Ready for IT 305W Presentation! 🎉**

*Built with ❤️ by Team Roomie for Bulacan State University*

**[View Live Demo](#) • [Documentation](docs/) • [API Reference](docs/API.md)**

</div>