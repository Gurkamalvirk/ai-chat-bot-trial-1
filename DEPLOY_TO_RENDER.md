# 🚀 Deploy to Render - Step by Step Guide

This guide will walk you through deploying your AI Chat Bot to Render.

## ⚡ Quick Start - Essential Settings

**Copy these exact settings when creating your Render service:**

```
Root Directory: backend
Build Command: npm install && cd ../frontend && npm install && npm run build
Start Command: npm start
```

**Required Environment Variables (for Gemini):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai_chat
JWT_SECRET=<generate-random-string>
NODE_ENV=production
GEMINI_API_KEY=<your-gemini-api-key>
PROVIDER_DEFAULT=gemini
```

👉 **See "Quick Reference" section at the bottom for complete copy-paste settings.**

## Prerequisites

1. **GitHub Account** - Your code needs to be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com) (free tier available)
3. **MongoDB Database** - You'll need a MongoDB connection string (MongoDB Atlas recommended)
4. **AI Provider API Key** - Choose one:
   - **Gemini API Key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey) (Recommended)
   - **OpenAI API Key** - Get from [OpenAI Platform](https://platform.openai.com/api-keys)

---

## Step 1: Push Your Code to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Ready for Render deployment"
   ```

2. **Create a GitHub repository**:
   - Go to [GitHub](https://github.com/new)
   - Create a new repository (don't initialize with README)
   - Copy the repository URL

3. **Push your code**:
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Copy your API key (it will look like: `AIza...`)
5. Save it securely - you'll need it for Step 5 (Environment Variables)

**Note**: Gemini API keys are free to use with generous rate limits. Make sure to keep your API key secure and never commit it to Git.

---

## Step 3: Set Up MongoDB Database

### Option A: MongoDB Atlas (Recommended - Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a new cluster (free tier: M0)
4. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Set username and password (save these!)
   - Set privileges to "Atlas admin" or "Read and write to any database"
5. Whitelist IP addresses:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (or add Render's IP ranges)
6. Get connection string:
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/ai_chat`)
   - Replace `<password>` with your actual password
   - Replace `<database>` with `ai_chat` (or your preferred database name)

### Option B: Render MongoDB (Paid)

1. In Render dashboard, create a new "MongoDB" service
2. Render will provide the connection string automatically

---

## Step 4: Create Render Service

1. **Log in to Render**:
   - Go to [render.com](https://render.com)
   - Sign in (or sign up with GitHub)

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository you just pushed

3. **Configure Service Settings**:
   - **Name**: `ai-chat-bot` (or any name you like)
   - **Environment**: `Node`
   - **Node Version**: `20` (or higher) - Set this in Advanced settings if needed
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend` ⚠️ **IMPORTANT** - This tells Render where your backend code is
   - **Build Command**: `npm install && cd ../frontend && npm install && npm run build` ⚠️ **CRITICAL** - Must be exactly this
   - **Start Command**: `npm start`
   - **Auto-Deploy**: `Yes` (automatically deploys on git push)

---

## Step 5: Set Environment Variables

In the Render dashboard, go to your service → **Environment** tab → Add these variables:

### Required Variables (Critical):

When adding these in Render dashboard, use the format: **Key** = **Value**

#### For Gemini Provider (Recommended):

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/ai_chat
JWT_SECRET = your-super-secret-jwt-key-change-this-to-random-string
NODE_ENV = production
GEMINI_API_KEY = your-gemini-api-key-here
PROVIDER_DEFAULT = gemini
```

#### For OpenAI Provider (Alternative):

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/ai_chat
JWT_SECRET = your-super-secret-jwt-key-change-this-to-random-string
NODE_ENV = production
OPENAI_API_KEY = sk-your-openai-api-key-here
PROVIDER_DEFAULT = openai
```

**Important Notes**:
- `NODE_ENV` value should be exactly: `production` (lowercase, no quotes)
- `PORT` is automatically set by Render - do NOT add it as an environment variable
- For `MONGODB_URI`, replace `username`, `password`, and `cluster` with your actual MongoDB Atlas credentials
- For `JWT_SECRET`, use a long random string (see "How to Generate JWT_SECRET" below)
- **For Gemini**: You need `GEMINI_API_KEY` and `PROVIDER_DEFAULT=gemini`
  - Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **For OpenAI**: You need `OPENAI_API_KEY` and `PROVIDER_DEFAULT=openai`
  - Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)

### Optional Variables (use defaults if not set):

```
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120
DAILY_MESSAGE_LIMIT=500
BUDGET_DAILY_CENTS=500
SUMMARIZATION_MODEL=gpt-3.5-turbo
SUMMARIZATION_TARGET_TOKENS=1200
FEATURE_TOOL_CALLS=false
CORS_ORIGIN=<not needed in production, handled automatically>
```

**Note**: `PROVIDER_DEFAULT` should be set to `gemini` or `openai` based on which provider you're using (see Required Variables above).

### For Dialogflow Provider (Optional):

```
DIALOGFLOW_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
```

### How to Generate JWT_SECRET:

Run this command to generate a secure random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or use an online generator: [randomkeygen.com](https://randomkeygen.com/)

---

## Step 6: Deploy

1. **Click "Create Web Service"** at the bottom
2. Render will start building and deploying your app
3. **Monitor the logs** - You'll see the build progress
4. Wait for deployment to complete (usually 3-5 minutes)

---

## Step 7: Seed the Database (Optional)

After deployment, you may want to seed the database with a demo user:

1. **Option A: Using Render Shell** (Recommended):
   - Go to your service in Render dashboard
   - Click on "Shell" tab (or "Manual Deploy" → "Run in Shell")
   - Run: `npm run seed`
   - This creates a demo user: `demo@example.com` / `password`

2. **Option B: Using MongoDB Compass**:
   - Download [MongoDB Compass](https://www.mongodb.com/products/compass)
   - Connect to your MongoDB Atlas cluster using the connection string
   - Manually create a user in the `users` collection

3. **Option C: Using the App**:
   - After deployment, visit your app URL
   - Register a new user through the app's registration form

---

## Step 8: Test Your Deployment

1. **Visit your app**: Click the URL provided by Render (e.g., `https://ai-chat-bot.onrender.com`)
2. **Test authentication**: Register or login
3. **Test chat**: Send a message to verify AI functionality

---

## ⚠️ CRITICAL - Build Command

**The Build Command MUST be exactly**:
```
npm install && cd ../frontend && npm install && npm run build
```

**Why this order matters**:
1. First, installs backend dependencies (from `backend` directory where Root Directory is set)
2. Then, moves to frontend directory and installs frontend dependencies
3. Finally, builds the frontend (creates `frontend/dist/` folder)

**Common Error**: If you get "vite: Permission denied", it's because:
- The build command order is wrong
- Or vite is not in dependencies (but it already is in your project ✅)

## Troubleshooting

### Build Fails with "vite: Permission denied"

**Solution**: 
1. Make sure your Build Command in Render dashboard is exactly: `npm install && cd ../frontend && npm install && npm run build`
2. Verify that `vite` is in `dependencies` (not `devDependencies`) in `frontend/package.json` ✅ (Already correct in your project)
3. Make sure your latest code is pushed to GitHub
4. Go to Render dashboard → Your Service → Settings → Build & Deploy → Update Build Command → Save and redeploy

### Build Fails (General)

**Check**:
- Node.js version is 20+ (set in Render Advanced settings if needed)
- Both `frontend/package.json` and `backend/package.json` have valid dependencies
- Build command paths are correct
- Build Command order: backend install → frontend install → frontend build
- Check Render logs for specific error messages

### Database Connection Fails

**Check**:
- MongoDB URI is correct
- Password is URL-encoded (replace special characters with % encoding)
- IP whitelist includes Render's IPs (or use 0.0.0.0/0 for testing)
- Database name is correct

### API Calls Fail

**Check**:
- Frontend is using relative URLs (`/api/...`) ✅ (Already correct)
- CORS is configured for production ✅ (Already configured)
- Environment variables are set correctly

### Frontend Not Loading

**Check**:
- Build completed successfully (check build logs)
- `frontend/dist` folder exists after build
- Root Directory is set to `backend` (not root)
- Static file serving is configured in `backend/src/server.js` ✅ (Already configured)
- Catch-all route is after API routes ✅ (Already configured)
- Check browser console for errors

### AI Provider API Errors

**For Gemini**:
- `GEMINI_API_KEY` is set correctly
- `PROVIDER_DEFAULT=gemini` is set
- API key is valid (get from [Google AI Studio](https://makersuite.google.com/app/apikey))
- Rate limits haven't been exceeded

**For OpenAI**:
- `OPENAI_API_KEY` is set correctly
- `PROVIDER_DEFAULT=openai` is set
- API key is valid and has credits
- Rate limits haven't been exceeded

---

## Useful Render Features

1. **Auto-Deploy**: Every push to `main` branch automatically deploys
2. **Manual Deploy**: You can manually deploy from any branch
3. **Logs**: View real-time logs in the Render dashboard
4. **Metrics**: Monitor your app's performance
5. **Custom Domain**: Add your own domain in the service settings

---

## Cost Estimate

- **Free Tier**: 
  - 750 hours/month free
  - Service spins down after 15 minutes of inactivity
  - Good for development/testing
  
- **Starter Plan** ($7/month):
  - Always on
  - Better for production

---

## Next Steps

1. ✅ Deploy to Render
2. ✅ Set up MongoDB Atlas
3. ✅ Configure environment variables
4. ✅ Test the deployment
5. 🔄 Set up custom domain (optional)
6. 🔄 Enable HTTPS (automatic on Render)
7. 🔄 Set up monitoring and alerts
8. 🔄 Configure backups for MongoDB

---

## 🎯 Quick Reference - Copy & Paste Settings

### Render Service Configuration:
```
Environment: Node
Node Version: 20 (or higher)
Root Directory: backend
Build Command: npm install && cd ../frontend && npm install && npm run build
Start Command: npm start
Auto-Deploy: Yes
```

### Required Environment Variables:

In Render dashboard, add these as separate environment variables:

**For Gemini (Recommended):**

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/ai_chat` |
| `JWT_SECRET` | `<generate-random-string>` (see command below) |
| `NODE_ENV` | `production` |
| `GEMINI_API_KEY` | `<your-gemini-api-key>` |
| `PROVIDER_DEFAULT` | `gemini` |

**For OpenAI (Alternative):**

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/ai_chat` |
| `JWT_SECRET` | `<generate-random-string>` (see command below) |
| `NODE_ENV` | `production` |
| `OPENAI_API_KEY` | `sk-<your-key>` |
| `PROVIDER_DEFAULT` | `openai` |

**Notes**: 
- `NODE_ENV` = exactly `production` (lowercase)
- `PORT` is automatically set by Render - do NOT add it as an environment variable
- Get Gemini API key from: [Google AI Studio](https://makersuite.google.com/app/apikey)
- Get OpenAI API key from: [OpenAI Platform](https://platform.openai.com/api-keys)

### Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Your App URL**: `https://your-service-name.onrender.com`

---

## 📋 How It Works

1. **Build Phase**: 
   - Render runs from `backend` directory (Root Directory)
   - Installs backend dependencies
   - Moves to `frontend` directory
   - Installs frontend dependencies
   - Builds frontend (creates `frontend/dist/`)

2. **Start Phase**:
   - Backend starts via `npm start` (runs `node src/server.js`)
   - Express serves static files from `../frontend/dist`
   - API routes served at `/api/*`
   - All other routes serve React SPA (`index.html`)

3. **Production Behavior**:
   - CORS allows same-origin requests only (frontend and backend on same domain)
   - Frontend uses relative URLs (`/api/...`) ✅ (Already configured)
   - No proxy needed - everything served from one Express server
   - HTTPS is automatic on Render

---

## Support

If you encounter issues:
1. Check the Render logs for errors
2. Verify all environment variables are set
3. Test MongoDB connection separately
4. Check Render's status page: [status.render.com](https://status.render.com)

Good luck with your deployment! 🚀

