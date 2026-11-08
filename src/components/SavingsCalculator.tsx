import React, { useState } from 'react';
import { EV_MODELS, EVModel, formatPKR, getFullName } from '../data/evModels';
import { Calculator, Clock, Leaf, DollarSign, ArrowRight } from 'lucide-react';

interface SavingsCalculatorProps {
  initialModelId?: string;
}

export const SavingsCalculator: React.FC<SavingsCalculatorProps> = ({ initialModelId }) => {
  const [selectedModel, setSelectedModel] = useState<EVModel>(() => {
    if (initialModelId) {
      const found = EV_MODELS.find(m => m.id === initialModelId);
      if (found) return found;
    }
    return EV_MODELS[0];
  });

  const [monthlyKm, setMonthlyKm] = useState(1500);
  const [petrolPrice, setPetrolPrice] = useState(280);
  const [petrolAvg, setPetrolAvg] = useState(45); // km/L

  // Maintenance
  const [pMaint, setPMaint] = useState(1500); // PKR / month
  const [eMaint, setEMaint] = useState(200);  // PKR / month

  // EV Params
  const [elecRate, setElecRate] = useState(50); // PKR/unit
  const [chargerEff, setChargerEff] = useState(85); // %
  const [rangeAccuracy, setRangeAccuracy] = useState(90); // %

  // Breakeven mode
  const [breakevenMode, setBreakevenMode] = useState<'full' | 'premium'>('full');
  const [petrolBikePrice, setPetrolBikePrice] = useState(160000);

  // 1. Petrol Monthly
  const monthlyLiters = monthlyKm / Math.max(1, petrolAvg);
  const petrolFuelCost = monthlyLiters * petrolPrice;
  const totalPetrolMonthly = petrolFuelCost + pMaint;

  // 2. EV Monthly
  const unitsToFull = (selectedModel.batteryWh / 1000) / (chargerEff / 100);
  const costToFull = unitsToFull * elecRate;
  const avgRefRange = ((selectedModel.rangeMin || 0) + (selectedModel.rangeMax || selectedModel.rangeMin || 0)) / 2;
  const realWorldRange = avgRefRange * (rangeAccuracy / 100);
  const unitsPerKm = unitsToFull / Math.max(1, realWorldRange);

  const evChargingCostMonthly = monthlyKm * unitsPerKm * elecRate;
  const totalEvMonthly = evChargingCostMonthly + eMaint;

  // 3. Savings
  const monthlySavings = totalPetrolMonthly - totalEvMonthly;
  const yearlySavings = monthlySavings * 12;

  // 4. Breakeven
  const evPrice = selectedModel.price || 250000;
  let targetAmount = evPrice;
  if (breakevenMode === 'premium') {
    targetAmount = Math.max(0, evPrice - petrolBikePrice);
  }

  const breakevenMonths = monthlySavings > 0 ? Math.ceil(targetAmount / monthlySavings) : 999;

  // 5. Environmental Impact
  const co2SavedYearly = monthlyLiters * 12 * 2.31; // 2.31 kg CO2 per liter petrol
  const treesEquivalent = Math.ceil(co2SavedYearly / 21);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-bold mb-3">
              <Calculator className="w-3.5 h-3.5" />
              Financial Return &amp; Investment Analysis
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              EV vs Petrol Savings Calculator
            </h1>
            <p className="text-slate-600 font-mono text-xs sm:text-sm mt-1 max-w-3xl">
              Compare petrol expenses against EV charging costs. Calculate your monthly fuel savings and investment breakeven timeline.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Riding & Petrol Stats */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              1. Petrol Bike &amp; Riding Stats
            </h2>

            <div>
              <label className="block font-bold uppercase text-slate-700 mb-1">Monthly Ride Distance (km)</label>
              <input
                type="number"
                value={monthlyKm}
                onChange={(e) => setMonthlyKm(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">e.g. 50 km/day × 30 days = 1,500 km.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Petrol Price (Rs / Litre)</label>
                <input
                  type="number"
                  value={petrolPrice}
                  onChange={(e) => setPetrolPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Petrol Bike Mileage (Km/L)</label>
                <input
                  type="number"
                  value={petrolAvg}
                  onChange={(e) => setPetrolAvg(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <label className="uppercase text-xs text-rose-900 font-extrabold">Petrol Bike Maintenance &amp; Oil (Rs/Month)</label>
                <span className="text-xs font-black text-rose-700">Rs {pMaint.toLocaleString()}</span>
              </div>
              <input
                type="number"
                min={0}
                max={10000}
                value={pMaint}
                onChange={(e) => setPMaint(Number(e.target.value))}
                className="w-full p-2 bg-white border border-rose-200 rounded-lg font-bold text-slate-900 outline-none focus:border-rose-500"
              />
              <p className="text-[10px] text-rose-800/80">Includes engine oil changes, spark plugs, tuning, filters &amp; mechanical wear.</p>
            </div>
          </div>

          {/* EV Model Selection Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              2. Target EV Model &amp; EV Stats
            </h2>

            <select
              value={selectedModel.id}
              onChange={(e) => {
                const found = EV_MODELS.find(m => m.id === e.target.value);
                if (found) setSelectedModel(found);
              }}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 text-xs"
            >
              {EV_MODELS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.brand} - {m.model} {m.variant ? `(${m.variant}) ` : ''}({formatPKR(m.price)})
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Full Charge Cost</span>
                <strong className="text-blue-600 text-sm">Rs {Math.round(costToFull)}</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Units per Full</span>
                <strong className="text-slate-800 text-sm">{unitsToFull.toFixed(2)} kWh</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Battery Size</span>
                <strong className="text-slate-800 text-sm">{selectedModel.batteryWh} Wh</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Ref Range</span>
                <strong className="text-slate-800 text-sm">{avgRefRange} km</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Electricity Rate (Rs/Unit)</label>
                <input
                  type="number"
                  value={elecRate}
                  onChange={(e) => setElecRate(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <label className="uppercase text-slate-700">Real-World Range Accuracy</label>
                  <span className="text-blue-600">{rangeAccuracy}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={5}
                  value={rangeAccuracy}
                  onChange={(e) => setRangeAccuracy(Number(e.target.value))}
                  className="w-full accent-blue-600 mt-2"
                />
              </div>
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <label className="uppercase text-xs text-emerald-900 font-extrabold">EV Bike Maintenance &amp; Service (Rs/Month)</label>
                <span className="text-xs font-black text-emerald-700">Rs {eMaint.toLocaleString()}</span>
              </div>
              <input
                type="number"
                min={0}
                max={5000}
                value={eMaint}
                onChange={(e) => setEMaint(Number(e.target.value))}
                className="w-full p-2 bg-white border border-emerald-200 rounded-lg font-bold text-slate-900 outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-emerald-800/80">Includes periodic brake pad checks, tire pressure &amp; general inspection (Zero engine oil).</p>
            </div>
          </div>

        </div>

        {/* Right Output Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Side by Side Cost Comparison */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-950 space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-rose-800 block">Petrol Bike Monthly</span>
              <div className="text-2xl font-black text-rose-700">
                Rs {Math.round(totalPetrolMonthly).toLocaleString('en-PK')}
              </div>
              <div className="space-y-1 text-[11px] border-t border-rose-200/80 pt-2 text-rose-900">
                <div className="flex justify-between">
                  <span>Fuel ({monthlyLiters.toFixed(1)} L):</span>
                  <strong>Rs {Math.round(petrolFuelCost).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Maintenance &amp; Oil:</span>
                  <strong>Rs {pMaint.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-emerald-800 block">EV Bike Monthly</span>
              <div className="text-2xl font-black text-emerald-700">
                Rs {Math.round(totalEvMonthly).toLocaleString('en-PK')}
              </div>
              <div className="space-y-1 text-[11px] border-t border-emerald-200/80 pt-2 text-emerald-900">
                <div className="flex justify-between">
                  <span>Charging Power:</span>
                  <strong>Rs {Math.round(evChargingCostMonthly).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Maintenance &amp; Service:</span>
                  <strong>Rs {eMaint.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Hero Banner */}
          <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-lg shadow-blue-500/20 space-y-2 text-center">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-200 block">
              Your Net Monthly Savings
            </span>
            <div className="text-5xl font-black font-mono tracking-tight">
              Rs {Math.round(monthlySavings).toLocaleString('en-PK')}
            </div>
            <div className="text-sm font-mono font-bold text-blue-100 pt-2 border-t border-blue-500/50">
              Yearly Savings: Rs {Math.round(yearlySavings).toLocaleString('en-PK')}
            </div>
          </div>

          {/* Breakeven Timeline Card */}
          <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-6 shadow-xs font-mono text-xs text-center space-y-3">
            
            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1 bg-amber-100/60 p-1 rounded-xl text-[11px] font-bold text-amber-900">
              <button
                type="button"
                onClick={() => setBreakevenMode('full')}
                className={`py-1.5 rounded-lg transition-all ${
                  breakevenMode === 'full' ? 'bg-white shadow-xs text-slate-900' : 'text-amber-800'
                }`}
              >
                Full EV Price
              </button>
              <button
                type="button"
                onClick={() => setBreakevenMode('premium')}
                className={`py-1.5 rounded-lg transition-all ${
                  breakevenMode === 'premium' ? 'bg-white shadow-xs text-slate-900' : 'text-amber-800'
                }`}
              >
                Price Difference
              </button>
            </div>

            {breakevenMode === 'premium' && (
              <div className="text-left pt-1">
                <label className="block text-[10px] font-bold uppercase text-amber-900 mb-1">
                  Comparable Petrol Bike Price (Rs)
                </label>
                <input
                  type="number"
                  value={petrolBikePrice}
                  onChange={(e) => setPetrolBikePrice(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-amber-300 rounded-lg font-bold text-slate-900"
                />
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-amber-800 font-bold uppercase tracking-wider text-xs">
              <Clock className="w-4 h-4" />
              Investment Recovery Timeline
            </div>

            <div className="text-4xl font-black text-slate-900">
              {monthlySavings <= 0 ? 'Never' : `${breakevenMonths} Months`}
            </div>

            <p className="text-[11px] text-amber-900 leading-tight">
              {breakevenMode === 'full'
                ? `Time required to recover full EV price (${formatPKR(evPrice)}) purely from fuel savings.`
                : `Time to recover the extra price difference over petrol bike (${formatPKR(targetAmount)}).`}
            </p>
          </div>

          {/* Projections Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3 font-mono text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-100 pb-2">
              Multi-Year Savings Horizon
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>1 Year Savings</span>
                <strong className="text-slate-900">Rs {Math.round(yearlySavings).toLocaleString('en-PK')}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>3 Years Savings</span>
                <strong className="text-slate-900">Rs {Math.round(yearlySavings * 3).toLocaleString('en-PK')}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>5 Years Savings</span>
                <strong className="text-emerald-600 text-sm font-bold">
                  Rs {Math.round(yearlySavings * 5).toLocaleString('en-PK')}
                </strong>
              </div>
            </div>
          </div>

          {/* CO2 Environmental Impact */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4 text-emerald-950 font-mono text-xs">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <strong className="block font-sans text-sm text-emerald-900 font-bold">Green Impact</strong>
              <span>
                {Math.round(co2SavedYearly).toLocaleString('en-PK')} kg CO2 saved yearly (~{treesEquivalent} trees equivalent).
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
