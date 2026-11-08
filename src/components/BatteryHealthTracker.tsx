import React, { useState } from 'react';
import { EV_MODELS, EVModel, formatPKR, getFullName } from '../data/evModels';
import { ShieldCheck, Flame, Zap, AlertTriangle, TrendingDown, Info, Search } from 'lucide-react';

interface BatteryHealthTrackerProps {
  initialModelId?: string;
}

export const BatteryHealthTracker: React.FC<BatteryHealthTrackerProps> = ({ initialModelId }) => {
  const [selectedModel, setSelectedModel] = useState<EVModel>(() => {
    if (initialModelId) {
      const found = EV_MODELS.find(m => m.id === initialModelId);
      if (found) return found;
    }
    return EV_MODELS[0];
  });

  const [chemistry, setChemistry] = useState<'lfp' | 'nmc' | 'graphene' | 'lead-acid'>(selectedModel.chemistry || 'lfp');
  const [packCost, setPackCost] = useState<number>(selectedModel.price || 294400);
  const [nominalAh, setNominalAh] = useState<number>(selectedModel.ampHours || 40);
  const [nominalV, setNominalV] = useState<number>(selectedModel.voltage || 73.6);

  // Sliders
  const [dailyCycles, setDailyCycles] = useState(0.8);
  const [dod, setDod] = useState(85); // %
  const [targetYears, setTargetYears] = useState(5);
  const [fastChargePercent, setFastChargePercent] = useState(20);

  // Climate & Habit
  const [climateTemp, setClimateTemp] = useState<'ideal' | 'warm' | 'pak-extreme'>('warm');
  const [chargingHabit, setChargingHabit] = useState<'optimal' | 'standard' | 'abuse'>('standard');

  const [searchTerm, setSearchTerm] = useState('');

  const CHEM_PROFILES = {
    lfp: {
      name: 'Lithium Iron Phosphate (LFP)',
      baseCycles: 2500,
      calendarDegradation: 1.5,
      resaleFactor: 0.45
    },
    nmc: {
      name: 'Ternary Lithium (NMC / Lithium Ion)',
      baseCycles: 1200,
      calendarDegradation: 2.0,
      resaleFactor: 0.30
    },
    graphene: {
      name: 'Graphene / Lead-Carbon Gel',
      baseCycles: 1000,
      calendarDegradation: 2.2,
      resaleFactor: 0.15
    },
    'lead-acid': {
      name: 'Traditional Deep Cycle Lead-Acid',
      baseCycles: 400,
      calendarDegradation: 5.0,
      resaleFactor: 0.05
    }
  };

  const handleSelectModel = (model: EVModel) => {
    setSelectedModel(model);
    setChemistry(model.chemistry || 'lfp');
    setPackCost(model.price || 250000);
    setNominalAh(model.ampHours || 30);
    setNominalV(model.voltage || 72);
  };

  const chemProfile = CHEM_PROFILES[chemistry];
  const calculatedWh = nominalAh * nominalV;

  // Stress Calculations
  let dodStress = 1.0;
  if (dod > 80) dodStress = 1.0 + (dod - 80) * 0.02;
  else dodStress = Math.max(0.4, 1.0 - (80 - dod) * 0.01);

  let tempStress = 1.0;
  if (climateTemp === 'warm') tempStress = 1.15;
  if (climateTemp === 'pak-extreme') {
    if (chemistry === 'nmc') tempStress = 1.55;
    else if (chemistry === 'lfp') tempStress = 1.30;
    else if (chemistry === 'graphene') tempStress = 1.25;
    else tempStress = 1.70;
  }

  const chargeFrac = fastChargePercent / 100;
  let fastChargeStress = 1.0;
  if (chemistry === 'graphene') fastChargeStress = 1.0 + chargeFrac * 0.12;
  else if (chemistry === 'lfp') fastChargeStress = 1.0 + chargeFrac * 0.25;
  else if (chemistry === 'nmc') fastChargeStress = 1.0 + chargeFrac * 0.40;
  else fastChargeStress = 1.0 + chargeFrac * 0.80;

  let habitFactor = 1.0;
  if (chargingHabit === 'optimal') habitFactor = 0.85;
  if (chargingHabit === 'abuse') habitFactor = 1.30;

  // Year by Year Degradation Points (Year 0 to 10)
  const annualCycles = Math.round(dailyCycles * 365);
  const cycleWearPerCycle = 20.0 / chemProfile.baseCycles;

  const yearDataPoints = [];
  for (let y = 0; y <= 10; y++) {
    const cumCycles = annualCycles * y;
    const actualCyclesWear = cumCycles * cycleWearPerCycle * dodStress * tempStress * fastChargeStress * habitFactor;
    const actualCalendarWear = y * chemProfile.calendarDegradation * (tempStress * 0.85);
    let calculatedSoh = 100.0 - actualCyclesWear - actualCalendarWear;
    calculatedSoh = Math.max(10, Math.min(100, calculatedSoh));

    yearDataPoints.push({
      year: y,
      soh: calculatedSoh,
      cycles: cumCycles
    });
  }

  const activeProjection = yearDataPoints[Math.min(10, targetYears)];
  const projectedSoh = activeProjection.soh;

  let residualValue = 0;
  if (projectedSoh > 70) {
    const excessProgress = (projectedSoh - 70) / 30;
    residualValue = packCost * (chemProfile.resaleFactor + (1.0 - chemProfile.resaleFactor) * excessProgress);
  } else {
    const decayRatio = Math.max(0, (projectedSoh - 10) / 60);
    residualValue = packCost * chemProfile.resaleFactor * decayRatio;
  }

  let limitReachedYear = 10;
  for (let idx = 0; idx < yearDataPoints.length; idx++) {
    if (yearDataPoints[idx].soh <= 70) {
      limitReachedYear = idx;
      break;
    }
  }

  const activeAhCapacity = nominalAh * (projectedSoh / 100.0);

  // SVG Chart path generation
  const svgPathD = yearDataPoints.map((pt, index) => {
    const x = (index / 10) * 100;
    const sohScaled = (100.0 - pt.soh) / 60.0; // scale 40% to 100%
    const y = Math.max(0, Math.min(100, sohScaled * 100));
    return index === 0 ? `M ${x}% ${y}%` : `L ${x}% ${y}%`;
  }).join(' ');

  const filteredFleet = EV_MODELS.filter(m => {
    const q = searchTerm.toLowerCase();
    return !searchTerm || 
      m.brand.toLowerCase().includes(q) || 
      m.model.toLowerCase().includes(q) ||
      (m.variant && m.variant.toLowerCase().includes(q)) ||
      (m.category && m.category.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-mono font-bold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              SOH Degradation &amp; Chemistry Analytics
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              EV Battery Health &amp; Aging Tracker
            </h1>
            <p className="text-slate-600 font-mono text-xs sm:text-sm mt-1 max-w-3xl">
              Model calendar aging, thermal heat penalties (Pak summers), Depth of Discharge (DOD), and cycle wear across LFP, NMC, and Graphene batteries.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Quick Fleet Model Chooser */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold uppercase font-mono tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              1. Load Calibrated EV Model
            </h2>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search bike (Crown, Yadea, S1, Metro, etc)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:border-amber-600"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
              {filteredFleet.map((m) => {
                const isSelected = m.id === selectedModel.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectModel(m)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-50 border-amber-500 font-bold text-amber-950'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="font-bold">{getFullName(m)}</span>
                      <span className="text-[10px] text-slate-400 ml-2">{m.voltage}V {m.ampHours}Ah • {m.batteryWh} Wh</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-bold">
                      {m.batteryType}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Battery Pack Properties */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold uppercase font-mono tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              2. Battery Pack Properties
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Chemistry Composition</label>
                <select
                  value={chemistry}
                  onChange={(e: any) => setChemistry(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-amber-600"
                >
                  <option value="lfp">Lithium Iron Phosphate (LFP) - Longest Life</option>
                  <option value="nmc">Ternary Lithium (NMC) - High Energy / Lightweight</option>
                  <option value="graphene">Graphene / Lead-Carbon Gel Pack</option>
                  <option value="lead-acid">Deep Cycle Lead-Acid</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Pack Replacement Cost (Rs)</label>
                <input
                  type="number"
                  value={packCost}
                  onChange={(e) => setPackCost(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Capacity (Ah)</label>
                <input
                  type="number"
                  value={nominalAh}
                  onChange={(e) => setNominalAh(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Nominal Voltage (V)</label>
                <input
                  type="number"
                  value={nominalV}
                  onChange={(e) => setNominalV(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Usage & Stress Modifiers */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 font-mono text-xs">
            <h2 className="text-sm font-extrabold uppercase font-mono tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              3. Usage &amp; Stress Modifiers
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <label className="uppercase text-slate-700">Daily Discharge Cycles</label>
                  <span className="text-amber-600">{dailyCycles}x</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={3.0}
                  step={0.1}
                  value={dailyCycles}
                  onChange={(e) => setDailyCycles(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">1.0x = 1 full discharge/recharge daily.</p>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <label className="uppercase text-slate-700">Depth of Discharge (DOD)</label>
                  <span className="text-amber-600">{dod}%</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={100}
                  step={5}
                  value={dod}
                  onChange={(e) => setDod(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">DOD &gt; 80% increases high-voltage anode wear.</p>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <label className="uppercase text-slate-700">Timeline Horizon (Years)</label>
                  <span className="text-amber-600">{targetYears} Years</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={targetYears}
                  onChange={(e) => setTargetYears(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <label className="uppercase text-slate-700">DC Fast Charge Ratio</label>
                  <span className="text-amber-600">{fastChargePercent}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={fastChargePercent}
                  onChange={(e) => setFastChargePercent(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Environment Temp</label>
                <select
                  value={climateTemp}
                  onChange={(e: any) => setClimateTemp(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="ideal">Lab Temp (20-25°C Standard)</option>
                  <option value="warm">Moderate Average (25-35°C)</option>
                  <option value="pak-extreme">Extreme Summer Heat (35-45°C+ Pak Penalty)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Charging Habit</label>
                <select
                  value={chargingHabit}
                  onChange={(e: any) => setChargingHabit(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="optimal">85% Charge Cutoff Protection</option>
                  <option value="standard">Standard 100% Full Charging</option>
                  <option value="abuse">Overnight Plugged Abuse (Resting at peak V)</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Right Output Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SOH Hero Output Card */}
          <div className={`rounded-2xl p-6 shadow-lg space-y-4 ${
            projectedSoh >= 85 ? 'bg-emerald-600 text-white shadow-emerald-500/20' :
            projectedSoh >= 70 ? 'bg-amber-500 text-white shadow-amber-500/20' :
            'bg-rose-600 text-white shadow-rose-500/20'
          }`}>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider opacity-80 block">
              Projected State of Health (SOH) at Year {targetYears}
            </span>
            <div className="text-5xl font-black font-mono tracking-tight">
              {projectedSoh.toFixed(1)}%
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-white/20 font-mono text-xs font-bold uppercase backdrop-blur-xs">
              {projectedSoh >= 85 ? 'Excellent Active Health' :
               projectedSoh >= 70 ? 'Serviceable Pack' :
               'Critical Replacement Due'}
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Cycles Done</span>
              <strong className="text-lg text-slate-900 font-bold mt-1 block">
                {Math.round(activeProjection.cycles).toLocaleString('en-PK')}
              </strong>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Remaining Capacity</span>
              <strong className="text-lg text-blue-600 font-bold mt-1 block">
                {activeAhCapacity.toFixed(1)} Ah
              </strong>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Residual Equity</span>
              <strong className="text-lg text-emerald-600 font-bold mt-1 block">
                Rs {Math.round(residualValue).toLocaleString('en-PK')}
              </strong>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Lifetime (&gt;70% SOH)</span>
              <strong className="text-lg text-amber-600 font-bold mt-1 block">
                {limitReachedYear >= 10 ? '>10 Years' : `${limitReachedYear} Years`}
              </strong>
            </div>
          </div>

          {/* SVG Yearly Curve Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold font-mono text-slate-900 uppercase tracking-wider text-xs">
              10-Year SOH Degradation Curve
            </h3>

            <div className="relative h-48 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <svg className="w-full h-full overflow-visible">
                {/* Horizontal Grid lines */}
                <line x1="0" y1="0%" x2="100%" y2="0%" stroke="#e2e8f0" strokeDasharray="2,4" />
                <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#e2e8f0" strokeDasharray="2,4" />
                <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#e2e8f0" strokeDasharray="2,4" />
                <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#e2e8f0" strokeDasharray="2,4" />

                {/* SOH Curve Path */}
                <path
                  d={svgPathD}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Markers */}
                {yearDataPoints.map((pt, idx) => {
                  const x = (idx / 10) * 100;
                  const sohScaled = (100.0 - pt.soh) / 60.0;
                  const y = Math.max(0, Math.min(100, sohScaled * 100));
                  return (
                    <circle
                      key={idx}
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="4"
                      className="fill-amber-600 stroke-white stroke-2 cursor-pointer hover:scale-125 transition-transform"
                    >
                      <title>Year {pt.year}: {pt.soh.toFixed(1)}% SOH ({Math.round(pt.cycles)} cycles)</title>
                    </circle>
                  );
                })}
              </svg>
            </div>

            <div className="flex justify-between font-mono text-[10px] text-slate-400 font-bold px-1">
              <span>Y0</span><span>Y2</span><span>Y4</span><span>Y6</span><span>Y8</span><span>Y10</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
