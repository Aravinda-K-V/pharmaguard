from gene_mapper import get_primary_gene_for_drug, get_genes_for_drug
from phenotype_engine import calculate_phenotype, format_diplotype

# -----------------------------
# EXPECTED CYP2C19 & CPIC RELEVANCE MAPPINGS
# -----------------------------
EXPECTED_RELEVANCE = {
    "CLOPIDOGREL": "⚠️ Reduced activation may be important",
    "OMEPRAZOLE": "⚠️ Drug exposure can increase in reduced metabolizers",
    "ESOMEPRAZOLE": "⚠️ CYP2C19 metabolism affected",
    "LANSOPRAZOLE": "⚠️ CYP2C19 metabolism affected",
    "PANTOPRAZOLE": "CYP2C19 involvement, generally less prominent",
    "PAN": "CYP2C19 involvement, generally less prominent",
    "VORICONAZOLE": "⚠️ Metabolism significantly affected",
    "CITALOPRAM": "⚠️ Exposure may increase",
    "ESCITALOPRAM": "⚠️ Exposure may increase",
    "SERTRALINE": "CYP2C19 can affect metabolism",
    "DIAZEPAM": "CYP2C19 can affect metabolism",
    "WARFARIN": "⚠️ High risk of bleeding / Dose reduction required",
    "CODEINE": "⚠️ High risk of toxicity or analgesia failure",
    "TAMOXIFEN": "⚠️ Reduced activation / Lower efficacy",
    "SIMVASTATIN": "⚠️ High risk of myopathy / Rhabdomyolysis",
    "CARBAMAZEPINE": "⚠️ Contraindicated / SJS & TEN Risk",
    "ABACAVIR": "⚠️ Contraindicated / Severe Hypersensitivity",
    "ALLOPURINOL": "⚠️ Contraindicated / Severe SCAR Risk",
    "PHENYTOIN": "⚠️ Toxic / Severe Neurotoxicity",
    "AZATHIOPRINE": "⚠️ Toxic / Severe Myelosuppression",
}


def get_phenotype(gene: str, star: str):
    return calculate_phenotype(gene, star)


# -----------------------------
# SMART VARIANT SELECTION 🔥
# -----------------------------
def select_variant_for_drug(variants, drug):
    drug = drug.upper()
    target_genes = get_genes_for_drug(drug)

    for v in variants:
        gene = v.get("gene")
        if gene and gene in target_genes:
            return v

    primary_gene = get_primary_gene_for_drug(drug)
    return {"gene": primary_gene, "star": "*1", "diplotype": "*1/*1"}


# -----------------------------
# MAIN ENGINE
# -----------------------------
def analyze_variants(variants, drug):
    drug = drug.upper()

    variant = select_variant_for_drug(variants, drug)

    gene = variant.get("gene", "N/A")
    star = variant.get("star", "")
    diplotype = variant.get("diplotype") or format_diplotype(star)

    phenotype = calculate_phenotype(gene, diplotype or star)

    # =====================================================
    # ❤️ CLOPIDOGREL (CYP2C19)
    # Expected: ⚠️ Reduced activation may be important
    # =====================================================
    if drug == "CLOPIDOGREL":
        if phenotype in ["Poor Metabolizer", "Intermediate Metabolizer"]:
            return {
                "risk": "⚠️ Reduced activation may be important",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["CLOPIDOGREL"],
                "recommendation": "Reduced activation may be important: Substantially impaired active thiol metabolite formation increases risk of stent thrombosis and ischemic events. Avoid clopidogrel and use alternative antiplatelet (prasugrel or ticagrelor)."
            }
        elif phenotype == "Normal Metabolizer":
            return {
                "risk": "Safe",
                "severity": "low",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": "Normal activation and efficacy expected",
                "recommendation": "Standard clopidogrel dosing recommended."
            }
        return {
            "risk": "⚠️ Reduced activation may be important",
            "severity": "high",
            "gene": gene,
            "diplotype": diplotype,
            "phenotype": phenotype,
            "relevance": EXPECTED_RELEVANCE["CLOPIDOGREL"],
            "recommendation": "High risk precaution: Unknown CYP2C19 status. Alternative antiplatelet therapy (prasugrel or ticagrelor) recommended."
        }

    # =====================================================
    # 💊 OMEPRAZOLE (CYP2C19)
    # Expected: ⚠️ Drug exposure can increase in reduced metabolizers
    # =====================================================
    if drug == "OMEPRAZOLE":
        if phenotype in ["Poor Metabolizer", "Intermediate Metabolizer"]:
            return {
                "risk": "⚠️ Drug exposure can increase in reduced metabolizers",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["OMEPRAZOLE"],
                "recommendation": "Drug exposure can increase in reduced metabolizers (3-10 fold higher systemic AUC). High risk of drug accumulation; consider 50% dose reduction for long-term maintenance therapy."
            }
        elif phenotype == "Ultra Rapid Metabolizer":
            return {
                "risk": "⚠️ High Risk (Ineffective)",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["OMEPRAZOLE"],
                "recommendation": "Subtherapeutic acid suppression due to rapid drug clearance. Increase standard dose or switch to rabeprazole."
            }
        elif phenotype == "Normal Metabolizer":
            return {
                "risk": "Safe",
                "severity": "low",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": "Normal drug exposure and clearance",
                "recommendation": "Standard omeprazole dosing recommended."
            }
        return {
            "risk": "⚠️ Drug exposure can increase in reduced metabolizers",
            "severity": "high",
            "gene": gene,
            "diplotype": diplotype,
            "phenotype": phenotype,
            "relevance": EXPECTED_RELEVANCE["OMEPRAZOLE"],
            "recommendation": "High risk precaution: Drug exposure can increase in reduced metabolizers. Monitor clinical response and consider dose adjustment."
        }

    # =====================================================
    # 💊 ESOMEPRAZOLE (CYP2C19)
    # Expected: ⚠️ CYP2C19 metabolism affected
    # =====================================================
    if drug == "ESOMEPRAZOLE":
        if phenotype in ["Poor Metabolizer", "Intermediate Metabolizer"]:
            return {
                "risk": "⚠️ CYP2C19 metabolism affected",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["ESOMEPRAZOLE"],
                "recommendation": "CYP2C19 metabolism affected: Significant increase in plasma drug exposure in poor metabolizers. High risk of drug accumulation; consider dose reduction for long-term GERD treatment."
            }
        elif phenotype == "Ultra Rapid Metabolizer":
            return {
                "risk": "⚠️ High Risk (Ineffective)",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["ESOMEPRAZOLE"],
                "recommendation": "CYP2C19 metabolism affected: Accelerated clearance may compromise mucosal healing. Dose escalation or switch to rabeprazole advised."
            }
        elif phenotype == "Normal Metabolizer":
            return {
                "risk": "Safe",
                "severity": "low",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": "Normal drug clearance",
                "recommendation": "Standard esomeprazole dosing recommended."
            }
        return {
            "risk": "⚠️ CYP2C19 metabolism affected",
            "severity": "high",
            "gene": gene,
            "diplotype": diplotype,
            "phenotype": phenotype,
            "relevance": EXPECTED_RELEVANCE["ESOMEPRAZOLE"],
            "recommendation": "High risk precaution: CYP2C19 metabolism affected. Potential altered clearance; monitor clinical response."
        }

    # =====================================================
    # 💊 LANSOPRAZOLE (CYP2C19)
    # Expected: ⚠️ CYP2C19 metabolism affected
    # =====================================================
    if drug == "LANSOPRAZOLE":
        if phenotype in ["Poor Metabolizer", "Intermediate Metabolizer"]:
            return {
                "risk": "⚠️ CYP2C19 metabolism affected",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["LANSOPRAZOLE"],
                "recommendation": "CYP2C19 metabolism affected: Elevated drug exposure up to 4-fold. High risk of elevated exposure; reduce standard maintenance dose by 50%."
            }
        elif phenotype == "Ultra Rapid Metabolizer":
            return {
                "risk": "⚠️ High Risk (Ineffective)",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["LANSOPRAZOLE"],
                "recommendation": "CYP2C19 metabolism affected: Rapid clearance leads to lower systemic levels and inadequate acid suppression. Increase dose or switch PPI."
            }
        elif phenotype == "Normal Metabolizer":
            return {
                "risk": "Safe",
                "severity": "low",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": "Standard clearance",
                "recommendation": "Standard lansoprazole dosing recommended."
            }
        return {
            "risk": "⚠️ CYP2C19 metabolism affected",
            "severity": "high",
            "gene": gene,
            "diplotype": diplotype,
            "phenotype": phenotype,
            "relevance": EXPECTED_RELEVANCE["LANSOPRAZOLE"],
            "recommendation": "High risk precaution: CYP2C19 metabolism affected. Monitor clinical response and consider PPI dosage adjustment."
        }

    # =====================================================
    # 💊 PANTOPRAZOLE / PAN (CYP2C19)
    # Expected: CYP2C19 involvement, generally less prominent
    # =====================================================
    if drug in ["PANTOPRAZOLE", "PAN"]:
        if phenotype in ["Poor Metabolizer", "Intermediate Metabolizer"]:
            return {
                "risk": "CYP2C19 involvement, generally less prominent",
                "severity": "medium",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["PANTOPRAZOLE"],
                "recommendation": "CYP2C19 involvement, generally less prominent: Mildly elevated exposure in poor metabolizers; standard dosing is usually well tolerated, but dose reduction may be considered."
            }
        elif phenotype == "Ultra Rapid Metabolizer":
            return {
                "risk": "Ineffective Drug",
                "severity": "medium",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["PANTOPRAZOLE"],
                "recommendation": "CYP2C19 involvement, generally less prominent: Rapid clearance may decrease efficacy in severe reflux or ulcer disease. Titrate dose if needed."
            }
        elif phenotype == "Normal Metabolizer":
            return {
                "risk": "Safe",
                "severity": "low",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": "Standard clearance",
                "recommendation": "Standard pantoprazole dosing recommended."
            }
        return {
            "risk": "CYP2C19 involvement, generally less prominent",
            "severity": "medium",
            "gene": gene,
            "diplotype": diplotype,
            "phenotype": phenotype,
            "relevance": EXPECTED_RELEVANCE["PANTOPRAZOLE"],
            "recommendation": "CYP2C19 involvement, generally less prominent: Monitor clinical response."
        }

    # =====================================================
    # 🍄 VORICONAZOLE (CYP2C19)
    # Expected: ⚠️ Metabolism significantly affected
    # =====================================================
    if drug == "VORICONAZOLE":
        if phenotype in ["Poor Metabolizer", "Intermediate Metabolizer"]:
            return {
                "risk": "⚠️ Metabolism significantly affected",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["VORICONAZOLE"],
                "recommendation": "Metabolism significantly affected: Marked drug accumulation dramatically increases risk of severe neurotoxicity, visual disturbances, and hepatotoxicity. Choose alternative agent or reduce maintenance dose by 50% with frequent TDM."
            }
        elif phenotype == "Ultra Rapid Metabolizer":
            return {
                "risk": "⚠️ Metabolism significantly affected",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["VORICONAZOLE"],
                "recommendation": "Metabolism significantly affected: Rapid clearance leads to subtherapeutic trough concentrations and high probability of therapeutic failure. Avoid voriconazole; choose alternative antifungal (isavuconazole, liposomal amphotericin B)."
            }
        elif phenotype == "Normal Metabolizer":
            return {
                "risk": "Safe",
                "severity": "low",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": "Standard antifungal dosing",
                "recommendation": "Standard voriconazole dosing with routine therapeutic drug monitoring."
            }
        return {
            "risk": "⚠️ Metabolism significantly affected",
            "severity": "high",
            "gene": gene,
            "diplotype": diplotype,
            "phenotype": phenotype,
            "relevance": EXPECTED_RELEVANCE["VORICONAZOLE"],
            "recommendation": "High risk precaution: Significant CYP2C19 dependence. Strict TDM or alternative antifungal recommended."
        }

    # =====================================================
    # 🧠 CITALOPRAM (CYP2C19)
    # Expected: ⚠️ Exposure may increase
    # =====================================================
    if drug == "CITALOPRAM":
        if phenotype in ["Poor Metabolizer", "Intermediate Metabolizer"]:
            return {
                "risk": "⚠️ Exposure may increase",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["CITALOPRAM"],
                "recommendation": "Exposure may increase significantly in poor metabolizers, elevating risk of concentration-dependent QT prolongation and torsades de pointes. Limit daily dose to maximum 20 mg/day or switch to an alternative SSRI."
            }
        elif phenotype == "Ultra Rapid Metabolizer":
            return {
                "risk": "⚠️ High Risk (Ineffective)",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["CITALOPRAM"],
                "recommendation": "Subtherapeutic plasma levels likely. Consider alternative antidepressant not predominantly metabolized by CYP2C19."
            }
        elif phenotype == "Normal Metabolizer":
            return {
                "risk": "Safe",
                "severity": "low",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": "Standard SSRI metabolism",
                "recommendation": "Standard citalopram dosing recommended."
            }
        return {
            "risk": "⚠️ Exposure may increase",
            "severity": "high",
            "gene": gene,
            "diplotype": diplotype,
            "phenotype": phenotype,
            "relevance": EXPECTED_RELEVANCE["CITALOPRAM"],
            "recommendation": "High risk precaution: Exposure may increase. Monitor QT interval and limit dose."
        }

    # =====================================================
    # 🧠 ESCITALOPRAM (CYP2C19)
    # Expected: ⚠️ Exposure may increase
    # =====================================================
    if drug == "ESCITALOPRAM":
        if phenotype in ["Poor Metabolizer", "Intermediate Metabolizer"]:
            return {
                "risk": "⚠️ Exposure may increase",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["ESCITALOPRAM"],
                "recommendation": "Exposure may increase substantially, elevating risk of QT prolongation and adverse events. Reduce maximum daily dose to 10 mg/day or consider alternative SSRI."
            }
        elif phenotype == "Ultra Rapid Metabolizer":
            return {
                "risk": "⚠️ High Risk (Ineffective)",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["ESCITALOPRAM"],
                "recommendation": "Rapid clearance may lead to treatment failure. Consider alternative antidepressant not heavily dependent on CYP2C19."
            }
        elif phenotype == "Normal Metabolizer":
            return {
                "risk": "Safe",
                "severity": "low",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": "Standard clearance",
                "recommendation": "Standard escitalopram dosing recommended."
            }
        return {
            "risk": "⚠️ Exposure may increase",
            "severity": "high",
            "gene": gene,
            "diplotype": diplotype,
            "phenotype": phenotype,
            "relevance": EXPECTED_RELEVANCE["ESCITALOPRAM"],
            "recommendation": "High risk precaution: Exposure may increase. Limit maximum dose to 10 mg/day or switch agent."
        }

    # =====================================================
    # 🧠 SERTRALINE (CYP2C19)
    # Expected: CYP2C19 can affect metabolism
    # =====================================================
    if drug == "SERTRALINE":
        if phenotype in ["Poor Metabolizer", "Intermediate Metabolizer"]:
            return {
                "risk": "CYP2C19 can affect metabolism",
                "severity": "medium",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["SERTRALINE"],
                "recommendation": "CYP2C19 can affect metabolism: Reduced clearance increases plasma concentrations and side-effect vulnerability. Consider 50% dose reduction or titrate slowly based on tolerability."
            }
        elif phenotype == "Ultra Rapid Metabolizer":
            return {
                "risk": "Ineffective Drug",
                "severity": "medium",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["SERTRALINE"],
                "recommendation": "CYP2C19 can affect metabolism: Rapid clearance may decrease efficacy. Titrate to higher dose if clinical response is inadequate."
            }
        elif phenotype == "Normal Metabolizer":
            return {
                "risk": "Safe",
                "severity": "low",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": "Standard clearance",
                "recommendation": "Standard sertraline dosing recommended."
            }
        return {
            "risk": "CYP2C19 can affect metabolism",
            "severity": "medium",
            "gene": gene,
            "diplotype": diplotype,
            "phenotype": phenotype,
            "relevance": EXPECTED_RELEVANCE["SERTRALINE"],
            "recommendation": "CYP2C19 can affect metabolism: Monitor clinical response and tolerability."
        }

    # =====================================================
    # 😴 DIAZEPAM (CYP2C19)
    # Expected: CYP2C19 can affect metabolism
    # =====================================================
    if drug == "DIAZEPAM":
        if phenotype in ["Poor Metabolizer", "Intermediate Metabolizer"]:
            return {
                "risk": "CYP2C19 can affect metabolism",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["DIAZEPAM"],
                "recommendation": "CYP2C19 can affect metabolism: Markedly prolonged elimination half-life and impaired clearance increase risk of excessive daytime sedation, cognitive impairment, and respiratory depression. Reduce dose or use a non-CYP2C19 benzodiazepine (lorazepam, oxazepam)."
            }
        elif phenotype == "Normal Metabolizer":
            return {
                "risk": "Safe",
                "severity": "low",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": "Standard clearance",
                "recommendation": "Standard diazepam dosing recommended."
            }
        return {
            "risk": "CYP2C19 can affect metabolism",
            "severity": "high",
            "gene": gene,
            "diplotype": diplotype,
            "phenotype": phenotype,
            "relevance": EXPECTED_RELEVANCE["DIAZEPAM"],
            "recommendation": "High risk precaution: CYP2C19 can affect metabolism. Prolonged sedation risk; consider alternative non-CYP2C19 benzodiazepine."
        }

    # =====================================================
    # 🩸 WARFARIN (CYP2C9 / VKORC1)
    # =====================================================
    if drug == "WARFARIN":
        if phenotype in ["Poor Metabolizer", "Intermediate Metabolizer"]:
            return {
                "risk": "⚠️ High Risk of Bleeding / Dose Reduction Required",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["WARFARIN"],
                "recommendation": "High risk of bleeding: Reduce dose by 50-70% and monitor INR frequently."
            }
        elif phenotype == "Normal Metabolizer":
            return {
                "risk": "Safe",
                "severity": "low",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": "Standard sensitivity",
                "recommendation": "Standard dosing recommended."
            }
        return {
            "risk": "⚠️ High Risk Precaution",
            "severity": "high",
            "gene": gene,
            "diplotype": diplotype,
            "phenotype": phenotype,
            "relevance": EXPECTED_RELEVANCE["WARFARIN"],
            "recommendation": "High risk precaution: Unknown genotype sensitivity. Start with conservative dosing and monitor INR."
        }

    # =====================================================
    # 😴 CODEINE (CYP2D6)
    # =====================================================
    if drug == "CODEINE":
        if phenotype == "Ultra Rapid Metabolizer":
            return {
                "risk": "⚠️ Toxic (High Risk)",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["CODEINE"],
                "recommendation": "High risk of life-threatening respiratory depression due to rapid morphine formation. Avoid codeine."
            }
        elif phenotype == "Poor Metabolizer":
            return {
                "risk": "⚠️ Ineffective Drug (High Risk)",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["CODEINE"],
                "recommendation": "High risk of analgesia failure: Inadequate conversion to active morphine. Use alternative non-opioid or non-CYP2D6 analgesic."
            }
        elif phenotype == "Normal Metabolizer":
            return {
                "risk": "Safe",
                "severity": "low",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": "Standard analgesic conversion",
                "recommendation": "Standard dosing recommended."
            }
        return {
            "risk": "⚠️ High Risk Precaution",
            "severity": "high",
            "gene": gene,
            "diplotype": diplotype,
            "phenotype": phenotype,
            "relevance": EXPECTED_RELEVANCE["CODEINE"],
            "recommendation": "High risk precaution: Avoid codeine and consider alternative analgesia."
        }

    # =====================================================
    # 🧠 CARBAMAZEPINE (HLA-B)
    # =====================================================
    if drug == "CARBAMAZEPINE":
        if phenotype == "High Risk" or "15:02" in star:
            return {
                "risk": "⚠️ Contraindicated (High Risk)",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["CARBAMAZEPINE"],
                "recommendation": "DO NOT USE: Extremely high risk of Stevens-Johnson syndrome (SJS) and toxic epidermal necrolysis (TEN)."
            }
        elif phenotype == "Normal":
            return {
                "risk": "Safe",
                "severity": "low",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": "Standard risk profile",
                "recommendation": "Standard dosing recommended."
            }
        return {
            "risk": "⚠️ Contraindicated (High Risk)",
            "severity": "high",
            "gene": gene,
            "diplotype": diplotype,
            "phenotype": phenotype,
            "relevance": EXPECTED_RELEVANCE["CARBAMAZEPINE"],
            "recommendation": "High risk precaution: Do not initiate without genetic verification."
        }

    # =====================================================
    # 💪 SIMVASTATIN (SLCO1B1)
    # =====================================================
    if drug == "SIMVASTATIN":
        if phenotype == "Poor Transporter" or "*5" in star:
            return {
                "risk": "⚠️ High Risk of Myopathy",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["SIMVASTATIN"],
                "recommendation": "High risk of statin-induced myopathy and rhabdomyolysis: Lower dose or switch to pravastatin/rosuvastatin."
            }
        elif phenotype == "Normal Transporter":
            return {
                "risk": "Safe",
                "severity": "low",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": "Standard transporter activity",
                "recommendation": "Standard simvastatin dosing recommended."
            }
        return {
            "risk": "⚠️ High Risk of Myopathy",
            "severity": "high",
            "gene": gene,
            "diplotype": diplotype,
            "phenotype": phenotype,
            "relevance": EXPECTED_RELEVANCE["SIMVASTATIN"],
            "recommendation": "High risk precaution: Consider lower dose or alternate statin."
        }

    # =====================================================
    # 🛡️ ABACAVIR (HLA-B)
    # =====================================================
    if drug == "ABACAVIR":
        if phenotype == "Normal" and "neg" in star:
            return {
                "risk": "Safe",
                "severity": "low",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": "HLA-B*57:01 negative",
                "recommendation": "HLA-B*57:01 negative: Standard dosing recommended."
            }
        return {
            "risk": "⚠️ Contraindicated (High Risk)",
            "severity": "high",
            "gene": gene,
            "diplotype": diplotype,
            "phenotype": "High Risk",
            "relevance": EXPECTED_RELEVANCE["ABACAVIR"],
            "recommendation": "DO NOT USE: High risk of severe, potentially fatal abacavir hypersensitivity reaction."
        }

    # =====================================================
    # 💎 ALLOPURINOL (HLA-B)
    # =====================================================
    if drug == "ALLOPURINOL":
        if phenotype == "Normal" and "neg" in star:
            return {
                "risk": "Safe",
                "severity": "low",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": "HLA-B*58:01 negative",
                "recommendation": "Standard allopurinol dosing recommended."
            }
        return {
            "risk": "⚠️ Contraindicated (High Risk)",
            "severity": "high",
            "gene": gene,
            "diplotype": diplotype,
            "phenotype": "High Risk",
            "relevance": EXPECTED_RELEVANCE["ALLOPURINOL"],
            "recommendation": "High risk of severe cutaneous adverse reactions (SCAR). Alternative urate-lowering therapy strongly recommended."
        }

    # =====================================================
    # 🎀 TAMOXIFEN (CYP2D6)
    # =====================================================
    if drug == "TAMOXIFEN":
        if phenotype in ["Poor Metabolizer", "Intermediate Metabolizer"]:
            return {
                "risk": "⚠️ Reduced Activation / Lower Efficacy (High Risk)",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["TAMOXIFEN"],
                "recommendation": "High risk of breast cancer recurrence due to subtherapeutic endoxifen levels. Consider aromatase inhibitor."
            }
        elif phenotype == "Normal Metabolizer":
            return {
                "risk": "Safe",
                "severity": "low",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": "Normal active metabolite generation",
                "recommendation": "Standard tamoxifen dosing recommended."
            }
        return {
            "risk": "⚠️ Reduced Activation (High Risk)",
            "severity": "high",
            "gene": gene,
            "diplotype": diplotype,
            "phenotype": phenotype,
            "relevance": EXPECTED_RELEVANCE["TAMOXIFEN"],
            "recommendation": "High risk precaution: Reduced efficacy expected. Oncology specialist review required."
        }

    # =====================================================
    # ⚡ PHENYTOIN (CYP2C9 / HLA-B)
    # =====================================================
    if drug == "PHENYTOIN":
        if phenotype in ["Poor Metabolizer", "Intermediate Metabolizer", "High Risk"]:
            return {
                "risk": "⚠️ Toxic / Severe Neurotoxicity (High Risk)",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["PHENYTOIN"],
                "recommendation": "High risk of severe phenytoin toxicity and neurological impairment. Substantially reduce dose or use alternative."
            }
        elif phenotype == "Normal Metabolizer":
            return {
                "risk": "Safe",
                "severity": "low",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": "Standard therapeutic clearance",
                "recommendation": "Standard phenytoin dosing recommended with therapeutic drug monitoring."
            }
        return {
            "risk": "⚠️ Toxic / High Risk Precaution",
            "severity": "high",
            "gene": gene,
            "diplotype": diplotype,
            "phenotype": phenotype,
            "relevance": EXPECTED_RELEVANCE["PHENYTOIN"],
            "recommendation": "High risk precaution: Dose reduction and therapeutic drug monitoring required."
        }

    # =====================================================
    # 🩸 AZATHIOPRINE (TPMT / NUDT15)
    # =====================================================
    if drug == "AZATHIOPRINE":
        if phenotype in ["Poor Metabolizer", "Intermediate Metabolizer"]:
            return {
                "risk": "⚠️ Toxic / Severe Myelosuppression (High Risk)",
                "severity": "high",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": EXPECTED_RELEVANCE["AZATHIOPRINE"],
                "recommendation": "High risk of severe myelosuppression and pancytopenia. Reduce dose by 80-90% or switch to alternative."
            }
        elif phenotype == "Normal Metabolizer":
            return {
                "risk": "Safe",
                "severity": "low",
                "gene": gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "relevance": "Standard thiopurine metabolism",
                "recommendation": "Standard azathioprine dosing recommended."
            }
        return {
            "risk": "⚠️ Toxic / High Risk Precaution",
            "severity": "high",
            "gene": gene,
            "diplotype": diplotype,
            "phenotype": phenotype,
            "relevance": EXPECTED_RELEVANCE["AZATHIOPRINE"],
            "recommendation": "High risk precaution: Extreme caution advised. Start with reduced dose."
        }

    # =====================================================
    # 🔥 DEFAULT: REPLACE ANY UNKNOWN WITH HIGH RISK
    # =====================================================
    default_relevance = EXPECTED_RELEVANCE.get(drug, "⚠️ High Risk - Genetic Interaction Precaution")
    return {
        "risk": "High Risk",
        "severity": "high",
        "gene": gene if gene != "N/A" else get_primary_gene_for_drug(drug),
        "diplotype": diplotype if diplotype != "*1/*1" else "Indeterminate",
        "phenotype": phenotype if phenotype != "Unknown" else "Atypical / High Risk",
        "relevance": default_relevance,
        "recommendation": f"High risk precaution ({default_relevance}): Uncharacterized gene-drug interaction profile. Specialist pharmacogenomic review and close monitoring strongly advised before administration."
    }
