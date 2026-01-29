# GitHub Setup Guide for EventHub

Follow these steps to set up your EventHub project on GitHub:

## 🔧 Before You Start

**IMPORTANT**: Remove sensitive Firebase credentials from your code before pushing to GitHub!

### 1. Secure Your Firebase Configuration

Create a `.env` file in your project root:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

Then update your `src/firebase.js` to use environment variables:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};
```

Add `.env` to your `.gitignore` file:
```
# Environment variables
.env
.env.local
.env.production
```

## 📚 Step-by-Step GitHub Setup

### Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the details:
   - **Repository name**: `eventhubb` or `event-management-platform`
   - **Description**: "A comprehensive event management platform built with React and Firebase"
   - **Visibility**: Choose Public or Private
   - **Don't** initialize with README (you already have one)
5. Click "Create repository"

### Step 2: Initialize Git in Your Project

Open terminal/command prompt in your project directory:

```bash
# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: EventHub - Event Management Platform

Features:
- User authentication and profiles
- Event discovery and booking
- QR code ticket generation
- Real-time chat system
- Admin and organizer dashboards
- Rating and review system
- Wishlist functionality"
```

### Step 3: Connect to GitHub

Replace `yourusername` with your actual GitHub username:

```bash
# Add GitHub repository as remote origin
git remote add origin https://github.com/yourusername/eventhubb.git

# Push to GitHub
git push -u origin main
```

If you get an error about the default branch, try:
```bash
git branch -M main
git push -u origin main
```

### Step 4: Set Up GitHub Repository Settings

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Select "main" branch and "/ (root)" folder
6. Click "Save"

### Step 5: Add Repository Topics

1. On your repository main page, click the gear icon next to "About"
2. Add topics/tags:
   - `react`
   - `firebase`
   - `event-management`
   - `tailwindcss`
   - `vite`
   - `javascript`
   - `qr-code`
   - `chat-application`
   - `booking-system`

### Step 6: Create Additional Files

Create these files for better project documentation:

#### LICENSE file:
```bash
# Create MIT License
echo "MIT License

Copyright (c) 2024 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the \"Software\"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE." > LICENSE
```

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy automatically

### Option 2: Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Connect your repository
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Add environment variables
7. Deploy

### Option 3: Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

## 📝 Best Practices

1. **Never commit sensitive data** (API keys, passwords)
2. **Use meaningful commit messages**
3. **Create branches for new features**
4. **Write clear documentation**
5. **Add screenshots to README**
6. **Keep dependencies updated**

## 🔄 Regular Updates

```bash
# Add changes
git add .

# Commit with descriptive message
git commit -m "Add new feature: Event filtering by date range"

# Push to GitHub
git push origin main
```

## 🎯 Next Steps

1. Add screenshots to your README
2. Create a demo video
3. Set up GitHub Actions for CI/CD
4. Add issue templates
5. Create a contributing guide
6. Set up automated testing

Your EventHub project is now ready for GitHub! 🎉