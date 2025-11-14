# Deployment Guide: Smart Financial Ratio Analyzer

## Overview
This guide will help you deploy the Smart Financial Ratio Analyzer to production using:
- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (FastAPI + Python)

---

## Prerequisites
- GitHub account
- Vercel account (free tier available)
- Render account (free tier available)
- Google Generative AI API key (for Gemini)

---

## Part 1: Backend Deployment (Render)

### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Create Render Account & Connect GitHub

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Grant access to your repository

### Step 3: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Fill in the configuration:
   - **Name**: `smart-financial-ratio-analyzer-api`
   - **Environment**: `Python 3`
   - **Region**: Choose closest to you (Oregon recommended)
   - **Branch**: `main`
   - **Build Command**: 
     ```
     cd backend && pip install --upgrade pip && pip install -r requirements.txt
     ```
   - **Start Command**: 
     ```
     cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
     ```

### Step 4: Add Environment Variables

In Render dashboard, go to **Environment** section and add:

| Key | Value | Notes |
|-----|-------|-------|
| `GEMINI_API_KEY` | Your API key | Get from Google Cloud Console |
| `DEBUG` | `false` | Production setting |
| `FRONTEND_URL` | Will update after Vercel deployment | e.g., `https://your-frontend.vercel.app` |

### Step 5: Note Your Backend URL

After deployment, Render will give you a URL like:
```
https://smart-financial-ratio-analyzer-api.onrender.com
```

Save this - you'll need it for frontend configuration.

---

## Part 2: Frontend Deployment (Vercel)

### Step 1: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Select your repository
5. Select `frontend` as the root directory

### Step 2: Configure Build Settings

Vercel should auto-detect Vite, but verify:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Add Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables**:

| Name | Value | 
|------|-------|
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com/api/v1` |

Example:
```
VITE_API_BASE_URL=https://smart-financial-ratio-analyzer-api.onrender.com/api/v1
```

### Step 4: Deploy

Click **"Deploy"** - Vercel will build and deploy your frontend.

After successful deployment, you'll get a URL like:
```
https://your-frontend.vercel.app
```

---

## Part 3: Update Backend CORS

Now that you have both URLs:

1. Go back to **Render Dashboard**
2. Select your backend service
3. Update environment variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: Your Vercel URL (e.g., `https://your-frontend.vercel.app`)
4. Click **"Save changes"** - auto-deploys

---

## Part 4: Add Custom Domain (Optional)

### For Backend (Render)
1. Go to your Render service settings
2. Scroll to **Custom Domains**
3. Add your domain and follow DNS instructions

### For Frontend (Vercel)
1. Go to **Settings** → **Domains**
2. Add your domain
3. Follow the DNS setup instructions

---

## Testing Deployment

### Test Backend Health
```bash
curl https://your-backend.onrender.com/health
```

Expected response:
```json
{"status": "healthy", "service": "financial-analyzer-api"}
```

### Test Frontend
Visit your Vercel URL in browser - should load without errors.

Check browser console for any API errors - if you see CORS errors, verify the `FRONTEND_URL` environment variable on Render.

---

## Troubleshooting

### Frontend shows blank page
- Check browser console for API errors
- Verify `VITE_API_BASE_URL` environment variable in Vercel
- Make sure backend is running on Render

### API returns CORS errors
- Verify `FRONTEND_URL` is set correctly on Render backend
- The URL should match your Vercel deployment URL exactly
- Redeploy backend after changing environment variables

### File uploads fail
- Backend may have run out of space on free Render tier
- Consider uploading to cloud storage (S3, Google Cloud Storage)
- Modify `upload` endpoint to use temporary storage

### Backend goes to sleep (free Render tier)
- Free tier spins down after 15 mins of inactivity
- First request after spin-down takes ~30 seconds
- Consider upgrading to paid tier for production

---

## Production Optimizations

### Backend (Render)
1. **Consider upgrading** from free tier for production reliability
2. **Use environment-specific configuration** - already done!
3. **Monitor logs** in Render dashboard
4. **Set up health checks** - already configured at `/health`

### Frontend (Vercel)
1. **Enable Web Analytics** (free on Vercel)
2. **Set up preview deployments** for pull requests
3. **Monitor build logs** and performance

---

## Key Files Modified/Created

- ✅ `render.yaml` - Render deployment configuration
- ✅ `frontend/vercel.json` - Vercel configuration
- ✅ `backend/app/core/config.py` - Updated for production
- ✅ Environment variable setup in both platforms

---

## Next Steps

1. ✅ Push all changes to GitHub
2. ✅ Connect Render to your repo
3. ✅ Deploy backend on Render
4. ✅ Connect Vercel to your repo
5. ✅ Deploy frontend on Vercel
6. ✅ Update CORS configuration with both URLs
7. ✅ Test both endpoints
8. ✅ Monitor for any issues in dashboards

---

## Support Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [Vite Production Build Guide](https://vitejs.dev/guide/build.html)
