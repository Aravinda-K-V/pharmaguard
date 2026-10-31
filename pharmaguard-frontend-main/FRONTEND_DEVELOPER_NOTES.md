# Quick Risk Analysis - Frontend Developer Checklist

## ✅ What Frontend Fix Includes

### File Modified
- `src/pages/Dashboard.tsx` - Line 194-280

### Improvements
- [x] Response status logging
- [x] Response data logging
- [x] Backend error detection
- [x] Risk value lowercase conversion
- [x] Risk value validation
- [x] Better error display to user

## 🔍 Code Changes Summary

| Feature | Before | After |
|---------|--------|-------|
| Error checking | None | Checks `data.error` |
| Risk format | `data.risk` (any case) | Lowercase `"low"`, `"moderate"`, `"high"` |
| Risk validation | None | Must match exactly |
| Console logs | Minimal | Full payload + response logging |
| Error messages | Generic | Specific backend error details |

## 🧪 Frontend Testing Without Backend

To test the frontend fixes without a working backend, use the Network tab to mock responses:

### Option 1: DevTools Network Tab Mock

1. Open DevTools (F12)
2. Go to Network tab
3. Go to Settings → Conditions
4. Enable "Offline" or throttling
5. Fill quick risk form
6. Observe error handling

### Option 2: Browser Console Override

```javascript
// Paste this in DevTools console to mock a successful response:
window.mockPredict = true;
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (url.includes('/predict') && window.mockPredict) {
    return Promise.resolve(new Response(JSON.stringify({
      risk: "low",
      confidence: 0.75,
      confidence_label: "High confidence",
      risk_summary: "Low interaction risk for this patient.",
      key_factors: ["Age: 50", "Drug metabolism normal", "No history of reactions"],
      what_it_means: "Your pharmacogenomic profile suggests good compatibility.",
      next_steps: "Consult your doctor before starting medication."
    }), {status: 200}));
  }
  return originalFetch.apply(this, arguments);
};
```

### Option 3: Network Tab Request Blocking

1. Open DevTools Network tab
2. Right-click `/predict` request
3. Click "Block request URL"
4. Fill form → see error handling

## 📊 Testing Scenarios

### Scenario 1: Success Case (Green UI)
```javascript
// Expected response
{
  "risk": "low",
  "confidence": 0.7,
  "confidence_label": "Moderate confidence",
  "risk_summary": "Low interaction risk",
  "key_factors": ["Factor 1", "Factor 2"],
  "what_it_means": "Safe to use",
  "next_steps": "Follow dosage instructions"
}

// Expected UI
✅ Green background
✅ "LOW" text in green
✅ All sections visible (summary, factors, meaning, steps)
```

### Scenario 2: Backend Error
```javascript
// Backend returns error
{
  "error": "Invalid condition value provided"
}

// Expected UI
❌ Red error box shows: "Invalid condition value provided"
❌ No result card displayed
```

### Scenario 3: Invalid Risk Value
```javascript
// Backend returns wrong format
{
  "risk": "MODERATE",  // ❌ Uppercase!
  "confidence": 0.5,
  "confidence_label": "Low confidence",
  "risk_summary": "Some risk",
  "key_factors": ["Factor"],
  "what_it_means": "Be careful",
  "next_steps": "Consult doctor"
}

// Expected error in UI
"Invalid risk value from backend: MODERATE. Expected "low", "moderate", or "high"."
```

### Scenario 4: Missing Fields
```javascript
// Backend returns incomplete response
{
  "risk": "moderate",
  "confidence": 0.6
  // Missing: confidence_label, risk_summary, key_factors, etc.
}

// Expected UI
⚠️ Shows partial result but missing sections
⚠️ key_factors section won't render (empty array)
```

## 🐛 Debugging Tips

### Tip 1: Check Request/Response Format
1. F12 → Network tab
2. Run Quick Risk analysis
3. Find `/predict` request
4. Click it → view Request and Response tabs
5. Verify JSON is valid

### Tip 2: Check Type Safety
```typescript
// What type does frontend expect?
const quickResult: {
  risk: "low" | "moderate" | "high";  // ← Must be exact
  confidence: number;
  confidence_label?: string;
  risk_summary?: string;
  key_factors?: string[];
  what_it_means?: string;
  next_steps?: string;
} | null
```

### Tip 3: Console Output Analysis

```javascript
// Good logs indicate successful flow:
"Sending payload: {age: 50, gender: "M", ...}" ✅
"Response status: 200" ✅
"Response data: {risk: "low", confidence: 0.75, ...}" ✅

// Bad logs indicate issues:
"Response status: 500" ❌ Backend error
"Response data: {error: "..."}" ❌ Backend logic error
// Missing "Response data:" ❌ JSON parse failed
```

### Tip 4: Color Verification

```typescript
// Frontend checks risk value for colors:
const colors = {
  "high": {
    bg: "bg-red-50",      // Red background
    border: "border-red-200",
    text: "text-red-600"   // Red text
  },
  "moderate": {
    bg: "bg-yellow-50",    // Yellow background
    border: "border-yellow-200",
    text: "text-yellow-600"  // Yellow text
  },
  "low": {
    bg: "bg-green-50",     // Green background
    border: "border-green-200",
    text: "text-green-600"   // Green text
  }
};

// If risk = "Low" (uppercase), won't match "low" → no colors!
```

## 🔄 Local Development Workflow

### Step 1: Start Dev Server
```bash
npm run dev
```

### Step 2: Open DevTools
Press F12 → Console tab

### Step 3: Navigate to Quick Risk
Click the ⚡ Quick Risk tab

### Step 4: Test with Sample Data
```
Age: 50
Gender: Male
Ethnicity: Asian
Condition: hypertension
Drug: WARFARIN
Past Reaction: No
```

### Step 5: Click Run & Check Console
```
Sending payload: {age: 50, gender: "M", ethnicity: "Asian", ...}
Response status: [should be 200]
Response data: {risk: [check if lowercase], ...}
```

### Step 6: Verify UI
- [ ] Colored background shows
- [ ] Risk level displays
- [ ] Confidence percentage shows
- [ ] Summary section visible
- [ ] Key factors as bullet list
- [ ] "What it means" section visible
- [ ] "Next steps" section visible

## 📝 Common Fixes When Testing

| Issue | Check |
|-------|-------|
| UI shows nothing | Check Response data for all 7 fields |
| Error shows | Copy error message → check backend |
| Wrong colors | Verify risk is lowercase in console |
| Missing sections | Check key_factors, risk_summary, etc. |
| Shows 0% confidence | Check confidence value in response |

## 🚀 Ready to Deploy

Frontend changes are ✅ complete. Backend needs implementation per [BACKEND_FIX_REQUIRED.md](BACKEND_FIX_REQUIRED.md).

Once backend is fixed:
1. Deploy to Render
2. Test with provided curl commands
3. Verify all fields in response
4. Frontend will automatically display colored UI

---

**Last Updated:** Frontend fixes applied  
**Status:** ✅ Ready for backend testing  
**Contact:** Check console logs for debugging details
