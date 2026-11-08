import React, { useState, useEffect } from 'react';
import { 
  X, 
  Zap, 
  ShieldCheck, 
  CreditCard, 
  Phone, 
  Mail, 
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
    signInOrRegister, 
    submitSubscriptionRequest,
    refreshStatus,
    logout
  } = useSubscription();

  const [activeTab, setActiveTab] = useState<'auth' | 'pay' | 'status'>('pay');
  const [authType, setAuthType] = useState<'phone' | 'email'>('phone');
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Payment configuration loaded from server
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);

  // Payment form states
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'easypaisa' | 'jazzcash' | 'bank'>('easypaisa');
  const [trxId, setTrxId] = useState('');
  const [notes, setNotes] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (modalOpen) {
      // Fetch dynamic payment configuration from server
      fetch('/api/payment-config')
        .then(res => res.json())
        .then(data => {
          if (data && typeof data === 'object') {
            setPaymentConfig(data);
          }
        })
        .catch(err => console.error('Failed to load payment config', err));

      if (isSubscriber || isPending || isDisallowed) {
        setActiveTab('status');
      } else if (!user) {
        setActiveTab(modalInitialTab === 'auth' ? 'auth' : 'pay');
      } else {
        setActiveTab('pay');
      }
      setPayError('');
      setAuthError('');
    }
  }, [modalOpen, user, isSubscriber, isPending, isDisallowed, modalInitialTab]);

  if (!modalOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    if (!identifier.trim()) {
      setAuthError('Please enter your phone number or email address.');
      setAuthLoading(false);
      return;
    }

    const res = await signInOrRegister(identifier, name, authType, password);
    setAuthLoading(false);

    if (res.success) {
      setAuthSuccess('Welcome! Account verified successfully.');
      setTimeout(() => {
        setActiveTab('pay');
      }, 700);
    } else {
      setAuthError(res.error || 'Could not sign in');
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <button
            onClick={closeSubscriptionModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-amber-300 text-xs font-bold backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 fill-amber-300" />
              <span>goinfoEV Pakistan VIP Access</span>
            </span>
            {user && (
              <span className="text-xs text-blue-200 font-medium truncate max-w-[150px]">
                • {user.name}
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Pakistan EV Calculators Pro
          </h3>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 leading-relaxed">
            Free visitors get <strong>7 total free tool uses</strong> combined across all tools (har tool ke 7 alag nahi, kul 7 free uses). Subscribe for unlimited VIP access to all 7 professional EV calculation engines.
          </p>

          {/* Usage status strip */}
          <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-white/80">Total Suite Quota:</span>
              <span className={`font-black px-2 py-0.5 rounded-md ${
                isSubscriber 
                  ? 'bg-emerald-500 text-white' 
                  : remainingUses === 0 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-amber-400 text-slate-950'
              }`}>
                {isSubscriber ? 'Unlimited VIP' : `${freeUsesCount} / ${maxFreeUses} Total Uses Used (${remainingUses} Left Across All Tools)`}
              </span>
            </div>
            {user && (
              <button
                onClick={logout}
                className="text-xs text-blue-200 hover:text-white flex items-center gap-1 cursor-pointer underline"
              >
                <LogOut className="w-3 h-3" />
                <span>Switch Account</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-6 pt-2">
          {!isSubscriber && !isPending && (
            <button
              onClick={() => setActiveTab('pay')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'pay'
                  ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>1. Plans & Payment</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('auth')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'auth'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>{user ? 'Account Profile' : 'Sign In / Register'}</span>
          </button>

          {(user?.trxId || isPending || isSubscriber || isDisallowed) && (
            <button
              onClick={() => setActiveTab('status')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'status'
                  ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Status & Access</span>
            </button>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: PLANS & PAKISTAN PAYMENT */}
          {activeTab === 'pay' && (
            <div className="space-y-5">
              {/* Step 1: Choose Subscription Plan */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  1. Select Your Subscription Plan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Monthly Plan */}
                  <div
                    onClick={() => setSelectedPlan('monthly')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPlan === 'monthly'
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">Monthly Pass</h4>
                        <p className="text-xs text-slate-500 mt-0.5">30 Days Unlimited Access</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === 'monthly' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {selectedPlan === 'monthly' && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-2xl font-black text-slate-900">PKR 499</span>
                      <span className="text-xs text-slate-500"> / month</span>
                    </div>
                  </div>

                  {/* Annual Plan */}
                  <div
                    onClick={() => setSelectedPlan('annual')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${
                      selectedPlan === 'annual'
                        ? 'border-purple-600 bg-purple-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black tracking-wide">
                      SAVE 58%
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">Annual Pro Suite</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Full Year VIP Unlimited</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-2xl font-black text-slate-900">PKR 2,499</span>
                      <span className="text-xs text-slate-500"> / year</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Payment Details (Pakistan Methods) */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  2. Choose Payment Method (Send PKR {selectedPlan === 'annual' ? '2,499' : '499'})
                </label>

                {/* Method selector pills */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('easypaisa')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      paymentMethod === 'easypaisa'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <span className="text-base">🟢</span>
                    <span>EasyPaisa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('jazzcash')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      paymentMethod === 'jazzcash'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <span className="text-base">🔴</span>
                    <span>JazzCash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      paymentMethod === 'bank'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mt-0.5" />
                    <span>Meezan Bank</span>
                  </button>
                </div>

                {/* Method Details Box */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5 text-xs shadow-inner">
                  {paymentMethod === 'easypaisa' && (
                    <>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <span className="text-slate-400">EasyPaisa Account Number:</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-emerald-400 text-sm">
                          <span>{paymentConfig?.easypaisa?.number || '0300-7394000'}</span>
                          <button
                            onClick={() => handleCopy(paymentConfig?.easypaisa?.number?.replace(/\D/g, '') || '03007394000', 'ep-no')}
                            className="p-1 hover:bg-slate-800 rounded cursor-pointer"
                            title="Copy number"
                          >
                            {copiedKey === 'ep-no' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Account Title:</span>
                        <span className="font-bold text-white">{paymentConfig?.easypaisa?.title || 'goinfoEV / Hamdan Mirza'}</span>
                      </div>
                      {paymentConfig?.easypaisa?.instructions && (
                        <div className="text-[11px] text-emerald-300/80 pt-1">
                          {paymentConfig.easypaisa.instructions}
                        </div>
                      )}
                    </>
                  )}

                  {paymentMethod === 'jazzcash' && (
                    <>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <span className="text-slate-400">JazzCash Mobile Account:</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-rose-400 text-sm">
                          <span>{paymentConfig?.jazzcash?.number || '0300-7394000'}</span>
                          <button
                            onClick={() => handleCopy(paymentConfig?.jazzcash?.number?.replace(/\D/g, '') || '03007394000', 'jc-no')}
                            className="p-1 hover:bg-slate-800 rounded cursor-pointer"
                            title="Copy number"
                          >
                            {copiedKey === 'jc-no' ? <Check className="w-3.5 h-3.5 text-rose-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Account Title:</span>
                        <span className="font-bold text-white">{paymentConfig?.jazzcash?.title || 'goinfoEV / Hamdan Mirza'}</span>
                      </div>
                      {paymentConfig?.jazzcash?.instructions && (
                        <div className="text-[11px] text-rose-300/80 pt-1">
                          {paymentConfig.jazzcash.instructions}
                        </div>
                      )}
                    </>
                  )}

                  {paymentMethod === 'bank' && (
                    <>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <span className="text-slate-400">Bank Name:</span>
                        <span className="font-bold text-white">{paymentConfig?.bank?.bankName || 'Meezan Bank Ltd. (Raast Supported)'}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <span className="text-slate-400">Account / Raast ID:</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-indigo-300 text-xs">
                          <span>{paymentConfig?.bank?.accountNumber || '0102-0109283741'}</span>
                          <button
                            onClick={() => handleCopy(paymentConfig?.bank?.accountNumber || '0102-0109283741', 'acc-no')}
                            className="p-1 hover:bg-slate-800 rounded cursor-pointer"
                            title="Copy Account"
                          >
                            {copiedKey === 'acc-no' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                          </button>
                        </div>
                      </div>
                      {paymentConfig?.bank?.iban && (
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <span className="text-slate-400">IBAN:</span>
                          <div className="flex items-center gap-1 font-mono font-bold text-indigo-300 text-xs">
                            <span>{paymentConfig.bank.iban}</span>
                            <button
                              onClick={() => handleCopy(paymentConfig.bank.iban!, 'iban')}
                              className="p-1 hover:bg-slate-800 rounded cursor-pointer"
                              title="Copy IBAN"
                            >
                              {copiedKey === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Title:</span>
                        <span className="font-bold text-white">{paymentConfig?.bank?.title || 'goinfoEV Pakistan'}</span>
                      </div>
                      {paymentConfig?.bank?.instructions && (
                        <div className="text-[11px] text-indigo-300/80 pt-1">
                          {paymentConfig.bank.instructions}
                        </div>
                      )}
                    </>
                  )}

                  <div className="pt-2 text-[11px] text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Send exact amount, copy the TRX ID from SMS/Receipt, and paste it below.</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Submission Form */}
              {!user ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    <span>Please sign in first with Phone or Email to link your subscription.</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('auth')}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Sign In or Register Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePaySubmit} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Transaction ID (TRX ID / Reference Number) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EP-98241034 or JC-8291032 or Bank Ref"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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

          {/* TAB 2: AUTHENTICATION (PHONE OR EMAIL) */}
          {activeTab === 'auth' && (
            <div className="space-y-4">
              {user ? (
                /* Already Signed In Profile */
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">{user.name}</h4>
                      <p className="text-xs text-slate-500">{user.identifier} ({user.authType.toUpperCase()})</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200">
                    <div>
                      <span className="text-slate-500 block">Subscription Status:</span>
                      <span className={`font-black uppercase ${
                        isSubscriber ? 'text-emerald-600' : isPending ? 'text-amber-600' : 'text-slate-700'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Calculators Access:</span>
                      <span className="font-bold text-slate-900">
                        {isSubscriber ? 'Unlimited VIP' : `${freeUsesCount}/7 Total Free Uses (Shared Across All Tools)`}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setActiveTab('pay')}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
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
                /* Sign In / Sign Up Form */
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div>
                    <span className="block text-xs font-bold text-slate-700 mb-1.5">Sign In / Register using:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAuthType('phone')}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          authType === 'phone'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Phone Number</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthType('email')}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          authType === 'email'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email Address</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {authType === 'phone' ? 'Pakistani Mobile Number *' : 'Email Address *'}
                    </label>
                    <input
                      type={authType === 'phone' ? 'tel' : 'email'}
                      required
                      placeholder={authType === 'phone' ? '0300-1234567 or 03211234567' : 'name@gmail.com'}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tariq Mehmood"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password or PIN (Optional)
                    </label>
                    <input
                      type="password"
                      placeholder="4-digit PIN or password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {authSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{authSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {authLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                    <span>Continue with {authType === 'phone' ? 'Phone' : 'Email'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: LIVE STATUS & SUBSCRIPTION DETAILS */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              {isSubscriber && (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-extrabold text-emerald-900">
                    Unlimited Pro Access Active!
                  </h4>
                  <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                    Aap ki subscription admin ne approve kar di hai. Aap tamam 7 EV calculators aur interactive tools bila kisi rukawat ke unlimited istemal kar sakte hain.
                  </p>
                  <div className="p-3 rounded-xl bg-white border border-emerald-200 text-xs text-slate-700 inline-block text-left space-y-1">
                    <p><strong>Plan:</strong> {user?.planName || 'Unlimited Pro'}</p>
                    {user?.trxId && <p><strong>TRX ID:</strong> <span className="font-mono">{user.trxId}</span></p>}
                    <p><strong>Status:</strong> <span className="text-emerald-600 font-bold">Approved / Active</span></p>
                  </div>
                </div>
              )}

              {isPending && (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md animate-pulse">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-extrabold text-amber-900">
                    Subscription Request Submitted (Pending Approval)
                  </h4>
                  <p className="text-xs text-amber-800 max-w-md mx-auto leading-relaxed">
                    Shukriya! Aap ka payment reference (TRX ID) receive ho gaya hai. Admin dashboard me verify hote hi aap ka access foran unlock ho jaye ga.
                  </p>
                  <div className="p-3 rounded-xl bg-white border border-amber-200 text-xs text-slate-700 inline-block text-left space-y-1">
                    <p><strong>User:</strong> {user?.name} ({user?.identifier})</p>
                    <p><strong>Plan:</strong> {user?.planName || 'Monthly Pass'}</p>
                    <p><strong>TRX ID:</strong> <span className="font-mono font-bold text-blue-600">{user?.trxId}</span></p>
                    <p><strong>Status:</strong> <span className="text-amber-600 font-bold">Pending Admin Verification</span></p>
                  </div>
                  <div>
                    <button
                      onClick={refreshStatus}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
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
        <div className="p-3 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Pakistani Raast & EasyPaisa Security</span>
          </span>
          <button
            onClick={closeSubscriptionModal}
            className="text-slate-600 font-bold hover:text-slate-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
