import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  ChevronRight, 
  Zap, 
  BatteryCharging, 
  TrendingUp, 
  Copy, 
  Check,
  Bike,
  Motorbike,
  Sun,
  ShieldCheck,
  Mail,
  Scale,
  BookOpen
} from 'lucide-react';
import { TabType } from './Navbar';
import { EV_MODELS, formatPKR } from '../data/evModels';

export const EvScootyIcon: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}> = ({ className = '', size = 'md', glow = false }) => {
  const sizeMap = {
    sm: { bike: 'w-4 h-4', bolt: 'w-2 h-2', boltOffset: '-top-1 -right-1' },
    md: { bike: 'w-5 h-5', bolt: 'w-2.5 h-2.5', boltOffset: '-top-1 -right-1.5' },
    lg: { bike: 'w-6 h-6', bolt: 'w-3 h-3', boltOffset: '-top-1.5 -right-1.5' },
  };
  const s = sizeMap[size];

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <Motorbike className={`${s.bike} text-current transition-transform`} />
      <span className={`absolute ${s.boltOffset} flex items-center justify-center rounded-full bg-[#F0B429] text-[#071B2B] p-0.5 shadow-xs border border-[#071B2B] ${glow ? 'animate-pulse' : ''}`}>
        <Zap className={`${s.bolt} fill-[#071B2B]`} />
      </span>
    </div>
  );
};

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  actions?: string[];
  provider?: string;
}

interface AIBotAssistantProps {
  onNavigate: (tab: TabType) => void;
  defaultOpen?: boolean;
}

const SUGGESTED_QUESTIONS = [
  { label: '🛵 Best EV bike in Pakistan?', query: 'Which EV bike has the best range and build quality in Pakistan?' },
  { label: '💰 Petrol vs EV Savings?', query: 'How much money can I save monthly compared to a 70cc petrol bike?' },
  { label: '⚡ Charging Cost & Units?', query: 'What is the electricity cost and units consumed for one full charge?' },
  { label: '🔋 LFP vs Graphene Battery?', query: 'What is the difference between LFP and Graphene batteries?' },
  { label: '📦 Delivery Rider Profit ROI?', query: 'Which EV bike is best for Bykea and Foodpanda delivery riders?' },
  { label: '📍 Dealerships in Karachi / Lahore?', query: 'Where are EV bike showrooms located in Karachi and Lahore?' },
];

export const triggerEVBot = (query?: string) => {
  window.dispatchEvent(new CustomEvent('open-ev-bot', { detail: { query } }));
};

function generateClientEVResponse(query: string): { replyText: string; suggestedActions: string[] } {
  const q = query.toLowerCase().trim();

  if (
    q.includes("jawab") || q.includes("baat") || q.includes("samajh") || 
    q.includes("puch") || q.includes("pooch") || q.includes("can you answer") || 
    q.includes("can you reply") || q.includes("talk to me") || q.includes("kuch batao") ||
    q.includes("meri kisi bat") || q.includes("jawab dy skty")
  ) {
    return {
      replyText: `Ji haan, bilkul! Main aap ke har sawaal ka jawab de sakta hoon! ⚡\n\nAap mujh se Pakistan ki kisi bhi EV bike ke baare me pooch sakte hain. Jaise:\n\n- **"Crown Raftaar ki price aur range kya hai?"**\n- **"MS Jaguar E-70 ki kitni qeemat hai?"**\n- **"Vlektra, Jolta, Revoo, ya Okla ki sab se sasti bike konsi hai?"**\n- **"Petrol bike ke muqable kitni bachat hogi?"**\n- **"Ek full charge par kitne units lagte hain?"**\n\nAap ka kya sawaal hai? Aap Roman Urdu ya English me jo chahein likh kar pooch sakte hain!`,
      suggestedActions: ['products', 'savings', 'charging', 'range']
    };
  }

  if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("assalam") || q.includes("aoa") || q.includes("salam")) {
    return {
      replyText: `Walaikum Assalam / Hello! 👋\n\nMain **goinfoEV AI Assistant** hoon. Main aap ki EV bikes ke baare me har tarah se madad kar sakta hoon!\n\nAap kis bike ke baare me poochna chahte hain ya konsi maloomat chahiye?`,
      suggestedActions: ['products', 'savings', 'charging', 'range']
    };
  }

  if (q.includes("kaise ho") || q.includes("kya hal") || q.includes("kaisa ho") || q.includes("how are you")) {
    return {
      replyText: `Main Alhamdulilah bilkul theek hoon! 😊\n\nAap batayein, aap ke liye konsi EV bike ki details nikaloon? Aap price, range, ya petrol savings ke baare me pooch sakte hain!`,
      suggestedActions: ['products', 'savings', 'charging']
    };
  }

  if (q.includes("kaam kya") || q.includes("kya kar sakte") || q.includes("what can you do") || q.includes("help me")) {
    return {
      replyText: `Main Pakistan ki tamam **157 EV bikes** ka live data rakhta hoon! Main aap ko ye sab bata sakta hoon:\n\n1. **Kisi bhi bike ki exact price, battery, speed aur range**\n2. **Mahana kitne rupay petrol ki bachat hogi**\n3. **Ek charge par K-Electric / LESCO ka kitna bill aye ga**\n4. **Karachi, Lahore, Islamabad me showrooms kahan hain**\n5. **Bykea / Foodpanda riders ke liye sab se achi bike**`,
      suggestedActions: ['products', 'savings', 'charging', 'dealerships']
    };
  }

  if (q === "haan" || q === "yes" || q === "ji" || q === "ji haan" || q === "ok" || q === "g" || q === "bolon") {
    return {
      replyText: `Ji batayein! Aap kis brand ya model ke baare me poochna chahte hain? (Crown, MS Jaguar, Vlektra, Jolta, Okla, Revoo, YJ Future, Yadea, Metro, Jinpeng, ya United)`,
      suggestedActions: ['products', 'savings', 'charging']
    };
  }

  if (q.includes("shukriya") || q.includes("thanks") || q.includes("thank you") || q.includes("jazakallah")) {
    return {
      replyText: `Aap ka bohat shukriya! ❤️\n\nAgar koi aur sawaal ho to zaroor poochiyega. Aap hamare interactive calculators bhi try kar sakte hain!`,
      suggestedActions: ['products', 'savings', 'charging']
    };
  }

  if (q.includes("best") || q.includes("achi") || q.includes("konsi loon") || q.includes("konsi achi")) {
    return {
      replyText: `⭐ **Pakistan me Top Recommended EV Bikes:**\n\n1. **Longest Range Commuter:** Vlektra Velocity 180 (180 km range, LFP battery, PKR 339,000)\n2. **Best Family & Daily Workhorse:** Crown Raftaar Pro LFP (140-160 km, PKR 365,000)\n3. **Best Value & Warranty:** MS Jaguar E-70 (100 km, 5-yr warranty, PKR 265,000)\n4. **Best Budget Entry:** Revoo A04 / YJ Future Cargo (PKR 95,000 - 100,000)\n5. **Best Heavy Duty Streetfighter:** Vlektra Bolt (105 km/h, PKR 549,000)`,
      suggestedActions: ['products', 'comparison', 'range']
    };
  }

  const tokens = q.split(/\s+/).filter(t => t.length > 2);
  const matchedModels = EV_MODELS.filter(m => {
    const fullStr = `${m.brand} ${m.model} ${m.variant || ''} ${m.category || ''} ${m.batteryType}`.toLowerCase();
    return q.includes(m.brand.toLowerCase()) || 
           q.includes(m.model.toLowerCase()) ||
           (m.variant && q.includes(m.variant.toLowerCase())) ||
           tokens.some(token => fullStr.includes(token));
  });

  if (matchedModels.length > 0) {
    const topMatches = matchedModels.slice(0, 5);
    const listText = topMatches.map(m => 
      `• **${m.brand} ${m.model}** ${m.variant ? `(${m.variant})` : ''}\n  - **Official Price:** ${m.price ? formatPKR(m.price) : 'Contact Showroom'}\n  - **Battery Specs:** ${m.batteryLabel} (${m.chemistry.toUpperCase()})\n  - **Certified Range:** ${m.rangeMin === m.rangeMax ? `${m.rangeMin} km` : `${m.rangeMin} - ${m.rangeMax} km`}\n  - **Top Speed:** ${m.topSpeed} | **Charge Time:** ${m.chargeTime}\n  - **Motor:** ${m.motor}\n  - **Warranty:** ${m.warranty || 'Official Manufacturer Warranty'}`
    ).join('\n\n');

    return {
      replyText: `⚡ **Website Dataset Details for "${query}":**\n\n${listText}\n\n💡 *Tip:* You can use our interactive Range & Charging calculators to simulate exact monthly running costs for these bikes!`,
      suggestedActions: ['products', 'range', 'charging', 'comparison']
    };
  }

  if (q.includes("sasti") || q.includes("cheapest") || q.includes("budget") || q.includes("price") || q.includes("rate") || q.includes("qeemat") || q.includes("qemat") || q.includes("paisa")) {
    const pricedModels = EV_MODELS.filter(m => m.price !== null).sort((a, b) => (a.price || 0) - (b.price || 0));
    const cheapest3 = pricedModels.slice(0, 4);
    const mid3 = pricedModels.filter(m => (m.price || 0) >= 200000 && (m.price || 0) <= 300000).slice(0, 3);
    
    return {
      replyText: `🏷️ **EV Bike Price Tiers in Pakistan (Live Website Catalog):**\n\n**1. Most Affordable Entry Models:**\n${cheapest3.map(m => `• **${m.brand} ${m.model}**: ${formatPKR(m.price)} (${m.batteryLabel}, ${m.rangeMin}-${m.rangeMax} km)`).join('\n')}\n\n**2. Top Mid-Range Choices (Rs. 200k - 300k):**\n${mid3.map(m => `• **${m.brand} ${m.model}**: ${formatPKR(m.price)} (${m.batteryLabel}, ${m.rangeMin}-${m.rangeMax} km)`).join('\n')}\n\nTotal **${EV_MODELS.length} models** listed in our live database.`,
      suggestedActions: ['products', 'comparison', 'savings']
    };
  }

  if (q.includes("range") || q.includes("km") || q.includes("kitne km") || q.includes("longest") || q.includes("chalti")) {
    const highRange = [...EV_MODELS].sort((a, b) => b.rangeMax - a.rangeMax).slice(0, 5);
    return {
      replyText: `⚡ **Top Long-Range EV Bikes in Pakistan (Database Ranking):**\n\n${highRange.map((m, i) => `${i + 1}. **${m.brand} ${m.model}** ${m.variant ? `(${m.variant})` : ''}\n   - **Max Range:** ${m.rangeMax} km\n   - **Battery:** ${m.batteryLabel}\n   - **Price:** ${formatPKR(m.price)}`).join('\n\n')}\n\n💡 Real-world range depends on rider weight, speed mode, and tyre pressure.`,
      suggestedActions: ['range', 'products', 'charging']
    };
  }

  if (q.includes("cost") || q.includes("unit") || q.includes("charging") || q.includes("bill") || q.includes("kharcha") || q.includes("bijli")) {
    return {
      replyText: `💰 **Electricity & Charging Bill Calculation (Pakistan Utility Tariffs):**\n\n- **Units required for 1 Full Charge:** Typically **2.0 to 3.2 units (kWh)** (assuming 85% charger efficiency).\n- **WAPDA / K-Electric Rate:** ~Rs. 45 - 65 per unit.\n- **Cost for 1 Full Charge (80-120 km):** Just **Rs. 90 to Rs. 180**!\n- **Cost per KM:** **Rs. 1.10 to Rs. 1.50 / km** (compared to Petrol 70cc @ Rs. 7.00/km).\n\nUse our Charging Cost Calculator tool for exact model-by-model bill estimates!`,
      suggestedActions: ['charging', 'solar', 'savings']
    };
  }

  if (q.includes("bachat") || q.includes("saving") || q.includes("petrol") || q.includes("comparison") || q.includes("muqabla")) {
    return {
      replyText: `📊 **Monthly Petrol vs EV Financial Comparison:**\n\n• **Petrol 70cc Bike (1,500 km/month):**\n  - Petrol Expense (Rs. 280/L @ 40 km/L): ~Rs. 10,500\n  - Engine Oil Change (2x): ~Rs. 1,500\n  - **Total Monthly Petrol Expense:** **Rs. 12,000 / month**\n\n• **EV Bike (1,500 km/month):**\n  - Electricity Bill (30 full charges @ Rs. 60/unit): ~Rs. 1,800\n  - Engine Oil Expense: **Rs. 0**\n  - **Total Monthly EV Expense:** **Rs. 1,800 / month**\n\n🎉 **Net Monthly Savings:** **~Rs. 10,200 per month** (Over **Rs. 120,000 / year**!)`,
      suggestedActions: ['savings', 'comparison', 'products']
    };
  }

  if (q.includes("battery") || q.includes("lfp") || q.includes("graphene") || q.includes("life") || q.includes("lithium")) {
    return {
      replyText: `🔋 **Battery Technology Comparison for Pakistan Climate:**\n\n1. **Lithium LFP (Lithium Iron Phosphate):**\n   - **Lifespan:** 3,000 - 4,000 charge cycles (7 to 10 years).\n   - **Heat Safety:** Safest chemistry; non-combustible in 45°C+ summer heat.\n   - **Featured In:** Crown Raftaar, MS Jaguar E-70/E-125, Vlektra, Okla LFP, Revoo LFP.\n\n2. **TTFAR Graphene:**\n   - **Lifespan:** 800 - 1,200 charge cycles (2.5 to 4 years).\n   - **Advantage:** Low upfront replacement cost (Rs. 65k - 95k).\n   - **Featured In:** Yadea T9, MS Jaguar Miso, Okla Onyx.`,
      suggestedActions: ['battery', 'products', 'solar']
    };
  }

  if (q.includes("rider") || q.includes("foodpanda") || q.includes("bykea") || q.includes("yango") || q.includes("indrive") || q.includes("delivery")) {
    return {
      replyText: `🛵 **Commercial Delivery Rider ROI (Bykea / Foodpanda / Yango):**\n\n- Daily running: **100 - 140 km**\n- Daily Petrol expense on CD70: ~Rs. 800 - 1,000\n- Daily EV charging expense: ~Rs. 120 - 160\n- **Daily Net Extra Profit:** **~Rs. 650 - 850 in your pocket!**\n- **Monthly Extra Earnings:** **Rs. 19,500 - 25,000+**!\n\n⭐ *Top Recommended Rider Bikes:* Crown Raftaar Pro (60Ah LFP), Yadea T9 Graphene, Vlektra Velocity 180.`,
      suggestedActions: ['rider', 'range', 'products']
    };
  }

  if (q.includes("karachi") || q.includes("lahore") || q.includes("islamabad") || q.includes("showroom") || q.includes("dealership") || q.includes("shop") || q.includes("kahan")) {
    return {
      replyText: `📍 **Verified EV Showrooms & Dealership Hubs in Pakistan:**\n\n- **Karachi:** Akbar Road (Saddar EV Hub), Clifton Block 4, DHA Phase 6, Main Rashid Minhas Road.\n- **Lahore:** McLeod Road 2-Wheeler Market, Main Boulevard Gulberg, DHA Phase 5.\n- **Islamabad / Rawalpindi:** Murree Road & Blue Area.\n- **Faisalabad & Multan:** Jhang Road, Katchery Road.\n\nCheck our EV Charging Stations & Showroom Finder tab for interactive map pins!`,
      suggestedActions: ['dealerships', 'products', 'contact']
    };
  }

  return {
    replyText: `Haan bilkul! Main aap ke har sawaal ka jawab de sakta hoon! ⚡\n\nMain website me mojood **${EV_MODELS.length} EV models** (Jolta, MS Jaguar, Vlektra, OKLA, REVOO, YJ Future, Crown, Yadea, Metro, Jinpeng, United) ka poora data janta hoon. Aap mujh se pooch sakte hain:\n\n- **"MS Jaguar E-70 ki price aur range kya hai?"**\n- **"Jolta, Vlektra, ya Revoo ki sab se achi bike konsi hai?"**\n- **"Petrol bike se kitni bachat hogi?"**\n- **"Ek charge par bijli ke kitne units lagte hain?"**\n\nAap Roman Urdu ya English me jo chahein poochain!`,
    suggestedActions: ['products', 'savings', 'charging', 'range']
  };
}

export const AIBotAssistant: React.FC<AIBotAssistantProps> = ({ onNavigate, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const initialWelcomeMessage: ChatMessage = {
    id: 'welcome-msg',
    role: 'model',
    content: `Hello! I am the **goinfoEV AI Assistant** ⚡\n\nI operate **100% locally inside this website** using our complete EV dataset. I can instantly answer your questions with zero external API dependencies:\n\n- 🛵 **EV Bike Models & Pricing (Jolta, MS Jaguar, Vlektra, Okla, Revoo, Crown, Yadea, YJ Future)**\n- 💰 **Monthly Petrol Savings (Save Rs. 10,000 - 25,000+/month)**\n- ⚡ **Charging Cost & Tariff Calculations (K-Electric, LESCO, IESCO)**\n- 🔋 **Battery Lifespan & Heat Safety (LFP vs TTFAR Graphene)**\n- 🔌 **EV Charging Stations Tracker (M-2, M-3, M-5, M-9 Motorways & Cities)**\n- 📦 **Delivery Rider Profit ROI for Bykea, Yango & Foodpanda**\n\nHow can I assist you today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actions: ['products', 'savings', 'charging', 'stations']
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  useEffect(() => {
    const handleOpenBotEvent = (e: Event) => {
      const customEv = e as CustomEvent<{ query?: string }>;
      setIsOpen(true);
      if (customEv.detail?.query) {
        handleSendMessage(customEv.detail.query);
      }
    };
    window.addEventListener('open-ev-bot', handleOpenBotEvent);
    return () => window.removeEventListener('open-ev-bot', handleOpenBotEvent);
  }, [isLoading]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    setTimeout(() => {
      const { replyText, suggestedActions } = generateClientEVResponse(query);

      const botResponse: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: suggestedActions,
        provider: 'goinfoEV Client Data Engine',
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    }, 250);
  };

  const handleResetChat = () => {
    setMessages([initialWelcomeMessage]);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleActionClick = (actionKey: string) => {
    const validTabs: Record<string, TabType> = {
      range: 'range',
      charging: 'charging',
      savings: 'savings',
      battery: 'battery',
      stations: 'charging-stations',
      dealerships: 'charging-stations',
      'charging-stations': 'charging-stations',
      solar: 'solar',
      rider: 'rider',
      products: 'products',
      comparison: 'comparison',
      contact: 'contact',
      content: 'content',
      guides: 'content',
    };

    const targetTab = validTabs[actionKey];
    if (targetTab) {
      onNavigate(targetTab);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    }
  };

  const getActionDetails = (actionKey: string) => {
    switch (actionKey) {
      case 'range':
        return { label: 'Real Range Estimator', icon: Zap, color: 'text-[#16A36A] bg-[#16A36A]/10 border-[#16A36A]/30' };
      case 'charging':
        return { label: 'Charging Cost Calculator', icon: BatteryCharging, color: 'text-[#F0B429] bg-[#F0B429]/10 border-[#F0B429]/30' };
      case 'savings':
        return { label: 'Calculate Petrol Savings', icon: TrendingUp, color: 'text-[#16A36A] bg-[#16A36A]/10 border-[#16A36A]/30' };
      case 'stations':
      case 'dealerships':
      case 'charging-stations':
        return { label: 'EV Charging Stations', icon: Zap, color: 'text-[#16A36A] bg-[#16A36A]/10 border-[#16A36A]/30' };
      case 'battery':
        return { label: 'Battery Health Tracker', icon: ShieldCheck, color: 'text-[#16A36A] bg-[#16A36A]/10 border-[#16A36A]/30' };
      case 'solar':
        return { label: 'Solar Charging Setup', icon: Sun, color: 'text-[#F0B429] bg-[#F0B429]/10 border-[#F0B429]/30' };
      case 'rider':
        return { label: 'Rider Profit ROI', icon: Bike, color: 'text-[#F0B429] bg-[#F0B429]/10 border-[#F0B429]/30' };
      case 'products':
        return { label: 'View EV Models & Prices', icon: Bike, color: 'text-[#16A36A] bg-[#16A36A]/10 border-[#16A36A]/30' };
      case 'comparison':
        return { label: 'Compare EV Bikes', icon: Scale, color: 'text-[#16A36A] bg-[#16A36A]/10 border-[#16A36A]/30' };
      case 'contact':
        return { label: 'Contact Support', icon: Mail, color: 'text-[#16A36A] bg-[#16A36A]/10 border-[#16A36A]/30' };
      case 'content':
      case 'guides':
        return { label: 'EV Guides', icon: BookOpen, color: 'text-[#16A36A] bg-[#16A36A]/10 border-[#16A36A]/30' };
      default:
        return { label: actionKey, icon: ChevronRight, color: 'text-slate-700 bg-slate-100 border-slate-200' };
    }
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }

      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ');
      const cleanLine = isBullet ? trimmed.substring(2) : trimmed;

      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

      const content = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-extrabold text-[#071B2B]">{part.slice(2, -2)}</strong>;
        }
        return <span key={pIdx}>{part}</span>;
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-2 my-0.5 pl-1">
            <span className="text-[#16A36A] font-extrabold select-none">•</span>
            <div className="flex-1">{content}</div>
          </div>
        );
      }

      return (
        <div key={idx} className="min-h-[1.25rem] my-0.5">
          {content}
        </div>
      );
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-18 right-4 lg:bottom-6 lg:right-6 z-50 flex items-end sm:items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="hidden sm:flex items-center gap-2 bg-[#071B2B] text-white text-xs font-semibold py-1.5 px-3 rounded-full shadow-xl border border-[#172B3A] pointer-events-none mb-1">
            <span className="w-2 h-2 rounded-full bg-[#16A36A] animate-ping"></span>
            <span>Any EV Question? Ask AI Bot</span>
          </div>
          <button
            id="ev-ai-bot-trigger"
            onClick={() => setIsOpen(true)}
            className="group relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl bg-[#16A36A] hover:bg-[#138e5b] text-white shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-white/20 cursor-pointer min-w-[78px] sm:min-w-[88px]"
            aria-label="Open EV Scooty AI Assistant"
          >
            <div className="relative flex items-center justify-center">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Motorbike className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-[#F0B429] text-[#071B2B] shadow-md border-2 border-[#071B2B] animate-pulse">
                <Zap className="w-2.5 h-2.5 fill-[#071B2B] text-[#071B2B]" />
              </span>
            </div>

            <div className="flex flex-col items-center text-center mt-1.5">
              <span className="text-[11px] sm:text-xs font-black tracking-tight leading-tight text-white flex items-center justify-center gap-1 whitespace-nowrap">
                <span>EV Scooty Bot</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F0B429] animate-pulse"></span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-emerald-100 font-semibold leading-tight whitespace-nowrap mt-0.5">
                Ask 24/7 AI
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div
          id="ev-ai-bot-window"
          className={`fixed z-50 flex flex-col bg-white shadow-2xl border border-slate-200 transition-all duration-300 ease-out overflow-hidden
            ${isExpanded 
              ? 'inset-3 sm:inset-6 md:inset-10 rounded-2xl' 
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[440px] h-[600px] max-h-[88vh] rounded-2xl'
            }
          `}
        >
          {/* Header */}
          <div className="bg-[#071B2B] text-white px-4 py-3.5 flex items-center justify-between border-b border-[#172B3A] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#16A36A] flex items-center justify-center shadow-inner border border-[#16A36A]/40 relative">
                <Motorbike className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#F0B429] text-[#071B2B] border border-[#071B2B] shadow-xs">
                  <Zap className="w-2 h-2 fill-[#071B2B] text-[#071B2B]" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white tracking-tight">EV Scooty AI Assistant</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#16A36A]/20 text-[#16A36A] border border-[#16A36A]/30 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A] animate-pulse"></span>
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Electric Two-Wheeler Advisor &amp; Analytics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Restart conversation"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-[#172B3A] rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore window size' : 'Expand window'}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-[#172B3A] rounded-lg transition-colors cursor-pointer hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-[#172B3A] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F5F8F6]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-7 h-7 rounded-lg bg-[#16A36A] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 relative">
                    <Motorbike className="w-3.5 h-3.5 text-white" />
                    <Zap className="w-2 h-2 text-[#F0B429] fill-[#F0B429] absolute -top-0.5 -right-0.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs transition-all
                    ${msg.role === 'user'
                      ? 'bg-[#16A36A] text-white rounded-br-xs font-semibold'
                      : 'bg-white text-[#071B2B] border border-slate-200/90 rounded-bl-xs'
                    }
                  `}
                >
                  <div className="space-y-1">
                    {renderFormattedText(msg.content)}
                  </div>

                  {msg.role === 'model' && msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {msg.actions.map((act) => {
                        const { label, icon: ActionIcon, color } = getActionDetails(act);
                        return (
                          <button
                            key={act}
                            onClick={() => handleActionClick(act)}
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs ${color}`}
                          >
                            <ActionIcon className="w-3.5 h-3.5" />
                            <span>{label}</span>
                            <ChevronRight className="w-3 h-3 opacity-60" />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className={`mt-1.5 flex items-center justify-between text-[10px] ${msg.role === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                    <span>{msg.timestamp}</span>
                    {msg.role === 'model' && (
                      <button
                        onClick={() => handleCopyText(msg.id, msg.content)}
                        className="p-1 hover:text-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#16A36A]" />
                            <span className="text-[#16A36A]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-[#16A36A] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 relative">
                  <Motorbike className="w-3.5 h-3.5 text-white animate-pulse" />
                  <Zap className="w-2 h-2 text-[#F0B429] fill-[#F0B429] absolute -top-0.5 -right-0.5 animate-bounce" />
                </div>
                <div className="bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-bl-xs px-4 py-3 text-sm shadow-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#16A36A] animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-[#16A36A] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-[#16A36A] animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-xs text-slate-500 ml-1">Analyzing Pakistani EV data...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="bg-white border-t border-slate-100 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 pl-1">Suggested:</span>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q.query)}
                disabled={isLoading}
                className="text-xs shrink-0 bg-[#F5F8F6] hover:bg-[#16A36A]/10 hover:text-[#16A36A] text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 hover:border-[#16A36A]/40 transition-colors disabled:opacity-50 cursor-pointer font-medium"
              >
                {q.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask any question about EV bikes, charging, or savings..."
              disabled={isLoading}
              className="flex-1 bg-[#F5F8F6] text-[#071B2B] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A36A] focus:bg-white transition-all disabled:opacity-50 font-medium"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 bg-[#16A36A] hover:bg-[#138e5b] text-white rounded-xl shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
              aria-label="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIBotAssistant;
