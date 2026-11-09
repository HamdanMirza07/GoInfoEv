import React, { useState, useMemo, useEffect } from 'react';
import { EV_MODELS, EVModel, formatPKR, getFullName } from '../data/evModels';
import { useCatalog } from '../context/CatalogContext';
import { Search, Filter, ExternalLink, Zap, Battery, DollarSign, Gauge, ShieldAlert, FileText, X, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Bot, Sparkles } from 'lucide-react';
import { TabType } from './Navbar';
import { AnimatedEVBikeSvg } from './EVSvgIllustrations';

interface ProductsCatalogProps {
  onSelectModelForTool?: (modelId: string, tool: TabType) => void;
}

// Helper to parse numerical motor wattage
function getMotorWattage(motorStr: string): number {
  if (!motorStr) return 0;
  const match = motorStr.match(/(\d+)\s*W/i) || motorStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export const ProductsCatalog: React.FC<ProductsCatalogProps> = ({ onSelectModelForTool }) => {
  const { models: activeModels } = useCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [batteryTypeFilter, setBatteryTypeFilter] = useState('all');
  const [motorPowerFilter, setMotorPowerFilter] = useState('all');
  const [rangeFilter, setRangeFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [selectedModelModal, setSelectedModelModal] = useState<EVModel | null>(null);

  const brands = ['all', ...Array.from(new Set(activeModels.map(m => m.brand)))].sort();

  const resetAllFilters = () => {
    setSearchTerm('');
    setBrandFilter('all');
    setBatteryTypeFilter('all');
    setMotorPowerFilter('all');
    setRangeFilter('all');
    setPriceFilter('all');
    setCurrentPage(1);
  };

  const activeFilterCount = [
    brandFilter !== 'all',
    batteryTypeFilter !== 'all',
    motorPowerFilter !== 'all',
    rangeFilter !== 'all',
    priceFilter !== 'all',
    searchTerm.trim() !== ''
  ].filter(Boolean).length;

  const filtered = activeModels.filter(m => {
    // 1. Brand Filter
    const matchesBrand = brandFilter === 'all' || m.brand === brandFilter;

    // 2. Battery Type Filter
    const matchesBattery = batteryTypeFilter === 'all' || 
      m.chemistry === batteryTypeFilter ||
      m.batteryType.toLowerCase().includes(batteryTypeFilter.toLowerCase());

    // 3. Motor Power Filter
    const wattage = getMotorWattage(m.motor);
    let matchesMotor = true;
    if (motorPowerFilter === 'under-1000') matchesMotor = wattage < 1000;
    else if (motorPowerFilter === '1000-1500') matchesMotor = wattage >= 1000 && wattage <= 1500;
    else if (motorPowerFilter === '1500-2500') matchesMotor = wattage > 1500 && wattage <= 2500;
    else if (motorPowerFilter === 'over-2500') matchesMotor = wattage > 2500;

    // 4. Mileage / Range Filter
    const maxRange = m.rangeMax || m.rangeMin || 0;
    let matchesRange = true;
    if (rangeFilter === 'under-70') matchesRange = maxRange < 70;
    else if (rangeFilter === '70-100') matchesRange = maxRange >= 70 && maxRange <= 100;
    else if (rangeFilter === '100-140') matchesRange = maxRange > 100 && maxRange <= 140;
    else if (rangeFilter === 'over-140') matchesRange = maxRange > 140;

    // 5. Price Range Filter
    const price = m.price;
    let matchesPrice = true;
    if (priceFilter === 'under-200k') matchesPrice = price !== null && price < 200000;
    else if (priceFilter === '200k-275k') matchesPrice = price !== null && price >= 200000 && price <= 275000;
    else if (priceFilter === '275k-350k') matchesPrice = price !== null && price > 275000 && price <= 350000;
    else if (priceFilter === 'over-350k') matchesPrice = price !== null && price > 350000;

    // 6. Search Query
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      m.brand.toLowerCase().includes(q) ||
      m.model.toLowerCase().includes(q) ||
      (m.variant && m.variant.toLowerCase().includes(q)) ||
      (m.category && m.category.toLowerCase().includes(q)) ||
      m.batteryType.toLowerCase().includes(q) ||
      m.motor.toLowerCase().includes(q);

    return matchesBrand && matchesBattery && matchesMotor && matchesRange && matchesPrice && matchesSearch;
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(3);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, brandFilter, batteryTypeFilter, motorPowerFilter, rangeFilter, priceFilter]);

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFiltered);

  const paginatedModels = useMemo(() => {
    return filtered.slice(startIndex, endIndex);
  }, [filtered, startIndex, endIndex]);

  const goToPage = (pageNumber: number) => {
    const target = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-[#F5F8F6] border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden text-[#071B2B]">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#16A36A]/12 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#F0B429]/12 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-[#071B2B] border border-slate-200 text-xs font-bold mb-3 shadow-xs">
              <FileText className="w-3.5 h-3.5 text-[#16A36A]" />
              <span>EV Model Specification Explorer</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#071B2B] tracking-tight">
              Pakistan EV Fleet Catalog
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 font-normal">
              Complete calibrated datasheet of {activeModels.length} verified EV motorcycle models in Pakistan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1.5 rounded-lg">
              Showing {filtered.length > 0 ? startIndex + 1 : 0}–{endIndex} of {filtered.length} Models
            </span>
            {totalPages > 1 && (
              <span className="text-xs text-purple-700 font-bold bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                Page {validCurrentPage} of {totalPages}
              </span>
            )}
            {activeFilterCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors border border-rose-200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Filters ({activeFilterCount})
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="space-y-4 mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-purple-600" /> Catalog Smart Filters
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search bike model, variant, or specs (e.g. GT30, Fairy, Metrix, S1, LFP)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-purple-600 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 5 Dropdown Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* 1. Brand Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Brand</label>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-purple-600"
              >
                <option value="all"> All Brands ({EV_MODELS.length})</option>
                {brands.filter(b => b !== 'all').map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* 2. Battery Type Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Battery Type</label>
              <select
                value={batteryTypeFilter}
                onChange={(e) => setBatteryTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-purple-600"
              >
                <option value="all"> All Battery Types</option>
                <option value="lfp">Lithium LFP (Iron Phosphate)</option>
                <option value="graphene">Graphene / Gel Pack</option>
                <option value="nmc">Ternary Lithium (NMC)</option>
                <option value="lead-acid">Lead-Acid</option>
              </select>
            </div>

            {/* 3. Motor Power Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Motor Power</label>
              <select
                value={motorPowerFilter}
                onChange={(e) => setMotorPowerFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-purple-600"
              >
                <option value="all"> All Motors</option>
                <option value="under-1000">&lt; 1000W</option>
                <option value="1000-1500">1000W – 1500W</option>
                <option value="1500-2500">1500W – 2500W</option>
                <option value="over-2500">&gt; 2500W</option>
              </select>
            </div>

            {/* 4. Mileage / Range Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Mileage / Range</label>
              <select
                value={rangeFilter}
                onChange={(e) => setRangeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-purple-600"
              >
                <option value="all"> All Ranges</option>
                <option value="under-70">&lt; 70 km</option>
                <option value="70-100">70 km – 100 km</option>
                <option value="100-140">100 km – 140 km</option>
                <option value="over-140">&gt; 140 km</option>
              </select>
            </div>

            {/* 5. Price Range Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Price Range</label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-purple-600"
              >
                <option value="all"> All Prices</option>
                <option value="under-200k">&lt; Rs 200,000</option>
                <option value="200k-275k">Rs 200,000 – 275,000</option>
                <option value="275k-350k">Rs 275,000 – 350,000</option>
                <option value="over-350k">&gt; Rs 350,000</option>
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedModels.map((model) => (
          <div
            key={model.id}
            className="bg-white border border-slate-200 hover:border-purple-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="w-full h-44 bg-gradient-to-b from-slate-50 to-purple-50/20 rounded-xl overflow-hidden mb-3.5 flex items-center justify-center p-2 border border-slate-100 relative group-hover:border-purple-300 transition-colors">
                {model.image ? (
                  <img
                    src={model.image}
                    alt={getFullName(model)}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 filter drop-shadow-xs"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent) {
                        const fallback = parent.querySelector('.svg-catalog-fallback');
                        if (fallback) fallback.classList.remove('hidden');
                      }
                    }}
                  />
                ) : null}
                <div className={`svg-catalog-fallback ${model.image ? 'hidden' : 'block'} w-full h-full flex items-center justify-center`}>
                  <AnimatedEVBikeSvg className="w-full h-32 text-purple-600" />
                </div>
              </div>

              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {model.brand}
                    </span>
                    {model.category && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        {model.category}
                      </span>
                    )}
                    {model.featureHighlights && model.featureHighlights.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                        {model.featureHighlights.length} Visual Features
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {model.model} {model.variant ? <span className="text-purple-600 font-normal">({model.variant})</span> : ''}
                  </h3>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  model.chemistry === 'lfp' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  model.chemistry === 'graphene' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  model.chemistry === 'nmc' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-rose-50 text-red-700 border-rose-200'
                }`}>
                  {model.batteryType}
                </span>
              </div>

              {/* Specs Pills */}
              <div className="grid grid-cols-2 gap-2 my-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Capacity</span>
                  <strong className="text-slate-800 text-sm">{model.batteryWh} Wh</strong>
                  <span className="text-[10px] text-slate-500 block">{model.voltage}V {model.ampHours}Ah</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Range</span>
                  <strong className="text-blue-600 text-sm">{model.rangeMin === model.rangeMax ? `${model.rangeMin} km` : `${model.rangeMin}-${model.rangeMax} km`}</strong>
                  <span className="text-[10px] text-slate-500 block">Speed: {model.topSpeed}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 mb-4">
                <div className="flex justify-between">
                  <span>Motor:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[180px]">{model.motor}</span>
                </div>
                <div className="flex justify-between">
                  <span>Charge Time:</span>
                  <span className="font-bold text-slate-800">{model.chargeTime}</span>
                </div>
                {model.brakes && (
                  <div className="flex justify-between">
                    <span>Brakes:</span>
                    <span className="font-bold text-slate-800 truncate max-w-[180px]">{model.brakes}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Ex-Factory</span>
                <span className="text-base font-extrabold text-purple-700">{formatPKR(model.price)}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedModelModal(model)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                >
                  Full Specs
                </button>
                <button
                  onClick={() => onSelectModelForTool && onSelectModelForTool(model.id, 'range')}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Simulate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Catalog Pagination Controls */}
      {filtered.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          {/* Summary & Per-Page selector */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs text-slate-600">
            <span>
              Showing <span className="font-extrabold text-slate-900">{startIndex + 1}</span>–
              <span className="font-extrabold text-slate-900">{endIndex}</span> of{' '}
              <span className="font-extrabold text-slate-900">{filtered.length}</span> models
            </span>

            <span className="hidden sm:inline text-slate-300">|</span>

            <div className="flex items-center gap-1.5">
              {itemsPerPage < totalFiltered ? (
                <button
                  onClick={() => {
                    const nextSize = itemsPerPage === 3 ? 5 : 10;
                    setItemsPerPage(nextSize);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold transition-all hover:bg-purple-700 cursor-pointer"
                >
                  Load More ({itemsPerPage === 3 ? 'Show 5' : 'Show 10'})
                </button>
              ) : (
                <span className="text-xs font-bold text-slate-500">All models loaded</span>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(1)}
                disabled={validCurrentPage === 1}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="First Page"
                aria-label="First page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => goToPage(validCurrentPage - 1)}
                disabled={validCurrentPage === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xs font-bold transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {getPageNumbers().map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span key={`catalog-ellipsis-${idx}`} className="px-1.5 text-slate-400 text-xs font-bold">
                        …
                      </span>
                    );
                  }
                  const isCurrent = p === validCurrentPage;
                  return (
                    <button
                      key={`catalog-page-${p}`}
                      onClick={() => goToPage(p as number)}
                      className={`min-w-[34px] h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-purple-600 text-white shadow-xs font-black ring-2 ring-purple-600/20'
                          : 'text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(validCurrentPage + 1)}
                disabled={validCurrentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xs font-bold transition-colors"
                aria-label="Next page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>

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

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl text-slate-500 space-y-3">
          <p className="font-bold text-slate-700">No EV models matched your selected search or filters.</p>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Model Specs Modal */}
      {selectedModelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded bg-purple-100 text-purple-800 text-xs font-bold uppercase">
                    {selectedModelModal.brand}
                  </span>
                  {selectedModelModal.category && (
                    <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
                      {selectedModelModal.category}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  {getFullName(selectedModelModal)}
                </h2>
              </div>
              <button
                onClick={() => setSelectedModelModal(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            {selectedModelModal.image && (
              <div className="w-full h-52 sm:h-60 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-3 border border-slate-200">
                <img
                  src={selectedModelModal.image}
                  alt={getFullName(selectedModelModal)}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Retail Price</span>
                <strong className="text-lg text-purple-700 font-extrabold">{formatPKR(selectedModelModal.price)}</strong>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Wh Capacity</span>
                <strong className="text-lg text-slate-900 font-extrabold">{selectedModelModal.batteryWh} Wh</strong>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Voltage &amp; Ah</span>
                <span className="text-slate-800 font-bold">{selectedModelModal.voltage}V / {selectedModelModal.ampHours}Ah</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Official Range</span>
                <span className="text-blue-600 font-bold">{selectedModelModal.rangeMin}-{selectedModelModal.rangeMax} km</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Motor Power</span>
                <span className="text-slate-800 font-bold">{selectedModelModal.motor}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Top Speed</span>
                <span className="text-slate-800 font-bold">{selectedModelModal.topSpeed}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Charge Speed</span>
                <span className="text-slate-800 font-bold">{selectedModelModal.chargeTime}</span>
              </div>
              {selectedModelModal.charger && (
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Charger Spec</span>
                  <span className="text-slate-800 font-bold">{selectedModelModal.charger}</span>
                </div>
              )}
              {selectedModelModal.speedModes && (
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Speed Modes</span>
                  <span className="text-slate-800 font-bold">{selectedModelModal.speedModes} Modes</span>
                </div>
              )}
              {selectedModelModal.weight && (
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Curb Weight</span>
                  <span className="text-slate-800 font-bold">{selectedModelModal.weight}</span>
                </div>
              )}
              {selectedModelModal.loadingCapacity && (
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Max Payload</span>
                  <span className="text-slate-800 font-bold">{selectedModelModal.loadingCapacity}</span>
                </div>
              )}
              {selectedModelModal.brakes && (
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Brake System</span>
                  <span className="text-slate-800 font-bold">{selectedModelModal.brakes}</span>
                </div>
              )}
              {selectedModelModal.security && (
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Security</span>
                  <span className="text-slate-800 font-bold">{selectedModelModal.security}</span>
                </div>
              )}
              {selectedModelModal.waterResistance && (
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Water Ingress</span>
                  <span className="text-slate-800 font-bold">{selectedModelModal.waterResistance}</span>
                </div>
              )}
            </div>

            {/* Colors & Key Features */}
            {(selectedModelModal.colors || selectedModelModal.keyFeatures) && (
              <div className="space-y-3">
                {selectedModelModal.colors && selectedModelModal.colors.length > 0 && (
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-extrabold tracking-wider block mb-1.5">
                      Available Official Colors
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedModelModal.colors.map(col => (
                        <span key={col} className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedModelModal.keyFeatures && selectedModelModal.keyFeatures.length > 0 && (
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-extrabold tracking-wider block mb-1.5">
                      Key Highlights &amp; Equipment
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {selectedModelModal.keyFeatures.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium bg-purple-50/50 px-2.5 py-1.5 rounded-lg border border-purple-100">
                          <span className="text-purple-600 font-bold">✓</span> {feat}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Official Visual Highlights & Engineering Breakdown */}
            {selectedModelModal.featureHighlights && selectedModelModal.featureHighlights.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                      Official Visual Highlights &amp; Engineering
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    {selectedModelModal.featureHighlights.length} Official Highlights
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedModelModal.featureHighlights.map((feat, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col group"
                    >
                      {feat.image && (
                        <div className="w-full h-44 bg-slate-900/5 overflow-hidden flex items-center justify-center relative">
                          <img
                            src={feat.image}
                            alt={feat.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] font-extrabold text-white">
                            Highlight #{idx + 1}
                          </span>
                        </div>
                      )}
                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm mb-1.5 group-hover:text-purple-700 transition-colors">
                          {feat.title}
                        </h5>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                          {feat.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedModelModal.warranty && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                <span className="font-bold block uppercase text-[10px] text-emerald-800 mb-0.5">Official Warranty</span>
                <span>{selectedModelModal.warranty}</span>
              </div>
            )}

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 space-y-2">
              <strong className="block font-bold">Datasheet Note:</strong>
              <p>{selectedModelModal.note}</p>
              {selectedModelModal.source && (
                <a
                  href={selectedModelModal.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-purple-700 underline mt-1"
                >
                  {selectedModelModal.sourceName} Official Link <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedModelModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const id = selectedModelModal.id;
                  setSelectedModelModal(null);
                  if (onSelectModelForTool) onSelectModelForTool(id, 'range');
                }}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl"
              >
                Launch in Range Estimator
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

