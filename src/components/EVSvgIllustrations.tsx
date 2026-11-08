import React from 'react';

/**
 * Animated SVG illustration representing a High-Performance EV Battery Cell (LFP / Graphene)
 */
export const AnimatedBatteryCellSvg: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="batGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="50%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
      <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Outer Shell */}
    <rect x="25" y="20" width="50" height="65" rx="8" stroke="currentColor" strokeWidth="3.5" className="text-slate-800 dark:text-slate-200" fill="none" />
    {/* Battery Cap */}
    <rect x="40" y="12" width="20" height="8" rx="3" fill="currentColor" className="text-emerald-500" />
    {/* Inner Charge Level */}
    <rect x="30" y="30" width="40" height="48" rx="4" fill="url(#batGlow)" opacity="0.85" filter="url(#glowFilter)">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
    </rect>
    {/* Lightning Bolt */}
    <path d="M53 36L41 52H51L47 68L59 52H49L53 36Z" fill="#FFFFFF" stroke="#065F46" strokeWidth="1">
      <animate attributeName="transform" type="scale" values="1;1.08;1" transform-origin="50 50" dur="1.8s" repeatCount="indefinite" />
    </path>
    {/* Energy Rings */}
    <circle cx="50" cy="52.5" r="30" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" fill="none" className="animate-spin-slow" />
  </svg>
);

/**
 * Animated SVG illustration representing a High-Torque BLDC Motor Hub
 */
export const AnimatedMotorHubSvg: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="motorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
    {/* Outer Motor Hub Shell */}
    <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="4" className="text-slate-800 dark:text-slate-200" fill="none" />
    <circle cx="50" cy="50" r="28" stroke="#3B82F6" strokeWidth="2.5" strokeDasharray="6 3" fill="none" className="animate-spin-slow" />
    {/* Stator Coils */}
    <circle cx="50" cy="50" r="16" fill="url(#motorGrad)" />
    <circle cx="50" cy="50" r="6" fill="#FFFFFF" />
    {/* Magnetic Field Rays */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
      <line
        key={deg}
        x1="50"
        y1="50"
        x2={50 + 26 * Math.cos((deg * Math.PI) / 180)}
        y2={50 + 26 * Math.sin((deg * Math.PI) / 180)}
        stroke="#60A5FA"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />
    ))}
  </svg>
);

/**
 * Animated SVG illustration representing Sunshine & Solar PV Charging
 */
export const AnimatedSolarPVSvg: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="solarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    {/* Sun Core */}
    <circle cx="50" cy="30" r="12" fill="url(#solarGrad)">
      <animate attributeName="r" values="11;13;11" dur="2.5s" repeatCount="indefinite" />
    </circle>
    {/* Sun Rays */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
      <line
        key={deg}
        x1={50 + 16 * Math.cos((deg * Math.PI) / 180)}
        y1={30 + 16 * Math.sin((deg * Math.PI) / 180)}
        x2={50 + 22 * Math.cos((deg * Math.PI) / 180)}
        y2={30 + 22 * Math.sin((deg * Math.PI) / 180)}
        stroke="#FBBF24"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    ))}
    {/* Solar PV Panel Grid */}
    <polygon points="20,60 80,60 88,85 12,85" stroke="#1E293B" strokeWidth="3" fill="#1E3A8A" opacity="0.9" />
    <line x1="50" y1="60" x2="50" y2="85" stroke="#60A5FA" strokeWidth="2" />
    <line x1="20" y1="72.5" x2="84" y2="72.5" stroke="#60A5FA" strokeWidth="2" />
  </svg>
);

/**
 * Animated Vector EV Scooter / Bike SVG for Card Image Fallbacks
 */
export const AnimatedEVBikeSvg: React.FC<{ className?: string; color?: string }> = ({ 
  className = "w-full h-36", 
  color = "#2563EB" 
}) => (
  <svg viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} />
        <stop offset="100%" stopColor="#1E1B4B" />
      </linearGradient>
      <filter id="wheelGlow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Ground Speed Lines */}
    <line x1="20" y1="125" x2="220" y2="125" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="12 8">
      <animate attributeName="stroke-dashoffset" values="0;-40" dur="1s" repeatCount="indefinite" />
    </line>

    {/* Front & Rear Wheels */}
    <g className="animate-spin-slow" transform-origin="55 95">
      <circle cx="55" cy="95" r="26" stroke="#1E293B" strokeWidth="5" fill="#F8FAFC" />
      <circle cx="55" cy="95" r="16" stroke="#0EA5E9" strokeWidth="2" strokeDasharray="6 3" />
      <circle cx="55" cy="95" r="6" fill="#1E293B" />
    </g>

    <g className="animate-spin-slow" transform-origin="185 95">
      <circle cx="185" cy="95" r="26" stroke="#1E293B" strokeWidth="5" fill="#F8FAFC" />
      <circle cx="185" cy="95" r="16" stroke="#0EA5E9" strokeWidth="2" strokeDasharray="6 3" />
      <circle cx="185" cy="95" r="6" fill="#1E293B" />
    </g>

    {/* EV Chassis & Fairing Frame */}
    <path
      d="M55 95 L90 55 L135 55 L165 75 L185 95 M135 55 L150 95 M90 55 L115 95"
      stroke="#334155"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Main Body Shell */}
    <path
      d="M75 55 C90 40, 140 40, 155 58 C165 70, 145 80, 115 80 Z"
      fill="url(#frameGrad)"
      stroke="#10B981"
      strokeWidth="1.5"
    />

    {/* Seat */}
    <path d="M100 45 Q125 42 145 52 L140 58 Q120 48 98 50 Z" fill="#0F172A" />

    {/* Handlebar & Headlight */}
    <path d="M165 75 L175 35 L160 33" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
    <circle cx="178" cy="35" r="5" fill="#38BDF8" filter="url(#wheelGlow)">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="1.2s" repeatCount="indefinite" />
    </circle>

    {/* EV Battery Compartment Badge */}
    <rect x="100" y="60" width="30" height="15" rx="3" fill="#10B981" opacity="0.9" />
    <path d="M117 63L111 71H116L113 77L121 69H116L117 63Z" fill="#FFFFFF" />

    {/* Brand Logo Text in SVG */}
    <text x="120" y="120" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="800" fontFamily="sans-serif">
      PakEV Smart Model
    </text>
  </svg>
);
