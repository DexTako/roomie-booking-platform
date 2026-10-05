# 🔗 Frontend-Backend Integration Guide

## ✅ What's Been Done

### 1. **Frontend Improvements Merged** ✨
- ✅ Copied improved `App.jsx` with better navigation
- ✅ Added `ComparisonPage.jsx` for room comparison
- ✅ Updated all components from `roomie-all-changes`
- ✅ Updated all pages with latest improvements
- ✅ Added `HOW_TO_ADD_MOVABLE_ITEMS.md` guide

### 2. **API Service Layer Created** 🌐
- ✅ Created `src/services/api.js`
- ✅ Authentication endpoints (register, login, logout, profile)
- ✅ Rooms endpoints (CRUD, availability, occupied dates)
- ✅ Bookings endpoints (create, update, cancel, my bookings)
- ✅ Automatic JWT token handling
- ✅ Error handling

### 3. **Environment Configuration** ⚙️
- ✅ Created `.env` file
- ✅ Backend API URL: `http://localhost:5000/api`
- ✅ Updated `.gitignore` to exclude env files

---

## 📡 **How to Use the API in Your Components**

### **Example 1: Login with Backend**

```javascript
import api from '../services/api';

const handleLogin = async (email, password) => {
  try {
    const response = await api.auth.login(email, password);
    
    if (response.success) {
      // Store token and user data
      api.storeAuthToken(response.token, response.user);
      
      // Update UI
      console.log('Logged in:', response.user);
    }
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
```

### **Example 2: Fetch Rooms from Database**

```javascript
import { roomsAPI } from '../services/api';

const loadRooms = async () => {
  try {
    const response = await roomsAPI.getAll();
    
    if (response.success) {
      const rooms = response.rooms;
      console.log('Loaded rooms:', rooms);
    }
  } catch (error) {
    console.error('Error loading rooms:', error);
  }
};

// With filters
const loadFilteredRooms = async () => {
  const response = await roomsAPI.getAll({
    theme: 'modern',
    minPrice: 50,
    maxPrice: 150,
    capacity: 2
  });
};
```

### **Example 3: Create Booking**

```javascript
import { bookingsAPI } from '../services/api';

const createBooking = async (bookingData) => {
  try {
    const response = await bookingsAPI.create({
      roomId: '6ac31444b84b526ab97e2690',
      checkIn: '2026-10-15',
      checkOut: '2026-10-18',
      guests: 2,
      guestName: 'John Doe',
      guestEmail: 'john@example.com',
      paymentMethod: 'card'
    });
    
    if (response.success) {
      console.log('Booking created:', response.booking);
    }
  } catch (error) {
    console.error('Booking failed:', error.message);
  }
};
```

### **Example 4: Check Room Availability**

```javascript
import { roomsAPI } from '../services/api';

const checkDates = async (roomId, checkIn, checkOut) => {
  try {
    const response = await roomsAPI.checkAvailability(
      roomId,
      '2026-10-15',
      '2026-10-18'
    );
    
    if (response.available) {
      console.log('Room is available!');
    } else {
      console.log('Room is booked for those dates');
    }
  } catch (error) {
    console.error('Error checking availability:', error);
  }
};
```

---

## 🎯 **Next Steps to Complete Integration**

### **Phase 1: Update AuthContext** 🔐
Replace localStorage auth logic with real API calls:

**File:** `src/context/AuthContext.jsx`

```javascript
import api from '../services/api';

export const login = async (email, password) => {
  const response = await api.auth.login(email, password);
  if (response.success) {
    api.storeAuthToken(response.token, response.user);
    setUser(response.user);
  }
  return response;
};

export const register = async (userData) => {
  const response = await api.auth.register(userData);
  if (response.success) {
    api.storeAuthToken(response.token, response.user);
    setUser(response.user);
  }
  return response;
};
```

### **Phase 2: Update Room Data** 🏠
Replace hardcoded rooms with API calls:

**File:** `src/pages/HomePage.jsx`

```javascript
import { roomsAPI } from '../services/api';

useEffect(() => {
  const loadRooms = async () => {
    try {
      const response = await roomsAPI.getAll();
      setRooms(response.rooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };
  
  loadRooms();
}, []);
```

### **Phase 3: Update Booking System** 📅
Connect BookingWizard to backend:

**File:** `src/components/BookingWizard.jsx`

```javascript
import { bookingsAPI } from '../services/api';

const handleSubmit = async () => {
  try {
    const response = await bookingsAPI.create({
      roomId: room._id, // Note: MongoDB uses _id
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      guestName: bookingData.guestName,
      guestEmail: bookingData.guestEmail,
      guestPhone: bookingData.guestPhone,
      specialRequests: bookingData.specialRequests,
      paymentMethod: bookingData.paymentMethod
    });
    
    if (response.success) {
      onComplete(response.booking);
    }
  } catch (error) {
    // Show error toast
    showToast(error.message, 'error');
  }
};
```

### **Phase 4: Update AvailabilityCalendar** 📆
Fetch occupied dates from API:

**File:** `src/components/AvailabilityCalendar.jsx`

```javascript
import { roomsAPI } from '../services/api';

useEffect(() => {
  const loadOccupiedDates = async () => {
    try {
      const response = await roomsAPI.getOccupiedDates(roomId);
      setOccupiedDates(response.occupiedRanges);
    } catch (error) {
      console.error('Error loading dates:', error);
    }
  };
  
  loadOccupiedDates();
}, [roomId]);
```

### **Phase 5: Update Dashboards** 👥
Host/Admin dashboards to use real data:

**File:** `src/pages/HostDashboard.jsx`

```javascript
import { bookingsAPI } from '../services/api';

useEffect(() => {
  const loadBookings = async () => {
    try {
      const response = await bookingsAPI.getAll();
      setBookings(response.bookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };
  
  loadBookings();
}, []);

const handleApprove = async (bookingId) => {
  try {
    await bookingsAPI.updateStatus(bookingId, 'approved');
    // Refresh bookings
    loadBookings();
  } catch (error) {
    console.error('Error approving booking:', error);
  }
};
```

---

## 🧪 **Testing Checklist**

### **Backend Running**
- [ ] Backend server: `http://localhost:5000` ✅
- [ ] MongoDB connected ✅
- [ ] Database seeded with 6 rooms ✅
- [ ] Test endpoint: `http://localhost:5000/api/rooms` ✅

### **Frontend Running**
- [ ] Frontend server: `http://localhost:3000` ✅
- [ ] All improvements merged ✅
- [ ] API service created ✅
- [ ] Environment variables set ✅

### **Integration Tests**
- [ ] Login with `customer@roomie.com` / `customer123`
- [ ] Fetch rooms from API
- [ ] Check room availability
- [ ] Create a booking
- [ ] View bookings dashboard
- [ ] Cancel a booking

---

## 🚀 **Current Status**

### ✅ **What's Working**
1. Backend API fully functional
2. Frontend improvements merged
3. API service layer ready
4. Both servers running

### ⏭️ **What Needs Integration**
1. AuthContext → API calls
2. Room data → API instead of hardcoded
3. Bookings → API instead of localStorage
4. Availability calendar → Real-time from API
5. Dashboards → Live booking data

---

## 📝 **API Endpoints Reference**

### **Authentication**
```
POST   /api/auth/register     - Create account
POST   /api/auth/login        - Login (returns JWT)
GET    /api/auth/me           - Get current user
PUT    /api/auth/profile      - Update profile
POST   /api/auth/logout       - Logout
```

### **Rooms**
```
GET    /api/rooms             - Get all rooms (with filters)
GET    /api/rooms/:id         - Get single room
GET    /api/rooms/:id/availability - Check dates
GET    /api/rooms/:id/occupied-dates - Calendar data
POST   /api/rooms             - Create room (host/admin)
PUT    /api/rooms/:id         - Update room (host/admin)
DELETE /api/rooms/:id         - Delete room (host/admin)
```

### **Bookings**
```
GET    /api/bookings          - Get all bookings (role-filtered)
GET    /api/bookings/:id      - Get single booking
GET    /api/bookings/my-bookings - Current user's bookings
POST   /api/bookings          - Create booking
PUT    /api/bookings/:id/status - Approve/decline (host/admin)
DELETE /api/bookings/:id      - Cancel booking
```

---

## 🎯 **Priority Integration Tasks**

1. **CRITICAL:** Update AuthContext to use API
2. **HIGH:** Load rooms from API in HomePage
3. **HIGH:** Create bookings via API in BookingWizard
4. **MEDIUM:** Update availability calendar with real data
5. **MEDIUM:** Connect dashboards to API
6. **LOW:** Add loading states and error handling

---

**Status:** Ready for integration phase! 🚀
**Last Updated:** October 5, 2026
**Created By:** Kiro AI Assistant
