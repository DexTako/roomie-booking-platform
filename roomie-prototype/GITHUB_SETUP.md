# 🚀 GitHub Upload Guide

Follow these steps to upload your Roomie project to GitHub so your groupmates can clone and use it.

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and login
2. Click the **"+"** icon in top-right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name:** `roomie-booking-platform` (or your choice)
   - **Description:** "Immersive 3D room booking platform with React, Three.js, and Tailwind CSS"
   - **Visibility:** Public or Private (your choice)
   - **DO NOT** initialize with README (we already have one)
5. Click **"Create repository"**

## Step 2: Initialize Git in Your Project

Open your terminal in the project folder and run:

```bash
cd "c:\Users\Dex Roduel\Downloads\Room booking project\roomie-prototype"

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Complete Roomie booking platform with 3D tours, auth, and admin dashboard"
```

## Step 3: Connect to GitHub Repository

After creating the repository, GitHub will show you commands. Use these (replace with your actual repo URL):

```bash
# Add remote repository (replace USERNAME/REPO with your actual GitHub URL)
git remote add origin https://github.com/USERNAME/roomie-booking-platform.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Example:**
```bash
git remote add origin https://github.com/yourname/roomie-booking-platform.git
git branch -M main
git push -u origin main
```

## Step 4: Share with Groupmates

Send your groupmates the repository URL, for example:
```
https://github.com/yourname/roomie-booking-platform
```

## For Your Groupmates to Install:

They should follow these steps:

### 1. Clone the Repository
```bash
git clone https://github.com/yourname/roomie-booking-platform.git
cd roomie-booking-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Project
```bash
npm run dev
```

### 4. Open in Browser
```
http://localhost:5173
```

### 5. Login with Demo Accounts
- **Admin:** admin@roomie.com / admin123
- **Host:** host@roomie.com / host123  
- **Renter:** renter@roomie.com / renter123

---

## Important Notes

### Files Already Ignored (in .gitignore):
- ✅ `node_modules/` - Not uploaded (too large)
- ✅ `dist/` - Build output (generated locally)
- ✅ `.vscode/` - Editor settings

### What WILL Be Uploaded:
- ✅ All source code (`src/`)
- ✅ All documentation (README, guides)
- ✅ Package files (`package.json`, `package-lock.json`)
- ✅ Config files (`vite.config.js`, `tailwind.config.js`, `postcss.config.js`)
- ✅ 3D models and images (`public/`)
- ✅ All pages and components

### First Time Git User?

If you get asked for credentials:
1. Use your GitHub username
2. For password, use a **Personal Access Token** (not your GitHub password):
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Generate new token (classic)
   - Select "repo" scope
   - Copy the token and use it as password

---

## Troubleshooting

### "git is not recognized"
Install Git from [git-scm.com](https://git-scm.com/downloads)

### Large files error
The 3D models might be large. If you get an error:
```bash
git lfs install
git lfs track "*.glb"
git add .gitattributes
git commit -m "Add Git LFS for 3D models"
```

### Permission denied
Make sure you're logged into GitHub and have push access to the repository.

---

## Quick Reference Commands

```bash
# Check status
git status

# Add new changes
git add .
git commit -m "Your message"
git push

# Pull latest changes (for groupmates)
git pull

# See commit history
git log --oneline
```

---

**That's it! Your project is now on GitHub!** 🎉

Your groupmates can now clone it, run `npm install`, and start working immediately.
