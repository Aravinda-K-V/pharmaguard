# phenotype_engine.py

ALLELE_ACTIVITY = {
    # CYP2D6
    "*1": 1.0,
    "*2": 1.0,
    "*4": 0.0,
    "*5": 0.0,
    "*6": 0.0,
    "*10": 0.25,
    "*17": 0.5,
    "*41": 0.5,

    # CYP2C19
    "*1": 1.0,
    "*2": 0.0,
    "*3": 0.0,
    "*17": 1.5,

    # CYP2C9
    "*1": 1.0,
    "*2": 0.5,
    "*3": 0.0,
}


def format_diplotype(star: str) -> str:
    s = (star or "").strip()
    if not s or s in ["*1", "normal", "wt"]:
        return "*1/*1"
    if "/" in s:
        return s
    if s.startswith("*"):
        return f"{s}/{s}"
    if s in ["15:02", "57:01", "58:01"]:
        return f"*{s} Positive"
    return s


def calculate_phenotype(gene: str, star_or_diplotype: str) -> str:
    s = (star_or_diplotype or "").strip().lower()

    if not s or s in ["*1", "*1/*1", "normal", "nm", "wt"]:
        if gene == "SLCO1B1":
            return "Normal Transporter"
        elif gene == "HLA-B":
            return "Normal"
        return "Normal Metabolizer"

    # =====================================================
    # CYP2C19
    # =====================================================
    if gene == "CYP2C19":
        # Ultra Rapid (*17/*17 or *1/*17)
        if "*17/*17" in s or (s == "*17") or ("*17" in s and "*2" not in s and "*3" not in s):
            return "Ultra Rapid Metabolizer"
        # Poor Metabolizer (*2/*2, *2/*3, *3/*3, or single *2/*3 specified as genotype)
        if ("*2" in s and "*3" in s) or ("*2/*2" in s) or ("*3/*3" in s) or s in ["*2", "*3", "pm", "poor"]:
            return "Poor Metabolizer"
        # Intermediate Metabolizer (*1/*2, *1/*3, *2/*17)
        if ("*1" in s and ("*2" in s or "*3" in s)) or ("*17" in s and ("*2" in s or "*3" in s)) or "im" in s or "intermediate" in s:
            return "Intermediate Metabolizer"
        if "*2" in s or "*3" in s:
            return "Poor Metabolizer"
        return "Intermediate Metabolizer"

    # =====================================================
    # CYP2C9
    # =====================================================
    if gene == "CYP2C9":
        if ("*3" in s and ("*3" in s or "*2" in s)) or s in ["*3", "*3/*3", "*2/*3", "pm", "poor"]:
            return "Poor Metabolizer"
        if ("*2" in s) or ("*1/*3" in s) or s in ["*2/*2", "*1/*2", "im", "intermediate"]:
            return "Intermediate Metabolizer"
        if "*1" in s:
            return "Normal Metabolizer"
        return "Poor Metabolizer"

    # =====================================================
    # CYP2D6
    # =====================================================
    if gene == "CYP2D6":
        if "dup" in s or "xn" in s or "um" in s or "ultra" in s:
            return "Ultra Rapid Metabolizer"
        if ("*4" in s or "*5" in s or "*6" in s) and ("*1" not in s and "*2" not in s):
            return "Poor Metabolizer"
        if s in ["*4", "*5", "*6", "pm", "poor"]:
            return "Poor Metabolizer"
        if ("*10" in s or "*41" in s) or ("*1" in s and ("*4" in s or "*5" in s)):
            return "Intermediate Metabolizer"
        if "*1" in s or "*2" in s:
            return "Normal Metabolizer"
        return "Poor Metabolizer"

    # =====================================================
    # SLCO1B1
    # =====================================================
    if gene == "SLCO1B1":
        if "*5/*5" in s or s in ["*5", "*15", "poor"]:
            return "Poor Transporter"
        if "*1/*5" in s or "*1/*15" in s:
            return "Intermediate Transporter"
        if "*1" in s:
            return "Normal Transporter"
        return "Poor Transporter"

    # =====================================================
    # HLA-B
    # =====================================================
    if gene == "HLA-B":
        if any(v in s for v in ["15:02", "57:01", "58:01", "pos", "positive"]):
            return "High Risk"
        if any(v in s for v in ["neg", "negative", "normal"]):
            return "Normal"
        return "High Risk"

    # =====================================================
    # TPMT / NUDT15
    # =====================================================
    if gene in ["TPMT", "NUDT15"]:
        if any(v in s for v in ["*2", "*3", "*3a", "*3b", "*3c", "pm", "poor"]):
            return "Poor Metabolizer"
        if "*1" in s:
            return "Normal Metabolizer"
        return "Normal Metabolizer"

    return "Atypical / High Risk"


def get_diplotype(stars):
    if not stars:
        return "*1/*1"
    if isinstance(stars, str):
        return format_diplotype(stars)
    return "/".join(stars)
