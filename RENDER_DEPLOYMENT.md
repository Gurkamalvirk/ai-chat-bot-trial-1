# Render Deployment Configuration

This document provides the configuration needed to deploy this full-stack MERN application as a **single service** on Render.

## ✅ Render Service Settings

### Basic Configuration
- **Environment**: `Node`
- **Root Directory**: `backend`
- **Build Command**: `npm install && cd ../frontend && npm install && npm run build`
- **Start Command**: `npm start`

**⚠️ CRITICAL**: Update the Build Command in your Render dashboard to match the command above. The old command (`cd ../frontend && npm install && npm run build && cd ../backend && npm install`) will NOT work correctly.

**Important**: The build command installs backend dependencies first (from the backend directory), then installs frontend dependencies, then builds the frontend. This ensures Vite is available when needed. The build script uses `npx vite build` to ensure proper execution on Render.

---

## 🔑 Required Environment Variables

Set these in the Render dashboard under "Environment" → "Environment Variables":

### Required (Critical)
- `MONGODB_URI` - Your MongoDB connection string (e.g., `mongodb://user:pass@host:27017/dbname` or MongoDB Atlas URI)
- `JWT_SECRET` - Secret key for JWT token signing (use a strong random string)
- `NODE_ENV` - Set to `production` for production deployments
- `PORT` - Automatically set by Render (do not override unless necessary)

### API Keys (Required for AI providers)
- `OPENAI_API_KEY` - Your OpenAI API key (required if using OpenAI provider)
- `GEMINI_API_KEY` - Your Google Gemini API key (optional, if using Gemini provider)

### Optional Configuration
- `PROVIDER_DEFAULT` - Default AI provider (`openai`, `gemini`, `dialogflow`, `mock`). Default: `openai`
- `CORS_ORIGIN` - CORS origin (not needed in production, handled automatically)
- `RATE_LIMIT_WINDOW_MS` - Rate limit window in milliseconds. Default: `60000` (1 minute)
- `RATE_LIMIT_MAX` - Max requests per window. Default: `120`
- `DAILY_MESSAGE_LIMIT` - Daily message limit per user. Default: `500`
- `BUDGET_DAILY_CENTS` - Daily budget in cents. Default: `500`
- `SUMMARIZATION_MODEL` - Model for summarization. Default: `gpt-3.5-turbo`
- `SUMMARIZATION_TARGET_TOKENS` - Target tokens for summarization. Default: `1200`
- `FEATURE_TOOL_CALLS` - Enable tool calls feature (`true`/`false`). Default: `false`

### Dialogflow (Optional, if using Dialogflow)
- `DIALOGFLOW_PROJECT_ID` - Google Dialogflow project ID
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Google service account credentials JSON

---

## 📋 Deployment Checklist

1. **Build Frontend Locally** (to verify it works):
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   This creates the `frontend/dist` folder that the backend will serve.

2. **Verify Project Structure**:
   ```
   root/
     backend/
       src/
         server.js
       package.json
     frontend/
       dist/        # Created after build
       package.json
   ```

3. **Set Environment Variables** in Render dashboard:
   - At minimum: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `OPENAI_API_KEY`

4. **Deploy**:
   - Connect your repository to Render
   - Set Root Directory to `backend`
   - Set Build Command as specified above
   - Set Start Command to `npm start`
   - Add all required environment variables
   - Deploy!

---

## 🚀 How It Works

1. **Build Phase**: 
   - Render runs the build command which:
     - Installs backend dependencies (from backend directory)
     - Installs frontend dependencies
     - Builds the frontend (creates `frontend/dist/`)

2. **Start Phase**:
   - Backend starts via `npm start` (runs `node src/server.js`)
   - Express serves static files from `../frontend/dist`
   - API routes are served at `/api/*`
   - All other routes serve the React SPA (`index.html`)

3. **Production Behavior**:
   - CORS allows same-origin requests (frontend and backend on same domain)
   - Frontend API calls use relative URLs (`/api/...`)
   - No proxy needed - everything served from one Express server

---

## 🔍 Troubleshooting

### Frontend not loading
- Verify `frontend/dist` exists after build
- Check that static file serving is configured in `backend/src/server.js`
- Ensure catch-all route is after API routes

### API calls failing
- Verify CORS is configured for production (same-origin)
- Check that frontend uses relative URLs (`/api/...` not `http://localhost:4000/api/...`)
- Check environment variables are set correctly

### Build fails with "vite: Permission denied"
- **IMPORTANT**: Make sure the Build Command in Render dashboard is: `npm install && cd ../frontend && npm install && npm run build`
- Verify that `vite` is in `dependencies` (not `devDependencies`) in `frontend/package.json`
- The build script uses `npx vite build` which should resolve permission issues
- If still failing, try: `npm install && cd ../frontend && npm ci && npm run build`

### Build fails
- Ensure Node.js version is 20+ (set in Render if needed)
- Check that both `frontend/package.json` and `backend/package.json` have valid dependencies
- Verify the build command paths are correct
- **Update the Build Command in Render dashboard** - it might still be using the old command

### Database connection fails
- Verify `MONGODB_URI` is set correctly
- Ensure MongoDB is accessible from Render's network
- For MongoDB Atlas, whitelist Render's IP ranges or use `0.0.0.0/0` for testing

---

## 📝 Notes

- The application runs as a **single service** on Render
- Frontend and backend are served from the same port
- Render automatically sets `PORT` environment variable
- In production, CORS is configured to allow same-origin requests only
- All API routes are prefixed with `/api/`
- The React SPA routing is handled by the catch-all route in Express

---

## 🔄 Next Steps After Deployment

1. Set up a MongoDB database (MongoDB Atlas recommended)
2. Run the seed script if needed (connect to the database and run `npm run seed` in the backend)
3. Test the deployed application
4. Monitor logs in Render dashboard
5. Set up custom domain if needed

