# ⚡ Quick Start - Roomie Project

## 🚀 First Time Setup (5 minutes)

```bash
# 1. Navigate to project
cd roomie-prototype

# 2. Install dependencies (only needed once)
npm install

# 3. Start the app
npm run dev
```

**Open browser:** http://localhost:5173

## 🔑 Demo Login

**Admin Account:**
- Email: admin@roomie.com
- Password: admin123

**Host Account:**
- Email: host@roomie.com
- Password: host123

**Renter Account:**
- Email: renter@roomie.com  
- Password: renter123

## 📚 Essential Files

**Must Read:**
- `README.md` - Complete project documentation
- `FEATURE_ROADMAP.md` - Feature timeline and progress

**Optional Guides:**
- `HOW_TO_ADD_ROOMS.md` - Add new rooms to the platform

## 🎯 What to Test

1. ✅ Browse rooms on homepage
2. ✅ Click "View in 3D" and try Walk Mode (WASD)
3. ✅ Book a room (login first)
4. ✅ Login as host → Approve bookings
5. ✅ Leave a review on a room
6. ✅ Check My Profile, My Bookings, Settings pages

## 🐛 Common Issues

**Port already in use:**
```bash
# Change port in vite.config.js or kill the process
```

**PowerShell error (Windows):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**White screen:**
- Check browser console (F12)
- Clear localStorage: `localStorage.clear()` in console
- Restart dev server

## 📞 Need Help?

1. Check `README.md` troubleshooting section
2. Check browser console (F12) for errors
3. Ask in group chat

---

**That's it! You're ready to go! 🎉**
