import React, { useState } from 'react';
import { TabType } from './Navbar';
import { 
  Home, 
  Bike, 
  SlidersHorizontal, 
  Calculator, 
  Menu, 
  X, 
  ChevronRight, 
  Zap, 
  Gauge, 
  ShieldCheck, 
  Sun, 
  Database, 
  BookOpen, 
  FileText, 
  Info, 
  Mail, 
  Lock, 
  User, 
  Sparkles,
  TrendingUp,
  Globe
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useCatalog } from '../context/CatalogContext';

interface MobileBottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab }) => {
  const [toolsSheetOpen, setToolsSheetOpen] = useState(false);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const { totalCount } = useCatalog();
  const { user, isSubscriber, isPending, remainingUses, openSubscriptionModal } = useSubscription();

  const handleNavClick = (tab: TabType) => {
    setActiveTab(tab);
    setToolsSheetOpen(false);
    setMoreSheetOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine which primary bottom bar item is active
  const isHomeActive = activeTab === 'home';
  const isExploreActive = activeTab === 'products';
  const isCompareActive = activeTab === 'comparison';
  const isToolActive = ['savings', 'range', 'charging', 'battery', 'solar', 'rider', 'charging-stations'].includes(activeTab) && !toolsSheetOpen && !moreSheetOpen;
  const isMoreActive = ['blogs', 'content', 'about', 'contact', 'admin', 'user-dashboard'].includes(activeTab) || moreSheetOpen;

  const toolItems: { id: TabType; label: string; desc: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'savings', label: 'Fuel Savings ROI', desc: 'EV vs Petrol Fuel Savings', icon: <Calculator className="w-4 h-4 text-[#16A36A]" />, badge: 'ROI' },
    { id: 'range', label: 'Range & Maps Estimator', desc: 'Real-world Range & Google Maps Route', icon: <Gauge className="w-4 h-4 text-emerald-400" /> },
    { id: 'charging', label: 'Charging Cost & Tariff', desc: 'WAPDA Tariffs, Slabs & Charging Bill', icon: <Zap className="w-4 h-4 text-[#F0B429]" /> },
    { id: 'battery', label: 'Battery SOH & Lifespan', desc: 'LFP & Graphene degradation tracker', icon: <ShieldCheck className="w-4 h-4 text-emerald-300" /> },
    { id: 'solar', label: 'Solar Power Calculator', desc: 'Solar Panel Sizing & Zero Unit Cost', icon: <Sun className="w-4 h-4 text-[#F0B429]" /> },
    { id: 'rider', label: 'Delivery Rider Earnings', desc: 'Bykea, InDrive & Foodpanda Earnings', icon: <Bike className="w-4 h-4 text-amber-400" />, badge: 'Gig' },
    { id: 'charging-stations', label: 'EV Charging Stations', desc: 'Find Fast DC Chargers across Pakistan', icon: <Globe className="w-4 h-4 text-[#16A36A]" />, badge: 'Fast DC' },
  ];

  const moreItems: { id: TabType; label: string; desc: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'content', label: 'EV Buyer Guides & FAQs', desc: 'Pre-purchase checklist & battery maintenance', icon: <BookOpen className="w-4 h-4 text-emerald-400" /> },
    { id: 'blogs', label: 'Blogs & Insights', desc: '40+ in-depth EV technology & tariff articles', icon: <FileText className="w-4 h-4 text-cyan-400" />, badge: '40+' },
    { id: 'about', label: 'About Us & Creator', desc: 'Hamdan Mirza & OrinexAI partnership details', icon: <Info className="w-4 h-4 text-slate-300" /> },
    { id: 'contact', label: 'Contact Us', desc: 'WhatsApp (+92 303 6001701) & inquiry form', icon: <Mail className="w-4 h-4 text-[#16A36A]" /> },
    { id: 'admin', label: 'Admin Portal', desc: 'CSV Product Fleet Manager & Settings', icon: <Lock className="w-4 h-4 text-[#F0B429]" />, badge: 'CSV' },
  ];

  return (
    <>
      {/* ───────────────────────────────────────────────────────────
          TOOLS DRAWER / SHEET
      ──────────────────────────────────────────────────────────── */}
      {toolsSheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-[#071B2B]/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#071B2B] border-t-2 border-[#16A36A] rounded-t-3xl max-h-[80vh] flex flex-col shadow-2xl p-4 text-white space-y-4 overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#172B3A]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#16A36A] text-white">
                  <Calculator className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-white">EV Analytics &amp; Calculation Tools</h3>
              </div>
              <button
                onClick={() => setToolsSheetOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white bg-[#172B3A] rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {toolItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#16A36A] text-white shadow-md'
                        : 'bg-[#172B3A] text-slate-200 hover:bg-[#1a3244] border border-[#172B3A]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isActive ? 'bg-white text-[#16A36A]' : 'bg-[#071B2B] text-slate-300'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-extrabold flex items-center gap-1.5">
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                              isActive ? 'bg-[#071B2B] text-white' : 'bg-[#071B2B] text-[#F0B429] border border-[#F0B429]/30'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className={`text-[10px] ${isActive ? 'text-slate-100' : 'text-slate-400'} font-normal truncate max-w-[220px]`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          MORE MENU DRAWER / SHEET
      ──────────────────────────────────────────────────────────── */}
      {moreSheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-[#071B2B]/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#071B2B] border-t-2 border-[#16A36A] rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl p-4 text-white space-y-4 overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#172B3A]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#16A36A] text-white">
                  <Menu className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-white">Website Navigation &amp; Account</h3>
              </div>
              <button
                onClick={() => setMoreSheetOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white bg-[#172B3A] rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Account Status / Dashboard */}
            {user ? (
              <button
                onClick={() => handleNavClick('user-dashboard')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-bold transition-all ${
                  activeTab === 'user-dashboard'
                    ? 'bg-[#16A36A] text-white'
                    : 'bg-[#172B3A] text-slate-200 hover:bg-[#1a3244] border border-[#172B3A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#071B2B] text-[#16A36A]">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold flex items-center gap-1.5">
                      <span>My Account Dashboard</span>
                      <span className="text-[9px] bg-[#16A36A] text-white px-1.5 py-0.2 rounded-full font-bold">Active</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal truncate max-w-[210px]">
                      {user.identifier}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setMoreSheetOpen(false);
                  openSubscriptionModal('auth');
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-bold transition-all bg-[#172B3A] text-slate-100 hover:bg-[#1a3244] border border-[#172B3A]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#071B2B] text-[#16A36A]">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold flex items-center gap-1.5">
                      <span>Login / Register Account</span>
                      <span className="text-[9px] bg-[#16A36A] text-white px-1.5 py-0.2 rounded-full font-bold">Free</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      Sign in to save calculations & access quota
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            )}

            {/* VIP Pro Subscription CTA */}
            <button
              onClick={() => {
                setMoreSheetOpen(false);
                openSubscriptionModal('pay');
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-bold transition-all bg-[#16A36A] text-white shadow-md"
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

            {/* Remaining Pages */}
            <div className="grid grid-cols-1 gap-2 pt-2 border-t border-[#172B3A]">
              {moreItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#16A36A] text-white shadow-md'
                        : 'bg-[#172B3A] text-slate-200 hover:bg-[#1a3244] border border-[#172B3A]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isActive ? 'bg-white text-[#16A36A]' : 'bg-[#071B2B] text-slate-300'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-extrabold flex items-center gap-1.5">
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                              isActive ? 'bg-[#071B2B] text-white' : 'bg-[#071B2B] text-[#F0B429] border border-[#F0B429]/30'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className={`text-[10px] ${isActive ? 'text-slate-100' : 'text-slate-400'} font-normal truncate max-w-[220px]`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          FIXED MOBILE BOTTOM NAVIGATION BAR
      ──────────────────────────────────────────────────────────── */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#071B2B] border-t border-[#172B3A] shadow-2xl lg:hidden pb-[max(0.25rem,env(safe-area-inset-bottom))]"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 h-14">
          
          {/* 1. Home */}
          <button
            onClick={() => handleNavClick('home')}
            className={`flex flex-col items-center justify-center py-1 px-1 transition-all cursor-pointer relative ${
              isHomeActive && !toolsSheetOpen && !moreSheetOpen
                ? 'text-[#16A36A] font-extrabold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Home className={`w-5 h-5 transition-transform ${isHomeActive && !toolsSheetOpen && !moreSheetOpen ? 'scale-110 text-[#16A36A]' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Home</span>
            {isHomeActive && !toolsSheetOpen && !moreSheetOpen && (
              <span className="absolute top-1 right-1/2 translate-x-3 w-1.5 h-1.5 bg-[#16A36A] rounded-full"></span>
            )}
          </button>

          {/* 2. Explore (Catalog) */}
          <button
            onClick={() => handleNavClick('products')}
            className={`flex flex-col items-center justify-center py-1 px-1 transition-all cursor-pointer relative ${
              isExploreActive && !toolsSheetOpen && !moreSheetOpen
                ? 'text-[#16A36A] font-extrabold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Bike className={`w-5 h-5 transition-transform ${isExploreActive && !toolsSheetOpen && !moreSheetOpen ? 'scale-110 text-[#16A36A]' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Explore</span>
            {isExploreActive && !toolsSheetOpen && !moreSheetOpen && (
              <span className="absolute top-1 right-1/2 translate-x-3 w-1.5 h-1.5 bg-[#16A36A] rounded-full"></span>
            )}
          </button>

          {/* 3. Compare */}
          <button
            onClick={() => handleNavClick('comparison')}
            className={`flex flex-col items-center justify-center py-1 px-1 transition-all cursor-pointer relative ${
              isCompareActive && !toolsSheetOpen && !moreSheetOpen
                ? 'text-[#16A36A] font-extrabold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <SlidersHorizontal className={`w-5 h-5 transition-transform ${isCompareActive && !toolsSheetOpen && !moreSheetOpen ? 'scale-110 text-[#16A36A]' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Compare</span>
            {isCompareActive && !toolsSheetOpen && !moreSheetOpen && (
              <span className="absolute top-1 right-1/2 translate-x-3 w-1.5 h-1.5 bg-[#16A36A] rounded-full"></span>
            )}
          </button>

          {/* 4. Tools */}
          <button
            onClick={() => {
              setMoreSheetOpen(false);
              setToolsSheetOpen(!toolsSheetOpen);
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 transition-all cursor-pointer relative ${
              (isToolActive || toolsSheetOpen)
                ? 'text-[#16A36A] font-extrabold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Calculator className={`w-5 h-5 transition-transform ${(isToolActive || toolsSheetOpen) ? 'scale-110 text-[#16A36A]' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Tools</span>
            {(isToolActive || toolsSheetOpen) && (
              <span className="absolute top-1 right-1/2 translate-x-3 w-1.5 h-1.5 bg-[#16A36A] rounded-full"></span>
            )}
          </button>

          {/* 5. More */}
          <button
            onClick={() => {
              setToolsSheetOpen(false);
              setMoreSheetOpen(!moreSheetOpen);
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 transition-all cursor-pointer relative ${
              (isMoreActive || moreSheetOpen)
                ? 'text-[#16A36A] font-extrabold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Menu className={`w-5 h-5 transition-transform ${(isMoreActive || moreSheetOpen) ? 'scale-110 text-[#16A36A]' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">More</span>
            {(isMoreActive || moreSheetOpen) && (
              <span className="absolute top-1 right-1/2 translate-x-3 w-1.5 h-1.5 bg-[#16A36A] rounded-full"></span>
            )}
          </button>

        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
