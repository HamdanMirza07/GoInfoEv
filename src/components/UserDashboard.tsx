import React, { useState, useEffect } from 'react';
import { 
  User, 
  Zap, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  LogOut, 
  RefreshCw, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Calculator, 
  Sparkles, 
  Sun, 
  BatteryCharging, 
  TrendingUp, 
  Fuel, 
  Bike,
  Activity,
  History,
  Phone,
  Mail,
  Copy,
  Check
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { TabType } from './Navbar';
import { formatPKR } from '../data/evModels';

interface UserDashboardProps {
  onNavigate: (tab: TabType) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate }) => {
  const { 
    user, 
    isSubscriber, 
    isPending, 
    isDisallowed, 
    freeUsesCount, 
    maxFreeUses, 
    remainingUses, 
    openSubscriptionModal, 
    refreshStatus, 
    logout 
  } = useSubscription();

  const [copiedId, setCopiedId] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshStatus();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshStatus();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const toolStatsList = [
    { name: 'Range & Speed Estimator', tab: 'range' as TabType, icon: <Zap className="w-4 h-4 text-blue-500" />, desc: 'Real-world speed & AC impact' },
    { name: 'Charging Cost & WAPDA Slabs', tab: 'charging' as TabType, icon: <Fuel className="w-4 h-4 text-emerald-500" />, desc: 'Time-of-Use slabs & monthly bill' },
    { name: 'Battery Health & SOH Tracker', tab: 'battery' as TabType, icon: <BatteryCharging className="w-4 h-4 text-amber-500" />, desc: 'Degradation curve & lifespan' },
    { name: 'EV vs Petrol Fuel Savings', tab: 'savings' as TabType, icon: <TrendingUp className="w-4 h-4 text-indigo-500" />, desc: 'Payback period & annual savings' },
    { name: 'Solar Net Metering Sizing', tab: 'solar' as TabType, icon: <Sun className="w-4 h-4 text-amber-500" />, desc: 'Zero-cost charging setup' },
    { name: 'Rider & Delivery Profit', tab: 'rider' as TabType, icon: <Bike className="w-4 h-4 text-rose-500" />, desc: 'Bykea, Foodpanda, Yango ROI' },
  ];

  // If user is not signed in
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-8 animate-fadeIn">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-blue-100 text-blue-700 shadow-xs">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            User Account &amp; Usage Dashboard
          </h1>
          <p className="text-slate-600 max-w-lg mx-auto text-sm leading-relaxed">
            Track your calculator usage, subscription access status, payment verification history, and unlocked tools in one place.
          </p>
        </div>

        {/* Guest Usage Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">Current Session</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Guest Visitor
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">Free Trial Usage Status</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openSubscriptionModal('auth')}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Login or Register</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500 block">Total Suite Uses Combined</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {freeUsesCount} <span className="text-sm font-normal text-slate-400">/ {maxFreeUses} Total</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (freeUsesCount / maxFreeUses) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Shared pool (not 7 per tool)</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500 block">Calculations Remaining</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {remainingUses}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {remainingUses === 0 ? 'Quota exhausted across all tools. Upgrade to unlock.' : 'Combined quota for any of the 7 EV tools'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500 block">Unlimited VIP Access</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                Inactive
              </div>
              <button
                onClick={() => openSubscriptionModal('pay')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 underline mt-1 block cursor-pointer"
              >
                Upgrade for PKR 499/mo &rarr;
              </button>
            </div>
          </div>

          {/* Quick Sign-in Callout */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="font-black text-slate-900 text-sm">Save your calculations and access VIP Pro</div>
              <p className="text-xs text-slate-600">
                Sign in with your Pakistani phone number (e.g. 0300-1234567) or email to track your payment requests and unlimited calculator usage.
              </p>
            </div>
            <button
              onClick={() => openSubscriptionModal('auth')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
            >
              Sign In Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Signed in User View
  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6 animate-fadeIn">
      {/* Header Profile Bar */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl text-white shadow-sm shrink-0 ${
            isSubscriber 
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
              : isPending 
              ? 'bg-amber-500' 
              : 'bg-blue-600'
          }`}>
            <User className="w-7 h-7" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {user.name || 'EV Member'}
              </h1>
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                isSubscriber 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : isPending 
                  ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                  : isDisallowed
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-blue-100 text-blue-900 border border-blue-300'
              }`}>
                {isSubscriber && <ShieldCheck className="w-3.5 h-3.5" />}
                {isPending && <Clock className="w-3.5 h-3.5" />}
                {isSubscriber ? 'VIP Pro Active' : isPending ? 'Verification Pending' : isDisallowed ? 'Access Disallowed' : 'Free Trial Tier'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 font-mono">
                {user.authType === 'phone' ? <Phone className="w-3 h-3 text-slate-400" /> : <Mail className="w-3 h-3 text-slate-400" />}
                {user.identifier}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3 h-3" />
                Joined {new Date(user.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            title="Refresh Account Status"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          
          <button
            onClick={logout}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Subscription Status Notification Banners */}
      {isPending && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-extrabold text-sm">Payment Verification In Progress</div>
              <p className="text-xs text-amber-800 mt-0.5">
                Admin is verifying your Transaction ID <span className="font-mono font-bold bg-amber-200/80 px-1.5 py-0.2 rounded">({user.trxId})</span> via EasyPaisa/JazzCash/Bank statement. Once verified, all 7 calculators will be unlocked.
              </p>
            </div>
          </div>
          <button
            onClick={() => openSubscriptionModal('pay')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer"
          >
            Update TRX ID
          </button>
        </div>
      )}

      {isDisallowed && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-extrabold text-sm">Subscription Disallowed</div>
              <p className="text-xs text-rose-800 mt-0.5">
                Reason: <span className="font-bold">{user.disallowedReason || 'TRX ID not found in bank statement'}</span>. Please submit a valid transaction receipt.
              </p>
            </div>
          </div>
          <button
            onClick={() => openSubscriptionModal('pay')}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 cursor-pointer"
          >
            Re-submit Payment
          </button>
        </div>
      )}

      {isSubscriber && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-sm flex items-center gap-2">
                <span>VIP Pro Member - All Tools Unlocked</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                  {user.plan === 'annual' ? 'Annual Plan' : 'Monthly Plan'}
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                Enjoy unlimited computations for all 15 Pakistani EV models with zero locks or cooldowns.
              </p>
            </div>
          </div>
          <div className="text-xs font-mono font-bold text-emerald-800 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200">
            TRX: {user.trxId || 'DIRECT'}
          </div>
        </div>
      )}

      {/* Usage Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Calculator Usage (All Tools)</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {isSubscriber ? 'Unlimited' : `${freeUsesCount} / ${maxFreeUses} Total`}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isSubscriber ? 'VIP Pro unlimited calculations' : `${remainingUses} free runs left across all tools`}
          </p>
          {!isSubscriber && (
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (freeUsesCount / maxFreeUses) * 100)}%` }}
              />
            </div>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Subscription Plan</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-black text-slate-900 mt-2 truncate">
            {user.planName || (isSubscriber ? 'VIP Pro Unlimited' : 'Free Trial')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {user.amount ? `PKR ${formatPKR(user.amount)} paid` : 'Free Tier'}
          </p>
          {!isSubscriber && (
            <button
              onClick={() => openSubscriptionModal('pay')}
              className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 underline block cursor-pointer"
            >
              Upgrade for PKR 499 &rarr;
            </button>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Payment Channel</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-lg font-black text-slate-900 mt-2 capitalize">
            {user.paymentMethod || 'Not Linked'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {user.trxId ? `TID: ${user.trxId}` : 'No transaction yet'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Calculators Unlocked</span>
            <Calculator className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            6 / 6 Tools
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isSubscriber ? 'Unrestricted full access' : remainingUses > 0 ? 'Trial access active' : 'Locked (Requires VIP)'}
          </p>
        </div>
      </div>

      {/* Two Column Layout: Calculator Quick Access & Recent Usage History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Direct Calculator Launch */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Your EV Calculators &amp; Analysis Tools</h2>
              <p className="text-xs text-slate-500">Instant access to Pakistan-specific EV calculations</p>
            </div>
            {!isSubscriber && (
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl">
                {remainingUses} Free Left
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {toolStatsList.map((tool) => (
              <button
                key={tool.tab}
                onClick={() => onNavigate(tool.tab)}
                className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-all group flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                    {tool.icon}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors">
                      {tool.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {tool.desc}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Usage History Logs */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-600" />
              <h2 className="text-base font-black text-slate-900">Activity History</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {user.usageLogs?.length || 0} Runs
            </span>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {(!user.usageLogs || user.usageLogs.length === 0) ? (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <Calculator className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">No calculator runs logged yet for this account.</p>
                <p className="text-[11px] text-slate-400">Run any of the 6 tools to see your usage activity here.</p>
              </div>
            ) : (
              user.usageLogs.map((log, idx) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-800 truncate max-w-[160px]">
                        {log.toolName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                    Run
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => openSubscriptionModal('pay')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{isSubscriber ? 'Manage Plan' : 'Upgrade to VIP Pro'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
