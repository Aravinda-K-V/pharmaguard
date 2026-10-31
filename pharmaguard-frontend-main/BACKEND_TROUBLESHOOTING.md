# Backend Connection Troubleshooting Guide

## Frontend Changes Made ✅
- Added environment variable support (`VITE_BACKEND_URL`)
- Improved error messages with backend URL info
- Added console logging for debugging
- Better error handling and network error detection

## Troubleshooting Steps

### 1. Check Backend Status
```bash
# Visit the backend health check endpoint
curl https://pharmaguard-backend-8kaa.onrender.com/
```
If this doesn't return a response, your backend is down.

### 2. Verify CORS is Enabled on Backend
The backend needs these headers in responses:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

**If CORS fails**, you'll see errors like:
- "Access to fetch blocked by CORS policy"
- Browser console shows red errors

### 3. Check Backend Logs on Render
1. Go to your Render dashboard
2. Select your backend service
3. Check the **Logs** tab for errors
4. Look for Python stack traces if it's crashing

### 4. Verify Endpoint Structure
Test these endpoints with your backend:
```bash
# Clinical Analysis
curl -X POST https://pharmaguard-backend-8kaa.onrender.com/analyze \
  -H "Content-Type: application/json" \
  -d '{"drug": "WARFARIN"}'

# Quick Risk Prediction
curl -X POST https://pharmaguard-backend-8kaa.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{"age": 50, "gender": "M", "drug": "WARFARIN"}'
```

### 5. Check Frontend Error Messages
1. Open DevTools (F12)
2. Go to **Console** tab
3. Try the analysis again
4. Look for detailed error messages with backend URL

### 6. Environment Variables
Create `.env` file in project root:
```
VITE_BACKEND_URL=https://pharmaguard-backend-8kaa.onrender.com
```

For development testing:
```
VITE_BACKEND_URL=http://localhost:8000
```

### 7. Common Backend Issues
- **Service spinning down**: Render free tier services sleep after 15 min of inactivity
- **Cold start**: First request after sleep takes 30+ seconds
- **Missing environment vars**: Backend may need API keys, database URLs
- **Port issues**: Ensure backend is listening on correct port
- **Response format**: Ensure JSON structure matches frontend expectations

## Quick Test
1. Run frontend: `npm run dev`
2. Open DevTools Console
3. Try an analysis
4. Check console for actual error message
5. Share the error message for specific help

## Still Not Working?

Check:
1. Is backend actually running? → Test endpoint with curl
2. Are headers correct? → Check request/response headers in DevTools Network tab
3. Is response format correct? → Log the JSON in console
4. Network issues? → Ping backend URL or check Render service status
