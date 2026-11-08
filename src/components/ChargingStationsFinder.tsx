import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  MapPin, 
  Search, 
  Navigation, 
  Phone, 
  Clock, 
  ShieldCheck, 
  SlidersHorizontal, 
  Fuel, 
  Compass, 
  ExternalLink, 
  Building2, 
  Sparkles, 
  Coffee, 
  Check, 
  Filter, 
  AlertCircle,
  Bike,
  Car,
  MessageCircle,
  X,
  Share2
} from 'lucide-react';
import { 
  CHARGING_STATIONS, 
  ChargingStation, 
  CITIES_LIST, 
  CORRIDORS_LIST, 
  ALL_OPERATORS 
} from '../data/chargingStationsData';

interface ChargingStationsFinderProps {
  onContactClick?: () => void;
}

export const ChargingStationsFinder: React.FC<ChargingStationsFinderProps> = ({ onContactClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedCorridor, setSelectedCorridor] = useState('All Corridors');
  const [selectedOperator, setSelectedOperator] = useState('All Operators');
  const [selectedSpeed, setSelectedSpeed] = useState<string>('all'); // all | ultra | fast | ac | ebike
  const [onlyEBikeCompatible, setOnlyEBikeCompatible] = useState(false);
  const [copiedStationId, setCopiedStationId] = useState<string | null>(null);

  // Filter logic
  const filteredStations = useMemo(() => {
    return CHARGING_STATIONS.filter((station) => {
      // City match
      const matchesCity = selectedCity === 'All Cities' || 
        station.city.toLowerCase().includes(selectedCity.toLowerCase()) ||
        (selectedCity.includes('Motorway') && station.locationType === 'Motorway / Highway');

      // Corridor match
      const matchesCorridor = selectedCorridor === 'All Corridors' || station.corridor === selectedCorridor;

      // Operator match
      const matchesOperator = selectedOperator === 'All Operators' || station.operator === selectedOperator;

      // Speed / Category match
      let matchesSpeed = true;
      if (selectedSpeed === 'ultra') {
        matchesSpeed = station.powerKW >= 100;
      } else if (selectedSpeed === 'fast') {
        matchesSpeed = station.powerKW >= 50 && station.powerKW < 100;
      } else if (selectedSpeed === 'ac') {
        matchesSpeed = station.chargerCategory.includes('AC');
      } else if (selectedSpeed === 'ebike') {
        matchesSpeed = station.connectors.some(c => c.includes('E-Scooter') || c.includes('15A'));
      }

      // E-Bike compatibility toggle
      const matchesEBike = !onlyEBikeCompatible || station.vehicleCompatibility.includes('E-Bikes & Scooters');

      // Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        station.name.toLowerCase().includes(q) ||
        station.address.toLowerCase().includes(q) ||
        station.city.toLowerCase().includes(q) ||
        station.landmark.toLowerCase().includes(q) ||
        station.operator.toLowerCase().includes(q) ||
        (station.corridor && station.corridor.toLowerCase().includes(q)) ||
        station.connectors.some(c => c.toLowerCase().includes(q));

      return matchesCity && matchesCorridor && matchesOperator && matchesSpeed && matchesEBike && matchesSearch;
    });
  }, [searchQuery, selectedCity, selectedCorridor, selectedOperator, selectedSpeed, onlyEBikeCompatible]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCity('All Cities');
    setSelectedCorridor('All Corridors');
    setSelectedOperator('All Operators');
    setSelectedSpeed('all');
    setOnlyEBikeCompatible(false);
  };

  const handleShareStation = (station: ChargingStation) => {
    const text = `EV Charging Station in Pakistan: ${station.name} (${station.powerKW}kW ${station.operator}) at ${station.address}. Check on https://goinfoev.pk`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedStationId(station.id);
      setTimeout(() => setCopiedStationId(null), 2500);
    }
  };

  // Helper for operator badge colors
  const getOperatorStyle = (operator: ChargingStation['operator']) => {
    switch (operator) {
      case 'Hubco Green':
        return 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20';
      case 'Shell Recharge':
        return 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20';
      case 'PSO EV':
        return 'bg-blue-700 text-white border-blue-600 shadow-blue-500/20';
      case 'Total Parco':
        return 'bg-red-600 text-white border-red-500 shadow-red-500/20';
      case 'Tesla Industries':
        return 'bg-purple-700 text-white border-purple-600 shadow-purple-500/20';
      case 'K-Electric':
        return 'bg-teal-600 text-white border-teal-500 shadow-teal-500/20';
      case 'BYD Mega':
        return 'bg-sky-600 text-white border-sky-500 shadow-sky-500/20';
      case 'Porsche / Audi':
        return 'bg-slate-900 text-amber-300 border-slate-700 shadow-slate-800/30';
      default:
        return 'bg-slate-800 text-white border-slate-700 shadow-slate-800/20';
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* ───────────────────────────────────────────────────────────
          HERO BANNER & SEARCH HEADER
      ──────────────────────────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────
          HERO BANNER & SEARCH HEADER
      ──────────────────────────────────────────────────────────── */}
      <section className="relative rounded-3xl overflow-hidden bg-[#F5F8F6] text-[#071B2B] p-6 sm:p-10 shadow-xs border border-slate-200/90">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#16A36A]/12 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F0B429]/12 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl">
          {/* Tag / Live Status */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#071B2B] text-xs font-bold border border-slate-200 mb-4 shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A36A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#16A36A]"></span>
            </span>
            <span>Pakistan Nationwide Official EV Charging Network</span>
            <span className="text-[10px] font-black uppercase bg-[#16A36A] text-white px-2 py-0.5 rounded-full">
              Live Tracker
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#071B2B] leading-tight">
            Pakistan EV <span className="text-[#16A36A]">Charging Stations</span> &amp; Motorway Tracker
          </h1>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl font-normal">
            Find verified <strong>Fast DC Chargers (60kW - 180kW)</strong> across Pakistan, including motorway service areas (M-2, M-3, M-5, M-9), GT Road, and major hubs in Karachi, Lahore, Islamabad, Peshawar, Multan, and Faisalabad. Access real-time power outputs, connector types (CCS2, GBT, Type-2), tariff rates, and Google Maps navigation in one click.
          </p>

          {/* Quick Search Bar */}
          <div className="mt-6 relative max-w-2xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by city, motorway, area or brand (e.g. Bhera M-2, Sukheki, F-7, DHA, Hubco, Shell)..."
                className="w-full pl-12 pr-12 py-3.5 sm:py-4 rounded-2xl bg-white border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A36A] transition-all shadow-xs font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1.5 bg-slate-100 rounded-xl cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Highlight Stats Row */}
        <div className="mt-8 pt-6 border-t border-slate-200/90 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-xl sm:text-2xl font-black text-[#16A36A] flex items-center gap-1.5">
              <Zap className="w-5 h-5" />
              <span>{CHARGING_STATIONS.length}+ Verified</span>
            </div>
            <div className="text-xs text-slate-600 font-semibold mt-0.5">Nationwide EV Stations</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-xl sm:text-2xl font-black text-blue-600 flex items-center gap-1.5">
              <Fuel className="w-5 h-5" />
              <span>Up to 180 kW</span>
            </div>
            <div className="text-xs text-slate-600 font-semibold mt-0.5">Ultra-Fast Liquid Cooled DC</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-xl sm:text-2xl font-black text-amber-600 flex items-center gap-1.5">
              <Compass className="w-5 h-5" />
              <span>M-2, M-3, M-5, M-9</span>
            </div>
            <div className="text-xs text-slate-600 font-semibold mt-0.5">Intercity Motorway Corridors</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-xl sm:text-2xl font-black text-teal-600 flex items-center gap-1.5">
              <Bike className="w-5 h-5" />
              <span>E-Scooters &amp; Cars</span>
            </div>
            <div className="text-xs text-slate-600 font-semibold mt-0.5">Dual 2-Wheeler / 4-Wheeler</div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          MOTORWAY TRAVEL ADVISORY BOX
      ──────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-teal-50 to-emerald-50 border border-teal-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-600 text-white shadow-sm shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <span>Travelling between Lahore &amp; Islamabad on M-2 Motorway?</span>
              <span className="text-[10px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                Zero Range Anxiety
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              <strong>Bhera Service Area (KM 232)</strong> has dual 180kW Ultra-Fast DC chargers (Northbound &amp; Southbound). 
              A 20-minute coffee stop will charge most EVs (BYD Atto 3, Deepal S07, MG4) from 20% to 80%. <strong>Sukheki (KM 105)</strong> provides additional backup.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedCorridor('M-2 (Lahore-Islamabad)');
            setSelectedCity('All Cities');
          }}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Filter M-2 Motorway Stations</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────
          FILTER CONTROLS
      ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
        
        {/* Row 1: Corridor Filter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Route / Corridor (موٹروے و شاہراہیں):</span>
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Active: <strong className="text-slate-900">{selectedCorridor}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
            {CORRIDORS_LIST.map((corridor) => {
              const isSelected = selectedCorridor === corridor;
              return (
                <button
                  key={corridor}
                  onClick={() => setSelectedCorridor(corridor)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-slate-950 text-white shadow-md shadow-slate-950/20 ring-2 ring-emerald-400'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {corridor}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: City Filter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Select City (شہر کا انتخاب کریں):</span>
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Active: <strong className="text-slate-900">{selectedCity}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
            {CITIES_LIST.map((city) => {
              const isSelected = selectedCity === city;
              return (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {city}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Speed, Operator & Vehicle Toggles */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          
          {/* Charger Speed Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Speed:</span>
            </span>

            <button
              onClick={() => setSelectedSpeed('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                selectedSpeed === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Speeds
            </button>

            <button
              onClick={() => setSelectedSpeed('ultra')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                selectedSpeed === 'ultra' ? 'bg-purple-700 text-white shadow-xs' : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              ⚡ Ultra-Fast (120-180kW)
            </button>

            <button
              onClick={() => setSelectedSpeed('fast')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                selectedSpeed === 'fast' ? 'bg-blue-600 text-white shadow-xs' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              Fast DC (50-60kW)
            </button>

            <button
              onClick={() => setSelectedSpeed('ac')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                selectedSpeed === 'ac' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              AC Wallbox (7-22kW)
            </button>
          </div>

          {/* E-Bike Compatibility Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyEBikeCompatible(!onlyEBikeCompatible)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                onlyEBikeCompatible
                  ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>E-Scooter / 2-Wheeler Compatible</span>
              {onlyEBikeCompatible && <Check className="w-3 h-3" />}
            </button>

            {/* Clear Filters Button */}
            {(selectedCity !== 'All Cities' || selectedCorridor !== 'All Corridors' || selectedSpeed !== 'all' || selectedOperator !== 'All Operators' || searchQuery || onlyEBikeCompatible) && (
              <button
                onClick={handleClearFilters}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset All</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ───────────────────────────────────────────────────────────
          RESULTS HEADER & COUNT
      ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Verified Charging Stations</span>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              {filteredStations.length} of {CHARGING_STATIONS.length} Available
            </span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Click &apos;Directions on Google Maps&apos; to navigate directly to the charging bay from your smartphone or car dashboard.
          </p>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────
          STATIONS GRID
      ──────────────────────────────────────────────────────────── */}
      {filteredStations.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">No charging stations match your current filters</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try choosing &apos;All Cities&apos; or resetting your search parameters to view all nationwide stations.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStations.map((station) => {
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(station.gpsQuery + ' ' + station.address)}`;
            const isCopied = copiedStationId === station.id;

            return (
              <div 
                key={station.id}
                className="rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
              >
                {/* Card Top Banner with Operator & Power */}
                <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                  
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-xl border shadow-xs ${getOperatorStyle(station.operator)}`}>
                      {station.operator}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {station.is24Hours ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>24/7 Open</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          <span>Showroom Hours</span>
                        </span>
                      )}

                      <button
                        onClick={() => handleShareStation(station)}
                        title="Copy details"
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Station Name & City */}
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {station.name}
                  </h3>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mt-1.5">
                    <span className="flex items-center gap-1 text-blue-700 font-bold">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{station.city}</span>
                    </span>
                    {station.corridor && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.2 rounded-md">
                          {station.corridor}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Card Middle: Power & Connectors Spec Box */}
                <div className="p-5 space-y-4 flex-1">
                  
                  {/* High Impact Power Metric */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xs flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                        Charging Output
                      </div>
                      <div className="text-2xl font-black text-white flex items-baseline gap-1">
                        <span>{station.powerKW}</span>
                        <span className="text-sm text-emerald-300 font-bold">kW</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-semibold text-slate-400">
                        {station.portsCount} Dispenser Guns
                      </div>
                      <div className="text-xs font-bold text-amber-300 mt-0.5">
                        {station.chargerCategory.split('(')[0].trim()}
                      </div>
                    </div>
                  </div>

                  {/* Connector Types */}
                  <div>
                    <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block mb-1.5">
                      Available Plugs &amp; Guns:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {station.connectors.map((c) => (
                        <span 
                          key={c}
                          className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
                            c === 'CCS2' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : c === 'GBT DC'
                              ? 'bg-teal-50 text-teal-700 border-teal-200'
                              : c.includes('E-Scooter') || c.includes('15A')
                              ? 'bg-rose-50 text-rose-700 border-rose-200 font-black'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Address & Landmark */}
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-700 leading-relaxed">
                      <strong>Address:</strong> {station.address}
                    </p>
                    <p className="text-slate-500">
                      <strong>Landmark:</strong> {station.landmark}
                    </p>
                  </div>

                  {/* Tariff Estimate */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Estimated Tariff:</span>
                    <span className="font-extrabold text-slate-900">{station.estimatedRatePerKWh}</span>
                  </div>

                  {/* Notes / Tips */}
                  {station.notes && (
                    <p className="text-[11px] text-slate-600 italic bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 leading-normal">
                      💡 {station.notes}
                    </p>
                  )}

                  {/* Amenities */}
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                      On-Site Amenities:
                    </span>
                    <div className="flex flex-wrap gap-1 text-[11px] text-slate-600">
                      {station.amenities.map(a => (
                        <span key={a} className="px-2 py-0.5 bg-slate-100 rounded-md">
                          ✓ {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Direct Action Links */}
                <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/80 flex items-center gap-2">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Navigate (Google Maps)</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>

                  {station.phone && (
                    <a
                      href={`tel:${station.phone}`}
                      className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                      title={`Call ${station.name}`}
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">Call</span>
                    </a>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          SUBMISSION / COMMUNITY INQUIRY BANNER
      ──────────────────────────────────────────────────────────── */}
      <section className="rounded-3xl bg-[#F5F8F6] text-[#071B2B] p-6 sm:p-8 border border-slate-200/90 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs relative overflow-hidden">
        <div className="space-y-2 max-w-xl text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#071B2B] text-xs font-bold border border-slate-200 shadow-xs">
            <Sparkles className="w-3 h-3 text-[#16A36A]" />
            <span>Community EV Crowdsource Pakistan</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#071B2B]">
            Have an EV Charger or New Station to Add?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            If you operate a commercial DC fast charger, hotel AC destination port, or know a newly installed charging point on Pakistan Motorways or GT Road, submit details for immediate inclusion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://wa.me/923036001701?text=Hello%20Hamdan,%20I%20would%20like%20to%20add/report%20an%20EV%20Charging%20Station%20in%20Pakistan"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-2xl bg-[#16A36A] hover:bg-[#138a59] text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-[#16A36A]/20 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-white text-[#16A36A]" />
            <span>Submit via WhatsApp (+92 303 6001701)</span>
          </a>

          {onContactClick && (
            <button
              onClick={onContactClick}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
            >
              Contact Support
            </button>
          )}
        </div>
      </section>

    </div>
  );
};
