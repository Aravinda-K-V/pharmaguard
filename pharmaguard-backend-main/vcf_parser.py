import re

TARGET_GENES = ["CYP2D6", "CYP2C19", "CYP2C9", "SLCO1B1", "TPMT", "DPYD", "HLA-B", "VKORC1", "NUDT15"]

RSID_GENE_MAP = {
    "rs1057910": ("CYP2C9", "*3"),
    "rs1799853": ("CYP2C9", "*2"),
    "rs4244285": ("CYP2C19", "*2"),
    "rs4986893": ("CYP2C19", "*3"),
    "rs12248560": ("CYP2C19", "*17"),
    "rs3892097": ("CYP2D6", "*4"),
    "rs1065852": ("CYP2D6", "*10"),
    "rs4149056": ("SLCO1B1", "*5"),
    "rs9923231": ("VKORC1", "-1639G>A"),
    "rs2395029": ("HLA-B", "57:01"),
    "rs3903564": ("HLA-B", "15:02"),
    "rs1160312": ("TPMT", "*3C"),
    "rs1800462": ("TPMT", "*2"),
    "rs1800460": ("TPMT", "*3B"),
}


def parse_vcf(lines):
    variants = []

    for line in lines:
        if line.startswith("#") or not line.strip():
            continue

        cols = line.split("\t")
        if len(cols) < 8:
            cols = [c.strip() for c in re.split(r"\s+", line.strip())]
            if len(cols) < 8:
                continue

        rsid = cols[2].strip()
        info = cols[7]

        gene = None
        star = None

        for item in info.split(";"):
            if item.startswith("GENE="):
                gene = item.split("=")[1].strip()
            elif item.startswith("STAR=") or item.startswith("ALLELE="):
                star = item.split("=")[1].strip()

        # Check RSID mapping if gene is not in INFO
        if not gene and rsid in RSID_GENE_MAP:
            mapped_gene, mapped_star = RSID_GENE_MAP[rsid]
            gene = mapped_gene
            if not star:
                star = mapped_star
        elif gene and not star and rsid in RSID_GENE_MAP:
            star = RSID_GENE_MAP[rsid][1]

        # Extract genotype if sample column exists
        diplotype = star
        if len(cols) >= 10 and star:
            sample_col = cols[9]
            gt = sample_col.split(":")[0].replace("|", "/")
            if gt == "1/1":
                diplotype = f"{star}/{star}" if "/" not in star else star
            elif gt in ["0/1", "1/0"]:
                diplotype = f"*1/{star}" if "/" not in star else star

        if gene:
            gene = gene.upper()
            variants.append({
                "gene": gene,
                "rsid": rsid,
                "star": star if star else "*1",
                "diplotype": diplotype if diplotype else "*1/*1"
            })

    return variants
