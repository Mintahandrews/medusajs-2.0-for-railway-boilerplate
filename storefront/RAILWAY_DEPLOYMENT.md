# Railway Deployment Troubleshooting Guide

## SIGTERM Crash Fix

The `npm error signal SIGTERM` occurs when Railway kills the process. This guide provides solutions.

### Root Causes

1. **Backend Not Ready**: The `launch-storefront` script waits for the backend to be available. If the backend takes too long, Railway times out.
2. **Memory Exhaustion**: Next.js 15 requires more memory during startup/build.
3. **Missing Environment Variables**: Required env vars cause the process to exit.
4. **Health Check Timeout**: Railway kills the app if it doesn't respond to health checks in time.

---

## Solutions Applied

### 1. Health Check Endpoint
Created `/api/health` endpoint for Railway to verify the app is running.

**Location**: `src/app/api/health/route.ts`

### 2. Railway Configuration
Created `railway.json` with:
- Extended health check timeout (300s)
- Proper restart policy
- Health check path configuration

### 3. Memory Optimization
Added `start:standalone` script with minimal Node.js memory allocation (512MB) for cost efficiency.

---

## Railway Service Configuration

### Required Environment Variables

Set these in your Railway storefront service:

```bash
# Required - Get from Medusa Admin → Settings → Publishable API Keys
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxx

# Backend URL (use Railway internal URL for faster connection)
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://your-backend.railway.app

# Storefront URL
NEXT_PUBLIC_BASE_URL=https://your-storefront.railway.app

# Default region (use your primary market)
NEXT_PUBLIC_DEFAULT_REGION=us

# MeiliSearch (auto-configured if using Railway template)
NEXT_PUBLIC_SEARCH_ENDPOINT=https://your-meilisearch.railway.app
NEXT_PUBLIC_SEARCH_API_KEY=your_search_key
NEXT_PUBLIC_INDEX_NAME=products

# Optional: MinIO
NEXT_PUBLIC_MINIO_ENDPOINT=https://your-minio.railway.app

# Support email
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com

# Port (Railway sets this automatically)
PORT=8000
```

### Service Settings in Railway Dashboard

1. **Memory Allocation**: Start with **512MB** (Railway's minimum)
   - Go to service → Settings → Resources
   - Only increase if you see OOM (Out of Memory) errors
   - Next.js 15 can run on 512MB in production mode

2. **Health Check**:
   - Path: `/api/health`
   - Timeout: 300 seconds
   - Interval: 30 seconds

3. **Start Command**: 
   - Use default: `npm run start`
   - Or if issues persist: `npm run start:standalone`

4. **Build Command**:
   - `npm run build`

5. **Service Dependencies**:
   - Ensure backend service starts BEFORE storefront
   - Set service dependency in Railway: storefront → depends on → backend

---

## Debugging Steps

### 1. Check Backend Availability
The storefront waits for the backend. Verify backend is running:
```bash
curl https://your-backend.railway.app/health
```

### 2. Check Logs for Missing Env Vars
Look for this error in Railway logs:
```
🚫 Error: Missing required environment variables
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
```

### 3. Monitor Memory Usage
In Railway dashboard:
- Go to Metrics tab
- Check memory usage during deployment
- Typical usage: 200-400MB for storefront
- Only increase if consistently hitting limits (>90%)

### 4. Verify Build Success
Ensure build completes before start fails:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
```

### 5. Check Service Order
Backend must be fully running before storefront starts:
- Backend → Postgres, Redis, MeiliSearch
- Storefront → Backend

---

## Alternative: Bypass Launcher Scripts

If the `medusajs-launch-utils` launcher continues to cause issues, you can bypass it:

### Option A: Use Standalone Script
In Railway, set start command to:
```bash
npm run start:standalone
```

### Option B: Direct Next.js Start
Set start command to:
```bash
npx next start -p $PORT
```

**Note**: These bypass the backend wait check, so ensure backend is running first.

---

## Common Error Messages

### "npm error signal SIGTERM"
**Cause**: Process killed by Railway  
**Fix**: Increase memory, extend health check timeout, verify env vars

### "Missing required environment variables"
**Cause**: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` not set  
**Fix**: Add the publishable key from Medusa Admin

### "ECONNREFUSED" or "Backend not available"
**Cause**: Backend service not running or wrong URL  
**Fix**: Check backend URL, ensure backend is deployed

### "Timeout waiting for backend"
**Cause**: Backend takes too long to start  
**Fix**: Increase health check timeout, check backend logs

---

## Cost Optimization for Railway

### 1. Use Railway Private Networking (Saves Bandwidth)
For backend URL, use Railway's internal URL:
```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://backend.railway.internal:9000
```
This avoids external traffic charges between services.

### 2. Minimize Memory Usage
- Start with 512MB allocation
- Use `npm run start:standalone` for optimized memory
- Monitor metrics and only increase if needed

### 3. Optimize Build Process
Set in Railway:
```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1  # Disable Next.js telemetry
```

### 4. Use Shared Services
- Share Postgres, Redis, MeiliSearch between environments
- Use Railway's free tier allowances efficiently

### 5. Enable Caching
Next.js caches pages automatically. Ensure you're not disabling it:
- Don't set `revalidate: 0` everywhere
- Use ISR (Incremental Static Regeneration) when possible

---

## Still Having Issues?

1. **Check Railway Status**: https://status.railway.app
2. **Review Full Logs**: Railway Dashboard → Deployments → View Logs
3. **Test Locally**: Run `npm run build && npm run start` locally
4. **Contact Support**: Include deployment logs and error messages

---

## Verification Checklist

- [ ] All environment variables set in Railway
- [ ] Backend service is running and healthy
- [ ] Memory allocation set to 512MB (minimum for cost optimization)
- [ ] Health check configured with 300s timeout
- [ ] Service dependency: storefront depends on backend
- [ ] Publishable API key created in Medusa Admin
- [ ] Build completes successfully
- [ ] Health endpoint returns 200: `https://your-app.railway.app/api/health`
