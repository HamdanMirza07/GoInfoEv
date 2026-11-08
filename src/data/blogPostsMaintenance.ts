import { BlogPost } from '../components/BlogsPage';

export const BLOG_POSTS_MAINTENANCE: BlogPost[] = [
  {
    id: 'complete-ebike-maintenance-guide',
    title: 'Complete E-Bike Maintenance Guide: Weekly, Monthly & Yearly Checklist',
    excerpt: 'The ultimate maintenance schedule for electric scooter and bike owners in Pakistan: prevent breakdowns, protect electronics, and reduce repair bills.',
    category: '🔧 Maintenance & Repairs',
    readTime: '8 min read',
    date: 'March 2026',
    author: 'Hamdan Mirza (EV Master Technician)',
    relatedTool: 'content',
    relatedToolLabel: 'Open Maintenance Checklist',
    featured: true,
    content: {
      introduction: 'While electric two-wheelers have 70% fewer moving parts than internal combustion petrol bikes (no spark plugs, carburetors, clutch plates, or engine oils), they have specialized electrical harnesses, high-torque BLDC hub motors, and electronic controllers that require disciplined preventive maintenance.',
      sections: [
        {
          heading: '1. Daily & Weekly Pre-Ride Walkaround (2 Minutes)',
          body: [
            'Tire Pressure: Check front (32 PSI) and rear (36 PSI) using an accurate pocket gauge. Low tire pressure is the number one cause of sudden range loss.',
            'Brake Lever Micro-Switch Cutoff: Pull each brake lever slightly while resting on the center stand; verify that the motor cuts off instantly before the physical brake pads clamp the rotor.',
            'Hub Motor Cable Inspection: Check the thick cable entering the rear wheel axle for twists, fraying, or rubbing against the suspension arm.'
          ]
        },
        {
          heading: '2. Monthly Electrical & Chassis Servicing',
          body: [
            'Dielectric Silicone Spray: Spray electrical connectors behind the headlamp and under the seat to displace moisture and prevent green copper oxidation.',
            'Brake Fluid & Rotor Thickness: Inspect hydraulic fluid sight glass on handlebars; ensure fluid is light amber, not dark sludge.',
            'Suspension Bushings & Pivot Bolts: Torque rear shock bolts and front fork pinch bolts to prevent loose clunking noises over potholes.'
          ],
          table: {
            headers: ['Maintenance Interval', 'Checkpoints', 'Tools Needed', 'Estimated Time'],
            rows: [
              ['Weekly', 'Tire pressure, brake lever cutoffs, lights', 'Tire gauge, clean cloth', '5 Minutes'],
              ['Monthly', 'Brake pad wear, battery connector clean, bolt torque', 'Hex keys, contact cleaner', '20 Minutes'],
              ['Every 6 Months', 'Steering stem bearings, brake fluid flush, throttle check', 'Multimeter, DOT4 fluid', '45 Minutes'],
              ['Annual', 'Full wiring harness inspection, controller heat sink clean', 'Workshop service', '1.5 Hours']
            ]
          }
        }
      ],
      takeaways: [
        'Preventive maintenance costs virtually nothing and prevents expensive controller and battery burnouts.',
        'Never wash your bike with high-pressure water nozzles near the handlebar meter or under-seat electronics.'
      ]
    }
  },
  {
    id: 'how-to-maintain-electric-bike',
    title: 'How to Maintain an Electric Bike in Pakistani Dusty & Hot Weather',
    excerpt: 'Protecting your EV from dust storms, road debris, speed-breaker scrapes, and intense ultraviolet sun rays.',
    category: '🔧 Maintenance & Repairs',
    readTime: '6 min read',
    date: 'March 2026',
    author: 'Hamdan Mirza (EV Master Technician)',
    relatedTool: 'content',
    relatedToolLabel: 'View Cleaning Guidelines',
    content: {
      introduction: 'Dust and extreme heat in cities like Faisalabad, Lahore, and Karachi create unique challenges for electric vehicles. Fine silty dust penetrates unsealed connectors and clogs controller heat sinks, while direct sun exposure degrades dashboard LCD screens.',
      sections: [
        {
          heading: '1. Safe Washing and Cleaning Protocol',
          body: [
            'Use the Two-Bucket Method with automotive shampoo and soft microfiber cloths.',
            'Never direct garden hoses or commercial pressure washers at the charging flap, key cylinder, throttle assembly, or motor axle.',
            'Dry immediately with a blower or towel; water pooling inside the rear drum brake or connector boots causes corrosion.'
          ]
        }
      ],
      takeaways: [
        'Cover your dashboard meter with a sun shade when parked outdoors during summer.',
        'Blow out controller cooling fins every quarter to ensure optimal heat dissipation.'
      ]
    }
  },
  {
    id: 'ebike-battery-maintenance',
    title: 'E-Bike Battery Maintenance: How to Keep Cells Balanced and Healthy',
    excerpt: 'Practical cell balancing, storage techniques during vacations, terminal cleaning, and temperature management.',
    category: '🔧 Maintenance & Repairs',
    readTime: '6 min read',
    date: 'February 2026',
    author: 'Hamdan Mirza (EV Master Technician)',
    relatedTool: 'battery',
    relatedToolLabel: 'Open Battery Health Tracker',
    content: {
      introduction: 'Your battery pack is the single most valuable component of your vehicle, representing 40% to 55% of the total bike cost. Proactive maintenance ensures you extract maximum lifespan from every cell.',
      sections: [
        {
          heading: '1. Long-Term Storage Procedure (Over 2 Weeks)',
          body: [
            'Never store your electric bike with a completely empty (0%) or 100% full battery.',
            'Charge to approximately 55% to 65% State of Charge (SOC) before storing.',
            'Turn the main MCB circuit breaker under the seat to OFF to cut parasitic drain from the alarm and digital meter.',
            'Top up for 45 minutes every 30 days to replenish natural self-discharge.'
          ]
        }
      ],
      takeaways: [
        'Disconnect the under-seat circuit breaker whenever leaving the bike parked for over a week.',
        'Keep battery terminals greased with petroleum jelly to prevent corrosion.'
      ]
    }
  },
  {
    id: 'ebike-motor-maintenance',
    title: 'E-Bike Motor Maintenance: BLDC Hub Motor Care & Bearing Protection',
    excerpt: 'Preventing water ingress, protecting axle wiring, inspecting Hall effect sensors, and lubricating wheel bearings.',
    category: '🔧 Maintenance & Repairs',
    readTime: '5 min read',
    date: 'February 2026',
    author: 'Hamdan Mirza (EV Master Technician)',
    relatedTool: 'content',
    relatedToolLabel: 'Motor Diagnostics Guide',
    content: {
      introduction: 'Brushless DC (BLDC) hub motors require very little ongoing work because there are no carbon brushes to replace. However, physical axle damage and water penetration are primary causes of motor failures.',
      sections: [
        {
          heading: '1. Protecting the Motor Axle Wire Loom',
          body: [
            'The motor power phase wires (thick Blue, Green, Yellow) and 5 Hall sensor signal wires exit through the center of the rear axle.',
            'Always inspect the spiral protective steel spring or rubber sleeve covering this wire exit.',
            'Ensure the axle torque washers are correctly seated in the swingarm dropouts so the axle cannot spin and shear the wiring harness.'
          ]
        }
      ],
      takeaways: [
        'Never hit the motor axle with a metal hammer when removing the rear wheel; use a brass drift or rubber mallet.',
        'Replace rubber side-cover oil seals if riding frequently through flooded monsoon puddles.'
      ]
    }
  },
  {
    id: 'ebike-brake-maintenance',
    title: 'E-Bike Brake Maintenance: Regenerative Braking & Pad Replacement',
    excerpt: 'Mastering regenerative braking, diagnosing spongy hydraulic levers, cleaning squealing rotors, and bleeding brake lines.',
    category: '🔧 Maintenance & Repairs',
    readTime: '6 min read',
    date: 'January 2026',
    author: 'Hamdan Mirza (EV Master Technician)',
    relatedTool: 'content',
    relatedToolLabel: 'Brake Troubleshooting',
    content: {
      introduction: 'Electric scooters are heavier than petrol 70cc bikes due to battery mass, putting higher thermal demands on front and rear brakes. Fortunately, electronic regenerative braking can absorb up to 40% of stopping friction.',
      sections: [
        {
          heading: '1. Inspecting Brake Pad Thickness',
          body: [
            'Look through the caliper inspection slot with a flashlight. Friction material should be at least 1.5 mm thick.',
            'If backing plate metal contacts the disc rotor, you will hear a harsh scraping noise and damage the rotor surface.',
            'Replacement ceramic or semi-metallic brake pads for common Pakistani EV calipers (Evee, Yadea, Metro) cost Rs 450 to Rs 900 per pair.'
          ]
        }
      ],
      takeaways: [
        'Electronic regenerative braking extends physical brake pad life by up to 300%.',
        'Clean disc rotors with isopropyl alcohol or dedicated brake cleaner, never WD-40.'
      ]
    }
  },
  {
    id: 'ebike-tyre-maintenance',
    title: 'E-Bike Tyre Maintenance: Pressure, Tread Wear & Puncture Prevention',
    excerpt: 'Recommended PSI for Pakistani roads, choosing tubeless puncture sealant gel, and extending rear tire life under motor torque.',
    category: '🔧 Maintenance & Repairs',
    readTime: '5 min read',
    date: 'March 2026',
    author: 'Hamdan Mirza (EV Master Technician)',
    relatedTool: 'range',
    relatedToolLabel: 'Check Tire Range Impact',
    content: {
      introduction: 'Instant motor torque delivered from zero RPM accelerates rear tire tread wear. Maintaining correct air pressure is the single most effective way to maximize travel range.',
      sections: [
        {
          heading: '1. The Golden Pressure Standard',
          body: [
            'Front Tire: 30 to 32 PSI (ensures supple steering without feeling harsh over cobblestones).',
            'Rear Tire: 34 to 36 PSI for solo riders, 38 PSI with pillion passenger (supports heavy battery and hub motor weight).',
            'Running at 22 PSI reduces your battery range by 8 to 15 km per charge due to increased rolling resistance.'
          ]
        }
      ],
      takeaways: [
        'Check tire pressure once every week when tires are cold.',
        'Install 250ml of anti-puncture tire sealant gel into both tubeless tires for peace of mind.'
      ]
    }
  },
  {
    id: 'ebike-charger-problems',
    title: 'E-Bike Charger Problems: Fan Failure, Red Light Blinking & Repairs',
    excerpt: 'Diagnosing noisy cooling fans, blown internal fuses, overheated transformer coils, and replacement specs.',
    category: '🔧 Maintenance & Repairs',
    readTime: '5 min read',
    date: 'February 2026',
    author: 'Hamdan Mirza (EV Master Technician)',
    relatedTool: 'charging',
    relatedToolLabel: 'Open Charging Calculator',
    content: {
      introduction: 'The AC-DC smart charger works hard during every charge session, converting 220V household alternating current into regulated high-voltage direct current (67V to 84V).',
      sections: [
        {
          heading: '1. Common Charger Faults & Fixes',
          body: [
            'Fault: Charger light stays Solid Green when plugged into bike. Fix: Bike MCB circuit breaker is off, or charger output DC fuse has blown.',
            'Fault: High-pitched screeching or fan not spinning. Fix: Cooling fan bearings are choked with room dust. Clean immediately or the internal MOSFETs will overheat and fail within 20 minutes.',
            'Fault: Charger smells like burnt plastic. Fix: Disconnect immediately; the high-voltage input capacitor or bridge rectifier has shorted.'
          ]
        }
      ],
      takeaways: [
        'Never cover the charger with a cloth or place it on soft carpet during operation.',
        'Replace noisy 12V charger fans promptly (costs only Rs 250 to Rs 400 at electronic shops).'
      ]
    }
  },
  {
    id: 'ebike-battery-not-charging',
    title: 'E-Bike Battery Not Charging: Step-by-Step Diagnostic Tree',
    excerpt: 'What to do when your electric bike refuses to take charge: check circuit breakers, socket continuity, BMS lockouts, and port wiring.',
    category: '🔧 Maintenance & Repairs',
    readTime: '6 min read',
    date: 'March 2026',
    author: 'Hamdan Mirza (EV Master Technician)',
    relatedTool: 'battery',
    relatedToolLabel: 'Run Diagnostic Checklist',
    content: {
      introduction: 'You plug in your charger, but nothing happens: no fan sound, no red charging light. Follow this diagnostic flow before paying a technician.',
      sections: [
        {
          heading: '1. The 4-Step Triage Checklist',
          body: [
            'Step 1: Verify the Main Breaker. Check under the seat; ensure the 40A/63A miniature circuit breaker (MCB) has not tripped.',
            'Step 2: Wall Socket Test. Plug a lamp or phone charger into the wall outlet to confirm AC electricity is present.',
            'Step 3: Inspect Port Pins. Look inside the 3-pin receptacle on your bike; verify no pins are bent, burned, or pushed inwards.',
            'Step 4: Smart BMS Sleep Reset. If a lithium pack was drained to 0%, the BMS enters deep protection sleep. Connect a dedicated "wake-up" charger for 10 minutes.'
          ]
        }
      ],
      takeaways: [
        'Over 60% of "not charging" complaints are solved simply by resetting a tripped under-seat breaker.',
        'Never bridge a blown fuse with bare copper wire; always install the correct rated fuse.'
      ]
    }
  },
  {
    id: 'ebike-not-turning-on',
    title: 'E-Bike Not Turning On (Completely Dead): Causes & Fixes',
    excerpt: 'Key switch turns on, but digital speedometer, horn, and lights remain dead. How to trace the 12V converter and main power line.',
    category: '🔧 Maintenance & Repairs',
    readTime: '5 min read',
    date: 'February 2026',
    author: 'Hamdan Mirza (EV Master Technician)',
    relatedTool: 'content',
    relatedToolLabel: 'Trace Electrical Issues',
    content: {
      introduction: 'A totally dead vehicle is usually caused by an interruption in the main power feed or a blown secondary 12V DC-DC converter.',
      sections: [
        {
          heading: '1. Diagnostic Steps for Total Power Loss',
          body: [
            'Check the Battery Main Fuse: Usually a 40A blade fuse located inside an inline waterproof rubber capsule near the battery positive terminal.',
            'Check the Ignition Key Switch Wire: Wiggle the wire bundle below the handlebar head tube; vibration can pull loose the ignition switch connector.',
            'Check the DC-DC Step-Down Converter: Electric bikes use a metal box to convert 72V down to 12V for lights, horns, and dashboard. If the converter fails, 12V systems will be dead even if the motor is capable of running.'
          ]
        }
      ],
      takeaways: [
        'Keep a spare 40A automotive fuse under your seat at all times.',
        'A failed 12V converter is cheap to replace (Rs 1,200 to Rs 1,800).'
      ]
    }
  },
  {
    id: 'ebike-motor-not-working',
    title: 'E-Bike Motor Not Working (Wheel Won’t Spin): Hall Sensor & Brake Cutoff',
    excerpt: 'Display powers on, lights and horn work, but twisting the throttle produces zero motor movement.',
    category: '🔧 Maintenance & Repairs',
    readTime: '6 min read',
    date: 'March 2026',
    author: 'Hamdan Mirza (EV Master Technician)',
    relatedTool: 'content',
    relatedToolLabel: 'Motor Diagnostics Guide',
    content: {
      introduction: 'If your meter illuminates and the horn sounds clearly, your main battery and 12V converter are working properly. The fault lies in the motor drive circuit: brake safety cutoffs, throttle sensor, or controller.',
      sections: [
        {
          heading: '1. The Stuck Brake Cutoff Switch (65% of All Cases)',
          body: [
            'Every electric bike has a micro-switch inside both brake levers that automatically cuts motor power the instant you touch the brake.',
            'If road dirt or a sticky return spring causes the brake lever to stay depressed by even 1 millimeter, the safety circuit keeps the motor disabled.',
            'Test: Push both brake levers firmly forward with your fingers. If the bike now runs, lubricate the brake lever pivot pin with WD-40 or silicone lube.'
          ]
        }
      ],
      takeaways: [
        'Always push brake levers outward to confirm micro-switches have released.',
        'Inspect the throttle 3-wire plug (Red/Black/Green) for loose pin connections.'
      ]
    }
  },
  {
    id: 'ebike-range-suddenly-decreased',
    title: 'E-Bike Range Suddenly Decreased: 7 Reasons & Quick Fixes',
    excerpt: 'Your bike previously achieved 70 km, but now barely reaches 40 km. How to locate dragging brakes, tire pressure drops, and weak cells.',
    category: '🔧 Maintenance & Repairs',
    readTime: '6 min read',
    date: 'March 2026',
    author: 'Hamdan Mirza (EV Master Technician)',
    relatedTool: 'range',
    relatedToolLabel: 'Calculate Real Range',
    content: {
      introduction: 'Sudden loss of driving range is alarming, but in most cases, the issue is mechanical drag rather than a ruined battery pack.',
      sections: [
        {
          heading: '1. The Free Spin Wheel Test',
          body: [
            'Put the scooter on its center stand. Spin the front wheel by hand; it should rotate freely for 10 to 15 seconds.',
            'If the wheel stops immediately with a rubbing noise, the disc brake caliper is misaligned or pistons are jammed with grit.',
            'A dragging brake caliper consumes up to 30% of your total battery energy as friction heat!'
          ]
        }
      ],
      takeaways: [
        'Perform the spin test monthly to eliminate parasitic brake drag.',
        'One single dying battery block in a 6-block pack will drag down the range of the entire set.'
      ]
    }
  },
  {
    id: 'ebike-battery-draining-quickly',
    title: 'E-Bike Battery Draining Quickly: Parasitic Drain & GPS Trackers',
    excerpt: 'Why your battery level drops overnight while parked in the porch: finding hidden electrical leaks and anti-theft draw.',
    category: '🔧 Maintenance & Repairs',
    readTime: '5 min read',
    date: 'February 2026',
    author: 'Hamdan Mirza (EV Master Technician)',
    relatedTool: 'battery',
    relatedToolLabel: 'Diagnose Battery Drain',
    content: {
      introduction: 'If you park your bike in the evening at 80% charge and find it at 60% the next morning, your system is suffering from parasitic standby drain.',
      sections: [
        {
          heading: '1. Common Causes of Overnight Discharge',
          body: [
            'Aftermarket GPS Trackers: Cheap 2G trackers with internal backup batteries draw continuous current. Ensure tracker sleep mode is configured.',
            'Remote Keyless Alarm Module: High-sensitivity RF receivers stay active 24/7.',
            'DC-DC Converter Internal Leak: A faulty converter that remains energized even when the key switch is OFF.'
          ]
        }
      ],
      takeaways: [
        'Flip the main seat breaker OFF if storing the vehicle for several days.',
        'Measure standby drain with a multimeter in series: it should read below 20 milliamps.'
      ]
    }
  },
  {
    id: 'ebike-overheating-problems',
    title: 'E-Bike Overheating Problems: Controller & Motor Heat in Summer',
    excerpt: 'Why controllers enter thermal throttling on long bridge climbs, and how to improve airflow and heat-sink paste.',
    category: '🔧 Maintenance & Repairs',
    readTime: '5 min read',
    date: 'March 2026',
    author: 'Hamdan Mirza (EV Master Technician)',
    relatedTool: 'content',
    relatedToolLabel: 'Thermal Troubleshooting',
    content: {
      introduction: 'During peak Pakistani summer months (May through July), tarmac temperatures exceed 55°C. High current draw during prolonged climbs can cause motor controllers to overheat.',
      sections: [
        {
          heading: '1. Signs of Thermal Overheating',
          body: [
            'Motor loses 40% of its torque suddenly after 15 minutes of continuous full-throttle riding.',
            'The digital meter flashes an over-temp warning icon or Error 07.',
            'The aluminum controller housing feels burning hot to the touch (above 75°C).'
          ]
        }
      ],
      takeaways: [
        'Allow 15 minutes of shade rest if the controller enters thermal protection.',
        'Ensure the controller aluminum heat sink is exposed to natural riding airflow under the floorboard.'
      ]
    }
  },
  {
    id: 'ebike-throttle-not-working',
    title: 'E-Bike Throttle Not Working: Testing 3-Wire Hall Effect Sensors',
    excerpt: 'DIY testing of twist grips using a multimeter: signal voltage tests (0.8V to 4.2V) and wire replacement.',
    category: '🔧 Maintenance & Repairs',
    readTime: '5 min read',
    date: 'February 2026',
    author: 'Hamdan Mirza (EV Master Technician)',
    relatedTool: 'content',
    relatedToolLabel: 'Open Throttle Test Guide',
    content: {
      introduction: 'Electric bike throttles use a magnetic Hall effect sensor, not a mechanical cable. When a throttle fails, the controller receives no throttle command voltage.',
      sections: [
        {
          heading: '1. Testing Throttle Voltage with a Multimeter',
          body: [
            'Locate the 3-wire throttle plug: Red (+5V power), Black (Ground), Green (Signal).',
            'Turn bike ON. Measure voltage between Black and Red: Should read approximately 4.8V to 5.0V DC.',
            'Measure voltage between Black and Green while twisting the grip: Resting position should read ~0.8V; fully twisted position should read ~4.2V smoothly.',
            'If signal stays at 0V or jumps erratically, replace the throttle grip assembly (Rs 800 to Rs 1,400).'
          ]
        }
      ],
      takeaways: [
        'Twist grip replacement is a simple 10-minute DIY repair.',
        'Never pull the bike by the throttle wire loom when parking.'
      ]
    }
  },
  {
    id: 'ebike-display-not-working',
    title: 'E-Bike Display Not Working: Meter Errors, Speedometer & Water Ingress',
    excerpt: 'Fixing blank LCD dashboards, erratic speedometer readings, backlight failures, and common error codes.',
    category: '🔧 Maintenance & Repairs',
    readTime: '5 min read',
    date: 'January 2026',
    author: 'Hamdan Mirza (EV Master Technician)',
    relatedTool: 'content',
    relatedToolLabel: 'Display Error Codes',
    content: {
      introduction: 'Digital displays provide speed, battery voltage, and trip distance. Moisture from rain or car washing is the primary reason LCD meters malfunction.',
      sections: [
        {
          heading: '1. Common Error Codes Decoded',
          body: [
            'Error E-01: Throttle sensor failure or disconnected wire.',
            'Error E-02: Brake cut-off switch engaged or shorted.',
            'Error E-03: Motor Hall sensor signal missing (check axle cable).',
            'Error E-04: Controller communication or low voltage cutoff.'
          ]
        }
      ],
      takeaways: [
        'If the meter gets fogged with internal condensation, place a plastic bag with silica gel packets over it overnight.',
        'Check the main meter multi-pin plug behind the headlight cowl.'
      ]
    }
  },
  {
    id: 'ebike-controller-problems',
    title: 'E-Bike Controller Problems & MOSFET Diagnosis: Testing Jams & Shorts',
    excerpt: 'How to diagnose blown power MOSFETs, controller burnt smells, and why the rear wheel feels locked up.',
    category: '🔧 Maintenance & Repairs',
    readTime: '7 min read',
    date: 'March 2026',
    author: 'Hamdan Mirza (EV Master Technician)',
    relatedTool: 'content',
    relatedToolLabel: 'Controller Troubleshooting',
    content: {
      introduction: 'The motor controller is the brain of the electric bike, using high-power MOSFET transistors to switch battery power into the 3 motor phases.',
      sections: [
        {
          heading: '1. The "Locked Wheel" Blown MOSFET Test',
          body: [
            'If your rear wheel is extremely stiff and refuses to spin freely even when the bike key is completely OFF, you likely have blown controller MOSFETs.',
            'Test: Disconnect the 3 thick phase wires (Blue, Green, Yellow) from the controller.',
            'If the rear wheel now spins completely free, the motor is 100% fine, and the controller internal MOSFETs have short-circuited together.'
          ]
        }
      ],
      takeaways: [
        'A stiff rear wheel with key OFF almost always points to a blown controller, not a bad motor.',
        'A replacement 72V 12-tube or 15-tube sine-wave controller costs Rs 4,500 to Rs 7,500.'
      ]
    }
  },
  {
    id: 'ebike-wiring-problems',
    title: 'E-Bike Wiring Problems: Melted Phase Junctions & Wire Looms',
    excerpt: 'Diagnosing melted yellow 3-phase junction boxes, loose bullet terminals, and heat-shrink soldering repairs.',
    category: '🔧 Maintenance & Repairs',
    readTime: '5 min read',
    date: 'February 2026',
    author: 'Hamdan Mirza (EV Master Technician)',
    relatedTool: 'content',
    relatedToolLabel: 'Wiring Safety Guide',
    content: {
      introduction: 'High electrical current passing through loose or corroded wire terminals creates resistance, generating intense local heat that melts plastic connector blocks.',
      sections: [
        {
          heading: '1. Upgrading the Factory Phase Junction Box',
          body: [
            'Many factory e-bikes use cheap yellow plastic terminal blocks with brass screws for motor phase wires.',
            'Over thousands of kilometers of vibration, these screws loosen, causing arcing and charred plastic.',
            'Upgrade: Replace stock plastic blocks with ceramic terminal blocks or gold-plated high-amperage Anderson / MT60 connectors with heat-shrink tubing.'
          ]
        }
      ],
      takeaways: [
        'Check phase wire junction boxes annually for signs of heat discoloration.',
        'Never use simple household electrical tape; use adhesive-lined heat shrink tubing.'
      ]
    }
  },
  {
    id: 'ebike-brake-problems',
    title: 'E-Bike Brake Problems: Squealing Discs, Air in Lines & Glazed Pads',
    excerpt: 'Fixing noisy disc brakes, eliminating spongy lever feel, cleaning contaminated rotors, and adjusting drum brakes.',
    category: '🔧 Maintenance & Repairs',
    readTime: '5 min read',
    date: 'February 2026',
    author: 'Hamdan Mirza (EV Master Technician)',
    relatedTool: 'content',
    relatedToolLabel: 'Brake Fix Checklist',
    content: {
      introduction: 'Noisy squealing brakes and spongy levers are the most common mechanical complaints among Pakistani electric motorcycle owners.',
      sections: [
        {
          heading: '1. Eliminating Brake Squeal',
          body: [
            'Squealing is caused by high-frequency vibration between glazed brake pads and the steel disc rotor.',
            'Fix: Remove pads and lightly scuff the friction surface in a figure-8 pattern on 240-grit sandpaper.',
            'Spray disc rotor thoroughly with isopropyl alcohol; never use petrol or oily rags to clean brake discs.'
          ]
        }
      ],
      takeaways: [
        'Spongy brake levers indicate air bubbles in the hydraulic fluid line requiring bleeding.',
        'Clean rotors whenever chain lubricant or tire polish accidentally mists onto the brake disc.'
      ]
    }
  },
  {
    id: 'ebike-tyre-puncture-problems',
    title: 'E-Bike Tyre & Puncture Problems: Rear Hub Wheel Removal Guide',
    excerpt: 'How to safely fix punctures on the rear motor wheel without damaging phase wires or voiding motor seals.',
    category: '🔧 Maintenance & Repairs',
    readTime: '6 min read',
    date: 'March 2026',
    author: 'Hamdan Mirza (EV Master Technician)',
    relatedTool: 'content',
    relatedToolLabel: 'Tire & Puncture Guide',
    content: {
      introduction: 'Fixing a rear tire puncture on an electric bike is fundamentally different from a standard petrol motorcycle because the heavy electric motor is integrated directly inside the wheel hub.',
      sections: [
        {
          heading: '1. Critical Instructions for Local Roadside Puncture Shops',
          body: [
            'Always instruct the mechanic: Do NOT pull, twist, or pry against the black motor cable exiting the axle.',
            'Prefer Tubeless Plug Strips: Never remove the rear wheel if a simple external tubeless tire plug (buss strip) can seal the puncture from outside.',
            'If the wheel must be removed: Disconnect the motor cable coupler first so the heavy wheel is not suspended by its electrical wires.'
          ]
        }
      ],
      takeaways: [
        'Carry an emergency tubeless puncture repair kit and 12V mini electric air pump under your seat.',
        'Always verify axle anti-rotation torque washers are seated correctly before tightening rear axle nuts.'
      ]
    }
  },
  {
    id: 'ebike-service-repair-guide-pakistan',
    title: 'E-Bike Service & Repair Guide in Pakistan: Workshops, Parts & Labor',
    excerpt: 'Where to service your electric scooter in Karachi (Akbar Road), Lahore (McLeod Road), and Rawalpindi: parts costs and labor rates.',
    category: '🔧 Maintenance & Repairs',
    readTime: '7 min read',
    date: 'March 2026',
    author: 'Hamdan Mirza (EV Master Technician)',
    relatedTool: 'charging-stations',
    relatedToolLabel: 'Find EV Charging Stations',
    featured: true,
    content: {
      introduction: 'Finding reliable electric two-wheeler mechanics and affordable spare parts in Pakistan has become dramatically easier with the rapid growth of specialized EV auto markets in major cities.',
      sections: [
        {
          heading: '1. Major EV Spare Parts & Service Hubs in Pakistan',
          body: [
            'Karachi: Akbar Road & Saddar Auto Market (Largest hub for lithium cells, BMS, motors, and controllers).',
            'Lahore: McLeod Road & Circular Road near Badami Bagh (Dedicated EV scooter assemblers, technicians, and chargers).',
            'Rawalpindi / Islamabad: Babu Mohallah & College Road (EV conversions and authorized 3S dealership service centers).'
          ],
          table: {
            headers: ['Common Service / Part', 'Estimated Cost (PKR)', 'Labor Charges', 'Typical Replacement Time'],
            rows: [
              ['Front Brake Pads Replacement', 'Rs 600 – 900', 'Rs 200 – 300', '15 Minutes'],
              ['Throttle Grip Replacement', 'Rs 900 – 1,400', 'Rs 250 – 400', '20 Minutes'],
              ['72V Sine-Wave Controller', 'Rs 4,800 – 6,500', 'Rs 1,000 – 1,500', '45 Minutes'],
              ['Rear Tubeless Tire (10-inch / 12-inch)', 'Rs 3,500 – 5,200', 'Rs 400 – 600', '30 Minutes']
            ]
          }
        }
      ],
      takeaways: [
        'Always patronize workshops with digital battery testers and soldering equipment.',
        'Browse our interactive 3S EV Dealerships directory to find certified service centers in your city.'
      ]
    }
  }
];
