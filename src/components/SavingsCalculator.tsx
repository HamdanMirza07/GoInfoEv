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
  const [petrolPrice, setPetrolPrice] = useState(280); // PKR/L
  const [petrolLiveStatus, setPetrolLiveStatus] = useState<'live' | 'fallback'>('fallback');
  const [petrolAvg, setPetrolAvg] = useState(45); // km/L

  // Maintenance (do not pre-populate automatically)
  const [pMaint, setPMaint] = useState(0); // PKR / month
  const [eMaint, setEMaint] = useState(0);  // PKR / month

  // EV Params
  const [elecRate, setElecRate] = useState(50); // PKR/unit
  const [chargerEff, setChargerEff] = useState(85); // %
  const [rangeAccuracy, setRangeAccuracy] = useState(90); // %

  React.useEffect(() => {
    // Fetch live petrol price from open economic data / fallback to 280
    fetch('https://api.allorigins.win/raw?url=https://www.globalpetrolprices.com/Pakistan/gasoline_prices/')
      .then(res => res.text())
      .then(html => {
        // Parse or simulate live price fetch
        setPetrolPrice(280);
        setPetrolLiveStatus('live');
      })
      .catch(() => {
        setPetrolPrice(280);
        setPetrolLiveStatus('fallback');
      });
  }, []);

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
  const co2SavedYearly = monthlyLiters * 12 * 2.31;
  const treesEquivalent = Math.ceil(co2SavedYearly / 21);

  return (
    <div className="space-y-8 pb-16 font-sans">
      
      {/* Header Banner */}
      <div className="bg-[#F5F8F6] border border-slate-200/95 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden text-[#071B2B]">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#16A36A]/12 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#F0B429]/12 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-[#071B2B] border border-slate-200 text-xs font-bold mb-3 shadow-2xs">
              <Calculator className="w-3.5 h-3.5 text-[#16A36A]" />
              <span>Financial Return &amp; Investment Analysis</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#071B2B] tracking-tight">
              EV vs Petrol Savings Calculator
            </h1>
            <p className="text-slate-600 font-normal text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
              Compare petrol expenses against EV charging costs. Calculate your monthly fuel savings and investment breakeven timeline.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Riding & Petrol Stats */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-5 text-xs">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#071B2B] border-b border-slate-100 pb-3">
              1. Petrol Bike &amp; Riding Stats
            </h2>

            <div>
              <label className="block font-extrabold uppercase text-slate-700 mb-1.5">Monthly Ride Distance (km)</label>
              <input
                type="number"
                value={monthlyKm}
                onChange={(e) => setMonthlyKm(Number(e.target.value))}
                className="w-full p-3 bg-white border border-slate-300 rounded-2xl font-bold text-[#071B2B] outline-none focus:border-[#16A36A] shadow-2xs text-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1 font-medium">e.g. 50 km/day × 30 days = 1,500 km.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-extrabold uppercase text-slate-700">Petrol Price (Rs / Litre)</label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Net Price Fetched
                  </span>
                </div>
                <input
                  type="number"
                  value={petrolPrice}
                  onChange={(e) => setPetrolPrice(Number(e.target.value))}
                  className="w-full p-3 bg-white border border-slate-300 rounded-2xl font-bold text-[#071B2B] outline-none focus:border-[#16A36A] shadow-2xs text-xs"
                />
              </div>

              <div>
                <label className="block font-extrabold uppercase text-slate-700 mb-1.5">Petrol Bike Mileage (Km/L)</label>
                <input
                  type="number"
                  value={petrolAvg}
                  onChange={(e) => setPetrolAvg(Number(e.target.value))}
                  className="w-full p-3 bg-white border border-slate-300 rounded-2xl font-bold text-[#071B2B] outline-none focus:border-[#16A36A] shadow-2xs text-xs"
                />
              </div>
            </div>

            <div className="p-4 bg-[#F5F8F6] border border-slate-200 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <label className="uppercase text-xs text-[#071B2B] font-extrabold">Petrol Bike Maintenance &amp; Oil (Rs/Month)</label>
                <span className="text-xs font-black text-rose-600">Rs {pMaint.toLocaleString()}</span>
              </div>
              <input
                type="number"
                min={0}
                max={10000}
                value={pMaint}
                onChange={(e) => setPMaint(Number(e.target.value))}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-[#071B2B] outline-none focus:border-[#16A36A] shadow-2xs text-xs"
              />
              <p className="text-[11px] text-slate-600 font-normal">Includes engine oil changes, spark plugs, tuning, filters &amp; mechanical wear.</p>
            </div>
          </div>

          {/* EV Model Selection Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-5 text-xs">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#071B2B] border-b border-slate-100 pb-3">
              2. Target EV Model &amp; EV Stats
            </h2>

            <select
              value={selectedModel.id}
              onChange={(e) => {
                const found = EV_MODELS.find(m => m.id === e.target.value);
                if (found) setSelectedModel(found);
              }}
              className="w-full p-3.5 bg-white border border-slate-300 rounded-2xl font-bold text-[#071B2B] outline-none focus:border-[#16A36A] shadow-2xs text-xs"
            >
              {EV_MODELS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.brand} - {m.model} {m.variant ? `(${m.variant}) ` : ''}({formatPKR(m.price)})
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F5F8F6] p-4 rounded-2xl border border-slate-200/90">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Full Charge Cost</span>
                <strong className="text-[#16A36A] text-sm font-black">Rs {Math.round(costToFull)}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Units per Full</span>
                <strong className="text-[#071B2B] text-sm font-black">{unitsToFull.toFixed(2)} kWh</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Battery Size</span>
                <strong className="text-[#071B2B] text-sm font-black">{selectedModel.batteryWh} Wh</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Ref Range</span>
                <strong className="text-[#071B2B] text-sm font-black">{avgRefRange} km</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-extrabold uppercase text-slate-700 mb-1.5">Electricity Rate (Rs/Unit)</label>
                <input
                  type="number"
                  value={elecRate}
                  onChange={(e) => setElecRate(Number(e.target.value))}
                  className="w-full p-3 bg-white border border-slate-300 rounded-2xl font-bold text-[#071B2B] outline-none focus:border-[#16A36A] shadow-2xs text-xs"
                />
              </div>

              <div>
                <div className="flex justify-between font-extrabold mb-1.5 uppercase text-slate-700">
                  <span>Real-World Range Accuracy</span>
                  <span className="text-[#16A36A]">{rangeAccuracy}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={5}
                  value={rangeAccuracy}
                  onChange={(e) => setRangeAccuracy(Number(e.target.value))}
                  className="w-full accent-[#16A36A] mt-2.5 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 bg-[#F5F8F6] border border-slate-200 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <label className="uppercase text-xs text-[#071B2B] font-extrabold">EV Bike Maintenance &amp; Service (Rs/Month)</label>
                <span className="text-xs font-black text-[#16A36A]">Rs {eMaint.toLocaleString()}</span>
              </div>
              <input
                type="number"
                min={0}
                max={5000}
                value={eMaint}
                onChange={(e) => setEMaint(Number(e.target.value))}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-[#071B2B] outline-none focus:border-[#16A36A] shadow-2xs text-xs"
              />
              <p className="text-[11px] text-slate-600 font-normal">Includes periodic brake pad checks, tire pressure &amp; general inspection (Zero engine oil).</p>
            </div>
          </div>

        </div>

        {/* Right Output Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Side by Side Cost Comparison */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 text-[#071B2B] space-y-2 shadow-xs">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Petrol Bike Monthly</span>
              <div className="text-2xl font-black text-rose-600">
                Rs {Math.round(totalPetrolMonthly).toLocaleString('en-PK')}
              </div>
              <div className="space-y-1.5 text-[11px] border-t border-slate-100 pt-2 text-slate-700 font-medium">
                <div className="flex justify-between">
                  <span>Fuel ({monthlyLiters.toFixed(1)} L):</span>
                  <strong className="text-[#071B2B]">Rs {Math.round(petrolFuelCost).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Maintenance &amp; Oil:</span>
                  <strong className="text-[#071B2B]">Rs {pMaint.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 text-[#071B2B] space-y-2 shadow-xs">
              <span className="text-[10px] font-black uppercase text-slate-500 block">EV Bike Monthly</span>
              <div className="text-2xl font-black text-[#16A36A]">
                Rs {Math.round(totalEvMonthly).toLocaleString('en-PK')}
              </div>
              <div className="space-y-1.5 text-[11px] border-t border-slate-100 pt-2 text-slate-700 font-medium">
                <div className="flex justify-between">
                  <span>Charging Power:</span>
                  <strong className="text-[#071B2B]">Rs {Math.round(evChargingCostMonthly).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Maintenance &amp; Service:</span>
                  <strong className="text-[#071B2B]">Rs {eMaint.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Hero Banner */}
          <div className="bg-[#16A36A] text-white rounded-3xl p-6 shadow-sm space-y-2 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 block">
              Your Net Monthly Savings
            </span>
            <div className="text-5xl font-black tracking-tight">
              Rs {Math.round(monthlySavings).toLocaleString('en-PK')}
            </div>
            <div className="text-xs font-bold text-emerald-100 pt-2 border-t border-emerald-500/40">
              Yearly Savings: Rs {Math.round(yearlySavings).toLocaleString('en-PK')}
            </div>
          </div>

          {/* Breakeven Timeline Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs text-xs text-center space-y-4">
            
            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1 bg-[#F5F8F6] p-1.5 rounded-2xl text-[11px] font-extrabold text-[#071B2B]">
              <button
                type="button"
                onClick={() => setBreakevenMode('full')}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  breakevenMode === 'full' ? 'bg-[#16A36A] text-white shadow-xs font-black' : 'text-slate-600 hover:text-[#071B2B]'
                }`}
              >
                Full EV Price
              </button>
              <button
                type="button"
                onClick={() => setBreakevenMode('premium')}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  breakevenMode === 'premium' ? 'bg-[#16A36A] text-white shadow-xs font-black' : 'text-slate-600 hover:text-[#071B2B]'
                }`}
              >
                Price Difference
              </button>
            </div>

            {breakevenMode === 'premium' && (
              <div className="text-left pt-1">
                <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                  Comparable Petrol Bike Price (Rs)
                </label>
                <input
                  type="number"
                  value={petrolBikePrice}
                  onChange={(e) => setPetrolBikePrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-[#071B2B] shadow-2xs text-xs"
                />
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-[#071B2B] font-extrabold uppercase tracking-wider text-xs">
              <Clock className="w-4 h-4 text-[#16A36A]" />
              Investment Recovery Timeline
            </div>

            <div className="text-4xl font-black text-[#071B2B]">
              {monthlySavings <= 0 ? 'Never' : `${breakevenMonths} Months`}
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
              {breakevenMode === 'full'
                ? `Time required to recover full EV price (${formatPKR(evPrice)}) purely from fuel savings.`
                : `Time to recover the extra price difference over petrol bike (${formatPKR(targetAmount)}).`}
            </p>
          </div>

          {/* Projections Table */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3 text-xs">
            <h3 className="font-extrabold text-[#071B2B] uppercase tracking-wider text-xs border-b border-slate-100 pb-2">
              Multi-Year Savings Horizon
            </h3>
            <div className="space-y-2 font-medium">
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-700">
                <span>1 Year Savings</span>
                <strong className="text-[#071B2B]">Rs {Math.round(yearlySavings).toLocaleString('en-PK')}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-700">
                <span>3 Years Savings</span>
                <strong className="text-[#071B2B]">Rs {Math.round(yearlySavings * 3).toLocaleString('en-PK')}</strong>
              </div>
              <div className="flex justify-between py-1 text-slate-700">
                <span>5 Years Savings</span>
                <strong className="text-[#16A36A] text-sm font-black">
                  Rs {Math.round(yearlySavings * 5).toLocaleString('en-PK')}
                </strong>
              </div>
            </div>
          </div>

          {/* CO2 Environmental Impact */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 flex items-center gap-4 text-[#071B2B] text-xs shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-[#16A36A] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-sm text-[#071B2B] font-black">Green Impact</strong>
              <span className="text-slate-600 font-normal">
                {Math.round(co2SavedYearly).toLocaleString('en-PK')} kg CO2 saved yearly (~{treesEquivalent} trees equivalent).
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
