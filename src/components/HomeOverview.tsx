import React, { useState, useMemo, useRef, useEffect } from 'react';
import { EV_MODELS, EVModel, formatPKR, getFullName } from '../data/evModels';
import { TabType } from './Navbar';
import { useSubscription } from '../context/SubscriptionContext';
import { 
  AnimatedBatteryCellSvg, 
  AnimatedMotorHubSvg, 
  AnimatedSolarPVSvg, 
  AnimatedEVBikeSvg 
} from './EVSvgIllustrations';
import { 
  Calculator, 
  Sun, 
  Gauge, 
  Zap, 
  ShieldCheck, 
  Bike, 
  Sliders, 
  ArrowRight, 
  Database, 
  CheckCircle2, 
  Search,
  SlidersHorizontal,
  BatteryCharging,
  TrendingUp,
  Flame,
  LayoutGrid,
  List,
  Sparkles,
  ArrowUpRight,
  Clock,
  RotateCcw,
  Info,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CreditCard
} from 'lucide-react';

interface HomeOverviewProps {
  onNavigate: (tab: TabType) => void;
  onSelectModelForTool?: (modelId: string, tool: TabType) => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({ onNavigate, onSelectModelForTool }) => {
  const { isSubscriber, isPending, remainingUses, freeUsesCount, maxFreeUses, openSubscriptionModal } = useSubscription();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [batteryFilter, setBatteryFilter] = useState('all');
  const [priceTier, setPriceTier] = useState('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'range-desc' | 'price-asc' | 'price-desc' | 'savings-desc'>('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Baseline Constants for simulation snapshot
  const monthlyKm = 1500;
  const petrolPrice = 280;
  const petrolAvg = 45; // 45 km/L
  const elecRate = 50; // PKR / kWh
  const efficiency = 0.85;
  const rangeAcc = 0.9;

  const petrolMonthlyCost = (monthlyKm / petrolAvg) * petrolPrice;

  // Extract unique brands and chemistries
  const brands = useMemo(() => {
    return ['all', ...Array.from(new Set(EV_MODELS.map(m => m.brand)))].sort();
  }, []);

  const batteryTypes = useMemo(() => {
    return [
      { id: 'all', label: 'All Batteries' },
      { id: 'lfp', label: 'Lithium LFP' },
      { id: 'graphene', label: 'Graphene' },
      { id: 'lead-acid', label: 'Lead Acid' },
      { id: 'nmc', label: 'Lithium NMC' },
    ];
  }, []);

  // Filter & Sort models
  const filteredModels = useMemo(() => {
    return EV_MODELS.filter(m => {
      // Brand match
      const matchesBrand = brandFilter === 'all' || m.brand === brandFilter;
      
      // Battery chemistry match
      const matchesBattery = batteryFilter === 'all' || 
        (batteryFilter === 'lfp' && (m.chemistry === 'lfp' || m.batteryType.toLowerCase().includes('lfp') || m.batteryType.toLowerCase().includes('lithium'))) ||
        (batteryFilter === 'graphene' && (m.chemistry === 'graphene' || m.batteryType.toLowerCase().includes('graphene'))) ||
        (batteryFilter === 'lead-acid' && (m.chemistry === 'lead-acid' || m.batteryType.toLowerCase().includes('lead') || m.batteryType.toLowerCase().includes('acid'))) ||
        (batteryFilter === 'nmc' && (m.chemistry === 'nmc' || m.batteryType.toLowerCase().includes('nmc')));

      // Price tier match
      const price = m.price || 0;
      let matchesPrice = true;
      if (priceTier === 'under-200k') matchesPrice = price < 200000;
      else if (priceTier === '200k-300k') matchesPrice = price >= 200000 && price <= 300000;
      else if (priceTier === '300k-400k') matchesPrice = price > 300000 && price <= 400000;
      else if (priceTier === 'above-400k') matchesPrice = price > 400000;

      // Search query
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = !query || 
        m.brand.toLowerCase().includes(query) || 
        m.model.toLowerCase().includes(query) || 
        (m.variant && m.variant.toLowerCase().includes(query)) ||
        (m.category && m.category.toLowerCase().includes(query)) ||
        m.batteryType.toLowerCase().includes(query) ||
        m.motor.toLowerCase().includes(query);

      return matchesBrand && matchesBattery && matchesPrice && matchesSearch;
    }).sort((a, b) => {
      const avgRangeA = ((a.rangeMin || 0) + (a.rangeMax || a.rangeMin || 0)) / 2;
      const avgRangeB = ((b.rangeMin || 0) + (b.rangeMax || b.rangeMin || 0)) / 2;
      
      if (sortBy === 'range-desc') return avgRangeB - avgRangeA;
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'savings-desc') {
        const savingsA = avgRangeA > 0 ? (a.batteryWh) : 0;
        const savingsB = avgRangeB > 0 ? (b.batteryWh) : 0;
        return savingsB - savingsA;
      }
      return 0; // recommended original order
    });
  }, [searchTerm, brandFilter, batteryFilter, priceTier, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setBrandFilter('all');
    setBatteryFilter('all');
    setPriceTier('all');
    setSortBy('recommended');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== '' || brandFilter !== 'all' || batteryFilter !== 'all' || priceTier !== 'all' || sortBy !== 'recommended';

  // Fleet Section Ref for smooth scrolling upon page changes
  const fleetSectionRef = useRef<HTMLDivElement>(null);

  // Pagination State for Pakistan EV Fleet Explorer
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6); // 6 cards gives clean 2 rows on desktop (3x2), 3 rows on tablet, 6 on mobile

  // Auto-reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, brandFilter, batteryFilter, priceTier, sortBy]);

  const totalFiltered = filteredModels.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFiltered);

  const paginatedModels = useMemo(() => {
    return filteredModels.slice(startIndex, endIndex);
  }, [filteredModels, startIndex, endIndex]);

  const goToPage = (pageNumber: number) => {
    const target = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(target);
    if (fleetSectionRef.current) {
      const yOffset = -75;
      const y = fleetSectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (validCurrentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (validCurrentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, '...', totalPages];
  };

  // Key KPI stats
  const totalModelsCount = EV_MODELS.length;
  const totalBrandsCount = brands.length - 1;
  const maxRangeModel = useMemo(() => {
    return [...EV_MODELS].sort((a, b) => (b.rangeMax || 0) - (a.rangeMax || 0))[0];
  }, []);

  const toolCards = [
    {
      id: 'savings' as TabType,
      title: 'Fuel Savings ROI',
      tag: 'EV vs Petrol',
      badge: 'High ROI',
      description: 'Compare petrol bike fuel costs vs EV power. Monthly & yearly net savings with breakeven timeline.',
      icon: <Calculator className="w-5 h-5 text-emerald-600" />,
      accent: 'emerald',
      bgGlow: 'from-emerald-500/10 to-transparent',
      borderColor: 'hover:border-emerald-500/60'
    },
    {
      id: 'range' as TabType,
      title: 'Range & Maps Estimator',
      tag: 'Live Physics',
      badge: 'Google Maps',
      description: 'Calculate realistic riding range based on passenger load, speed, terrain, tire pressure, and route elevation.',
      icon: <Gauge className="w-5 h-5 text-blue-600" />,
      accent: 'blue',
      bgGlow: 'from-blue-500/10 to-transparent',
      borderColor: 'hover:border-blue-500/60'
    },
    {
      id: 'charging' as TabType,
      title: 'Charging Cost & Tariffs',
      tag: 'WAPDA 2026',
      badge: 'Tariff Slabs',
      description: 'Analyze electric bills and per-full-charge costs using verified Pakistani residential and commercial slabs.',
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      accent: 'amber',
      bgGlow: 'from-amber-500/10 to-transparent',
      borderColor: 'hover:border-amber-500/60'
    },
    {
      id: 'solar' as TabType,
      title: 'Solar Optimizer',
      tag: 'Zero Fuel Cost',
      badge: 'Net Metering',
      description: 'Size solar PV systems and inverter capacities to achieve 100% free sunshine-powered electric mobility.',
      icon: <Sun className="w-5 h-5 text-yellow-500" />,
      accent: 'yellow',
      bgGlow: 'from-yellow-500/10 to-transparent',
      borderColor: 'hover:border-yellow-500/60'
    },
    {
      id: 'battery' as TabType,
      title: 'Battery Health & SOH',
      tag: 'Degradation Model',
      badge: 'LFP / Graphene',
      description: 'Track cycle lifespan, State of Health (SOH) retention, thermal stress, and replacement timelines.',
      icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
      accent: 'indigo',
      bgGlow: 'from-indigo-500/10 to-transparent',
      borderColor: 'hover:border-indigo-500/60'
    },
    {
      id: 'rider' as TabType,
      title: 'Rider & Delivery Profit',
      tag: 'Bykea / InDrive',
      badge: 'Gig Economy',
      description: 'Calculate net daily and monthly take-home earnings per trip after platform commission and energy cost.',
      icon: <Bike className="w-5 h-5 text-rose-600" />,
      accent: 'rose',
      bgGlow: 'from-rose-500/10 to-transparent',
      borderColor: 'hover:border-rose-500/60'
    },
    {
      id: 'comparison' as TabType,
      title: 'Product Matrix & Compare',
      tag: 'Side-by-Side',
      badge: '38 Bikes',
      description: 'Compare battery capacities, top speed, motor power, warranties, and pricing across multiple models.',
      icon: <Sliders className="w-5 h-5 text-violet-600" />,
      accent: 'violet',
      bgGlow: 'from-violet-500/10 to-transparent',
      borderColor: 'hover:border-violet-500/60'
    },
    {
      id: 'products' as TabType,
      title: 'EV Fleet Catalog',
      tag: 'Verified Specs',
      badge: 'Official Datasheets',
      description: 'Detailed specification sheets, motor variants, braking systems, and genuine warranty terms.',
      icon: <Database className="w-5 h-5 text-cyan-600" />,
      accent: 'cyan',
      bgGlow: 'from-cyan-500/10 to-transparent',
      borderColor: 'hover:border-cyan-500/60'
    },
    {
      id: 'charging-stations' as TabType,
      title: 'EV Charging Stations',
      tag: 'Pakistan Nationwide',
      badge: 'Fast DC & Motorways',
      description: 'Find verified Fast DC & AC chargers across M-2, M-3, M-5, M-9, GT Road, Karachi, Lahore, Islamabad & 15+ cities.',
      icon: <Zap className="w-5 h-5 text-emerald-600" />,
      accent: 'emerald',
      bgGlow: 'from-emerald-500/10 to-transparent',
      borderColor: 'hover:border-emerald-500/60'
    }
  ];

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. PREMIUM LIGHT AUTOMOTIVE EV HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-[#F5F8F6] p-6 sm:p-12 lg:p-14 border border-slate-200/90 shadow-xs min-h-[480px] sm:min-h-[520px] flex flex-col justify-between">
        {/* Soft Ambient Glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#16A36A]/12 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#F0B429]/12 blur-3xl pointer-events-none"></div>

        {/* Subtle Background EV Overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 z-0 pointer-events-none opacity-20 overflow-hidden rounded-r-3xl">
          <img 
            src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&auto=format&fit=crop&q=80" 
            alt="EV Background" 
            className="w-full h-full object-cover object-center filter grayscale mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F5F8F6] via-[#F5F8F6]/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-2xl space-y-5 text-left">
          {/* Status Pill Tag */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-bold text-[#071B2B]">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A36A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A36A]"></span>
            </span>
            <span>2026 COLLECTION — NOW AVAILABLE</span>
            <span className="text-slate-300">|</span>
            <span className="text-[#16A36A]">157+ Verified Models</span>
          </div>

          {/* Big Headline in Deep Navy & Electric Green */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#071B2B]">
            The Future <br />
            <span className="text-[#16A36A]">
              Drives Now.
            </span>
          </h1>

          {/* Subtitle Description */}
          <p className="text-slate-600 text-sm sm:text-base max-w-xl leading-relaxed font-normal">
            Experience the next generation of electric performance in Pakistan. Zero emissions. Infinite possibilities. Engineered for those who demand more.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button 
              onClick={() => {
                if (fleetSectionRef.current) {
                  fleetSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                } else {
                  onNavigate('products');
                }
              }}
              className="px-7 py-3.5 rounded-full bg-[#16A36A] hover:bg-[#138a59] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#16A36A]/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer"
            >
              <span>Explore Models</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button 
              onClick={() => onNavigate('comparison')}
              className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 text-[#071B2B] border border-slate-200 shadow-xs hover:border-[#16A36A]/40 text-sm sm:text-base font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-[#16A36A]" />
              <span>Compare Bikes</span>
            </button>
          </div>
        </div>

        {/* Bottom Floating Stats Cards Row in Pure White */}
        <div className="relative z-10 pt-8 sm:pt-12 grid grid-cols-3 gap-3 sm:gap-4 max-w-xl">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs hover:border-[#16A36A]/40 transition-colors">
            <div className="text-2xl sm:text-4xl font-black text-[#071B2B] tracking-tight flex items-baseline gap-1">
              <span>{maxRangeModel?.rangeMax || 180}</span>
              <span className="text-xs sm:text-sm font-bold text-[#16A36A]">km</span>
            </div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">
              MAX RANGE
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs hover:border-[#16A36A]/40 transition-colors">
            <div className="text-2xl sm:text-4xl font-black text-[#071B2B] tracking-tight flex items-baseline gap-1">
              <span>4.2</span>
              <span className="text-xs sm:text-sm font-bold text-[#16A36A]">s</span>
            </div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">
              0-50 KM/H
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs hover:border-[#16A36A]/40 transition-colors">
            <div className="text-2xl sm:text-4xl font-black text-[#071B2B] tracking-tight flex items-baseline gap-1">
              <span>90</span>
              <span className="text-xs sm:text-sm font-bold text-[#16A36A]">kph</span>
            </div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">
              TOP SPEED
            </div>
          </div>
        </div>
      </section>

      {/* AI BOT ASSISTANT BANNER */}
      <section className="bg-[#071B2B] text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-[#172B3A] relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#16A36A]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16A36A]/20 text-[#16A36A] text-xs font-bold border border-[#16A36A]/30">
              <div className="relative flex items-center justify-center">
                <Bike className="w-3.5 h-3.5 text-[#16A36A]" />
                <Zap className="w-2 h-2 text-[#F0B429] fill-[#F0B429] absolute -top-1 -right-1" />
              </div>
              <span>Automated EV Scooty AI Consultant • 24/7 Live</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Get Instant Answers to All Your EV Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Have questions about EV scooty &amp; bike prices, battery warranty (LFP vs Graphene), K-Electric charging bills, or fuel savings? Ask our smart EV Scooty assistant anytime!
            </p>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-ev-bot', { detail: {} }));
              }}
              className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-[#16A36A] hover:bg-[#138e5b] text-white font-extrabold text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-[#16A36A]"
            >
              <div className="relative flex items-center justify-center">
                <Bike className="w-4 h-4 text-white" />
                <Zap className="w-2.5 h-2.5 text-[#F0B429] fill-[#F0B429] absolute -top-1 -right-1.5" />
              </div>
              <span>Ask EV Scooty Bot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Click Prompts */}
        <div className="mt-4 pt-3 border-t border-[#172B3A] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Popular questions:</span>
          {[
            { label: '🛵 Best bike in Pakistan?', q: 'Which EV bike has the best range and build quality in Pakistan?' },
            { label: '💰 Petrol savings per month?', q: 'How much money can I save monthly compared to a 70cc petrol bike?' },
            { label: '⚡ K-Electric charging cost?', q: 'What is the electricity cost and units consumed for one full charge?' },
            { label: '🔋 LFP vs Graphene battery?', q: 'What is the difference between LFP and Graphene batteries?' },
            { label: '⚡ Motorway charging stations?', q: 'Where are EV fast charging stations located on M-2 Motorway and major cities in Pakistan?' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-ev-bot', { detail: { query: item.q } }));
              }}
              className="text-xs shrink-0 bg-[#172B3A] hover:bg-[#16A36A]/20 text-slate-200 hover:text-white border border-slate-700 hover:border-[#16A36A] px-3 py-1 rounded-full transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          2. CORE INTERACTIVE ENGINES & TOOLS (8 CARDS)
      ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Interactive Engines &amp; Analytical Tools
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Launch dedicated calculation engines customized for Pakistani road conditions and power tariffs.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" /> 8 Powerful Tools
          </span>
        </div>

        {/* Subscription & Free Uses Status Bar */}
        <div className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isSubscriber
            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-950'
            : isPending
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 border-blue-200 text-slate-900'
        }`}>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className={`p-2 rounded-xl text-white shrink-0 ${
              isSubscriber ? 'bg-emerald-600' : isPending ? 'bg-amber-500' : 'bg-blue-600'
            }`}>
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black">
                  {isSubscriber ? 'VIP Unlimited Access Active' : isPending ? 'Subscription Request Pending Review' : 'Calculator Free Trial'}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  isSubscriber 
                    ? 'bg-emerald-200 text-emerald-900' 
                    : isPending
                    ? 'bg-amber-200 text-amber-900'
                    : remainingUses === 0 
                    ? 'bg-rose-100 text-rose-700' 
                    : 'bg-blue-200 text-blue-900'
                }`}>
                  {isSubscriber ? 'All Tools Unlocked' : isPending ? 'Verification in Progress' : `${remainingUses} of ${maxFreeUses} Total Uses Remaining`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isSubscriber 
                  ? 'Enjoy unrestricted calculations on range, charging bills, solar sizing, and rider profits.'
                  : isPending
                  ? 'Admin is verifying your transaction ID. Calculators will unlock once approved.'
                  : 'Visitors get 7 total free tool uses combined across the suite (not 7 per tool). Afterwards, subscribe for PKR 499/mo.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => openSubscriptionModal()}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{isSubscriber ? 'View Subscription' : 'Upgrade to VIP Pro'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {toolCards.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onNavigate(tool.id)}
              className={`group text-left bg-white border border-slate-200/90 ${tool.borderColor} rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 flex flex-col justify-between cursor-pointer relative overflow-hidden`}
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-100/90 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    {tool.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {tool.badge}
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 mb-0.5">
                    {tool.tag}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-blue-600">
                <span>Launch Engine</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </button>
          ))}
        </div>
      </section>


      {/* ───────────────────────────────────────────────────────────
          3. FLEET SHOWCASE WITH RICH INTERACTIVE FILTERS
      ──────────────────────────────────────────────────────────── */}
      <section ref={fleetSectionRef} id="fleet-explorer" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xs space-y-6 scroll-mt-24">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Pakistan EV Fleet Explorer
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {filteredModels.length} of {totalModelsCount} Bikes
              </span>
              {totalPages > 1 && (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                  Page {validCurrentPage} of {totalPages}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Filter by manufacturer, battery chemistry (LFP, Graphene, NMC), and price tier with live savings calculation.
            </p>
          </div>

          {/* View Mode Toggle (Grid vs Table) */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────
            RICH FILTER TOOLBAR
        ─────────────────────────────────────────────── */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3.5">
          
          {/* Row 1: Search & Brand Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search model, brand, motor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white bg-white/80 transition-all text-slate-800"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Manufacturer / Company Filter */}
            <div>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                aria-label="Filter by Company / Brand"
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl outline-none focus:border-blue-600 bg-white text-slate-800 cursor-pointer"
              >
                <option value="all">🏢 All Companies ({totalBrandsCount} Brands)</option>
                {brands.filter(b => b !== 'all').map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Battery Chemistry Filter */}
            <div>
              <select
                value={batteryFilter}
                onChange={(e) => setBatteryFilter(e.target.value)}
                aria-label="Filter by Battery Chemistry"
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl outline-none focus:border-blue-600 bg-white text-slate-800 cursor-pointer"
              >
                {batteryTypes.map(type => (
                  <option key={type.id} value={type.id}>🔋 {type.label}</option>
                ))}
              </select>
            </div>

            {/* Price Tier Filter */}
            <div>
              <select
                value={priceTier}
                onChange={(e) => setPriceTier(e.target.value)}
                aria-label="Filter by Price Tier"
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl outline-none focus:border-blue-600 bg-white text-slate-800 cursor-pointer"
              >
                <option value="all">💵 All Price Ranges</option>
                <option value="under-200k">Under PKR 200,000</option>
                <option value="200k-300k">PKR 200,000 - 300,000</option>
                <option value="300k-400k">PKR 300,000 - 400,000</option>
                <option value="above-400k">Above PKR 400,000</option>
              </select>
            </div>

          </div>

          {/* Row 2: Sort By & Quick Brand Chips */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
            
            {/* Quick Brand Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider mr-1 shrink-0">
                Top Brands:
              </span>
              {['all', 'Crown Electric', 'Yadea', 'Metro E&V', 'Jinpeng', 'Evee', 'MS Jaguar'].map((brand) => (
                <button
                  key={brand}
                  onClick={() => setBrandFilter(brand)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    brandFilter === brand
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  {brand === 'all' ? 'All' : brand}
                </button>
              ))}
            </div>

            {/* Sort & Reset Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Sort models by"
                  className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-xs"
                >
                  <option value="recommended">Sort: Recommended</option>
                  <option value="range-desc">Sort: Highest Range</option>
                  <option value="price-asc">Sort: Price (Low to High)</option>
                  <option value="price-desc">Sort: Price (High to Low)</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* ──────────────────────────────────────────────
            VIEW 1: MODERN CARD GRID VIEW
        ─────────────────────────────────────────────── */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedModels.map((ev) => {
              const avgRefRange = ((ev.rangeMin || 0) + (ev.rangeMax || ev.rangeMin || 0)) / 2;
              const realRange = avgRefRange * rangeAcc;
              const unitsToFull = (ev.batteryWh / 1000) / efficiency;
              const unitsPerKm = unitsToFull / Math.max(1, realRange);
              const evMonthlyCost = monthlyKm * unitsPerKm * elecRate;
              const monthlySavings = Math.max(0, petrolMonthlyCost - evMonthlyCost);
              const breakevenMonths = monthlySavings > 0 ? Math.ceil((ev.price || 250000) / monthlySavings) : 999;

              // Color badge by chemistry
              const isLFP = ev.batteryType.toLowerCase().includes('lfp') || ev.chemistry === 'lfp';
              const isGraphene = ev.batteryType.toLowerCase().includes('graphene') || ev.chemistry === 'graphene';

              return (
                <div
                  key={ev.id}
                  className="bg-white border border-slate-200 hover:border-blue-500/60 rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between relative group"
                >
                  {/* Top Metadata */}
                  <div>
                    {/* Vehicle Photo or Animated SVG Vector Graphics */}
                    <div className="relative w-full h-36 mb-3 bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-100 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center p-2 group-hover:border-blue-300 transition-colors">
                      {ev.image ? (
                        <img
                          src={ev.image}
                          alt={getFullName(ev)}
                          className="max-h-full max-w-full object-contain filter drop-shadow-xs group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const fallback = parent.querySelector('.svg-bike-fallback');
                              if (fallback) fallback.classList.remove('hidden');
                            }
                          }}
                        />
                      ) : null}
                      <div className={`svg-bike-fallback ${ev.image ? 'hidden' : 'block'} w-full h-full flex items-center justify-center`}>
                        <AnimatedEVBikeSvg className="w-full h-28 text-blue-600" />
                      </div>
                      
                      {/* Floating Speed & Battery Badge */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[9px] font-bold text-slate-700 border border-slate-200 shadow-2xs flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                        <span>{ev.topSpeed || 'EV'}</span>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                            {ev.brand}
                          </span>
                          {ev.category && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {ev.category}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-black text-slate-900 leading-tight mt-0.5">
                          {ev.model} {ev.variant ? `(${ev.variant})` : ''}
                        </h3>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                        isLFP 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : isGraphene 
                          ? 'bg-purple-50 text-purple-800 border-purple-200' 
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {isLFP ? 'Lithium LFP' : isGraphene ? 'Graphene' : ev.chemistry || 'Battery'}
                      </span>
                    </div>

                    {/* Price & Motor Tag */}
                    <div className="flex items-baseline justify-between pt-1 pb-3 border-b border-slate-100">
                      <div className="text-lg font-black text-slate-900">
                        {formatPKR(ev.price)}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 truncate max-w-[150px]">
                        {ev.motor}
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 py-3 text-center bg-slate-50/80 rounded-xl my-3 border border-slate-100">
                      <div>
                        <span className="text-[9px] uppercase font-extrabold text-slate-600 block">Est Range</span>
                        <span className="text-xs font-bold text-blue-600">~{Math.round(realRange)} km</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-extrabold text-slate-600 block">Top Speed</span>
                        <span className="text-xs font-bold text-slate-800">{ev.topSpeed}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-extrabold text-slate-600 block">Capacity</span>
                        <span className="text-xs font-bold text-slate-800">{(ev.batteryWh / 1000).toFixed(1)} kWh</span>
                      </div>
                    </div>

                    {/* Monthly Savings Highlight */}
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs mb-3">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 block">Monthly Petrol Save</span>
                        <span className="text-sm font-black text-emerald-700">
                          Rs {Math.round(monthlySavings).toLocaleString('en-PK')}/mo
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-emerald-600 block">Breakeven</span>
                        <span className="text-xs font-extrabold text-emerald-800">{breakevenMonths} Months</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        if (onSelectModelForTool) onSelectModelForTool(ev.id, 'range');
                        else onNavigate('range');
                      }}
                      className="w-full py-2 px-2 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Gauge className="w-3.5 h-3.5" />
                      <span>Simulate</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onSelectModelForTool) onSelectModelForTool(ev.id, 'savings');
                        else onNavigate('savings');
                      }}
                      className="w-full py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>ROI Savings</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* ──────────────────────────────────────────────
            VIEW 2: DATA-DENSE COMPARISON TABLE
        ─────────────────────────────────────────────── */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5 font-extrabold">Model &amp; Manufacturer</th>
                  <th className="p-3.5 font-extrabold">Battery Chemistry</th>
                  <th className="p-3.5 font-extrabold">Capacity</th>
                  <th className="p-3.5 font-extrabold">Real Range</th>
                  <th className="p-3.5 font-extrabold">Top Speed</th>
                  <th className="p-3.5 font-extrabold">Retail Price</th>
                  <th className="p-3.5 font-extrabold">Fuel Savings</th>
                  <th className="p-3.5 font-extrabold">Breakeven</th>
                  <th className="p-3.5 text-right font-extrabold">Quick Tools</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {paginatedModels.map((ev) => {
                  const avgRefRange = ((ev.rangeMin || 0) + (ev.rangeMax || ev.rangeMin || 0)) / 2;
                  const realRange = avgRefRange * rangeAcc;
                  const unitsToFull = (ev.batteryWh / 1000) / efficiency;
                  const unitsPerKm = unitsToFull / Math.max(1, realRange);
                  const evMonthlyCost = monthlyKm * unitsPerKm * elecRate;
                  const savings = Math.max(0, petrolMonthlyCost - evMonthlyCost);
                  const price = ev.price || 250000;
                  const breakevenMonths = savings > 0 ? Math.ceil(price / savings) : 999;

                  return (
                    <tr key={ev.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">
                        <div>{getFullName(ev)}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{ev.motor}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {ev.batteryType}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">{ev.batteryWh} Wh</td>
                      <td className="p-3.5 font-black text-blue-600">~{Math.round(realRange)} km</td>
                      <td className="p-3.5 font-medium text-slate-700">{ev.topSpeed}</td>
                      <td className="p-3.5 font-black text-slate-900">{formatPKR(ev.price)}</td>
                      <td className="p-3.5 font-black text-emerald-600">
                        Rs {Math.round(savings).toLocaleString('en-PK')}
                      </td>
                      <td className="p-3.5 font-bold text-amber-700">{breakevenMonths} Mo</td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              if (onSelectModelForTool) onSelectModelForTool(ev.id, 'range');
                              else onNavigate('range');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                            title="Simulate Range"
                          >
                            Range
                          </button>
                          <button
                            onClick={() => {
                              if (onSelectModelForTool) onSelectModelForTool(ev.id, 'savings');
                              else onNavigate('savings');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                            title="Calculate Savings"
                          >
                            Savings
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ──────────────────────────────────────────────
            PAGINATION CONTROLS (MOBILE & DESKTOP)
        ─────────────────────────────────────────────── */}
        {filteredModels.length > 0 && (
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Left: Summary & Per-Page selector */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs text-slate-600">
              <span>
                Showing <span className="font-extrabold text-slate-900">{startIndex + 1}</span>–
                <span className="font-extrabold text-slate-900">{endIndex}</span> of{' '}
                <span className="font-extrabold text-slate-900">{filteredModels.length}</span> bikes
              </span>

              <span className="hidden sm:inline text-slate-300">|</span>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Bikes per page:</span>
                {[6, 9, 12, 18].map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setItemsPerPage(size);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      itemsPerPage === size
                        ? 'bg-blue-600 text-white shadow-xs font-black'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Page Navigation Buttons */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {/* First Page */}
                <button
                  onClick={() => goToPage(1)}
                  disabled={validCurrentPage === 1}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="First Page"
                  aria-label="First page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous Page */}
                <button
                  onClick={() => goToPage(validCurrentPage - 1)}
                  disabled={validCurrentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xs font-bold transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 px-1">
                  {getPageNumbers().map((p, idx) => {
                    if (p === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400 text-xs font-bold">
                          …
                        </span>
                      );
                    }
                    const isCurrent = p === validCurrentPage;
                    return (
                      <button
                        key={`page-${p}`}
                        onClick={() => goToPage(p as number)}
                        className={`min-w-[34px] h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-xs font-black ring-2 ring-blue-600/20'
                            : 'text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                {/* Next Page */}
                <button
                  onClick={() => goToPage(validCurrentPage + 1)}
                  disabled={validCurrentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xs font-bold transition-colors"
                  aria-label="Next page"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last Page */}
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={validCurrentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Last Page"
                  aria-label="Last page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        )}

        {/* Empty State */}
        {filteredModels.length === 0 && (
          <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No EV models match your filter criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try resetting the company name, price range, or battery chemistry filter to view available electric bikes.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}

      </section>

    </div>
  );
};

export default HomeOverview;
