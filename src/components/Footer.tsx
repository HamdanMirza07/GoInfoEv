import React from 'react';
import { TabType } from './Navbar';
import { 
  ArrowUp, 
  ExternalLink, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Bike, 
  Calculator, 
  Sun, 
  BatteryCharging, 
  TrendingUp,
  MessageCircle,
  Globe,
  Mail
} from 'lucide-react';

interface FooterProps {
  onNavigate?: (tab: TabType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  // Developer Contact details - Hamdan Mirza
  const WHATSAPP_NUMBER = '923036001701';
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi Hamdan Mirza, I saw your goinfoEV platform and would like to connect!')}`;
  
  // Technology Partner - OrinexAI
  const ORINEX_AI_URL = 'https://orinexai.com';

  // Emails
  const HAMDAN_EMAIL = 'Hamdan7394@gmail.com';
  const ORINEX_EMAIL = 'info@orinexai.com';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (tab: TabType) => {
    if (onNavigate) {
      onNavigate(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const suiteTools: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'charging-stations', label: 'EV Charging Stations (70+)', icon: <Globe className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'range', label: 'Range Estimator', icon: <Zap className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'charging', label: 'Charging Cost Calc', icon: <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'battery', label: 'Battery Health Tracker', icon: <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'savings', label: 'Fuel Savings Calculator', icon: <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> },
    { id: 'solar', label: 'Solar Charging Calc', icon: <Sun className="w-3.5 h-3.5 text-yellow-400" /> },
    { id: 'rider', label: 'Rider Profit Engine', icon: <Bike className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'products', label: 'Pakistan EV Fleet (38+)', icon: <Calculator className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'comparison', label: 'Side-by-Side Comparison', icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" /> },
  ];

  return (
    <footer className="mt-16 bg-slate-950 text-slate-300 border-t border-slate-800 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 relative z-10">
        
        {/* ───────────────────────────────────────────────────────────
            SECTION 1: TOP BRANDING & NAVIGATION
        ──────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand Info (Cols 5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleNavClick('home')}
                className="cursor-pointer select-none text-left"
              >
                <span className="font-black text-2xl sm:text-3xl tracking-tight text-white hover:text-blue-400 transition-colors">
                  goinfo<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 font-black">EV</span>
                </span>
              </button>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-950/80 text-blue-300 border border-blue-800/60">
                Pakistan Edition
              </span>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Pakistan's comprehensive Electric Vehicle analytics platform. Accurate range simulations, NEPRA electricity cost calculations, solar pairing forecasts, and delivery rider ROI intelligence.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>15 Verified Brands</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
                <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                <span>38+ EV Scooter & Bike Models</span>
              </div>
            </div>
          </div>

          {/* Quick Tools & Calculators (Cols 4) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              EV Intelligence Suite
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {suiteTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleNavClick(tool.id)}
                  className="flex items-center gap-2 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900/80 transition-all text-left cursor-pointer group"
                >
                  <span className="group-hover:scale-110 transition-transform">{tool.icon}</span>
                  <span className="truncate">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pages & Editorial (Cols 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pages &amp; Guides
            </h4>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => handleNavClick('content')}
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer text-left"
              >
                <span>🔋 Battery Guides</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full font-bold">15</span>
              </button>
              <button
                onClick={() => handleNavClick('content')}
                className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer text-left"
              >
                <span>🔧 Maintenance &amp; Fixes</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-800 rounded-full font-bold">20</span>
              </button>
              <button
                onClick={() => handleNavClick('charging-stations')}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
              >
                <span>EV Charging Stations</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full font-bold">Fast DC</span>
              </button>
              <button
                onClick={() => handleNavClick('content')}
                className="block text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
              >
                EV Buyer's Guide &amp; Policy
              </button>
              <button
                onClick={() => handleNavClick('blogs')}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
              >
                <span>Blogs &amp; Insights</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-cyan-900/80 text-cyan-300 rounded-full font-bold">40+</span>
              </button>
              <button
                onClick={() => handleNavClick('about')}
                className="block text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
              >
                About Us &amp; Team
              </button>
              <button
                onClick={() => handleNavClick('contact')}
                className="block text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
              >
                Contact Us &amp; Inquiries
              </button>
              <button
                onClick={() => handleNavClick('comparison')}
                className="block text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
              >
                Compare Fleet
              </button>
            </div>
          </div>

          {/* Coverage & Standards (Cols 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Data &amp; Standards
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>NEPRA 2026 Tariffs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>LiFePO4 &amp; NMC Lab</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Local Traffic Benchmark</span>
              </li>
            </ul>
          </div>

        </div>

        {/* ───────────────────────────────────────────────────────────
            SECTION 2: DEVELOPER ATTRIBUTION & ORINEXAI SHOWCASE
        ──────────────────────────────────────────────────────────── */}
        <div className="my-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Left: Designer & Developer Hamdan Mirza Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20">
                HM
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-semibold text-slate-400">Designed & Developed by</span>
                <span className="font-extrabold text-white text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                  Hamdan Mirza
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-900/60 text-blue-300 border border-blue-700/50 text-[10px] font-bold">
                  Lead Creator
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Specialized in high-performance modern web apps, smart calculative engines, and AI systems.
              </p>

              {/* Direct Email Contacts */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-2 text-[11px]">
                <a 
                  href={`mailto:${HAMDAN_EMAIL}`}
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-blue-400 transition-colors group"
                  title="Send email to Hamdan Mirza"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span>{HAMDAN_EMAIL}</span>
                </a>
                <span className="text-slate-700 hidden sm:inline">•</span>
                <a 
                  href={`mailto:${ORINEX_EMAIL}`}
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 transition-colors group"
                  title="Send email to OrinexAI"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>{ORINEX_EMAIL}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right: Actions (WhatsApp Button + OrinexAI Link) */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* WhatsApp Direct Connect */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all duration-200 shadow-md shadow-emerald-900/40 hover:scale-[1.02] active:scale-95 group"
              title="Chat with Hamdan Mirza on WhatsApp"
            >
              {/* Custom Crisp WhatsApp Icon */}
              <svg className="w-4 h-4 fill-current group-hover:rotate-12 transition-transform" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.54 1.861.821 2.796.821h.005c3.179 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.768-5.773-5.768zm3.385 8.165c-.14.394-.716.748-1.026.797-.282.045-.648.077-2.083-.518-1.835-.761-3.003-2.617-3.094-2.738-.091-.121-.741-.986-.741-1.88 0-.895.469-1.336.636-1.517.167-.181.365-.227.487-.227.121 0 .243.002.349.007.112.005.263-.042.411.314.152.365.517 1.26.562 1.352.045.091.076.197.015.318-.061.121-.091.197-.182.303-.091.106-.192.237-.274.318-.091.091-.186.19-.08.372.106.182.471.777 1.011 1.258.697.621 1.285.813 1.468.904.182.091.289.076.395-.045.106-.121.456-.53.578-.712.121-.182.243-.152.41-.091.167.061 1.063.501 1.246.592.182.091.304.137.349.213.045.076.045.44-.095.834zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.168L2 22l4.98-1.385C8.423 21.503 10.151 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
              </svg>
              <span>WhatsApp Connect</span>
            </a>

            {/* Powered by OrinexAI Link */}
            <a
              href={ORINEX_AI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all duration-200 hover:scale-[1.02] active:scale-95 group"
              title="Visit OrinexAI Website"
            >
              <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-[10px] font-black text-slate-950">
                O
              </div>
              <span>with <strong className="text-cyan-400 group-hover:text-cyan-300">OrinexAI</strong></span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

        </div>

        {/* ───────────────────────────────────────────────────────────
            SECTION 3: BOTTOM COPYRIGHT & ATTRIBUTION BAR
        ──────────────────────────────────────────────────────────── */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span>© 2026 <strong className="text-slate-400">goinfoEV</strong>. All rights reserved.</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span>Pakistan EV Intelligence Suite</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              Made in Pakistan 🇵🇰 for Sustainable Mobility
            </span>
            
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer"
              title="Back to Top"
              aria-label="Back to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
};
