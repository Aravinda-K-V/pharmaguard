const DashboardInput = ({
  fileName,
  drugName,
  onFileChange,
  onDrugChange,
  onAnalyze,
  fileRef,
  loading,
  error,
}) => {
  return (
    <div className="relative p-6 rounded-2xl border border-cyan-400/10 bg-black/40 backdrop-blur shadow-lg mb-6">

      {/* 🧬 Glow background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.25),transparent_70%)]" />

      <div className="relative space-y-5">

        {/* Title */}
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          🧬 Upload Genetic Data
        </h2>

        {/* File Upload */}
        <div className="border border-dashed border-cyan-400/30 rounded-xl p-4 text-center hover:border-cyan-300 transition">
          <input
            type="file"
            ref={fileRef}
            onChange={onFileChange}
            className="hidden"
            id="fileUpload"
          />

          <label
            htmlFor="fileUpload"
            className="cursor-pointer text-cyan-300 hover:text-cyan-200"
          >
            📁 Click to upload VCF file
          </label>

          {fileName && (
            <p className="text-sm mt-2 text-white/70">
              Selected: {fileName}
            </p>
          )}
        </div>

        {/* Drug Input */}
        <div>
          <label className="text-sm text-white/70">Drug Name</label>
          <input
            type="text"
            placeholder="e.g., WARFARIN, CLOPIDOGREL"
            value={drugName}
            onChange={(e) => onDrugChange(e.target.value)}
            className="mt-1 w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Button */}
        <button
          onClick={onAnalyze}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-400 to-teal-400 text-black hover:scale-[1.02] transition disabled:opacity-50"
        >
          {loading ? "🧬 Analyzing..." : "Run Analysis"}
        </button>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm">
            ⚠️ {error}
          </p>
        )}

      </div>
    </div>
  );
};

export default DashboardInput;