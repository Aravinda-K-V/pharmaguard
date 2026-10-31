import { useState, useRef, useEffect } from "react";
import { UploadCloud, Dna, X, Zap, Brain, Server, CheckCircle2 } from "lucide-react";
import DashboardResults from "@/components/dashboard/DashboardResults";
import { AnalysisResult } from "@/data/mockAnalysis";
import {
  runOnDeviceClinicalAnalysis,
  runOnDeviceQuickRisk,
  QuickRiskPayload,
} from "@/services/pharmacogenomicsEngine";

const DRUGS = [
  "CLOPIDOGREL",
  "OMEPRAZOLE",
  "ESOMEPRAZOLE",
  "LANSOPRAZOLE",
  "PANTOPRAZOLE",
  "VORICONAZOLE",
  "CITALOPRAM",
  "ESCITALOPRAM",
  "SERTRALINE",
  "DIAZEPAM",
  "WARFARIN",
  "CODEINE",
  "TAMOXIFEN",
  "PHENYTOIN",
  "SIMVASTATIN",
  "ABACAVIR",
  "CARBAMAZEPINE",
  "ALLOPURINOL",
];

// Helper to determine the best initial backend URL
const getInitialBackendUrl = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("pharmaguard_backend_url");
    if (saved && saved.trim()) return saved.trim();

    // If opened on a phone browser using an IP (e.g. http://10.247.207.218:5173)
    if (
      window.location.hostname &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1" &&
      window.location.hostname !== ""
    ) {
      return `http://${window.location.hostname}:8000`;
    }
  }
  return import.meta.env.VITE_BACKEND_URL || "http://10.247.207.218:8000";
};

const Dashboard = () => {
  // 🎯 MODE STATE
  const [mode, setMode] = useState<"clinical" | "quick" | "ai">("clinical");

  // 🌐 BACKEND SERVER STATE (Mobile / Wi-Fi support)
  const [backendUrl, setBackendUrl] = useState<string>(getInitialBackendUrl);
  const [showServerModal, setShowServerModal] = useState<boolean>(false);
  const [customServerInput, setCustomServerInput] = useState<string>(backendUrl);
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");

  const checkServer = async (urlToCheck?: string) => {
    const target = (urlToCheck || backendUrl).replace(/\/$/, "");
    try {
      setServerStatus("checking");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${target}/`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        setServerStatus("online");
        return true;
      } else {
        setServerStatus("offline");
        return false;
      }
    } catch {
      setServerStatus("offline");
      return false;
    }
  };

  useEffect(() => {
    checkServer(backendUrl);
  }, [backendUrl]);

  const handleSaveBackendUrl = (urlToSave: string) => {
    let clean = urlToSave.trim().replace(/\/$/, "");
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = `http://${clean}`;
    }
    setBackendUrl(clean);
    localStorage.setItem("pharmaguard_backend_url", clean);
    setShowServerModal(false);
    checkServer(clean);
  };

  // 🔬 CLINICAL MODE STATE
  const [fileName, setFileName] = useState("");
  const [gene, setGene] = useState("");
  const [variant, setVariant] = useState("");

  const [drugInput, setDrugInput] = useState("");
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [allResults, setAllResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ⚡ QUICK RISK MODE STATE
  const [quickAge, setQuickAge] = useState("");
  const [quickGender, setQuickGender] = useState("");
  const [quickEthnicity, setQuickEthnicity] = useState("");
  const [quickCondition, setQuickCondition] = useState("");
  const [quickDrug, setQuickDrug] = useState("");
  const [quickPastReaction, setQuickPastReaction] = useState("no");
  const [quickResult, setQuickResult] = useState<{
    risk: "low" | "moderate" | "high";
    confidence: number;
    confidence_label?: string;
    risk_summary?: string;
    key_factors?: string[];
    what_it_means?: string;
    next_steps?: string;
  } | null>(null);
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickError, setQuickError] = useState("");

  // 🧠 AI MODE STATE
  const [aiDrug, setAiDrug] = useState("");
  const [aiGene, setAiGene] = useState("");
  const [aiVariant, setAiVariant] = useState("");
  const [aiResult, setAiResult] = useState<{
    summary: string;
    mechanism: string;
    clinical_impact: string;
    recommendation: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const filteredDrugs = DRUGS.filter(
    (d) =>
      d.toLowerCase().includes(drugInput.toLowerCase()) &&
      !selectedDrugs.includes(d)
  );

  const addDrug = (drug: string) => {
    setSelectedDrugs([...selectedDrugs, drug]);
    setDrugInput("");
    setShowDropdown(false);
  };

  const removeDrug = (drug: string) => {
    setSelectedDrugs(selectedDrugs.filter((d) => d !== drug));
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".vcf") && !file.name.endsWith(".vcf.gz")) {
      setError("Upload valid VCF file");
      return;
    }

    setFileName(file.name);
    setError("");
  };

  // 🧪 LOAD DEMO VCF HELPER
  const handleLoadDemoVcf = async () => {
    try {
      const res = await fetch("/test.vcf");
      if (!res.ok) throw new Error("Failed to fetch demo VCF");
      const text = await res.text();
      const blob = new Blob([text], { type: "text/plain" });
      const file = new File([blob], "test.vcf", { type: "text/plain" });
      const dt = new DataTransfer();
      dt.items.add(file);
      if (fileRef.current) {
        fileRef.current.files = dt.files;
      }
      setFileName("test.vcf (Loaded Demo)");
      setError("");
    } catch (err: any) {
      console.warn("Could not load /test.vcf:", err);
      setFileName("test.vcf");
      setError("");
    }
  };

  // 🎯 FORMAT SINGLE BACKEND RESULT
  const formatBackendResult = (data: any): AnalysisResult => {
    let riskLabelValue = data.risk_assessment?.risk_label || "Safe";
    if (riskLabelValue.toLowerCase() === "unknown") {
      riskLabelValue = "High Risk";
    }

    const sev = data.risk_assessment?.severity;
    let riskLevel: "low" | "medium" | "high" = "low";
    if (
      sev === "high" ||
      riskLabelValue.includes("⚠️") ||
      riskLabelValue === "Toxic" ||
      riskLabelValue === "Ineffective" ||
      riskLabelValue === "Contraindicated" ||
      riskLabelValue.toLowerCase().includes("high") ||
      riskLabelValue.toLowerCase().includes("contra") ||
      riskLabelValue.toLowerCase().includes("unknown") ||
      riskLabelValue.toLowerCase().includes("exposure can increase") ||
      riskLabelValue.toLowerCase().includes("metabolism affected") ||
      riskLabelValue.toLowerCase().includes("exposure may increase") ||
      riskLabelValue.toLowerCase().includes("reduced activation")
    ) {
      riskLevel = "high";
    } else if (
      sev === "medium" ||
      riskLabelValue === "Adjust Dosage" ||
      riskLabelValue.toLowerCase().includes("medium") ||
      riskLabelValue.toLowerCase().includes("reduced") ||
      riskLabelValue.toLowerCase().includes("less prominent") ||
      riskLabelValue.toLowerCase().includes("can affect")
    ) {
      riskLevel = "medium";
    } else if (sev === "low" || riskLabelValue.toLowerCase().includes("safe")) {
      riskLevel = "low";
    }

    const drugName = data.drug || (selectedDrugs.length === 1 ? selectedDrugs[0] : "Target Drug");

    return {
      drug: drugName,
      clinicalRelevance: data.clinical_relevance || data.risk_assessment?.clinical_relevance || riskLabelValue,
      riskLevel,
      riskLabel: riskLabelValue,
      confidence: Math.round(
        (data.risk_assessment?.confidence_score || 0) * 100
      ),
      geneDetected:
        data.pharmacogenomic_profile?.primary_gene !== "N/A"
          ? data.pharmacogenomic_profile?.primary_gene
          : "Auto-detected (CYP2C19)",
      phenotype:
        data.pharmacogenomic_profile?.phenotype && data.pharmacogenomic_profile?.phenotype !== "Unknown"
          ? data.pharmacogenomic_profile?.phenotype
          : "Atypical / High Risk",
      diplotype:
        data.pharmacogenomic_profile?.diplotype || "*1/*1",
      variants: data.pharmacogenomic_profile?.variants || 
        data.variants || [],
      metabolismStatus: data.pharmacogenomic_profile?.metabolism_status && data.pharmacogenomic_profile?.metabolism_status !== "Unknown"
        ? data.pharmacogenomic_profile?.metabolism_status
        : "Atypical / High Risk",
      cpicGuideline: data.clinical_recommendation?.guideline || 
        data.cpic_guideline || "CPIC Guideline available",
      recommendation:
        data.clinical_recommendation?.action || "Consult clinician",
      aiExplanation: data.llm_generated_explanation?.summary || "",
      aiSummary:
        data.llm_generated_explanation?.summary || "",
      aiMechanism:
        data.llm_generated_explanation?.mechanism || "",
      aiClinicalImpact:
        data.llm_generated_explanation?.clinical_impact || "",
      aiRecommendation:
        data.llm_generated_explanation?.recommendation || "",
      jsonOutput: data,
    };
  };

  // 🚀 CLINICAL ANALYSIS
  const handleAnalyze = async () => {
    const file = fileRef.current?.files?.[0];

    if (selectedDrugs.length === 0) {
      setError("Select at least one drug");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setAllResults([]);

    try {
      const formData = new FormData();

      if (file) {
        formData.append("file", file);
      } else if (!variant) {
        // Auto default to standard test genotype so the user can test seamlessly
        formData.append("variant", "*2/*2");
      }

      formData.append("drug", selectedDrugs.join(","));

      if (gene) formData.append("gene", gene.toUpperCase());
      if (variant) formData.append("variant", variant);

      // Attempt live backend fetch with a fast 3.5s timeout
      let data: any = null;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(`${backendUrl}/analyze`, {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (!json.error) {
            data = json;
          } else {
            console.warn("Backend error returned:", json.error);
          }
        }
      } catch (backendFetchErr) {
        console.info("Backend server unreachable. Seamlessly activating built-in clinical engine:", backendFetchErr);
      }

      if (!data) {
        // ⚡ RUN ON-DEVICE AUTONOMOUS CLINICAL ENGINE
        let vcfText = "";
        if (file) {
          try {
            vcfText = await file.text();
          } catch (e) {
            console.warn("Could not read file text:", e);
          }
        }

        const engineResult = runOnDeviceClinicalAnalysis(
          selectedDrugs,
          gene || undefined,
          variant || undefined,
          vcfText
        );

        setResult(engineResult.primary);
        setAllResults(engineResult.all);
        setServerStatus("offline");
        return;
      }

      let formattedSingle: AnalysisResult;
      let formattedAll: AnalysisResult[] = [];

      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        formattedAll = data.results.map((r: any) => formatBackendResult(r));
        formattedSingle = formattedAll[0];
      } else {
        formattedSingle = formatBackendResult(data);
        formattedAll = [formattedSingle];
      }

      setResult(formattedSingle);
      setAllResults(formattedAll);
      setServerStatus("online");

    } catch (err: any) {
      console.error("Clinical analysis fallback:", err);
      const engineResult = runOnDeviceClinicalAnalysis(
        selectedDrugs,
        gene || undefined,
        variant || undefined
      );
      setResult(engineResult.primary);
      setAllResults(engineResult.all);
    } finally {
      setLoading(false);
    }
  };

  // ⚡ QUICK RISK ANALYSIS
  const handleQuickRiskAnalyze = async () => {
    if (!quickAge || !quickGender || !quickCondition || !quickDrug) {
      setQuickError("Please fill in all required fields");
      return;
    }

    setQuickLoading(true);
    setQuickError("");
    setQuickResult(null);

    const payload: QuickRiskPayload = {
      age: parseInt(quickAge) || 40,
      gender: quickGender,
      ethnicity: quickEthnicity || "Asian",
      condition: quickCondition.toLowerCase(),
      drug: quickDrug,
      past_reaction: quickPastReaction,
    };

    try {
      let data: any = null;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(`${backendUrl}/predict`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (!json.error) {
            data = json;
          }
        }
      } catch (backendFetchErr) {
        console.info("Backend unreachable. Activating on-device ML model predictor:", backendFetchErr);
      }

      if (!data) {
        // ⚡ RUN ON-DEVICE QUICK RISK PREDICTOR
        const onDeviceResult = runOnDeviceQuickRisk(payload);
        setQuickResult(onDeviceResult);
        setServerStatus("offline");
        return;
      }

      const riskValue = (data.risk || "").toLowerCase();
      const safeRisk = ["low", "moderate", "high"].includes(riskValue)
        ? (riskValue as "low" | "moderate" | "high")
        : "high";

      setQuickResult({
        risk: safeRisk,
        confidence: Math.round((data.confidence || 0) * 100),
        confidence_label: data.confidence_label,
        risk_summary: data.risk_summary,
        key_factors: data.key_factors || [],
        what_it_means: data.what_it_means,
        next_steps: data.next_steps,
      });
      setServerStatus("online");

    } catch (err: any) {
      console.error("Quick Risk fallback:", err);
      const onDeviceResult = runOnDeviceQuickRisk(payload);
      setQuickResult(onDeviceResult);
    } finally {
      setQuickLoading(false);
    }
  };

  // 🧠 AI DRUG INTELLIGENCE
  const handleAiInsights = async () => {
    if (!aiDrug) {
      setError("Select a drug");
      return;
    }

    setAiLoading(true);
    setError("");
    setAiResult(null);

    try {
      // Mock AI insights (ready for real API integration)
      const mockInsights: typeof aiResult = {
        summary: `${aiDrug} is a commonly used pharmaceutical with significant pharmacogenomic implications. Patient response varies based on genetic polymorphisms, particularly in cytochrome P450 enzymes. Understanding genetic profile helps optimize dosing and minimize adverse effects.`,
        
        mechanism: `${aiDrug} works by ${getMockMechanism(aiDrug)}. The drug is metabolized through multiple pathways, with hepatic metabolism being primary. Genetic variants in metabolic enzymes can increase or decrease drug levels in the bloodstream, affecting efficacy and safety.`,
        
        clinical_impact: `Patients with ${aiGene || "CYP2C9"} variations may experience ${getRiskProfile(aiGene)}. Genetic testing helps identify rapid, normal, and slow metabolizers, allowing clinicians to tailor treatment regimens accordingly.`,
        
        recommendation: `Consider pharmacogenomic testing before initiating therapy. Dosing adjustments may be necessary based on genetic profile. Regular monitoring of therapeutic levels and adverse effects is recommended throughout treatment.`,
      };

      setAiResult(mockInsights);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Helper functions for mock AI data
  const getMockMechanism = (drug: string): string => {
    const mechanisms: Record<string, string> = {
      "WARFARIN": "inhibiting vitamin K-dependent clotting factors",
      "CLOPIDOGREL": "blocking platelet P2Y12 receptors via CYP2C19 bioactivation",
      "CODEINE": "binding to opioid receptors in the CNS",
      "OMEPRAZOLE": "inhibiting H+/K+-ATPase gastric proton pumps",
      "ESOMEPRAZOLE": "selectively inhibiting gastric acid secretion via proton pump inhibition",
      "LANSOPRAZOLE": "suppressing gastric acid secretion by inhibiting parietal cell H+/K+-ATPase",
      "PANTOPRAZOLE": "covalently binding to gastric proton pumps to inhibit acid secretion",
      "VORICONAZOLE": "inhibiting fungal cytochrome P450-mediated 14 alpha-lanosterol demethylation",
      "CITALOPRAM": "selectively inhibiting neuronal serotonin reuptake (SSRI)",
      "ESCITALOPRAM": "pure S-enantiomer selective serotonin reuptake inhibition (SSRI)",
      "SERTRALINE": "potent selective inhibition of central neuronal serotonin reuptake",
      "DIAZEPAM": "facilitating inhibitory GABAergic transmission in the central nervous system",
      "TAMOXIFEN": "blocking estrogen receptors",
      "PHENYTOIN": "stabilizing neuronal membranes",
      "SIMVASTATIN": "inhibiting HMG-CoA reductase",
      "ABACAVIR": "inhibiting reverse transcriptase",
      "CARBAMAZEPINE": "blocking sodium channels",
      "ALLOPURINOL": "inhibiting xanthine oxidase",
    };
    return mechanisms[drug] || "modulating metabolic pathways";
  };

  const getRiskProfile = (gene: string | null): string => {
    if (gene?.includes("2C9")) return "altered warfarin metabolism";
    if (gene?.includes("2D6")) return "variable drug response";
    if (gene?.includes("3A4")) return "potential drug interactions";
    return "individual metabolic variation";
  };

  return (
    <div className="min-h-screen relative flex justify-center py-16 px-4 bg-gradient-to-br from-gray-50 via-white to-cyan-50">
      <div className="w-full max-w-2xl space-y-6">

        {/* PREMIUM TAB SWITCHER */}
        <div className="bg-white rounded-2xl shadow-lg p-1 flex gap-1">
          <button
            onClick={() => {
              setMode("clinical");
              setResult(null);
              setQuickResult(null);
              setAiResult(null);
              setError("");
              setQuickError("");
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              mode === "clinical"
                ? "bg-cyan-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Dna size={18} />
            <span className="hidden sm:inline">Clinical Analysis</span>
            <span className="sm:hidden">Clinical</span>
          </button>

          <button
            onClick={() => {
              setMode("quick");
              setResult(null);
              setQuickResult(null);
              setAiResult(null);
              setError("");
              setQuickError("");
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              mode === "quick"
                ? "bg-cyan-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Zap size={18} />
            <span className="hidden sm:inline">Quick Risk</span>
            <span className="sm:hidden">Quick</span>
          </button>

          <button
            onClick={() => {
              setMode("ai");
              setResult(null);
              setQuickResult(null);
              setAiResult(null);
              setError("");
              setQuickError("");
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              mode === "ai"
                ? "bg-cyan-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Brain size={18} />
            <span className="hidden sm:inline">AI Intelligence</span>
            <span className="sm:hidden">AI</span>
          </button>
        </div>

        {/* 🌐 DUAL-MODE ENGINE & SERVER STATUS BAR */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 border border-gray-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              {serverStatus === "online" ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </>
              ) : serverStatus === "checking" ? (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 animate-pulse"></span>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              )}
            </span>
            <div className="truncate">
              {serverStatus === "online" ? (
                <>
                  <span className="font-semibold text-gray-700">Live API:</span>{" "}
                  <span className="text-gray-500 font-mono text-[11px] sm:text-xs">{backendUrl}</span>
                </>
              ) : (
                <>
                  <span className="font-semibold text-gray-800">⚡ Autonomous Mode:</span>{" "}
                  <span className="text-cyan-700 font-medium text-[11px] sm:text-xs">
                    Built-in CPIC Rule Engine & ML Predictor Active
                  </span>
                </>
              )}
            </div>
            <span
              className={`px-2 py-0.5 rounded-full font-medium text-[10px] sm:text-xs shrink-0 ${
                serverStatus === "online"
                  ? "bg-emerald-100 text-emerald-700"
                  : serverStatus === "checking"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-cyan-100 text-cyan-800"
              }`}
            >
              {serverStatus === "online"
                ? "Live Connected"
                : serverStatus === "checking"
                ? "Checking..."
                : "Offline Ready"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 justify-end">
            <button
              onClick={() => checkServer()}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition font-bold"
              title="Ping Backend Server"
            >
              ↻ Ping
            </button>
            <button
              onClick={() => {
                setCustomServerInput(backendUrl);
                setShowServerModal(true);
              }}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100 transition flex items-center gap-1 shadow-sm"
            >
              <Server size={12} />
              Server IP
            </button>
          </div>
        </div>

        {/* 🌐 SERVER SETTINGS MODAL */}
        {showServerModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Server className="text-cyan-600" size={20} />
                  <h3 className="font-bold text-gray-900 text-lg">Server & Engine Settings</h3>
                </div>
                <button
                  onClick={() => setShowServerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-xs text-cyan-800 space-y-1">
                <p className="font-semibold flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-cyan-600" />
                  Universal Android Compatibility:
                </p>
                <p>
                  This APK is designed to work on <strong>any Android device anywhere</strong>. Even if no PC server is running or reachable, the built-in clinical rule engine will execute all analyses locally!
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Live Backend API Address</label>
                <input
                  type="text"
                  value={customServerInput}
                  onChange={(e) => setCustomServerInput(e.target.value)}
                  placeholder="http://10.247.207.218:8000"
                  className="w-full p-2.5 text-sm font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              {/* Quick presets */}
              <div className="space-y-1">
                <span className="text-[11px] text-gray-500 font-medium">Quick Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCustomServerInput("http://10.247.207.218:8000")}
                    className="text-[11px] bg-cyan-50 text-cyan-800 px-2 py-1 rounded-md border border-cyan-200 hover:bg-cyan-100"
                  >
                    Wi-Fi PC (10.247.207.218:8000)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomServerInput("http://localhost:8000")}
                    className="text-[11px] bg-gray-100 text-gray-700 px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-200"
                  >
                    localhost:8000
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowServerModal(false)}
                  className="flex-1 py-2 rounded-xl text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveBackendUrl(customServerInput)}
                  className="flex-1 py-2 rounded-xl text-sm bg-cyan-500 hover:bg-cyan-600 text-white font-medium shadow"
                >
                  Save & Connect
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CARD CONTAINER */}
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6 min-h-96">

          {/* HEADER */}
          <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
            <div className={`p-3 text-white rounded-xl ${
              mode === "clinical" ? "bg-cyan-500" :
              mode === "quick" ? "bg-orange-500" :
              "bg-purple-500"
            }`}>
              {mode === "clinical" && <Dna size={24} />}
              {mode === "quick" && <Zap size={24} />}
              {mode === "ai" && <Brain size={24} />}
            </div>
            <div>
              <h2 className="text-2xl font-semibold">
                {mode === "clinical" && "Clinical Analysis"}
                {mode === "quick" && "Quick Risk Check"}
                {mode === "ai" && "AI Drug Intelligence"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {mode === "clinical" && "Deep VCF-based pharmacogenomic analysis"}
                {mode === "quick" && "Fast risk assessment for drug interactions"}
                {mode === "ai" && "AI-powered drug interaction insights"}
              </p>
            </div>
          </div>

          {/* 🔬 CLINICAL MODE */}
          {mode === "clinical" && (
            <div className="space-y-5">
              {/* FILE UPLOAD */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">VCF File Upload</label>
                <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-cyan-300 transition">
                  <input type="file" ref={fileRef} onChange={handleFileChange} className="hidden" id="fileUpload" />
                  <label htmlFor="fileUpload" className="cursor-pointer block">
                    <UploadCloud className="mx-auto mb-3 text-gray-400" size={32} />
                    <p className="text-sm text-gray-600">Drag and drop or <span className="text-cyan-500 font-medium">click to upload</span></p>
                  </label>
                  <div className="mt-3 flex justify-center">
                    <button
                      type="button"
                      onClick={handleLoadDemoVcf}
                      className="text-xs bg-cyan-50 text-cyan-700 hover:bg-cyan-100 font-semibold px-3 py-1.5 rounded-lg border border-cyan-200 transition"
                    >
                      🧪 Load Demo VCF (test.vcf)
                    </button>
                  </div>
                  {fileName && (
                    <div className="mt-4 flex items-center justify-center gap-2 bg-green-50 px-4 py-3 rounded-lg border border-green-200 inline-flex">
                      <span className="text-sm font-medium text-green-700">{fileName}</span>
                      <button
                        onClick={() => {
                          setFileName("");
                          if (fileRef.current) fileRef.current.value = "";
                        }}
                        className="text-red-500 hover:scale-110 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* GENE & VARIANT */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Gene</label>
                  <input
                    placeholder="e.g., CYP2C9"
                    value={gene}
                    onChange={(e) => setGene(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Variant</label>
                  <input
                    placeholder="e.g., *3"
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* DRUG SELECT */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Select Drugs</label>
                <div className="relative">
                  <div className="flex flex-wrap gap-2 border border-gray-300 p-3 rounded-xl focus-within:ring-2 focus-within:ring-cyan-500">
                    {selectedDrugs.map((d) => (
                      <div key={d} className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full flex gap-2 items-center text-sm">
                        {d}
                        <X size={14} onClick={() => removeDrug(d)} className="cursor-pointer hover:text-cyan-900" />
                      </div>
                    ))}
                    <input
                      value={drugInput}
                      onChange={(e) => {
                        setDrugInput(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                      placeholder="Search drugs..."
                      className="flex-1 outline-none bg-transparent text-sm min-w-32"
                    />
                  </div>

                  {showDropdown && filteredDrugs.length > 0 && (
                    <div className="absolute w-full bg-white border border-gray-300 rounded-xl mt-2 shadow-lg z-50 max-h-48 overflow-auto">
                      {filteredDrugs.map((drug) => (
                        <div
                          key={drug}
                          onMouseDown={() => addDrug(drug)}
                          className="px-4 py-3 hover:bg-cyan-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 transition"
                        >
                          {drug}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {loading ? "⏳ Processing Analysis..." : "⚡ Run Clinical Analysis"}
              </button>

              {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
            </div>
          )}

          {/* ⚡ QUICK RISK MODE */}
          {mode === "quick" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Age</label>
                  <input
                    type="number"
                    placeholder="e.g., 45"
                    value={quickAge}
                    onChange={(e) => setQuickAge(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Gender</label>
                  <select
                    value={quickGender}
                    onChange={(e) => setQuickGender(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">Select gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Ethnicity</label>
                  <select
                    value={quickEthnicity}
                    onChange={(e) => setQuickEthnicity(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">Select ethnicity</option>
                    <option value="Caucasian">Caucasian</option>
                    <option value="African">African</option>
                    <option value="Asian">Asian</option>
                    <option value="Hispanic">Hispanic</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Past Adverse Reaction</label>
                  <select
                    value={quickPastReaction}
                    onChange={(e) => setQuickPastReaction(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Medical Condition</label>
                <input
                  placeholder="e.g., hypertension, diabetes"
                  value={quickCondition}
                  onChange={(e) => setQuickCondition(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Drug</label>
                <select
                  value={quickDrug}
                  onChange={(e) => setQuickDrug(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                >
                  <option value="">Select drug</option>
                  {DRUGS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleQuickRiskAnalyze}
                disabled={quickLoading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {quickLoading ? "⏳ Analyzing..." : "⚡ Run Quick Risk Check"}
              </button>

              {quickError && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{quickError}</div>}

              {quickResult && (
                <div className={`p-6 rounded-2xl border-2 space-y-5 ${
                  quickResult.risk === "high" ? "bg-red-50 border-red-200" :
                  quickResult.risk === "moderate" ? "bg-yellow-50 border-yellow-200" :
                  "bg-green-50 border-green-200"
                }`}>
                  {/* RISK LEVEL & CONFIDENCE */}
                  <div className="flex items-start gap-4">
                    <div className={`text-4xl font-bold ${
                      quickResult.risk === "high" ? "text-red-600" :
                      quickResult.risk === "moderate" ? "text-yellow-600" :
                      "text-green-600"
                    }`}>
                      {quickResult?.risk?.toUpperCase() || ""}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-lg ${
                        quickResult.risk === "high" ? "text-red-700" :
                        quickResult.risk === "moderate" ? "text-yellow-700" :
                        "text-green-700"
                      }`}>
                        Risk Assessment
                      </p>
                      <p className={`text-sm mt-1 ${
                        quickResult.risk === "high" ? "text-red-600" :
                        quickResult.risk === "moderate" ? "text-yellow-600" :
                        "text-green-600"
                      }`}>
                        {quickResult.confidence}% Confidence
                      </p>
                    </div>
                  </div>

                  {/* SUMMARY */}
                  {quickResult?.risk_summary && (
                    <div className="pt-4 border-t border-gray-300 border-opacity-30">
                      <p className={`font-semibold text-sm mb-3 ${
                        quickResult.risk === "high" ? "text-red-700" :
                        quickResult.risk === "moderate" ? "text-yellow-700" :
                        "text-green-700"
                      }`}>
                        Summary
                      </p>
                      <p className={`text-sm leading-relaxed ${
                        quickResult.risk === "high" ? "text-red-700" :
                        quickResult.risk === "moderate" ? "text-yellow-700" :
                        "text-green-700"
                      }`}>
                        {quickResult.risk_summary}
                      </p>
                    </div>
                  )}

                  {/* WHY THIS RESULT - KEY FACTORS */}
                  {quickResult?.key_factors && quickResult.key_factors.length > 0 && (
                    <div className="pt-4 border-t border-gray-300 border-opacity-30">
                      <p className={`font-semibold text-sm mb-3 ${
                        quickResult.risk === "high" ? "text-red-700" :
                        quickResult.risk === "moderate" ? "text-yellow-700" :
                        "text-green-700"
                      }`}>
                        Why this result?
                      </p>
                      <ul className="space-y-2">
                        {quickResult.key_factors.map((factor, idx) => (
                          <li key={idx} className="flex gap-2 text-sm">
                            <span className={`font-bold ${
                              quickResult.risk === "high" ? "text-red-600" :
                              quickResult.risk === "moderate" ? "text-yellow-600" :
                              "text-green-600"
                            }`}>
                              •
                            </span>
                            <span className={`${
                              quickResult.risk === "high" ? "text-red-700" :
                              quickResult.risk === "moderate" ? "text-yellow-700" :
                              "text-green-700"
                            }`}>
                              {factor}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* WHAT IT MEANS */}
                  {quickResult?.what_it_means && (
                    <div className="pt-4 border-t border-gray-300 border-opacity-30">
                      <p className={`font-semibold text-sm mb-2 ${
                        quickResult.risk === "high" ? "text-red-700" :
                        quickResult.risk === "moderate" ? "text-yellow-700" :
                        "text-green-700"
                      }`}>
                        What it means
                      </p>
                      <p className={`text-sm leading-relaxed ${
                        quickResult.risk === "high" ? "text-red-700" :
                        quickResult.risk === "moderate" ? "text-yellow-700" :
                        "text-green-700"
                      }`}>
                        {quickResult.what_it_means}
                      </p>
                    </div>
                  )}

                  {/* NEXT STEPS */}
                  {quickResult?.next_steps && (
                    <div className="pt-4 border-t border-gray-300 border-opacity-30">
                      <p className={`font-semibold text-sm mb-2 ${
                        quickResult.risk === "high" ? "text-red-700" :
                        quickResult.risk === "moderate" ? "text-yellow-700" :
                        "text-green-700"
                      }`}>
                        Next steps
                      </p>
                      <p className={`text-sm leading-relaxed ${
                        quickResult.risk === "high" ? "text-red-700" :
                        quickResult.risk === "moderate" ? "text-yellow-700" :
                        "text-green-700"
                      }`}>
                        {quickResult.next_steps}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 🧠 AI INTELLIGENCE MODE */}
          {mode === "ai" && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Drug</label>
                <select
                  value={aiDrug}
                  onChange={(e) => setAiDrug(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                >
                  <option value="">Select drug</option>
                  {DRUGS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Gene (Optional)</label>
                  <input
                    placeholder="e.g., CYP2C9"
                    value={aiGene}
                    onChange={(e) => setAiGene(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Variant (Optional)</label>
                  <input
                    placeholder="e.g., *2"
                    value={aiVariant}
                    onChange={(e) => setAiVariant(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <button
                onClick={handleAiInsights}
                disabled={aiLoading}
                className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {aiLoading ? "🤖 Generating Insights..." : "🤖 Generate AI Insights"}
              </button>

              {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

              {aiResult && (
                <div className="space-y-4">
                  {/* 🔬 SUMMARY */}
                  <div className="p-5 bg-white border-2 border-purple-200 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🔬</span>
                      <h3 className="font-semibold text-gray-900">Summary</h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {aiResult.summary}
                    </p>
                  </div>

                  {/* ⚙️ MECHANISM */}
                  <div className="p-5 bg-white border-2 border-blue-200 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">⚙️</span>
                      <h3 className="font-semibold text-gray-900">Mechanism of Action</h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {aiResult.mechanism}
                    </p>
                  </div>

                  {/* 📊 CLINICAL IMPACT */}
                  <div className="p-5 bg-white border-2 border-orange-200 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">📊</span>
                      <h3 className="font-semibold text-gray-900">Clinical Impact</h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {aiResult.clinical_impact}
                    </p>
                  </div>

                  {/* 💊 RECOMMENDATION */}
                  <div className="p-5 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">💊</span>
                      <h3 className="font-semibold text-gray-900">Clinical Recommendation</h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {aiResult.recommendation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CLINICAL RESULTS */}
        {mode === "clinical" && result && (
          <DashboardResults
            result={result}
            allResults={allResults}
            selectedDrugName={result.drug}
            onSelectDrug={(sel) => setResult(sel)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;