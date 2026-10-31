const DnaIcon = () => {
  return (
    <div className="w-6 h-6 relative animate-spin-slow">

      <svg viewBox="0 0 100 100" className="w-full h-full">

        {/* Gradient */}
        <defs>
          <linearGradient id="dnaGrad" x1="0%" y1="0%" x2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>

        {/* Left strand */}
        <path
          d="M40 10 C60 30, 60 70, 40 90"
          stroke="url(#dnaGrad)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />

        {/* Right strand */}
        <path
          d="M60 10 C40 30, 40 70, 60 90"
          stroke="url(#dnaGrad)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />

      </svg>

      {/* glow */}
      <div className="absolute inset-0 rounded-full bg-cyan-400/30 blur-md" />
    </div>
  );
};

export default DnaIcon;