# 🏠 Roomie - Immersive 3D Room Booking Platform

**Course:** IT 305W - Advanced Web Application  
**Team Project** | **Deadline:** September 4, 2024  
**Status:** ✅ All Core Features Complete - Ahead of Schedule!

---

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- PowerShell execution policy set (if on Windows)

### Installation & Run
```bash
# Navigate to project
cd roomie-prototype

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Open browser to: http://localhost:5173
```

### Demo Accounts
- **Admin:** admin@roomie.com / admin123
- **Host:** host@roomie.com / host123
- **Renter:** renter@roomie.com / renter123

---

## ✨ Features Completed

### 1. **3D Virtual Tours** 🎮
- Interactive 3D room viewer using Three.js & React Three Fiber
- Two viewing modes:
  - **Orbit Mode:** Rotate and zoom around the room
  - **Walk Mode:** First-person WASD controls with mouse look
- Interactive furniture that can be dragged and repositioned
- Debug mode available with `?debug=true` in URL
- 2 fully modeled rooms loaded from GLB files

### 2. **Authentication System** 🔐
- Complete login/register system
- Two user roles: **Renter** and **Host**
- Protected routes (Host Dashboard requires host role)
- Session persistence with localStorage
- Beautiful form validation and error handling
- Logout confirmation modal

### 3. **Room Browsing & Booking** 📅
- Homepage with filterable room cards
- Filter by: Price, Capacity, Amenities
- Room detail pages with:
  - Image gallery carousel
  - 3D viewer integration
  - Booking form with date selection
  - Price breakdown (nightly rate + 5% service fee)
  - Reviews section
- Form validation for all booking fields

### 4. **Host Dashboard** 🏢
- View and manage all booking requests
- 4 booking statuses: Pending, Approved, Declined, Completed
- Stats cards showing booking counts
- Approve/decline functionality
- Filter tabs for easy management

### 5. **Admin Dashboard** 👑 (NEW!)
- **System Overview:** Total users, bookings, revenue, reviews
- **User Management:** View all users (admins, hosts, renters)
- **Booking Management:** View all bookings across the platform
- **Statistics:** Real-time platform metrics
- **Quick Actions:** Export reports, manage system
- Purple-themed interface distinguishing from Host Dashboard

### 6. **Reviews System** ⭐
- Star rating component (supports half-stars)
- Category ratings: Cleanliness, Accuracy, Location, Value
- Filter reviews by rating
- Sort by recent or most helpful
- Rating distribution chart
- Add review form (login required)

### 6. **User Profile Pages** 👤
- **My Bookings:** View all bookings with status filters
- **My Profile:** Edit name, phone, address, bio
- **Settings:** Notification preferences + password change
- Toast notifications for all actions

### 7. **Informational Pages** 📄
- **How It Works:** 4-step process explanation
- **Contact:** Contact form + contact information
- Professional design matching app theme

### 8. **Toast Notifications** 🔔
- Success, error, info, warning types
- Auto-close after 3 seconds
- Manual close option
- Used throughout the app for user feedback

---

## 📁 Project Structure

```
roomie-prototype/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── RoomCard.jsx
│   │   ├── RoomGallery.jsx
│   │   ├── RoomViewer.jsx   # 3D viewer
│   │   ├── BookingForm.jsx
│   │   ├── ReviewList.jsx
│   │   ├── AddReview.jsx
│   │   ├── StarRating.jsx
│   │   ├── Toast.jsx
│   │   └── ConfirmModal.jsx
│   │
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx
│   │   ├── RoomDetailPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── HostDashboard.jsx
│   │   ├── MyBookingsPage.jsx
│   │   ├── MyProfilePage.jsx
│   │   ├── SettingsPage.jsx
│   │   ├── HowItWorksPage.jsx
│   │   └── ContactPage.jsx
│   │
│   ├── context/            # React Context
│   │   └── AuthContext.jsx # Authentication state
│   │
│   ├── data/               # Mock data (localStorage)
│   │   ├── rooms.js
│   │   ├── bookings.js
│   │   └── reviews.js
│   │
│   ├── App.jsx             # Main app with routing
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles + animations
│
├── public/
│   ├── models/             # 3D models
│   │   ├── appartement.glb
│   │   └── Room2/DoriHome.glb
│   └── images/             # Room images
│
└── package.json
```

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite
- **3D Graphics:** Three.js + React Three Fiber + Drei
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Data Storage:** localStorage (temporary, will switch to backend)
- **Routing:** Manual view state management
- **Forms:** Controlled components with validation

---

## 🎯 How to Use (For Groupmates)

### Testing the App

1. **Browse Rooms:**
   - View all rooms on homepage
   - Use filters (price, capacity)
   - Click on a room to see details

2. **3D Features:**
   - Click "View in 3D" button
   - Use mouse to rotate (Orbit Mode)
   - Press "Walk Mode" for first-person controls (WASD + mouse)
   - Click furniture to drag and reposition
   - Click "Reset" to restore original positions

3. **Booking Flow:**
   - Select dates in booking form
   - See real-time price breakdown
   - Submit booking (login required)
   - View booking in "My Bookings" page

4. **Admin Features:**
   - Login as admin: admin@roomie.com / admin123
   - Access "Admin Dashboard" from navbar
   - View system-wide statistics
   - See all users and their roles
   - Monitor all bookings across platform
   - Purple-themed admin interface

5. **Host Features:**
   - Login as host: host@roomie.com / host123
   - Go to "Host Dashboard"
   - Approve/decline booking requests
   - View booking statistics

6. **User Features:**
   - Update profile in "My Profile"
   - Change settings in "Settings"
   - View booking history in "My Bookings"
   - Leave reviews on rooms you've stayed in

### Adding New Rooms

Edit `src/data/rooms.js`:

```javascript
{
  id: 4,
  name: "Your Room Name",
  description: "Room description",
  price: 120,
  capacity: 2,
  images: ['/images/room4/image1.jpg'],
  amenities: ['WiFi', 'Kitchen'],
  modelPath: '/models/your-model.glb',
  has3DView: true,
  modelConfig: {
    scale: 1,
    position: [0, 0, 0],
    rotation: [0, 0, 0]
  }
}
```

### Modifying Styles

- Global styles: `src/index.css`
- Tailwind classes used throughout components
- Gradient theme: blue-500 to purple-600

---

## 🔧 Known Issues & Limitations

### Current Limitations
- ❌ No real backend (using localStorage)
- ❌ No payment integration
- ❌ No real-time updates
- ❌ No image uploads
- ❌ No messaging between users
- ❌ Mobile responsive but no mobile menu

### To Be Added (Week 15 - Backend Phase)
- [ ] Real database (MongoDB/PostgreSQL)
- [ ] RESTful API
- [ ] Payment processing (Stripe)
- [ ] File uploads for images
- [ ] Real-time notifications
- [ ] Email confirmations
- [ ] Advanced search

---

## 🐛 Troubleshooting

### PowerShell Script Execution Error
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Already in Use
```bash
# Kill process on port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID [PID_NUMBER] /F

# Or change port in vite.config.js
```

### 3D Model Not Loading
- Check file path in `rooms.js`
- Ensure GLB file is in `public/models/`
- Check browser console for errors
- Try clearing browser cache

### White Screen Error
- Check browser console for errors
- Verify all imports are correct
- Clear localStorage: `localStorage.clear()`
- Restart dev server

---

## 📝 For Presentation

### Key Points to Highlight
1. **Innovation:** First room booking platform with full 3D virtual tours
2. **Interactivity:** Walk through rooms, move furniture
3. **Complete UX:** 10 pages, full user flow from browse to book
4. **Professional Design:** Modern, responsive, polished UI
5. **Ahead of Schedule:** All core features done, 25 days before deadline

### Demo Flow
1. Start on homepage → Show filters
2. Click room → Show 3D viewer + Walk Mode
3. Book room → Show form validation + price breakdown
4. Login as host → Show dashboard + approve booking
5. Show user profile pages + settings
6. Show reviews system

### Technical Highlights
- React 18 with Vite for fast development
- Three.js for 3D rendering
- Component-based architecture
- localStorage for data persistence
- Tailwind CSS for styling
- Context API for state management

---

## 👥 Team Workflow

### Git Best Practices
```bash
# Always pull before starting work
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "Description of changes"

# Push to your branch
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### File Naming Conventions
- Components: PascalCase (e.g., `RoomCard.jsx`)
- Files: camelCase (e.g., `rooms.js`)
- CSS classes: kebab-case (Tailwind)

### Code Style
- Use functional components
- Destructure props
- Use const for variables
- Add comments for complex logic
- Keep components under 300 lines

---

## 📦 Dependencies

**Core:**
- react: ^18.2.0
- react-dom: ^18.2.0
- vite: ^5.0.0

**3D Graphics:**
- three: ^0.160.0
- @react-three/fiber: ^8.15.0
- @react-three/drei: ^9.92.0

**Styling:**
- tailwindcss: ^3.4.0

**See `package.json` for full list**

---

## 📞 Need Help?

**Project Issues:**
- Check browser console for errors
- Clear localStorage if data issues
- Restart dev server
- Check this README first

**Code Questions:**
- Review component files for examples
- Check similar features in other components
- Ask in group chat

---

## ✅ Completion Checklist

- [x] 3D Room Viewer (Orbit + Walk Mode)
- [x] Interactive Furniture
- [x] Authentication System
- [x] Room Browsing + Filtering
- [x] Booking System
- [x] Host Dashboard
- [x] Reviews System
- [x] User Profile Pages
- [x] Toast Notifications
- [x] Informational Pages
- [x] Responsive Design
- [x] Form Validation
- [x] Error Handling
- [x] Loading States

**Status:** 🎉 Production Ready for Demo!

---

## 📅 Timeline

- **Week 1-2 (Done):** Project setup, 3D viewer, basic pages
- **Week 3 (Done):** Auth system, reviews, bookings
- **Week 4 (Current):** Polish, testing, documentation
- **Week 15 (Sept 4):** Backend integration, final presentation

---
Gawr Gura SHAAAAAAAAAAARK
**Last Updated:** August 10, 2024  
**Project Lead:** Dex Roduel DC. De Guzman  
**Course:** IT 305W - Advanced Web Application Development  

