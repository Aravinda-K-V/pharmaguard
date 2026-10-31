import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Dna,
  Info,
  FileText,
  Copy,
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Pill,
} from "lucide-react";
import { AnalysisResult } from "@/data/mockAnalysis";

// ✅ Strong type
type Severity = "low" | "medium" | "high";

// 🎯 Config with type safety
const riskConfig: Record<
  Severity,
  {
    text: string;
    bg: string;
    icon: any;
  }
> = {
  low: {
    text: "text-green-600",
    bg: "bg-green-100",
    icon: CheckCircle2,
  },
  medium: {
    text: "text-yellow-600",
    bg: "bg-yellow-100",
    icon: AlertCircle,
  },
  high: {
    text: "text-red-600",
    bg: "bg-red-100",
    icon: AlertTriangle,
  },
};

interface Props {
  result: AnalysisResult;
  allResults?: AnalysisResult[];
  selectedDrugName?: string;
  onSelectDrug?: (res: AnalysisResult) => void;
}

const DashboardResults = ({ result, allResults, selectedDrugName, onSelectDrug }: Props) => {
  const [aiExpanded, setAiExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  // 🔥 SAFE BACKEND ACCESS
  let riskLabel =
    result.riskLabel ||
    (result as any).risk_assessment?.risk_label ||
    "High Risk";

  if (riskLabel.toLowerCase() === "unknown") {
    riskLabel = "High Risk";
  }

  const isHighRisk =
    riskLabel.includes("⚠️") ||
    riskLabel.toLowerCase().includes("high") ||
    riskLabel.toLowerCase().includes("ineffective") ||
    riskLabel.toLowerCase().includes("toxic") ||
    riskLabel.toLowerCase().includes("contra") ||
    riskLabel.toLowerCase().includes("exposure can increase") ||
    riskLabel.toLowerCase().includes("metabolism affected") ||
    riskLabel.toLowerCase().includes("exposure may increase") ||
    riskLabel.toLowerCase().includes("reduced activation");

  const severity: Severity =
    isHighRisk
      ? "high"
      : (result as any).risk_assessment?.severity ||
        result.riskLevel ||
        "low";

  const risk = riskConfig[severity];

  const confidence =
    result.confidence ||
    Math.round(
      ((result as any).risk_assessment?.confidence_score || 0) * 100
    );

  // 🎯 ICON BASED ON LABEL
  const getIcon = () => {
    if (isHighRisk) return AlertTriangle;
    if (riskLabel.toLowerCase().includes("safe")) return CheckCircle2;
    return AlertCircle;
  };

  const RiskIcon = getIcon();

  const jsonStr = JSON.stringify(result.jsonOutput, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pharmaguard-${result.drug || "analysis"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const drugTitle = result.drug ? result.drug.toUpperCase() : "TARGET DRUG";

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-display font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-secondary" /> Analysis Results
        </h2>
        {result.drug && (
          <div className="flex items-center gap-2 bg-cyan-100 text-cyan-800 px-3 py-1.5 rounded-full font-semibold text-sm">
            <Pill className="h-4 w-4" />
            <span>{drugTitle}</span>
          </div>
        )}
      </div>

      {/* 💊 MULTI-DRUG SELECTOR TABS */}
      {allResults && allResults.length > 1 && (
        <div className="bg-gray-50 border rounded-2xl p-3 space-y-2">
          <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
            Tested Drugs ({allResults.length}) — Click to view:
          </p>
          <div className="flex flex-wrap gap-2">
            {allResults.map((r, idx) => {
              const rDrug = r.drug || `Drug ${idx + 1}`;
              const isSelected = (selectedDrugName && selectedDrugName.toUpperCase() === rDrug.toUpperCase()) ||
                (!selectedDrugName && rDrug.toUpperCase() === drugTitle);
              return (
                <button
                  key={idx}
                  onClick={() => onSelectDrug && onSelectDrug(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "bg-white text-gray-700 border hover:bg-gray-100"
                  }`}
                >
                  {rDrug}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 🚨 ALERT */}
      {isHighRisk && (
        <div className="p-4 bg-red-500 text-white rounded-xl text-center font-bold animate-pulse shadow-md">
          🚨 HIGH RISK — CLINICAL PRECAUTION REQUIRED (USE ALTERNATIVE DRUG OR ADJUST DOSAGE)
        </div>
      )}

      {severity === "medium" && (
        <div className="p-4 bg-amber-500 text-white rounded-xl text-center font-semibold shadow-sm">
          ⚠️ MODERATE RISK — CLINICAL MONITORING & DOSAGE TITRATION RECOMMENDED
        </div>
      )}

      {/* 🧠 RISK */}
      <div className="rounded-2xl shadow-card border p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className={`w-16 h-16 rounded-2xl ${risk.bg} flex items-center justify-center`}>
          <RiskIcon className={`h-8 w-8 ${risk.text}`} />
        </div>

        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">
            Expected Relevance / Risk Assessment
          </p>

          <p className={`text-2xl font-bold ${risk.text}`}>
            {riskLabel}
          </p>

          {result.clinicalRelevance && result.clinicalRelevance !== riskLabel && (
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Clinical Relevance: {result.clinicalRelevance}
            </p>
          )}
        </div>

        <div className="text-center">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#eee" strokeWidth="4" />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="teal"
                strokeWidth="4"
                strokeDasharray={`${(confidence / 100) * 175.9} 175.9`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
              {confidence}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Confidence
          </p>
        </div>
      </div>

      {/* 🧬 PROFILE */}
      <div className="rounded-2xl shadow-card border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Dna className="h-4 w-4 text-secondary" />
          <p className="text-sm font-semibold uppercase">
            Pharmacogenomic Profile
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Gene</p>
            <p className="font-bold text-gray-900">{result.geneDetected}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Diplotype</p>
            <p className="font-semibold text-gray-800">{result.diplotype}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Phenotype</p>
            <p className="font-semibold text-gray-800">{result.phenotype}</p>
          </div>
        </div>
      </div>

      {/* 💊 RECOMMENDATION */}
      <div className="rounded-2xl border p-6 bg-slate-50/50">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-secondary" />
          <p className="text-sm font-semibold text-gray-900">
            Clinical Recommendation
          </p>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed">{result.recommendation}</p>
      </div>

      {/* 🤖 AI */}
      <div className="rounded-2xl border overflow-hidden">
        <button
          onClick={() => setAiExpanded(!aiExpanded)}
          className="w-full flex justify-between items-center p-4 bg-gray-50/80 hover:bg-gray-100 font-semibold text-sm transition"
        >
          <span>AI Clinical Explanation</span>
          {aiExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {aiExpanded && (
          <div className="p-5 space-y-3 bg-white text-sm">
            <p><b>Summary:</b> {result.aiSummary || result.aiExplanation}</p>
            {result.aiMechanism && <p><b>Mechanism:</b> {result.aiMechanism}</p>}
            {result.aiClinicalImpact && <p><b>Impact:</b> {result.aiClinicalImpact}</p>}
            {result.aiRecommendation && <p><b>Recommendation:</b> {result.aiRecommendation}</p>}
          </div>
        )}
      </div>

      {/* 📋 JSON */}
      <div className="rounded-2xl border">
        <div className="flex justify-between items-center p-4 bg-gray-50/80">
          <p className="text-sm font-semibold">JSON Output</p>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs bg-white border px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
            >
              <Copy size={13} /> {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 text-xs bg-white border px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
            >
              <Download size={13} /> Download
            </button>
          </div>
        </div>

        <pre className="p-4 text-xs bg-gray-900 text-gray-100 rounded-b-2xl overflow-auto max-h-60">{jsonStr}</pre>
      </div>
    </div>
  );
};

export default DashboardResults;
