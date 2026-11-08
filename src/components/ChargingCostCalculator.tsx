import React, { useState } from 'react';
import { EV_MODELS, EVModel, formatPKR, getFullName } from '../data/evModels';
import { Zap, Sun, DollarSign, Calendar, Sliders, Info, ShieldAlert } from 'lucide-react';
import { AnimatedBatteryCellSvg, AnimatedMotorHubSvg } from './EVSvgIllustrations';

interface ChargingCostCalculatorProps {
  initialModelId?: string;
}

export const ChargingCostCalculator: React.FC<ChargingCostCalculatorProps> = ({ initialModelId }) => {
  const [selectedBike, setSelectedBike] = useState<EVModel>(() => {
    if (initialModelId) {
      const found = EV_MODELS.find(m => m.id === initialModelId);
      if (found) return found;
    }
    return EV_MODELS[0];
  });

  const [brandFilter, setBrandFilter] = useState('All companies');
  const [calcMode, setCalcMode] = useState<'distance' | 'frequency'>('distance');

  // Inputs
  const [homeRate, setHomeRate] = useState(45); // PKR per kWh
  const [dailyKm, setDailyKm] = useState(30); // daily distance
  const [chargesPerWeek, setChargesPerWeek] = useState(7);
  const [soc, setSoc] = useState(20); // current SOC % before topup
  const [efficiency, setEfficiency] = useState(85); // %

  // Solar Offset
  const [solarOn, setSolarOn] = useState(false);
  const [solarKw, setSolarKw] = useState(2);
  const [sunHrs, setSunHrs] = useState(5);

  const brands = ['All companies', ...Array.from(new Set(EV_MODELS.map(m => m.brand)))].sort();

  const filteredBikes = EV_MODELS.filter(m => brandFilter === 'All companies' || m.brand === brandFilter);

  const capWh = selectedBike.batteryWh || 0;
  const avgRange = ((selectedBike.rangeMin || 0) + (selectedBike.rangeMax || selectedBike.rangeMin || 0)) / 2;
  const rangeKm = Math.max(avgRange, 1);
  const effFraction = efficiency / 100;
  const socFraction = soc / 100;

  const topUpKwh = ((capWh * (1 - socFraction)) / 1000) / effFraction;
  const topUpCost = topUpKwh * homeRate;
  const whPerKm = capWh / rangeKm;

  let monthlyKwh = 0;
  let chargesMonth = 0;

  if (calcMode === 'distance') {
    const monthlyDistance = dailyKm * 30;
    const roadKwh = (monthlyDistance * whPerKm) / 1000;
    monthlyKwh = roadKwh / effFraction;
    chargesMonth = monthlyDistance / rangeKm;
  } else {
    chargesMonth = chargesPerWeek * (52 / 12);
    monthlyKwh = topUpKwh * chargesMonth;
  }

  const grossCost = monthlyKwh * homeRate;
  let solarSaving = 0;

  if (solarOn) {
    const solarMonthlyKwh = solarKw * sunHrs * 30;
    solarSaving = Math.min(monthlyKwh, solarMonthlyKwh) * homeRate;
  }

  const netMonthlyCost = Math.max(0, grossCost - solarSaving);
  const yearlyCost = netMonthlyCost * 12;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs hover-lift transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-mono font-bold">
              <Zap className="w-4 h-4 text-emerald-500 animate-pulse-glow" />
              Pakistan Tariff &amp; Bill Calculator
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              EV Bike Charging Cost Calculator
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-mono text-xs sm:text-sm max-w-3xl">
              Calculate exact monthly electricity units (kWh) and home bill cost for charging your EV motorcycle with optional solar panel net savings.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 dark:from-emerald-950/30 dark:to-slate-900 border border-emerald-200/60 dark:border-emerald-800/40">
            <AnimatedBatteryCellSvg className="w-16 h-16 animate-float" />
            <AnimatedMotorHubSvg className="w-14 h-14 animate-spin-slow hidden sm:block opacity-80" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Bike Selection Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold uppercase font-mono tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              1. Select Bike Model
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1.5">
                  Company
                </label>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-800 outline-none focus:border-emerald-600"
                >
                  {brands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1.5">
                  Bike Model
                </label>
                <select
                  value={selectedBike.id}
                  onChange={(e) => {
                    const found = EV_MODELS.find(m => m.id === e.target.value);
                    if (found) setSelectedBike(found);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-800 outline-none focus:border-emerald-600"
                >
                  {filteredBikes.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.brand} - {m.model} {m.variant ? `(${m.variant})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Bike Battery Metadata */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm font-sans">{getFullName(selectedBike)}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  {selectedBike.batteryType}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block uppercase text-[9px] font-bold">Capacity</span>
                  <strong className="text-slate-900 text-sm">{selectedBike.batteryWh} Wh</strong>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[9px] font-bold">Voltage</span>
                  <strong className="text-slate-900">{selectedBike.voltage} V</strong>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[9px] font-bold">Amp-Hours</span>
                  <strong className="text-slate-900">{selectedBike.ampHours} Ah</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Calculator Inputs Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <h2 className="text-sm font-extrabold uppercase font-mono tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              2. Tariff &amp; Usage Inputs
            </h2>

            {/* Mode Selector Segment */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setCalcMode('distance')}
                className={`py-2 rounded-lg transition-all ${
                  calcMode === 'distance' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Daily Distance Mode
              </button>
              <button
                type="button"
                onClick={() => setCalcMode('frequency')}
                className={`py-2 rounded-lg transition-all ${
                  calcMode === 'frequency' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Charges / Week Mode
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  Electricity Rate (Rs / kWh)
                </label>
                <input
                  type="number"
                  value={homeRate}
                  onChange={(e) => setHomeRate(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">Average per unit WAPDA / K-Electric rate.</p>
              </div>

              {calcMode === 'distance' ? (
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Daily Ride Distance (km)
                  </label>
                  <input
                    type="number"
                    value={dailyKm}
                    onChange={(e) => setDailyKm(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Estimated daily commute.</p>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <label className="uppercase text-slate-700">Charges per Week</label>
                    <span className="text-emerald-600">{chargesPerWeek}x</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={21}
                    value={chargesPerWeek}
                    onChange={(e) => setChargesPerWeek(Number(e.target.value))}
                    className="w-full accent-emerald-600 mt-2"
                  />
                </div>
              )}

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <label className="uppercase text-slate-700">Starting Charge Level</label>
                  <span className="text-emerald-600">{soc}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={95}
                  step={5}
                  value={soc}
                  onChange={(e) => setSoc(Number(e.target.value))}
                  className="w-full accent-emerald-600 mt-1"
                />
                <p className="text-[10px] text-slate-400 mt-1">Battery level before plugging in.</p>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <label className="uppercase text-slate-700">Charger Efficiency</label>
                  <span className="text-emerald-600">{efficiency}%</span>
                </div>
                <input
                  type="range"
                  min={70}
                  max={99}
                  value={efficiency}
                  onChange={(e) => setEfficiency(Number(e.target.value))}
                  className="w-full accent-emerald-600 mt-1"
                />
                <p className="text-[10px] text-slate-400 mt-1">Wall charger energy transfer efficiency.</p>
              </div>
            </div>

            {/* Solar Toggle */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="font-mono text-xs font-bold text-slate-800 uppercase">
                    Include Solar Offset Savings
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={solarOn}
                  onChange={(e) => setSolarOn(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 cursor-pointer"
                />
              </div>

              {solarOn && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/60 p-4 rounded-xl border border-amber-200 font-mono text-xs">
                  <div>
                    <label className="block font-bold uppercase text-amber-900 mb-1">Solar System Size (kW)</label>
                    <input
                      type="number"
                      value={solarKw}
                      step={0.5}
                      onChange={(e) => setSolarKw(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-amber-200 rounded-lg font-bold text-amber-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-amber-900 mb-1">Daily Sun Hours</label>
                    <input
                      type="number"
                      value={sunHrs}
                      step={0.5}
                      onChange={(e) => setSunHrs(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-amber-200 rounded-lg font-bold text-amber-900"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Output Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Hero Cost Output */}
          <div className="bg-emerald-600 text-white rounded-2xl p-6 shadow-lg shadow-emerald-500/20 space-y-4">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-200 block">
              Estimated Net Monthly Charging Cost
            </span>
            <div className="text-5xl font-black font-mono tracking-tight">
              Rs {Math.round(netMonthlyCost).toLocaleString('en-PK')}
            </div>
            <p className="text-xs font-mono text-emerald-100 leading-relaxed border-t border-emerald-500/50 pt-3">
              {solarOn && solarSaving > 0
                ? `Includes monthly solar offset savings of Rs ${Math.round(solarSaving).toLocaleString('en-PK')}.`
                : `Based on ${homeRate} Rs/kWh tariff and ${selectedBike.batteryWh} Wh battery pack.`}
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Monthly Units</span>
              <strong className="text-lg text-slate-900 font-bold mt-1 block">
                {monthlyKwh.toFixed(1)} kWh
              </strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">Electricity used</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Top-Up Cost</span>
              <strong className="text-lg text-emerald-600 font-bold mt-1 block">
                Rs {Math.round(topUpCost)}
              </strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">{soc}% to 100% full</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Charges / Month</span>
              <strong className="text-lg text-slate-900 font-bold mt-1 block">
                {chargesMonth.toFixed(1)}x
              </strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">Full equivalent cycles</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Yearly Forecast</span>
              <strong className="text-lg text-blue-600 font-bold mt-1 block">
                Rs {Math.round(yearlyCost).toLocaleString('en-PK')}
              </strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">12 months total</span>
            </div>
          </div>

          {/* Quick Summary Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs font-mono text-xs space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-100 pb-2">
              Selected Model Specs Overview
            </h3>
            <div className="space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span>Model:</span>
                <span className="font-bold text-slate-900">{getFullName(selectedBike)}</span>
              </div>
              <div className="flex justify-between">
                <span>Battery:</span>
                <span className="font-bold text-slate-900">{selectedBike.batteryLabel} ({selectedBike.batteryType})</span>
              </div>
              <div className="flex justify-between">
                <span>Energy Drain:</span>
                <span className="font-bold text-slate-900">{whPerKm.toFixed(1)} Wh/km</span>
              </div>
              <div className="flex justify-between">
                <span>Official Price:</span>
                <span className="font-bold text-emerald-700">{formatPKR(selectedBike.price)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
