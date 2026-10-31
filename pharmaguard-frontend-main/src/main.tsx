import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 📱 Register Service Worker for PWA (Installable App)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("✅ PharmaGuard PWA ServiceWorker active:", reg.scope);
      })
      .catch((err) => {
        console.warn("ServiceWorker registration error:", err);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
