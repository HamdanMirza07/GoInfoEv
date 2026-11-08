import React, { useState, useEffect } from 'react';
import { EV_MODELS, EVModel, formatPKR, getFullName } from '../data/evModels';
import { Gauge, RotateCcw, AlertTriangle, Check, X, ShieldCheck, Zap, Info, ArrowRight, Compass, MapPin, Sliders } from 'lucide-react';
import { AnimatedBatteryCellSvg, AnimatedMotorHubSvg } from './EVSvgIllustrations';

interface RangeEstimatorProps {
  initialModelId?: string;
}

export const RangeEstimator: React.FC<RangeEstimatorProps> = ({ initialModelId }) => {
  const [selectedModel, setSelectedModel] = useState<EVModel>(() => {
    if (initialModelId) {
      const found = EV_MODELS.find(m => m.id === initialModelId);
      if (found) return found;
    }
    return EV_MODELS[0];
  });

  const [brandFilter, setBrandFilter] = useState('All companies');

  // Dynamic Official Inputs (auto-populated from selected bike model, editable by user)
  const [officialEcoRange, setOfficialEcoRange] = useState<number>(100);
  const [officialFullSpeedRange, setOfficialFullSpeedRange] = useState<number>(60);
  const [ecoSpeed, setEcoSpeed] = useState<number>(35);
  const [topSpeedNum, setTopSpeedNum] = useState<number>(65);

  // Riding Inputs
  const [speed, setSpeed] = useState(35);
  const [soc, setSoc] = useState(100); // Current Battery %
  const [riderWeight, setRiderWeight] = useState(70);
  const [payloadWeight, setPayloadWeight] = useState(0);

  // Destination Check
  const [destDistance, setDestDistance] = useState(40);

  // Auto-populate when bike model changes
  useEffect(() => {
    if (selectedModel) {
      const ecoR = selectedModel.rangeMax || selectedModel.rangeMin || 80;
      const fullR = selectedModel.rangeMin || Math.round(ecoR * 0.65);
      setOfficialEcoRange(ecoR);
      setOfficialFullSpeedRange(fullR > 0 ? fullR : Math.round(ecoR * 0.65));

      const speedMatch = selectedModel.topSpeed?.match(/(\d+)/);
      const ts = speedMatch ? parseInt(speedMatch[1], 10) : 60;
      setTopSpeedNum(ts > 35 ? ts : 60);
    }
  }, [selectedModel]);

  useEffect(() => {
    if (initialModelId) {
      const found = EV_MODELS.find(m => m.id === initialModelId);
      if (found) setSelectedModel(found);
    }
  }, [initialModelId]);

  const brands = ['All companies', ...Array.from(new Set(EV_MODELS.map(m => m.brand)))].sort();

  const filteredSelectorModels = EV_MODELS.filter(m => 
    brandFilter === 'All companies' || m.brand === brandFilter
  );

  // ==========================================
  // DYNAMIC EV SCOOTER RANGE FORMULA
  // ==========================================

  // Step 1: Base Consumption (%/km)
  const baseConsumption = officialEcoRange > 0 ? 100 / officialEcoRange : 1;

  // Step 2: Load Adjustment (Weight Factor)
  // Reference weight = 70 kg
  // 50-70 kg = 1.0 (no increase)
  // 71-150 kg = Increase by 8-12%
  // 151-220 kg = Increase by 15-20%
  const totalWeight = riderWeight + payloadWeight;
  let weightFactor = 1.0;
  if (totalWeight <= 70) {
    weightFactor = 1.0;
  } else if (totalWeight <= 150) {
    weightFactor = 1.08 + ((totalWeight - 71) / (150 - 71)) * 0.04; // 8% to 12%
  } else if (totalWeight <= 220) {
    weightFactor = 1.15 + ((totalWeight - 151) / (220 - 151)) * 0.05; // 15% to 20%
  } else {
    weightFactor = 1.20 + ((totalWeight - 220) * 0.002);
  }

  // Step 3: Speed Adjustment (Speed Factor)
  // Eco speed is reference speed
  const ecoSpeedVal = ecoSpeed;
  const fullSpeedVal = topSpeedNum;
  const fullSpeedRatio = officialFullSpeedRange > 0 ? (officialEcoRange / officialFullSpeedRange) : 1.6;

  let speedFactor = 1.0;
  if (speed <= ecoSpeedVal) {
    // Below eco speed, consumption decreases slightly
    speedFactor = Math.max(0.85, 1.0 - ((ecoSpeedVal - speed) / ecoSpeedVal) * 0.15);
  } else {
    // Above eco speed, consumption increases up to fullSpeedRatio
    const speedRatio = (speed - ecoSpeedVal) / Math.max(1, fullSpeedVal - ecoSpeedVal);
    speedFactor = 1.0 + speedRatio * (fullSpeedRatio - 1.0);
  }

  // Step 4: Final Calculations
  const finalConsumption = baseConsumption * weightFactor * speedFactor; // % per km

  // 1. Battery Used (%)
  const batteryUsed = destDistance * finalConsumption;

  // 2. Remaining Battery (%)
  const remainingBattery = soc - batteryUsed;

  // 4. Can Reach Destination (Yes / No)
  const canReach = remainingBattery >= 5;

  // 3. Estimated Range Remaining (km) on current battery SOC
  const totalEstimatedRangeKm = finalConsumption > 0 ? (soc / finalConsumption) : 0;
  const remainingEstimatedRangeKm = finalConsumption > 0 ? Math.max(0, remainingBattery / finalConsumption) : 0;

  // 5. Recommended Speed calculation if remaining battery < 5%
  let recommendedSpeed: number | null = null;
  if (!canReach) {
    const maxAllowedConsumption = (soc - 5) / destDistance; // %/km needed to reach with 5% left
    if (maxAllowedConsumption > 0) {
      for (let testS = speed; testS >= 15; testS--) {
        let testSF = 1.0;
        if (testS <= ecoSpeedVal) {
          testSF = Math.max(0.85, 1.0 - ((ecoSpeedVal - testS) / ecoSpeedVal) * 0.15);
        } else {
          const testRatio = (testS - ecoSpeedVal) / Math.max(1, fullSpeedVal - ecoSpeedVal);
          testSF = 1.0 + testRatio * (fullSpeedRatio - 1.0);
        }
        const testCons = baseConsumption * weightFactor * testSF;
        if (testCons <= maxAllowedConsumption) {
          recommendedSpeed = testS;
          break;
        }
      }
    }
  }

  const resetDefaults = () => {
    setSpeed(35);
    setSoc(100);
    setRiderWeight(70);
    setPayloadWeight(0);
    setDestDistance(40);
    setEcoSpeed(35);
    if (selectedModel) {
      const ecoR = selectedModel.rangeMax || selectedModel.rangeMin || 80;
      const fullR = selectedModel.rangeMin || Math.round(ecoR * 0.65);
      setOfficialEcoRange(ecoR);
      setOfficialFullSpeedRange(fullR);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-[#F5F8F6] border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden text-[#071B2B]">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#16A36A]/12 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#F0B429]/12 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-[#071B2B] border border-slate-200 text-xs font-bold mb-3 shadow-xs">
              <Gauge className="w-3.5 h-3.5 text-[#16A36A]" />
              <span>Dynamic Scooter Range Calculator</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#071B2B] tracking-tight">
              EV Bike Range Estimator
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-3xl font-normal leading-relaxed">
              Calculates precise battery consumption (%/km), remaining battery, range, trip reachability, and recommended speed using official Eco and Full-Speed range parameters.
            </p>
          </div>

          <button
            onClick={resetDefaults}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-[#071B2B] border border-slate-300 rounded-xl text-xs font-bold transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#16A36A]" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Bike Selection & Official Specs Input */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                1. Scooter &amp; Official Range Specs
              </h2>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Dynamic Parameters
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Brand Filter
                </label>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-600"
                >
                  {brands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Scooter Model
                </label>
                <select
                  value={selectedModel.id}
                  onChange={(e) => {
                    const found = EV_MODELS.find(m => m.id === e.target.value);
                    if (found) setSelectedModel(found);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-600"
                >
                  {filteredSelectorModels.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.brand} - {m.model} {m.variant ? `(${m.variant})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Official Range Customization Fields */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
              <span className="font-bold text-slate-800 block uppercase tracking-wider text-[11px]">
                Calibrated Official Ranges (Editable for custom bikes)
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Eco Range (km):</label>
                  <input
                    type="number"
                    min={20}
                    max={300}
                    value={officialEcoRange}
                    onChange={(e) => setOfficialEcoRange(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 outline-none focus:border-blue-600"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Base consumption = 100 ÷ {officialEcoRange} = {baseConsumption.toFixed(2)}% / km</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Full-Speed Range (km):</label>
                  <input
                    type="number"
                    min={10}
                    max={250}
                    value={officialFullSpeedRange}
                    onChange={(e) => setOfficialFullSpeedRange(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 outline-none focus:border-blue-600"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Full speed multiplier ratio = {(officialEcoRange / (officialFullSpeedRange || 1)).toFixed(2)}x</span>
                </div>
              </div>
            </div>
          </div>

          {/* Riding Sliders & Trip Distance Mode Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                2. Riding &amp; Trip Distance Method
              </h2>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Active Trip: {destDistance} km
              </span>
            </div>

            {/* Trip Distance Input */}
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between items-center font-bold text-blue-950">
                <span className="uppercase text-[11px] font-extrabold flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-600" /> Enter Trip Distance
                </span>
                <span className="text-sm font-black text-blue-700">{destDistance} km</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div className="sm:col-span-2">
                  <input
                    type="range"
                    min={1}
                    max={200}
                    step={1}
                    value={destDistance}
                    onChange={(e) => setDestDistance(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1 bg-white border border-blue-200 rounded-lg px-2 py-1">
                    <input
                      type="number"
                      min={1}
                      max={300}
                      value={destDistance}
                      onChange={(e) => setDestDistance(Math.max(1, Number(e.target.value)))}
                      className="w-full font-black text-slate-900 outline-none text-xs"
                    />
                    <span className="text-xs font-bold text-slate-500">KM</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                Set your desired trip distance. Destination feasibility and battery safety margin will update dynamically.
              </p>
            </div>

            {/* Other Riding Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-3 border-t border-slate-100">
              
              {/* Current Battery SOC */}
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <label className="uppercase text-slate-700">Battery (SOC)</label>
                  <span className="text-blue-600">{soc}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={soc}
                  onChange={(e) => setSoc(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">Available charge %</p>
              </div>

              {/* Average Speed */}
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <label className="uppercase text-slate-700">Running Speed</label>
                  <span className="text-blue-600">{speed} km/h</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={80}
                  step={1}
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">Speed factor = {speedFactor.toFixed(2)}x</p>
              </div>

              {/* Rider Weight */}
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <label className="uppercase text-slate-700">Total Load Weight</label>
                  <span className="text-blue-600">{totalWeight} kg</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={200}
                  step={5}
                  value={riderWeight}
                  onChange={(e) => setRiderWeight(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">Weight factor = {weightFactor.toFixed(2)}x</p>
              </div>

            </div>

          </div>


        </div>

        {/* Right Output Panel - 5 KEY OUTPUTS (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Results Dashboard Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600" /> Key Calculation Results
              </h2>
              <div className="flex items-center gap-2">
                <AnimatedBatteryCellSvg className="w-8 h-8" />
                <AnimatedMotorHubSvg className="w-8 h-8" />
              </div>
            </div>

            {/* Output 4: Can Reach Destination Banner */}
            <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 transition-all ${
              canReach
                ? 'bg-[#F5F8F6] border-emerald-200 text-[#071B2B]'
                : 'bg-[#F5F8F6] border-rose-200 text-[#071B2B]'
            }`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                canReach ? 'bg-[#16A36A]' : 'bg-rose-600'
              }`}>
                {canReach ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase font-extrabold text-slate-500">4. Can Reach Destination?</div>
                <div className="text-xl font-black text-[#071B2B]">
                  {canReach ? 'YES — Destination Reachable' : 'NO — Battery Insufficient'}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  {canReach
                    ? `You will reach your ${destDistance} km destination with ${remainingBattery.toFixed(1)}% battery remaining (≥ 5% buffer required).`
                    : `Trip requires ${batteryUsed.toFixed(1)}% battery, leaving only ${remainingBattery.toFixed(1)}% (below safe 5% threshold).`}
                </p>
              </div>
            </div>

            {/* Output 5: Recommended Speed Box (Shown if Insufficient) */}
            {!canReach && (
              <div className="p-4 bg-[#F5F8F6] border border-slate-200 rounded-2xl text-xs text-[#071B2B] space-y-2">
                <div className="flex items-center gap-2 font-extrabold uppercase text-slate-700 text-[11px]">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> 5. Recommended Speed
                </div>
                {recommendedSpeed ? (
                  <div>
                    <div className="text-xl font-black text-[#071B2B]">
                      Reduce Speed to ≤ {recommendedSpeed} km/h
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Lowering your average speed from <strong>{speed} km/h</strong> to <strong>{recommendedSpeed} km/h</strong> will reduce energy consumption per km and allow you to reach your target safely with ≥ 5% remaining battery.
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-600">
                    Target distance ({destDistance} km) exceeds total battery capacity even at eco speeds. Please charge your scooter before traveling.
                  </p>
                )}
              </div>
            )}

            {/* Output 1, 2, 3 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              {/* Output 1: Battery Used (%) */}
              <div className="bg-[#F5F8F6] border border-slate-200 rounded-2xl p-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">1. Battery Used</span>
                <strong className="text-2xl text-[#071B2B] font-black mt-1 block">
                  {batteryUsed.toFixed(1)} %
                </strong>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  For {destDistance} km @ {finalConsumption.toFixed(2)}%/km
                </span>
              </div>

              {/* Output 2: Remaining Battery (%) */}
              <div className="bg-[#F5F8F6] border border-slate-200 rounded-2xl p-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">2. Remaining Battery</span>
                <strong className={`text-2xl font-black mt-1 block ${remainingBattery >= 5 ? 'text-[#16A36A]' : 'text-rose-600'}`}>
                  {remainingBattery.toFixed(1)} %
                </strong>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Starting SOC: {soc}%
                </span>
              </div>

              {/* Output 3: Estimated Range Remaining (km) */}
              <div className="bg-[#F5F8F6] border border-slate-200 rounded-2xl p-4 sm:col-span-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">3. Estimated Range Remaining</span>
                <div className="flex items-baseline justify-between mt-1">
                  <strong className="text-2xl text-[#16A36A] font-black">
                    {remainingEstimatedRangeKm.toFixed(1)} km
                  </strong>
                  <span className="text-xs text-slate-600 font-bold">
                    Total Available: {totalEstimatedRangeKm.toFixed(1)} km
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Estimated distance bike can cover on remaining battery ({remainingBattery.toFixed(1)}%)
                </span>
              </div>

            </div>

            {/* Formula Breakdown Details */}
            <div className="p-4 bg-[#F5F8F6] border border-slate-200 rounded-2xl text-[11px] text-slate-600 space-y-2">
              <strong className="block text-[#071B2B] font-bold uppercase text-[10px]">Formula Calculations Breakdown:</strong>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>Base Consumption: <strong className="text-[#071B2B]">{baseConsumption.toFixed(2)}% / km</strong></div>
                <div>Weight Factor: <strong className="text-[#071B2B]">{weightFactor.toFixed(2)}x</strong></div>
                <div>Speed Factor: <strong className="text-[#071B2B]">{speedFactor.toFixed(2)}x</strong></div>
                <div>Final Consumption: <strong className="text-[#071B2B]">{finalConsumption.toFixed(2)}% / km</strong></div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

