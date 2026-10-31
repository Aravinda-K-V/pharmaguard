def get_genes_for_drug(drug: str):
    drug = drug.upper()

    DRUG_GENE_MAP = {
        # Core & Cardiovascular
        "WARFARIN": ["CYP2C9", "VKORC1"],
        "CLOPIDOGREL": ["CYP2C19"],
        "SIMVASTATIN": ["SLCO1B1"],
        "PHENYTOIN": ["CYP2C9", "HLA-B"],
        "NORVASC": ["CYP3A4"],
        "AMLODIPINE": ["CYP3A4"],

        # CYP2C19 PPIs & Acid Reducers
        "OMEPRAZOLE": ["CYP2C19"],
        "ESOMEPRAZOLE": ["CYP2C19"],
        "LANSOPRAZOLE": ["CYP2C19"],
        "PANTOPRAZOLE": ["CYP2C19"],
        "PAN": ["CYP2C19"],

        # CYP2C19 Antifungal
        "VORICONAZOLE": ["CYP2C19"],

        # CYP2C19 SSRIs & Psychotropics
        "CITALOPRAM": ["CYP2C19"],
        "ESCITALOPRAM": ["CYP2C19"],
        "SERTRALINE": ["CYP2C19"],
        "DIAZEPAM": ["CYP2C19"],

        # Oncology & Analgesics
        "CODEINE": ["CYP2D6"],
        "TAMOXIFEN": ["CYP2D6"],

        # Immunologic & Antirheumatic
        "ABACAVIR": ["HLA-B"],
        "CARBAMAZEPINE": ["HLA-B"],
        "ALLOPURINOL": ["HLA-B"],
        "AZATHIOPRINE": ["TPMT", "NUDT15"],

        # Common OTC & Antibiotics
        "DOLO": ["CYP2E1"],
        "CROCIN": ["CYP2E1"],
        "PARACETAMOL": ["CYP2E1"],
        "IBUPROFEN": ["CYP2C9"],
        "AZEE": ["CYP3A4"],
        "AZITHROMYCIN": ["CYP3A4"],
        "CIPRO": ["CYP1A2"],
        "CIPROFLOXACIN": ["CYP1A2"],
        "METFORMIN": ["OCT1"],
    }

    return DRUG_GENE_MAP.get(drug, [])


def get_primary_gene_for_drug(drug: str) -> str:
    genes = get_genes_for_drug(drug)
    return genes[0] if genes else "CYP2C19"
