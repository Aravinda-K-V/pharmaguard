import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Brain, Dna, Activity, Sparkles, Lock } from "lucide-react";

// Animated DNA Helix Component
const AnimatedDnaHelix = () => {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="dnaGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Animated DNA strands */}
      <g className="animate-pulse">
        {/* Left helix strand */}
        <path
          d="M 200 100 Q 300 200, 400 100 T 600 100 T 800 100"
          stroke="url(#dnaGradient1)"
          strokeWidth="3"
          fill="none"
          filter="url(#glow)"
          className="animate-pulse"
          style={{ animationDuration: "3s" }}
        />
        {/* Right helix strand */}
        <path
          d="M 200 300 Q 300 200, 400 300 T 600 300 T 800 300"
          stroke="url(#dnaGradient1)"
          strokeWidth="3"
          fill="none"
          filter="url(#glow)"
          className="animate-pulse"
          style={{ animationDuration: "3s", animationDelay: "0.3s" }}
        />

        {/* Connecting rungs */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i}>
            <line
              x1={200 + i * 100}
              y1={100 + i * 20}
              x2={200 + i * 100}
              y2={300 - i * 20}
              stroke="url(#dnaGradient1)"
              strokeWidth="2"
              opacity="0.8"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
            <circle
              cx={200 + i * 100}
              cy={100 + i * 20}
              r="6"
              fill="#10b981"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
            <circle
              cx={200 + i * 100}
              cy={300 - i * 20}
              r="6"
              fill="#06b6d4"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          </g>
        ))}
      </g>

      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <circle
          key={i}
          cx={Math.random() * 1200}
          cy={Math.random() * 800}
          r={Math.random() * 3 + 1}
          fill="#10b981"
          opacity={Math.random() * 0.5 + 0.2}
          className="animate-float"
          style={{
            animationDuration: `${Math.random() * 4 + 3}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </svg>
  );
};

const features = [
  {
    icon: Dna,
    title: "Genomic Variant Analysis",
    description: "Upload VCF files to detect pharmacogenomic variants linked to drug metabolism pathways.",
  },
  {
    icon: Brain,
    title: "LLM-Powered Insights",
    description: "Advanced AI generates human-readable explanations of complex drug-gene interactions.",
  },
  {
    icon: ShieldCheck,
    title: "CPIC-Grade Recommendations",
    description: "Evidence-based dosing guidelines aligned with Clinical Pharmacogenetics Implementation Consortium.",
  },
  {
    icon: Activity,
    title: "Risk Stratification",
    description: "Color-coded risk indicators with confidence scores for rapid clinical decision-making.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
        className="absolute inset-0 animate-slowZoom"
        style={{
          backgroundImage: "url('https://scitechdaily.com/images/DNA-Genetics.gif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        > </div>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div className="relative z-10">
        </div>


        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-secondary/5 blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-secondary/5 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-secondary/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-secondary/5 animate-spin-slow" />
        </div>

        <div className="relative container mx-auto px-4 py-28 md:py-40">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-dark text-secondary text-sm font-medium animate-fade-up"
            >
              <Sparkles className="h-4 w-4" /> AI-Driven Pharmacogenomics
            </div>
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground leading-[1.1] animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              PharmaGuard AI{" "}
              
            </h1>
            <p
              className="text-lg md:text-xl text-primary-foreground/60 max-w-2xl mx-auto leading-relaxed animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              Predict personalized pharmacogenomic risks with AI-powered analysis.
              Transform genetic data into clinically actionable insights — instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl gradient-glow text-primary font-semibold text-base shadow-glow hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5 group"
              >
                Launch Analysis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/how-to-use"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl glass-dark text-primary-foreground/80 font-medium text-base hover:text-primary-foreground transition-all duration-300"
              >
                <Lock className="h-4 w-4" /> How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-secondary font-semibold text-sm tracking-widest uppercase mb-3">Capabilities</p>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
              Precision Medicine Pipeline
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              From raw genomic data to clinical decision — powered by cutting-edge AI.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group glass rounded-2xl p-7 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 animate-fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-5 group-hover:gradient-glow group-hover:shadow-glow transition-all duration-300">
                  <f.icon className="h-6 w-6 text-accent-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-display font-semibold text-lg text-card-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">

  {/* Background GIF */}
  <div
    className="absolute inset-0 animate-slowZoom opacity-70"
    style={{
      backgroundImage: "url('https://scitechdaily.com/images/Spinning-DNA-Blue.gif')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  ></div>

  {/* Overlay */}
  <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>

  {/* Content */}
  <div className="relative container mx-auto px-4 text-center z-10">
    <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
      Ready to analyze pharmacogenomic risks?
    </h2>

    <p className="text-white/70 mb-10 text-lg max-w-lg mx-auto">
      Upload your VCF file and get AI-powered insights instantly.
    </p>

    <Link
      to="/dashboard"
      className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-400 text-black font-semibold shadow-xl hover:scale-105 transition-all duration-300"
    >
      Start Analysis →
    </Link>
  </div>

</section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 PharmaGuard AI — AI-Driven Pharmacogenomic Risk Analysis. Built for precision medicine.
        </div>
      </footer>
    </div>
  );
};

export default Index;
