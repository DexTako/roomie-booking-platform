# Roomie Booking System - Database Schema

## 📚 Overview

This document describes the complete MongoDB database schema for the Roomie Booking System. The schema supports a full-featured room booking platform with 3D room visualization, user authentication, and booking management.

---

## 🗄️ Collections

### 1. **Users Collection**

Stores all user accounts (customers, hosts, and admins).

**Fields:**
- `name` (String, required) - User's full name
- `email` (String, required, unique) - User's email (login credential)
- `password` (String, required) - Hashed password (⚠️ must hash with bcrypt in production)
- `role` (String, enum) - User role: `customer`, `host`, or `admin`
  - `customer`: Regular users who book rooms
  - `host`: Room owners who manage listings
  - `admin`: System administrators
- `phone` (String, optional) - Contact phone number
- `profilePicture` (String, optional) - URL to profile image
- `isActive` (Boolean, default: true) - Account status
- `createdAt` (Date, auto) - Account creation timestamp
- `updatedAt` (Date, auto) - Last update timestamp

**Indexes:**
- `email` (unique) - Fast login lookups

**Virtual Fields:**
- `bookings` - Array of user's bookings (populated on demand)

---

### 2. **Rooms Collection**

Stores all available rooms/apartments for booking.

**Fields:**

**Basic Info:**
- `name` (String, required) - Room name
- `description` (String, required) - Room description
- `pricePerNight` (Number, required) - Nightly rate in USD
- `capacity` (Number, required) - Maximum guests (1-20)
- `theme` (String, enum) - Design theme: `modern`, `rustic`, `luxury`, `minimalist`, `scandinavian`
- `location` (String, required) - Room location/address
- `amenities` (Array[String]) - List of amenities (WiFi, Kitchen, etc.)
- `galleryImages` (Array[String]) - URLs to room photos

**3D Model Configuration:**
- `model3D` (String, nullable) - Path to GLB/GLTF 3D model file
- `has3D` (Boolean, default: false) - Whether room has 3D visualization
- `fixMaterials` (Boolean, default: false) - Fix broken embedded materials
- `enablePhysics` (Boolean, default: false) - Enable draggable furniture
- `movableItems` (Array[Object]) - Draggable furniture items:
  - `id` (String) - Item identifier
  - `label` (String) - Display name
  - `meshName` (String, optional) - 3D mesh name
  - `region` (Object, optional) - Bounding box:
    - `min` [x, y] coordinates
    - `max` [x, y] coordinates
- `waypoints` (Map[String → Object]) - Camera positions for room tour:
  - Key: room name (e.g., "bedroom1", "kitchen")
  - Value: `{ position: [x, y, z], target: [x, y, z] }`

**Status:**
- `isActive` (Boolean, default: true) - Room is listed
- `isAvailable` (Boolean, default: true) - Room accepts bookings
- `hostId` (ObjectId, ref: User) - Owner of the room
- `createdAt` (Date, auto) - Listing creation date
- `updatedAt` (Date, auto) - Last update timestamp

**Indexes:**
- `pricePerNight` - Filter by price
- `capacity` - Filter by guest count
- `theme` - Filter by style
- `isActive, isAvailable` - Show available rooms

**Virtual Fields:**
- `bookings` - Array of room's bookings (populated on demand)

**Methods:**
- `isAvailableForDates(checkIn, checkOut)` - Check if room is free for dates

---

### 3. **Bookings Collection**

Stores all booking reservations.

**Fields:**

**Room Reference:**
- `roomId` (ObjectId, required, ref: Room) - Booked room
- `roomName` (String, required) - Room name (snapshot)

**Guest Info:**
- `renterId` (ObjectId, required, ref: User) - Guest who made booking
- `renterName` (String, required) - Guest's name
- `renterEmail` (String, required) - Guest's email
- `renterPhone` (String, optional) - Guest's phone
- `guests` (Number, required) - Number of guests
- `specialRequests` (String, optional) - Guest notes

**Dates:**
- `checkIn` (Date, required) - Check-in date
- `checkOut` (Date, required) - Check-out date (must be after check-in)

**Pricing:**
- `pricePerNight` (Number, required) - Rate at time of booking
- `nights` (Number, required, auto-calculated) - Duration
- `subtotal` (Number, required) - pricePerNight × nights
- `serviceFee` (Number, required) - 15% fee
- `totalPrice` (Number, required) - subtotal + serviceFee

**Payment:**
- `paymentMethod` (String, enum) - `card`, `paypal`, or `bank`
- `paymentStatus` (String, enum) - `pending`, `completed`, `failed`, `refunded`

**Status:**
- `status` (String, enum) - Booking state:
  - `pending` - Awaiting host approval
  - `approved` - Confirmed by host
  - `declined` - Rejected by host
  - `cancelled` - Cancelled by guest
  - `completed` - Stay finished

**Metadata:**
- `isSeed` (Boolean, default: false) - Demo/test data flag
- `createdAt` (Date, auto) - Booking creation timestamp
- `updatedAt` (Date, auto) - Last update timestamp

**Indexes:**
- `roomId, checkIn, checkOut` - Availability checks
- `renterId` - User's booking history
- `status` - Filter by state
- `checkIn, checkOut` - Date range queries
- `createdAt` - Recent bookings

**Virtual Fields:**
- `room` - Populated room details
- `renter` - Populated user details

**Methods:**
- `overlaps(otherCheckIn, otherCheckOut)` - Check date conflict
- `findConflicts(roomId, checkIn, checkOut, excludeBookingId)` - Find overlapping bookings

**Middleware:**
- Pre-save: Auto-calculate `nights`, `subtotal`, `serviceFee`, `totalPrice`

---

## 🔗 Relationships

```
User (1) ←→ (Many) Bookings
Room (1) ←→ (Many) Bookings
User (host) (1) ←→ (Many) Rooms
```

---

## 📊 Data Flow

### Creating a Booking:
1. User selects room and dates
2. Frontend checks availability via calendar
3. User fills booking wizard (4 steps)
4. Backend validates:
   - Room exists and is available
   - Dates don't conflict with approved/pending bookings
   - User is authenticated
5. Create booking with `status: 'pending'`
6. Host reviews and approves/declines
7. On approval, payment is processed
8. On check-out date, status → `completed`

### Room Availability:
- A room is **unavailable** for dates where any `pending` or `approved` booking exists
- `declined`, `cancelled`, and `completed` bookings don't block dates
- Check-out day of one booking can be check-in day of next (non-overlapping nights)

---

## 🛡️ Security Notes

### Authentication:
- Passwords **MUST** be hashed with bcrypt before saving
- Use JWT tokens for session management
- Never send password field in API responses (handled by User.toJSON())

### Authorization Roles:
- **Customer**: Can book rooms, view own bookings, cancel own bookings
- **Host**: Can manage rooms, approve/decline bookings for their rooms
- **Admin**: Full access to all data and operations

---

## 🚀 Migration from Frontend Data

Your current app uses `localStorage` with this data:
- **registeredUsers** → migrate to `Users` collection
- **bookings** → migrate to `Bookings` collection
- **rooms.js** (hardcoded) → seed `Rooms` collection

### Seed Data Strategy:
1. Create default accounts:
   - `admin@roomie.com` (admin role)
   - `host@roomie.com` (host role, owns all rooms)
2. Import all 6 rooms from `rooms.js` as documents
3. Import seed bookings with `isSeed: true` flag
4. User-created bookings (`isSeed: false`) preserved during updates

---

## 📝 API Endpoints (To Be Created)

### Authentication:
- `POST /api/auth/register` - Create customer account
- `POST /api/auth/login` - Login (returns JWT token)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Rooms:
- `GET /api/rooms` - List all active rooms (with filters)
- `GET /api/rooms/:id` - Get single room details
- `POST /api/rooms` - Create room (host/admin only)
- `PUT /api/rooms/:id` - Update room (host/admin only)
- `DELETE /api/rooms/:id` - Delete room (host/admin only)
- `GET /api/rooms/:id/availability` - Check date availability

### Bookings:
- `GET /api/bookings` - List bookings (filtered by role)
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/status` - Update status (host/admin)
- `DELETE /api/bookings/:id` - Cancel booking (customer)
- `GET /api/bookings/my-bookings` - Current user's bookings

### Users:
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users` - List users (admin only)

---

## 🎯 Next Steps

1. ✅ **Database models created** (User, Room, Booking)
2. ⏭️ **Create API routes and controllers**
3. ⏭️ **Implement JWT authentication middleware**
4. ⏭️ **Seed database with rooms from rooms.js**
5. ⏭️ **Connect frontend to backend APIs**
6. ⏭️ **Replace localStorage with API calls**
7. ⏭️ **Deploy to cloud (Render/Railway)**

---

## 🔮 Future Enhancements

- **Reviews & Ratings**: Add Review collection (User → Room)
- **Favorites**: Users can save favorite rooms
- **Notifications**: Email/SMS booking confirmations
- **Calendar Sync**: iCal/Google Calendar integration
- **Multi-language**: i18n support
- **Currency**: Multi-currency pricing
- **Advanced Search**: Filters, sorting, map view
- **Analytics**: Booking trends, revenue reports

---

## 📞 Notes for Room 3 (Luxury Penthouse)

Your groupmate will add the 3D model later. The database already supports this:

```javascript
{
  id: 3, // Will be ObjectId in MongoDB
  name: "Luxury Penthouse Suite",
  model3D: "/models/room3/source/penthouse.glb", // Update this path later
  has3D: true, // Change from false → true when model ready
  waypoints: {
    // Add waypoints after model is captured with ?debug=true
  }
}
```

**Action items for Room 3:**
1. Place GLB file in `/public/models/room3/source/`
2. Update Room document: `has3D: true`, `model3D: "<path>"`
3. Capture waypoints using 3D viewer debug mode
4. Update document with waypoint coordinates

---

**Database Schema Version**: 1.0  
**Last Updated**: January 2027  
**Created By**: Kiro AI Assistant for Dex Roduel's IT 305W Project
