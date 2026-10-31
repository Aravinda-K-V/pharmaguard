export interface AnalysisResult {
  drug?: string;
  clinicalRelevance?: string;
  riskLevel: "low" | "medium" | "high";
  riskLabel: string;
  confidence: number;
  geneDetected: string;
  diplotype: string;
  phenotype: string;
  variants: string[];
  metabolismStatus: string;
  recommendation: string;
  cpicGuideline: string;
  aiExplanation: string;
  aiSummary?: string;
  aiMechanism?: string;
  aiClinicalImpact?: string;
  aiRecommendation?: string;
  jsonOutput: Record<string, unknown>;
}

export const mockResults: Record<string, AnalysisResult> = {
  warfarin: {
    riskLevel: "high",
    riskLabel: "Toxic / Dose Reduction Required",
    confidence: 96,
    geneDetected: "CYP2C9",
    diplotype: "*2/*3",
    phenotype: "Poor Metabolizer (PM)",
    variants: ["rs1799853", "rs1057910"],
    metabolismStatus: "Poor Metabolizer",
    recommendation: "Reduce warfarin dose by 50-60%. Consider alternative anticoagulant. Monitor INR closely during initiation.",
    cpicGuideline: "CPIC Guideline for Pharmacogenetics-Guided Warfarin Dosing (2017 Update)",
    aiExplanation: "The patient carries CYP2C9 *2/*3 variants, indicating significantly reduced enzyme activity. Warfarin is primarily metabolized by CYP2C9, and poor metabolizers are at elevated risk for bleeding events due to drug accumulation. The *2 allele (rs1799853) reduces enzyme activity by ~30%, while the *3 allele (rs1057910) reduces it by ~80%. Combined, this results in substantially impaired warfarin clearance.",
    aiSummary: "The patient carries CYP2C9 *2/*3 variants indicating poor warfarin metabolism.",
    aiMechanism: "CYP2C9 variants reduce enzymatic clearance of warfarin leading to drug accumulation.",
    aiClinicalImpact: "Increased bleeding risk due to higher warfarin exposure.",
    aiRecommendation: "Reduce dose and monitor INR closely.",
    jsonOutput: {
      drug: "Warfarin",
      gene: "CYP2C9",
      diplotype: "*2/*3",
      phenotype: "Poor Metabolizer",
      risk: "high",
      variants: ["rs1799853", "rs1057910"],
      recommendation: "Reduce dose 50-60%, monitor INR",
      cpic_level: "A",
    },
  },
  clopidogrel: {
    riskLevel: "medium",
    riskLabel: "Adjust Dosage",
    confidence: 88,
    geneDetected: "CYP2C19",
    diplotype: "*1/*2",
    phenotype: "Intermediate Metabolizer (IM)",
    variants: ["rs4244285"],
    metabolismStatus: "Intermediate Metabolizer",
    recommendation: "Consider alternative antiplatelet therapy (e.g., prasugrel or ticagrelor). Standard dosing may result in reduced efficacy.",
    cpicGuideline: "CPIC Guideline for CYP2C19 and Clopidogrel Therapy (2013)",
    aiExplanation: "CYP2C19 *1/*2 genotype suggests intermediate metabolism. Clopidogrel is a prodrug requiring CYP2C19 activation. The *2 allele (rs4244285) is a loss-of-function variant that reduces the conversion of clopidogrel to its active metabolite. This may lead to inadequate platelet inhibition and increased cardiovascular risk.",
    aiSummary: "Intermediate CYP2C19 metabolism may reduce clopidogrel activation.",
    aiMechanism: "Loss-of-function *2 allele reduces prodrug activation to the active metabolite.",
    aiClinicalImpact: "Potential reduced efficacy and increased thrombotic risk.",
    aiRecommendation: "Consider prasugrel or ticagrelor as alternatives.",
    jsonOutput: {
      drug: "Clopidogrel",
      gene: "CYP2C19",
      diplotype: "*1/*2",
      phenotype: "Intermediate Metabolizer",
      risk: "medium",
      variants: ["rs4244285"],
      recommendation: "Consider prasugrel or ticagrelor",
      cpic_level: "A",
    },
  },
  codeine: {
    riskLevel: "high",
    riskLabel: "Toxic / Ineffective",
    confidence: 94,
    geneDetected: "CYP2D6",
    diplotype: "*1/*1xN",
    phenotype: "Ultra-Rapid Metabolizer (UM)",
    variants: ["CYP2D6 gene duplication"],
    metabolismStatus: "Ultra-Rapid Metabolizer",
    recommendation: "Avoid codeine. Ultra-rapid metabolism converts codeine to morphine at dangerously high rates. Use alternative analgesic (e.g., acetaminophen, NSAIDs).",
    cpicGuideline: "CPIC Guideline for CYP2D6 and Codeine Therapy (2014 Update)",
    aiExplanation: "CYP2D6 ultra-rapid metabolizer status (gene duplication *1/*1xN) leads to rapid conversion of codeine to morphine via O-demethylation, increasing risk of respiratory depression, CNS toxicity, and potential fatality — especially dangerous in pediatric and postoperative patients. The gene duplication results in more than two functional copies of CYP2D6.",
    aiSummary: "Ultra-rapid CYP2D6 metabolism converts codeine to morphine rapidly, risking toxicity.",
    aiMechanism: "Gene duplication increases enzyme copies, accelerating O-demethylation of codeine.",
    aiClinicalImpact: "High morphine levels may cause respiratory depression and CNS toxicity.",
    aiRecommendation: "Avoid codeine; use alternative analgesics.",
    jsonOutput: {
      drug: "Codeine",
      gene: "CYP2D6",
      diplotype: "*1/*1xN",
      phenotype: "Ultra-Rapid Metabolizer",
      risk: "high",
      variants: ["CYP2D6 gene duplication"],
      recommendation: "Avoid codeine, use alternative analgesic",
      cpic_level: "A",
    },
  },
};
