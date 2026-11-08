import React, { useState, useEffect } from 'react';
import { Navbar, TabType } from './components/Navbar';
import { HomeOverview } from './components/HomeOverview';
import { ProductsCatalog } from './components/ProductsCatalog';
import { RangeEstimator } from './components/RangeEstimator';
import { ChargingCostCalculator } from './components/ChargingCostCalculator';
import { BatteryHealthTracker } from './components/BatteryHealthTracker';
import { SavingsCalculator } from './components/SavingsCalculator';
import { SolarCalculator } from './components/SolarCalculator';
import { RiderProfitCalculator } from './components/RiderProfitCalculator';
import { ProductComparison } from './components/ProductComparison';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { BlogsPage } from './components/BlogsPage';
import { ContentGuidePage } from './components/ContentGuidePage';
import { ChargingStationsFinder } from './components/ChargingStationsFinder';
import { AIBotAssistant } from './components/AIBotAssistant';
import { Footer } from './components/Footer';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { CatalogProvider } from './context/CatalogContext';
import { SubscriptionModal } from './components/SubscriptionModal';
import { CalculatorGuard } from './components/CalculatorGuard';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';

function getInitialTab(): TabType {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.replace(/^\/+/, '').toLowerCase();
  const hash = window.location.hash.replace(/^#+/, '').toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const paramTab = (searchParams.get('tab') || searchParams.get('page') || '').toLowerCase();

  const validTabs: TabType[] = [
    'home', 'charging-stations', 'products', 'comparison', 'range', 'charging',
    'battery', 'savings', 'solar', 'rider', 'blogs', 'content', 'about', 'contact',
    'admin', 'user-dashboard'
  ];

  if (path === 'admin' || hash === 'admin' || paramTab === 'admin') return 'admin';
  if (validTabs.includes(path as TabType)) return path as TabType;
  if (validTabs.includes(hash as TabType)) return hash as TabType;
  if (validTabs.includes(paramTab as TabType)) return paramTab as TabType;
  return 'home';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);
  const [activeModelId, setActiveModelId] = useState<string>('crown-flash');

  // Sync tab changes with browser URL
  const handleNavigateWithScroll = (tab: TabType) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const targetUrl = tab === 'home' ? '/' : `/${tab}`;
      if (window.location.pathname !== targetUrl) {
        window.history.pushState({ tab }, '', targetUrl);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectModelForTool = (modelId: string, tool: TabType) => {
    setActiveModelId(modelId);
    handleNavigateWithScroll(tool);
  };

  // Listen to browser Back/Forward & direct URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      const tab = getInitialTab();
      setActiveTab(tab);
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  return (
    <CatalogProvider>
      <SubscriptionProvider>
        <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
        {/* Top Navbar */}
        <Navbar activeTab={activeTab} setActiveTab={handleNavigateWithScroll} />

        {/* Main Page Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {activeTab === 'home' && (
            <HomeOverview
              onNavigate={handleNavigateWithScroll}
              onSelectModelForTool={handleSelectModelForTool}
            />
          )}

          {activeTab === 'charging-stations' && (
            <ChargingStationsFinder onContactClick={() => handleNavigateWithScroll('contact')} />
          )}

          {activeTab === 'products' && (
            <ProductsCatalog onSelectModelForTool={handleSelectModelForTool} />
          )}

          {activeTab === 'range' && (
            <CalculatorGuard toolName="Real-World Range & Speed Estimator">
              <RangeEstimator initialModelId={activeModelId} />
            </CalculatorGuard>
          )}

          {activeTab === 'charging' && (
            <CalculatorGuard toolName="Charging Cost & WAPDA Tariff Slab Calculator">
              <ChargingCostCalculator initialModelId={activeModelId} />
            </CalculatorGuard>
          )}

          {activeTab === 'battery' && (
            <CalculatorGuard toolName="Battery SOH Health & Degradation Tracker">
              <BatteryHealthTracker initialModelId={activeModelId} />
            </CalculatorGuard>
          )}

          {activeTab === 'savings' && (
            <CalculatorGuard toolName="EV vs Petrol Fuel Savings & Payback Calculator">
              <SavingsCalculator initialModelId={activeModelId} />
            </CalculatorGuard>
          )}

          {activeTab === 'solar' && (
            <CalculatorGuard toolName="Solar Panel Sizing & Zero-Cost EV Charging">
              <SolarCalculator initialModelId={activeModelId} />
            </CalculatorGuard>
          )}

          {activeTab === 'rider' && (
            <CalculatorGuard toolName="Delivery & Gig Rider Profit Calculator">
              <RiderProfitCalculator />
            </CalculatorGuard>
          )}

          {activeTab === 'comparison' && (
            <CalculatorGuard toolName="Side-by-Side EV Bike Comparison">
              <ProductComparison onSelectModelForTool={handleSelectModelForTool} />
            </CalculatorGuard>
          )}

          {activeTab === 'about' && (
            <AboutPage onNavigate={handleNavigateWithScroll} />
          )}

          {activeTab === 'contact' && (
            <ContactPage onNavigate={handleNavigateWithScroll} />
          )}

          {activeTab === 'blogs' && (
            <BlogsPage onNavigate={handleNavigateWithScroll} />
          )}

          {activeTab === 'content' && (
            <ContentGuidePage onNavigate={handleNavigateWithScroll} />
          )}

          {activeTab === 'admin' && (
            <ErrorBoundary fallbackTitle="Admin Portal Error">
              <AdminDashboard />
            </ErrorBoundary>
          )}

          {activeTab === 'user-dashboard' && (
            <UserDashboard onNavigate={handleNavigateWithScroll} />
          )}
        </main>

        {/* Global Subscription Modal */}
        <SubscriptionModal />

        {/* AI Bot Assistant Widget (Accessible across all views) */}
        <AIBotAssistant onNavigate={handleNavigateWithScroll} />

        {/* Footer */}
        <Footer onNavigate={handleNavigateWithScroll} />
      </div>
    </SubscriptionProvider>
  </CatalogProvider>
  );
}
