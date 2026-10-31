import { Upload, Pill, Search, FileBarChart, Dna, Zap, Brain } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Quick Risk Analysis",
    description:
      "Instantly check if a medication is safe based on patient details. Get fast, easy-to-understand risk insights in seconds.",
    color: "text-orange-500",
  },
  {
    icon: Brain,
    title: "AI Clinical Intelligence",
    description:
      "Understand how drugs behave in your body. AI explains mechanisms, risks, and effects in simple language.",
    color: "text-purple-500",
  },
  {
    icon: Dna,
    title: "Genomic (VCF) Analysis",
    description:
      "Upload genetic data to detect drug-gene interactions and get personalized treatment insights.",
    color: "text-cyan-500",
  },
];

const steps = [
  {
    icon: Upload,
    title: "Upload Genetic Data",
    description:
      "Upload a VCF file or enter gene variants manually. PharmaGuard identifies clinically relevant markers instantly.",
    step: "01",
  },
  {
    icon: Pill,
    title: "Choose Medication",
    description:
      "Select one or more drugs. Our system understands both common and clinical drug names.",
    step: "02",
  },
  {
    icon: Search,
    title: "Run AI Analysis",
    description:
      "We analyze your data using pharmacogenomics, clinical rules, and AI to assess potential risks.",
    step: "03",
  },
  {
    icon: FileBarChart,
    title: "Get Clear Insights",
    description:
      "Receive patient-friendly explanations, risk levels, and actionable recommendations instantly.",
    step: "04",
  },
];

const HowToUse = () => {
  return (
    <div className="min-h-screen py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-cyan-50">
      <div className="container mx-auto px-4">

        {/* HERO */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            <Dna className="h-3.5 w-3.5" /> Smart Healthcare AI
          </div>

          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground">
            From Symptoms to Safer Medication Decisions
          </h1>

          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            PharmaGuard combines AI, clinical knowledge, and genomics to help you understand medication risks before you take them.
          </p>

          {/* CTA */}
          <div className="mt-6">
            <button className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:bg-cyan-600 transition">
              🚀 Try Quick Risk Now
            </button>
          </div>
        </div>

        {/* FEATURES */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-10">
            What You Can Do with PharmaGuard
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* STEPS */}
        <div className="max-w-3xl mx-auto space-y-6">
          {steps.map((s, i) => (
            <div
              key={s.step}
              className="flex gap-6 items-start bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-cyan-100 flex items-center justify-center">
                  <s.icon className="h-6 w-6 text-cyan-600" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold text-cyan-500 tracking-widest uppercase">
                    Step {s.step}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {s.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* FINAL CTA */}
        <div className="text-center mt-20">
          <h2 className="text-2xl font-bold mb-4">
            Ready to make safer medication decisions?
          </h2>
          <p className="text-muted-foreground mb-6">
            Start with a quick risk check or explore deeper insights with AI and genomics.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <button className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition">
              ⚡ Quick Risk
            </button>
            <button className="px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition">
              🧠 AI Insights
            </button>
            <button className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 transition">
              🧬 Clinical Analysis
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HowToUse;