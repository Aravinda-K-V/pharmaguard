# Quick Risk Analysis - Testing & Debugging Guide

## ✅ Frontend Fixes Applied

### Changes Made to `src/pages/Dashboard.tsx`

The `handleQuickRiskAnalyze` function has been updated with:

1. **Response Status Logging**
   ```javascript
   console.log("Response status:", res.status);
   ```
   - Helps identify HTTP errors

2. **Error Checking After JSON Parsing**
   ```javascript
   const data = await res.json();
   console.log("Response data:", data);
   
   if (data.error) {
     throw new Error(data.error);
   }
   ```
   - Catches backend error responses
   - Displays error message to user

3. **Risk Value Normalization**
   ```javascript
   const riskValue = (data.risk || "").toLowerCase();
   ```
   - Converts to lowercase for UI matching
   - Prevents "Low", "MODERATE", "HIGH" from breaking UI

4. **Risk Value Validation**
   ```javascript
   if (!["low", "moderate", "high"].includes(riskValue)) {
     throw new Error(`Invalid risk value from backend: ${data.risk}...`);
   }
   ```
   - Ensures risk is one of expected values
   - Fails fast with clear error message

## 🧪 Local Testing Steps

### 1. Start Frontend Dev Server

```bash
cd "c:\Users\preri\Downloads\pgx-ai-health-main (1)\pgx-ai-health-main"
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

### 2. Open Browser DevTools

Press `F12` and go to **Console** tab

### 3. Navigate to Quick Risk Tab

1. Open http://localhost:5173/
2. Click "Quick Risk" tab (middle button with ⚡ icon)
3. Fill in all fields:
   - Age: 50
   - Gender: Male
   - Ethnicity: Asian
   - Medical Condition: hypertension
   - Drug: WARFARIN
   - Past Reaction: No

### 4. Click "Run Quick Risk Check"

### 5. Check Console Logs

You should see:
```
Sending payload: {age: 50, gender: "M", ethnicity: "Asian", ...}
Response status: 200
Response data: {risk: "low", confidence: 0.65, ...}
```

**If you see errors, note the exact message** - this indicates what the backend needs to fix.

## 🔍 Debugging Checklist

### Issue: UI Not Rendering (Shows Nothing)

**Possible Causes:**

1. **Response is missing fields**
   - Check console: `console.log("Response data:", data);`
   - Ensure all 7 fields are present
   - Missing fields won't render sections

2. **Risk value is wrong case**
   - Console should show lowercase
   - If shows "Low", "MODERATE", "HIGH" → Backend needs fix

3. **Risk value is invalid**
   - Should be exactly: "low", "moderate", "high"
   - Not: "Low Risk", "moderate-risk", "3", etc.

### Issue: Error Message Shows in Red

**Check the error message:**

```javascript
// Open DevTools Console and look for:
Quick Risk analysis error: [ERROR MESSAGE HERE]
```

**Common errors and fixes:**

| Error | Cause | Fix |
|-------|-------|-----|
| `Invalid risk value from backend: ...` | Backend sending wrong format | Backend needs lowercase conversion |
| `Backend error: 500` | Backend crash | Check backend logs on Render |
| `Cannot read property 'risk' of undefined` | Backend returned null | Backend not handling inputs |
| `Network error or backend issue` | Fetch failed | Backend down or CORS blocked |

### Issue: Response Shows but Sections Missing

**Example:** Shows RISK but no Summary/Key Factors

- Check console: `Response data: {...}`
- Look for missing fields: `risk_summary`, `key_factors`, etc.
- Backend must include ALL fields (use "" or [] for empty ones)

## 🚀 Test Different Scenarios

### Test 1: Low Risk
```
Age: 25
Gender: Female
Condition: healthy
Drug: CODEINE
```
Expected: Green background, "LOW" text, green sections

### Test 2: Moderate Risk
```
Age: 55
Gender: Male
Condition: diabetes
Drug: SIMVASTATIN
```
Expected: Yellow background, "MODERATE" text, yellow sections

### Test 3: High Risk
```
Age: 75
Gender: Female
Condition: heart_disease
Drug: WARFARIN
Past Reaction: Yes
```
Expected: Red background, "HIGH" text, red sections

## 🔧 Backend Testing

If frontend shows errors, test backend directly:

### Using PowerShell/Command Prompt

```powershell
$body = @{
    age = 50
    gender = "M"
    ethnicity = "Asian"
    condition = "hypertension"
    drug = "WARFARIN"
    past_reaction = "no"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "https://pharmaguard-backend-8kaa.onrender.com/predict" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

### Using curl (if available)

```bash
curl -X POST https://pharmaguard-backend-8kaa.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{"age": 50, "gender": "M", "ethnicity": "Asian", "condition": "hypertension", "drug": "WARFARIN", "past_reaction": "no"}'
```

### Expected Successful Response

```json
{
  "risk": "low",
  "confidence": 0.65,
  "confidence_label": "Moderate confidence",
  "risk_summary": "This drug has a low interaction risk...",
  "key_factors": ["Factor 1", "Factor 2", "Factor 3"],
  "what_it_means": "This assessment considers...",
  "next_steps": "Consult with your healthcare provider..."
}
```

## 📋 Verification Checklist

After fixing backend, verify:

- [ ] Risk is lowercase: "low", "moderate", or "high"
- [ ] Confidence is 0-1 decimal (not percentage)
- [ ] All 7 JSON fields present
- [ ] key_factors is an array (not null)
- [ ] No Python errors in backend logs
- [ ] CORS headers present
- [ ] Frontend shows colored sections
- [ ] Summary displays
- [ ] Key factors display as bullet list
- [ ] "What it means" displays
- [ ] "Next steps" displays

## 🆘 Still Having Issues?

### Step 1: Check Frontend Logs

1. Open DevTools (F12)
2. Go to Console tab
3. Look for messages starting with "Quick Risk analysis error:"
4. Copy the exact error message

### Step 2: Check Backend Logs

1. Go to https://dashboard.render.com/
2. Select your backend service (pharmaguard-backend)
3. Go to Logs tab
4. Look for Python errors or crashes
5. Check the exact error details

### Step 3: Verify Response Format

Use browser DevTools Network tab:
1. Open Network tab (F12 → Network)
2. Run Quick Risk analysis
3. Find the `/predict` request
4. Click it and view Response
5. Verify all 7 fields are present
6. Check field values and types

## 📝 Log Examples

### ✅ Success Logs

```
Sending payload: {age: 50, gender: "M", ethnicity: "Asian", condition: "hypertension", drug: "WARFARIN", past_reaction: "no"}
Response status: 200
Response data: {
  risk: "low",
  confidence: 0.85,
  confidence_label: "High confidence",
  risk_summary: "Low interaction risk detected",
  key_factors: Array(3),
  what_it_means: "Based on pharmacogenomic...",
  next_steps: "Safe to use with monitoring"
}
```

### ❌ Error Logs

```
Sending payload: {...}
Response status: 200
Response data: {error: "Encoder received invalid input value: 'invalid_condition'"}
Quick Risk analysis error: Encoder received invalid input value: 'invalid_condition'
```

## 💡 Quick Fixes

**If risk still shows as undefined:**
- Backend is sending `"risk": null` or missing risk field
- Add fallback: `risk: (data.risk || "low").toLowerCase()`

**If only title shows but no sections:**
- Missing risk_summary, key_factors, what_it_means, next_steps fields
- Backend must populate ALL fields

**If colors are wrong:**
- Risk value doesn't match "low", "moderate", "high" exactly
- Add logging: `console.log("Risk value:", quickResult.risk);`

**If confidence shows as 0%:**
- Backend sending `confidence: 0` or `null`
- Add backend check: `ensure confidence > 0`
