import { Link, useLocation } from "react-router-dom";
import { Menu, X, Smartphone, Download } from "lucide-react";
import { useState, useEffect } from "react";
import DnaIcon from "@/components/DnaIcon";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "How to Use", to: "/how-to-use" },
  { label: "Dashboard", to: "/dashboard" },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        "📱 To Install PharmaGuard as an App:\n\n" +
        "• Android (Chrome): Tap Menu (⋮) ➔ 'Install App' or 'Add to Home Screen'\n" +
        "• iOS (Safari): Tap the Share button (⬆) ➔ 'Add to Home Screen'\n" +
        "• Desktop (Chrome / Edge): Click the Install icon on the right side of the address bar."
      );
    }
  };

  return (
    <nav className="sticky top-0 z-50 gradient-primary border-b border-secondary/10 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* 🧬 Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-primary-foreground font-display font-bold text-xl tracking-tight group"
        >
          <div className="w-10 h-10 rounded-xl bg-black/40 border border-cyan-400/20 flex items-center justify-center">
            <DnaIcon />
          </div>
          PharmaGuard AI
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === link.to
                  ? "bg-secondary/20 text-secondary"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <a
            href="/pharmaguard-app.apk"
            download="PharmaGuard.apk"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-500/30 transition shadow-sm"
            title="Download Android APK (4.6 MB)"
          >
            <Download size={14} /> Download APK
          </a>

          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-400/30 transition shadow-sm"
              title="Install PharmaGuard App"
            >
              <Smartphone size={14} /> Install App
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <a
            href="/pharmaguard-app.apk"
            download="PharmaGuard.apk"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
          >
            <Download size={13} /> APK
          </a>
          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-400/20 text-cyan-300 border border-cyan-400/40"
            >
              <Smartphone size={13} /> Install
            </button>
          )}
          <button
            className="text-primary-foreground p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* 📱 Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden gradient-primary border-t border-primary-foreground/10 pb-4 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-6 py-3 text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-secondary/20 text-secondary"
                  : "text-primary-foreground/70 hover:text-primary-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="px-6 pt-2 space-y-2">
            <a
              href="/pharmaguard-app.apk"
              download="PharmaGuard.apk"
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 text-white shadow-md"
            >
              <Download size={16} /> Download Android APK (4.6 MB)
            </a>
            {!isInstalled && (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleInstallClick();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-cyan-500 text-white shadow-md"
              >
                <Smartphone size={16} /> Install Web App
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
