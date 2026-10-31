import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# =====================================
# 🎯 COMPLETE DRUG LIST
# =====================================
drugs = [
    # Core CPIC Drugs
    "warfarin",
    "clopidogrel",
    "codeine",
    "simvastatin",
    "abacavir",
    "carbamazepine",
    "allopurinol",
    "tamoxifen",
    "phenytoin",
    "azathioprine",

    # CYP2C19 Drugs Requested by User
    "omeprazole",
    "esomeprazole",
    "lansoprazole",
    "pantoprazole",
    "pan",
    "voriconazole",
    "citalopram",
    "escitalopram",
    "sertraline",
    "diazepam",

    # OTC & General
    "dolo",
    "crocin",
    "paracetamol",
    "ibuprofen",
    "azee",
    "azithromycin",
    "cipro",
    "ciprofloxacin",
    "norvasc",
    "amlodipine",
    "metformin"
]

conditions = [
    "cardiac",
    "hypertension",
    "infection",
    "fungal_infection",
    "neurology",
    "depression",
    "anxiety",
    "digestion",
    "acid_reflux",
    "gerd",
    "fever",
    "pain",
    "diabetes",
    "healthy"
]

genders = ["M", "F"]
ethnicities = ["Caucasian", "African", "Asian", "Hispanic"]
past_reactions = ["yes", "no"]

# Expected CYP2C19 High Risk Drugs
CYP2C19_HIGH_RISK_DRUGS = [
    "clopidogrel",    # ⚠️ Reduced activation may be important
    "omeprazole",     # ⚠️ Drug exposure can increase in reduced metabolizers
    "esomeprazole",   # ⚠️ CYP2C19 metabolism affected
    "lansoprazole",   # ⚠️ CYP2C19 metabolism affected
    "voriconazole",   # ⚠️ Metabolism significantly affected
    "citalopram",     # ⚠️ Exposure may increase
    "escitalopram",   # ⚠️ Exposure may increase
    "diazepam"        # CYP2C19 can affect metabolism (marked half-life elevation)
]

# Generally Less Prominent / Moderate Drugs
CYP2C19_MODERATE_DRUGS = [
    "pantoprazole",   # CYP2C19 involvement, generally less prominent
    "pan",
    "sertraline"      # CYP2C19 can affect metabolism
]

np.random.seed(42)

# =====================================
# 📊 DATA GENERATION (CLINICAL LOGIC)
# =====================================
def generate_data(n=10000):
    data = []

    for _ in range(n):
        age = np.random.randint(18, 85)
        gender = np.random.choice(genders)
        ethnicity = np.random.choice(ethnicities)
        condition = np.random.choice(conditions)
        drug = np.random.choice(drugs)
        past_reaction = np.random.choice(past_reactions)

        # Baseline risk
        risk_score = 0.20

        # Age factor
        if age > 65:
            risk_score += 0.20
        elif age > 50:
            risk_score += 0.10

        # Critical narrow-therapeutic index / black-box toxicity drugs
        if drug in ["warfarin", "carbamazepine", "phenytoin", "azathioprine", "abacavir", "allopurinol"]:
            risk_score += 0.40

        # CYP2C19 High-Risk Drugs from User Clinical Table
        elif drug in CYP2C19_HIGH_RISK_DRUGS:
            risk_score += 0.35

        # CYP2C19 Moderate-Risk Drugs from User Clinical Table
        elif drug in CYP2C19_MODERATE_DRUGS:
            risk_score += 0.15

        # Moderate CPIC drugs
        elif drug in ["simvastatin", "tamoxifen", "codeine"]:
            risk_score += 0.25

        # Critical conditions
        if condition in ["cardiac", "hypertension", "neurology", "fungal_infection"]:
            risk_score += 0.15
        elif condition in ["depression", "anxiety", "acid_reflux", "gerd", "digestion"]:
            risk_score += 0.10

        # Past adverse drug reaction
        if past_reaction == "yes":
            risk_score += 0.30

        # Asian ethnicity carries high frequency of CYP2C19 loss-of-function (*2/*3 ~30%) and HLA-B*15:02
        if ethnicity == "Asian" and (drug in CYP2C19_HIGH_RISK_DRUGS or drug in ["carbamazepine", "phenytoin"]):
            risk_score += 0.15

        # Clamp between 0.0 and 1.0
        risk_score = max(0.0, min(1.0, risk_score))

        # Categorize
        if drug in CYP2C19_HIGH_RISK_DRUGS:
            # Consistently High Risk as requested
            risk = "high" if risk_score >= 0.45 else "moderate"
        elif drug in CYP2C19_MODERATE_DRUGS:
            risk = "moderate" if risk_score >= 0.40 else "low"
        else:
            if risk_score < 0.35:
                risk = "low"
            elif risk_score < 0.65:
                risk = "moderate"
            else:
                risk = "high"

        data.append({
            "age": age,
            "gender": gender,
            "ethnicity": ethnicity,
            "condition": condition,
            "drug": drug,
            "past_reaction": past_reaction,
            "risk": risk
        })

    return pd.DataFrame(data)


# =====================================
# 🚀 TRAIN MODEL
# =====================================
if __name__ == "__main__":
    print("🚀 Generating pharmacogenomic dataset...")
    df = generate_data(10000)

    print("📊 Dataset Shape:", df.shape)
    print("💊 Unique Drugs:", len(df["drug"].unique()))
    print("🎯 Risk Distribution:\n", df["risk"].value_counts(normalize=True))

    # Encode categorical features
    encoders = {}
    for col in ['gender', 'ethnicity', 'condition', 'drug', 'past_reaction']:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        encoders[col] = le

    # Target encoding
    target_encoder = LabelEncoder()
    y = target_encoder.fit_transform(df["risk"])

    # Features
    X = df[['age', 'gender', 'ethnicity', 'condition', 'drug', 'past_reaction']]

    # Model
    print("🧠 Training RandomForestClassifier...")
    model = RandomForestClassifier(
        n_estimators=180,
        max_depth=14,
        min_samples_split=4,
        random_state=42
    )
    model.fit(X, y)

    # Save
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(base_dir, "models")
    os.makedirs(model_dir, exist_ok=True)

    joblib.dump(model, os.path.join(model_dir, "pharmaguard_model.pkl"))
    joblib.dump(encoders, os.path.join(model_dir, "encoders.pkl"))
    joblib.dump(target_encoder, os.path.join(model_dir, "target_encoder.pkl"))

    print("✅ MODEL RETRAINED SUCCESSFULLY WITH ALL CYP2C19 DRUGS!")
    print("Supported drugs count:", len(drugs))
