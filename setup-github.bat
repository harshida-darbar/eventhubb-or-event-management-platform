@echo off
echo ========================================
echo EventHub - GitHub Setup Script
echo ========================================
echo.

echo Step 1: Creating .env file from template...
if not exist .env (
    copy .env.example .env
    echo .env file created! Please edit it with your Firebase credentials.
) else (
    echo .env file already exists.
)
echo.

echo Step 2: Initializing Git repository...
git init
echo.

echo Step 3: Adding all files to Git...
git add .
echo.

echo Step 4: Creating initial commit...
git commit -m "Initial commit: EventHub - Event Management Platform

Features:
- User authentication and profiles  
- Event discovery and booking
- QR code ticket generation
- Real-time chat system
- Admin and organizer dashboards
- Rating and review system
- Wishlist functionality"
echo.

echo Step 5: Setting up remote repository...
echo Please create a repository on GitHub first, then run:
echo git remote add origin https://github.com/yourusername/eventhubb.git
echo git branch -M main
echo git push -u origin main
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file with your Firebase credentials
echo 2. Create a GitHub repository
echo 3. Run the git remote commands shown above
echo 4. Your project will be live on GitHub!
echo.
pause