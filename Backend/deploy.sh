#!/bin/bash

# ParkEase Deployment Script

cd /home/ubuntu/parking-management-systrm/Backend

# Pull latest changes
git pull origin main

# Update backend
npm install
pm2 restart parkease-backend

# Update frontend
cd frontend
npm install
ng build --configuration=production
sudo cp -r dist/frontend/browser/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/

# Reload nginx
sudo systemctl reload nginx

echo "Deployment completed successfully!"
