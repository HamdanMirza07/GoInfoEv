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
  Globe,
  Mail
} from 'lucide-react';

interface FooterProps {
  onNavigate?: (tab: TabType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const WHATSAPP_NUMBER = '923036001701';
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi Hamdan Mirza, I saw your goinfoEV platform and would like to connect!')}`;
  
  const ORINEX_AI_URL = 'https://orinexai.com';

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
    { id: 'range', label: 'Range Estimator', icon: <Zap className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'charging', label: 'Charging Cost Calc', icon: <BatteryCharging className="w-3.5 h-3.5 text-[#16A36A]" /> },
    { id: 'battery', label: 'Battery Health Tracker', icon: <ShieldCheck className="w-3.5 h-3.5 text-[#F0B429]" /> },
    { id: 'savings', label: 'Fuel Savings Calculator', icon: <TrendingUp className="w-3.5 h-3.5 text-[#16A36A]" /> },
    { id: 'solar', label: 'Solar Charging Calc', icon: <Sun className="w-3.5 h-3.5 text-[#F0B429]" /> },
    { id: 'rider', label: 'Rider Profit Engine', icon: <Bike className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'products', label: 'Pakistan EV Fleet (38+)', icon: <Calculator className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'comparison', label: 'Side-by-Side Comparison', icon: <Sparkles className="w-3.5 h-3.5 text-[#F0B429]" /> },
  ];

  return (
    <footer className="mt-16 bg-[#F5F8F6] text-[#071B2B] border-t border-slate-200/90 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#16A36A]/12 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#F0B429]/12 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 relative z-10">
        
        {/* SECTION 1: TOP BRANDING & NAVIGATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-200/80">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleNavClick('home')}
                className="cursor-pointer select-none text-left"
              >
                <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-[#071B2B] hover:text-[#16A36A] transition-colors">
                  goinfo<span className="text-[#16A36A] font-black">EV</span>
                </span>
              </button>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-white text-[#16A36A] border border-slate-200 shadow-2xs">
                Pakistan Edition
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed max-w-md font-medium">
              Pakistan's comprehensive Electric Vehicle analytics platform. Accurate range simulations, NEPRA electricity cost calculations, solar pairing forecasts, and delivery rider ROI intelligence.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-700">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl font-semibold shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-[#16A36A] animate-pulse"></span>
                <span>15 Verified Brands</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl font-semibold shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-[#F0B429]"></span>
                <span>38+ EV Scooter & Bike Models</span>
              </div>
            </div>
          </div>

          {/* Quick Tools & Calculators */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              EV Intelligence Suite
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {suiteTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleNavClick(tool.id)}
                  className="flex items-center gap-2 p-1.5 rounded-lg text-slate-700 hover:text-[#071B2B] hover:bg-white transition-all text-left cursor-pointer group font-medium"
                >
                  <span className="group-hover:scale-110 transition-transform">{tool.icon}</span>
                  <span className="truncate">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pages & Editorial */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Pages &amp; Guides
            </h4>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => handleNavClick('content')}
                className="flex items-center justify-between w-full text-[#16A36A] hover:text-emerald-700 font-bold transition-colors cursor-pointer text-left whitespace-nowrap"
              >
                <span>Battery Guides</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-white text-[#16A36A] border border-slate-200 rounded-full font-black shadow-2xs">15</span>
              </button>
              <button
                onClick={() => handleNavClick('content')}
                className="flex items-center justify-between w-full text-[#071B2B] hover:text-amber-700 font-bold transition-colors cursor-pointer text-left whitespace-nowrap"
              >
                <span>Maintenance &amp; Fixes</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-white text-[#F0B429] border border-slate-200 rounded-full font-black shadow-2xs">20</span>
              </button>

              <button
                onClick={() => handleNavClick('content')}
                className="block w-full text-slate-700 hover:text-[#071B2B] transition-colors cursor-pointer text-left font-medium whitespace-nowrap"
              >
                EV Buyer's Guide &amp; Policy
              </button>
              <button
                onClick={() => handleNavClick('blogs')}
                className="flex items-center justify-between w-full text-slate-700 hover:text-[#071B2B] transition-colors cursor-pointer text-left font-medium whitespace-nowrap"
              >
                <span>Blogs &amp; Insights</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-white text-cyan-600 rounded-full font-black shadow-2xs">40+</span>
              </button>
              <button
                onClick={() => handleNavClick('about')}
                className="block w-full text-slate-700 hover:text-[#071B2B] transition-colors cursor-pointer text-left font-medium whitespace-nowrap"
              >
                About Us &amp; Team
              </button>
              <button
                onClick={() => handleNavClick('contact')}
                className="block w-full text-slate-700 hover:text-[#071B2B] transition-colors cursor-pointer text-left font-medium whitespace-nowrap"
              >
                Contact Us &amp; Inquiries
              </button>
              <button
                onClick={() => handleNavClick('comparison')}
                className="block w-full text-slate-700 hover:text-[#071B2B] transition-colors cursor-pointer text-left font-medium whitespace-nowrap"
              >
                Compare Fleet
              </button>
            </div>
          </div>

        </div>

        {/* SECTION 2: DEVELOPER ATTRIBUTION & ORINEXAI SHOWCASE */}
        <div className="my-8 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-[#16A36A] flex items-center justify-center text-white font-black text-lg shadow-sm">
                HM
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A36A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#16A36A] border-2 border-white"></span>
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-semibold text-slate-600">Designed &amp; Developed by</span>
                <span className="font-black text-[#071B2B] text-base tracking-tight">
                  Hamdan Mirza
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#F5F8F6] text-[#16A36A] border border-slate-200 text-[10px] font-extrabold">
                  Lead Creator
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-normal">
                Specialized in high-performance modern web apps, smart calculative engines, and AI systems.
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-2 text-[11px]">
                <a 
                  href={`mailto:${HAMDAN_EMAIL}`}
                  className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#16A36A] transition-colors group font-semibold"
                  title="Send email to Hamdan Mirza"
                >
                  <Mail className="w-3.5 h-3.5 text-[#16A36A] group-hover:scale-110 transition-transform" />
                  <span>{HAMDAN_EMAIL}</span>
                </a>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <a 
                  href={`mailto:${ORINEX_EMAIL}`}
                  className="inline-flex items-center gap-1.5 text-slate-700 hover:text-cyan-600 transition-colors group font-semibold"
                  title="Send email to OrinexAI"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-600 group-hover:scale-110 transition-transform" />
                  <span>{ORINEX_EMAIL}</span>
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#16A36A] hover:bg-[#138e5b] text-white text-xs font-extrabold transition-all duration-200 shadow-xs cursor-pointer group"
              title="Chat with Hamdan Mirza on WhatsApp"
            >
              <svg className="w-4 h-4 fill-current group-hover:rotate-12 transition-transform" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.54 1.861.821 2.796.821h.005c3.179 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.768-5.773-5.768zm3.385 8.165c-.14.394-.716.748-1.026.797-.282.045-.648.077-2.083-.518-1.835-.761-3.003-2.617-3.094-2.738-.091-.121-.741-.986-.741-1.88 0-.895.469-1.336.636-1.517.167-.181.365-.227.487-.227.121 0 .243.002.349.007.112.005.263-.042.411.314.152.365.517 1.26.562 1.352.045.091.076.197.015.318-.061.121-.091.197-.182.303-.091.106-.192.237-.274.318-.091.091-.186.19-.08.372.106.182.471.777 1.011 1.258.697.621 1.285.813 1.468.904.182.091.289.076.395-.045.106-.121.456-.53.578-.712.121-.182.243-.152.41-.091.167.061 1.063.501 1.246.592.182.091.304.137.349.213.045.076.045.44-.095.834zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.168L2 22l4.98-1.385C8.423 21.503 10.151 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
              </svg>
              <span>WhatsApp Connect</span>
            </a>

            <a
              href={ORINEX_AI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#071B2B] hover:bg-[#071B2B]/90 text-white text-xs font-bold transition-all shadow-xs cursor-pointer group"
              title="Visit OrinexAI Website"
            >
              <div className="w-4 h-4 rounded-md bg-[#16A36A] flex items-center justify-center text-[10px] font-black text-white">
                O
              </div>
              <span>with <strong className="text-emerald-400 group-hover:text-emerald-300">OrinexAI</strong></span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
            </a>
          </div>

        </div>

        {/* SECTION 3: BOTTOM COPYRIGHT */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span>© 2026 <strong className="text-[#071B2B]">goinfoEV</strong>. All rights reserved.</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span>Pakistan EV Intelligence Suite</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-600 flex items-center gap-1 font-medium">
              Made in Pakistan 🇵🇰 for Sustainable Mobility
            </span>
            
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-[#071B2B] border border-slate-300 transition-all cursor-pointer shadow-2xs"
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
