import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Globe,
  Play,
  Square,
  Compass,
  Gauge,
  Zap,
  Crosshair,
  Route,
  Clock,
  ArrowRight,
  ChevronRight,
  FastForward,
  RotateCcw
} from 'lucide-react';
import L from 'leaflet';

// Comprehensive database of Pakistani popular cities, sectors, and landmarks
const PAKISTAN_LANDMARKS: { name: string; city: string; coords: [number, number]; category: string }[] = [
  // Lahore
  { name: 'Liberty Market, Gulberg', city: 'Lahore', coords: [31.5126, 74.3436], category: 'Shopping & Commercial' },
  { name: 'DHA Phase 5, Lahore Cantt', city: 'Lahore', coords: [31.4673, 74.4089], category: 'Residential' },
  { name: 'DHA Phase 6, Main Boulevard', city: 'Lahore', coords: [31.4420, 74.4450], category: 'Residential' },
  { name: 'Gulberg III, Main Boulevard', city: 'Lahore', coords: [31.5102, 74.3587], category: 'Commercial Hub' },
  { name: 'Bahria Town, Sector C', city: 'Lahore', coords: [31.3683, 74.1812], category: 'Residential' },
  { name: 'Johar Town, G1 Market', city: 'Lahore', coords: [31.4697, 74.2728], category: 'Commercial' },
  { name: 'Mall Road / Anarkali', city: 'Lahore', coords: [31.5580, 74.3270], category: 'Central Hub' },
  { name: 'Allama Iqbal International Airport', city: 'Lahore', coords: [31.5216, 74.4036], category: 'Airport' },
  { name: 'Model Town Link Road', city: 'Lahore', coords: [31.4820, 74.3210], category: 'Commercial' },
  { name: 'Thokar Niaz Baig / Canal Road', city: 'Lahore', coords: [31.4705, 74.2415], category: 'Interchange' },
  { name: 'WAPDA Town, Roundabout', city: 'Lahore', coords: [31.4330, 74.2670], category: 'Residential' },
  { name: 'Badshahi Mosque, Old City', city: 'Lahore', coords: [31.5881, 74.3106], category: 'Landmark' },
  { name: 'Packages Mall, Walton Road', city: 'Lahore', coords: [31.4788, 74.3533], category: 'Mall' },
  { name: 'Emporium Mall, Johar Town', city: 'Lahore', coords: [31.4675, 74.2650], category: 'Mall' },
  { name: 'Lahore Railway Station', city: 'Lahore', coords: [31.5772, 74.3364], category: 'Transit' },

  // Islamabad & Rawalpindi
  { name: 'F-6 Super Market', city: 'Islamabad', coords: [33.7297, 73.0746], category: 'Commercial' },
  { name: 'F-7 Jinnah Super Market', city: 'Islamabad', coords: [33.7215, 73.0560], category: 'Commercial' },
  { name: 'Blue Area, Jinnah Avenue', city: 'Islamabad', coords: [33.7103, 73.0571], category: 'Business District' },
  { name: 'F-10 Markaz', city: 'Islamabad', coords: [33.6961, 73.0034], category: 'Commercial' },
  { name: 'F-11 Markaz', city: 'Islamabad', coords: [33.6844, 72.9880], category: 'Commercial' },
  { name: 'G-11 Markaz', city: 'Islamabad', coords: [33.6680, 73.0010], category: 'Commercial' },
  { name: 'Centaurus Mall, Jinnah Avenue', city: 'Islamabad', coords: [33.7077, 73.0498], category: 'Mall' },
  { name: 'Islamabad International Airport (IIAP)', city: 'Islamabad', coords: [33.5605, 72.8518], category: 'Airport' },
  { name: 'Faizabad Interchange', city: 'Islamabad / Rawalpindi', coords: [33.6631, 73.0848], category: 'Interchange' },
  { name: 'Saddar, The Mall Road', city: 'Rawalpindi', coords: [33.5984, 73.0541], category: 'Commercial' },
  { name: 'Bahria Town Phase 4 / Civic Center', city: 'Rawalpindi', coords: [33.5280, 73.1090], category: 'Residential' },
  { name: 'Commercial Market, Satellite Town', city: 'Rawalpindi', coords: [33.6360, 73.0720], category: 'Shopping' },

  // Karachi
  { name: 'Clifton, Do Talwar & Boat Basin', city: 'Karachi', coords: [24.8138, 67.0299], category: 'Commercial' },
  { name: 'DHA Phase 5 & 6, Khayaban-e-Shahbaz', city: 'Karachi', coords: [24.8016, 67.0653], category: 'Residential' },
  { name: 'DHA Phase 8, Seaview', city: 'Karachi', coords: [24.7670, 67.0780], category: 'Coastal' },
  { name: 'Saddar, Zainab Market', city: 'Karachi', coords: [24.8569, 67.0146], category: 'Commercial' },
  { name: 'Gulshan-e-Iqbal, Nipa Chowrangi', city: 'Karachi', coords: [24.9207, 67.0928], category: 'Commercial' },
  { name: 'North Nazimabad, Hyderi Market', city: 'Karachi', coords: [24.9390, 67.0390], category: 'Shopping' },
  { name: 'Shahrah-e-Faisal, FTC Building', city: 'Karachi', coords: [24.8620, 67.0540], category: 'Business Corridor' },
  { name: 'Jinnah International Airport (KHI)', city: 'Karachi', coords: [24.9070, 67.1610], category: 'Airport' },
  { name: 'Lucky One Mall, Rashid Minhas Road', city: 'Karachi', coords: [24.9450, 67.0890], category: 'Mall' },
  { name: 'Dolmen Mall Clifton, Marine Drive', city: 'Karachi', coords: [24.8090, 67.0320], category: 'Mall' },
  { name: 'Malir Cantt, Karachi', city: 'Karachi', coords: [24.9230, 67.1990], category: 'Residential' },
  { name: 'Korangi Industrial Area', city: 'Karachi', coords: [24.8280, 67.1260], category: 'Industrial' },

  // Other Major Cities
  { name: 'Clock Tower (Ghanta Ghar)', city: 'Faisalabad', coords: [31.4187, 73.0791], category: 'Central Landmark' },
  { name: 'D-Ground Commercial Area', city: 'Faisalabad', coords: [31.4080, 73.1020], category: 'Commercial' },
  { name: 'Cantt & Mall Road', city: 'Multan', coords: [30.1980, 71.4480], category: 'Commercial' },
  { name: 'Bosan Road / Gulgasht Colony', city: 'Multan', coords: [30.2280, 71.4720], category: 'Commercial' },
  { name: 'University Road / Saddar', city: 'Peshawar', coords: [34.0040, 71.5320], category: 'Central Corridor' },
  { name: 'Hayatabad Phase 3', city: 'Peshawar', coords: [33.9920, 71.4390], category: 'Residential' },
  { name: 'GT Road / Model Town', city: 'Gujranwala', coords: [32.1877, 74.1945], category: 'Main Hub' },
  { name: 'Sialkot Cantt / Paris Road', city: 'Sialkot', coords: [32.4945, 74.5229], category: 'Commercial' },
  { name: 'Auto Bhan Road, Latifabad', city: 'Hyderabad', coords: [25.3720, 68.3490], category: 'Commercial' },
  { name: 'Jinnah Road / Cantt', city: 'Quetta', coords: [30.1798, 66.9750], category: 'City Center' },
];

interface GoogleMapsRouteCalculatorProps {
  onDistanceCalculated: (distanceKm: number) => void;
  currentDistance: number;
}

export const GoogleMapsRouteCalculator: React.FC<GoogleMapsRouteCalculatorProps> = ({
  onDistanceCalculated,
  currentDistance,
}) => {
  // Inputs
  const [originInput, setOriginInput] = useState('Liberty Market, Gulberg, Lahore');
  const [destInput, setDestInput] = useState('DHA Phase 5, Lahore Cantt, Lahore');

  // Autocomplete Dropdowns
  const [originSuggestions, setOriginSuggestions] = useState<typeof PAKISTAN_LANDMARKS>([]);
  const [destSuggestions, setDestSuggestions] = useState<typeof PAKISTAN_LANDMARKS>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [isFetchingOriginAPI, setIsFetchingOriginAPI] = useState(false);
  const [isFetchingDestAPI, setIsFetchingDestAPI] = useState(false);

  // Route Results & Calculation State
  const [isLoading, setIsLoading] = useState(false);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [durationText, setDurationText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [startCoords, setStartCoords] = useState<[number, number] | null>([31.5126, 74.3436]);
  const [endCoords, setEndCoords] = useState<[number, number] | null>([31.4673, 74.4089]);
  const [routeGeometry, setRouteGeometry] = useState<[number, number][] | null>(null);
  const [routeInstructions, setRouteInstructions] = useState<string[]>([]);

  // LIVE NAVIGATION STATE
  const [isNavigating, setIsNavigating] = useState(false);
  const [navMode, setNavMode] = useState<'simulation' | 'real_gps'>('simulation');
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState<number>(1);
  const [currentRiderPos, setCurrentRiderPos] = useState<[number, number] | null>(null);
  const [currentRiderIndex, setCurrentRiderIndex] = useState<number>(0);
  const [simSpeedKmh, setSimSpeedKmh] = useState<number>(38);
  const [remainingDistanceKm, setRemainingDistanceKm] = useState<number>(0);
  const [remainingTimeMins, setRemainingTimeMins] = useState<number>(0);
  const [currentRoadName, setCurrentRoadName] = useState<string>('En route to destination');
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Map & Leaflet Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);
  const simIntervalRef = useRef<any>(null);
  const watchPositionIdRef = useRef<number | null>(null);

  // Origin live suggestions search
  useEffect(() => {
    if (!originInput.trim() || originInput.length < 2) {
      setOriginSuggestions([]);
      return;
    }
    const q = originInput.toLowerCase();
    const localMatches = PAKISTAN_LANDMARKS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    ).slice(0, 5);

    setOriginSuggestions(localMatches);

    // Online Nominatim query with 350ms debounce for custom addresses
    const timeoutId = setTimeout(async () => {
      if (localMatches.length < 3 && originInput.length >= 3) {
        setIsFetchingOriginAPI(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=4&countrycodes=pk&q=${encodeURIComponent(
              originInput
            )}`
          );
          if (res.ok) {
            const data = await res.json();
            const formatted = data.map((d: any) => ({
              name: d.display_name.split(',').slice(0, 3).join(','),
              city: d.display_name.split(',')[1]?.trim() || 'Pakistan',
              coords: [parseFloat(d.lat), parseFloat(d.lon)] as [number, number],
              category: 'Map Location',
            }));
            setOriginSuggestions((prev) => {
              const combined = [...prev, ...formatted];
              // unique by coords
              return combined.filter(
                (v, i, a) => a.findIndex((t) => Math.abs(t.coords[0] - v.coords[0]) < 0.001) === i
              ).slice(0, 6);
            });
          }
        } catch (err) {
          console.warn('Origin autocomplete fetch error:', err);
        } finally {
          setIsFetchingOriginAPI(false);
        }
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [originInput]);

  // Destination live suggestions search
  useEffect(() => {
    if (!destInput.trim() || destInput.length < 2) {
      setDestSuggestions([]);
      return;
    }
    const q = destInput.toLowerCase();
    const localMatches = PAKISTAN_LANDMARKS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    ).slice(0, 5);

    setDestSuggestions(localMatches);

    const timeoutId = setTimeout(async () => {
      if (localMatches.length < 3 && destInput.length >= 3) {
        setIsFetchingDestAPI(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=4&countrycodes=pk&q=${encodeURIComponent(
              destInput
            )}`
          );
          if (res.ok) {
            const data = await res.json();
            const formatted = data.map((d: any) => ({
              name: d.display_name.split(',').slice(0, 3).join(','),
              city: d.display_name.split(',')[1]?.trim() || 'Pakistan',
              coords: [parseFloat(d.lat), parseFloat(d.lon)] as [number, number],
              category: 'Map Location',
            }));
            setDestSuggestions((prev) => {
              const combined = [...prev, ...formatted];
              return combined.filter(
                (v, i, a) => a.findIndex((t) => Math.abs(t.coords[0] - v.coords[0]) < 0.001) === i
              ).slice(0, 6);
            });
          }
        } catch (err) {
          console.warn('Dest autocomplete fetch error:', err);
        } finally {
          setIsFetchingDestAPI(false);
        }
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [destInput]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [31.5126, 74.3436],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Clean up map instance if unmounting
    };
  }, []);

  // Update Route Polyline & Markers on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const startIcon = L.divIcon({
      className: 'custom-start-marker',
      html: `<div style="background:#10b981;width:18px;height:18px;border:3px solid white;border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;">
              <div style="background:white;width:4px;height:4px;border-radius:50%;"></div>
             </div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    const endIcon = L.divIcon({
      className: 'custom-end-marker',
      html: `<div style="background:#ef4444;width:18px;height:18px;border:3px solid white;border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;">
              <div style="background:white;width:4px;height:4px;border-radius:50%;"></div>
             </div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    if (startCoords) {
      L.marker(startCoords, { icon: startIcon }).addTo(layerGroup).bindPopup('<b>Start / Pickup Point</b>');
    }

    if (endCoords) {
      L.marker(endCoords, { icon: endIcon }).addTo(layerGroup).bindPopup('<b>Destination Point</b>');
    }

    if (routeGeometry && routeGeometry.length > 0) {
      const polyline = L.polyline(routeGeometry, {
        color: '#2563eb',
        weight: 6,
        opacity: 0.9,
        lineJoin: 'round',
      }).addTo(layerGroup);

      if (!isNavigating) {
        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      }
    } else if (startCoords && endCoords) {
      map.fitBounds(L.latLngBounds([startCoords, endCoords]), { padding: [40, 40] });
    }
  }, [startCoords, endCoords, routeGeometry, isNavigating]);

  // Live Navigation Rider Marker on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentRiderPos && isNavigating) {
      const riderHtml = `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:34px;height:34px;background:rgba(37,99,235,0.3);border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="width:28px;height:28px;background:#2563eb;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,0.4);color:white;font-size:14px;font-weight:bold;">
            🏍️
          </div>
        </div>
      `;

      const riderIcon = L.divIcon({
        className: 'custom-rider-marker',
        html: riderHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      if (!riderMarkerRef.current) {
        riderMarkerRef.current = L.marker(currentRiderPos, { icon: riderIcon, zIndexOffset: 1000 }).addTo(map);
      } else {
        riderMarkerRef.current.setLatLng(currentRiderPos);
      }

      // Smooth pan map along with rider
      map.panTo(currentRiderPos, { animate: true, duration: 0.5 });
    } else {
      if (riderMarkerRef.current) {
        riderMarkerRef.current.remove();
        riderMarkerRef.current = null;
      }
    }
  }, [currentRiderPos, isNavigating]);

  // Geocode address
  const resolveLocationCoords = async (query: string): Promise<[number, number] | null> => {
    const cleanKey = query.trim().toLowerCase();
    const exact = PAKISTAN_LANDMARKS.find(
      (l) => l.name.toLowerCase() === cleanKey || cleanKey.includes(l.name.toLowerCase())
    );
    if (exact) return exact.coords;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=pk&q=${encodeURIComponent(
          query.includes('Pakistan') || query.includes('pakistan') ? query : `${query}, Pakistan`
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
      }
    } catch (e) {
      console.warn('Geocoding error:', e);
    }
    return null;
  };

  // Calculate OSRM Route
  const calculateRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(osrmUrl);
      if (!res.ok) throw new Error('Routing service busy');
      const data = await res.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distKm = Math.round((route.distance / 1000) * 10) / 10;
        const mins = Math.round(route.duration / 60);
        const durText = mins >= 60 ? `${Math.floor(mins / 60)} hr ${mins % 60} min` : `${mins} mins`;

        const latLngs: [number, number][] = route.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]]
        );

        // Parse turn-by-turn maneuvers
        const instructions: string[] = [];
        if (route.legs && route.legs[0]?.steps) {
          route.legs[0].steps.forEach((step: any) => {
            if (step.maneuver && step.name) {
              const modifier = step.maneuver.modifier ? ` (${step.maneuver.modifier})` : '';
              instructions.push(`${step.maneuver.type}${modifier} on ${step.name || 'Road'}`);
            }
          });
        }

        setRouteGeometry(latLngs);
        setRouteDistance(distKm);
        setDurationText(durText);
        setRouteInstructions(instructions.length > 0 ? instructions : ['Proceed straight to destination on main road']);
        setRemainingDistanceKm(distKm);
        setRemainingTimeMins(mins);
        setErrorMessage('');
        onDistanceCalculated(distKm);
        setIsLoading(false);
        return true;
      }
    } catch (err: any) {
      console.warn('OSRM error, falling back to road approximation:', err);
    }

    // Direct mathematical road calculation fallback
    const R = 6371;
    const dLat = ((end[0] - start[0]) * Math.PI) / 180;
    const dLon = ((end[1] - start[1]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((start[0] * Math.PI) / 180) *
        Math.cos((end[0] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightKm = R * c;
    const estimatedRoadKm = Math.round(straightKm * 1.28 * 10) / 10;
    const approxMins = Math.round((estimatedRoadKm / 35) * 60);

    // Generate 10 interpolation points between start and end
    const interpolated: [number, number][] = [];
    for (let i = 0; i <= 20; i++) {
      const frac = i / 20;
      interpolated.push([
        start[0] + (end[0] - start[0]) * frac,
        start[1] + (end[1] - start[1]) * frac,
      ]);
    }

    setRouteGeometry(interpolated);
    setRouteDistance(estimatedRoadKm);
    setDurationText(`~${approxMins} mins`);
    setRouteInstructions([
      'Follow main road highway toward destination',
      'Keep straight on designated EV bike route',
      'Arrive safely at destination point',
    ]);
    setRemainingDistanceKm(estimatedRoadKm);
    setRemainingTimeMins(approxMins);
    setErrorMessage('');
    onDistanceCalculated(estimatedRoadKm);
    setIsLoading(false);
    return true;
  };

  const handleSearchRoute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!originInput.trim() || !destInput.trim()) return;

    setShowOriginDropdown(false);
    setShowDestDropdown(false);
    setIsLoading(true);
    setErrorMessage('');
    stopNavigation();

    const [start, end] = await Promise.all([
      resolveLocationCoords(originInput),
      resolveLocationCoords(destInput),
    ]);

    if (!start || !end) {
      setIsLoading(false);
      setErrorMessage('Could not pinpoint locations. Please pick an address from the suggestions list.');
      return;
    }

    setStartCoords(start);
    setEndCoords(end);
    await calculateRoute(start, end);
  };

  // Auto-calculate on initial load if start/end default is present
  useEffect(() => {
    if (startCoords && endCoords && !routeDistance) {
      calculateRoute(startCoords, endCoords);
    }
  }, []);

  // START RIDE / NAVIGATION HANDLER
  const startRide = (mode: 'simulation' | 'real_gps') => {
    if (!routeGeometry || routeGeometry.length === 0) {
      setErrorMessage('Please calculate a route first before starting navigation.');
      return;
    }

    setIsNavigating(true);
    setNavMode(mode);
    setGpsError(null);

    // Zoom and focus map on start
    if (mapInstanceRef.current && routeGeometry[0]) {
      mapInstanceRef.current.setView(routeGeometry[0], 16, { animate: true });
    }

    if (mode === 'simulation') {
      setCurrentRiderIndex(0);
      setCurrentRiderPos(routeGeometry[0]);

      if (simIntervalRef.current) clearInterval(simIntervalRef.current);

      let idx = 0;
      const totalPoints = routeGeometry.length;
      const totalDist = routeDistance || 10;
      const totalMins = (totalDist / 35) * 60;

      simIntervalRef.current = setInterval(() => {
        idx += 1;
        if (idx >= totalPoints) {
          // Completed Ride
          clearInterval(simIntervalRef.current);
          setCurrentRiderIndex(totalPoints - 1);
          setRemainingDistanceKm(0);
          setRemainingTimeMins(0);
          setCurrentRoadName('Arrived at Destination! 🎉');
          return;
        }

        const currentPt = routeGeometry[idx];
        setCurrentRiderPos(currentPt);
        setCurrentRiderIndex(idx);

        const fractionDone = idx / totalPoints;
        const remKm = Math.max(0, Math.round((totalDist * (1 - fractionDone)) * 10) / 10);
        const remTime = Math.max(0, Math.round(totalMins * (1 - fractionDone)));

        setRemainingDistanceKm(remKm);
        setRemainingTimeMins(remTime);
        setSimSpeedKmh(Math.floor(35 + Math.sin(idx) * 8));

        // Update road name based on instructions
        const instrIdx = Math.floor(fractionDone * routeInstructions.length);
        if (routeInstructions[instrIdx]) {
          setCurrentRoadName(routeInstructions[instrIdx]);
        }
      }, 700 / simSpeedMultiplier);
    } else if (mode === 'real_gps') {
      if (!('geolocation' in navigator)) {
        setGpsError('Geolocation is not supported by your browser.');
        return;
      }

      watchPositionIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const userPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setCurrentRiderPos(userPos);
          if (pos.coords.speed !== null && pos.coords.speed !== undefined) {
            setSimSpeedKmh(Math.round(pos.coords.speed * 3.6));
          }

          // Calculate remaining distance to end
          if (endCoords) {
            const R = 6371;
            const dLat = ((endCoords[0] - userPos[0]) * Math.PI) / 180;
            const dLon = ((endCoords[1] - userPos[1]) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((userPos[0] * Math.PI) / 180) *
                Math.cos((endCoords[0] * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const remKm = Math.round(R * c * 1.25 * 10) / 10;
            setRemainingDistanceKm(remKm);
            setRemainingTimeMins(Math.round((remKm / 35) * 60));
          }
        },
        (err) => {
          console.warn('GPS watchPosition error:', err);
          setGpsError('GPS signal not received or permission denied. Showing simulated live tracking instead.');
          // Auto fall back to simulation
          setNavMode('simulation');
          startRide('simulation');
        },
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
      );
    }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    if (watchPositionIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchPositionIdRef.current);
      watchPositionIdRef.current = null;
    }
    setCurrentRiderPos(null);
    if (routeDistance) {
      setRemainingDistanceKm(routeDistance);
    }
    if (mapInstanceRef.current && routeGeometry && routeGeometry.length > 0) {
      mapInstanceRef.current.fitBounds(L.polyline(routeGeometry).getBounds(), { padding: [40, 40] });
    }
  };

  // Use Current Device Location as Origin
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setStartCoords(coords);
        setOriginInput(`My Current GPS Location (${coords[0].toFixed(4)}, ${coords[1].toFixed(4)})`);
        setIsLoading(false);
        if (endCoords) {
          calculateRoute(coords, endCoords);
        }
      },
      (err) => {
        setIsLoading(false);
        setErrorMessage('Unable to retrieve current location. Please type your location manually.');
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Route Search Box with Real-Time Dropdown Suggestions */}
      <div className="space-y-3 bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
        <div className="font-extrabold uppercase text-[11px] text-slate-900 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-blue-700">
            <Navigation className="w-4 h-4" /> Live Route Search &amp; Distance Calculator
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Globe className="w-3 h-3 text-emerald-600" />
            Pakistan GPS Road Router
          </span>
        </div>

        <form onSubmit={handleSearchRoute} className="grid grid-cols-1 md:grid-cols-2 gap-3 relative">
          {/* Origin Input with Autocomplete */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Start / Pickup Location
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 hover:underline"
              >
                <Crosshair className="w-3 h-3" /> Use My GPS
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Type street, market, sector, or city (e.g. Liberty Market)"
                value={originInput}
                onChange={(e) => {
                  setOriginInput(e.target.value);
                  setShowOriginDropdown(true);
                }}
                onFocus={() => setShowOriginDropdown(true)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg font-bold text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-xs"
              />
              {isFetchingOriginAPI && (
                <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-2.5 top-3 text-slate-400" />
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showOriginDropdown && originSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
                <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Suggested Locations</span>
                  <span className="text-blue-600">{originSuggestions.length} found</span>
                </div>
                {originSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setOriginInput(`${item.name}, ${item.city}`);
                      setStartCoords(item.coords);
                      setShowOriginDropdown(false);
                      if (endCoords) {
                        calculateRoute(item.coords, endCoords);
                      }
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-start gap-2.5 transition-colors group"
                  >
                    <div className="p-1 rounded-md bg-slate-100 group-hover:bg-blue-100 text-emerald-600 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 text-xs truncate group-hover:text-blue-700">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                        <span className="font-semibold text-slate-600">{item.city}</span>
                        <span>•</span>
                        <span className="text-slate-400">{item.category}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 self-center" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Destination Input with Autocomplete */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-600" /> Destination Location
              </label>
              <span className="text-[10px] text-slate-400">Target Endpoint</span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Type destination area or landmark (e.g. DHA Phase 5)"
                value={destInput}
                onChange={(e) => {
                  setDestInput(e.target.value);
                  setShowDestDropdown(true);
                }}
                onFocus={() => setShowDestDropdown(true)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg font-bold text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-xs"
              />
              {isFetchingDestAPI && (
                <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-2.5 top-3 text-slate-400" />
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showDestDropdown && destSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
                <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Suggested Destinations</span>
                  <span className="text-rose-600">{destSuggestions.length} found</span>
                </div>
                {destSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDestInput(`${item.name}, ${item.city}`);
                      setEndCoords(item.coords);
                      setShowDestDropdown(false);
                      if (startCoords) {
                        calculateRoute(startCoords, item.coords);
                      }
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-rose-50 flex items-start gap-2.5 transition-colors group"
                  >
                    <div className="p-1 rounded-md bg-slate-100 group-hover:bg-rose-100 text-rose-600 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 text-xs truncate group-hover:text-rose-700">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                        <span className="font-semibold text-slate-600">{item.city}</span>
                        <span>•</span>
                        <span className="text-slate-400">{item.category}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-rose-600 self-center" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Route Shortcuts */}
          <div className="md:col-span-2 flex flex-wrap gap-1.5 items-center pt-0.5">
            <span className="text-[10px] text-slate-500 font-bold">Popular Routes:</span>
            <button
              type="button"
              onClick={() => {
                setOriginInput('Liberty Market, Gulberg, Lahore');
                setDestInput('DHA Phase 5, Lahore Cantt, Lahore');
                const start = [31.5126, 74.3436] as [number, number];
                const end = [31.4673, 74.4089] as [number, number];
                setStartCoords(start);
                setEndCoords(end);
                calculateRoute(start, end);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-400 hover:text-blue-700 rounded-lg text-[10px] text-slate-700 font-bold transition-all"
            >
              Liberty → DHA 5 (Lahore)
            </button>
            <button
              type="button"
              onClick={() => {
                setOriginInput('Gulberg III, Main Boulevard, Lahore');
                setDestInput('Bahria Town, Sector C, Lahore');
                const start = [31.5102, 74.3587] as [number, number];
                const end = [31.3683, 74.1812] as [number, number];
                setStartCoords(start);
                setEndCoords(end);
                calculateRoute(start, end);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-400 hover:text-blue-700 rounded-lg text-[10px] text-slate-700 font-bold transition-all"
            >
              Gulberg → Bahria Town
            </button>
            <button
              type="button"
              onClick={() => {
                setOriginInput('F-6 Super Market, Islamabad');
                setDestInput('Saddar, The Mall Road, Rawalpindi');
                const start = [33.7297, 73.0746] as [number, number];
                const end = [33.5984, 73.0541] as [number, number];
                setStartCoords(start);
                setEndCoords(end);
                calculateRoute(start, end);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-400 hover:text-blue-700 rounded-lg text-[10px] text-slate-700 font-bold transition-all"
            >
              Islamabad → Rawalpindi
            </button>
            <button
              type="button"
              onClick={() => {
                setOriginInput('Clifton, Do Talwar & Boat Basin, Karachi');
                setDestInput('Gulshan-e-Iqbal, Nipa Chowrangi, Karachi');
                const start = [24.8138, 67.0299] as [number, number];
                const end = [24.9207, 67.0928] as [number, number];
                setStartCoords(start);
                setEndCoords(end);
                calculateRoute(start, end);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-400 hover:text-blue-700 rounded-lg text-[10px] text-slate-700 font-bold transition-all"
            >
              Clifton → Gulshan (Karachi)
            </button>
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-2 flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md disabled:opacity-60 text-xs"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {isLoading ? 'Calculating Precise Route...' : 'Find Distance & Set Trip KM'}
            </button>

            {/* LIVE START RIDE BUTTON */}
            {!isNavigating ? (
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => startRide('simulation')}
                  disabled={isLoading || !routeDistance}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-xs"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Ride (Live Navigation)</span>
                </button>
                <button
                  type="button"
                  onClick={() => startRide('real_gps')}
                  disabled={isLoading || !routeDistance}
                  title="Use Real Live Device GPS Movement"
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-1 text-[11px] transition-all disabled:opacity-50"
                >
                  <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Device GPS</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={stopNavigation}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md text-xs animate-pulse"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop Live Navigation</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Error Feedback */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {gpsError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* TRIP SUMMARY BANNER */}
      {routeDistance !== null && routeDistance > 0 && !isNavigating && (
        <div className="p-4 bg-gradient-to-r from-blue-50 via-emerald-50 to-emerald-100/50 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div>
            <div className="text-[10px] font-extrabold uppercase text-blue-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Route Calculated &amp; Synced to Range Estimator
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5 flex items-baseline gap-2">
              <span className="text-blue-700">{routeDistance} km</span>
              {durationText && <span className="text-xs font-bold text-slate-600">({durationText} estimated travel)</span>}
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Trip distance has been automatically sent to the <strong>EV Range &amp; Battery Estimator</strong>. Click <strong>"Start Ride"</strong> above to test live moving navigation!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => startRide('simulation')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Start Journey
            </button>
          </div>
        </div>
      )}

      {/* LIVE NAVIGATION ACTIVE HUD OVERLAY */}
      {isNavigating && (
        <div className="p-4 bg-slate-950 text-white border border-slate-800 rounded-2xl shadow-xl space-y-3">
          {/* Turn by turn Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                <Compass className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                  {navMode === 'simulation' ? 'LIVE SIMULATED JOURNEY' : 'REAL GPS TRACKING ACTIVE'}
                </span>
                <span className="text-sm font-bold text-white leading-tight block truncate max-w-xs sm:max-w-md">
                  {currentRoadName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {navMode === 'simulation' && (
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px]">
                  <button
                    onClick={() => {
                      setSimSpeedMultiplier(1);
                      if (simIntervalRef.current) startRide('simulation');
                    }}
                    className={`px-2 py-1 rounded font-bold transition-colors ${
                      simSpeedMultiplier === 1 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1x
                  </button>
                  <button
                    onClick={() => {
                      setSimSpeedMultiplier(3);
                      if (simIntervalRef.current) startRide('simulation');
                    }}
                    className={`px-2 py-1 rounded font-bold transition-colors ${
                      simSpeedMultiplier === 3 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    3x
                  </button>
                  <button
                    onClick={() => {
                      setSimSpeedMultiplier(6);
                      if (simIntervalRef.current) startRide('simulation');
                    }}
                    className={`px-2 py-1 rounded font-bold transition-colors ${
                      simSpeedMultiplier === 6 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    6x <FastForward className="w-3 h-3 inline" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={stopNavigation}
                className="p-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg transition-colors font-bold text-[11px] flex items-center gap-1"
              >
                <Square className="w-3.5 h-3.5 fill-white" /> Exit
              </button>
            </div>
          </div>

          {/* Telemetry Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                <Gauge className="w-3 h-3 text-blue-400" /> Current Speed
              </div>
              <div className="text-xl font-black text-white mt-0.5">
                {simSpeedKmh} <span className="text-[10px] font-normal text-slate-400">km/h</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                <Route className="w-3 h-3 text-emerald-400" /> Remaining Distance
              </div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">
                {remainingDistanceKm} <span className="text-[10px] font-normal text-slate-400">km</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> Estimated Time
              </div>
              <div className="text-xl font-black text-amber-400 mt-0.5">
                {remainingTimeMins} <span className="text-[10px] font-normal text-slate-400">mins</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" /> Battery Consumed
              </div>
              <div className="text-xl font-black text-cyan-400 mt-0.5">
                {routeDistance ? Math.round(((routeDistance - remainingDistanceKm) / routeDistance) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE LEAFLET / OPENSTREETMAP CONTAINER */}
      <div className="w-full h-80 rounded-2xl overflow-hidden border border-slate-300 relative bg-slate-100 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full rounded-2xl z-0" />

        {/* Live Rider Location Indicator Badge on Map Corner */}
        {isNavigating && currentRiderPos && (
          <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-slate-700 shadow-lg z-1000 flex items-center gap-2 text-[11px] font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Live Rider: Lat {currentRiderPos[0].toFixed(4)}, Lng {currentRiderPos[1].toFixed(4)}</span>
          </div>
        )}

        {/* Helper overlay if no route searched yet */}
        {!routeDistance && !startCoords && (
          <div className="absolute inset-0 bg-slate-900/15 backdrop-blur-[1px] flex items-center justify-center p-4 text-center pointer-events-none z-1000">
            <span className="bg-white/95 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md border border-slate-200 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-600" /> Enter start &amp; destination locations above to search route
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleMapsRouteCalculator;
