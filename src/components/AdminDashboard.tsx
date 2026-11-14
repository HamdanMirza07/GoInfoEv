import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Search, 
  Filter, 
  RefreshCw, 
  Phone, 
  Mail, 
  CreditCard, 
  Copy, 
  Check, 
  Trash2, 
  PlusCircle, 
  Lock, 
  Unlock, 
  RotateCcw,
  Sparkles,
  ChevronDown,
  Settings,
  Building2,
  Save,
  MessageCircle,
  AlertCircle,
  FileSpreadsheet,
  Eye,
  EyeOff,
  KeyRound,
  ArrowLeft,
  Send
} from 'lucide-react';
import { UserSubscription, SubscriptionStats, PaymentConfig } from '../types/subscription';
import { AdminFleetManager } from './AdminFleetManager';
import { useCatalog } from '../context/CatalogContext';
import { ErrorBoundary } from './ErrorBoundary';
import {
  clearAdminToken,
  getAdminAuthHeaders,
  getAdminToken,
  getLocalRecoveryEmail,
  hasLocalAdminPasscode,
  saveLocalAdminPasscode,
  saveLocalRecoveryEmail,
  setAdminToken,
  verifyLocalAdminPasscode,
} from '../utils/authHeaders';
import { getLocalUsersDb, saveLocalUsersDb } from '../context/SubscriptionContext';

function computeStatsFromList(list: UserSubscription[]): SubscriptionStats {
  return {
    totalUsers: list.length,
    totalRequests: list.filter((s) => s.status !== 'free').length,
    pendingCount: list.filter((s) => s.status === 'pending').length,
    approvedCount: list.filter((s) => s.status === 'approved').length,
    disallowedCount: list.filter((s) => s.status === 'disallowed').length,
    totalRevenuePKR: list
      .filter((s) => s.status === 'approved')
      .reduce((sum, s) => sum + (s.amount || 499), 0),
  };
}

export const AdminDashboard: React.FC = () => {
  const { totalCount } = useCatalog();

  // Admin authentication state (verified against server HMAC session)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);
  const [adminPin, setAdminPin] = useState('');
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [pinError, setPinError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Forgot Passcode / Gmail OTP Recovery states
  const [authView, setAuthView] = useState<'login' | 'forgot' | 'reset'>('login');
  const [recoveryMaskedEmail, setRecoveryMaskedEmail] = useState('Ha******94@gmail.com');
  const [smtpConfigured, setSmtpConfigured] = useState<boolean | null>(null);
  const [recoveryEmailInput, setRecoveryEmailInput] = useState('');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [newPasscodeInput, setNewPasscodeInput] = useState('');
  const [confirmPasscodeInput, setConfirmPasscodeInput] = useState('');
  const [showNewPasscode, setShowNewPasscode] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryNotice, setRecoveryNotice] = useState('');
  const [smtpMissingHelp, setSmtpMissingHelp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Authenticated Admin Security Modal states
  const [hasCustomPasscode, setHasCustomPasscode] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [secCurrentPasscode, setSecCurrentPasscode] = useState('');
  const [secNewPasscode, setSecNewPasscode] = useState('');
  const [secConfirmPasscode, setSecConfirmPasscode] = useState('');
  const [secRecoveryEmail, setSecRecoveryEmail] = useState('');
  const [secSmtpConfigured, setSecSmtpConfigured] = useState(false);
  const [secLoading, setSecLoading] = useState(false);
  const [secError, setSecError] = useState('');
  const [secSuccess, setSecSuccess] = useState('');
  const [showSecPasscodes, setShowSecPasscodes] = useState(false);

  // Top Admin View Tab: 'fleet-csv' vs 'users' vs 'payment-settings'
  const [adminTab, setAdminTab] = useState<'fleet-csv' | 'users' | 'payment-settings'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get('subtab') || params.get('view');
      if (sub === 'users') return 'users';
      if (sub === 'payment' || sub === 'settings') return 'payment-settings';
    }
    return 'fleet-csv';
  });

  // Data states
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>({
    totalUsers: 0,
    totalRequests: 0,
    pendingCount: 0,
    approvedCount: 0,
    disallowedCount: 0,
    totalRevenuePKR: 0
  });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'disallowed'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Payment Settings Configuration state
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    easypaisa: {
      title: 'goinfoEV / Hamdan Mirza',
      number: '0300-7394000',
      instructions: 'Send exact amount via EasyPaisa App or USSD *786# and paste TRX ID here.',
      enabled: true
    },
    jazzcash: {
      title: 'goinfoEV / Hamdan Mirza',
      number: '0300-7394000',
      instructions: 'Send via JazzCash App or *786# mobile account, then copy the 12-digit TID.',
      enabled: true
    },
    bank: {
      bankName: 'Meezan Bank Ltd. (Raast Supported)',
      title: 'goinfoEV Pakistan',
      accountNumber: '0102-0109283741',
      iban: 'PK64MEZN0000123456789012',
      instructions: 'Transfer to Meezan Bank or send via Raast ID with instant confirmation.',
      enabled: true
    },
    pricing: {
      monthlyPKR: 499,
      annualPKR: 2499,
      maxFreeUses: 7
    },
    supportPhone: '0300-7394000',
    supportWhatsApp: '0300-7394000'
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Manual Add User Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserIdentifier, setNewUserIdentifier] = useState('');
  const [newUserPlan, setNewUserPlan] = useState<'monthly' | 'annual'>('monthly');
  const [newUserPaymentMethod, setNewUserPaymentMethod] = useState<'easypaisa' | 'jazzcash' | 'bank'>('easypaisa');
  const [newUserTrxId, setNewUserTrxId] = useState('');

  useEffect(() => {
    let active = true;
    const verifySession = async () => {
      const localConfigured = hasLocalAdminPasscode();
      try {
        const res = await fetch('/api/admin/session', {
          headers: getAdminAuthHeaders(),
          credentials: 'include',
        });
        const isJson = res.headers.get('content-type')?.includes('application/json');
        if (res.ok && isJson) {
          const data = await res.json();
          if (active) {
            const configured = Boolean(data.passcodeConfigured) || localConfigured;
            setHasCustomPasscode(configured);
            if (data.authenticated) {
              if (data.token) {
                setAdminToken(data.token);
              }
              setIsAuthenticated(true);
              setCheckingSession(false);
              return;
            }
            if (!configured) {
              setAdminToken('local-admin-session');
              setIsAuthenticated(true);
              setCheckingSession(false);
              return;
            }
          }
        } else if (!isJson) {
          // Static / Vercel hosting fallback when /api/admin/session is not mounted
          if (active) {
            setHasCustomPasscode(localConfigured);
            if (!localConfigured || Boolean(getAdminToken())) {
              setAdminToken(getAdminToken() || 'local-admin-session');
              setIsAuthenticated(true);
              setCheckingSession(false);
              return;
            }
          }
        }
      } catch {
        // Offline / static fallback
        if (active) {
          setHasCustomPasscode(localConfigured);
          if (!localConfigured || Boolean(getAdminToken())) {
            setAdminToken(getAdminToken() || 'local-admin-session');
            setIsAuthenticated(true);
            setCheckingSession(false);
            return;
          }
        }
      }
      if (active) {
        clearAdminToken();
        setIsAuthenticated(false);
        setCheckingSession(false);
      }
    };
    verifySession();
    return () => {
      active = false;
    };
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/subscriptions', {
        headers: getAdminAuthHeaders(),
        credentials: 'include',
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.status === 401 && isJson) {
        clearAdminToken();
        setIsAuthenticated(false);
        return;
      }
      if (res.ok && isJson) {
        const data = await res.json();
        const serverList: UserSubscription[] = data.subscriptions || [];
        setSubscriptions(serverList);
        if (data.stats) {
          setStats(data.stats);
        }
        return;
      }
    } catch {
      // Fall through to local DB
    } finally {
      setLoading(false);
    }

    // Fallback to local users DB (for Vercel static hosting)
    const localList = getLocalUsersDb();
    setSubscriptions(localList);
    setStats(computeStatsFromList(localList));
  };

  const fetchPaymentConfig = async () => {
    try {
      const res = await fetch('/api/payment-config');
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          setPaymentConfig(data);
        }
      }
    } catch {
      // Use default payment config
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptions();
      fetchPaymentConfig();
    }
  }, [isAuthenticated]);

  const handleSavePaymentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess('');
    setSettingsError('');

    try {
      const res = await fetch('/api/admin/payment-config', {
        method: 'PUT',
        headers: getAdminAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(paymentConfig)
      });

      if (res.status === 401) {
        clearAdminToken();
        setIsAuthenticated(false);
        return;
      }
      if (res.ok) {
        setSettingsSuccess('Payment account details and pricing successfully updated! All users will see these updated details immediately.');
        setTimeout(() => setSettingsSuccess(''), 4000);
      } else {
        const err = await res.json();
        setSettingsError(err.error || 'Failed to update payment settings');
      }
    } catch (err: any) {
      setSettingsError(err.message || 'Server error occurred while saving.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setPinError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ passcode: adminPin }),
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json().catch(() => ({})) : {};
      if (res.ok && data.success && data.token) {
        setAdminToken(data.token);
        setIsAuthenticated(true);
        setAdminPin('');
        return;
      }

      // Also check local SHA-256 hash (supports Vercel static deployment & locally saved custom passcode)
      const localMatch = await verifyLocalAdminPasscode(adminPin);
      if (localMatch) {
        setAdminToken(data.token || 'local-admin-session');
        setIsAuthenticated(true);
        setAdminPin('');
        return;
      }

      setPinError(data.error || 'Invalid admin passcode.');
    } catch {
      const localMatch = await verifyLocalAdminPasscode(adminPin);
      if (localMatch) {
        setAdminToken('local-admin-session');
        setIsAuthenticated(true);
        setAdminPin('');
      } else {
        setPinError('Invalid admin passcode.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const fetchRecoveryStatus = async () => {
    try {
      const res = await fetch('/api/admin/recovery-status');
      if (res.ok) {
        const data = await res.json();
        if (data.maskedEmail) setRecoveryMaskedEmail(data.maskedEmail);
        setSmtpConfigured(Boolean(data.smtpConfigured));
      }
    } catch {
      // ignore
    }
  };

  const openForgotPasscode = () => {
    setAuthView('forgot');
    setRecoveryError('');
    setRecoveryNotice('');
    setSmtpMissingHelp(false);
    fetchRecoveryStatus();
  };

  const handleRequestRecoveryOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setRecoveryLoading(true);
    setRecoveryError('');
    setRecoveryNotice('');
    setSmtpMissingHelp(false);

    try {
      const res = await fetch('/api/admin/forgot-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmailInput.trim() }),
      });
      const rawText = await res.text();
      let data: any = {};
      let isJson = false;
      try {
        data = rawText ? JSON.parse(rawText) : {};
        isJson = true;
      } catch {
        isJson = false;
      }

      if (res.ok && data.success) {
        if (data.maskedEmail) setRecoveryMaskedEmail(data.maskedEmail);
        setRecoveryNotice(data.message || `6-digit recovery code sent to ${recoveryMaskedEmail}.`);
        setResendCooldown(45);
        setAuthView('reset');
      } else if (data.code === 'SMTP_NOT_CONFIGURED') {
        setSmtpConfigured(false);
        setSmtpMissingHelp(true);
        setRecoveryError(data.error || 'Gmail SMTP is not configured on the server yet.');
      } else {
        if (typeof data.retryAfterSeconds === 'number') {
          setResendCooldown(data.retryAfterSeconds);
        }
        setRecoveryError(
          data.error ||
            (!isJson
              ? `Server temporarily returned non-JSON response (HTTP ${res.status}). Please refresh the page and try again.`
              : `Could not send recovery code (HTTP ${res.status}).`)
        );
      }
    } catch {
      setRecoveryError('Network error while requesting recovery code. Please check your connection and try again.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleResetPasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    if (newPasscodeInput.trim().length < 4) {
      setRecoveryError('New passcode must be at least 4 characters long.');
      return;
    }
    if (newPasscodeInput.trim() !== confirmPasscodeInput.trim()) {
      setRecoveryError('New passcode and confirm passcode do not match.');
      return;
    }

    setRecoveryLoading(true);
    try {
      const res = await fetch('/api/admin/reset-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          code: recoveryOtp.trim(),
          newPasscode: newPasscodeInput.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.token) {
        await saveLocalAdminPasscode(newPasscodeInput.trim());
        setAdminToken(data.token);
        setHasCustomPasscode(true);
        setIsAuthenticated(true);
        setAuthView('login');
        setRecoveryOtp('');
        setNewPasscodeInput('');
        setConfirmPasscodeInput('');
        setRecoveryEmailInput('');
        setRecoveryNotice('');
      } else {
        setRecoveryError(data.error || 'Invalid or expired recovery code.');
      }
    } catch {
      setRecoveryError('Server error while resetting passcode.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const openSecurityModal = async (initialNotice?: string) => {
    setSecurityModalOpen(true);
    setSecError(initialNotice || '');
    setSecSuccess('');
    setSecCurrentPasscode('');
    setSecNewPasscode('');
    setSecConfirmPasscode('');
    setSecRecoveryEmail(getLocalRecoveryEmail());
    try {
      const res = await fetch('/api/admin/security-settings', {
        headers: getAdminAuthHeaders(),
        credentials: 'include',
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const data = await res.json();
        setSecRecoveryEmail(data.recoveryEmail || getLocalRecoveryEmail());
        setSecSmtpConfigured(Boolean(data.smtpConfigured));
        setHasCustomPasscode(Boolean(data.hasCustomPasscode) || hasLocalAdminPasscode());
      } else {
        setHasCustomPasscode(hasLocalAdminPasscode());
      }
    } catch {
      setHasCustomPasscode(hasLocalAdminPasscode());
    }
  };

  const handleUpdateSecuritySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecError('');
    setSecSuccess('');

    if (hasCustomPasscode && !secCurrentPasscode.trim()) {
      setSecError('Please enter your current Admin Passcode to save changes.');
      return;
    }
    if (!hasCustomPasscode && !secNewPasscode.trim()) {
      setSecError('Please enter a new Admin Password (at least 4 characters).');
      return;
    }
    if (secNewPasscode.trim()) {
      if (secNewPasscode.trim().length < 4) {
        setSecError('Admin Passcode must be at least 4 characters long.');
        return;
      }
      if (secNewPasscode.trim() !== secConfirmPasscode.trim()) {
        setSecError('New passcode and confirm passcode do not match.');
        return;
      }
    }

    setSecLoading(true);
    try {
      const res = await fetch('/api/admin/change-passcode', {
        method: 'POST',
        headers: getAdminAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({
          currentPasscode: secCurrentPasscode.trim() || undefined,
          newPasscode: secNewPasscode.trim() || undefined,
          recoveryEmail: secRecoveryEmail.trim() || undefined,
        }),
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.status === 401 && isJson) {
        const errData = await res.json().catch(() => ({}));
        const localValid = await verifyLocalAdminPasscode(secCurrentPasscode.trim());
        if (!localValid) {
          setSecError(errData.error || 'Current Admin Passcode is incorrect.');
          setSecLoading(false);
          return;
        }
      }

      if (secNewPasscode.trim()) {
        await saveLocalAdminPasscode(secNewPasscode.trim());
        setHasCustomPasscode(true);
      }
      if (secRecoveryEmail.trim()) {
        saveLocalRecoveryEmail(secRecoveryEmail.trim());
      }

      const data = isJson ? await res.json().catch(() => ({})) : {};
      setSecSuccess(
        data.message ||
          'Admin Passcode saved! Next time you lock or sign in, this passcode will be required.'
      );
      setSecCurrentPasscode('');
      setSecNewPasscode('');
      setSecConfirmPasscode('');
    } catch {
      if (hasCustomPasscode) {
        const localValid = await verifyLocalAdminPasscode(secCurrentPasscode.trim());
        if (!localValid) {
          setSecError('Current Admin Passcode is incorrect.');
          setSecLoading(false);
          return;
        }
      }
      if (secNewPasscode.trim()) {
        await saveLocalAdminPasscode(secNewPasscode.trim());
        setHasCustomPasscode(true);
      }
      if (secRecoveryEmail.trim()) {
        saveLocalRecoveryEmail(secRecoveryEmail.trim());
      }
      setSecSuccess('Admin Passcode saved! Next time you lock or sign in, this passcode will be required.');
      setSecCurrentPasscode('');
      setSecNewPasscode('');
      setSecConfirmPasscode('');
    } finally {
      setSecLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!hasCustomPasscode) {
      openSecurityModal('Lock karne se pehle apna Admin Password select karein.');
      return;
    }
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    }
    clearAdminToken();
    setIsAuthenticated(false);
    setAuthView('login');
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Allow (Approve) Access
  const handleAllowAccess = async (id: string) => {
    setActionLoading(id);
    // Also update local DB
    const localDb = getLocalUsersDb();
    const localIdx = localDb.findIndex((u) => u.id === id);
    if (localIdx !== -1) {
      localDb[localIdx] = {
        ...localDb[localIdx],
        status: 'approved',
        plan: localDb[localIdx].plan || 'monthly',
        planName: localDb[localIdx].planName || 'Monthly Unlimited Pro',
        amount: localDb[localIdx].amount || 499,
        updatedAt: new Date().toISOString(),
      };
      saveLocalUsersDb(localDb);
    }
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}/status`, {
        method: 'POST',
        headers: getAdminAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ status: 'approved' })
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.status === 401 && isJson) {
        clearAdminToken();
        setIsAuthenticated(false);
        return;
      }
      await fetchSubscriptions();
    } catch {
      await fetchSubscriptions();
    } finally {
      setActionLoading(null);
    }
  };

  // Disallow Access
  const handleDisallowAccess = async (id: string) => {
    const reason = window.prompt('Enter reason for disallowing access (optional):', 'Payment verification failed');
    if (reason === null) return; // cancelled

    setActionLoading(id);
    const localDb = getLocalUsersDb();
    const localIdx = localDb.findIndex((u) => u.id === id);
    if (localIdx !== -1) {
      localDb[localIdx] = {
        ...localDb[localIdx],
        status: 'disallowed',
        disallowedReason: reason || 'Payment verification failed',
        updatedAt: new Date().toISOString(),
      };
      saveLocalUsersDb(localDb);
    }
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}/status`, {
        method: 'POST',
        headers: getAdminAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ status: 'disallowed', reason })
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.status === 401 && isJson) {
        clearAdminToken();
        setIsAuthenticated(false);
        return;
      }
      await fetchSubscriptions();
    } catch {
      await fetchSubscriptions();
    } finally {
      setActionLoading(null);
    }
  };

  // Reset Free Uses back to 0 (gives 7 new uses)
  const handleResetFreeUses = async (id: string) => {
    setActionLoading(id);
    const localDb = getLocalUsersDb();
    const localIdx = localDb.findIndex((u) => u.id === id);
    if (localIdx !== -1) {
      localDb[localIdx] = {
        ...localDb[localIdx],
        freeUsesCount: 0,
        status: localDb[localIdx].status === 'disallowed' ? 'free' : localDb[localIdx].status,
        updatedAt: new Date().toISOString(),
      };
      saveLocalUsersDb(localDb);
    }
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}/reset-free`, {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        credentials: 'include',
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.status === 401 && isJson) {
        clearAdminToken();
        setIsAuthenticated(false);
        return;
      }
      await fetchSubscriptions();
    } catch {
      await fetchSubscriptions();
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Subscription
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subscription record?')) return;

    setActionLoading(id);
    const localDb = getLocalUsersDb().filter((u) => u.id !== id);
    saveLocalUsersDb(localDb);
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}`, {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
        credentials: 'include',
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.status === 401 && isJson) {
        clearAdminToken();
        setIsAuthenticated(false);
        return;
      }
      await fetchSubscriptions();
    } catch {
      await fetchSubscriptions();
    } finally {
      setActionLoading(null);
    }
  };

  // Add User Manually
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserIdentifier.trim()) return;

    setActionLoading('new-user');
    const nowIso = new Date().toISOString();
    const localNewRecord: UserSubscription = {
      id: 'sub-' + Date.now(),
      name: newUserName.trim() || 'Direct Subscriber',
      identifier: newUserIdentifier.trim().replace(/\D/g, '') || newUserIdentifier.trim(),
      authType: 'phone',
      status: 'approved',
      plan: newUserPlan,
      planName: newUserPlan === 'annual' ? 'Annual Full Suite Pro' : 'Monthly Unlimited Pro',
      amount: newUserPlan === 'annual' ? 2499 : 499,
      paymentMethod: newUserPaymentMethod,
      trxId: newUserTrxId.trim() || 'ADMIN-GRANT',
      freeUsesCount: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    const localDb = getLocalUsersDb();
    localDb.unshift(localNewRecord);
    saveLocalUsersDb(localDb);

    try {
      const res = await fetch('/api/admin/subscriptions/manual', {
        method: 'POST',
        headers: getAdminAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({
          name: newUserName.trim() || 'Direct Subscriber',
          identifier: newUserIdentifier.trim(),
          plan: newUserPlan,
          status: 'approved',
          paymentMethod: newUserPaymentMethod,
          trxId: newUserTrxId.trim()
        })
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.status === 401 && isJson) {
        clearAdminToken();
        setIsAuthenticated(false);
        return;
      }
      setAddModalOpen(false);
      setNewUserName('');
      setNewUserIdentifier('');
      setNewUserTrxId('');
      await fetchSubscriptions();
    } catch {
      setAddModalOpen(false);
      setNewUserName('');
      setNewUserIdentifier('');
      setNewUserTrxId('');
      await fetchSubscriptions();
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered subscriptions
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      sub.name.toLowerCase().includes(q) ||
      sub.identifier.toLowerCase().includes(q) ||
      (sub.trxId && sub.trxId.toLowerCase().includes(q)) ||
      (sub.notes && sub.notes.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  // ───────────────────────────────────────────────────────────
  // LOGIN SCREEN (If not authenticated)
  // ────────────────────────────────────────────────────────────
  if (checkingSession) {
    return (
      <div className="py-16 max-w-md mx-auto text-center text-sm font-semibold text-slate-500">
        Verifying secure admin session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-12 max-w-md mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/20">
            {authView === 'login' ? (
              <Lock className="w-8 h-8" />
            ) : (
              <Mail className="w-8 h-8" />
            )}
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {authView === 'login'
                ? 'Admin Control Portal'
                : authView === 'forgot'
                ? 'Forgot Admin Passcode'
                : 'Enter Gmail Recovery Code'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {authView === 'login'
                ? 'Protected Access — Calculator Subscriptions & Fleet Management'
                : authView === 'forgot'
                ? `We will send a 6-digit one-time code to your Admin Gmail (${recoveryMaskedEmail})`
                : `Enter the 6-digit code sent to ${recoveryMaskedEmail} and set a new passcode`}
            </p>
          </div>

          {authView === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Enter Admin Security Passcode
                  </label>
                  <button
                    type="button"
                    onClick={openForgotPasscode}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    Forgot Passcode?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showAdminPin ? 'text' : 'password'}
                    required
                    autoFocus
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-300 font-mono text-center tracking-widest text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPin((v) => !v)}
                    aria-label={showAdminPin ? 'Hide passcode' : 'Show passcode'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showAdminPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {pinError && (
                <p className="text-xs text-rose-600 font-bold text-center">{pinError}</p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>{loginLoading ? 'Verifying...' : 'Unlock Admin Dashboard'}</span>
              </button>

              <button
                type="button"
                onClick={openForgotPasscode}
                className="w-full py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Forgot Code? Send Reset OTP to Gmail</span>
              </button>
            </form>
          )}

          {authView === 'forgot' && (
            <form onSubmit={handleRequestRecoveryOtp} className="space-y-4 text-left">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900 font-medium">
                Registered Recovery Gmail: <strong className="font-mono">{recoveryMaskedEmail}</strong>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Your Admin Gmail Address
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="Enter your registered Admin Gmail"
                  value={recoveryEmailInput}
                  onChange={(e) => setRecoveryEmailInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {recoveryError && (
                <p className="text-xs text-rose-600 font-bold text-center">{recoveryError}</p>
              )}

              {(smtpMissingHelp || smtpConfigured === false) && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-1.5 text-[11px] text-amber-950">
                  <p className="font-extrabold flex items-center gap-1.5 text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Gmail SMTP Setup Required for Automated Email</span>
                  </p>
                  <p className="text-amber-900/90 leading-relaxed">
                    Server par automated Gmail send karne ke liye environment Secrets mein{' '}
                    <code className="font-mono bg-amber-100 px-1 rounded">GMAIL_USER</code> aur 16-digit{' '}
                    <code className="font-mono bg-amber-100 px-1 rounded">GMAIL_APP_PASSWORD</code> add karein.
                  </p>
                  <p className="text-amber-900/90 leading-relaxed">
                    Emergency override ke liye aap Secrets mein direct{' '}
                    <code className="font-mono bg-amber-100 px-1 rounded">ADMIN_PASSCODE</code> bhi set kar sakte hain.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={recoveryLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{recoveryLoading ? 'Sending to Gmail...' : 'Send 6-Digit Code to Gmail'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthView('login');
                  setRecoveryError('');
                  setPinError('');
                }}
                className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Passcode Login</span>
              </button>
            </form>
          )}

          {authView === 'reset' && (
            <form onSubmit={handleResetPasscodeSubmit} className="space-y-4 text-left">
              {recoveryNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold">
                  {recoveryNotice}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  6-Digit Code from Gmail
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength={6}
                  autoFocus
                  placeholder="000000"
                  value={recoveryOtp}
                  onChange={(e) => setRecoveryOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-center tracking-[0.4em] text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Admin Passcode (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showNewPasscode ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Enter new strong passcode"
                    value={newPasscodeInput}
                    onChange={(e) => setNewPasscodeInput(e.target.value)}
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPasscode((v) => !v)}
                    aria-label={showNewPasscode ? 'Hide passcode' : 'Show passcode'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showNewPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Passcode
                </label>
                <input
                  type={showNewPasscode ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Re-enter new passcode"
                  value={confirmPasscodeInput}
                  onChange={(e) => setConfirmPasscodeInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {recoveryError && (
                <p className="text-xs text-rose-600 font-bold text-center">{recoveryError}</p>
              )}

              <button
                type="submit"
                disabled={recoveryLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{recoveryLoading ? 'Updating Passcode...' : 'Reset Passcode & Unlock'}</span>
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || recoveryLoading}
                  onClick={() => handleRequestRecoveryOtp()}
                  className="text-xs font-bold text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Gmail Code'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('login');
                    setRecoveryError('');
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // AUTHENTICATED ADMIN DASHBOARD
  // ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-16">
      {/* First-Time Password Selection Banner */}
      {!hasCustomPasscode && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black">
                First-Time Admin Access — Select Your Admin Password
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Admin Dashboard abhi first-time setup ke liye open hai. Yahan se apna Admin Password aur Recovery Gmail set karein.
              </p>
            </div>
          </div>
          <button
            onClick={() => openSecurityModal()}
            className="px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black text-xs shadow-xs transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <KeyRound className="w-4 h-4" />
            <span>Select Admin Password Now</span>
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>goinfoEV Pakistan • Master Admin Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Calculator Subscriptions Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review user payment requests, allow/disallow calculator access, and manage user limits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add User Manually</span>
          </button>

          <button
            onClick={fetchSubscriptions}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => openSecurityModal()}
            className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              !hasCustomPasscode
                ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                : 'border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{!hasCustomPasscode ? 'Select Password' : 'Passcode & Gmail'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 text-xs font-bold transition-colors cursor-pointer"
          >
            Lock Admin
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs: Product Fleet CSV vs User Requests vs Payment & Account Settings */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setAdminTab('fleet-csv')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            adminTab === 'fleet-csv'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>📦 EV Products &amp; CSV Fleet ({totalCount})</span>
        </button>

        <button
          onClick={() => setAdminTab('users')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            adminTab === 'users'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Calculator Requests ({stats.totalRequests})</span>
          {stats.pendingCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
              {stats.pendingCount} New
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('payment-settings')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            adminTab === 'payment-settings'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Payment Accounts &amp; Pricing</span>
        </button>
      </div>

      {/* VIEW 1: USER REQUESTS & ACCESS APPROVAL */}
      {adminTab === 'users' && (
        <div className="space-y-6">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Users */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Total Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalUsers}</div>
          <div className="text-[11px] text-slate-500 mt-1">{stats.totalRequests} Requests logged</div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-xs font-bold uppercase">Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900">{stats.pendingCount}</div>
          <div className="text-[11px] text-amber-700 mt-1 font-bold">Needs your approval</div>
        </div>

        {/* Active Subscribers */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-xs font-bold uppercase">Active VIP Pro</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900">{stats.approvedCount}</div>
          <div className="text-[11px] text-emerald-700 mt-1">Unlimited access granted</div>
        </div>

        {/* Disallowed */}
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-rose-800 mb-1">
            <span className="text-xs font-bold uppercase">Disallowed</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900">{stats.disallowedCount}</div>
          <div className="text-[11px] text-rose-700 mt-1">Access locked/revoked</div>
        </div>

        {/* Total Revenue */}
        <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">PKR {stats.totalRevenuePKR.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-1">From approved subscriptions</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Users' },
            { id: 'pending', label: `Pending (${stats.pendingCount})` },
            { id: 'approved', label: `Approved (${stats.approvedCount})` },
            { id: 'disallowed', label: `Disallowed (${stats.disallowedCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search name, phone, TRX ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Subscription Requests List */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900">
            User Records & Calculator Access Requests ({filteredSubscriptions.length})
          </h3>
          <span className="text-xs text-slate-500">Live Server State</span>
        </div>

        {filteredSubscriptions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <p className="font-bold text-slate-700 text-sm">No subscription requests match the selected filter.</p>
            <p>Try switching to &quot;All Users&quot; or clearing your search keywords.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredSubscriptions.map((sub) => {
              const isApproved = sub.status === 'approved';
              const isPending = sub.status === 'pending';
              const isDisallowed = sub.status === 'disallowed';

              return (
                <div key={sub.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: User details */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {sub.name}
                        </span>

                        {/* Status Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-800'
                            : isPending
                            ? 'bg-amber-100 text-amber-900 animate-pulse'
                            : isDisallowed
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {sub.status === 'approved' ? 'Active Pro' : sub.status}
                        </span>

                        {/* Plan */}
                        {sub.plan && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                            {sub.planName || sub.plan} (PKR {sub.amount})
                          </span>
                        )}
                      </div>

                      {/* Contact & Meta */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-mono font-bold text-slate-800">
                          {sub.authType === 'phone' ? (
                            <Phone className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <Mail className="w-3.5 h-3.5 text-indigo-600" />
                          )}
                          <span>{sub.identifier}</span>
                        </span>

                        <span className="text-slate-300">•</span>

                        <span className="text-slate-500">
                          Total Free Used: <strong className="text-slate-800">{sub.freeUsesCount}/7</strong> (All Tools Combined)
                        </span>

                        <span className="text-slate-300">•</span>

                        <span className="text-slate-400">
                          {new Date(sub.createdAt).toLocaleDateString('en-PK', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Payment Method & TRX ID details */}
                      {sub.trxId && (
                        <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                            <CreditCard className="w-3 h-3 text-slate-500" />
                            <span className="capitalize">{sub.paymentMethod || 'Payment'}</span>
                          </span>

                          <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg text-blue-900 font-mono font-bold text-xs">
                            <span>TRX: {sub.trxId}</span>
                            <button
                              onClick={() => handleCopy(sub.trxId!, `trx-${sub.id}`)}
                              className="p-0.5 hover:bg-blue-200 rounded cursor-pointer"
                              title="Copy TRX ID"
                            >
                              {copiedKey === `trx-${sub.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-blue-500" />
                              )}
                            </button>
                          </span>

                          {sub.notes && (
                            <span className="text-slate-500 text-[11px] italic">
                              Note: &quot;{sub.notes}&quot;
                            </span>
                          )}
                        </div>
                      )}

                      {sub.disallowedReason && (
                        <p className="text-xs text-rose-600 font-medium">
                          Reason: {sub.disallowedReason}
                        </p>
                      )}
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                      {/* Allow / Approve Button */}
                      {!isApproved ? (
                        <button
                          onClick={() => handleAllowAccess(sub.id)}
                          disabled={actionLoading === sub.id}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Allow Access (Approve)</span>
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Access Allowed</span>
                        </span>
                      )}

                      {/* Disallow Button */}
                      {!isDisallowed && (
                        <button
                          onClick={() => handleDisallowAccess(sub.id)}
                          disabled={actionLoading === sub.id}
                          className="px-3 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Disallow Access</span>
                        </button>
                      )}

                      {/* Reset Free Uses */}
                      <button
                        onClick={() => handleResetFreeUses(sub.id)}
                        disabled={actionLoading === sub.id}
                        className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Reset Free Calculator Uses back to 7"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(sub.id)}
                        disabled={actionLoading === sub.id}
                        className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete subscription"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          VIEW 2: DETAILED PAYMENT METHODS & ACCOUNT SETTINGS
          Allow Admin to update JazzCash, EasyPaisa, Bank accounts, and pricing
      ──────────────────────────────────────────────────────────── */}
      {adminTab === 'payment-settings' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Status Alert Banners */}
          {settingsSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs font-bold">{settingsSuccess}</div>
            </div>
          )}

          {settingsError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div className="text-xs font-bold">{settingsError}</div>
            </div>
          )}

          <form onSubmit={handleSavePaymentConfig} className="space-y-6">
            {/* Header info banner */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Payment Account &amp; Pricing Configuration
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your official EasyPaisa, JazzCash, and Bank account numbers. These details are shown to users during payment checkout.
                </p>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? 'Saving Changes...' : 'Save All Changes'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. JAZZCASH CONFIGURATION */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      JC
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">JazzCash Account Details</h3>
                      <p className="text-[11px] text-slate-400">Mobile Account &amp; Till Payments</p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentConfig.jazzcash.enabled}
                      onChange={(e) => setPaymentConfig({
                        ...paymentConfig,
                        jazzcash: { ...paymentConfig.jazzcash, enabled: e.target.checked }
                      })}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Active</span>
                  </label>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      JazzCash Account Number / Mobile No. *
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentConfig.jazzcash.number}
                      onChange={(e) => setPaymentConfig({
                        ...paymentConfig,
                        jazzcash: { ...paymentConfig.jazzcash, number: e.target.value }
                      })}
                      placeholder="e.g. 0300-1234567"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Account Title (Owner Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentConfig.jazzcash.title}
                      onChange={(e) => setPaymentConfig({
                        ...paymentConfig,
                        jazzcash: { ...paymentConfig.jazzcash, title: e.target.value }
                      })}
                      placeholder="e.g. Hamdan Mirza / goinfoEV"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Checkout Instructions for Customer
                    </label>
                    <textarea
                      rows={2}
                      value={paymentConfig.jazzcash.instructions}
                      onChange={(e) => setPaymentConfig({
                        ...paymentConfig,
                        jazzcash: { ...paymentConfig.jazzcash, instructions: e.target.value }
                      })}
                      placeholder="Payment guidelines..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. EASYPAISA CONFIGURATION */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      EP
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">EasyPaisa Account Details</h3>
                      <p className="text-[11px] text-slate-400">Telenor Microfinance Account</p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentConfig.easypaisa.enabled}
                      onChange={(e) => setPaymentConfig({
                        ...paymentConfig,
                        easypaisa: { ...paymentConfig.easypaisa, enabled: e.target.checked }
                      })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Active</span>
                  </label>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      EasyPaisa Mobile Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentConfig.easypaisa.number}
                      onChange={(e) => setPaymentConfig({
                        ...paymentConfig,
                        easypaisa: { ...paymentConfig.easypaisa, number: e.target.value }
                      })}
                      placeholder="e.g. 0300-1234567"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Account Title (Owner Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentConfig.easypaisa.title}
                      onChange={(e) => setPaymentConfig({
                        ...paymentConfig,
                        easypaisa: { ...paymentConfig.easypaisa, title: e.target.value }
                      })}
                      placeholder="e.g. Hamdan Mirza"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Checkout Instructions for Customer
                    </label>
                    <textarea
                      rows={2}
                      value={paymentConfig.easypaisa.instructions}
                      onChange={(e) => setPaymentConfig({
                        ...paymentConfig,
                        easypaisa: { ...paymentConfig.easypaisa, instructions: e.target.value }
                      })}
                      placeholder="Payment guidelines..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. BANK & RAAST CONFIGURATION */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">Direct Bank &amp; Raast Transfer</h3>
                      <p className="text-[11px] text-slate-400">Commercial Bank / IBAN details</p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentConfig.bank.enabled}
                      onChange={(e) => setPaymentConfig({
                        ...paymentConfig,
                        bank: { ...paymentConfig.bank, enabled: e.target.checked }
                      })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Active</span>
                  </label>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={paymentConfig.bank.bankName}
                        onChange={(e) => setPaymentConfig({
                          ...paymentConfig,
                          bank: { ...paymentConfig.bank, bankName: e.target.value }
                        })}
                        placeholder="e.g. Meezan Bank / HBL / Faysal"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Account Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={paymentConfig.bank.title}
                        onChange={(e) => setPaymentConfig({
                          ...paymentConfig,
                          bank: { ...paymentConfig.bank, title: e.target.value }
                        })}
                        placeholder="e.g. goinfoEV Pakistan"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Account Number / Raast ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentConfig.bank.accountNumber}
                      onChange={(e) => setPaymentConfig({
                        ...paymentConfig,
                        bank: { ...paymentConfig.bank, accountNumber: e.target.value }
                      })}
                      placeholder="0102-0109283741"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      IBAN Number
                    </label>
                    <input
                      type="text"
                      value={paymentConfig.bank.iban}
                      onChange={(e) => setPaymentConfig({
                        ...paymentConfig,
                        bank: { ...paymentConfig.bank, iban: e.target.value }
                      })}
                      placeholder="PK64MEZN0000123456789012"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* 4. PRICING & FREE LIMIT SETTINGS */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">Subscription Pricing &amp; Free Usage</h3>
                      <p className="text-[11px] text-slate-400">Rules applied to new visitors</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Monthly Fee (PKR) *
                      </label>
                      <input
                        type="number"
                        required
                        min={100}
                        value={paymentConfig.pricing.monthlyPKR}
                        onChange={(e) => setPaymentConfig({
                          ...paymentConfig,
                          pricing: { ...paymentConfig.pricing, monthlyPKR: Number(e.target.value) }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Annual Fee (PKR) *
                      </label>
                      <input
                        type="number"
                        required
                        min={500}
                        value={paymentConfig.pricing.annualPKR}
                        onChange={(e) => setPaymentConfig({
                          ...paymentConfig,
                          pricing: { ...paymentConfig.pricing, annualPKR: Number(e.target.value) }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Free Calculator Uses Allowed Per Visitor (Total Across All Tools Combined) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={50}
                      value={paymentConfig.pricing.maxFreeUses}
                      onChange={(e) => setPaymentConfig({
                        ...paymentConfig,
                        pricing: { ...paymentConfig.pricing, maxFreeUses: Number(e.target.value) }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Default is 7 total uses across all tools combined (not per tool). When this threshold is exhausted, all calculators lock until VIP subscription.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Support Contact Phone
                      </label>
                      <input
                        type="text"
                        value={paymentConfig.supportPhone}
                        onChange={(e) => setPaymentConfig({
                          ...paymentConfig,
                          supportPhone: e.target.value
                        })}
                        placeholder="0300-7394000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Support WhatsApp Number
                      </label>
                      <input
                        type="text"
                        value={paymentConfig.supportWhatsApp}
                        onChange={(e) => setPaymentConfig({
                          ...paymentConfig,
                          supportWhatsApp: e.target.value
                        })}
                        placeholder="0300-7394000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Save Action Bar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <span className="text-xs text-slate-500">
                All changes persist to server configuration and take effect across the entire website instantly.
              </span>
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? 'Saving...' : 'Save Payment Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          VIEW 3: EV PRODUCTS & CSV FLEET IMPORTER
      ──────────────────────────────────────────────────────────── */}
      {adminTab === 'fleet-csv' && (
        <ErrorBoundary fallbackTitle="EV Fleet Manager Error">
          <AdminFleetManager />
        </ErrorBoundary>
      )}

      {/* ───────────────────────────────────────────────────────────
          MANUAL ADD USER MODAL
      ──────────────────────────────────────────────────────────── */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Add Subscriber Manually</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Customer Phone Number or Email *
                </label>
                <input
                  type="text"
                  required
                  placeholder="0300-1234567 or user@gmail.com"
                  value={newUserIdentifier}
                  onChange={(e) => setNewUserIdentifier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Asim Raza"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plan</label>
                  <select
                    value={newUserPlan}
                    onChange={(e) => setNewUserPlan(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="monthly">Monthly (PKR 499)</option>
                    <option value="annual">Annual (PKR 2,499)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={newUserPaymentMethod}
                    onChange={(e) => setNewUserPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="easypaisa">EasyPaisa</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  TRX ID / Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. EP-1092834 or Manual Approval"
                  value={newUserTrxId}
                  onChange={(e) => setNewUserTrxId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'new-user'}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-xs"
                >
                  Save & Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          ADMIN SECURITY: CHANGE PASSCODE & GMAIL RECOVERY MODAL
      ──────────────────────────────────────────────────────────── */}
      {securityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Admin Security &amp; Recovery</h3>
                  <p className="text-[11px] text-slate-500">Update passcode &amp; Gmail recovery address</p>
                </div>
              </div>
              <button
                onClick={() => setSecurityModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              secSmtpConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}>
              {secSmtpConfigured ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Gmail OTP Active:</strong> Forgot-passcode emails can be sent automatically to your recovery Gmail.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Gmail SMTP Not Configured:</strong> Add <code className="font-mono bg-amber-100 px-1 rounded">GMAIL_USER</code> &amp; <code className="font-mono bg-amber-100 px-1 rounded">GMAIL_APP_PASSWORD</code> in environment Secrets to enable forgot-passcode emails.
                  </span>
                </>
              )}
            </div>

            <form onSubmit={handleUpdateSecuritySettings} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Recovery Gmail Address *
                </label>
                <input
                  type="email"
                  required
                  value={secRecoveryEmail}
                  onChange={(e) => setSecRecoveryEmail(e.target.value)}
                  placeholder="Hamdan7394@gmail.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {hasCustomPasscode && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      Current Admin Passcode *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSecPasscodes((v) => !v)}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      {showSecPasscodes ? 'Hide' : 'Show'} Passcodes
                    </button>
                  </div>
                  <input
                    type={showSecPasscodes ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={secCurrentPasscode}
                    onChange={(e) => setSecCurrentPasscode(e.target.value)}
                    placeholder="Enter current passcode"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">
                    {hasCustomPasscode
                      ? 'New Admin Passcode (optional, min 4 chars)'
                      : 'Select Your Admin Passcode (min 4 chars) *'}
                  </label>
                  {!hasCustomPasscode && (
                    <button
                      type="button"
                      onClick={() => setShowSecPasscodes((v) => !v)}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      {showSecPasscodes ? 'Hide' : 'Show'} Passcode
                    </button>
                  )}
                </div>
                <input
                  type={showSecPasscodes ? 'text' : 'password'}
                  required={!hasCustomPasscode}
                  minLength={4}
                  autoComplete="new-password"
                  value={secNewPasscode}
                  onChange={(e) => setSecNewPasscode(e.target.value)}
                  placeholder={hasCustomPasscode ? 'Leave blank to keep current passcode' : 'e.g. 123456'}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {(secNewPasscode.length > 0 || !hasCustomPasscode) && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Confirm Admin Passcode *
                  </label>
                  <input
                    type={showSecPasscodes ? 'text' : 'password'}
                    required
                    minLength={4}
                    autoComplete="new-password"
                    value={secConfirmPasscode}
                    onChange={(e) => setSecConfirmPasscode(e.target.value)}
                    placeholder="Re-enter passcode"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {secError && (
                <p className="text-xs text-rose-600 font-bold">{secError}</p>
              )}
              {secSuccess && (
                <p className="text-xs text-emerald-700 font-bold">{secSuccess}</p>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSecurityModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={secLoading}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold shadow-xs cursor-pointer"
                >
                  {secLoading
                    ? 'Saving...'
                    : hasCustomPasscode
                    ? 'Save Security Settings'
                    : 'Set Admin Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
