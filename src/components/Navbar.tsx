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
  MapPin,
  Lock,
  CreditCard,
  User,
  UserCheck
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useCatalog } from '../context/CatalogContext';

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
    freeUsesCount, 
    maxFreeUses, 
    openSubscriptionModal 
  } = useSubscription();

  // Refs and scroll indicators for mobile menus to ensure scrollbars are ALWAYS visible
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
    { id: 'home', label: 'Suite Hub', shortLabel: 'Hub', icon: <Home className="w-4 h-4" />, desc: 'Main Dashboard & Overview' },
    { id: 'charging-stations', label: 'EV Stations', shortLabel: 'Stations', icon: <Zap className="w-4 h-4 text-emerald-500" />, badge: 'Fast DC', desc: 'Find Fast DC Chargers Across Pakistan' },
    { id: 'products', label: 'Fleet Catalog', shortLabel: 'Catalog', icon: <Database className="w-4 h-4" />, badge: '38 Bikes', desc: 'Browse 38+ Electric Scooters' },
    { id: 'comparison', label: 'Compare Bikes', shortLabel: 'Compare', icon: <SlidersHorizontal className="w-4 h-4" />, desc: 'Side-by-side Specs & Pricing' },
    { id: 'savings', label: 'Fuel Savings', shortLabel: 'Savings', icon: <Calculator className="w-4 h-4 text-emerald-500" />, badge: 'ROI', desc: 'EV vs Petrol Fuel Savings' },
    { id: 'range', label: 'Range & Maps', shortLabel: 'Range', icon: <Gauge className="w-4 h-4 text-blue-500" />, desc: 'Real-world Range & Route Estimator' },
    { id: 'charging', label: 'Charging Cost', shortLabel: 'Charging', icon: <Zap className="w-4 h-4 text-amber-500" />, desc: 'WAPDA Tariffs & Unit Cost' },
    { id: 'battery', label: 'Battery SOH', shortLabel: 'Battery', icon: <ShieldCheck className="w-4 h-4 text-indigo-500" />, desc: 'Degradation & Lifespan Tracker' },
    { id: 'solar', label: 'Solar Power', shortLabel: 'Solar', icon: <Sun className="w-4 h-4 text-yellow-500" />, desc: 'Solar Panel Sizing & Zero Cost' },
    { id: 'rider', label: 'Rider Profit', shortLabel: 'Rider Calc', icon: <Bike className="w-4 h-4 text-rose-500" />, badge: 'Gig App', desc: 'Bykea/Indrive/Foodpanda Earnings' },
  ];

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isHome = activeTab === 'home';

  // Desktop navigation items (all 7 core site pages with responsive short/full labels)
  const desktopNavItems: { id: TabType; label: string; shortLabel: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Home', shortLabel: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'products', label: 'Fleet Catalog', shortLabel: 'Catalog', icon: <Database className="w-4 h-4 text-blue-500" />, badge: `${totalCount}` },
    { id: 'content', label: 'EV Guides', shortLabel: 'Guides', icon: <BookOpen className="w-4 h-4 text-indigo-500" /> },
    { id: 'blogs', label: 'Blogs & Insights', shortLabel: 'Blogs', icon: <FileText className="w-4 h-4 text-cyan-500" />, badge: '40+' },
    { id: 'about', label: 'About Us', shortLabel: 'About', icon: <Info className="w-4 h-4 text-slate-500" /> },
    { id: 'contact', label: 'Contact Us', shortLabel: 'Contact', icon: <Mail className="w-4 h-4 text-emerald-500" /> },
    { id: 'admin', label: 'Admin Portal', shortLabel: 'Admin', icon: <Lock className="w-4 h-4 text-purple-500" />, badge: 'CSV' },
  ];

  // Mobile quick access strip items (ensuring user dashboard/login is easily accessible)
  const mobileBarItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-3.5 h-3.5 text-blue-600" /> },
    { id: 'user-dashboard', label: user ? 'Dashboard' : 'Login', icon: <User className="w-3.5 h-3.5 text-blue-600" />, badge: user ? 'My' : 'Sign In' },
    { id: 'products', label: 'Catalog', icon: <Database className="w-3.5 h-3.5 text-blue-600" />, badge: `${totalCount}` },
    { id: 'content', label: 'Guides', icon: <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> },
    { id: 'blogs', label: 'Blogs', icon: <FileText className="w-3.5 h-3.5 text-cyan-600" />, badge: '40+' },
    { id: 'about', label: 'About', icon: <Info className="w-3.5 h-3.5 text-slate-600" /> },
    { id: 'admin', label: 'Admin', icon: <Lock className="w-3.5 h-3.5 text-purple-600" />, badge: 'CSV' },
  ];

  // 1st Menu Items (Core Primary Website Pages shown in Mobile Menu Drawer)
  const firstMenuItems: { 
    id: TabType; 
    label: string; 
    desc: string; 
    icon: React.ReactNode; 
    badge?: string; 
  }[] = [
    { id: 'home', label: 'Home', desc: 'Main welcome dashboard & fleet overview', icon: <Home className="w-4 h-4 text-blue-600" /> },
    { id: 'products', label: 'Fleet Catalog', desc: `Browse ${totalCount}+ verified EV motorcycle models in Pakistan`, icon: <Database className="w-4 h-4 text-blue-600" />, badge: `${totalCount} Models` },
    { id: 'charging-stations', label: 'EV Charging Stations', desc: 'Find Fast DC Chargers across Pakistan motorways & cities', icon: <Zap className="w-4 h-4 text-emerald-600" />, badge: 'Fast DC' },
    { id: 'content', label: 'EV Buyer Guides & FAQs', desc: 'Pre-purchase checklist, battery tips & home wiring', icon: <BookOpen className="w-4 h-4 text-indigo-600" /> },
    { id: 'blogs', label: 'Blogs & Insights', desc: '40+ in-depth EV technology, repair & tariff articles', icon: <FileText className="w-4 h-4 text-cyan-600" />, badge: '40+' },
    { id: 'about', label: 'About Us & Creator', desc: 'Hamdan Mirza & OrinexAI partnership details', icon: <Info className="w-4 h-4 text-slate-600" /> },
    { id: 'contact', label: 'Contact Us', desc: 'Direct WhatsApp (+92 303 6001701) & inquiry form', icon: <Mail className="w-4 h-4 text-emerald-600" /> },
    { id: 'admin', label: 'Admin Portal', desc: 'CSV Product Fleet Manager, Users & Payment settings', icon: <Lock className="w-4 h-4 text-purple-600" />, badge: 'CSV / Pin' },
  ];

  // Calculators Menu Items (Tools shown in Mobile Menu Drawer)
  const calculatorItems: { 
    id: TabType; 
    label: string; 
    desc: string; 
    icon: React.ReactNode; 
    badge?: string; 
  }[] = [
    { id: 'savings', label: 'Fuel Savings Calculator', desc: 'EV vs Petrol Fuel Savings & ROI', icon: <Calculator className="w-4 h-4 text-emerald-500" />, badge: 'ROI' },
    { id: 'range', label: 'Range & Route Estimator', desc: 'Real-world Range & Google Maps Route', icon: <Gauge className="w-4 h-4 text-blue-500" /> },
    { id: 'charging', label: 'Charging Cost Calculator', desc: 'WAPDA Tariffs, Slabs & Charging Bill', icon: <Zap className="w-4 h-4 text-amber-500" /> },
    { id: 'battery', label: 'Battery SOH & Lifespan', desc: 'LFP/Graphene degradation & cycle life tracker', icon: <ShieldCheck className="w-4 h-4 text-indigo-500" /> },
    { id: 'solar', label: 'Solar Power Calculator', desc: 'Solar Panel Sizing & Zero Unit Cost', icon: <Sun className="w-4 h-4 text-yellow-500" /> },
    { id: 'rider', label: 'Rider Profit Calculator', desc: 'Bykea, InDrive & Foodpanda Net Earnings', icon: <Bike className="w-4 h-4 text-rose-500" />, badge: 'Gig App' },
    { id: 'comparison', label: 'Side-by-Side Comparison', desc: 'Compare up to 6 models side-by-side', icon: <SlidersHorizontal className="w-4 h-4 text-indigo-500" /> },
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
        className={`group relative flex items-center gap-1.5 px-2 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs xl:text-sm font-bold transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap ${
          isActive
            ? 'text-blue-700 font-black bg-blue-50/90 shadow-2xs border border-blue-200/80'
            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 font-semibold'
        }`}
        title={item.label}
      >
        <div className={`transition-transform duration-200 shrink-0 ${
          isActive ? 'text-blue-600 scale-105' : 'text-slate-500 group-hover:text-blue-600 group-hover:scale-105'
        }`}>
          {item.icon}
        </div>

        <span className="tracking-tight whitespace-nowrap">
          <span className="hidden xl:inline">{item.label}</span>
          <span className="xl:hidden">{item.shortLabel}</span>
        </span>

        {item.badge && (
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black shrink-0 ${
            isActive ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
          }`}>
            {item.badge}
          </span>
        )}

        {/* Active sleek indicator */}
        {isActive && (
          <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 rounded-full shadow-xs"></span>
        )}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300 w-full max-w-full overflow-x-clip">
      
      {/* ───────────────────────────────────────────────────────────
          ROW 1: DESKTOP CLEAN BALANCED HEADER & MOBILE NAV BAR
          Zero horizontal overflow, elegant spacing and responsive sizing
      ──────────────────────────────────────────────────────────── */}
      <div className={`border-b border-slate-200/90 bg-white/95 backdrop-blur-md relative px-3 sm:px-5 lg:px-6 xl:px-8 ${isScrolled ? 'py-1 sm:py-1.5' : 'py-2 sm:py-2.5'} transition-all w-full max-w-full overflow-x-clip`}>
        <div className="max-w-7xl mx-auto w-full">
          
          {/* Desktop Display (lg: 1024px+): Perfectly balanced 3-column layout (Logo - Nav Links - Actions) */}
          <div className="hidden lg:flex items-center justify-between gap-2 xl:gap-4 w-full min-h-[44px]">
            {/* Left: Brand Logo */}
            <div className="flex items-center shrink-0">
              <button 
                onClick={() => handleTabClick('home')}
                className="flex items-center group cursor-pointer focus:outline-none select-none transition-transform active:scale-95 py-0.5"
                title="goinfoEV - Return to Home"
              >
                <span className="font-black text-2xl xl:text-3xl tracking-tight text-slate-950 group-hover:text-blue-700 transition-colors whitespace-nowrap">
                  goinfo<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 font-black">EV</span>
                </span>
              </button>
            </div>

            {/* Center: Main Desktop Navigation Links */}
            <nav className="flex items-center justify-center gap-1 xl:gap-1.5 flex-nowrap">
              {desktopNavItems.map((item) => renderDesktopNavButton(item))}
            </nav>

            {/* Right: User Dashboard / Login + VIP Pro Subscription CTA */}
            <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
              {/* User Account / Login / Register Button */}
              {user ? (
                <button
                  onClick={() => handleTabClick('user-dashboard')}
                  className={`px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                    activeTab === 'user-dashboard'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200'
                  }`}
                  title={`Logged in as ${user.identifier} - View Dashboard`}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"></div>
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span className="max-w-[80px] xl:max-w-[120px] truncate">{user.identifier}</span>
                </button>
              ) : (
                <button
                  onClick={() => openSubscriptionModal('auth')}
                  className="px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 bg-slate-100 text-slate-800 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 shadow-2xs"
                  title="Sign In or Register with Phone/Email"
                >
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden xl:inline">Login / Register</span>
                  <span className="xl:hidden">Login</span>
                </button>
              )}

              {/* VIP Subscription CTA Button */}
              <button
                onClick={() => openSubscriptionModal('pay')}
                className={`px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0 ${
                  isSubscriber
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : isPending
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-600'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                }`}
                title={isSubscriber ? 'VIP Unlimited Access' : `Global Free Quota: ${remainingUses} of 7 total uses remaining across all tools`}
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
            </div>
          </div>

          {/* Mobile & Tablet Display (< lg: up to 1023px): Menu Button on Left, Centered Logo, Right VIP */}
          <div className="flex lg:hidden items-center justify-between relative py-0.5 min-h-[42px]">
            {/* Mobile Left: Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                mobileMenuOpen 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-200'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-slate-800" />}
              <span>{mobileMenuOpen ? 'Close' : 'Menu'}</span>
            </button>

            {/* Mobile Center Logo - Dead center alignment */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto">
              <button 
                onClick={() => handleTabClick('home')}
                className="flex items-center justify-center group cursor-pointer focus:outline-none select-none py-0.5"
                title="goinfoEV - Return to Home"
              >
                <span className="font-black text-2xl tracking-tight text-slate-950 whitespace-nowrap">
                  goinfo<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 font-black">EV</span>
                </span>
              </button>
            </div>

            {/* Mobile Right: Compact VIP Subscription Pill */}
            <button
              onClick={() => openSubscriptionModal('pay')}
              className={`z-10 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer border ${
                isSubscriber
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : isPending
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                  : 'bg-blue-600 text-white border-blue-600 shadow-xs'
              }`}
              title={isSubscriber ? 'VIP Unlimited Access' : `Global Free Quota: ${remainingUses} of 7 total free uses remaining across all tools`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{isSubscriber ? 'VIP' : `${remainingUses}/7`}</span>
            </button>
          </div>

        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────
          MOBILE DEDICATED HORIZONTAL QUICK MENU STRIP
          Only rendered on non-home pages! On the Home Page, the user requested:
          "homepage per sirf calculators show hoon jaisy abhi ho rhy hain. main mobile per 2 header rows nahi chahta"
          So on mobile homepage, there is ONLY 1 header row (Calculators & Tools bar) and zero duplicate rows.
          All 1st menu items are accessible via the mobile Menu button on the homepage.
      ──────────────────────────────────────────────────────────── */}
      {!isHome && (
        <div className="lg:hidden bg-slate-50/95 border-b border-slate-200/90 px-2 pt-1.5 pb-2 shadow-2xs">
          <div className="relative">
            {/* Scrollable Container with native scrollbar hidden */}
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
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs font-black'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 font-semibold'
                      }`}
                    >
                      <span className={isActive ? 'text-white' : 'text-slate-500'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                          isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
            
            {/* Single Permanent Always-Visible Scroll Bar (Clickable track & animated thumb) */}
            <div className="pt-1 px-1 pb-0.5">
              <div 
                onClick={handleQuickNavTrackClick}
                className="h-1.5 w-full bg-slate-200/90 hover:bg-slate-300 rounded-full relative overflow-hidden cursor-pointer transition-colors"
                title="Click or swipe to scroll navigation"
              >
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-full transition-all duration-75 shadow-xs"
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

      {/* ───────────────────────────────────────────────────────────
          ROW 2: DEDICATED CALCULATORS & TOOLS BAR
          Only displayed on the Home Page (Hidden on all other pages)
      ──────────────────────────────────────────────────────────── */}
      {isHome && (
        <div className="bg-white border-b border-slate-100 shadow-xs transition-all duration-300">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div 
              ref={homeToolsNavRef}
              onScroll={updateHomeToolsScroll}
              className="overflow-x-auto no-scrollbar pb-2 pt-1.5 sm:py-2"
            >
              <nav className="flex items-center justify-start lg:justify-center min-w-max gap-1.5 sm:gap-2 mx-auto px-2">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`group relative flex flex-col items-center justify-center min-w-[76px] sm:min-w-[86px] px-2.5 sm:px-3 py-1.5 rounded-2xl transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap ${
                        isActive
                          ? 'bg-slate-50/90 ring-1 ring-slate-200/90 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Top Icon */}
                      <div className="relative flex items-center justify-center">
                        <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white shadow-md shadow-blue-500/30 scale-105' 
                            : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:scale-105'
                        }`}>
                          {item.icon}
                        </div>

                        {item.badge && (
                          <span className={`absolute -top-1 -right-2 text-[8px] leading-none px-1.5 py-0.5 rounded-full font-black tracking-wider uppercase scale-90 ${
                            isActive 
                              ? 'bg-blue-600 text-white ring-2 ring-white shadow-xs' 
                              : 'bg-slate-800 text-slate-100'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {/* Bottom Text */}
                      <span className={`text-[11px] tracking-tight text-center leading-tight mt-1 transition-colors ${
                        isActive 
                          ? 'text-slate-950 font-black' 
                          : 'text-slate-600 font-semibold group-hover:text-slate-900'
                      }`}>
                        {item.label}
                      </span>

                      {/* Active sleek gradient indicator below */}
                      {isActive && (
                        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 rounded-full shadow-xs"></span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Single Permanent Always-Visible Scroll Bar (Mobile & Tablet) */}
            <div className="lg:hidden pt-0.5 px-3 pb-2">
              <div 
                onClick={handleToolsTrackClick}
                className="h-1.5 w-full bg-slate-200/90 hover:bg-slate-300 rounded-full relative overflow-hidden cursor-pointer transition-colors"
                title="Click or swipe to scroll tools"
              >
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-full transition-all duration-75 shadow-xs"
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

      {/* ───────────────────────────────────────────────────────────
          MOBILE DRAWER / DROPDOWN MENU (< lg)
          Triggered by clicking the Menu button with icon on mobile header.
          On Homepage and throughout mobile, prominently presents all 1st menu items
          first, followed by the complete suite of EV Calculators.
      ──────────────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-2xl px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-100px)] overflow-y-auto">
          
          {/* Section 1: Main 1st Menu Pages */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-slate-900 tracking-wider">
                  Main Website Navigation (1st Menu)
                </span>
                <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  Primary Pages
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
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
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-md ring-1 ring-slate-800'
                        : item.id === 'charging-stations'
                        ? 'bg-emerald-50/90 text-slate-900 hover:bg-emerald-100/80 border border-emerald-200/80'
                        : item.id === 'admin'
                        ? 'bg-purple-50/80 text-purple-950 hover:bg-purple-100 border border-purple-200/80'
                        : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        isActive 
                          ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white shadow-sm' 
                          : 'bg-white text-slate-700 shadow-xs border border-slate-200/60'
                      }`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-extrabold flex items-center gap-2">
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                              isActive 
                                ? 'bg-blue-600 text-white' 
                                : item.id === 'charging-stations'
                                ? 'bg-emerald-200 text-emerald-900'
                                : item.id === 'admin'
                                ? 'bg-purple-200 text-purple-900'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className={`text-[10px] ${isActive ? 'text-slate-300' : 'text-slate-500'} font-normal truncate max-w-[220px]`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  </button>
                );
              })}

              {/* User Account / Dashboard or Login Card in 1st Menu */}
              {user ? (
                <button
                  onClick={() => handleTabClick('user-dashboard')}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-bold transition-all ${
                    activeTab === 'user-dashboard'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-blue-50/80 text-blue-950 hover:bg-blue-100 border border-blue-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${activeTab === 'user-dashboard' ? 'bg-white/20 text-white' : 'bg-white text-blue-600 border border-blue-200'}`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold flex items-center gap-1.5">
                        <span>My Account Dashboard</span>
                        <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-bold">Active</span>
                      </div>
                      <div className={`text-[10px] ${activeTab === 'user-dashboard' ? 'text-blue-100' : 'text-slate-500'} font-normal truncate max-w-[210px]`}>
                        {user.identifier} • Check saved calculations &amp; tier
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeTab === 'user-dashboard' ? 'text-white' : 'text-slate-400'}`} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openSubscriptionModal('auth');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-bold transition-all bg-slate-50 text-slate-800 hover:bg-blue-50 border border-slate-200 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white text-blue-600 border border-slate-200">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold flex items-center gap-1.5">
                        <span>Login / Register Account</span>
                        <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-bold">Free</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        Sign in with Phone or Email to save 7 free calculator uses
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}

              {/* VIP Subscription CTA */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openSubscriptionModal('pay');
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-bold transition-all bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/20 text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold flex items-center gap-1.5">
                      <span>VIP Pro Subscription</span>
                      <span className="text-[9px] bg-white text-blue-900 px-1.5 py-0.2 rounded-full font-black">
                        {isSubscriber ? 'Active' : `${remainingUses}/7 Free`}
                      </span>
                    </div>
                    <div className="text-[10px] text-blue-100 font-normal">
                      {isSubscriber ? 'Unlimited access to all calculators' : 'PKR 499/mo via EasyPaisa & JazzCash'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Section 2: EV Calculators & Estimators */}
          <div className="pt-2 border-t border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-slate-900 tracking-wider">
                  EV Calculators &amp; Estimation Tools
                </span>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  7 Tools
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
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
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-md ring-1 ring-slate-800'
                        : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        isActive 
                          ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white shadow-sm' 
                          : 'bg-white text-slate-700 shadow-xs border border-slate-200/60'
                      }`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-bold">{item.label}</div>
                        <div className={`text-[10px] ${isActive ? 'text-slate-300' : 'text-slate-400'} font-normal truncate max-w-[180px]`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick info banner in mobile menu */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-[11px] leading-tight">
              Updated with Pakistan WAPDA 2026 tariff slabs, solar calculators, and all 15 EV manufacturers.
            </span>
          </div>

        </div>
      )}

    </header>
  );
};

export default Navbar;


