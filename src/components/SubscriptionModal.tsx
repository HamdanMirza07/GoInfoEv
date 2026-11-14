import React, { useState, useEffect } from 'react';
import { 
  X, 
  Zap, 
  ShieldCheck, 
  CreditCard, 
  Phone, 
  Copy, 
  Check, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Lock, 
  ArrowRight, 
  UserCheck, 
  Building2, 
  RefreshCw, 
  LogOut
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { PaymentConfig } from '../types/subscription';
import { PhoneSignIn } from './PhoneSignIn';

export const SubscriptionModal: React.FC = () => {
  const { 
    modalOpen, 
    closeSubscriptionModal, 
    modalInitialTab,
    user, 
    isSubscriber, 
    isPending, 
    isDisallowed,
    remainingUses, 
    freeUsesCount, 
    maxFreeUses,
    submitSubscriptionRequest,
    refreshStatus,
    logout
  } = useSubscription();

  const [activeTab, setActiveTab] = useState<'auth' | 'pay' | 'status'>('pay');

  // Payment configuration loaded from server
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);

  // Payment form states
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'easypaisa' | 'jazzcash' | 'bank'>('easypaisa');
  const [trxId, setTrxId] = useState('');
  const [notes, setNotes] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');
  const [, setPaySuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (modalOpen) {
      // Fetch dynamic payment configuration from server safely
      fetch('/api/payment-config')
        .then(async (res) => {
          const isJson = res.headers.get('content-type')?.includes('application/json');
          if (res.ok && isJson) {
            return res.json();
          }
          return null;
        })
        .then((data) => {
          if (data && typeof data === 'object') {
            setPaymentConfig(data);
          }
        })
        .catch(() => {
          // Use default fallback values in UI
        });

      if (isSubscriber || isPending || isDisallowed) {
        setActiveTab('status');
      } else if (!user) {
        setActiveTab(modalInitialTab === 'auth' ? 'auth' : 'pay');
      } else {
        setActiveTab('pay');
      }
      setPayError('');
    }
  }, [modalOpen, user, isSubscriber, isPending, isDisallowed, modalInitialTab]);

  if (!modalOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayLoading(true);
    setPayError('');

    if (!trxId.trim()) {
      setPayError('Please provide the Transaction ID (TRX ID) from your EasyPaisa, JazzCash, or Bank app receipt.');
      setPayLoading(false);
      return;
    }

    const res = await submitSubscriptionRequest({
      plan: selectedPlan,
      paymentMethod,
      trxId: trxId.trim(),
      notes: notes.trim()
    });

    setPayLoading(false);
    if (res.success) {
      setPaySuccess(true);
      setActiveTab('status');
    } else {
      setPayError(res.error || 'Failed to submit payment request. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#071B2B]/80 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-500/20 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner — Official goinfoEV Navy & Emerald Theme */}
        <div className="bg-gradient-to-r from-[#071B2B] via-[#0F2942] to-[#172B3A] text-white p-5 sm:p-6 relative overflow-hidden border-b border-emerald-500/25">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#16A36A]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-16 -top-10 w-28 h-28 bg-[#F0B429]/15 rounded-full blur-2xl pointer-events-none" />
          
          <button
            onClick={closeSubscriptionModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16A36A]/25 border border-[#16A36A]/40 text-[#F0B429] text-xs font-bold backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 fill-[#F0B429] text-[#F0B429]" />
              <span>goinfoEV Pakistan VIP Access</span>
            </span>
            {user && (
              <span className="text-xs text-emerald-300 font-semibold truncate max-w-[160px]">
                • {user.name}
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Pakistan EV Calculators Pro
          </h3>
          <p className="text-slate-200 text-xs sm:text-sm mt-1 leading-relaxed">
            Free visitors get <strong className="text-[#F0B429]">7 total free tool uses</strong> combined across all tools (har tool ke 7 alag nahi, kul 7 free uses). Subscribe for unlimited VIP access to all 7 professional EV calculation engines.
          </p>

          {/* Usage status strip */}
          <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-300">Total Suite Quota:</span>
              <span className={`font-black px-2.5 py-0.5 rounded-md ${
                isSubscriber 
                  ? 'bg-[#16A36A] text-white' 
                  : remainingUses === 0 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-[#F0B429] text-[#071B2B]'
              }`}>
                {isSubscriber ? 'Unlimited VIP' : `${freeUsesCount} / ${maxFreeUses} Total Uses Used (${remainingUses} Left Across All Tools)`}
              </span>
            </div>
            {user && (
              <button
                onClick={logout}
                className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 cursor-pointer underline"
              >
                <LogOut className="w-3 h-3" />
                <span>Switch Account</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-[#F5F8F6] px-3 sm:px-6 pt-2">
          {!isSubscriber && !isPending && (
            <button
              onClick={() => setActiveTab('pay')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'pay'
                  ? 'border-[#16A36A] text-[#071B2B] bg-white rounded-t-xl shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-[#071B2B]'
              }`}
            >
              <CreditCard className={`w-4 h-4 ${activeTab === 'pay' ? 'text-[#16A36A]' : ''}`} />
              <span>1. Plans &amp; Payment</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('auth')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'auth'
                ? 'border-[#16A36A] text-[#071B2B] bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-[#071B2B]'
            }`}
          >
            <Phone className={`w-4 h-4 ${activeTab === 'auth' ? 'text-[#16A36A]' : ''}`} />
            <span>{user ? 'Account Profile' : 'Sign In'}</span>
          </button>

          {(user?.trxId || isPending || isSubscriber || isDisallowed) && (
            <button
              onClick={() => setActiveTab('status')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'status'
                  ? 'border-[#16A36A] text-[#071B2B] bg-white rounded-t-xl shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-[#071B2B]'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${activeTab === 'status' ? 'text-[#16A36A]' : ''}`} />
              <span>Status &amp; Access</span>
            </button>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto bg-white">
          {/* TAB 1: PLANS & PAKISTAN PAYMENT */}
          {activeTab === 'pay' && (
            <div className="space-y-5">
              {/* Step 1: Choose Subscription Plan */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#071B2B] mb-2">
                  1. Select Your Subscription Plan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Monthly Plan */}
                  <div
                    onClick={() => setSelectedPlan('monthly')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPlan === 'monthly'
                        ? 'border-[#16A36A] bg-[#F5F8F6] shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-[#071B2B] text-sm">Monthly Pass</h4>
                        <p className="text-xs text-slate-500 mt-0.5">30 Days Unlimited Access</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === 'monthly' ? 'border-[#16A36A] bg-[#16A36A]' : 'border-slate-300'
                      }`}>
                        {selectedPlan === 'monthly' && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-2xl font-black text-[#071B2B]">
                        PKR {paymentConfig?.pricing?.monthlyPKR?.toLocaleString() || '499'}
                      </span>
                      <span className="text-xs text-slate-500"> / month</span>
                    </div>
                  </div>

                  {/* Annual Plan */}
                  <div
                    onClick={() => setSelectedPlan('annual')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${
                      selectedPlan === 'annual'
                        ? 'border-[#16A36A] bg-[#F5F8F6] shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#F0B429] text-[#071B2B] text-[10px] font-black tracking-wide">
                      SAVE 58%
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-[#071B2B] text-sm">Annual Pro Suite</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Full Year VIP Unlimited</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-2xl font-black text-[#071B2B]">
                        PKR {paymentConfig?.pricing?.annualPKR?.toLocaleString() || '2,499'}
                      </span>
                      <span className="text-xs text-slate-500"> / year</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Payment Details (Pakistan Methods) */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#071B2B] mb-2">
                  2. Choose Payment Method (Send PKR {selectedPlan === 'annual' ? (paymentConfig?.pricing?.annualPKR?.toLocaleString() || '2,499') : (paymentConfig?.pricing?.monthlyPKR?.toLocaleString() || '499')})
                </label>

                {/* Method selector pills */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('easypaisa')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      paymentMethod === 'easypaisa'
                        ? 'bg-[#16A36A] text-white border-[#16A36A] shadow-xs'
                        : 'bg-[#F5F8F6] text-[#071B2B] border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    <span className="text-base">🟢</span>
                    <span>EasyPaisa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('jazzcash')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      paymentMethod === 'jazzcash'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-[#F5F8F6] text-[#071B2B] border-slate-200 hover:bg-rose-50'
                    }`}
                  >
                    <span className="text-base">🔴</span>
                    <span>JazzCash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      paymentMethod === 'bank'
                        ? 'bg-[#071B2B] text-white border-[#071B2B] shadow-xs'
                        : 'bg-[#F5F8F6] text-[#071B2B] border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mt-0.5" />
                    <span>Meezan Bank</span>
                  </button>
                </div>

                {/* Method Details Box */}
                <div className="p-4 rounded-2xl bg-[#071B2B] text-white space-y-2.5 text-xs shadow-inner border border-emerald-500/20">
                  {paymentMethod === 'easypaisa' && (
                    <>
                      <div className="flex justify-between items-center pb-2 border-b border-white/10">
                        <span className="text-slate-300">EasyPaisa Account Number:</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-emerald-400 text-sm">
                          <span>{paymentConfig?.easypaisa?.number || '0300-7394000'}</span>
                          <button
                            onClick={() => handleCopy(paymentConfig?.easypaisa?.number?.replace(/\D/g, '') || '03007394000', 'ep-no')}
                            className="p-1 hover:bg-white/10 rounded cursor-pointer"
                            title="Copy number"
                          >
                            {copiedKey === 'ep-no' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Account Title:</span>
                        <span className="font-bold text-white">{paymentConfig?.easypaisa?.title || 'goinfoEV / Hamdan Mirza'}</span>
                      </div>
                      {paymentConfig?.easypaisa?.instructions && (
                        <div className="text-[11px] text-emerald-300/90 pt-1">
                          {paymentConfig.easypaisa.instructions}
                        </div>
                      )}
                    </>
                  )}

                  {paymentMethod === 'jazzcash' && (
                    <>
                      <div className="flex justify-between items-center pb-2 border-b border-white/10">
                        <span className="text-slate-300">JazzCash Mobile Account:</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-rose-400 text-sm">
                          <span>{paymentConfig?.jazzcash?.number || '0300-7394000'}</span>
                          <button
                            onClick={() => handleCopy(paymentConfig?.jazzcash?.number?.replace(/\D/g, '') || '03007394000', 'jc-no')}
                            className="p-1 hover:bg-white/10 rounded cursor-pointer"
                            title="Copy number"
                          >
                            {copiedKey === 'jc-no' ? <Check className="w-3.5 h-3.5 text-rose-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Account Title:</span>
                        <span className="font-bold text-white">{paymentConfig?.jazzcash?.title || 'goinfoEV / Hamdan Mirza'}</span>
                      </div>
                      {paymentConfig?.jazzcash?.instructions && (
                        <div className="text-[11px] text-rose-300/90 pt-1">
                          {paymentConfig.jazzcash.instructions}
                        </div>
                      )}
                    </>
                  )}

                  {paymentMethod === 'bank' && (
                    <>
                      <div className="flex justify-between items-center pb-2 border-b border-white/10">
                        <span className="text-slate-300">Bank Name:</span>
                        <span className="font-bold text-white">{paymentConfig?.bank?.bankName || 'Meezan Bank Ltd. (Raast Supported)'}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-white/10">
                        <span className="text-slate-300">Account / Raast ID:</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-emerald-400 text-xs">
                          <span>{paymentConfig?.bank?.accountNumber || '0102-0109283741'}</span>
                          <button
                            onClick={() => handleCopy(paymentConfig?.bank?.accountNumber || '0102-0109283741', 'acc-no')}
                            className="p-1 hover:bg-white/10 rounded cursor-pointer"
                            title="Copy Account"
                          >
                            {copiedKey === 'acc-no' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                          </button>
                        </div>
                      </div>
                      {paymentConfig?.bank?.iban && (
                        <div className="flex justify-between items-center pb-2 border-b border-white/10">
                          <span className="text-slate-300">IBAN:</span>
                          <div className="flex items-center gap-1 font-mono font-bold text-emerald-400 text-xs">
                            <span>{paymentConfig.bank.iban}</span>
                            <button
                              onClick={() => handleCopy(paymentConfig.bank.iban!, 'iban')}
                              className="p-1 hover:bg-white/10 rounded cursor-pointer"
                              title="Copy IBAN"
                            >
                              {copiedKey === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Title:</span>
                        <span className="font-bold text-white">{paymentConfig?.bank?.title || 'goinfoEV Pakistan'}</span>
                      </div>
                      {paymentConfig?.bank?.instructions && (
                        <div className="text-[11px] text-emerald-300/90 pt-1">
                          {paymentConfig.bank.instructions}
                        </div>
                      )}
                    </>
                  )}

                  <div className="pt-2 text-[11px] text-[#F0B429] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Send exact amount, copy the TRX ID from SMS/Receipt, and paste it below.</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Submission Form */}
              {!user ? (
                <div className="p-4 rounded-2xl bg-[#F5F8F6] border border-emerald-500/30 text-[#071B2B] space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <Phone className="w-4 h-4 text-[#16A36A]" />
                    <span>Please Sign In or Register with your Phone Number first to link your subscription.</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('auth')}
                    className="w-full py-2.5 rounded-xl bg-[#16A36A] hover:bg-[#138e5b] text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Sign In / Register with Phone</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePaySubmit} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-black text-[#071B2B] mb-1">
                      Transaction ID (TRX ID / Reference Number) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EP-98241034 or JC-8291032 or Bank Ref"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-[#16A36A] focus:border-[#16A36A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Sender Name / Phone or Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sent from 0301-XXXXXXX by Tariq"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#16A36A] focus:border-[#16A36A] focus:outline-none"
                    />
                  </div>

                  {payError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{payError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={payLoading}
                    className="w-full py-3 rounded-xl bg-[#16A36A] hover:bg-[#138e5b] text-white font-extrabold text-sm shadow-md shadow-emerald-900/15 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {payLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting to Admin...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Submit Subscription for Admin Approval</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: AUTHENTICATION (PHONE NUMBER ONLY — PHONE, NAME & PASSWORD REQUIRED) */}
          {activeTab === 'auth' && (
            <div className="space-y-4">
              {user ? (
                /* Already Signed In Profile */
                <div className="p-5 rounded-2xl bg-[#F5F8F6] border border-emerald-500/25 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#071B2B] text-[#F0B429] border border-emerald-500/30 flex items-center justify-center font-black text-lg shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#071B2B] text-base">{user.name}</h4>
                      <p className="text-xs text-slate-600 font-mono flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-[#16A36A]" />
                        <span>{user.identifier}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-200">
                    <div>
                      <span className="text-slate-500 block">Subscription Status:</span>
                      <span className={`font-black uppercase ${
                        isSubscriber ? 'text-[#16A36A]' : isPending ? 'text-amber-600' : 'text-[#071B2B]'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Calculators Access:</span>
                      <span className="font-bold text-[#071B2B]">
                        {isSubscriber ? 'Unlimited VIP' : `${freeUsesCount}/7 Total Free Uses`}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setActiveTab('pay')}
                      className="flex-1 py-2.5 rounded-xl bg-[#16A36A] hover:bg-[#138e5b] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      {isSubscriber ? 'View Plans' : 'Upgrade Plan'}
                    </button>
                    <button
                      onClick={logout}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                /* Dedicated Phone + Password Sign In Component */
                <PhoneSignIn
                  onSuccess={() => setActiveTab('pay')}
                  submitLabel="Sign In with Phone"
                />
              )}
            </div>
          )}

          {/* TAB 3: LIVE STATUS & SUBSCRIPTION DETAILS */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              {isSubscriber && (
                <div className="p-5 rounded-2xl bg-[#F5F8F6] border border-emerald-300 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#16A36A] text-white flex items-center justify-center mx-auto shadow-md">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-extrabold text-[#071B2B]">
                    Unlimited Pro Access Active!
                  </h4>
                  <p className="text-xs text-slate-700 max-w-md mx-auto leading-relaxed">
                    Aap ki subscription admin ne approve kar di hai. Aap tamam 7 EV calculators aur interactive tools bila kisi rukawat ke unlimited istemal kar sakte hain.
                  </p>
                  <div className="p-3 rounded-xl bg-white border border-emerald-200 text-xs text-slate-700 inline-block text-left space-y-1">
                    <p><strong>Plan:</strong> {user?.planName || 'Unlimited Pro'}</p>
                    {user?.trxId && <p><strong>TRX ID:</strong> <span className="font-mono">{user.trxId}</span></p>}
                    <p><strong>Status:</strong> <span className="text-[#16A36A] font-bold">Approved / Active</span></p>
                  </div>
                </div>
              )}

              {isPending && (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#F0B429] text-[#071B2B] flex items-center justify-center mx-auto shadow-md animate-pulse">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-extrabold text-[#071B2B]">
                    Subscription Request Submitted (Pending Approval)
                  </h4>
                  <p className="text-xs text-amber-900 max-w-md mx-auto leading-relaxed">
                    Shukriya! Aap ka payment reference (TRX ID) receive ho gaya hai. Admin dashboard me verify hote hi aap ka access foran unlock ho jaye ga.
                  </p>
                  <div className="p-3 rounded-xl bg-white border border-amber-200 text-xs text-slate-700 inline-block text-left space-y-1">
                    <p><strong>User:</strong> {user?.name} ({user?.identifier})</p>
                    <p><strong>Plan:</strong> {user?.planName || 'Monthly Pass'}</p>
                    <p><strong>TRX ID:</strong> <span className="font-mono font-bold text-[#16A36A]">{user?.trxId}</span></p>
                    <p><strong>Status:</strong> <span className="text-amber-600 font-bold">Pending Admin Verification</span></p>
                  </div>
                  <div>
                    <button
                      onClick={refreshStatus}
                      className="px-4 py-2 rounded-xl bg-[#071B2B] hover:bg-[#172B3A] text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Check Live Approval Status</span>
                    </button>
                  </div>
                </div>
              )}

              {isDisallowed && (
                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-extrabold text-rose-900">
                    Subscription Disallowed by Admin
                  </h4>
                  <p className="text-xs text-rose-800 max-w-md mx-auto leading-relaxed">
                    {user?.disallowedReason || 'Payment verification failed. Please submit a valid transaction ID or contact support.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('pay')}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Resubmit Payment Details
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="p-3 sm:px-6 bg-[#F5F8F6] border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A36A]" />
            <span>Encrypted Pakistani Raast &amp; EasyPaisa Security</span>
          </span>
          <button
            onClick={closeSubscriptionModal}
            className="text-[#071B2B] font-bold hover:text-[#16A36A] cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
