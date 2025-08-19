#!/bin/bash

# ParkEase Deployment Script

cd /home/ubuntu/parkease

# Pull latest changes
git pull origin main

# Update backend
npm install
pm2 restart parkease-backend

# Update frontend
cd frontend
npm install
ng build --configuration=production
sudo cp -r dist/frontend/* /var/www/html/

# Reload nginx
sudo systemctl reload nginx

echo "Deployment completed successfully!"