# Cure It - Render Deployment Guide

## Prerequisites
1. GitHub repository with your code
2. Render account (render.com)
3. PostgreSQL database (can be created on Render)

## Step-by-Step Deployment Instructions

### 1. Prepare Your Repository
Ensure your GitHub repository contains all the files including:
- `render.yaml` (created)
- `Dockerfile` (created)
- `.env.example` (created)
- All source code

### 2. Create Database on Render
1. Go to Render dashboard
2. Click "New" → "PostgreSQL"
3. Configure:
   - Name: `cure-it-db`
   - Database Name: `cure_it`
   - User: `cure_it_user`
   - Plan: Free (or your preferred plan)
4. Click "Create Database"
5. Note the connection string for later use

### 3. Deploy Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: `cure-it-app`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Free (or your preferred plan)

### 4. Environment Variables
Add these environment variables in Render:
```
NODE_ENV=production
DATABASE_URL=[Your PostgreSQL connection string from step 2]
```

### 5. Advanced Settings
- Health Check Path: `/api/health`
- Auto-Deploy: Yes (recommended)

## Alternative: Using render.yaml (Blueprint)
If you prefer automated setup:
1. Push the `render.yaml` file to your repository
2. In Render dashboard, click "New" → "Blueprint"
3. Connect your repository
4. Render will automatically create both the web service and database

## Post-Deployment Steps
1. Wait for deployment to complete
2. Check logs for any errors
3. Visit your app URL to verify it's working
4. Test authentication and emergency contacts functionality

## Database Migration
The app will automatically create necessary tables on first run using Drizzle ORM.

## Custom Domain (Optional)
1. Go to your web service settings
2. Click "Custom Domains"
3. Add your domain and configure DNS

## Troubleshooting
- Check Render logs if deployment fails
- Ensure DATABASE_URL is correctly set
- Verify all dependencies are in package.json
- Check that the build command completes successfully

## Monitoring
- Use Render's built-in monitoring
- Health check endpoint: `https://your-app-url.onrender.com/api/health`
- Check logs regularly for performance issues

Your Cure It application will be available at: `https://cure-it-app.onrender.com` (or your custom domain)