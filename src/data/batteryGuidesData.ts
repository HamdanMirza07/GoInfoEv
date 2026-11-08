export interface GuideArticle {
  id: string;
  title: string;
  category: 'battery' | 'maintenance';
  readTime: string;
  summary: string;
  highlights: string[];
  sections: {
    heading: string;
    content?: string;
    bullets?: string[];
  }[];
  quickTip?: string;
  specsTable?: { label: string; value: string }[];
}

export const BATTERY_GUIDES: GuideArticle[] = [
  {
    id: 'battery-types-explained',
    title: 'E-Bike Battery Types Explained',
    category: 'battery',
    readTime: '6 min read',
    summary: 'A complete breakdown of the three primary battery chemistries used in electric bikes in Pakistan: Graphene Dry Gel, Lithium-ion (NMC), and Lithium Iron Phosphate (LiFePO4).',
    highlights: [
      'Graphene Lead-Acid: Budget-friendly, heavy (35-45 kg), 400-600 charge cycles.',
      'Lithium NMC: High energy density, lightweight (8-12 kg), 800-1,200 cycles.',
      'LiFePO4: Highest thermal safety for Pakistani summers, 2,000-3,000 cycles, 5-7 year life.'
    ],
    sections: [
      {
        heading: '1. Graphene Dry Gel Lead-Acid Batteries',
        content: 'Popular in mass-market Pakistani EV scooters like the Crown Raftaar and older Yadea models. Graphene is added to traditional lead plates to reduce internal resistance, improve charge acceptance, and resist sulfation.',
        bullets: [
          'Average pack weight: 35 kg to 42 kg (typically 5 or 6 units of 12V blocks wired in series).',
          'Typical lifespan: 1 to 1.5 years under heavy daily commuting.',
          'Advantages: Lowest upfront purchase cost, wide availability of local replacements, zero complex BMS dependencies.',
          'Disadvantages: Heavy weight reduces acceleration and hill climb, degrades rapidly in 40°C+ summer heat if left unventilated.'
        ]
      },
      {
        heading: '2. Ternary Lithium-Ion (NMC / Nickel Manganese Cobalt)',
        content: 'Used in modern performance scooters like the Evee Gen-Z and Yadea T9 lithium variants. NMC cells deliver compact size, punchy instant torque, and removable carry-to-home charging boxes.',
        bullets: [
          'Average pack weight: 9 kg to 14 kg (70% lighter than graphene).',
          'Typical lifespan: 3 to 4 years (800 to 1,200 full charge cycles).',
          'Advantages: Fast charging capability (2-3 hours), easy apartment charging with removable cases.',
          'Disadvantages: Higher cost (Rs. 95,000 - 130,000) and requires strict BMS temperature safeguards.'
        ]
      },
      {
        heading: '3. Lithium Iron Phosphate (LiFePO4 / LFP)',
        content: 'The undisputed gold standard for Pakistani climatic conditions. LiFePO4 cells do not experience thermal runaway even at 60°C ambient temperatures and offer the lowest lifetime cost per kilometer.',
        bullets: [
          'Lifespan: 2,000 to 3,500+ full cycles (5 to 8+ years of daily riding).',
          'Heat resistance: Safe operating range up to 65°C without risk of combustion.',
          'Cost per km: Just Rs. 0.35/km over its lifecycle compared to Rs. 1.20/km for lead-acid.'
        ]
      }
    ],
    quickTip: 'If your daily commute exceeds 40 km, investing in LiFePO4 saves up to Rs. 80,000 in replacement costs over a 4-year ownership window.',
    specsTable: [
      { label: 'Graphene Cycle Life', value: '400 - 600 cycles (~1.5 yrs)' },
      { label: 'Lithium NMC Cycle Life', value: '800 - 1,200 cycles (~3-4 yrs)' },
      { label: 'LiFePO4 Cycle Life', value: '2,000 - 3,000+ cycles (~6-8 yrs)' },
      { label: 'Recommended Choice', value: 'LiFePO4 for hot climates (Sindh/Punjab)' }
    ]
  },
  {
    id: 'lithium-vs-lead-acid',
    title: 'Lithium-Ion vs Lead Acid Battery',
    category: 'battery',
    readTime: '5 min read',
    summary: 'Direct head-to-head comparison of initial cost, weight, range efficiency, and long-term resale value between Lead-Acid/Graphene and Lithium packs.',
    highlights: [
      'Lead-acid costs 50% less upfront but needs replacement every 12 to 18 months.',
      'Lithium is 3x lighter, boosting top speed by 5 km/h and extending range by 15-20%.',
      'Lead-acid suffers from voltage sag (bike slows down after 50% battery depletion).'
    ],
    sections: [
      {
        heading: 'Voltage Sag & Usable Capacity (Peukert Effect)',
        content: 'Lead-acid batteries suffer from significant voltage drop under throttle load. When a lead-acid battery hits 50% charge, top speed drops from 55 km/h down to 38 km/h. In contrast, Lithium maintains a flat discharge curve, giving you 95% full speed until the last 10% reserve.'
      },
      {
        heading: 'Weight Impact on Bike Suspension & Tires',
        content: 'Carrying a 40 kg lead-acid battery puts constant strain on rear shock absorbers, rear wheel bearings, and tire tread. Switching to a 10 kg lithium pack improves bike handling, braking distance, and reduces rear tire punctures.'
      },
      {
        heading: 'Real Financial Cost Over 3 Years',
        bullets: [
          'Lead-acid: Initial pack Rs. 55,000 + 1st replacement Rs. 55,000 + 2nd replacement Rs. 55,000 = Rs. 165,000 total.',
          'Lithium LFP: Initial pack Rs. 125,000 + 0 replacements needed over 3 years = Rs. 125,000 total (Rs. 40,000 net savings!).'
        ]
      }
    ],
    quickTip: 'Never discharge a lead-acid battery below 20%—doing so causes permanent lead plate crystallization (sulfation).'
  },
  {
    id: 'lithium-ion-vs-lifepo4',
    title: 'Lithium-Ion (NMC) vs LiFePO4 Battery',
    category: 'battery',
    readTime: '5 min read',
    summary: 'Deep dive into chemistry differences between standard Ternary Lithium (NMC) and Lithium Iron Phosphate (LiFePO4) with specific attention to Pakistani summer heat.',
    highlights: [
      'LiFePO4 contains zero cobalt, eliminating thermal runaway and fire hazards.',
      'NMC is smaller and lighter per Ah, ideal for slim portable battery cases.',
      'LiFePO4 endures up to 3,000 cycles vs 1,000 cycles for NMC.'
    ],
    sections: [
      {
        heading: 'Thermal Stability in Pakistani Summers (40°C - 48°C)',
        content: 'In cities like Jacobabad, Lahore, Multan, and Karachi, asphalt surface temperatures routinely cross 55°C. NMC cells begin stressing at 45°C. LiFePO4 chemical bonds (P-O bond) are significantly stronger, tolerating internal temperatures up to 270°C without releasing oxygen or catching fire.'
      },
      {
        heading: 'Cell Voltage & Configuration',
        bullets: [
          'NMC nominal cell voltage: 3.7V (A 72V pack requires 20 series cells: 20S).',
          'LiFePO4 nominal cell voltage: 3.2V (A 72V pack requires 24 series cells: 24S).'
        ]
      }
    ],
    quickTip: 'When purchasing a custom lithium pack, ask the assembler for Grade-A EVE or CATL brand prismatic LiFePO4 cells with a Daly or JBD Smart Bluetooth BMS.'
  },
  {
    id: '48v-vs-60v-vs-72v',
    title: '48V vs 60V vs 72V E-Bike Battery',
    category: 'battery',
    readTime: '6 min read',
    summary: 'How system voltage dictates motor speed, hill climbing torque, electrical efficiency, and throttle responsiveness.',
    highlights: [
      '48V Systems: 35-45 km/h top speed, ideal for flat urban school/grocery commutes.',
      '60V Systems: 45-55 km/h, well-balanced for average Pakistani urban commuting.',
      '72V Systems: 60-75+ km/h, high torque for flyovers, passenger carrying, and steep hills.'
    ],
    sections: [
      {
        heading: 'Electrical Physics: Why Higher Voltage is More Efficient',
        content: 'Electric power equals Voltage multiplied by Current (Watts = V × I). To deliver 1500 Watts of power: A 48V system pulls ~31 Amperes through the wires, creating heavy heat. A 72V system only pulls ~21 Amperes. Less amperage means cooler wiring, less controller strain, and greater energy efficiency.'
      },
      {
        heading: 'Speed & Incline Comparison Table',
        bullets: [
          '48V: Speed 40 km/h | 10° Incline Climb | 4 units of 12V lead-acid or 13S/15S lithium.',
          '60V: Speed 50 km/h | 14° Incline Climb | 5 units of 12V lead-acid or 16S/19S lithium.',
          '72V: Speed 65+ km/h | 18°+ Incline Climb | 6 units of 12V lead-acid or 20S/24S lithium.'
        ]
      }
    ],
    quickTip: 'If you frequently ride with a pillion rider or travel over elevated bridges (e.g., Karachi flyovers or Lahore Canal underpasses), always choose a 72V powertrain.'
  },
  {
    id: '10ah-vs-20ah-vs-30ah',
    title: '10Ah vs 20Ah vs 30Ah Battery',
    category: 'battery',
    readTime: '4 min read',
    summary: 'Understanding Ampere-hour (Ah) capacity, how it translates to real-world kilometers on Pakistani roads, and choosing the right size.',
    highlights: [
      'Ah represents the "fuel tank size" of your battery.',
      '10Ah: 25-35 km real range (light errand bikes).',
      '20Ah: 55-70 km real range (standard daily office commute).',
      '30Ah+: 90-120 km real range (commercial delivery riders: Bykea, Foodpanda).'
    ],
    sections: [
      {
        heading: 'Real Distance Calculation Formula',
        content: 'Multiply your Voltage by Ah to find Watt-hours (Wh). On average, an electric bike consumes 28 to 35 Watt-hours per kilometer at 40 km/h speed.',
        bullets: [
          '72V 20Ah = 1,440 Wh ÷ 30 Wh/km = ~48 to 60 km real-world range.',
          '72V 30Ah = 2,160 Wh ÷ 30 Wh/km = ~72 to 90 km real-world range.',
          '72V 45Ah = 3,240 Wh ÷ 30 Wh/km = ~105 to 135 km commercial range.'
        ]
      }
    ],
    quickTip: 'Avoid oversized 45Ah lead-acid packs due to extreme dead-weight (over 55 kg). For capacities above 25Ah, always select Lithium.'
  },
  {
    id: 'battery-price-in-pakistan',
    title: 'E-Bike Battery Price in Pakistan',
    category: 'battery',
    readTime: '5 min read',
    summary: 'Updated 2025/2026 market prices for new and aftermarket replacement battery packs in Karachi, Lahore, Rawalpindi, and Faisalabad.',
    highlights: [
      'Graphene 72V 23Ah - 32Ah: Rs. 42,000 to Rs. 62,000.',
      'Lithium NMC 60V/72V 24Ah: Rs. 85,000 to Rs. 115,000.',
      'LiFePO4 Grade-A 72V 30Ah with Smart BMS: Rs. 130,000 to Rs. 165,000.'
    ],
    sections: [
      {
        heading: 'Current Market Price Tiers',
        bullets: [
          'Budget Tier (Chilwee / Tianneng Graphene Dry Gel): Rs. 8,500 – Rs. 11,500 per 12V block. A 72V setup requires 6 blocks (Rs. 51,000 to 65,000).',
          'Mid-Range Tier (NMC Chinese imported packs): Rs. 90,000 – Rs. 120,000 depending on casing and BMS brand.',
          'Premium Tier (Custom welded LiFePO4 prismatic cells): Rs. 135,000 – Rs. 175,000 with 3-year warranty.'
        ]
      },
      {
        heading: 'Old Battery Scrap / Exchange Value',
        content: 'Never discard old dead batteries! Local scrap dealers and battery shops offer Rs. 2,000 to Rs. 3,500 per lead-acid 12V block (Rs. 12,000 to Rs. 18,000 total deduction) when trading in for a new pack.'
      }
    ],
    quickTip: 'Always demand a stamped warranty card with serial numbers clearly written for every individual battery cell block.'
  },
  {
    id: 'battery-replacement-cost-in-pakistan',
    title: 'E-Bike Battery Replacement Cost in Pakistan',
    category: 'battery',
    readTime: '4 min read',
    summary: 'Hidden replacement labor, wiring upgrades, connector changes (Anderson plugs), and total bill breakdown when retrofitting an old electric bike.',
    highlights: [
      'Lead-to-Lead swap: Rs. 1,500 - 2,500 technician labor.',
      'Lead-to-Lithium conversion: Rs. 5,000 - 8,000 (includes high-amp wiring & new lithium charger).',
      'Old scrap trade-in reduces your net cash outlay by up to 25%.'
    ],
    sections: [
      {
        heading: 'Conversion Costs: Upgrading from Lead-Acid to Lithium',
        content: 'When replacing old lead-acid batteries with a lithium pack, you cannot reuse your lead charger! You must factor in: (1) A CC/CV Lithium Charger (Rs. 6,000 - 10,000), (2) 50A Anderson power connector (Rs. 1,000), and (3) Cushioning foam and battery bracket security (Rs. 1,500).'
      }
    ]
  },
  {
    id: 'how-long-does-battery-last',
    title: 'How Long Does an E-Bike Battery Last?',
    category: 'battery',
    readTime: '5 min read',
    summary: 'Calendar life vs cycle life, real-world Pakistani commuting expectations, and warning signs of impending battery failure.',
    highlights: [
      'Graphene Lead-Acid: 12 to 18 months (10,000 - 15,000 km).',
      'Lithium NMC: 3 to 4 years (30,000 - 45,000 km).',
      'LiFePO4: 6 to 8+ years (70,000 - 100,000+ km).'
    ],
    sections: [
      {
        heading: 'Understanding "Cycle Life"',
        content: 'One full cycle equals 100% of the battery capacity discharged and recharged. If you use 50% battery on Monday, recharge, and use 50% on Tuesday, that counts as only ONE cycle. Charging frequently does not damage modern lithium batteries!'
      }
    ]
  },
  {
    id: 'how-to-increase-battery-life',
    title: 'How to Increase E-Bike Battery Life',
    category: 'battery',
    readTime: '6 min read',
    summary: '10 proven practices to double your battery lifespan and prevent premature capacity degradation in high-temperature environments.',
    highlights: [
      'Never charge immediately after a long ride; wait 30 minutes for the cells to cool.',
      'Maintain 20% to 85% charge for daily use to reduce cell internal stress.',
      'Avoid full-throttle jackrabbit starts from red lights; roll on throttle smoothly.'
    ],
    sections: [
      {
        heading: '1. The 30-Minute Post-Ride Cool-Down Rule',
        content: 'Riding at high speeds causes internal cell heating. Connecting a high-amperage fast charger to hot battery cells accelerates electrolyte breakdown. Always park in the shade and allow 20 to 30 minutes before plugging in.'
      },
      {
        heading: '2. Tire Pressure Maintenance',
        content: 'Low tire pressure increases rolling resistance by up to 25%, forcing the battery to pump significantly higher continuous current. Keep tires at 32-36 PSI.'
      }
    ]
  },
  {
    id: 'how-to-properly-charge-battery',
    title: 'How to Properly Charge an E-Bike Battery',
    category: 'battery',
    readTime: '5 min read',
    summary: 'Step-by-step charging procedure: plug-in sequence, voltage checks, extension cord safety, and avoiding socket sparks.',
    highlights: [
      'Always connect the charger plug to the bike FIRST, then connect to the wall 220V socket.',
      'Use a dedicated 16A wall outlet with proper earthing/grounding.',
      'Disconnect within 1 hour after the charger light turns green.'
    ],
    sections: [
      {
        heading: 'Correct Plug-in Sequence (Prevents Connector Sparks)',
        content: 'Step 1: Insert the 3-pin DC plug firmly into the bike or battery port. Step 2: Plug the AC wall plug into the household 220V switch. Step 3: Turn on the wall switch. Reversing this sequence causes a sharp inrush arc spark that damages the charging pins over time.'
      }
    ]
  },
  {
    id: 'ebike-battery-charging-time',
    title: 'E-Bike Battery Charging Time',
    category: 'battery',
    readTime: '4 min read',
    summary: 'Charging time calculations for 3A, 5A, and 10A chargers across 20Ah, 30Ah, and 45Ah battery sizes.',
    highlights: [
      'Standard Lead-Acid: 6 to 8 hours (slow constant current phase).',
      'Lithium with 5A Charger: 3.5 to 5 hours.',
      'Lithium Fast Charger (10A): 2 to 2.5 hours.'
    ],
    sections: [
      {
        heading: 'Calculating Exact Charging Hours',
        content: 'Formula: (Battery Ah ÷ Charger Amp rating) × 1.15 (efficiency factor). Example: A 72V 30Ah pack using a 5A charger = (30 ÷ 5) × 1.15 = ~6.9 hours from 0% to 100%.'
      }
    ]
  },
  {
    id: 'ebike-battery-charging-cost',
    title: 'E-Bike Battery Charging Cost',
    category: 'battery',
    readTime: '5 min read',
    summary: 'Exact electricity bill calculation using K-Electric, LESCO, and IESCO tariff slabs, including off-peak vs on-peak rates.',
    highlights: [
      '72V 30Ah full charge consumes ~2.2 to 2.4 electricity units (kWh).',
      'Average cost per charge: Rs. 70 to Rs. 130 depending on WAPDA tariff slab.',
      'Cost per kilometer: Rs. 1.10 to Rs. 1.60 (compared to Rs. 6.50/km on petrol 70cc!).'
    ],
    sections: [
      {
        heading: 'Detailed Monthly Expense Breakdown',
        content: 'A daily commuter traveling 50 km charges every day (30 charges/month). Total units consumed: 30 × 2.3 kWh = 69 units. At Rs. 40/unit average, monthly electricity bill equals only Rs. 2,760, compared to Rs. 14,000+ for petrol.'
      }
    ]
  },
  {
    id: 'how-to-check-battery-health',
    title: 'How to Check E-Bike Battery Health (SOH)',
    category: 'battery',
    readTime: '5 min read',
    summary: 'Testing your battery using a digital multimeter, measuring individual cell voltage drift, and smart BMS Bluetooth apps.',
    highlights: [
      'Resting Voltage: 72V lead-acid should read ~80.4V to 81.6V fully charged.',
      'A healthy 72V lithium pack should read 83.5V to 84V right off the charger.',
      'If voltage drops by more than 10V immediately when twisting the throttle, a dead cell is present.'
    ],
    sections: [
      {
        heading: 'DIY Digital Multimeter Test',
        content: 'Set multimeter to DC Voltage (200V scale). Measure the battery terminal after full charge. For lead-acid: test each 12V block individually. If five blocks read 13.2V and one block reads 11.5V, that single failed block is dragging down the entire bike.'
      }
    ]
  },
  {
    id: 'common-ebike-battery-problems',
    title: 'Common E-Bike Battery Problems',
    category: 'battery',
    readTime: '6 min read',
    summary: 'Diagnosing swollen battery cases, sudden power cutoffs under load, slow charging, and unbalanced cell series.',
    highlights: [
      'Swollen/Bulged lead-acid casing: Caused by overcharging in hot weather; replace immediately.',
      'BMS Cutoff on flyovers: Battery cell voltage dips below Low Voltage Cutoff (LVC) under heavy amp draw.',
      'Charger fan running continuously without turning green: Thermal runaway or weak internal cell.'
    ],
    sections: [
      {
        heading: 'Symptom: Power cuts off completely when climbing or accelerating',
        content: 'Cause: One weak cell block inside the pack has high internal resistance. Under high amperage demand, its voltage drops below 2.8V (for lithium) or 10.5V (for lead-acid), triggering the BMS or controller safety cutoff.'
      }
    ]
  },
  {
    id: 'ebike-battery-warranty-guide',
    title: 'E-Bike Battery Warranty Guide',
    category: 'battery',
    readTime: '5 min read',
    summary: 'What Pakistani manufacturers actually cover: warranty claims, replacement terms, pro-rata clauses, and void conditions.',
    highlights: [
      'Graphene warranties typically range from 6 months to 1 year.',
      'Lithium warranties range from 2 to 3 years from reputable 3S dealers.',
      'Water ingress from pressure washing or physical case cracking voids warranty.'
    ],
    sections: [
      {
        heading: 'Checklist Before Filing a Warranty Claim',
        bullets: [
          'Ensure the dealer inspection stamp and purchase date match your invoice.',
          'Do not cut or splice original battery harness wires or bypass the fuse.',
          'Use only the company-supplied charger; third-party chargers void battery warranties.'
        ]
      }
    ]
  }
];
