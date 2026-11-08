import { GuideArticle } from './batteryGuidesData';

export const MAINTENANCE_GUIDES: GuideArticle[] = [
  {
    id: 'complete-ebike-maintenance-guide',
    title: 'Complete E-Bike Maintenance Guide',
    category: 'maintenance',
    readTime: '7 min read',
    summary: 'A master maintenance schedule for Pakistani riders: daily checks, monthly inspections, and annual service routines to keep your electric bike running like new.',
    highlights: [
      'Zero engine oil or spark plug changes needed.',
      'Check tire pressure (32-36 PSI) weekly to prevent range loss.',
      'Inspect brake pads and caliper fluid levels every 2,000 km.',
      'Apply silicone grease on electrical couplers to prevent corrosion during rainy seasons.'
    ],
    sections: [
      {
        heading: 'Daily 2-Minute Pre-Ride Inspection',
        content: 'Before pulling out on Karachi or Lahore roads, conduct a rapid check: (1) Squeeze both brake levers to confirm firm hydraulic pressure, (2) Inspect tire air pressure by thumb pressure or gauge, (3) Check digital speedometer display for warning codes (Fault icon, brake lock, or throttle sensor errors).'
      },
      {
        heading: 'Monthly Preventative Checklist',
        bullets: [
          'Tighten axle nuts on both front wheel and rear BLDC hub motor (tighten to 85-95 Nm).',
          'Inspect suspension fork seals for oil leaks caused by pothole impacts.',
          'Clean battery compartment with a dry microfiber cloth (never wash with direct water hose).',
          'Inspect charger cooling fan for accumulated lint or dust build-up.'
        ]
      }
    ],
    quickTip: 'Keep a small can of WD-40 Specialist Contact Cleaner for electrical connectors, but NEVER spray WD-40 onto brake discs or pads.'
  },
  {
    id: 'how-to-maintain-electric-bike',
    title: 'How to Maintain an Electric Bike',
    category: 'maintenance',
    readTime: '5 min read',
    summary: 'Practical ownership rules for daily commuters: washing safely, parking in high heat, and preventing corrosion.',
    highlights: [
      'Never wash your e-bike with high-pressure water jets at petrol station car washes.',
      'Always park in covered shade; direct sunlight cooks the battery and fades LCD displays.',
      'Keep mechanical pivot points (kickstand, swingarm bushings) lightly lubricated.'
    ],
    sections: [
      {
        heading: 'Safe Washing Technique',
        content: 'Use two buckets: one with mild automotive car shampoo and one with clean water. Wipe down the fairing and body panels with a damp sponge. Clean around the handlebar controls and throttle using a wrung-out damp cloth. Avoid aiming running hose water directly behind the display or into the charging port.'
      }
    ]
  },
  {
    id: 'ebike-battery-maintenance',
    title: 'E-Bike Battery Maintenance',
    category: 'maintenance',
    readTime: '6 min read',
    summary: 'Essential procedures to maintain battery capacity, balance cells, and store batteries safely during vacations or extended downtime.',
    highlights: [
      'Store battery at 50% to 60% state of charge during long periods of disuse.',
      'Clean terminal contacts with isopropyl alcohol to prevent resistive heat.',
      'Check for loose terminal bolts on lead-acid packs every 3 months.'
    ],
    sections: [
      {
        heading: 'Storage Protocol for Vacations',
        content: 'If you are traveling for more than 2 weeks, do not leave the battery at 0% or 100%. Charge it to ~60% and turn off the main miniature circuit breaker (MCB) under the seat to eliminate parasitic standby draw from the alarm and digital cluster.'
      }
    ]
  },
  {
    id: 'ebike-motor-maintenance',
    title: 'E-Bike Motor Maintenance',
    category: 'maintenance',
    readTime: '5 min read',
    summary: 'Maintaining brushless DC (BLDC) hub motors: inspecting hall sensor cables, checking axle nuts, and bearing lubrication.',
    highlights: [
      'BLDC hub motors have no carbon brushes to replace.',
      'Keep the motor cable spring protector intact near the rear swingarm axle.',
      'Listen for rhythmic grinding noises indicating rear wheel bearing wear.'
    ],
    sections: [
      {
        heading: 'Water Protection and Hub Sealing',
        content: 'While hub motors are IP67 sealed, rubber O-rings degrade over 2 to 3 years in dusty environments. Avoid submerging the wheel hub past the centerline axle during monsoon street flooding.'
      }
    ]
  },
  {
    id: 'ebike-brake-maintenance',
    title: 'E-Bike Brake Maintenance',
    category: 'maintenance',
    readTime: '5 min read',
    summary: 'Electric bikes are heavier than petrol 70cc bikes and consume brake pads faster. How to replace pads and bleed DOT4 fluid.',
    highlights: [
      'Inspect ceramic or semi-metallic brake pad thickness every 2,000 km.',
      'Regenerative electronic braking reduces mechanical brake pad wear by up to 40%.',
      'Bleed hydraulic brake lines whenever lever travel feels spongy or soft.'
    ],
    sections: [
      {
        heading: 'Adjusting Brake Microswitch Sensors',
        content: 'Every e-bike brake lever has an electronic cutoff sensor that immediately disengages motor power when squeezed. If this sensor sticks, the motor will refuse to accelerate even when you twist the throttle.'
      }
    ]
  },
  {
    id: 'ebike-tyre-maintenance',
    title: 'E-Bike Tyre Maintenance',
    category: 'maintenance',
    readTime: '4 min read',
    summary: 'Tubeless tyre care, tread wear indicators, puncture prevention, and optimal PSI for Pakistani asphalt conditions.',
    highlights: [
      'Front tire: 30-32 PSI | Rear tire: 34-38 PSI (higher due to motor weight).',
      'Install liquid tire sealant (slime) in tubeless tires to auto-seal road thorns.',
      'Inspect for uneven tread wear caused by loose swingarm bushings.'
    ],
    sections: [
      {
        heading: 'Why E-Bike Tires Wear Faster on the Rear',
        content: 'The rear tire carries the weight of the BLDC hub motor (7-12 kg) plus the battery pack (35-45 kg on lead-acid models) and handles 100% of instant electric torque. Rotate or inspect rear tires twice as frequently as front tires.'
      }
    ]
  },
  {
    id: 'ebike-charger-problems',
    title: 'E-Bike Charger Problems & Diagnosis',
    category: 'maintenance',
    readTime: '6 min read',
    summary: 'Troubleshooting charger fan failure, red/green blinking indicator codes, melted charging plugs, and internal fuse replacement.',
    highlights: [
      'Charger fan stopped: Internal thermal cutoff will shut down charging after 10 minutes.',
      'Green light immediately when plugged in: Broken charging port pin, blown DC fuse, or disconnected battery wire.',
      'Melted 3-pin DC plug: Loose terminal fit causing excessive contact resistance and heat.'
    ],
    sections: [
      {
        heading: 'How to Replace the Internal Charger Fuse',
        content: 'Unplug the charger from wall and bike. Unscrew the 4 casing screws. Locate the ceramic cylindrical glass fuse (usually 10A 250V). Use a multimeter continuity test. If blown, replace with an identical amperage slow-blow fuse.'
      }
    ],
    quickTip: 'Never place the charger on a sofa, bed, or carpet while charging; always place it on a hard tile floor to ensure adequate fan ventilation.'
  },
  {
    id: 'ebike-battery-not-charging',
    title: 'E-Bike Battery Not Charging (Step-by-Step Fix)',
    category: 'maintenance',
    readTime: '6 min read',
    summary: 'What to do when plugging in the charger produces no reaction: checking the breaker (MCB), port pins, and BMS deep sleep.',
    highlights: [
      'Check the main MCB breaker under the seat (often trips during voltage surges).',
      'Inspect charging port socket pins for black burn marks or bent contacts.',
      'BMS Low Voltage Lockout: Over-discharged lithium batteries may need a manual wake-up pulse.'
    ],
    sections: [
      {
        heading: 'Step-by-Step Diagnostic Sequence',
        bullets: [
          'Step 1: Check the wall socket with another appliance (e.g. mobile charger) to verify 220V AC supply.',
          'Step 2: Flip the under-seat circuit breaker OFF and firmly ON.',
          'Step 3: Measure the charger output voltage with a multimeter before plugging into the bike.',
          'Step 4: Check if the battery pack has dropped below minimum threshold voltage.'
        ]
      }
    ]
  },
  {
    id: 'ebike-not-turning-on',
    title: 'E-Bike Not Turning On (No Display / Dead System)',
    category: 'maintenance',
    readTime: '5 min read',
    summary: 'Diagnosing a completely dead electric scooter: ignition switch, main fuse, converter, and battery connector issues.',
    highlights: [
      'The under-seat breaker (MCB) has tripped or failed internally.',
      'Main DC 12V converter has blown, cutting power to the digital cluster and lights.',
      'Ignition key switch wire disconnected behind the front headlight fairing.'
    ],
    sections: [
      {
        heading: 'Testing the 12V Step-Down Converter',
        content: 'EV bikes use high voltage (60V/72V) for the motor, but a small silver box called the DC-DC Converter drops this to 12V for your display, horn, indicators, and headlamps. If the main motor works but all lights/display are dead, replace the 12V converter (Rs. 1,200 - 1,800).'
      }
    ]
  },
  {
    id: 'ebike-motor-not-working',
    title: 'E-Bike Motor Not Working (Wheel Won’t Spin)',
    category: 'maintenance',
    readTime: '6 min read',
    summary: 'When display turns on but the motor does not respond: brake cut-off switch stuck, throttle failure, or hall sensor errors.',
    highlights: [
      'Brake lever cut-off switch stuck in active position (most common cause: 65% of cases).',
      'Throttle Hall sensor wire cut or detached inside handle grip.',
      'Motor phase wire burnt or disconnected inside controller junction box.'
    ],
    sections: [
      {
        heading: 'Quick Roadside Test: The Brake Switch Check',
        content: 'Check your rear brake light. If the brake light remains brightly illuminated without you touching the brake levers, one of the brake cut-off microswitches is stuck closed. Disconnect the 2-pin brake sensor wire under the lever; if the motor now spins, lubricate or replace the switch.'
      }
    ]
  },
  {
    id: 'ebike-range-suddenly-decreased',
    title: 'E-Bike Range Suddenly Decreased',
    category: 'maintenance',
    readTime: '5 min read',
    summary: 'Diagnosing unexpected 30% to 50% loss in kilometer range: binding brake calipers, tire pressure, cell imbalance, or controller drain.',
    highlights: [
      'Brake caliper dragging or rubbing against the disc rotor.',
      'Low tire pressure dropping range by 15-20 km.',
      'One dead cell block in lead-acid series dragging down the entire pack.',
      'High wind resistance and riding at maximum speed above 55 km/h.'
    ],
    sections: [
      {
        heading: 'The "Spin Test" for Dragging Brakes',
        content: 'Put the bike on its center stand so both wheels are suspended off the ground. Spin each wheel firmly by hand. Both wheels should spin freely for at least 3-4 rotations. If the wheel stops immediately with a scraping sound, adjust the brake caliper alignment bolts.'
      }
    ]
  },
  {
    id: 'ebike-battery-draining-quickly',
    title: 'E-Bike Battery Draining Quickly',
    category: 'maintenance',
    readTime: '5 min read',
    summary: 'Causes of rapid percentage drop: parasitic alarm drain, sulfation, cold/hot weather impact, and high acceleration habits.',
    highlights: [
      'Aftermarket GPS trackers or alarms wired directly to high voltage without sleep mode.',
      'Battery sulfation on lead-acid plates reducing usable Ah capacity.',
      'Riding continuously in Sports Mode (Gear 3) instead of Eco Mode (Gear 1).'
    ],
    sections: [
      {
        heading: 'Parasitic Standby Current Test',
        content: 'Disconnect one battery terminal and place a multimeter in series on DC Amperes. Standby current when key is off should be under 0.05A. If it reads 0.3A or higher, an alarm module or USB charger is draining the battery overnight.'
      }
    ]
  },
  {
    id: 'ebike-overheating-problems',
    title: 'E-Bike Overheating Problems',
    category: 'maintenance',
    readTime: '5 min read',
    summary: 'Preventing controller and motor heat shutdowns during 45°C Pakistani summers on long continuous runs.',
    highlights: [
      'Controller heat sink covered in mud or road grime behind the rear wheel.',
      'Riding with heavy pillion passenger on steep inclines at full throttle.',
      'Motor hub winding temperature exceeding 110°C triggers thermal protection.'
    ],
    sections: [
      {
        heading: 'Improving Controller Airflow',
        content: 'Most EV controllers are mounted beneath the footboard or rear seat. Ensure the cooling fins are not clogged with dried mud from rain. Never enclose the controller inside plastic bags or sealed foam.'
      }
    ]
  },
  {
    id: 'ebike-throttle-not-working',
    title: 'E-Bike Throttle Not Working',
    category: 'maintenance',
    readTime: '5 min read',
    summary: 'Diagnosing 3-wire Hall throttles: testing 5V reference, signal wire voltage (0.8V to 4.2V), and loose grip mechanics.',
    highlights: [
      'Red wire = 5V DC supply, Black = Ground, Green = Signal output (0.8V to 4.2V).',
      'Throttle spring broken: Grip fails to snap back to zero when released (safety hazard!).',
      'Water ingress inside throttle housing after heavy rain.'
    ],
    sections: [
      {
        heading: 'Multimeter Throttle Test',
        content: 'Probe between Black and Green wires while turning on the bike. Resting throttle should read ~0.8V to 1.0V. As you twist the grip smoothly, voltage should climb steadily to 4.0V - 4.2V. If voltage stays at 0V, replace the throttle grip (cost: Rs. 1,000 - 1,800).'
      }
    ]
  },
  {
    id: 'ebike-display-not-working',
    title: 'E-Bike Display Not Working (Speedometer & Odo Issues)',
    category: 'maintenance',
    readTime: '4 min read',
    summary: 'Fixing blank LCD screens, inaccurate speedometer readings, water fogging inside cluster, and error code diagnostics.',
    highlights: [
      'Water condensation inside screen: Dry using low heat hairdryer and reseal edge with silicone.',
      'Speed sensor line disconnected: Phase speed wire or hall sensor line loose.',
      'Inaccurate battery meter: Display voltage setting mismatched (e.g., 60V setting on 72V bike).'
    ],
    sections: [
      {
        heading: 'Error Code Reference Guide',
        bullets: [
          'Code 01 / E-01: Throttle sensor fault.',
          'Code 02 / E-02: Brake sensor locked / cut-off engaged.',
          'Code 03 / E-03: Motor hall sensor signal fault.',
          'Code 07 / E-07: Controller communication or phase wire error.'
        ]
      }
    ]
  },
  {
    id: 'ebike-controller-problems',
    title: 'E-Bike Controller Problems & MOSFET Diagnosis',
    category: 'maintenance',
    readTime: '6 min read',
    summary: 'The motor controller is the heart of your electric bike. Identifying blown MOSFETs, phase wire shorts, and voltage limit errors.',
    highlights: [
      'Wheel locked or difficult to push by hand: Blown MOSFET shorting motor phase wires.',
      'Burnt electrical smell from under seat after aggressive high-speed hill climbing.',
      'Upgrading controller: Always match motor wattage and voltage specifications.'
    ],
    sections: [
      {
        heading: 'The Quick MOSFET Resistance Test',
        content: 'Disconnect the controller from the motor. Try to spin the rear wheel. If the wheel was stiff before but now spins freely, your controller has blown internal MOSFET transistors that require replacement or a new controller (Rs. 4,500 - 9,000).'
      }
    ]
  },
  {
    id: 'ebike-wiring-problems',
    title: 'E-Bike Wiring Problems & Wire Loom Repairs',
    category: 'maintenance',
    readTime: '5 min read',
    summary: 'Locating melted connector plugs, loose earth grounds, rat damage, and proper soldering techniques for high-amp EV cables.',
    highlights: [
      'High-amperage phase wires must be tightened firmly inside junction boxes.',
      'Use thick heat-shrink tubing instead of cheap plastic electrical tape.',
      'Vibration and steering turns can fray wires near the front fork stem.'
    ],
    sections: [
      {
        heading: 'Repairing Melted Yellow Junction Boxes',
        content: 'Many stock e-bikes use plastic 3-terminal junction blocks for motor phase wires (Yellow, Green, Blue). Under sustained heavy loads, these melt. Upgrade to 60A high-temperature ceramic screw terminals or gold-plated XT90/Anderson connectors.'
      }
    ]
  },
  {
    id: 'ebike-brake-problems',
    title: 'E-Bike Brake Problems (Squealing, Soft Levers, Disc Rub)',
    category: 'maintenance',
    readTime: '5 min read',
    summary: 'Eliminating annoying brake squeals, repairing spongy brake levers, rotor alignment, and drum brake adjustments.',
    highlights: [
      'Squealing disc brakes: Caused by road oil contamination on brake pads.',
      'Spongy lever pulling all the way to grip: Air bubbles inside hydraulic fluid lines.',
      'Warped disc rotor causing rhythmic pulsing during stops.'
    ],
    sections: [
      {
        heading: 'How to Clean Contaminated Brake Pads',
        content: 'Remove brake pads. Clean with isopropyl alcohol or brake cleaner spray. Lightly sand the pad surface with 240-grit sandpaper on a flat surface to remove the glazed layer. Clean the rotor thoroughly before reinstalling.'
      }
    ]
  },
  {
    id: 'ebike-tyre-puncture-problems',
    title: 'E-Bike Tyre & Puncture Problems (Rear Hub Removal Guide)',
    category: 'maintenance',
    readTime: '6 min read',
    summary: 'How to safely patch rear punctures without cutting motor wiring, puncture sealants, and heavy-duty tubeless tire options.',
    highlights: [
      'Never allow roadside puncture wallahs to pull or stress the motor wire cable!',
      'Use tubeless tire plug strips (needle plugs) from the outside without removing wheel.',
      'Keep liquid tire sealant pre-installed in both tires for automatic self-healing.'
    ],
    sections: [
      {
        heading: 'Warning for Roadside Puncture Shops',
        content: 'Local roadside motorcycle repairmen are accustomed to removing petrol bike rear wheels with brute force. On an EV, the rear axle contains the main motor electrical wiring harness. Forcing or twisting the axle can shear internal motor wires. Always use an external tubeless needle plug instead of dismounting the tire whenever possible.'
      }
    ]
  },
  {
    id: 'ebike-service-repair-pakistan',
    title: 'E-Bike Service & Repair Guide in Pakistan',
    category: 'maintenance',
    readTime: '6 min read',
    summary: 'Where to find skilled EV mechanics in Karachi, Lahore, and Rawalpindi, labor charges, genuine parts sourcing, and DIY repair skills.',
    highlights: [
      'Authorized 3S Dealerships (Crown, Yadea, Evee, Metro) maintain original OEM spare parts.',
      'Independent EV specialists: Saddar/Akbar Road (Karachi), McLeod Road (Lahore), Committee Chowk (Rawalpindi).',
      'Average service charges: Routine checkup Rs. 800 - 1,500; Controller replacement labor Rs. 1,000 - 2,000.'
    ],
    sections: [
      {
        heading: 'Common Spare Parts Price Reference in Pakistan',
        bullets: [
          'Replacement 3-Wire Hall Throttle: Rs. 1,000 – Rs. 1,800.',
          '12V DC-DC Step Down Converter: Rs. 1,200 – Rs. 2,000.',
          'Hydraulic Disc Brake Caliper & Lever Set: Rs. 3,500 – Rs. 5,500.',
          'Standard 1500W Brushless Motor Controller: Rs. 5,000 – Rs. 9,500.',
          'Ceramic Disc Brake Pads (Pair): Rs. 600 – Rs. 1,200.'
        ]
      }
    ],
    quickTip: 'Always save your dealer helpline and verified EV workshop contact numbers in your phone before embarking on long commutes across city limits.'
  }
];
