import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Database, 
  Gauge, 
  Zap, 
  ShieldCheck, 
  Calculator, 
  Sun, 
  Bike, 
  SlidersHorizontal, 
  Sparkles, 
  Menu, 
  X, 
  ChevronRight, 
  TrendingUp, 
  BookOpen, 
  FileText, 
  Info,
  Mail,
  Lock,
  User
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useCatalog } from '../context/CatalogContext';
import { PWAInstallButton } from './PWAInstallButton';

export type TabType = 
  | 'home'
  | 'charging-stations'
  | 'products'
  | 'comparison'
  | 'range'
  | 'charging'
  | 'battery'
  | 'savings'
  | 'solar'
  | 'rider'
  | 'blogs'
  | 'content'
  | 'about'
  | 'contact'
  | 'admin'
  | 'user-dashboard';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalCount } = useCatalog();
  const { 
    user, 
    isSubscriber, 
    isPending, 
    remainingUses, 
    openSubscriptionModal 
  } = useSubscription();

  const mobileQuickNavRef = useRef<HTMLDivElement>(null);
  const [mobileQuickScroll, setMobileQuickScroll] = useState({ left: 0, width: 35 });

  const homeToolsNavRef = useRef<HTMLDivElement>(null);
  const [homeToolsScroll, setHomeToolsScroll] = useState({ left: 0, width: 25 });

  const updateMobileQuickScroll = () => {
    if (!mobileQuickNavRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = mobileQuickNavRef.current;
    if (scrollWidth <= clientWidth) {
      setMobileQuickScroll({ left: 0, width: 100 });
      return;
    }
    const ratio = clientWidth / scrollWidth;
    const thumbWidth = Math.max(22, Math.round(ratio * 100));
    const maxScrollLeft = scrollWidth - clientWidth;
    const scrollPercent = maxScrollLeft > 0 ? scrollLeft / maxScrollLeft : 0;
    const leftPos = scrollPercent * (100 - thumbWidth);
    setMobileQuickScroll({ left: leftPos, width: thumbWidth });
  };

  const updateHomeToolsScroll = () => {
    if (!homeToolsNavRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = homeToolsNavRef.current;
    if (scrollWidth <= clientWidth) {
      setHomeToolsScroll({ left: 0, width: 100 });
      return;
    }
    const ratio = clientWidth / scrollWidth;
    const thumbWidth = Math.max(18, Math.round(ratio * 100));
    const maxScrollLeft = scrollWidth - clientWidth;
    const scrollPercent = maxScrollLeft > 0 ? scrollLeft / maxScrollLeft : 0;
    const leftPos = scrollPercent * (100 - thumbWidth);
    setHomeToolsScroll({ left: leftPos, width: thumbWidth });
  };

  const handleQuickNavTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mobileQuickNavRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const maxScroll = mobileQuickNavRef.current.scrollWidth - mobileQuickNavRef.current.clientWidth;
    mobileQuickNavRef.current.scrollTo({ left: ratio * maxScroll, behavior: 'smooth' });
  };

  const handleToolsTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!homeToolsNavRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const maxScroll = homeToolsNavRef.current.scrollWidth - homeToolsNavRef.current.clientWidth;
    homeToolsNavRef.current.scrollTo({ left: ratio * maxScroll, behavior: 'smooth' });
  };

  useEffect(() => {
    updateMobileQuickScroll();
    updateHomeToolsScroll();

    window.addEventListener('resize', updateMobileQuickScroll);
    window.addEventListener('resize', updateHomeToolsScroll);

    return () => {
      window.removeEventListener('resize', updateMobileQuickScroll);
      window.removeEventListener('resize', updateHomeToolsScroll);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 75) {
        setIsScrolled(true);
      } else if (scrollY < 35) {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: TabType; label: string; shortLabel: string; icon: React.ReactNode; badge?: string; desc: string }[] = [
    { id: 'savings', label: 'Fuel Savings', shortLabel: 'Savings', icon: <Calculator className="w-4 h-4 text-[#16A36A]" />, badge: 'ROI', desc: 'EV vs Petrol Fuel Savings' },
    { id: 'range', label: 'Range Estimator', shortLabel: 'Range', icon: <Gauge className="w-4 h-4 text-emerald-300" />, desc: 'Real-world Range & Route Estimator' },
    { id: 'charging', label: 'Charging Cost', shortLabel: 'Charging', icon: <Zap className="w-4 h-4 text-[#F0B429]" />, desc: 'WAPDA Tariffs & Unit Cost' },
    { id: 'solar', label: 'Solar Power', shortLabel: 'Solar', icon: <Sun className="w-4 h-4 text-[#F0B429]" />, desc: 'Solar Panel Sizing & Zero Cost' },
    { id: 'battery', label: 'Battery Health', shortLabel: 'Battery', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, desc: 'Degradation & Lifespan Tracker' },
    { id: 'rider', label: 'Rider Profit', shortLabel: 'Rider Calc', icon: <Bike className="w-4 h-4 text-amber-400" />, badge: 'Gig App', desc: 'Bykea/Indrive/Foodpanda Earnings' },
    { id: 'comparison', label: 'Compare Bikes', shortLabel: 'Compare', icon: <SlidersHorizontal className="w-4 h-4 text-amber-400" />, desc: 'Side-by-side Specs & Pricing' },
    { id: 'products', label: 'Fleet Catalog', shortLabel: 'Catalog', icon: <Database className="w-4 h-4 text-emerald-400" />, badge: '38 Bikes', desc: 'Browse 38+ Electric Scooters' },
  ];

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isHome = activeTab === 'home';

  const desktopNavItems: { id: TabType; label: string; shortLabel: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Home', shortLabel: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'products', label: 'Fleet Catalog', shortLabel: 'Catalog', icon: <Database className="w-4 h-4 text-[#16A36A]" />, badge: `${totalCount}` },
    { id: 'content', label: 'EV Guides', shortLabel: 'Guides', icon: <BookOpen className="w-4 h-4 text-emerald-400" /> },
    { id: 'blogs', label: 'Blogs & Insights', shortLabel: 'Blogs', icon: <FileText className="w-4 h-4 text-cyan-400" />, badge: '40+' },
    { id: 'about', label: 'About Us', shortLabel: 'About', icon: <Info className="w-4 h-4 text-slate-300" /> },
    { id: 'contact', label: 'Contact Us', shortLabel: 'Contact', icon: <Mail className="w-4 h-4 text-[#16A36A]" /> },
    { id: 'admin', label: 'Admin Portal', shortLabel: 'Admin', icon: <Lock className="w-4 h-4 text-[#F0B429]" />, badge: 'CSV' },
  ];

  const mobileBarItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-3.5 h-3.5 text-[#16A36A]" /> },
    { id: 'user-dashboard', label: user ? 'Dashboard' : 'Login', icon: <User className="w-3.5 h-3.5 text-[#16A36A]" />, badge: user ? 'My' : 'Sign In' },
    { id: 'products', label: 'Catalog', icon: <Database className="w-3.5 h-3.5 text-emerald-400" />, badge: `${totalCount}` },
    { id: 'content', label: 'Guides', icon: <BookOpen className="w-3.5 h-3.5 text-emerald-300" /> },
    { id: 'blogs', label: 'Blogs', icon: <FileText className="w-3.5 h-3.5 text-cyan-300" />, badge: '40+' },
    { id: 'about', label: 'About', icon: <Info className="w-3.5 h-3.5 text-slate-300" /> },
    { id: 'admin', label: 'Admin', icon: <Lock className="w-3.5 h-3.5 text-[#F0B429]" />, badge: 'CSV' },
  ];

  const firstMenuItems: { 
    id: TabType; 
    label: string; 
    desc: string; 
    icon: React.ReactNode; 
    badge?: string; 
  }[] = [
    { id: 'home', label: 'Home', desc: 'Main welcome dashboard & fleet overview', icon: <Home className="w-4 h-4 text-[#16A36A]" /> },
    { id: 'products', label: 'Fleet Catalog', desc: `Browse ${totalCount}+ verified EV motorcycle models in Pakistan`, icon: <Database className="w-4 h-4 text-[#16A36A]" />, badge: `${totalCount} Models` },
    { id: 'content', label: 'EV Buyer Guides & FAQs', desc: 'Pre-purchase checklist, battery tips & home wiring', icon: <BookOpen className="w-4 h-4 text-emerald-400" /> },
    { id: 'blogs', label: 'Blogs & Insights', desc: '40+ in-depth EV technology, repair & tariff articles', icon: <FileText className="w-4 h-4 text-cyan-400" />, badge: '40+' },
    { id: 'about', label: 'About Us & Creator', desc: 'Hamdan Mirza & OrinexAI partnership details', icon: <Info className="w-4 h-4 text-slate-300" /> },
    { id: 'contact', label: 'Contact Us', desc: 'Direct WhatsApp (+92 303 6001701) & inquiry form', icon: <Mail className="w-4 h-4 text-[#16A36A]" /> },
    { id: 'admin', label: 'Admin Portal', desc: 'CSV Product Fleet Manager, Users & Payment settings', icon: <Lock className="w-4 h-4 text-[#F0B429]" />, badge: 'CSV / Pin' },
  ];

  const calculatorItems: { 
    id: TabType; 
    label: string; 
    desc: string; 
    icon: React.ReactNode; 
    badge?: string; 
  }[] = [
    { id: 'savings', label: 'Fuel Savings Calculator', desc: 'EV vs Petrol Fuel Savings & ROI', icon: <Calculator className="w-4 h-4 text-[#16A36A]" />, badge: 'ROI' },
    { id: 'range', label: 'Range & Route Estimator', desc: 'Real-world Range & Google Maps Route', icon: <Gauge className="w-4 h-4 text-emerald-400" /> },
    { id: 'charging', label: 'Charging Cost Calculator', desc: 'WAPDA Tariffs, Slabs & Charging Bill', icon: <Zap className="w-4 h-4 text-[#F0B429]" /> },
    { id: 'battery', label: 'Battery SOH & Lifespan', desc: 'LFP/Graphene degradation & cycle life tracker', icon: <ShieldCheck className="w-4 h-4 text-emerald-300" /> },
    { id: 'solar', label: 'Solar Power Calculator', desc: 'Solar Panel Sizing & Zero Unit Cost', icon: <Sun className="w-4 h-4 text-[#F0B429]" /> },
    { id: 'rider', label: 'Rider Profit Calculator', desc: 'Bykea, InDrive & Foodpanda Net Earnings', icon: <Bike className="w-4 h-4 text-amber-400" />, badge: 'Gig App' },
    { id: 'comparison', label: 'Side-by-Side Comparison', desc: 'Compare up to 6 models side-by-side', icon: <SlidersHorizontal className="w-4 h-4 text-[#16A36A]" /> },
  ];

  const renderDesktopNavButton = (item: {
    id: TabType;
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
    badge?: string;
  }) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => handleTabClick(item.id)}
        className={`group relative flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs xl:text-sm font-extrabold transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap border ${
          isActive
            ? 'bg-[#16A36A] text-white border-[#16A36A] shadow-sm'
            : 'bg-white text-[#071B2B] hover:text-[#16A36A] hover:bg-slate-100 border-[#071B2B]/25 shadow-2xs'
        }`}
        title={item.label}
      >
        <div className={`transition-transform duration-200 shrink-0 ${
          isActive ? 'text-white scale-105' : 'text-[#16A36A] group-hover:scale-105'
        }`}>
          {item.icon}
        </div>

        <span className="tracking-tight whitespace-nowrap">
          <span className="hidden xl:inline">{item.label}</span>
          <span className="xl:hidden">{item.shortLabel}</span>
        </span>

        {item.badge && (
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black shrink-0 border ${
            isActive ? 'bg-white text-[#071B2B] border-white' : 'bg-[#F5F8F6] text-[#071B2B] border-[#071B2B]/25'
          }`}>
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-[#F5F8F6] text-[#071B2B] border-b border-slate-300/90 shadow-xs transition-all duration-300 w-full max-w-full overflow-x-clip">
      
      {/* ROW 1: DESKTOP & MOBILE MAIN NAV HEADER */}
      <div className={`bg-[#F5F8F6] relative px-3 sm:px-5 lg:px-6 xl:px-8 ${isScrolled ? 'py-1.5 sm:py-2' : 'py-2.5 sm:py-3'} transition-all w-full max-w-full overflow-x-clip border-b border-slate-300/80`}>
        <div className="max-w-7xl mx-auto w-full">
          
          {/* Desktop Layout (lg: 1024px+) */}
          <div className="hidden lg:flex items-center justify-between gap-2 xl:gap-3.5 w-full min-h-[44px]">
            {/* Left: Brand Logo */}
            <div className="flex items-center shrink-0">
              <button 
                onClick={() => handleTabClick('home')}
                className="flex items-center group cursor-pointer focus:outline-none select-none transition-transform active:scale-95 py-0.5"
                title="goinfoEV - Return to Home"
              >
                <span className="font-extrabold text-2xl xl:text-3xl tracking-tight text-[#071B2B] whitespace-nowrap">
                  goinfo<span className="text-[#16A36A] font-black">EV</span>
                </span>
              </button>
            </div>

            {/* Center: Main Navigation Links */}
            <nav className="flex items-center justify-center gap-1.5 xl:gap-2 flex-nowrap">
              {desktopNavItems.map((item) => renderDesktopNavButton(item))}
            </nav>

            {/* Right: User Dashboard & VIP Subscription CTA */}
            <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
              {user ? (
                <button
                  onClick={() => handleTabClick('user-dashboard')}
                  className={`px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                    activeTab === 'user-dashboard'
                      ? 'bg-[#16A36A] text-white border-[#16A36A]'
                      : 'bg-white text-[#071B2B] hover:bg-slate-100 border-[#071B2B]/25 shadow-2xs'
                  }`}
                  title={`Logged in as ${user.identifier} - View Dashboard`}
                >
                  <div className="w-2 h-2 rounded-full bg-[#16A36A] ring-2 ring-emerald-300 animate-pulse"></div>
                  <User className="w-3.5 h-3.5 text-[#16A36A]" />
                  <span className="max-w-[80px] xl:max-w-[120px] truncate">{user.identifier}</span>
                </button>
              ) : (
                <button
                  onClick={() => openSubscriptionModal('auth')}
                  className="px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 bg-white text-[#071B2B] hover:bg-slate-100 hover:text-[#16A36A] border border-[#071B2B]/25 shadow-2xs"
                  title="Sign In or Register"
                >
                  <User className="w-3.5 h-3.5 text-[#16A36A]" />
                  <span className="hidden xl:inline">Login / Register</span>
                  <span className="xl:hidden">Login</span>
                </button>
              )}

              {/* VIP Subscription CTA */}
              <button
                onClick={() => openSubscriptionModal('pay')}
                className={`px-3 xl:px-3.5 py-1.5 xl:py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0 ${
                  isSubscriber
                    ? 'bg-[#16A36A] text-white hover:bg-[#138e5b]'
                    : isPending
                    ? 'bg-[#F0B429] text-[#071B2B] hover:bg-amber-400 font-extrabold'
                    : 'bg-[#16A36A] hover:bg-[#138e5b] text-white'
                }`}
                title={isSubscriber ? 'VIP Unlimited Access' : `Global Free Quota: ${remainingUses} of 7 total uses remaining`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">
                  {isSubscriber ? (
                    'VIP Active'
                  ) : isPending ? (
                    'Pending'
                  ) : (
                    <>
                      <span className="hidden xl:inline">{`Pro (${remainingUses}/7 Free)`}</span>
                      <span className="xl:hidden">{`Pro (${remainingUses}/7)`}</span>
                    </>
                  )}
                </span>
              </button>
              <PWAInstallButton />
            </div>
          </div>

          {/* Mobile Layout (< lg: up to 1023px) */}
          <div className="flex lg:hidden items-center justify-between relative py-0.5 min-h-[42px]">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                mobileMenuOpen 
                  ? 'bg-[#16A36A] text-white border-[#16A36A]' 
                  : 'text-[#071B2B] bg-white hover:bg-slate-100 border-[#071B2B]/25 shadow-2xs'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-[#071B2B]" />}
              <span>{mobileMenuOpen ? 'Close' : 'Menu'}</span>
            </button>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto">
              <button 
                onClick={() => handleTabClick('home')}
                className="flex items-center justify-center group cursor-pointer focus:outline-none select-none py-0.5"
                title="goinfoEV - Return to Home"
              >
                <span className="font-extrabold text-2xl tracking-tight text-[#071B2B] whitespace-nowrap">
                  goinfo<span className="text-[#16A36A] font-black">EV</span>
                </span>
              </button>
            </div>

            <button
              onClick={() => openSubscriptionModal('pay')}
              className={`z-10 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer border ${
                isSubscriber
                  ? 'bg-[#16A36A] text-white border-[#16A36A]'
                  : isPending
                  ? 'bg-[#F0B429] text-[#071B2B] border-[#F0B429]'
                  : 'bg-[#16A36A] text-white border-[#16A36A]'
              }`}
              title={isSubscriber ? 'VIP Unlimited Access' : `Global Free Quota: ${remainingUses} of 7 total free uses remaining`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{isSubscriber ? 'VIP' : `${remainingUses}/7`}</span>
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE QUICK MENU STRIP (Non-home pages) */}
      {!isHome && (
        <div className="lg:hidden bg-[#F5F8F6] border-b border-slate-300/80 px-2 pt-1.5 pb-2">
          <div className="relative">
            <div 
              ref={mobileQuickNavRef}
              onScroll={updateMobileQuickScroll}
              className="overflow-x-auto no-scrollbar pb-1"
            >
              <nav className="flex items-center gap-1.5 min-w-max px-1">
                {mobileBarItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                        isActive
                          ? 'bg-[#16A36A] text-white border-[#16A36A] font-black shadow-xs'
                          : 'bg-white text-[#071B2B] hover:bg-slate-100 border-[#071B2B]/25 shadow-2xs font-semibold'
                      }`}
                    >
                      <span className={isActive ? 'text-white' : 'text-[#16A36A]'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold border ${
                          isActive ? 'bg-white/20 text-white border-white/30' : 'bg-[#F5F8F6] text-[#071B2B] border-[#071B2B]/20'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
            
            <div className="pt-1 px-1 pb-0.5">
              <div 
                onClick={handleQuickNavTrackClick}
                className="h-1.5 w-full bg-slate-200 rounded-full relative overflow-hidden cursor-pointer"
              >
                <div 
                  className="h-full bg-[#16A36A] rounded-full transition-all duration-75"
                  style={{
                    width: `${mobileQuickScroll.width}%`,
                    left: `${mobileQuickScroll.left}%`,
                    position: 'absolute'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROW 2: CALCULATORS & TOOLS BAR (Home page only) */}
      {isHome && (
        <div className="bg-[#F5F8F6] border-b border-slate-300/80 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div 
              ref={homeToolsNavRef}
              onScroll={updateHomeToolsScroll}
              className="overflow-x-auto no-scrollbar pb-2.5 pt-2 sm:py-2.5"
            >
              <nav className="flex items-center justify-start lg:justify-center min-w-max gap-2 sm:gap-2.5 mx-auto px-2">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`group relative flex flex-col items-center justify-center min-w-[80px] sm:min-w-[92px] px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap border ${
                        isActive
                          ? 'bg-white border-2 border-[#16A36A] text-[#16A36A] shadow-md ring-2 ring-[#16A36A]/15'
                          : 'bg-white text-[#071B2B] border border-[#071B2B]/25 hover:border-[#16A36A] hover:bg-slate-50 shadow-2xs'
                      }`}
                    >
                      <div className="relative flex items-center justify-center">
                        <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? 'bg-[#16A36A] text-white shadow-xs scale-105' 
                            : 'bg-[#F5F8F6] text-[#16A36A] border border-slate-200 group-hover:bg-[#16A36A] group-hover:text-white group-hover:scale-105'
                        }`}>
                          {item.icon}
                        </div>

                        {item.badge && (
                          <span className={`absolute -top-1 -right-2 text-[8px] leading-none px-1.5 py-0.5 rounded-full font-black tracking-wider uppercase scale-90 border ${
                            isActive 
                              ? 'bg-[#F0B429] text-[#071B2B] border-[#F0B429]' 
                              : 'bg-[#F5F8F6] text-[#071B2B] border-[#071B2B]/20'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <span className={`text-[11px] tracking-tight text-center leading-tight mt-1 transition-colors ${
                        isActive 
                          ? 'text-[#16A36A] font-black' 
                          : 'text-[#071B2B] font-extrabold group-hover:text-[#16A36A]'
                      }`}>
                        {item.label}
                      </span>

                      {isActive && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-[#16A36A] rounded-full shadow-xs"></span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="lg:hidden pt-0.5 px-3 pb-2">
              <div 
                onClick={handleToolsTrackClick}
                className="h-1.5 w-full bg-slate-200 rounded-full relative overflow-hidden cursor-pointer"
              >
                <div 
                  className="h-full bg-[#16A36A] rounded-full transition-all duration-75"
                  style={{
                    width: `${homeToolsScroll.width}%`,
                    left: `${homeToolsScroll.left}%`,
                    position: 'absolute'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#F5F8F6] border-b border-slate-300 shadow-2xl px-4 py-4 space-y-4 max-h-[calc(100vh-100px)] overflow-y-auto text-[#071B2B]">
          
          {/* Section 1: Main 1st Menu Pages */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-[#071B2B] tracking-wider">
                  Main Website Navigation
                </span>
                <span className="text-[10px] font-extrabold text-[#16A36A] bg-[#16A36A]/10 border border-[#16A36A]/30 px-2 py-0.5 rounded-full">
                  Primary Pages
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                {firstMenuItems.length} Pages
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {firstMenuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-bold transition-all border ${
                      isActive
                        ? 'bg-[#16A36A] text-white border-[#16A36A] shadow-md'
                        : 'bg-white text-[#071B2B] hover:bg-slate-100 border-[#071B2B]/25 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        isActive 
                          ? 'bg-white text-[#16A36A]' 
                          : 'bg-[#F5F8F6] text-[#16A36A] border border-slate-200'
                      }`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-extrabold flex items-center gap-2">
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black border ${
                              isActive 
                                ? 'bg-white text-[#071B2B] border-white' 
                                : 'bg-[#F5F8F6] text-[#071B2B] border-[#071B2B]/25'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className={`text-[10px] ${isActive ? 'text-slate-100' : 'text-slate-500'} font-normal truncate max-w-[220px]`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#071B2B]'}`} />
                  </button>
                );
              })}

              {user ? (
                <button
                  onClick={() => handleTabClick('user-dashboard')}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-bold transition-all border ${
                    activeTab === 'user-dashboard'
                      ? 'bg-[#16A36A] text-white border-[#16A36A]'
                      : 'bg-white text-[#071B2B] hover:bg-slate-100 border-[#071B2B]/25 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#F5F8F6] text-[#16A36A] border border-slate-200">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold flex items-center gap-1.5">
                        <span>My Account Dashboard</span>
                        <span className="text-[9px] bg-[#16A36A] text-white px-1.5 py-0.2 rounded-full font-bold">Active</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal truncate max-w-[210px]">
                        {user.identifier} • Check saved calculations
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#071B2B]" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openSubscriptionModal('auth');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-bold transition-all bg-white text-[#071B2B] hover:bg-slate-100 border border-[#071B2B]/25 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#F5F8F6] text-[#16A36A] border border-slate-200">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold flex items-center gap-1.5">
                        <span>Login / Register Account</span>
                        <span className="text-[9px] bg-[#16A36A] text-white px-1.5 py-0.2 rounded-full font-bold">Free</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        Sign in to save calculations & access EV quota
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#071B2B]" />
                </button>
              )}

              {/* VIP Subscription CTA */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openSubscriptionModal('pay');
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-bold transition-all bg-[#16A36A] text-white shadow-md border border-[#16A36A]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/20 text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold flex items-center gap-1.5">
                      <span>VIP Pro Subscription</span>
                      <span className="text-[9px] bg-white text-[#071B2B] px-1.5 py-0.2 rounded-full font-black">
                        {isSubscriber ? 'Active' : `${remainingUses}/7 Free`}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-100 font-normal">
                      {isSubscriber ? 'Unlimited access to all tools' : 'PKR 499/mo via EasyPaisa & JazzCash'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Section 2: EV Calculators */}
          <div className="pt-2 border-t border-slate-300 space-y-2.5">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-[#071B2B] tracking-wider">
                  EV Calculators &amp; Estimation Tools
                </span>
                <span className="text-[10px] font-extrabold text-[#16A36A] bg-[#16A36A]/10 border border-[#16A36A]/30 px-2 py-0.5 rounded-full">
                  7 Tools
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                Calculators
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {calculatorItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-bold transition-all border ${
                      isActive
                        ? 'bg-[#16A36A] text-white border-[#16A36A] shadow-md'
                        : 'bg-white text-[#071B2B] hover:bg-slate-100 border-[#071B2B]/25 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        isActive 
                          ? 'bg-white text-[#16A36A]' 
                          : 'bg-[#F5F8F6] text-[#16A36A] border border-slate-200'
                      }`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-extrabold">{item.label}</div>
                        <div className={`text-[10px] ${isActive ? 'text-slate-100' : 'text-slate-500'} font-normal truncate max-w-[180px]`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                          isActive ? 'bg-white text-[#071B2B] border-white' : 'bg-[#F5F8F6] text-[#071B2B] border-[#071B2B]/25'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#071B2B]'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-white border border-[#16A36A]/30 rounded-xl text-xs text-[#071B2B] flex items-center gap-2 shadow-2xs">
            <TrendingUp className="w-4 h-4 text-[#16A36A] shrink-0" />
            <span className="text-[11px] leading-tight font-semibold">
              Updated with Pakistan WAPDA 2026 tariff slabs, solar calculators, and 15 EV manufacturers.
            </span>
          </div>

        </div>
      )}

    </header>
  );
};

export default Navbar;
