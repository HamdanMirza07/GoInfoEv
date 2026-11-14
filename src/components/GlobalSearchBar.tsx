import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  X,
  ArrowRight,
  Calculator,
  Gauge,
  Zap,
  Sun,
  ShieldCheck,
  Bike,
  SlidersHorizontal,
  Database,
  BookOpen,
  FileText,
  Info,
  Mail,
  Sparkles
} from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { EVModel, formatPKR, getFullName } from '../data/evModels';
import { TabType } from './Navbar';
import { AnimatedEVBikeSvg } from './EVSvgIllustrations';

interface ToolSearchEntry {
  id: TabType;
  label: string;
  category: 'Calculator' | 'Tool' | 'Page';
  description: string;
  keywords: string[];
  icon: React.ReactNode;
}

const SEARCHABLE_TOOLS: ToolSearchEntry[] = [
  {
    id: 'savings',
    label: 'Fuel Savings Calculator',
    category: 'Calculator',
    description: 'EV vs Petrol monthly savings, ROI & breakeven timeline',
    keywords: ['petrol', 'fuel', 'savings', 'roi', 'payback', 'breakeven', 'monthly', 'cost', 'money'],
    icon: <Calculator className="w-4 h-4 text-[#16A36A]" />
  },
  {
    id: 'range',
    label: 'Range & Route Estimator',
    category: 'Calculator',
    description: 'Real-world riding range, load, speed & Google Maps route',
    keywords: ['range', 'distance', 'km', 'maps', 'route', 'speed', 'load', 'elevation', 'mileage'],
    icon: <Gauge className="w-4 h-4 text-[#16A36A]" />
  },
  {
    id: 'charging',
    label: 'Charging Cost Calculator',
    category: 'Calculator',
    description: 'WAPDA / NEPRA electricity slabs, units & full charge bill',
    keywords: ['charging', 'wapda', 'electricity', 'bill', 'tariff', 'slab', 'nepra', 'units', 'kwh', 'ke', 'lesco'],
    icon: <Zap className="w-4 h-4 text-[#F0B429]" />
  },
  {
    id: 'solar',
    label: 'Solar Power Calculator',
    category: 'Calculator',
    description: 'Solar PV sizing, inverter & zero-cost EV charging',
    keywords: ['solar', 'panel', 'pv', 'inverter', 'net metering', 'sunshine', 'free charging'],
    icon: <Sun className="w-4 h-4 text-[#F0B429]" />
  },
  {
    id: 'battery',
    label: 'Battery Health & SOH Tracker',
    category: 'Tool',
    description: 'LFP & Graphene cycle life, degradation & SOH retention',
    keywords: ['battery', 'soh', 'lifespan', 'degradation', 'lfp', 'graphene', 'cycles', 'warranty', 'health'],
    icon: <ShieldCheck className="w-4 h-4 text-[#16A36A]" />
  },
  {
    id: 'rider',
    label: 'Rider Profit Calculator',
    category: 'Calculator',
    description: 'Bykea, InDrive, Yango & Foodpanda net earnings (Bike & Car)',
    keywords: ['rider', 'bykea', 'indrive', 'yango', 'foodpanda', 'delivery', 'cab', 'car', 'bike', 'earnings', 'profit'],
    icon: <Bike className="w-4 h-4 text-[#16A36A]" />
  },
  {
    id: 'comparison',
    label: 'Compare Bikes Side-by-Side',
    category: 'Tool',
    description: 'Compare battery, top speed, motor power & prices',
    keywords: ['compare', 'comparison', 'vs', 'side by side', 'specs', 'difference'],
    icon: <SlidersHorizontal className="w-4 h-4 text-[#16A36A]" />
  },
  {
    id: 'products',
    label: 'Pakistan EV Fleet Catalog',
    category: 'Tool',
    description: 'Browse all verified electric scooters & motorcycles',
    keywords: ['catalog', 'fleet', 'bikes', 'scooters', 'models', 'prices', 'datasheets', 'all'],
    icon: <Database className="w-4 h-4 text-[#16A36A]" />
  },
  {
    id: 'content',
    label: 'EV Buyer Guides & FAQs',
    category: 'Page',
    description: 'Pre-purchase checklist, battery tips & home wiring guides',
    keywords: ['guide', 'faq', 'checklist', 'wiring', 'maintenance', 'tips'],
    icon: <BookOpen className="w-4 h-4 text-[#16A36A]" />
  },
  {
    id: 'blogs',
    label: 'Blogs & Insights',
    category: 'Page',
    description: '40+ EV technology, repair & tariff articles',
    keywords: ['blog', 'article', 'news', 'insights'],
    icon: <FileText className="w-4 h-4 text-[#16A36A]" />
  },
  {
    id: 'about',
    label: 'About Us',
    category: 'Page',
    description: 'About goinfoEV platform & team',
    keywords: ['about', 'team', 'hamdan', 'orinexai'],
    icon: <Info className="w-4 h-4 text-slate-600" />
  },
  {
    id: 'contact',
    label: 'Contact Us',
    category: 'Page',
    description: 'WhatsApp & email inquiries',
    keywords: ['contact', 'whatsapp', 'email', 'support', 'help'],
    icon: <Mail className="w-4 h-4 text-[#16A36A]" />
  }
];

interface GlobalSearchBarProps {
  onNavigate: (tab: TabType) => void;
  onSelectModel?: (modelId: string, tool?: TabType) => void;
  onSearchCatalog?: (query: string) => void;
  variant?: 'desktop' | 'mobile';
}

type SearchResultItem =
  | { type: 'tool'; tool: ToolSearchEntry }
  | { type: 'model'; model: EVModel };

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  onNavigate,
  onSelectModel,
  onSearchCatalog,
  variant = 'desktop'
}) => {
  const { models } = useCatalog();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmedQuery = query.trim().toLowerCase();

  // Filter tools
  const matchedTools = useMemo(() => {
    if (!trimmedQuery) {
      // Show top quick tools when focused with empty query
      return SEARCHABLE_TOOLS.slice(0, 5);
    }
    return SEARCHABLE_TOOLS.filter((t) => {
      return (
        t.label.toLowerCase().includes(trimmedQuery) ||
        t.description.toLowerCase().includes(trimmedQuery) ||
        t.category.toLowerCase().includes(trimmedQuery) ||
        t.keywords.some((k) => k.includes(trimmedQuery))
      );
    }).slice(0, 4);
  }, [trimmedQuery]);

  // Filter EV models
  const matchedModels = useMemo(() => {
    if (!trimmedQuery) return [];
    const tokens = trimmedQuery.split(/\s+/).filter(Boolean);
    return models
      .filter((m) => {
        const searchable = [
          m.brand,
          m.model,
          m.variant || '',
          m.category || '',
          m.batteryType,
          m.chemistry,
          m.motor
        ]
          .join(' ')
          .toLowerCase();
        return tokens.every((tok) => searchable.includes(tok));
      })
      .slice(0, 6);
  }, [models, trimmedQuery]);

  const totalModelMatches = useMemo(() => {
    if (!trimmedQuery) return 0;
    const tokens = trimmedQuery.split(/\s+/).filter(Boolean);
    return models.filter((m) => {
      const searchable = [
        m.brand,
        m.model,
        m.variant || '',
        m.category || '',
        m.batteryType,
        m.chemistry,
        m.motor
      ]
        .join(' ')
        .toLowerCase();
      return tokens.every((tok) => searchable.includes(tok));
    }).length;
  }, [models, trimmedQuery]);

  // Flat list for keyboard arrow navigation (matches visual top-to-bottom order)
  const flatItems: SearchResultItem[] = useMemo(() => {
    const items: SearchResultItem[] = [];
    matchedModels.forEach((model) => items.push({ type: 'model', model }));
    matchedTools.forEach((tool) => items.push({ type: 'tool', tool }));
    return items;
  }, [matchedModels, matchedTools]);

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [trimmedQuery]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcut: Cmd/Ctrl + K or "/" (desktop variant only to avoid double-focusing)
  useEffect(() => {
    if (variant !== 'desktop') return;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === '/' && !isInputFocused) {
        // Only focus desktop input if visible
        if (inputRef.current && inputRef.current.offsetParent !== null) {
          e.preventDefault();
          inputRef.current.focus();
          setIsOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [variant]);

  const selectTool = (toolId: TabType) => {
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
    onNavigate(toolId);
  };

  const selectModel = (modelId: string, tool?: TabType) => {
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
    if (onSelectModel) {
      onSelectModel(modelId, tool);
    } else {
      onNavigate(tool || 'products');
    }
  };

  const triggerCatalogSearch = () => {
    if (!query.trim()) return;
    const q = query.trim();
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
    if (onSearchCatalog) {
      onSearchCatalog(q);
    } else {
      onNavigate('products');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (flatItems.length === 0) return;
      setHighlightedIndex((prev) => (prev + 1) % flatItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (flatItems.length === 0) return;
      setHighlightedIndex((prev) => (prev <= 0 ? flatItems.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < flatItems.length) {
        const chosen = flatItems[highlightedIndex];
        if (chosen.type === 'tool') {
          selectTool(chosen.tool.id);
        } else {
          selectModel(chosen.model.id);
        }
      } else if (flatItems.length === 1) {
        const only = flatItems[0];
        if (only.type === 'tool') {
          selectTool(only.tool.id);
        } else {
          selectModel(only.model.id);
        }
      } else if (matchedModels.length > 0) {
        triggerCatalogSearch();
      } else if (matchedTools.length > 0) {
        selectTool(matchedTools[0].id);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${variant === 'desktop' ? 'w-36 xl:w-48 2xl:w-60' : 'w-full'}`}
    >
      {/* Search Input */}
      <div
        className={`flex items-center gap-2 bg-white border transition-all duration-200 rounded-xl px-2.5 ${
          variant === 'desktop' ? 'h-9' : 'h-9.5'
        } ${
          isOpen
            ? 'border-[#16A36A] ring-2 ring-[#16A36A]/15 shadow-sm'
            : 'border-[#071B2B]/20 hover:border-[#16A36A]/50 shadow-2xs'
        }`}
      >
        <Search className={`w-3.5 h-3.5 shrink-0 ${isOpen ? 'text-[#16A36A]' : 'text-slate-400'}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search EVs or tools..."
          aria-label="Global search for EV models and tools"
          aria-expanded={isOpen}
          role="combobox"
          autoComplete="off"
          className="w-full bg-transparent text-xs font-semibold text-[#071B2B] placeholder:text-slate-400 placeholder:font-medium outline-none min-w-0"
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-0.5 rounded-md text-slate-400 hover:text-[#071B2B] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          variant === 'desktop' && (
            <kbd className="hidden 2xl:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-[#F5F8F6] border border-slate-200 rounded-md shrink-0">
              ⌘K
            </kbd>
          )
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden ${
            variant === 'desktop'
              ? 'right-0 w-[360px] xl:w-[420px]'
              : 'left-0 right-0 w-full'
          }`}
          role="listbox"
        >
          <div className="max-h-[70vh] overflow-y-auto divide-y divide-slate-100">
            {/* Section 1: EV Models (shown first when user is typing and models match) */}
            {trimmedQuery && matchedModels.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between px-2.5 py-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    EV Models ({totalModelMatches})
                  </span>
                  {totalModelMatches > matchedModels.length && (
                    <button
                      type="button"
                      onClick={triggerCatalogSearch}
                      className="text-[11px] font-bold text-[#16A36A] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View all in Catalog</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {matchedModels.map((model, idx) => {
                    const itemIndex = idx;
                    const isHighlighted = highlightedIndex === itemIndex;
                    return (
                      <div
                        key={model.id}
                        role="option"
                        aria-selected={isHighlighted}
                        onMouseEnter={() => setHighlightedIndex(itemIndex)}
                        className={`flex items-center justify-between gap-2.5 p-2 rounded-xl transition-colors cursor-pointer ${
                          isHighlighted
                            ? 'bg-[#F5F8F6] ring-1 ring-[#16A36A]/30'
                            : 'hover:bg-[#F5F8F6]'
                        }`}
                        onClick={() => selectModel(model.id)}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-11 h-9 rounded-lg bg-[#F5F8F6] border border-slate-200/80 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                            {model.image ? (
                              <img
                                src={model.image}
                                alt={getFullName(model)}
                                className="max-w-full max-h-full object-contain mix-blend-multiply"
                                loading="lazy"
                              />
                            ) : (
                              <AnimatedEVBikeSvg className="w-8 h-6 text-[#16A36A]" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-extrabold text-[#071B2B] truncate">
                                {getFullName(model)}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium truncate">
                              <span className="text-[#16A36A] font-bold">{formatPKR(model.price)}</span>
                              <span className="mx-1.5 text-slate-300">•</span>
                              <span>
                                {model.rangeMin === model.rangeMax
                                  ? `${model.rangeMin} km`
                                  : `${model.rangeMin}-${model.rangeMax} km`}
                              </span>
                              <span className="mx-1.5 text-slate-300">•</span>
                              <span>{model.batteryLabel || model.batteryType}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectModel(model.id, 'range');
                          }}
                          title="Simulate range in Range Estimator"
                          className="px-2 py-1 rounded-lg bg-white hover:bg-[#16A36A] text-[#071B2B] hover:text-white border border-slate-200 hover:border-[#16A36A] text-[10px] font-bold transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                        >
                          <Gauge className="w-3 h-3" />
                          <span>Range</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 2: Tools & Calculators */}
            {matchedTools.length > 0 && (
              <div className="p-2">
                <div className="px-2.5 py-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    {trimmedQuery ? 'Tools & Pages' : 'Quick Jump to Tools'}
                  </span>
                  {!trimmedQuery && (
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#16A36A]" />
                      Type model name to search {models.length} EVs
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {matchedTools.map((tool, idx) => {
                    const itemIndex = (trimmedQuery ? matchedModels.length : 0) + idx;
                    const isHighlighted = highlightedIndex === itemIndex;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        role="option"
                        aria-selected={isHighlighted}
                        onMouseEnter={() => setHighlightedIndex(itemIndex)}
                        onClick={() => selectTool(tool.id)}
                        className={`w-full flex items-center justify-between gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                          isHighlighted
                            ? 'bg-[#F5F8F6] ring-1 ring-[#16A36A]/30'
                            : 'hover:bg-[#F5F8F6]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#F5F8F6] border border-slate-200/80 flex items-center justify-center shrink-0">
                            {tool.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-[#071B2B] truncate">
                              {tool.label}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {tool.description}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
                          {tool.category}
                          <ArrowRight className="w-3 h-3 text-[#16A36A]" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {trimmedQuery && matchedModels.length === 0 && matchedTools.length === 0 && (
              <div className="p-6 text-center space-y-2">
                <p className="text-xs font-bold text-[#071B2B]">
                  No EV models or tools found for &ldquo;{query.trim()}&rdquo;
                </p>
                <p className="text-[11px] text-slate-500">
                  Try searching a brand (Yadea, Crown, Vlektra, Revoo), battery type (LFP, Graphene), or tool (Savings, Solar, WAPDA).
                </p>
              </div>
            )}
          </div>

          {/* Footer Action when searching models */}
          {trimmedQuery && matchedModels.length > 0 && (
            <button
              type="button"
              onClick={triggerCatalogSearch}
              className="w-full px-4 py-2.5 bg-[#F5F8F6] hover:bg-emerald-50 border-t border-slate-200 text-xs font-extrabold text-[#16A36A] flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Search &ldquo;{query.trim()}&rdquo; in Fleet Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearchBar;
