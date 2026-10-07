# Roomie Booking Platform - Setup Instructions

## Quick Setup for Team Members

### 1. Clone Repository
```bash
git clone https://github.com/DexTako/roomie-booking-platform.git
cd roomie-booking-platform
```

### 2. Backend Setup
```bash
cd roomie-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your settings (see below)
```

### 3. Frontend Setup
```bash
cd ../roomie-prototype

# Install dependencies
npm install

# Create environment file (optional)
# cp .env.example .env
```

### 4. Environment Variables (.env file)

**REQUIRED** - Edit `roomie-backend/.env`:

```env
# Database - Use one of these options:
MONGODB_URI=mongodb://localhost:27017/roomie-booking
# OR MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/roomie-booking

# Security
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Server
PORT=5000
NODE_ENV=development
```

**OPTIONAL** - Stripe payments (not needed for basic functionality):
```env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 5. Database Options

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Use: `MONGODB_URI=mongodb://localhost:27017/roomie-booking`

#### Option B: MongoDB Atlas (Cloud - Recommended)
1. Create free account at https://www.mongodb.com/atlas
2. Create cluster and get connection string
3. Use: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/roomie-booking`

### 6. Run the Application

**Terminal 1 - Backend:**
```bash
cd roomie-backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd roomie-prototype
npm run dev
```

### 7. Access the App
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### 8. Default Login Accounts

The app will create default accounts on first run:

**Admin Account:**
- Email: admin@roomie.com
- Password: admin123

**Host Account:**
- Email: host@roomie.com  
- Password: host123

**Customer Account:**
- Email: customer@roomie.com
- Password: customer123

## Troubleshooting

### "Stripe Environment Variable Error"
- **Solution**: Stripe is optional. Just make sure `MONGODB_URI` and `JWT_SECRET` are set in `.env`
- The app works without Stripe using simplified payments

### "Connection Refused" Error
- Check if MongoDB is running (local) or connection string is correct (Atlas)
- Make sure backend is running on port 5000

### Port Already in Use
- Change `PORT=5001` in `.env` file
- Update frontend API URL if needed

## Features Available

✅ User Authentication (Customer, Host, Admin)  
✅ Room Browsing & Search  
✅ Booking Management  
✅ Payment System (Simplified - Card, GCash, PayPal, Cash)  
✅ Reviews & Ratings  
✅ Host Dashboard  
✅ Admin Panel with User Management  
✅ Ban/Unban Functionality  
✅ Detailed Reports & CSV Export  

## Contact

If you have issues, check the console for errors and ensure all environment variables are set correctly.