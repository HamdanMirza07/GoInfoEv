import React, { useState } from 'react';
import { EV_MODELS, EVModel, formatPKR, getFullName } from '../data/evModels';
import { useCatalog } from '../context/CatalogContext';
import { SlidersHorizontal, Plus, Trash2, Check, Sparkles, Zap, Battery, Shield, Gauge, DollarSign, Award, ArrowRight, HelpCircle } from 'lucide-react';

interface ProductComparisonProps {
  onSelectModelForTool?: (modelId: string, tool: string) => void;
}

export const ProductComparison: React.FC<ProductComparisonProps> = ({ onSelectModelForTool }) => {
  const { models } = useCatalog();
  // Default to 2 bike selections
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(() => {
    const default1 = models[0]?.id || EV_MODELS[0]?.id || '';
    const default2 = models[1]?.id || EV_MODELS[1]?.id || '';
    return [default1, default2];
  });

  const [electricityRate, setElectricityRate] = useState(50); // PKR / unit
  const [highlightDifferences, setHighlightDifferences] = useState(false);

  // Helper to update a slot
  const handleModelChange = (index: number, newId: string) => {
    const updated = [...selectedModelIds];
    updated[index] = newId;
    setSelectedModelIds(updated);
  };

  // Add a comparison slot
  const handleAddSlot = () => {
    if (selectedModelIds.length >= 6) return; // Limit to 6
    // find first unused model or pick default
    const unused = models.find(m => !selectedModelIds.includes(m.id));
    const nextId = unused ? unused.id : models[selectedModelIds.length % models.length]?.id || '';
    setSelectedModelIds([...selectedModelIds, nextId]);
  };

  // Remove a comparison slot
  const handleRemoveSlot = (index: number) => {
    if (selectedModelIds.length <= 2) return; // Minimum 2
    const updated = selectedModelIds.filter((_, i) => i !== index);
    setSelectedModelIds(updated);
  };

  // Get full model objects
  const selectedModels: EVModel[] = selectedModelIds.map(id => {
    return models.find(m => m.id === id) || models[0] || EV_MODELS[0];
  });

  // Calculations per model
  const modelStats = selectedModels.map(m => {
    const avgRange = ((m.rangeMin || 0) + (m.rangeMax || m.rangeMin || 0)) / 2;
    const realRange = avgRange * 0.9;
    const unitsToFull = (m.batteryWh / 1000) / 0.85; // 85% charger efficiency
    const costPerFullCharge = unitsToFull * electricityRate;
    const costPerKm = realRange > 0 ? costPerFullCharge / realRange : 0;
    
    // Monthly 1500km cost comparison vs Petrol (Rs 280/L @ 45 km/L -> Rs 6.22/km -> Rs 9333/mo)
    const petrolMonthlyCost = (1500 / 45) * 280;
    const evMonthlyCost = 1500 * costPerKm;
    const monthlySavings = Math.max(0, petrolMonthlyCost - evMonthlyCost);

    return {
      model: m,
      avgRange,
      realRange,
      unitsToFull,
      costPerFullCharge,
      costPerKm,
      monthlySavings
    };
  });

  // Calculate best metrics across selected bikes
  const bestPrice = Math.min(...selectedModels.map(m => m.price || Infinity));
  const bestBattery = Math.max(...selectedModels.map(m => m.batteryWh));
  const bestRange = Math.max(...modelStats.map(s => s.realRange));
  const lowestCostPerKm = Math.min(...modelStats.map(s => s.costPerKm));

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold mb-3">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Multi-Model Comparison Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              EV Bike Comparison Calculator
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
              Compare specifications, battery chemistry, real range, charging costs, and monthly savings side-by-side across Pakistani electric bikes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setHighlightDifferences(!highlightDifferences)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                highlightDifferences
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
              }`}
            >
              {highlightDifferences ? '✓ Highlighting Best Specs' : 'Highlight Best Specs'}
            </button>

            {selectedModelIds.length < 6 && (
              <button
                onClick={handleAddSlot}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Bike ({selectedModelIds.length}/6)
              </button>
            )}
          </div>
        </div>

        {/* Global Settings Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs">
          <div className="flex items-center gap-3">
            <label className="font-bold text-slate-700">WAPDA Tariff Rate (PKR/Unit):</label>
            <input
              type="number"
              value={electricityRate}
              onChange={(e) => setElectricityRate(Number(e.target.value))}
              className="w-20 p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 text-center outline-none focus:border-blue-600"
            />
          </div>
          <span className="text-slate-400">Baseline for charge cost &amp; monthly savings calculation.</span>
        </div>
      </div>

      {/* Main Side-by-Side Comparison Grid */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[700px]">
          
          {/* Top Bike Pickers Row */}
          <div className={`grid gap-4 mb-6 ${
            selectedModelIds.length === 2 ? 'grid-cols-2' :
            selectedModelIds.length === 3 ? 'grid-cols-3' :
            selectedModelIds.length === 4 ? 'grid-cols-4' :
            selectedModelIds.length === 5 ? 'grid-cols-5' : 'grid-cols-6'
          }`}>
            {selectedModels.map((m, idx) => (
              <div key={`picker-${idx}`} className="bg-white border-2 border-indigo-500/20 rounded-2xl p-4 shadow-xs relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">
                    Bike #{idx + 1}
                  </span>
                  {selectedModelIds.length > 2 && (
                    <button
                      onClick={() => handleRemoveSlot(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove comparison slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <select
                  value={m.id}
                  onChange={(e) => handleModelChange(idx, e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-600"
                >
                  {models.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.brand} - {model.model} {model.variant ? `(${model.variant})` : ''} {(model as any).isAiDiscovered ? '★' : ''}
                    </option>
                  ))}
                </select>

                {m.image && (
                  <div className="w-full h-28 bg-slate-50/70 rounded-xl overflow-hidden flex items-center justify-center p-1.5 border border-slate-100">
                    <img
                      src={m.image}
                      alt={getFullName(m)}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="text-center pt-1">
                  {m.category && (
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 mb-1">
                      {m.category}
                    </span>
                  )}
                  <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{getFullName(m)}</h3>
                  <div className="text-lg font-black text-indigo-600 mt-1">{formatPKR(m.price)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Cards / Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100">
            
            {/* Section 1: Key Highlights / Badges */}
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 font-bold text-xs uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Key Strengths &amp; Top Awards
            </div>
            <div className={`grid gap-4 p-4 divide-x divide-slate-100 ${
              selectedModelIds.length === 2 ? 'grid-cols-2' :
              selectedModelIds.length === 3 ? 'grid-cols-3' :
              selectedModelIds.length === 4 ? 'grid-cols-4' :
              selectedModelIds.length === 5 ? 'grid-cols-5' : 'grid-cols-6'
            }`}>
              {modelStats.map((stat, idx) => {
                const isBestPrice = stat.model.price === bestPrice;
                const isBestBattery = stat.model.batteryWh === bestBattery;
                const isBestRange = Math.abs(stat.realRange - bestRange) < 0.1;
                const isLowestCost = Math.abs(stat.costPerKm - lowestCostPerKm) < 0.01;

                return (
                  <div key={`badges-${idx}`} className="px-2 space-y-2">
                    {isBestPrice && (
                      <span className="block text-center text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg border border-emerald-200">
                        🏆 Lowest Price
                      </span>
                    )}
                    {isBestBattery && (
                      <span className="block text-center text-[10px] font-extrabold bg-indigo-100 text-indigo-800 px-2 py-1 rounded-lg border border-indigo-200">
                        🔋 Largest Battery Pack
                      </span>
                    )}
                    {isBestRange && (
                      <span className="block text-center text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-1 rounded-lg border border-blue-200">
                        ⚡ Longest Range
                      </span>
                    )}
                    {isLowestCost && (
                      <span className="block text-center text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-1 rounded-lg border border-amber-200">
                        💰 Lowest Running Cost
                      </span>
                    )}
                    {!isBestPrice && !isBestBattery && !isBestRange && !isLowestCost && (
                      <span className="block text-center text-[10px] font-bold text-slate-400 py-1">
                        Balanced Model
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Section 2: Battery & Energy */}
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 font-bold text-xs uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <Battery className="w-4 h-4 text-indigo-600" /> Battery &amp; Chemistry Specs
            </div>

            {/* Row: Battery Capacity */}
            <div className="p-4">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">Battery Capacity (Wh)</span>
              <div className={`grid gap-4 ${
                selectedModelIds.length === 2 ? 'grid-cols-2' :
                selectedModelIds.length === 3 ? 'grid-cols-3' :
                selectedModelIds.length === 4 ? 'grid-cols-4' :
                selectedModelIds.length === 5 ? 'grid-cols-5' : 'grid-cols-6'
              }`}>
                {modelStats.map((s, i) => (
                  <div key={`bat-${i}`} className={`p-3 rounded-xl border ${
                    highlightDifferences && s.model.batteryWh === bestBattery
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <div className="text-base font-extrabold">{s.model.batteryWh} Wh</div>
                    <div className="text-[11px] text-slate-500">{(s.model.batteryWh / 1000).toFixed(2)} kWh Pack</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row: Battery Chemistry & Type */}
            <div className="p-4">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">Battery Type &amp; Chemistry</span>
              <div className={`grid gap-4 ${
                selectedModelIds.length === 2 ? 'grid-cols-2' :
                selectedModelIds.length === 3 ? 'grid-cols-3' :
                selectedModelIds.length === 4 ? 'grid-cols-4' :
                selectedModelIds.length === 5 ? 'grid-cols-5' : 'grid-cols-6'
              }`}>
                {selectedModels.map((m, i) => (
                  <div key={`chem-${i}`} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-800 mb-1">
                      {m.chemistry}
                    </span>
                    <div className="text-xs font-semibold text-slate-800">{m.batteryType}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Performance & Range */}
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 font-bold text-xs uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-600" /> Range &amp; Motor Performance
            </div>

            {/* Row: Real Range */}
            <div className="p-4">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">Estimated Real-World Range</span>
              <div className={`grid gap-4 ${
                selectedModelIds.length === 2 ? 'grid-cols-2' :
                selectedModelIds.length === 3 ? 'grid-cols-3' :
                selectedModelIds.length === 4 ? 'grid-cols-4' :
                selectedModelIds.length === 5 ? 'grid-cols-5' : 'grid-cols-6'
              }`}>
                {modelStats.map((s, i) => (
                  <div key={`range-${i}`} className={`p-3 rounded-xl border ${
                    highlightDifferences && Math.abs(s.realRange - bestRange) < 0.1
                      ? 'bg-blue-50 border-blue-300 text-blue-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <div className="text-base font-extrabold text-blue-700">~{Math.round(s.realRange)} km</div>
                    <div className="text-[11px] text-slate-500">Ref: {s.model.rangeMin} - {s.model.rangeMax || s.model.rangeMin} km</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row: Motor Specs */}
            <div className="p-4">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">Motor Power &amp; Speed</span>
              <div className={`grid gap-4 ${
                selectedModelIds.length === 2 ? 'grid-cols-2' :
                selectedModelIds.length === 3 ? 'grid-cols-3' :
                selectedModelIds.length === 4 ? 'grid-cols-4' :
                selectedModelIds.length === 5 ? 'grid-cols-5' : 'grid-cols-6'
              }`}>
                {selectedModels.map((m, i) => (
                  <div key={`motor-${i}`} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="font-bold text-slate-900">{m.motor}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">Top Speed: {m.topSpeed || '60 km/h'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row: Braking System */}
            <div className="p-4">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">Braking System</span>
              <div className={`grid gap-4 ${
                selectedModelIds.length === 2 ? 'grid-cols-2' :
                selectedModelIds.length === 3 ? 'grid-cols-3' :
                selectedModelIds.length === 4 ? 'grid-cols-4' :
                selectedModelIds.length === 5 ? 'grid-cols-5' : 'grid-cols-6'
              }`}>
                {selectedModels.map((m, i) => (
                  <div key={`brakes-${i}`} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="font-bold text-slate-900">{m.brakes || 'Fr.Disc / Re.Drum'}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{m.category || 'Electric 2-Wheeler'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Running Costs & Economics */}
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 font-bold text-xs uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" /> Running Costs &amp; Financials
            </div>

            {/* Row: Per Charge Cost */}
            <div className="p-4">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">Full Charge Electricity Cost</span>
              <div className={`grid gap-4 ${
                selectedModelIds.length === 2 ? 'grid-cols-2' :
                selectedModelIds.length === 3 ? 'grid-cols-3' :
                selectedModelIds.length === 4 ? 'grid-cols-4' :
                selectedModelIds.length === 5 ? 'grid-cols-5' : 'grid-cols-6'
              }`}>
                {modelStats.map((s, i) => (
                  <div key={`costcharge-${i}`} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="text-base font-extrabold text-emerald-700">Rs {Math.round(s.costPerFullCharge)}</div>
                    <div className="text-slate-500 text-[11px]">{s.unitsToFull.toFixed(2)} WAPDA Units</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row: Cost Per KM */}
            <div className="p-4">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">Cost Per KM (PKR/km)</span>
              <div className={`grid gap-4 ${
                selectedModelIds.length === 2 ? 'grid-cols-2' :
                selectedModelIds.length === 3 ? 'grid-cols-3' :
                selectedModelIds.length === 4 ? 'grid-cols-4' :
                selectedModelIds.length === 5 ? 'grid-cols-5' : 'grid-cols-6'
              }`}>
                {modelStats.map((s, i) => (
                  <div key={`costkm-${i}`} className={`p-3 rounded-xl border ${
                    highlightDifferences && Math.abs(s.costPerKm - lowestCostPerKm) < 0.01
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <div className="text-base font-extrabold text-slate-900">Rs {s.costPerKm.toFixed(2)} / km</div>
                    <div className="text-[11px] text-slate-500">vs Petrol ~Rs 6.22/km</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row: Monthly Savings */}
            <div className="p-4">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">Monthly Fuel Savings (1,500 km)</span>
              <div className={`grid gap-4 ${
                selectedModelIds.length === 2 ? 'grid-cols-2' :
                selectedModelIds.length === 3 ? 'grid-cols-3' :
                selectedModelIds.length === 4 ? 'grid-cols-4' :
                selectedModelIds.length === 5 ? 'grid-cols-5' : 'grid-cols-6'
              }`}>
                {modelStats.map((s, i) => (
                  <div key={`sav-${i}`} className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                    <div className="text-base font-extrabold text-emerald-700">Rs {Math.round(s.monthlySavings).toLocaleString('en-PK')}</div>
                    <div className="text-[11px] text-emerald-800">Saved per month vs Petrol</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row: Warranty & Actions */}
            <div className="p-4 bg-slate-50">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">Warranty &amp; Simulation</span>
              <div className={`grid gap-4 ${
                selectedModelIds.length === 2 ? 'grid-cols-2' :
                selectedModelIds.length === 3 ? 'grid-cols-3' :
                selectedModelIds.length === 4 ? 'grid-cols-4' :
                selectedModelIds.length === 5 ? 'grid-cols-5' : 'grid-cols-6'
              }`}>
                {selectedModels.map((m, i) => (
                  <div key={`act-${i}`} className="p-3 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
                    <div className="text-slate-600 text-[11px]">
                      <strong>Charging Time:</strong> {m.chargeTime || '3-4 hours'}
                    </div>
                    {onSelectModelForTool && (
                      <button
                        onClick={() => onSelectModelForTool(m.id, 'range')}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                      >
                        Simulate Range <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
