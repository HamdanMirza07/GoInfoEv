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
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { CatalogProvider } from './context/CatalogContext';
import { SubscriptionModal } from './components/SubscriptionModal';
import { CalculatorGuard } from './components/CalculatorGuard';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SeoHead } from './components/SeoHead';
import type { EVModel } from './data/evModels';
import type { BlogPost } from './components/BlogsPage';

interface ParsedRouteState {
  tab: TabType;
  modelId?: string;
  articleId?: string;
  searchQuery?: string;
}

function parseRouteFromWindow(): ParsedRouteState {
  if (typeof window === 'undefined') return { tab: 'home' };
  const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
  const segments = rawPath.split('/').filter(Boolean);
  const firstSegment = (segments[0] || '').toLowerCase();
  const secondSegment = segments[1] ? decodeURIComponent(segments[1]) : undefined;

  const hash = window.location.hash.replace(/^#+/, '').toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const paramTab = (searchParams.get('tab') || searchParams.get('page') || '').toLowerCase();
  const paramModel = searchParams.get('model') || undefined;
  const paramArticle = searchParams.get('article') || undefined;
  const paramQuery = searchParams.get('q') || undefined;

  const validTabs: TabType[] = [
    'home', 'charging-stations', 'products', 'comparison', 'range', 'charging',
    'battery', 'savings', 'solar', 'rider', 'blogs', 'content', 'about', 'contact',
    'admin', 'user-dashboard'
  ];

  if (firstSegment === 'ev' && secondSegment) {
    return { tab: 'products', modelId: secondSegment };
  }
  if (firstSegment === 'blogs' && secondSegment) {
    return { tab: 'blogs', articleId: secondSegment };
  }
  if (firstSegment === 'admin' || hash === 'admin' || paramTab === 'admin') {
    return { tab: 'admin' };
  }
  if (validTabs.includes(firstSegment as TabType)) {
    return {
      tab: firstSegment as TabType,
      modelId: firstSegment === 'products' ? paramModel : undefined,
      articleId: firstSegment === 'blogs' ? paramArticle : undefined,
      searchQuery: firstSegment === 'products' ? paramQuery : undefined,
    };
  }
  if (validTabs.includes(hash as TabType)) return { tab: hash as TabType };
  if (validTabs.includes(paramTab as TabType)) return { tab: paramTab as TabType };
  return { tab: 'home' };
}

export default function App() {
  const initialRoute = parseRouteFromWindow();
  const [activeTab, setActiveTab] = useState<TabType>(initialRoute.tab);
  const [activeModelId, setActiveModelId] = useState<string>(initialRoute.modelId || 'crown-flash');
  const [activeArticleId, setActiveArticleId] = useState<string | null>(initialRoute.articleId || null);
  const [activeSeoModel, setActiveSeoModel] = useState<EVModel | null>(null);
  const [activeSeoArticle, setActiveSeoArticle] = useState<BlogPost | null>(null);
  const [catalogRequest, setCatalogRequest] = useState<{
    modelId?: string;
    searchQuery?: string;
    nonce: number;
  } | null>(() =>
    initialRoute.modelId || initialRoute.searchQuery
      ? {
          modelId: initialRoute.modelId,
          searchQuery: initialRoute.searchQuery,
          nonce: Date.now(),
        }
      : null
  );

  // Sync tab changes with browser URL
  const handleNavigateWithScroll = (tab: TabType) => {
    setActiveTab(tab);
    if (tab !== 'products') {
      setActiveSeoModel(null);
    }
    if (tab !== 'blogs') {
      setActiveArticleId(null);
      setActiveSeoArticle(null);
    }
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

  const handleSelectModelFromSearch = (modelId: string, tool?: TabType) => {
    setActiveModelId(modelId);
    if (tool && tool !== 'products') {
      handleNavigateWithScroll(tool);
    } else {
      setCatalogRequest({ modelId, nonce: Date.now() });
      setActiveTab('products');
      if (typeof window !== 'undefined') {
        const targetUrl = `/ev/${encodeURIComponent(modelId)}`;
        if (window.location.pathname !== targetUrl) {
          window.history.pushState({ tab: 'products', modelId }, '', targetUrl);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleSearchCatalog = (query: string) => {
    setCatalogRequest({ searchQuery: query, nonce: Date.now() });
    handleNavigateWithScroll('products');
  };

  // Listen to browser Back/Forward & direct URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      const parsed = parseRouteFromWindow();
      setActiveTab(parsed.tab);
      if (parsed.tab === 'products') {
        if (parsed.modelId || parsed.searchQuery) {
          setCatalogRequest({
            modelId: parsed.modelId,
            searchQuery: parsed.searchQuery,
            nonce: Date.now(),
          });
        } else {
          setActiveSeoModel(null);
        }
      } else {
        setActiveSeoModel(null);
      }

      if (parsed.tab === 'blogs') {
        setActiveArticleId(parsed.articleId || null);
        if (!parsed.articleId) setActiveSeoArticle(null);
      } else {
        setActiveArticleId(null);
        setActiveSeoArticle(null);
      }
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
        <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F5F8F6] text-[#071B2B] font-sans flex flex-col selection:bg-[#16A36A] selection:text-white">
        <SeoHead
          activeTab={activeTab}
          activeModel={activeSeoModel}
          activeArticle={activeSeoArticle}
        />
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={handleNavigateWithScroll}
          onSelectModelFromSearch={handleSelectModelFromSearch}
          onSearchCatalog={handleSearchCatalog}
        />

        {/* Main Page Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 lg:pb-0">
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
            <ProductsCatalog
              onSelectModelForTool={handleSelectModelForTool}
              initialModelId={catalogRequest?.modelId}
              initialSearchQuery={catalogRequest?.searchQuery}
              requestNonce={catalogRequest?.nonce}
              onModelModalChange={setActiveSeoModel}
            />
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
            <BlogsPage
              onNavigate={handleNavigateWithScroll}
              initialArticleId={activeArticleId}
              onArticleChange={setActiveSeoArticle}
            />
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
        {/* <AIBotAssistant onNavigate={handleNavigateWithScroll} /> */}

        {/* Fixed Mobile Bottom Navigation Bar (< lg screen breakpoint) */}
        <MobileBottomNav activeTab={activeTab} setActiveTab={handleNavigateWithScroll} />

        {/* Footer */}
        <Footer onNavigate={handleNavigateWithScroll} />

        {/* Offline Connectivity Status Badge */}
        <OfflineIndicator />
      </div>
    </SubscriptionProvider>
  </CatalogProvider>
  );
}
