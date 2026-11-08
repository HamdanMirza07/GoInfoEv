import React, { useEffect } from 'react';
import { 
  Zap, 
  Lock, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  CreditCard,
  RotateCcw,
  LogIn,
  CheckCircle2
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

interface CalculatorGuardProps {
  toolName: string;
  toolUrduName?: string;
  children: React.ReactNode;
}

export const CalculatorGuard: React.FC<CalculatorGuardProps> = ({ 
  toolName, 
  toolUrduName, 
  children 
}) => {
  const { 
    user, 
    freeUsesCount, 
    maxFreeUses, 
    remainingUses, 
    isSubscriber, 
    isPending, 
    isDisallowed, 
    isLocked, 
    recordCalculatorUse, 
    openSubscriptionModal,
    resetFreeUsesForDemo,
    refreshStatus
  } = useSubscription();

  // Record usage when entering or viewing the calculator
  useEffect(() => {
    // Only record once per mount/visit
    recordCalculatorUse(toolName);
  }, [toolName]);

  return (
    <div className="space-y-4">
      {/* ───────────────────────────────────────────────────────────
          TOP NOTIFICATION / STATUS STRIP
      ──────────────────────────────────────────────────────────── */}
      {isSubscriber ? (
        /* Subscriber Banner */
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-3 sm:px-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2 border border-emerald-500/30">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <span className="p-1.5 rounded-xl bg-white/20 text-white">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span>
              <strong>VIP Subscriber:</strong> Unlimited access active for <strong>{user?.name || user?.identifier}</strong>. All EV calculation engines unlocked!
            </span>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-emerald-100 uppercase tracking-wider">
            {user?.planName || 'Unlimited Pro'}
          </span>
        </div>
      ) : isPending ? (
        /* Pending Verification Banner */
        <div className="bg-amber-500 text-slate-950 p-3 sm:px-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2 border border-amber-400">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Clock className="w-4 h-4 text-slate-950 animate-pulse shrink-0" />
            <span>
              <strong>Subscription Pending Admin Verification:</strong> TRX ID: <code className="bg-black/10 px-1.5 py-0.5 rounded font-bold font-mono">{user?.trxId}</code>. Calculators will unlock once admin approves.
            </span>
          </div>
          <button
            onClick={refreshStatus}
            className="text-xs font-black bg-slate-900 text-white px-3 py-1 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Check Live Status
          </button>
        </div>
      ) : isDisallowed ? (
        /* Disallowed Banner */
        <div className="bg-rose-600 text-white p-3 sm:px-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Subscription Disallowed:</strong> {user?.disallowedReason || 'Payment verification failed.'}
            </span>
          </div>
          <button
            onClick={() => openSubscriptionModal('pay')}
            className="text-xs font-black bg-white text-rose-700 px-3 py-1 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
          >
            Resubmit Payment
          </button>
        </div>
      ) : (
        /* Free Trial Counter Meter */
        <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className={`p-2.5 rounded-xl text-white ${
              remainingUses === 0 ? 'bg-rose-600' : remainingUses <= 2 ? 'bg-amber-500' : 'bg-blue-600'
            }`}>
              <Zap className="w-4 h-4 fill-current" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Global Free Tier Quota
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  remainingUses === 0 
                    ? 'bg-rose-100 text-rose-700' 
                    : remainingUses <= 2 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {remainingUses === 0 ? '7/7 Uses Exhausted' : `${remainingUses} of ${maxFreeUses} Total Uses Remaining`}
                </span>
                <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-semibold border border-blue-100">
                  Shared across all tools
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Total 7 free uses for the entire suite (combined across all tools, not 7 per tool). You have used <strong className="text-slate-900 font-black">{freeUsesCount} of {maxFreeUses}</strong>.
                <span className="text-slate-400 ml-1.5 hidden sm:inline">• ہر ٹول الگ نہیں، تمام ٹولز ملا کر کل 7 فری یوزز ہیں</span>
              </p>
            </div>
          </div>

          {/* Usage indicators + Upgrade CTA */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* 7 dots indicator */}
            <div className="flex items-center gap-1">
              {Array.from({ length: maxFreeUses }).map((_, idx) => {
                const isUsed = idx < freeUsesCount;
                return (
                  <span
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      isUsed 
                        ? 'bg-rose-500 shadow-2xs' 
                        : 'bg-slate-200'
                    }`}
                    title={`Total Use ${idx + 1} of 7: ${isUsed ? 'Used' : 'Available'}`}
                  />
                );
              })}
            </div>

            <button
              onClick={() => openSubscriptionModal(user ? 'pay' : 'auth')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Get Unlimited Access</span>
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          PAYWALL LOCK SCREEN (When 7 free uses are reached)
      ──────────────────────────────────────────────────────────── */}
      {isLocked ? (
        <div className="bg-white border-2 border-dashed border-rose-300 rounded-3xl p-6 sm:p-10 text-center space-y-6 shadow-sm my-4 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-rose-100/50 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-blue-100/50 rounded-full blur-2xl pointer-events-none" />

          {/* Lock Icon */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/20">
              <Lock className="w-8 h-8" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-slate-950 font-black text-[10px]">
              7/7
            </div>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Free Usage Limit Reached (7/7 Total Uses)
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Aap ke platform-wide 7 free tool uses (tamam calculators mila kar) mukammal ho chuke hain. Har tool ke liye alag 7 dafa nahi, balkay poori website ke liye kul 7 free uses thay. <strong>{toolName}</strong> aur baqi tamam calculators bila kisi rukawat ke istemal karne ke liye subscription hasil karein.
            </p>
          </div>

          {/* Value highlights */}
          <div className="max-w-lg mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-left bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Unlimited calculations 24/7</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All 7 EV Calculators unlocked</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>EasyPaisa & JazzCash support</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Instant Admin approval workflow</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
            <button
              onClick={() => openSubscriptionModal(user ? 'pay' : 'auth')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>{user ? 'Choose Subscription Plan' : 'Sign In / Register with Phone'}</span>
            </button>

            {/* Demo Reset button for convenient testing */}
            <button
              onClick={resetFreeUsesForDemo}
              className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              title="Reset free trial counter back to 0 for demo purposes"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset 7 Free Uses (Demo)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Render calculator content normally */
        <div>{children}</div>
      )}
    </div>
  );
};
