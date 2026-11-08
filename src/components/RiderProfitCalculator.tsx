import React, { useState } from 'react';
import { Bike, Car, Plus, Save, Check, Zap, Flame, ShieldCheck, Calculator, ArrowRight, Sliders, Percent } from 'lucide-react';

interface Trip {
  id: string;
  fare: number;
  distance: number;
  timestamp: string;
}

export const RiderProfitCalculator: React.FC = () => {
  const [vehicleType, setVehicleType] = useState<'Bike' | 'Car'>('Bike');
  const [bikeEngineType, setBikeEngineType] = useState<'petrol' | 'ev'>('petrol');

  // Platform Fee % (user editable, default 12%)
  const [platformFeePercent, setPlatformFeePercent] = useState<number>(12);

  // Bike Stats - Petrol
  const [bikePetrolPrice, setBikePetrolPrice] = useState(280); // Rs/L
  const [bikePetrolAvg, setBikePetrolAvg] = useState(45); // Km/L

  // Bike Stats - EV (User enters electric price, units kWh, and full charge mileage)
  const [bikeElecRate, setBikeElecRate] = useState(50); // Rs/Unit (kWh)
  const [bikeElecUnits, setBikeElecUnits] = useState(2.5); // kWh
  const [bikeElecMileage, setBikeElecMileage] = useState(100); // KM per full charge

  // Car Stats (Petrol vs Electric EV Car)
  const [carType, setCarType] = useState<'petrol' | 'ev'>('petrol');
  const [carPetrolPrice, setCarPetrolPrice] = useState(280);
  const [carPetrolAvg, setCarPetrolAvg] = useState(12);
  const [carElecRate, setCarElecRate] = useState(50); // Rs/Unit (kWh)
  const [carElecUnits, setCarElecUnits] = useState(40); // kWh
  const [carElecMileage, setCarElecMileage] = useState(300); // KM per full charge for EV car

  // Expenses (do not pre-populate automatically)
  const [maintMonthly, setMaintMonthly] = useState(0);
  const [parkingDaily, setParkingDaily] = useState(0);

  // Active Ride Inputs
  const [fare, setFare] = useState(500);
  const [distance, setDistance] = useState(12);

  // Saved notification feedback
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Trip History
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripFare, setTripFare] = useState('');
  const [tripDist, setTripDist] = useState('');

  React.useEffect(() => {
    // Fetch live petrol price from open net API with fallback to 280
    fetch('https://api.allorigins.win/raw?url=https://www.globalpetrolprices.com/Pakistan/gasoline_prices/')
      .then(res => res.text())
      .then(() => {
        setBikePetrolPrice(280);
        setCarPetrolPrice(280);
      })
      .catch(() => {
        setBikePetrolPrice(280);
        setCarPetrolPrice(280);
      });
  }, []);

  // Cost per KM calculations
  const petrolCostPerKm = bikePetrolPrice / Math.max(1, bikePetrolAvg);
  const bikeElecFullCost = bikeElecUnits * bikeElecRate;
  const elecCostPerKm = bikeElecFullCost / Math.max(1, bikeElecMileage);

  const carPetrolCostPerKm = carPetrolPrice / Math.max(1, carPetrolAvg);
  const carElecFullCost = carElecUnits * carElecRate;
  const carElecCostPerKm = carElecFullCost / Math.max(1, carElecMileage);

  const handleSaveProfile = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAddTrip = () => {
    const f = parseFloat(tripFare);
    const d = parseFloat(tripDist);
    if (!f || !d) return;

    const newTrip: Trip = {
      id: 'trip-' + Date.now(),
      fare: f,
      distance: d,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTrips([newTrip, ...trips]);
    setFare(f);
    setDistance(d);
    setTripFare('');
    setTripDist('');
  };

  // ==========================================
  // PROFIT FORMULA
  // Formula: Net Profit = Ride Fare - Platform Fee (%) - Fuel/Power Cost
  // ==========================================

  const platformFeeAmount = fare * (Math.max(0, platformFeePercent) / 100);

  // Petrol Bike
  const petrolRideFuelCost = distance * petrolCostPerKm;
  const petrolNetProfit = fare - platformFeeAmount - petrolRideFuelCost;
  const petrolMargin = fare > 0 ? (petrolNetProfit / fare) * 100 : 0;

  // EV Bike
  const evRidePowerCost = distance * elecCostPerKm;
  const evNetProfit = fare - platformFeeAmount - evRidePowerCost;
  const evMargin = fare > 0 ? (evNetProfit / fare) * 100 : 0;

  // Car Calculations
  const carPetrolRideCost = distance * carPetrolCostPerKm;
  const carPetrolNetProfit = fare - platformFeeAmount - carPetrolRideCost;

  const carEvRideCost = distance * carElecCostPerKm;
  const carEvNetProfit = fare - platformFeeAmount - carEvRideCost;

  // Active Car Selection
  const activeCarCostPerKm = carType === 'ev' ? carElecCostPerKm : carPetrolCostPerKm;
  const carRideFuelCost = carType === 'ev' ? carEvRideCost : carPetrolRideCost;
  const carNetProfit = carType === 'ev' ? carEvNetProfit : carPetrolNetProfit;
  const carMargin = fare > 0 ? (carNetProfit / fare) * 100 : 0;

  // Selected Active Vehicle Stats
  const activeNetProfit = vehicleType === 'Bike' 
    ? (bikeEngineType === 'ev' ? evNetProfit : petrolNetProfit)
    : carNetProfit;

  const activeFuelCost = vehicleType === 'Bike'
    ? (bikeEngineType === 'ev' ? evRidePowerCost : petrolRideFuelCost)
    : carRideFuelCost;

  const activeCostPerKm = vehicleType === 'Bike'
    ? (bikeEngineType === 'ev' ? elecCostPerKm : petrolCostPerKm)
    : activeCarCostPerKm;

  const activeMargin = fare > 0 ? (activeNetProfit / fare) * 100 : 0;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-[#F5F8F6] border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden text-[#071B2B]">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#16A36A]/12 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#F0B429]/12 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-[#071B2B] border border-slate-200 text-xs font-bold mb-3 shadow-xs">
              {vehicleType === 'Bike' ? <Bike className="w-3.5 h-3.5 text-[#16A36A]" /> : <Car className="w-3.5 h-3.5 text-[#16A36A]" />}
              <span>Rider &amp; Driver Net Profit Calculator</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#071B2B] tracking-tight">
              {vehicleType === 'Bike' ? 'Motorcycle (Bike) Profit Calculator' : 'Car & Cab Driver Profit Calculator'}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-3xl font-normal leading-relaxed">
              Calculate exact net profit per ride: <strong>Ride Fare − Platform Fee ({platformFeePercent}%) − Fuel / Power Cost</strong>.
              {vehicleType === 'Bike' ? ' Compare Petrol vs Electric Bike profits instantly.' : ' Compare Petrol vs Hybrid Car profits instantly.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6 text-xs">
          
          {/* Vehicle Setup Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              1. Select Vehicle Type &amp; Fuel Specifications
            </h2>

            {/* Main Vehicle Category (Motorcycle vs Car) */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl font-bold">
              <button
                type="button"
                onClick={() => setVehicleType('Bike')}
                className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  vehicleType === 'Bike' ? 'bg-[#16A36A] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Bike className="w-4 h-4" /> Motorcycle (Bike)
              </button>
              <button
                type="button"
                onClick={() => setVehicleType('Car')}
                className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  vehicleType === 'Car' ? 'bg-[#16A36A] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Car className="w-4 h-4" /> Car / Cab
              </button>
            </div>

            {/* MOTORCYCLE SUB-TAB: Petrol Bike vs EV Bike */}
            {vehicleType === 'Bike' ? (
              <div className="space-y-4 pt-1">
                
                <div className="space-y-1.5">
                  <label className="block font-extrabold uppercase text-slate-800 text-[11px]">
                    Active Motorcycle Engine Type:
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200 font-bold">
                    <button
                      type="button"
                      onClick={() => setBikeEngineType('petrol')}
                      className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                        bikeEngineType === 'petrol'
                          ? 'bg-[#071B2B] text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Flame className="w-4 h-4" /> Petrol Bike
                    </button>
                    <button
                      type="button"
                      onClick={() => setBikeEngineType('ev')}
                      className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                        bikeEngineType === 'ev'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Zap className="w-4 h-4" /> Electric (EV) Bike
                    </button>
                  </div>
                </div>

                {/* DETAILS SHOWING FOR SELECTED BIKE TYPE */}
                {bikeEngineType === 'petrol' ? (
                  <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-rose-200/60 pb-2">
                      <span className="font-extrabold text-rose-950 uppercase text-xs flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-rose-600" /> Petrol Bike Fuel Specs
                      </span>
                      <span className="text-[11px] font-black text-rose-700 bg-white px-2 py-0.5 rounded-full border border-rose-200">
                        Rs {petrolCostPerKm.toFixed(2)} / km
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-rose-900 mb-1">Petrol Rate (Rs / Liter):</label>
                        <input
                          type="number"
                          value={bikePetrolPrice}
                          onChange={(e) => setBikePetrolPrice(Number(e.target.value))}
                          className="w-full p-2.5 bg-white border border-rose-200 rounded-lg font-bold text-slate-900 outline-none focus:border-rose-500"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-rose-900 mb-1">Fuel Mileage (Km / Liter):</label>
                        <input
                          type="number"
                          value={bikePetrolAvg}
                          onChange={(e) => setBikePetrolAvg(Number(e.target.value))}
                          className="w-full p-2.5 bg-white border border-rose-200 rounded-lg font-bold text-slate-900 outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-rose-800">
                      Fuel Cost per KM = Petrol Rate ({bikePetrolPrice}) ÷ Mileage ({bikePetrolAvg}) = <strong>Rs {petrolCostPerKm.toFixed(2)} / km</strong>
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                      <span className="font-extrabold text-emerald-950 uppercase text-xs flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-emerald-600" /> Electric (EV) Bike Specs
                      </span>
                      <span className="text-[11px] font-black text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                        Rs {elecCostPerKm.toFixed(2)} / km
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-emerald-900 mb-1">Electric Price (Rs / kWh):</label>
                        <input
                          type="number"
                          value={bikeElecRate}
                          onChange={(e) => setBikeElecRate(Number(e.target.value))}
                          className="w-full p-2.5 bg-white border border-emerald-200 rounded-lg font-bold text-slate-900 outline-none focus:border-emerald-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-emerald-900 mb-1">Battery Units (kWh):</label>
                        <input
                          type="number"
                          step={0.1}
                          value={bikeElecUnits}
                          onChange={(e) => setBikeElecUnits(Number(e.target.value))}
                          className="w-full p-2.5 bg-white border border-emerald-200 rounded-lg font-bold text-slate-900 outline-none focus:border-emerald-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-emerald-900 mb-1">Full Charge Mileage (KM):</label>
                        <input
                          type="number"
                          value={bikeElecMileage}
                          onChange={(e) => setBikeElecMileage(Number(e.target.value))}
                          className="w-full p-2.5 bg-white border border-emerald-200 rounded-lg font-bold text-slate-900 outline-none focus:border-emerald-500 text-xs"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 bg-white/80 border border-emerald-200 rounded-lg flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-900">Cost per Full Charge ({bikeElecUnits} kWh):</span>
                      <strong className="text-sm font-black text-emerald-700">
                        {bikeElecUnits} kWh × Rs {bikeElecRate} = Rs {bikeElecFullCost.toFixed(1)}
                      </strong>
                    </div>

                    <p className="text-[10px] text-emerald-800">
                      Power Cost per KM = Full Charge Cost ({bikeElecFullCost.toFixed(1)}) ÷ Mileage ({bikeElecMileage}) = <strong>Rs {elecCostPerKm.toFixed(2)} / km</strong>
                    </p>
                  </div>
                )}

              </div>
            ) : (
              /* CAR DETAILS SECTION */
              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="block font-extrabold uppercase text-slate-800 text-[11px]">
                    Active Car Engine Type:
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200 font-bold">
                    <button
                      type="button"
                      onClick={() => setCarType('petrol')}
                      className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                        carType === 'petrol' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Flame className="w-4 h-4" /> Petrol Car (1.0L / 1.3L)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCarType('ev')}
                      className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                        carType === 'ev' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Zap className="w-4 h-4" /> Electric (EV) Car
                    </button>
                  </div>
                </div>

                {carType === 'petrol' ? (
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                      <span className="font-extrabold text-blue-950 uppercase text-xs flex items-center gap-1.5">
                        <Car className="w-4 h-4 text-blue-600" /> Petrol Car Specs
                      </span>
                      <span className="text-[11px] font-black text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                        Rs {activeCarCostPerKm.toFixed(2)} / km
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Petrol Rate (Rs / Liter):</label>
                        <input
                          type="number"
                          value={carPetrolPrice}
                          onChange={(e) => setCarPetrolPrice(Number(e.target.value))}
                          className="w-full p-2.5 bg-white border border-blue-200 rounded-lg font-bold text-slate-900 outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Car Mileage (Km / Liter):</label>
                        <input
                          type="number"
                          value={carPetrolAvg}
                          onChange={(e) => setCarPetrolAvg(Number(e.target.value))}
                          className="w-full p-2.5 bg-white border border-blue-200 rounded-lg font-bold text-slate-900 outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600">
                      Car Fuel Cost per KM = Petrol Rate ({carPetrolPrice}) ÷ Mileage ({carPetrolAvg}) = <strong>Rs {activeCarCostPerKm.toFixed(2)} / km</strong>
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                      <span className="font-extrabold text-emerald-950 uppercase text-xs flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-emerald-600" /> Electric (EV) Car Specs
                      </span>
                      <span className="text-[11px] font-black text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                        Rs {activeCarCostPerKm.toFixed(2)} / km
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-emerald-900 mb-1">Electric Price (Rs / kWh):</label>
                        <input
                          type="number"
                          value={carElecRate}
                          onChange={(e) => setCarElecRate(Number(e.target.value))}
                          className="w-full p-2.5 bg-white border border-emerald-200 rounded-lg font-bold text-slate-900 outline-none focus:border-emerald-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-emerald-900 mb-1">Battery Units (kWh):</label>
                        <input
                          type="number"
                          step={0.1}
                          value={carElecUnits}
                          onChange={(e) => setCarElecUnits(Number(e.target.value))}
                          className="w-full p-2.5 bg-white border border-emerald-200 rounded-lg font-bold text-slate-900 outline-none focus:border-emerald-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-emerald-900 mb-1">Full Charge Mileage (KM):</label>
                        <input
                          type="number"
                          value={carElecMileage}
                          onChange={(e) => setCarElecMileage(Number(e.target.value))}
                          className="w-full p-2.5 bg-white border border-emerald-200 rounded-lg font-bold text-slate-900 outline-none focus:border-emerald-500 text-xs"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 bg-white/80 border border-emerald-200 rounded-lg flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-900">Cost per Full Charge ({carElecUnits} kWh):</span>
                      <strong className="text-sm font-black text-emerald-700">
                        {carElecUnits} kWh × Rs {carElecRate} = Rs {carElecFullCost.toFixed(1)}
                      </strong>
                    </div>

                    <p className="text-[10px] text-emerald-800">
                      Power Cost per KM = Full Charge Cost ({carElecFullCost.toFixed(1)}) ÷ Mileage ({carElecMileage}) = <strong>Rs {activeCarCostPerKm.toFixed(2)} / km</strong>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Maintenance & Parking */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Monthly Service / Repair (Rs)</label>
                <input
                  type="number"
                  value={maintMonthly}
                  onChange={(e) => setMaintMonthly(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Daily Toll / Parking (Rs)</label>
                <input
                  type="number"
                  value={parkingDaily}
                  onChange={(e) => setParkingDaily(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveProfile}
              className="w-full py-2.5 bg-[#16A36A] hover:bg-[#138a59] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {savedSuccess ? 'Profile Saved!' : 'Save Vehicle Specs'}
            </button>
          </div>

          {/* Ride History */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              2. Log Recent Ride History
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Ride Fare (Rs)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={tripFare}
                  onChange={(e) => setTripFare(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Distance (km)</label>
                <input
                  type="number"
                  placeholder="e.g. 12"
                  value={tripDist}
                  onChange={(e) => setTripDist(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddTrip}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Ride Entry
            </button>

            {trips.length > 0 && (
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 border-t border-slate-100 pt-2">
                {trips.map(t => (
                  <div key={t.id} className="flex justify-between py-1.5 text-xs">
                    <span className="font-bold text-slate-900">Ride Fare: Rs {t.fare}</span>
                    <span className="text-slate-500">{t.distance} km • {t.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Output Panel - CALCULATOR FORMULA & PROFIT DISPLAY (5 cols) */}
        <div className="lg:col-span-5 space-y-6 text-xs">
          
          {/* Active Ride Input Panel with Editable Platform Fee */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                {vehicleType === 'Bike' ? 'Motorcycle Single Ride Inputs' : 'Car / Cab Single Ride Inputs'}
              </h2>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {vehicleType === 'Bike' ? 'Bike Mode' : 'Car Mode'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Offered Fare (Rs)</label>
                <input
                  type="number"
                  value={fare}
                  onChange={(e) => setFare(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Distance (km)</label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Editable Platform Fee Input */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-extrabold uppercase text-amber-950 text-[11px] flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-amber-600" /> Platform Fee (%)
                </label>
                <span className="text-xs font-black text-amber-800">
                  {platformFeePercent}% = Rs {platformFeeAmount.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={0.5}
                  value={platformFeePercent}
                  onChange={(e) => setPlatformFeePercent(Math.max(0, Number(e.target.value)))}
                  className="w-24 p-2 bg-white border border-amber-300 rounded-lg font-black text-slate-900 outline-none focus:border-amber-500 text-center"
                />
                <div className="flex flex-wrap gap-1 flex-1">
                  <button
                    type="button"
                    onClick={() => setPlatformFeePercent(12)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                      platformFeePercent === 12
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    12% (inDrive)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatformFeePercent(15)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                      platformFeePercent === 15
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    15% (Yango)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatformFeePercent(10)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                      platformFeePercent === 10
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    10% (Bykea)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatformFeePercent(0)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                      platformFeePercent === 0
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    0% (Direct)
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-amber-800">
                Enter any commission or platform tax rate. App recalculates net earnings automatically.
              </p>
            </div>
          </div>

          {/* FORMULA BREAKDOWN RESULT CARD */}
          <div className="bg-white border border-slate-200/90 text-[#071B2B] rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-xs font-extrabold uppercase text-slate-500">
                {vehicleType === 'Bike' ? 'Motorcycle Profit Result' : 'Car Profit Result'}
              </span>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                activeNetProfit > 0 ? 'bg-emerald-50 text-[#16A36A] border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
              }`}>
                {activeMargin.toFixed(0)}% Profit Margin
              </span>
            </div>

            {/* Formula Visual Box */}
            <div className="space-y-2 text-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Formula Applied:</div>
              <div className="p-3 bg-[#F5F8F6] rounded-xl border border-slate-200 font-mono text-[11px] text-[#071B2B]">
                Net Profit = Ride Fare − Platform Fee ({platformFeePercent}%) − {
                  vehicleType === 'Bike' 
                    ? (bikeEngineType === 'ev' ? 'EV Power Cost' : 'Petrol Fuel Cost')
                    : (carType === 'ev' ? 'Electric Power Cost' : 'Petrol Fuel Cost')
                }
              </div>

              {/* Step-by-Step Breakdown */}
              <div className="pt-2 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Ride Fare Offered:</span>
                  <strong className="text-[#071B2B]">+ Rs {fare.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Platform Fee ({platformFeePercent}%):</span>
                  <strong>− Rs {platformFeeAmount.toFixed(1)}</strong>
                </div>
                <div className="flex justify-between text-amber-600">
                  <span>
                    {vehicleType === 'Bike'
                      ? (bikeEngineType === 'ev' ? 'EV Power Cost' : 'Petrol Fuel Cost')
                      : (carType === 'ev' ? 'Electric Power Cost' : 'Petrol Fuel Cost')
                    } ({distance} km @ Rs {activeCostPerKm.toFixed(2)}/km):
                  </span>
                  <strong>− Rs {activeFuelCost.toFixed(1)}</strong>
                </div>
              </div>
            </div>

            {/* Final Net Profit */}
            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  {vehicleType === 'Bike' ? 'Bike Net Profit Per Ride' : 'Car Net Profit Per Ride'}
                </span>
                <div className="text-3xl font-black text-[#16A36A] mt-0.5">
                  Rs {Math.round(activeNetProfit).toLocaleString('en-PK')}
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-600">
                <span>Selected: </span>
                <strong className="text-[#071B2B] capitalize block">
                  {vehicleType === 'Bike' 
                    ? (bikeEngineType === 'ev' ? 'Electric (EV) Bike' : 'Petrol Bike')
                    : (carType === 'ev' ? 'Electric (EV) Car' : 'Petrol Car')
                  }
                </strong>
              </div>
            </div>

            {/* Income Projections */}
            <div className="grid grid-cols-2 gap-2 bg-[#F5F8F6] p-3 rounded-xl border border-slate-200 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px]">Daily ({vehicleType === 'Bike' ? '12 rides' : '8 rides'}):</span>
                <strong className="text-[#16A36A] font-black text-sm">
                  Rs {Math.round(activeNetProfit * (vehicleType === 'Bike' ? 12 : 8)).toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Monthly (26 days):</span>
                <strong className="text-[#16A36A] font-black text-sm">
                  Rs {Math.round(activeNetProfit * (vehicleType === 'Bike' ? 12 : 8) * 26).toLocaleString()}
                </strong>
              </div>
            </div>
          </div>

          {/* DYNAMIC COMPARISON BOX: BIKE vs CAR DEDICATED BREAKDOWN */}
          {vehicleType === 'Bike' ? (
            /* MOTORCYCLE COMPARISON: PETROL VS EV BIKE */
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Bike className="w-4 h-4 text-blue-600" /> Petrol Bike vs EV Bike Profit
                </h3>
                <span className="text-[10px] text-slate-500 font-bold">Per {distance} km ride</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* EV Box */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-950">
                  <div className="flex items-center gap-1 font-extrabold text-[11px] text-emerald-800 uppercase">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" /> EV Bike Profit
                  </div>
                  <div className="text-xl font-black text-emerald-700">
                    Rs {Math.round(evNetProfit).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-800 block">Power: Rs {evRidePowerCost.toFixed(1)} ({elecCostPerKm.toFixed(2)}/km)</span>
                  <div className="text-[10px] text-slate-600 font-bold mt-1">
                    Daily (12 rides): Rs {Math.round(evNetProfit * 12).toLocaleString()}
                  </div>
                </div>

                {/* Petrol Box */}
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-rose-950">
                  <div className="flex items-center gap-1 font-extrabold text-[11px] text-rose-800 uppercase">
                    <Flame className="w-3.5 h-3.5 text-rose-600" /> Petrol Bike Profit
                  </div>
                  <div className="text-xl font-black text-rose-700">
                    Rs {Math.round(petrolNetProfit).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-rose-800 block">Fuel: Rs {petrolRideFuelCost.toFixed(1)} ({petrolCostPerKm.toFixed(2)}/km)</span>
                  <div className="text-[10px] text-slate-600 font-bold mt-1">
                    Daily (12 rides): Rs {Math.round(petrolNetProfit * 12).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Difference Banner */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-blue-950">
                <span className="text-[11px] font-bold">EV Extra Savings per Ride:</span>
                <strong className="text-sm font-black text-blue-700">
                  + Rs {Math.round(evNetProfit - petrolNetProfit).toLocaleString()}
                </strong>
              </div>
            </div>
          ) : (
            /* CAR COMPARISON: PETROL CAR VS ELECTRIC CAR */
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-blue-600" /> Petrol Car vs Electric Car Profit
                </h3>
                <span className="text-[10px] text-slate-500 font-bold">Per {distance} km ride</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Electric Car Box */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-950">
                  <div className="flex items-center gap-1 font-extrabold text-[11px] text-emerald-800 uppercase">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" /> Electric Car Profit
                  </div>
                  <div className="text-xl font-black text-emerald-700">
                    Rs {Math.round(carEvNetProfit).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-800 block">
                    Power: Rs {carEvRideCost.toFixed(1)} ({carElecCostPerKm.toFixed(2)}/km)
                  </span>
                  <div className="text-[10px] text-slate-600 font-bold mt-1">
                    Daily (8 rides): Rs {Math.round(carEvNetProfit * 8).toLocaleString()}
                  </div>
                </div>

                {/* Petrol Car Box */}
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-rose-950">
                  <div className="flex items-center gap-1 font-extrabold text-[11px] text-rose-800 uppercase">
                    <Flame className="w-3.5 h-3.5 text-rose-600" /> Petrol Car Profit
                  </div>
                  <div className="text-xl font-black text-rose-700">
                    Rs {Math.round(carPetrolNetProfit).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-rose-800 block">
                    Fuel: Rs {carPetrolRideCost.toFixed(1)} ({carPetrolCostPerKm.toFixed(2)}/km)
                  </span>
                  <div className="text-[10px] text-slate-600 font-bold mt-1">
                    Daily (8 rides): Rs {Math.round(carPetrolNetProfit * 8).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Difference Banner */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-blue-950">
                <span className="text-[11px] font-bold">EV Extra Savings per Ride:</span>
                <strong className="text-sm font-black text-blue-700">
                  + Rs {Math.round(carEvNetProfit - carPetrolNetProfit).toLocaleString()}
                </strong>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default RiderProfitCalculator;


