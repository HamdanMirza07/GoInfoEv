import React, { useState } from 'react';
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Check,
  RefreshCw,
  LogIn,
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

interface PhoneSignInProps {
  onSuccess?: () => void;
  submitLabel?: string;
}

export const PhoneSignIn: React.FC<PhoneSignInProps> = ({
  onSuccess,
  submitLabel = 'Sign In with Phone',
}) => {
  const { signInOrRegister } = useSubscription();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only digits, +, -, and spaces (strictly block @ or email characters)
    const filtered = e.target.value.replace(/[^0-9+\-\s]/g, '');
    setPhone(filtered);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 10 || cleanDigits.length > 15) {
      setError('Please enter a valid Pakistani mobile phone number (e.g. 03001234567).');
      return;
    }

    if (!password.trim() || password.trim().length < 4) {
      setError('Please enter your password (minimum 4 characters).');
      return;
    }

    setLoading(true);
    const res = await signInOrRegister(cleanDigits, undefined, 'phone', password.trim());
    setLoading(false);

    if (res.success) {
      setSuccess('Signed in successfully with your phone number.');
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    } else {
      const msg = res.error || 'Invalid phone number or password.';
      if (msg.includes('Unexpected token') || msg.includes('not valid JSON')) {
        setError('Could not verify credentials. Please check your phone number and password.');
      } else {
        setError(msg);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Header badge — Phone-Only Security Notice */}
      <div className="p-3.5 rounded-2xl bg-[#F5F8F6] border border-emerald-500/25 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#071B2B] text-[#16A36A] shrink-0 shadow-2xs">
          <Phone className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-extrabold text-[#071B2B] flex items-center gap-1.5">
            <span>Secure Mobile Phone Sign In</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16A36A]/15 text-[#16A36A]">
              Phone Only
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Enter your mobile phone number and password to sign in securely.
          </p>
        </div>
      </div>

      {/* 1. Phone Number Input (Exclusively Phone) */}
      <div>
        <label
          htmlFor="goinfoev-phone-input"
          className="block text-xs font-bold text-[#071B2B] mb-1.5"
        >
          Mobile Phone Number <span className="text-rose-600">*</span>
        </label>
        <div className="relative">
          <Phone className="w-4 h-4 text-[#16A36A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="goinfoev-phone-input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder="0300-1234567"
            value={phone}
            onChange={handlePhoneChange}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#F5F8F6]/60 text-xs font-semibold text-[#071B2B] placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#16A36A] focus:border-[#16A36A] focus:outline-none transition-all font-mono"
          />
        </div>
      </div>

      {/* 2. Password Input */}
      <div>
        <label
          htmlFor="goinfoev-password-input"
          className="block text-xs font-bold text-[#071B2B] mb-1.5"
        >
          Password <span className="text-rose-600">*</span>
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-[#16A36A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="goinfoev-password-input"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            minLength={4}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-[#F5F8F6]/60 text-xs font-semibold text-[#071B2B] placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#16A36A] focus:border-[#16A36A] focus:outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#071B2B] cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 shrink-0 text-[#16A36A]" />
          <span>{success}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[#16A36A] hover:bg-[#138e5b] text-white font-extrabold text-xs shadow-md shadow-emerald-900/15 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Verifying Phone &amp; Password...</span>
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            <span>{submitLabel}</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-[#16A36A]" />
        <span>SHA-256 / Scrypt Encrypted Phone Authentication</span>
      </div>
    </form>
  );
};
