const getBackendUrl = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("pharmaguard_backend_url");
    if (saved && saved.trim()) return saved.trim();
    if (window.location.hostname && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return `http://${window.location.hostname}:8000`;
    }
  }
  return import.meta.env?.VITE_BACKEND_URL || "http://10.247.207.218:8000";
};

export const analyzePatient = async (file, drug) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("drug", drug);

  const backendUrl = getBackendUrl();
  const res = await fetch(`${backendUrl}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Backend error");
  }

  return res.json();
};


// -----------------------------
// TRANSFORM FUNCTION
// -----------------------------
const mapSingleResult = (data) => {
  let riskLabel = data?.risk_assessment?.risk_label || "High Risk";
  if (riskLabel.toLowerCase() === "unknown") {
    riskLabel = "High Risk";
  }

  let riskLevel = data?.risk_assessment?.severity || "high";
  if (riskLevel.toLowerCase() === "unknown" || riskLabel.toLowerCase().includes("high")) {
    riskLevel = "high";
  }

  return {
    riskLabel,
    riskLevel,
    confidence: Math.round((data?.risk_assessment?.confidence_score || 0) * 100),

    geneDetected: data?.pharmacogenomic_profile?.primary_gene || "N/A",
    diplotype: data?.pharmacogenomic_profile?.diplotype || "*1/*1",
    phenotype:
      data?.pharmacogenomic_profile?.phenotype && data?.pharmacogenomic_profile?.phenotype !== "Unknown"
        ? data?.pharmacogenomic_profile?.phenotype
        : "Atypical / High Risk",

    variants: data?.pharmacogenomic_profile?.detected_variants || data?.pharmacogenomic_profile?.variants || [],

    recommendation: data?.clinical_recommendation?.action || "High risk precaution: Gene-drug interaction uncertain. Clinical review advised.",

    aiExplanation: {
      summary: data?.llm_generated_explanation?.summary || "",
      mechanism: data?.llm_generated_explanation?.mechanism || "",
      impact: data?.llm_generated_explanation?.clinical_impact || "",
      confidenceNote: data?.llm_generated_explanation?.confidence_explanation || "",
    },

    raw: data,
  };
};


// -----------------------------
// MAIN TRANSFORM
// -----------------------------
export const transformResponse = (data) => {

  // 🔥 MULTI-DRUG SUPPORT
  if (data?.multi_drug_analysis && Array.isArray(data.results)) {
    return {
      multi: true,
      results: data.results.map(mapSingleResult),
    };
  }

  // 🔥 SINGLE DRUG
  return {
    multi: false,
    results: [mapSingleResult(data)],
  };
};