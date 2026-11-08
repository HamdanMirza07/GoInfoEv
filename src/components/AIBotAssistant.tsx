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
  MapPin, 
  Calculator, 
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

// Distinctive EV Scooty Icon with Electric Charge Badge
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
      <span className={`absolute ${s.boltOffset} flex items-center justify-center rounded-full bg-amber-400 text-slate-950 p-0.5 shadow-xs border border-slate-900 ${glow ? 'animate-pulse' : ''}`}>
        <Zap className={`${s.bolt} fill-slate-950`} />
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

export const AIBotAssistant: React.FC<AIBotAssistantProps> = ({ onNavigate, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const initialWelcomeMessage: ChatMessage = {
    id: 'welcome-msg',
    role: 'model',
    content: `Hello! I am the **goinfoEV AI Assistant** ⚡\n\nI am here to help you navigate Pakistan's electric mobility market with accurate facts, analytics, and calculations:\n\n- 🛵 **EV Bike Models & Pricing (Crown, Yadea, Evee, MS Jaguar)**\n- 💰 **Monthly Petrol Savings (Save Rs. 10,000 - 25,000+/month)**\n- ⚡ **Charging Cost & Tariff Calculations (K-Electric, LESCO, IESCO)**\n- 🔋 **Battery Lifespan & Heat Safety (LFP vs TTFAR Graphene)**\n- 🔌 **EV Charging Stations Tracker (M-2, M-3, M-5, M-9 Motorways & Cities)**\n- 📦 **Delivery Rider Profit ROI for Bykea, Yango & Foodpanda**\n\nHow can I assist you today?`,
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

  const handleSendMessage = async (textToSend?: string) => {
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

    try {
      const historyForApi = messages
        .filter((m) => m.id !== 'welcome-msg')
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch('/api/bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyForApi,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      const botResponse: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.reply || 'Sorry, I could not generate an answer to this question. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: data.actions || [],
        provider: data.provider,
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      console.error('Failed to communicate with bot:', err);
      const fallbackResponse: ChatMessage = {
        id: `bot-fallback-${Date.now()}`,
        role: 'model',
        content: `⚡ **goinfoEV Assistant Guidance:**\n\nOur platform tools are fully operational. You can explore complete data for any EV bike model in Pakistan using our dedicated analytics calculators:\n\n- **Real Range Estimator:** Accurate km predictions based on speed & rider weight\n- **Charging Cost Calculator:** Unit consumption & utility tariff calculations\n- **Petrol Savings Calculator:** Monthly and yearly financial comparisons\n- **EV Charging Stations Finder:** Fast DC chargers on motorways & major cities\n\nYou can also contact our team directly via the contact portal.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: ['products', 'savings', 'charging', 'stations', 'contact'],
      };
      setMessages((prev) => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
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
      // On mobile screens, collapse chat window so user sees the page
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    }
  };

  const getActionDetails = (actionKey: string) => {
    switch (actionKey) {
      case 'range':
        return { label: 'Real Range Estimator', icon: Zap, color: 'text-amber-600 bg-amber-50 border-amber-200' };
      case 'charging':
        return { label: 'Charging Cost Calculator', icon: BatteryCharging, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      case 'savings':
        return { label: 'Calculate Petrol Savings', icon: TrendingUp, color: 'text-blue-600 bg-blue-50 border-blue-200' };
      case 'stations':
      case 'dealerships':
      case 'charging-stations':
        return { label: 'EV Charging Stations', icon: Zap, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      case 'battery':
        return { label: 'Battery Health Tracker', icon: ShieldCheck, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
      case 'solar':
        return { label: 'Solar Charging Setup', icon: Sun, color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'rider':
        return { label: 'Rider Profit ROI', icon: Bike, color: 'text-purple-600 bg-purple-50 border-purple-200' };
      case 'products':
        return { label: 'View EV Models & Prices', icon: Bike, color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'comparison':
        return { label: 'Compare EV Bikes', icon: Scale, color: 'text-cyan-700 bg-cyan-50 border-cyan-200' };
      case 'contact':
        return { label: 'Contact Support & Booking', icon: Mail, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'content':
      case 'guides':
        return { label: 'EV Guides & Repair Center', icon: BookOpen, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
      default:
        return { label: actionKey, icon: ChevronRight, color: 'text-slate-700 bg-slate-100 border-slate-200' };
    }
  };

  // Helper to render bold markdown lines cleanly
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Basic bold formatting replacements
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={idx} className={line.trim() === '' ? 'h-2' : 'min-h-[1.25rem]'}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <>
      {/* Floating Trigger Button (Vertical: Icon on Top, 2nd Element Below) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-end sm:items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold py-1.5 px-3 rounded-full shadow-xl border border-slate-700 pointer-events-none mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Any EV Question? Ask AI Bot</span>
          </div>
          <button
            id="ev-ai-bot-trigger"
            onClick={() => setIsOpen(true)}
            className="group relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-blue-600 text-white shadow-2xl shadow-emerald-600/40 hover:shadow-emerald-600/60 hover:scale-105 active:scale-95 transition-all border-2 border-emerald-400/60 cursor-pointer min-w-[78px] sm:min-w-[88px]"
            aria-label="Open EV Scooty AI Assistant"
          >
            {/* Top: Icon */}
            <div className="relative flex items-center justify-center">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Motorbike className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 text-slate-950 shadow-md border-2 border-slate-900 animate-pulse">
                <Zap className="w-2.5 h-2.5 fill-slate-950 text-slate-950" />
              </span>
            </div>

            {/* Bottom: 2nd Element (Text & Subtitle) */}
            <div className="flex flex-col items-center text-center mt-1.5">
              <span className="text-[11px] sm:text-xs font-black tracking-tight leading-tight text-white flex items-center justify-center gap-1 whitespace-nowrap">
                <span>EV Scooty Bot</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
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
          <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-blue-600 flex items-center justify-center shadow-inner border border-emerald-400/40 relative">
                <Motorbike className="w-5 h-5 text-emerald-100" />
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 border border-slate-900 shadow-xs">
                  <Zap className="w-2 h-2 fill-slate-950 text-slate-950" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">EV Scooty AI Assistant</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Electric Two-Wheeler Advisor &amp; Analytics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Restart conversation"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore window size' : 'Expand window'}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 selection:bg-blue-600 selection:text-white">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 relative">
                    <Motorbike className="w-3.5 h-3.5 text-white" />
                    <Zap className="w-2 h-2 text-amber-300 fill-amber-300 absolute -top-0.5 -right-0.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all
                    ${msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                    }
                  `}
                >
                  <div className="space-y-1">
                    {renderFormattedText(msg.content)}
                  </div>

                  {/* Quick Action Navigation Buttons inside Model Responses */}
                  {msg.role === 'model' && msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {msg.actions.map((act) => {
                        const { label, icon: ActionIcon, color } = getActionDetails(act);
                        return (
                          <button
                            key={act}
                            onClick={() => handleActionClick(act)}
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs ${color}`}
                          >
                            <ActionIcon className="w-3.5 h-3.5" />
                            <span>{label}</span>
                            <ChevronRight className="w-3 h-3 opacity-60" />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Metadata and Copy Button */}
                  <div className={`mt-1.5 flex items-center justify-between text-[10px] ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                    <span>{msg.timestamp}</span>
                    {msg.role === 'model' && (
                      <button
                        onClick={() => handleCopyText(msg.id, msg.content)}
                        className="p-1 hover:text-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
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
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 relative">
                  <Motorbike className="w-3.5 h-3.5 text-white animate-pulse" />
                  <Zap className="w-2 h-2 text-amber-300 fill-amber-300 absolute -top-0.5 -right-0.5 animate-bounce" />
                </div>
                <div className="bg-white text-slate-600 border border-slate-200 rounded-2xl rounded-bl-xs px-4 py-3 text-sm shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-xs text-slate-500 ml-1">Analyzing Pakistani EV data...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          <div className="bg-white border-t border-slate-100 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0 pl-1">Suggested:</span>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q.query)}
                disabled={isLoading}
                className="text-xs shrink-0 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 hover:border-blue-300 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
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
              className="flex-1 bg-slate-50 text-slate-900 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
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
