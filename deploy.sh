#!/bin/bash

# Configuration
PROJECT_DIR="/root/apps/oms-fastpec"
PM2_APP_NAME="fastpect-iot"
PORT=5160

# Navigate to project directory
cd "$PROJECT_DIR" || exit

# Pull latest changes (optional, uncomment if using git)
# git pull origin main

# Install dependencies just in case
echo "Installing dependencies..."
# npm install

# Clean previous build artifacts
echo "Cleaning previous build artifacts..."
rm -rf .next

# Build the project
echo "Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build successful! Restarting PM2 app..."
    
    # Restart the app with pm2
    pm2 restart "$PM2_APP_NAME"
    
    echo "Application restarted successfully on port $PORT"
else
    echo "Build failed! Application was NOT restarted."
    exit 1
fi
