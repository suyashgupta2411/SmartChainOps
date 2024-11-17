#!/bin/bash

# Install Railway CLI
npm install -g railway

# Authenticate with Railway
railway login --token 5e7bf088-6764-4fcd-9503-a5c050db2a85

# Deploy Backend
cd backend
railway init --project smartchainops-backend
railway up --detach

# Deploy Frontend
cd ../frontend
railway init --project smartchainops-frontend
railway up --detach

# Return to root
cd ..
echo "Deployment successful. Check your Railway dashboard for URLs."
