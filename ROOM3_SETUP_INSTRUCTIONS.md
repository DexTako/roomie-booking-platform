# 🏠 Room 3 (Luxury Penthouse) 3D Model Setup

## 📋 Why This Step is Needed
Room 3's 3D model file (`luxury_penthouse.glb`) is **469MB** - too large for GitHub. We've provided it as a separate zip file for team members who want the complete 3D experience.

## 📁 What You'll Find
- **In the repo**: Room 3 configuration, physics, waypoints, and texture files
- **Separate zip file**: `room 3 zipped copy due to big size.zip` (contains the large 3D model)

## 🚀 Setup Instructions

### Step 1: Clone the Repository (if you haven't already)
```bash
git clone https://github.com/DexTako/roomie-booking-platform
cd roomie-booking-platform
```

### Step 2: Download & Extract Room 3 Model
1. **Download** the zip file: `room 3 zipped copy due to big size.zip`
2. **Extract** the contents to get the `luxury_penthouse.glb` file
3. **Copy** the `.glb` file to the correct location:
   ```
   📁 roomie-prototype/
   └── 📁 public/
       └── 📁 models/
           └── 📁 room3/
               └── 📁 source/
                   └── 📄 luxury_penthouse.glb  ← Place the file here
   ```

### Step 3: Verify Setup
After placing the file, your `room3` folder should look like this:
```
📁 room3/
├── 📄 exter.png          ← Texture files (from Git)
├── 📄 inter.png          ← Texture files (from Git) 
├── 📄 top.png            ← Texture files (from Git)
└── 📁 source/
    └── 📄 luxury_penthouse.glb  ← 3D model (from zip)
```

### Step 4: Run the Application
```bash
# Start backend
cd roomie-backend
npm install
npm start

# Start frontend (new terminal)
cd roomie-prototype  
npm install
npm run dev
```

## ✅ Expected Results

### With Room 3 Model (after setup):
- **Room 3** will have full 3D viewer functionality
- **8 navigation waypoints**: entrance, living room, kitchen, staircase, east lounge, upper gallery, west bedroom, east bedroom
- **Multi-level physics** for duplex navigation

### Without Room 3 Model (skip setup):
- **Room 3** will show "3D tour not available for this room yet"
- **All other rooms** (1, 2, 4, 5, 6) work perfectly with 3D tours
- **All other features** (booking, payments, admin, etc.) work normally

## 🎯 For Presentation
- **Recommended**: Set up Room 3 model for full demo experience
- **Alternative**: Skip Room 3 setup and showcase other 5 rooms' 3D tours
- **Demo tip**: Mention Room 3's "high-quality detailed model" if loading takes time

## 🔧 Troubleshooting

**Model not loading?**
1. Check file path: `roomie-prototype/public/models/room3/source/luxury_penthouse.glb`
2. Check file size: Should be ~469MB
3. Clear browser cache and reload

**Still having issues?**
- Room 3 will gracefully fallback to gallery images
- Other rooms will still work perfectly for presentation

---
*Ready for IT 305W presentation at Bulacan State University! 🎓*