# Backend Fixes Required for Quick Risk Analysis

## Current Issue
- Frontend calls `/predict` endpoint successfully
- Response received, but UI not rendering
- Risk value might not be lowercase or in expected format

## Required Backend Fixes

### 1. Ensure `/predict` Endpoint Response Format

The endpoint MUST return this exact JSON structure:

```json
{
  "risk": "low" | "moderate" | "high",
  "confidence": 0.0 to 1.0 (decimal, NOT percentage),
  "confidence_label": "string describing confidence level",
  "risk_summary": "string explaining the risk assessment",
  "key_factors": ["factor1", "factor2", "factor3"],
  "what_it_means": "string explaining what the result means",
  "next_steps": "string with recommended actions"
}
```

### 2. Critical Requirements

✅ **Risk Value MUST be lowercase**
```python
risk = risk.lower()  # Return "low", "moderate", or "high" - NOT "Low", "MODERATE", etc.
```

✅ **Confidence must be 0-1 decimal**
```python
# Frontend converts it: Math.round((data.confidence || 0) * 100)
# So if 0.85 is sent, frontend shows 85%
```

✅ **All fields must always be present in response**
- Never return partial JSON
- Use empty strings "" if data unavailable
- Use empty arrays [] for key_factors if unavailable

✅ **Safe encoding for category inputs**
```python
# If input value not in valid categories, replace with default
valid_genders = {"M", "F"}
if payload.get("gender") not in valid_genders:
    gender = "M"  # default

# Do this for all enum/category fields
```

✅ **Error handling**
```python
# Always return JSON, never crash
# If error occurs:
{
  "error": "Descriptive error message explaining what went wrong"
}
# Frontend will catch this and display to user
```

✅ **CORS Headers**
```python
# Response must include:
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### 3. Example Fixed Endpoint (FastAPI)

```python
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

app = FastAPI()

class PredictRequest(BaseModel):
    age: int
    gender: str
    ethnicity: str
    condition: str
    drug: str
    past_reaction: str

@app.post("/predict")
async def predict(request: PredictRequest):
    try:
        # Validate and normalize inputs
        gender = request.gender.upper()
        if gender not in ["M", "F"]:
            gender = "M"  # default
        
        condition = request.condition.lower()
        drug = request.drug.upper()
        
        # Your prediction logic here
        risk_score = calculate_risk(
            age=request.age,
            gender=gender,
            ethnicity=request.ethnicity,
            condition=condition,
            drug=drug,
            past_reaction=request.past_reaction
        )
        
        # Map risk score to label (must be lowercase!)
        if risk_score < 0.4:
            risk_label = "low"
        elif risk_score < 0.7:
            risk_label = "moderate"
        else:
            risk_label = "high"
        
        # Build response with all required fields
        response = {
            "risk": risk_label.lower(),  # CRITICAL: Always lowercase
            "confidence": risk_score,  # 0-1 decimal
            "confidence_label": f"High confidence" if risk_score > 0.8 else "Moderate confidence",
            "risk_summary": f"This drug has a {risk_label} interaction risk for this patient.",
            "key_factors": [
                f"Patient age: {request.age}",
                f"Drug-gene interaction for {drug}",
                f"Medical condition: {condition}"
            ],
            "what_it_means": "This assessment considers your personal factors and known drug interactions.",
            "next_steps": "Consult with your healthcare provider before taking this medication."
        }
        
        return JSONResponse(
            content=response,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Content-Type": "application/json"
            }
        )
    
    except Exception as e:
        # Always return JSON error
        return JSONResponse(
            status_code=200,  # Return 200 OK even for errors
            content={"error": f"Analysis failed: {str(e)}"},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            }
        )
```

### 4. Testing the Backend

Test with curl:

```bash
# Test the endpoint
curl -X POST https://pharmaguard-backend-8kaa.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 50,
    "gender": "M",
    "ethnicity": "Asian",
    "condition": "hypertension",
    "drug": "WARFARIN",
    "past_reaction": "no"
  }'

# Expected response:
{
  "risk": "low",
  "confidence": 0.65,
  "confidence_label": "Moderate confidence",
  "risk_summary": "This drug has a low interaction risk for this patient.",
  "key_factors": ["Patient age: 50", "Drug-gene interaction for WARFARIN", "Medical condition: hypertension"],
  "what_it_means": "This assessment considers your personal factors and known drug interactions.",
  "next_steps": "Consult with your healthcare provider before taking this medication."
}
```

### 5. Verification Checklist

- [ ] Risk is always lowercase ("low", "moderate", "high")
- [ ] Confidence is decimal 0-1, not percentage
- [ ] All 7 fields present in response (risk, confidence, confidence_label, risk_summary, key_factors, what_it_means, next_steps)
- [ ] Empty arrays [] for key_factors if no data
- [ ] Empty strings "" for optional fields if no data
- [ ] Invalid enum values replaced with defaults
- [ ] Response is valid JSON (no Python crashes)
- [ ] CORS headers included
- [ ] Error messages return JSON with "error" field
- [ ] HTTP 200 status for all responses (including errors)

## Frontend Changes Already Applied ✅

The frontend has been updated to:
- Check for `data.error` in response
- Convert risk to lowercase: `riskValue.toLowerCase()`
- Validate risk is one of: "low", "moderate", "high"
- Show detailed error messages in UI
- Log response data for debugging

## Deployment Instructions

1. Update your backend code with the fixes above
2. Deploy to Render
3. Test with the curl command above
4. Verify all 7 fields are returned
5. Frontend will automatically display colored UI (green/yellow/red) with all sections
