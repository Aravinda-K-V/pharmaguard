from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import logging
import joblib
import pandas as pd
import os
import json
import re
from dotenv import load_dotenv

from vcf_parser import parse_vcf
from rule_engine import analyze_variants
from llm_engine import generate_explanation
from gene_mapper import get_genes_for_drug
from phenotype_engine import format_diplotype

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="PharmaGuard API")

# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# DRUG ALIASES
# -----------------------------
DRUG_ALIASES = {
    "CODEINE": "CODEINE",
    "CLOPIDOGREL": "CLOPIDOGREL",
    "WARFARIN": "WARFARIN",
    "OMEPRAZOLE": "OMEPRAZOLE",
    "ESOMEPRAZOLE": "ESOMEPRAZOLE",
    "LANSOPRAZOLE": "LANSOPRAZOLE",
    "PANTOPRAZOLE": "PANTOPRAZOLE",
    "VORICONAZOLE": "VORICONAZOLE",
    "CITALOPRAM": "CITALOPRAM",
    "ESCITALOPRAM": "ESCITALOPRAM",
    "SERTRALINE": "SERTRALINE",
    "DIAZEPAM": "DIAZEPAM",
    "TAMOXIFEN": "TAMOXIFEN",
    "PHENYTOIN": "PHENYTOIN",
    "SIMVASTATIN": "SIMVASTATIN",
    "ABACAVIR": "ABACAVIR",
    "CARBAMAZEPINE": "CARBAMAZEPINE",
    "AZATHIOPRINE": "AZATHIOPRINE",
    "ALLOPURINOL": "ALLOPURINOL",
    "DOLO": "DOLO",
    "CROCIN": "CROCIN",
    "PARACETAMOL": "PARACETAMOL",
    "IBUPROFEN": "IBUPROFEN",
    "AZEE": "AZEE",
    "AZITHROMYCIN": "AZEE",
    "CIPRO": "CIPRO",
    "CIPROFLOXACIN": "CIPRO",
    "PAN": "PAN",
    "NORVASC": "NORVASC",
    "AMLODIPINE": "NORVASC",
    "METFORMIN": "METFORMIN",
}

# -----------------------------
# LOAD ML MODEL SAFELY
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

try:
    model = joblib.load(os.path.join(MODEL_DIR, "pharmaguard_model.pkl"))
    encoders = joblib.load(os.path.join(MODEL_DIR, "encoders.pkl"))
    target_encoder = joblib.load(os.path.join(MODEL_DIR, "target_encoder.pkl"))
    logger.info("✅ ML model and encoders loaded successfully")
except Exception as e:
    logger.error(f"❌ Failed to load ML model: {e}")
    model = None
    encoders = None
    target_encoder = None

# -----------------------------
# OPTIONAL GROQ CLIENT
# -----------------------------
groq_api_key = os.getenv("GROQ_API_KEY")
client = None
if groq_api_key:
    try:
        from groq import Groq
        client = Groq(api_key=groq_api_key)
        logger.info("✅ Groq client initialized")
    except Exception as e:
        logger.warning(f"⚠️ Groq client initialization failed: {e}")

# -----------------------------
# HEALTH CHECK
# -----------------------------
@app.get("/")
def home():
    return {
        "message": "PharmaGuard API running 🚀",
        "model_loaded": model is not None,
        "ai_configured": client is not None
    }

# -----------------------------
# UTILS
# -----------------------------
def calculate_confidence(num_variants: int) -> float:
    if num_variants == 0:
        return 0.75
    if num_variants == 1:
        return 0.88
    return 0.95


def normalize_risk_level(risk_label: str, severity: str) -> str:
    risk_lower = (risk_label or "").lower()
    sev_lower = (severity or "").lower()

    if "safe" in risk_lower or sev_lower == "low":
        return "low"
    if (
        sev_lower == "high"
        or "⚠️" in (risk_label or "")
        or "toxic" in risk_lower
        or "ineffective" in risk_lower
        or "contra" in risk_lower
        or "high" in risk_lower
        or "unknown" in risk_lower
        or "exposure can increase" in risk_lower
        or "metabolism affected" in risk_lower
        or "exposure may increase" in risk_lower
        or "reduced activation" in risk_lower
    ):
        return "high"
    if (
        sev_lower == "medium"
        or "adjust" in risk_lower
        or "moderate" in risk_lower
        or "reduced" in risk_lower
        or "generally less prominent" in risk_lower
        or "can affect" in risk_lower
    ):
        return "medium"

    return severity if severity and severity.lower() != "unknown" else "high"


# -----------------------------
# 🔬 CLINICAL ANALYSIS API
# -----------------------------
@app.post("/analyze")
async def analyze(request: Request):
    try:
        content_type = request.headers.get("content-type", "")

        drug_list = []
        gene = None
        variant = None
        file = None
        mode = "clinical"

        if "application/json" in content_type:
            body = await request.json()
            raw_drug = body.get("drug", "")
            if isinstance(raw_drug, list):
                drug_list = [str(d).strip() for d in raw_drug if str(d).strip()]
            elif raw_drug:
                drug_list = [d.strip() for d in str(raw_drug).split(",") if d.strip()]
            gene = body.get("gene")
            variant = body.get("variant")
            mode = body.get("mode", "clinical")
        else:
            form = await request.form()
            drug_list = form.getlist("drug")
            if not drug_list or (len(drug_list) == 1 and "," in str(drug_list[0])):
                raw = form.get("drug")
                if raw:
                    drug_list = [d.strip() for d in str(raw).split(",") if d.strip()]

            gene = form.get("gene")
            variant = form.get("variant")
            file = form.get("file")
            mode = form.get("mode", "clinical")

        logger.info(f"Analyze request: drugs={drug_list}, gene={gene}, variant={variant}")

        # Validation
        if not drug_list:
            return {"error": "Drug is required"}

        drugs = [
            DRUG_ALIASES.get(d.strip().upper(), d.strip().upper())
            for d in drug_list
            if d.strip()
        ]

        variants = []

        # 📂 FILE MODE
        if file and hasattr(file, "file"):
            content = await file.read()
            if len(content) == 0:
                return {"error": "Empty file uploaded"}
            text = content.decode("utf-8", errors="ignore")
            variants = parse_vcf(text.split("\n"))

            if variant:
                target_g = gene.upper() if gene else (get_genes_for_drug(drugs[0])[0] if drugs else "CYP2C19")
                variants.append({
                    "gene": target_g,
                    "star": variant,
                    "rsid": "manual",
                    "diplotype": format_diplotype(variant)
                })

        # ✍️ MANUAL MODE
        else:
            effective_variant = variant if variant else "*2"  # Default test variant to *2 if unstated

            if not gene:
                auto_genes = []
                for d in drugs:
                    mapped = get_genes_for_drug(d)
                    auto_genes.extend(mapped)
                auto_genes = list(set(auto_genes))

                if auto_genes:
                    variants = [
                        {
                            "gene": g,
                            "star": effective_variant,
                            "rsid": "auto",
                            "diplotype": format_diplotype(effective_variant)
                        }
                        for g in auto_genes
                    ]
                else:
                    variants = [
                        {
                            "gene": "CYP2C19",
                            "star": effective_variant,
                            "rsid": "default",
                            "diplotype": format_diplotype(effective_variant)
                        }
                    ]
            else:
                variants = [
                    {
                        "gene": gene.upper(),
                        "star": effective_variant,
                        "rsid": "manual",
                        "diplotype": format_diplotype(effective_variant)
                    }
                ]

        # PROCESS DRUGS
        results = []

        for d in drugs:
            analysis = analyze_variants(variants, d)
            analysis["drug"] = d

            # LLM or safe rule-based explanation
            try:
                explanation = generate_explanation(analysis, mode=mode)
            except Exception as e:
                logger.error(f"LLM explanation error: {e}")
                explanation = {
                    "summary": f"Pharmacogenomic analysis for {d} with {analysis.get('gene', 'N/A')}.",
                    "mechanism": "Enzyme metabolic activity altered by genomic variation.",
                    "clinical_impact": f"Risk level: {analysis.get('risk', 'Unknown')}.",
                    "recommendation": analysis.get("recommendation", "Consult clinician"),
                    "confidence_explanation": "Standard guideline interpretation"
                }

            relevant_variants = [
                v for v in variants if v.get("gene") == analysis.get("gene")
            ]
            confidence = calculate_confidence(len(relevant_variants))

            raw_risk = analysis.get("risk", "High Risk")
            risk_label_clean = "High Risk" if str(raw_risk).lower() == "unknown" else raw_risk

            severity = normalize_risk_level(
                risk_label_clean,
                analysis.get("severity", "high")
            )

            primary_gene = analysis.get("gene", "N/A")
            diplotype = analysis.get("diplotype", "*1/*1")
            raw_phenotype = analysis.get("phenotype", "Atypical / High Risk")
            phenotype = "Atypical / High Risk" if str(raw_phenotype).lower() == "unknown" else raw_phenotype

            detected_vars_list = [
                v.get("star") or v.get("rsid") for v in relevant_variants if v.get("star") or v.get("rsid")
            ]
            if not detected_vars_list:
                detected_vars_list = [diplotype]

            relevance = analysis.get("relevance", "Standard Clinical Profile")

            result = {
                "patient_id": "PATIENT_001",
                "drug": d,
                "timestamp": datetime.utcnow().isoformat(),

                "risk_assessment": {
                    "risk_label": risk_label_clean,
                    "confidence_score": confidence,
                    "severity": severity,
                    "clinical_relevance": relevance,
                },

                "pharmacogenomic_profile": {
                    "primary_gene": primary_gene,
                    "diplotype": diplotype,
                    "phenotype": phenotype,
                    "variants": detected_vars_list,
                    "metabolism_status": phenotype
                },

                "clinical_recommendation": {
                    "action": analysis.get("recommendation", "Consult clinician"),
                    "guideline": "CPIC Guideline available"
                },

                "llm_generated_explanation": explanation,
                "clinical_relevance": relevance,
            }

            results.append(result)

        if not results:
            return {"error": "No analysis could be performed"}

        # Single drug response
        if len(results) == 1:
            return results[0]

        # Multi drug response: include primary drug at top level so Dashboard.tsx reads it directly, plus results array!
        response_data = dict(results[0])
        response_data["multi_drug_analysis"] = True
        response_data["results"] = results
        return response_data

    except Exception as e:
        logger.error(f"Error in /analyze: {e}", exc_info=True)
        return {"error": str(e)}


# -----------------------------
# ⚡ QUICK RISK (ML PREDICT) API
# -----------------------------
class RiskRequest(BaseModel):
    age: int
    gender: str
    ethnicity: str = "Asian"
    condition: str
    drug: str
    past_reaction: str = "no"


@app.post("/predict")
def predict(data: RiskRequest):
    try:
        if model is None or encoders is None or target_encoder is None:
            return {"error": "ML model not loaded"}

        input_data = data.dict()

        # 🔧 SAFE NORMALIZATION
        # Gender
        gender_raw = str(input_data.get("gender") or "M").strip().upper()
        gender = gender_raw if gender_raw in ["M", "F"] else "M"
        if "gender" in encoders and gender not in encoders["gender"].classes_:
            gender = encoders["gender"].classes_[0]
        input_data["gender"] = gender

        # Ethnicity
        eth_raw = str(input_data.get("ethnicity") or "Asian").strip().capitalize()
        if "ethnicity" in encoders and eth_raw in encoders["ethnicity"].classes_:
            ethnicity = eth_raw
        elif "ethnicity" in encoders and "Asian" in encoders["ethnicity"].classes_:
            ethnicity = "Asian"
        elif "ethnicity" in encoders:
            ethnicity = encoders["ethnicity"].classes_[0]
        else:
            ethnicity = "Asian"
        input_data["ethnicity"] = ethnicity

        # Condition
        cond_raw = str(input_data.get("condition") or "cardiac").strip().lower()
        if "condition" in encoders and cond_raw in encoders["condition"].classes_:
            condition = cond_raw
        elif "condition" in encoders:
            if "hypertension" in cond_raw and "hypertension" in encoders["condition"].classes_:
                condition = "hypertension"
            elif any(k in cond_raw for k in ["heart", "cardio", "bp", "cardiac"]) and "cardiac" in encoders["condition"].classes_:
                condition = "cardiac"
            elif any(k in cond_raw for k in ["fever", "temp"]) and "fever" in encoders["condition"].classes_:
                condition = "fever"
            elif any(k in cond_raw for k in ["pain", "ache", "headache"]) and "pain" in encoders["condition"].classes_:
                condition = "pain"
            elif any(k in cond_raw for k in ["infect", "bacteri", "viral"]) and "infection" in encoders["condition"].classes_:
                condition = "infection"
            elif any(k in cond_raw for k in ["stomach", "gastric", "acid", "digest"]) and "digestion" in encoders["condition"].classes_:
                condition = "digestion"
            elif any(k in cond_raw for k in ["sugar", "diabet"]) and "diabetes" in encoders["condition"].classes_:
                condition = "diabetes"
            else:
                condition = encoders["condition"].classes_[0]
        else:
            condition = "cardiac"
        input_data["condition"] = condition

        # Drug
        drug_raw = str(input_data.get("drug") or "warfarin").strip().lower()
        drug_alias_map = {
            "dolo": "dolo",
            "crocin": "crocin",
            "paracetamol": "paracetamol",
            "pan": "pantoprazole",
            "pantoprazole": "pantoprazole",
            "esomeprazole": "esomeprazole",
            "lansoprazole": "lansoprazole",
            "voriconazole": "voriconazole",
            "citalopram": "citalopram",
            "escitalopram": "escitalopram",
            "sertraline": "sertraline",
            "diazepam": "diazepam",
            "azee": "azee",
            "azithromycin": "azee",
            "cipro": "cipro",
            "ciprofloxacin": "cipro",
            "norvasc": "norvasc",
            "amlodipine": "norvasc",
            "metformin": "metformin",
            "ibuprofen": "ibuprofen"
        }
        mapped_drug = drug_alias_map.get(drug_raw, drug_raw)
        if "drug" in encoders and mapped_drug in encoders["drug"].classes_:
            drug = mapped_drug
        elif "drug" in encoders and drug_raw in encoders["drug"].classes_:
            drug = drug_raw
        elif "drug" in encoders:
            drug = encoders["drug"].classes_[0]
        else:
            drug = "warfarin"
        input_data["drug"] = drug

        # Past Reaction
        rx_raw = str(input_data.get("past_reaction") or "no").strip().lower()
        past_reaction = "yes" if rx_raw in ["yes", "y", "true", "1"] else "no"
        if "past_reaction" in encoders and past_reaction not in encoders["past_reaction"].classes_:
            past_reaction = encoders["past_reaction"].classes_[0]
        input_data["past_reaction"] = past_reaction

        # Age
        try:
            age = int(input_data.get("age", 40))
        except (ValueError, TypeError):
            age = 40
        input_data["age"] = age

        df = pd.DataFrame([{
            "age": age,
            "gender": input_data["gender"],
            "ethnicity": input_data["ethnicity"],
            "condition": input_data["condition"],
            "drug": input_data["drug"],
            "past_reaction": input_data["past_reaction"]
        }])

        for col in ["gender", "ethnicity", "condition", "drug", "past_reaction"]:
            df[col] = encoders[col].transform(df[col])

        # 🤖 PREDICT
        pred = model.predict(df)
        proba = model.predict_proba(df)

        risk_val = str(target_encoder.inverse_transform(pred)[0]).lower()
        if risk_val not in ["low", "moderate", "high"] or risk_val == "unknown":
            risk_val = "high"

        confidence_val = float(max(proba[0]))
        confidence_val = round(max(0.01, min(1.0, confidence_val)), 2)

        if confidence_val < 0.4:
            confidence_label = "Low confidence"
        elif confidence_val < 0.7:
            confidence_label = "Moderate confidence"
        else:
            confidence_label = "High confidence"

        # Clinical Relevance Mapping
        relevance_lookup = {
            "clopidogrel": "⚠️ Reduced activation may be important",
            "omeprazole": "⚠️ Drug exposure can increase in reduced metabolizers",
            "esomeprazole": "⚠️ CYP2C19 metabolism affected",
            "lansoprazole": "⚠️ CYP2C19 metabolism affected",
            "pantoprazole": "CYP2C19 involvement, generally less prominent",
            "pan": "CYP2C19 involvement, generally less prominent",
            "voriconazole": "⚠️ Metabolism significantly affected",
            "citalopram": "⚠️ Exposure may increase",
            "escitalopram": "⚠️ Exposure may increase",
            "sertraline": "CYP2C19 can affect metabolism",
            "diazepam": "CYP2C19 can affect metabolism",
            "warfarin": "⚠️ High risk of bleeding / Dose reduction required",
            "codeine": "⚠️ High risk of toxicity or analgesia failure",
            "tamoxifen": "⚠️ Reduced activation / Lower efficacy",
            "simvastatin": "⚠️ High risk of myopathy / Rhabdomyolysis",
            "carbamazepine": "⚠️ Contraindicated / SJS & TEN Risk",
            "abacavir": "⚠️ Contraindicated / Severe Hypersensitivity",
            "allopurinol": "⚠️ Contraindicated / Severe SCAR Risk",
            "phenytoin": "⚠️ Toxic / Severe Neurotoxicity",
            "azathioprine": "⚠️ Toxic / Severe Myelosuppression",
        }

        drug_key = str(input_data["drug"]).lower()
        clinical_relevance = relevance_lookup.get(drug_key, "")

        if clinical_relevance:
            if "⚠️" in clinical_relevance:
                risk_val = "high"
            risk_summary = f"{clinical_relevance} — Pharmacogenomic risk evaluation for {input_data['drug'].title()}."
            key_factors = [
                f"Expected Relevance: {clinical_relevance}",
                f"Age: {input_data['age']}",
                f"Condition: {input_data['condition'].title()}",
                f"Drug: {input_data['drug'].title()}",
                f"Past adverse reaction: {'Yes' if past_reaction == 'yes' else 'None reported'}"
            ]
            what_it_means = f"Patient clinical risk assessment: {clinical_relevance}."
            next_steps = f"Guideline recommendation: Follow clinical precautions for {input_data['drug'].title()}. {clinical_relevance}."
        else:
            risk_summary_map = {
                "low": f"The model predicts a low risk level for {input_data['drug'].title()}.",
                "moderate": f"The model predicts a moderate risk level for {input_data['drug'].title()}.",
                "high": f"The model predicts a high risk level for {input_data['drug'].title()}."
            }
            risk_summary = risk_summary_map.get(
                risk_val,
                f"The model predicts a {risk_val} risk level for {input_data['drug'].title()}."
            )

            key_factors = [
                f"Age: {input_data['age']}",
                f"Condition: {input_data['condition'].title()}",
                f"Drug: {input_data['drug'].title()}",
                f"Past adverse reaction: {'Yes' if past_reaction == 'yes' else 'None reported'}"
            ]

            what_it_means = (
                "This risk assessment indicates the likelihood of adverse side effects "
                "or altered therapeutic efficacy based on demographic and clinical factors."
            )

            next_steps = (
                "Consult a healthcare professional before taking or modifying this medication regimen."
            )

        # 🎯 Return exact structure required by frontend
        return {
            "risk": risk_val,                         # Lowercase "low", "moderate", "high"
            "confidence": confidence_val,             # 0.0 to 1.0 decimal
            "confidence_label": confidence_label,     # Non-empty string
            "risk_summary": risk_summary,             # Non-empty string
            "key_factors": key_factors,               # List of factors
            "what_it_means": what_it_means,           # Non-empty string
            "next_steps": next_steps,                 # Non-empty string
            "mapped_drug": drug,
            "reasons": key_factors,
            "recommendation": next_steps
        }

    except Exception as e:
        logger.error(f"Error in /predict: {e}", exc_info=True)
        return {"error": f"Prediction failed: {str(e)}"}


# -----------------------------
# 🧠 AI INTELLIGENCE API
# -----------------------------
@app.post("/ai-insights")
def ai_insights(data: dict):
    try:
        drug = data.get("drug", "Unknown")
        gene = data.get("gene", "Unknown")
        variant = data.get("variant", "Unknown")

        if not client:
            return {
                "summary": f"{drug} pharmacogenomic evaluation for {gene} ({variant}).",
                "risk_summary": f"Genetic variations in {gene} may impact the pharmacokinetics and clinical response of {drug}.",
                "key_factors": [
                    f"Drug: {drug}",
                    f"Target Gene: {gene}",
                    f"Identified Variant: {variant}"
                ],
                "what_it_means": f"Patients with {variant} in {gene} have altered enzymatic activity affecting {drug} clearance and efficacy.",
                "next_steps": "Consult clinician or reference CPIC guidelines for tailored therapeutic recommendations."
            }

        prompt = f"""
You are a pharmacogenomics expert.

Drug: {drug}
Gene: {gene}
Variant: {variant}

Explain clearly. Return ONLY strict JSON in this format:
{{
  "summary": "...",
  "risk_summary": "...",
  "key_factors": ["...", "..."],
  "what_it_means": "...",
  "next_steps": "..."
}}
"""
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=400,
        )

        content = response.choices[0].message.content

        try:
            return json.loads(content)
        except Exception:
            match = re.search(r"\{[\s\S]*\}", content)
            if match:
                return json.loads(match.group(0))
            return {
                "summary": content,
                "risk_summary": f"Pharmacogenomic analysis for {drug}.",
                "key_factors": [f"Drug: {drug}", f"Gene: {gene}", f"Variant: {variant}"],
                "what_it_means": content[:160] + "...",
                "next_steps": "Consult a healthcare provider."
            }

    except Exception as e:
        logger.error(f"Error in /ai-insights: {e}")
        return {"error": str(e)}
