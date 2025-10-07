# Railway Deployment Guide

## Prerequisites
1. Railway account (https://railway.app)
2. Pathway license key
3. Landing AI Vision Agent API key

## Deployment Steps

### 1. Create Railway Project
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway new
```

### 2. Set Environment Variables
In Railway dashboard, add these environment variables:
- `PATHWAY_LICENSE_KEY`: Your Pathway license key
- `VISION_AGENT_API_KEY`: Your Landing AI API key

### 3. Deploy
```bash
# From the backend directory
railway up
```

### 4. Get Production URL
After deployment, Railway will provide a URL like:
`https://your-app-name.up.railway.app`

### 5. Update Frontend
Update your Next.js environment variables:
```env
PYTHON_BACKEND_URL=https://your-app-name.up.railway.app
```

## Files Created for Railway
- `Procfile`: Specifies how to run the app
- `railway.json`: Railway-specific configuration
- `.env.example`: Environment variables template
- Health check endpoint at `/` for Railway monitoring

## Testing
Test the deployed backend:
```bash
curl https://your-app-name.up.railway.app/
curl -X POST https://your-app-name.up.railway.app/documents/parse-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/document.pdf"}'
```