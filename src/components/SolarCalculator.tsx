import React, { useState } from 'react';
import { EV_MODELS, EVModel, formatPKR, getFullName } from '../data/evModels';
import { Sun, Zap, DollarSign, Battery, TrendingUp, Info } from 'lucide-react';
import { AnimatedSolarPVSvg, AnimatedBatteryCellSvg } from './EVSvgIllustrations';

interface SolarCalculatorProps {
  initialModelId?: string;
}

export const SolarCalculator: React.FC<SolarCalculatorProps> = ({ initialModelId }) => {
  const [selectedBike, setSelectedBike] = useState<EVModel>(() => {
    if (initialModelId) {
      const found = EV_MODELS.find(m => m.id === initialModelId);
      if (found) return found;
    }
    return EV_MODELS[0];
  });

  const [solarSizeKw, setSolarSizeKw] = useState(5.0); // kW
  const [sunHours, setSunHours] = useState(5.0); // hrs/day
  const [systemEff, setSystemEff] = useState(80); // %
  const [purchaseRate, setPurchaseRate] = useState(50); // PKR / unit

  // 1. Daily Production
  const dailyYieldKwh = solarSizeKw * sunHours * (systemEff / 100);

  // 2. Units required for 1 full EV charge (Assuming 85% charger efficiency)
  const unitsToFull = (selectedBike.batteryWh / 1000) / 0.85;

  // 3. WAPDA Cost Comparison
  const wapdaCostPerCharge = unitsToFull * purchaseRate;

  // 4. Charges per Day
  const chargesPerDay = unitsToFull > 0 ? dailyYieldKwh / unitsToFull : 0;

  // 5. Distance Potential
  const avgRange = ((selectedBike.rangeMin || 0) + (selectedBike.rangeMax || selectedBike.rangeMin || 0)) / 2;
  const dailySolarKm = chargesPerDay * avgRange;
  const monthlySolarKm = dailySolarKm * 30;

  // 6. Savings
  const energyUsedDaily = Math.min(dailyYieldKwh, unitsToFull);
  const monthlySavings = energyUsedDaily * 30 * purchaseRate;
  const totalMonthlyGridCost = wapdaCostPerCharge * 30;
  const netMonthlySolarCost = Math.max(0, totalMonthlyGridCost - monthlySavings);

  const excessKwh = Math.max(0, dailyYieldKwh - unitsToFull);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-[#F5F8F6] border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden text-[#071B2B]">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#16A36A]/12 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#F0B429]/12 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-[#071B2B] border border-slate-200 text-xs font-bold shadow-xs">
              <Sun className="w-4 h-4 text-[#F0B429]" />
              <span>Green Energy &amp; Solar Optimization Tool</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#071B2B] tracking-tight">
              Solar EV Charging Calculator
            </h1>
            <p className="text-slate-600 font-normal text-xs sm:text-sm max-w-3xl leading-relaxed">
              Determine how much your rooftop solar panel setup contributes to free daily EV riding and calculate net-metering financial offsets.
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-center p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <AnimatedSolarPVSvg className="w-20 h-20 animate-float" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Solar Profile */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 font-mono text-xs">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              1. Solar Panel System Profile
            </h2>

            <div>
              <label className="block font-bold uppercase text-slate-700 mb-1">Solar System Size (kW)</label>
              <input
                type="number"
                step={0.5}
                value={solarSizeKw}
                onChange={(e) => setSolarSizeKw(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-amber-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">Total capacity of installed solar array (e.g. 5kW, 10kW).</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Avg Peak Sun Hours / Day</label>
                <input
                  type="number"
                  step={0.5}
                  value={sunHours}
                  onChange={(e) => setSunHours(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-amber-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">Pakistan average is ~5.0 peak hours.</p>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Inverter Efficiency (%)</label>
                <input
                  type="number"
                  value={systemEff}
                  onChange={(e) => setSystemEff(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-amber-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">Accounting for wiring &amp; inverter loss.</p>
              </div>
            </div>
          </div>

          {/* Target EV Bike */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 font-mono text-xs">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              2. Target EV Bike Selection
            </h2>

            <select
              value={selectedBike.id}
              onChange={(e) => {
                const found = EV_MODELS.find(m => m.id === e.target.value);
                if (found) setSelectedBike(found);
              }}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-amber-600 text-xs"
            >
              {EV_MODELS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.brand} - {m.model} {m.variant ? `(${m.variant}) ` : ''}({m.batteryWh} Wh Pack)
                </option>
              ))}
            </select>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Selected Bike</span>
                <strong className="text-slate-900 text-xs font-sans">{getFullName(selectedBike)}</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Battery Size</span>
                <strong className="text-amber-600 text-xs">{selectedBike.batteryWh} Wh</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Ref Range</span>
                <strong className="text-blue-600 text-xs">{avgRange} km</strong>
              </div>
            </div>

            <div className="pt-2">
              <label className="block font-bold uppercase text-slate-700 mb-1">WAPDA Purchase Rate (Rs / Unit)</label>
              <input
                type="number"
                value={purchaseRate}
                onChange={(e) => setPurchaseRate(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-amber-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">Standard grid unit price with tax included.</p>
            </div>
          </div>

        </div>

        {/* Right Output Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Daily Yield Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Daily Solar Generation</span>
                <strong className="text-xl font-bold text-amber-950">{dailyYieldKwh.toFixed(2)} kWh / day</strong>
              </div>
            </div>
          </div>

          {/* Main Hero Metric */}
          <div className="bg-amber-500 text-white rounded-2xl p-6 shadow-lg shadow-amber-500/20 space-y-2 text-center">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-100 block">
              Full Charges Provided By Sun Daily
            </span>
            <div className="text-5xl font-black font-mono tracking-tight">
              {chargesPerDay.toFixed(1)} <span className="text-2xl font-bold text-amber-100">charges</span>
            </div>
            <p className="text-xs font-mono text-amber-100 pt-2 border-t border-amber-400">
              Provides ~{Math.round(dailySolarKm)} km of 100% free daily riding.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Units / Full Charge</span>
              <strong className="text-lg text-slate-900 font-bold mt-1 block">
                {unitsToFull.toFixed(2)} kWh
              </strong>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">WAPDA Cost / Charge</span>
              <strong className="text-lg text-rose-600 font-bold mt-1 block">
                Rs {Math.round(wapdaCostPerCharge)}
              </strong>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Free Solar KM / Month</span>
              <strong className="text-lg text-emerald-600 font-bold mt-1 block">
                ~{Math.round(monthlySolarKm).toLocaleString('en-PK')} km
              </strong>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Monthly Bill Saving</span>
              <strong className="text-lg text-blue-600 font-bold mt-1 block">
                Rs {Math.round(monthlySavings).toLocaleString('en-PK')}
              </strong>
            </div>
          </div>

          {/* Grid vs Solar Comparison */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-950">
              <span className="text-[10px] font-bold uppercase opacity-70 block">WAPDA Charging (No Solar)</span>
              <div className="text-xl font-bold text-rose-700 mt-1">
                Rs {Math.round(totalMonthlyGridCost).toLocaleString('en-PK')}
              </div>
              <span className="text-[10px] text-rose-600 block mt-1">Monthly grid expense</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950">
              <span className="text-[10px] font-bold uppercase opacity-70 block">Solar Net Charging</span>
              <div className="text-xl font-bold text-emerald-700 mt-1">
                Rs {Math.round(netMonthlySolarCost).toLocaleString('en-PK')}
              </div>
              <span className="text-[10px] text-emerald-600 block mt-1">Net bill cost</span>
            </div>
          </div>

          {/* Export Notice */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 font-mono text-xs text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-bold uppercase text-emerald-800">
              <Zap className="w-4 h-4" /> Net Metering Financial Advantage
            </div>
            <p className="leading-relaxed">
              {excessKwh > 0
                ? `After 1 full EV charge, your solar panels generate ${excessKwh.toFixed(2)} excess units daily that can be exported back to the grid for extra electricity credits!`
                : `Your daily solar yield is completely consumed by 1 full EV bike charge.`}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
