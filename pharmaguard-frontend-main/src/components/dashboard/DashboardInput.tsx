import { Upload, Pill, Dna, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
import React from "react";

interface Props {
  fileName: string;
  drugName: string;
  analyzing: boolean;
  error: string;
  fileRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrugChange: (val: string) => void;
  onAnalyze: () => void;
}

const DashboardInput = ({ fileName, drugName, analyzing, error, fileRef, onFileChange, onDrugChange, onAnalyze }: Props) => {
  return (
    <div className="glass rounded-3xl shadow-elevated p-6 md:p-10 mb-10 animate-fade-up border border-border">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl gradient-glow flex items-center justify-center shadow-glow">
          <Dna className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-card-foreground">PharmaGuard Analysis</h1>
          <p className="text-sm text-muted-foreground">Upload genomic data & enter drug information</p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-card-foreground mb-2">Patient VCF File</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-secondary/50 hover:bg-accent/30 transition-all duration-300 group"
        >
          {fileName ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <p className="text-sm font-medium text-card-foreground">{fileName}</p>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3 group-hover:text-secondary transition-colors" />
              <p className="text-sm font-medium text-card-foreground">Upload Patient VCF File</p>
              <p className="text-xs text-muted-foreground mt-1">.vcf, .vcf.gz — up to 5MB</p>
            </>
          )}
          <input ref={fileRef} type="file" accept=".vcf,.vcf.gz" className="hidden" onChange={onFileChange} />
        </div>
      </div>

      {/* Drug Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-card-foreground mb-2">Drug Name(s)</label>
        <div className="relative">
          <Pill className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={drugName}
            onChange={(e) => onDrugChange(e.target.value)}
            placeholder="e.g., WARFARIN, CLOPIDOGREL, CODEINE"
            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-secondary transition-all"
          />
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={onAnalyze}
        disabled={!fileName || !drugName || analyzing}
        className="w-full py-4 rounded-2xl gradient-glow text-primary font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow transition-all duration-300 animate-pulse-glow disabled:animate-none"
      >
        {analyzing ? (
          <>
            <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Running Pharmacogenomic Analysis...
          </>
        ) : (
          <>
            <Zap className="h-4 w-4" /> Run Pharmacogenomic Analysis
          </>
        )}
      </button>
    </div>
  );
};

export default DashboardInput;
