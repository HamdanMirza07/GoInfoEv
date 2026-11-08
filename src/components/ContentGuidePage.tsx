import React, { useState } from 'react';
import { 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Battery, 
  Zap, 
  ShieldCheck, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Wrench, 
  BookOpen, 
  Building2,
  ArrowRight,
  Motorbike,
  ShieldAlert
} from 'lucide-react';
import { TabType } from './Navbar';
import { BATTERY_GUIDES } from '../data/batteryGuidesData';
import { MAINTENANCE_GUIDES } from '../data/maintenanceGuidesData';
import { GuideArticleList } from './guides/GuideArticleList';

interface ContentGuidePageProps {
  onNavigate: (tab: TabType) => void;
}

export const ContentGuidePage: React.FC<ContentGuidePageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'battery' | 'maintenance' | 'checklist' | 'wiring' | 'policy' | 'glossary' | 'faqs'>('battery');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Can an electric bike climb steep slopes like Murree or Margalla Hills?',
      a: 'Yes, but performance depends on motor torque (wattage) and controller tuning. Standard 1000W–1500W motors can comfortably climb average flyovers and city bridges with a single rider. For steep hill stations like Murree or Nathia Gali with a pillion passenger, a minimum 2000W to 3000W high-torque motor with a 72V system is recommended. Motors under 800W may struggle or overheat on prolonged 15°+ gradients.'
    },
    {
      q: 'Is an electric scooter safe to ride in heavy rain or waterlogged roads in Karachi/Lahore?',
      a: 'Most reputable electric bikes sold in Pakistan feature IP67-rated hub motors and waterproof sealed battery compartments. Riding through standing water below the center wheel axle of the motor is generally safe. However, never ride through deep stagnant water where the controller or footboard is submerged, and never use a high-pressure service station jet directly onto electrical wiring harness connectors.'
    },
    {
      q: 'How much does it cost to replace the battery in Pakistan when it degrades?',
      a: 'Replacement costs depend entirely on battery chemistry: (1) Graphene Dry Gel Lead-Acid (72V 32Ah) costs approximately Rs 45,000 – 60,000 and lasts ~1.5 years. (2) Ternary Lithium (NMC 72V 30Ah) costs Rs 95,000 – 130,000 and lasts 3–4 years. (3) Lithium Iron Phosphate (LiFePO4 72V 30Ah) costs Rs 120,000 – 160,000 and delivers 5 to 7 years of daily commuting.'
    },
    {
      q: 'Can I charge my electric bike using an ordinary household extension cord?',
      a: 'We strongly advise against ordinary light-gauge multi-plug extension cords. Standard Chinese multi-strips use thin 0.75mm wires that heat up significantly under continuous 5–8 hour charging loads, creating a fire hazard. If you must use an extension, build a custom heavy-duty cable using 2.5mm Pakistan Cables pure copper wire with a dedicated 16A Chinese or MK socket.'
    },
    {
      q: 'Does an electric bike require an engine oil change or periodic engine tuning?',
      a: 'No! Electric two-wheelers have zero engine oil, zero spark plugs, zero air filters, zero carburetors, and zero clutch plates. Routine maintenance is limited to checking disc brake pads, brake fluid, tire pressure, and headlamp bulbs. This saves approximately Rs 3,000 to Rs 4,500 every 1,000 km compared to a 70cc/125cc petrol bike.'
    },
    {
      q: 'What should I do if my battery runs down to 0% in the middle of a trip?',
      a: 'Unlike petrol bikes that stop abruptly, modern EV controllers enter a low-power "limp home" mode when the battery hits ~15% voltage cutoff, capping your speed at 20 km/h to let you reach a nearby safe spot. Any standard 220V 5A/15A socket (at roadside cafes, fuel pumps, or shops) can give you 15–25 km of range in just 45 minutes of top-up charging.'
    },
    {
      q: 'Do I need a driving license and vehicle registration for an EV scooter in Pakistan?',
      a: 'Yes. The Excise and Taxation departments across Punjab, Sindh, Islamabad, and KPK treat all electric two-wheelers with a top speed exceeding 25 km/h as motor vehicles. You require a valid motorcycle driving license, helmet, and vehicle registration book/card with an authorized number plate.'
    },
    {
      q: 'Can I charge my bike with an existing home UPS or solar inverter?',
      a: 'Yes, provided your UPS or solar inverter is Pure Sine Wave and rated for at least 1.2 kVA to 2.0 kVA. Square wave or modified sine wave low-cost UPS units can damage the sensitive high-frequency switching circuits inside your EV charger.'
    }
  ];

  const glossaryTerms = [
    {
      term: 'kWh (Kilowatt-Hour)',
      meaning: 'The standard unit of electrical energy stored in your battery. Calculated as (Voltage × Ah) ÷ 1000. For example, a 72V 30Ah battery holds 2.16 kWh (or ~2.2 "units" on your WAPDA electricity meter).'
    },
    {
      term: 'Ah (Ampere-Hour)',
      meaning: 'The capacity of the battery pack, indicating how many amperes of current it can deliver for one hour. Higher Ah means longer distance per single charge.'
    },
    {
      term: 'BMS (Battery Management System)',
      meaning: 'The digital brain of a lithium battery pack. It monitors cell voltages, prevents overcharging, stops short-circuits, balances cell levels, and cuts power if temperatures exceed safe limits.'
    },
    {
      term: 'SOH (State of Health)',
      meaning: 'A percentage comparing the current capacity of your battery to its brand-new condition. 100% SOH is new; below 70-80% SOH is considered degraded and may need replacement.'
    },
    {
      term: 'LiFePO4 (Lithium Iron Phosphate)',
      meaning: 'The safest, most heat-tolerant lithium battery chemistry. Virtually immune to thermal runaway in 45°C+ summer weather and lasts 2,000+ charge cycles.'
    },
    {
      term: 'Regenerative Braking',
      meaning: 'A system that reverses the electric motor when you pull the brake lever or release the throttle, turning motion back into electricity and pumping 5% to 8% energy back into your battery.'
    },
    {
      term: 'BLDC Hub Motor',
      meaning: 'Brushless Direct Current motor integrated directly into the rear wheel hub. It eliminates chains and belts, requiring almost zero mechanical maintenance.'
    },
    {
      term: 'IP67 Rating',
      meaning: 'Ingress Protection standard certifying the component is 100% dust-tight and waterproof against temporary water immersion up to 1 meter depth.'
    }
  ];

  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-300">
      
      {/* ───────────────────────────────────────────────────────────
          HERO BANNER
      ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 text-white p-6 sm:p-10 lg:p-12 shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-700/60 text-indigo-300 text-xs font-bold">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Essential Knowledgebase</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Pakistan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">EV Buyer & Owner Guide</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Everything you need to know about purchasing, maintaining, wiring, and legally operating an electric two-wheeler in Pakistan.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          {[
            { id: 'battery', label: '🔋 Battery (15 Guides)' },
            { id: 'maintenance', label: '🔧 Maintenance & Problems (20 Guides)' },
            { id: 'checklist', label: "📋 Buyer's Checklist" },
            { id: 'wiring', label: '⚡ Home Wiring & Safety' },
            { id: 'policy', label: '📜 Govt Policy & Licensing' },
            { id: 'glossary', label: '📖 EV Tech Glossary' },
            { id: 'faqs', label: '❓ Common FAQs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          TAB 1: BATTERY GUIDES (15 Detailed Articles)
      ──────────────────────────────────────────────────────────── */}
      {activeTab === 'battery' && (
        <section className="animate-in fade-in duration-200">
          <GuideArticleList 
            articles={BATTERY_GUIDES}
            categoryTitle="E-Bike Battery Master Guides"
            categoryDescription="Detailed Pakistani guides on battery chemistries (LFP vs NMC vs Graphene), prices, replacement costs, lifespan, and charging."
            icon={<Battery className="w-5 h-5 text-emerald-400" />}
            accentColor="emerald"
          />
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────
          TAB 2: MAINTENANCE & TROUBLESHOOTING (20 In-Depth Articles)
      ──────────────────────────────────────────────────────────── */}
      {activeTab === 'maintenance' && (
        <section className="animate-in fade-in duration-200">
          <GuideArticleList 
            articles={MAINTENANCE_GUIDES}
            categoryTitle="E-Bike Maintenance & Problem Troubleshooting"
            categoryDescription="Complete maintenance schedules, component diagnostics, error codes, and roadside repair guides for Pakistani roads."
            icon={<Wrench className="w-5 h-5 text-amber-400" />}
            accentColor="amber"
          />
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────
          TAB 3: BUYER'S CHECKLIST
      ──────────────────────────────────────────────────────────── */}
      {activeTab === 'checklist' && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8 animate-in fade-in">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Dealership Pre-Purchase Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              7 Crucial Questions to Ask Before Buying an EV in Pakistan
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Do not hand over cash until the dealer gives written answers to these seven points.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                num: '1',
                title: 'Exact Battery Chemistry (Lithium vs Graphene vs Lead-Acid)',
                desc: 'Never accept vague descriptions like "Heavy Duty Dry Battery". Demand to know if it is LiFePO4, Ternary Lithium, or Graphene Lead-Acid. Graphene batteries weigh 40kg and last only 1.5 years; LiFePO4 lasts 5+ years.',
                danger: 'Beware of dealerships selling heavy lead-acid bikes disguised as modern lithium technology.'
              },
              {
                num: '2',
                title: 'Battery Warranty Terms in Writing (Replacement vs Repair)',
                desc: 'Ask specifically: "If the battery drops below 70% capacity within 2 years, will you replace the pack or attempt a cell repair?" Insist on an official company warranty card with a stamped serial number.',
                danger: 'Oral promises from showroom salesmen are rarely honored when distributor terms differ.'
              },
              {
                num: '3',
                title: 'Local Availability of Brake Pads, Throttles, and Controllers',
                desc: 'Ask to physically see their spare parts rack. Do they have replacement throttles, digital displays, and rear tire tubes in stock? Standard motorcycle mechanics cannot repair proprietary brushless motor controllers.',
                danger: 'If parts must be imported from China on demand, your bike could sit idle for 6 weeks.'
              },
              {
                num: '4',
                title: 'Charger Auto-Cutoff and Ingress Protection (IP Rating)',
                desc: 'Ensure the supplied charger has an automatic voltage cutoff and cooling fan. Verify the hub motor and battery compartment have an IP65 or IP67 waterproof certification for monsoon rains.',
                danger: 'Cheap chargers without thermal protection can overcharge and bloat battery cells.'
              },
              {
                num: '5',
                title: 'Excise Registration Documentation Status',
                desc: 'Ensure the dealer provides a valid Commercial Invoice, Sales Certificate, and Customs Clearance (GD) copy necessary to obtain an Excise registration number plate in your province.',
                danger: 'Unregistered electric bikes are liable to impoundment by city traffic wardens.'
              },
              {
                num: '6',
                title: 'Suspension Travel and Ground Clearance for Speed Breakers',
                desc: 'Pakistani urban roads feature aggressive, non-standard speed breakers. Check that the lowest point of the frame has at least 150mm to 170mm ground clearance when carrying a pillion passenger.',
                danger: 'Low battery boxes can scrape and crack on high speed breakers, risking water ingress.'
              },
              {
                num: '7',
                title: 'Real-World Loaded Range vs Brochure Claims',
                desc: 'Brochure ranges (e.g. 100 km) are calculated at 20 km/h with a 55kg rider on flat tracks. In real Pakistani city traffic with headlights and 80kg rider weight, subtract 25% to 30% from brochure figures.',
                danger: 'Use our Range Estimator tool to verify the actual range under your specific weight and road conditions.'
              }
            ].map((item) => (
              <div key={item.num} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {item.num}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">{item.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">{item.desc}</p>
                    <div className="mt-2 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/70 p-2 rounded-xl flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{item.danger}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-blue-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs">
              <span className="font-bold">Ready to compare models?</span> Browse verified specs of 38+ Pakistani electric bikes.
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="px-4 py-2 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-all shrink-0 cursor-pointer"
            >
              Explore Fleet Catalog
            </button>
          </div>
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────
          TAB 4: HOME WIRING & CHARGING SAFETY
      ──────────────────────────────────────────────────────────── */}
      {activeTab === 'wiring' && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8 animate-in fade-in">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
              Electrical Safety
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              Home Electrical Wiring Standards for Electric Two-Wheelers
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Prevent melted sockets, tripped breakers, and short circuits in residential parking spots.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-base">1. Dedicated 15A/16A Socket with Dedicated Breaker</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Most EV chargers pull between 350W and 1,200W continuously for 5 to 7 hours. Do not share the socket with heavy appliances like microwave ovens or washing machines. Install a dedicated 16A Miniature Circuit Breaker (MCB) in your main distribution board.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-base">2. Proper Grounding & Earthing Connection</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Many older Pakistani homes lack proper earthing on porch sockets. A floating ground creates static shocks on the bike frame during humid weather and deprives the charger's surge protection of a discharge path. Always ensure the 3-pin socket has a verified earth wire connected to a ground rod.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-base">3. Cable Gauge Requirements (Pakistan Cables Pure Copper)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use minimum 2.5mm (7/29) pure copper wiring from the main board to the porch charging outlet. Cheap aluminum-clad copper wires experience resistance heating under prolonged charging loads.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-2">
              <h4 className="font-extrabold text-rose-950 text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>The Extension Cord Hazard</span>
              </h4>
              <p className="text-xs text-rose-900 leading-relaxed">
                Never use light-duty multi-plugs or coiled extension reels. Thin conductors inside wrapped reels cannot dissipate heat, leading to melted plastic insulation and potential fires.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────
          TAB 4: GOVT POLICIES & LICENSING
      ──────────────────────────────────────────────────────────── */}
      {activeTab === 'policy' && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8 animate-in fade-in">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              Legal & Policy Framework
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              Pakistan National EV Policy (NEVP) & Excise Rules
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Official benefits, duties, taxes, and traffic licensing regulations for electric two-wheelers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-base">Customs & Sales Tax Exemptions</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Under the National Electric Vehicle Policy, Completely Knocked Down (CKD) kits for electric 2-wheelers enjoy 1% customs duty, and sales tax on local EV assembly is capped at 1% (compared to 18% for petrol bikes).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-base">Provincial Token Tax Concessions</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Excise & Taxation departments in Punjab and Sindh have offered substantial discounts or lifetime token tax exemptions for registered electric two-wheelers to promote zero-emission green mobility.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-base">Motorcycle Driving License Required</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Any electric scooter capable of speeds exceeding 25 km/h requires a valid driving license issued by City Traffic Police. Helmets are mandatory under standard motor vehicle regulations.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-base">Helmet & Highway Restrictions</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Just like standard 70cc motorcycles, electric two-wheelers are legally barred from entry onto National Motorways (M-2, M-3, M-5, M-9, etc.) by the National Highway and Motorway Police (NHMP).
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────
          TAB 5: EV GLOSSARY
      ──────────────────────────────────────────────────────────── */}
      {activeTab === 'glossary' && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8 animate-in fade-in">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">
              Terminology
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              Electric Vehicle Technical Glossary
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Common terms explained simply for everyday consumers and riders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {glossaryTerms.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="font-black text-slate-900 text-sm text-blue-600">{item.term}</span>
                <p className="text-xs text-slate-600 leading-relaxed">{item.meaning}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────
          TAB 6: INTERACTIVE FAQS
      ──────────────────────────────────────────────────────────── */}
      {activeTab === 'faqs' && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6 animate-in fade-in">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              Got Questions About EVs in Pakistan?
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Here are direct, no-nonsense answers to the questions Pakistani riders ask every day.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                  >
                    <span className="font-extrabold text-sm sm:text-base text-slate-900">
                      {faq.q}
                    </span>
                    <span className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="p-4 sm:p-5 bg-white border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
};
