import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserSubscription } from '../types/subscription';
import { clearUserToken, getUserAuthHeaders, setUserToken, sha256Hex } from '../utils/authHeaders';

interface SubscriptionContextType {
  user: UserSubscription | null;
  freeUsesCount: number;
  maxFreeUses: number;
  remainingUses: number;
  isSubscriber: boolean;
  isPending: boolean;
  isDisallowed: boolean;
  isLocked: boolean;
  modalOpen: boolean;
  modalInitialTab: 'auth' | 'pay';
  recordCalculatorUse: (calculatorName: string) => Promise<boolean>;
  signInOrRegister: (
    identifier: string,
    name?: string,
    authType?: 'phone',
    password?: string
  ) => Promise<{ success: boolean; error?: string }>;
  submitSubscriptionRequest: (data: {
    plan: 'monthly' | 'annual';
    paymentMethod: 'easypaisa' | 'jazzcash' | 'bank';
    trxId: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  refreshStatus: () => Promise<void>;
  logout: () => void;
  openSubscriptionModal: (tab?: 'auth' | 'pay') => void;
  closeSubscriptionModal: () => void;
  resetFreeUsesForDemo: () => void;
}

const MAX_FREE_USES = 7;
const STORAGE_KEY_USER = 'pakev_user_sub';
const STORAGE_KEY_USES = 'pakev_calc_free_uses';
export const LOCAL_USERS_DB_KEY = 'pakev_local_users_db';

export interface StoredLocalUser extends UserSubscription {
  passwordHash?: string;
}

export function getLocalUsersDb(): StoredLocalUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalUsersDb(users: StoredLocalUser[]): void {
  try {
    localStorage.setItem(LOCAL_USERS_DB_KEY, JSON.stringify(users));
  } catch {
    // ignore storage errors
  }
}

function normalizePhoneIdentifier(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('92') && digits.length === 12) {
    return '0' + digits.slice(2);
  }
  return digits;
}

function safeParseResponseText(rawText: string): any | null {
  try {
    const trimmed = (rawText || '').trim();
    if (
      !trimmed ||
      trimmed.startsWith('The page') ||
      trimmed.startsWith('<!DOCTYPE') ||
      trimmed.startsWith('<html') ||
      trimmed.startsWith('NOT_FOUND')
    ) {
      return null;
    }
    const parsed = JSON.parse(trimmed);
    if (parsed && parsed._nonJson) return null;
    return parsed;
  } catch {
    return null;
  }
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSubscription | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [freeUsesCount, setFreeUsesCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USES);
      return saved !== null ? Math.min(MAX_FREE_USES, Math.max(0, parseInt(saved, 10) || 0)) : 0;
    } catch {
      return 0;
    }
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'auth' | 'pay'>('pay');

  const isSubscriber = user?.status === 'approved';
  const isPending = user?.status === 'pending';
  const isDisallowed = user?.status === 'disallowed';
  const isLocked = !isSubscriber && freeUsesCount >= MAX_FREE_USES;
  const remainingUses = isSubscriber ? 9999 : Math.max(0, MAX_FREE_USES - freeUsesCount);

  // Sync with server (or local DB fallback on static hosting) on mount or when user changes
  const refreshStatus = useCallback(async () => {
    if (!user?.identifier) return;
    try {
      const res = await fetch(`/api/subscriptions/user/${encodeURIComponent(user.identifier)}`, {
        headers: getUserAuthHeaders(),
        credentials: 'include',
      });
      const text = await res.text();
      const data = safeParseResponseText(text);
      if (res.ok && data && data.identifier) {
        setUser((prev) => {
          const updated = { ...(prev || {}), ...data };
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
          return updated;
        });
        if (data.status !== 'approved' && typeof data.freeUsesCount === 'number') {
          setFreeUsesCount((prev) => Math.max(prev, data.freeUsesCount));
          localStorage.setItem(STORAGE_KEY_USES, String(Math.max(freeUsesCount, data.freeUsesCount)));
        }
        return;
      }
    } catch {
      // Fallback to local DB below
    }

    // Static hosting / offline fallback: sync from local user registry
    const cleanPhone = normalizePhoneIdentifier(user.identifier);
    const localDb = getLocalUsersDb();
    const localMatch = localDb.find(
      (u) => normalizePhoneIdentifier(u.identifier) === cleanPhone || u.id === user.id
    );
    if (localMatch) {
      const { passwordHash: _unused, ...cleanRecord } = localMatch;
      setUser((prev) => {
        const updated = { ...(prev || {}), ...cleanRecord };
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
        return updated;
      });
    }
  }, [user?.identifier, user?.id, freeUsesCount]);

  useEffect(() => {
    refreshStatus();
    if (isPending) {
      const interval = setInterval(refreshStatus, 15000);
      return () => clearInterval(interval);
    }
  }, [refreshStatus, isPending]);

  // Record a calculation event across any of the 7 calculators
  const recordCalculatorUse = useCallback(async (calculatorName: string): Promise<boolean> => {
    if (isSubscriber) {
      return true;
    }

    if (freeUsesCount >= MAX_FREE_USES) {
      setModalOpen(true);
      return false;
    }

    const newCount = Math.min(MAX_FREE_USES, freeUsesCount + 1);
    setFreeUsesCount(newCount);
    localStorage.setItem(STORAGE_KEY_USES, String(newCount));

    // Sync to local DB as well
    if (user?.identifier) {
      const cleanPhone = normalizePhoneIdentifier(user.identifier);
      const localDb = getLocalUsersDb();
      const idx = localDb.findIndex((u) => normalizePhoneIdentifier(u.identifier) === cleanPhone);
      if (idx !== -1) {
        const logs = localDb[idx].usageLogs || [];
        localDb[idx].freeUsesCount = Math.max(localDb[idx].freeUsesCount || 0, newCount);
        localDb[idx].usageLogs = [
          { toolName: calculatorName, timestamp: new Date().toISOString() },
          ...logs.slice(0, 49),
        ];
        saveLocalUsersDb(localDb);
      }

      try {
        fetch('/api/subscriptions/usage', {
          method: 'POST',
          headers: getUserAuthHeaders({ 'Content-Type': 'application/json' }),
          credentials: 'include',
          body: JSON.stringify({ identifier: user.identifier, toolName: calculatorName })
        }).catch(() => {});
      } catch {}
    }

    if (newCount >= MAX_FREE_USES) {
      setTimeout(() => setModalOpen(true), 800);
    }

    return true;
  }, [isSubscriber, freeUsesCount, user?.identifier]);

  // Sign in exclusively with Phone Number and Password (email options disabled)
  const signInOrRegister = async (
    identifier: string,
    name?: string,
    _authType: 'phone' = 'phone',
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const rawPhone = (identifier || '').trim();
    const providedName = (name || '').trim();
    const cleanPassword = (password || '').trim();

    if (!rawPhone) {
      return { success: false, error: 'Please enter your Pakistani mobile phone number.' };
    }
    if (rawPhone.includes('@')) {
      return { success: false, error: 'Email login is disabled. Please enter your mobile phone number.' };
    }
    const cleanPhone = normalizePhoneIdentifier(rawPhone);
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return { success: false, error: 'Please enter a valid mobile number (e.g. 03001234567).' };
    }
    if (!cleanPassword || cleanPassword.length < 4) {
      return { success: false, error: 'Password is required (minimum 4 characters).' };
    }
    const cleanName = providedName.length >= 2 ? providedName : `EV Member (${cleanPhone.slice(-4)})`;

    try {
      const res = await fetch('/api/subscriptions/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          identifier: cleanPhone,
          name: cleanName,
          authType: 'phone',
          password: cleanPassword
        })
      });

      const rawText = await res.text();
      const data = safeParseResponseText(rawText);

      if (data) {
        if ((res.status === 400 || res.status === 401) && data.error) {
          return { success: false, error: data.error };
        }
        if (res.ok && data.user) {
          if (data.token) {
            setUserToken(data.token);
          }
          setUser(data.user);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));

          // Also mirror into local users DB
          const passHash = await sha256Hex(cleanPassword);
          const localDb = getLocalUsersDb();
          const existingIdx = localDb.findIndex((u) => normalizePhoneIdentifier(u.identifier) === cleanPhone);
          if (existingIdx !== -1) {
            localDb[existingIdx] = { ...localDb[existingIdx], ...data.user, passwordHash: passHash };
          } else {
            localDb.unshift({ ...data.user, passwordHash: passHash });
          }
          saveLocalUsersDb(localDb);

          if (typeof data.user.freeUsesCount === 'number') {
            const syncedCount = Math.max(freeUsesCount, data.user.freeUsesCount);
            setFreeUsesCount(syncedCount);
            localStorage.setItem(STORAGE_KEY_USES, String(syncedCount));
          }

          return { success: true };
        }
      }
    } catch {
      // Fall through to local static deployment handler below
    }

    // Local fallback for Vercel / static hosting where /api/subscriptions/auth is not mounted
    const passHash = await sha256Hex(cleanPassword);
    const localDb = getLocalUsersDb();
    const existingIdx = localDb.findIndex((u) => normalizePhoneIdentifier(u.identifier) === cleanPhone);

    if (existingIdx !== -1) {
      const existingUser = localDb[existingIdx];
      if (existingUser.passwordHash && existingUser.passwordHash !== passHash) {
        return { success: false, error: 'Incorrect password for this mobile number.' };
      }
      const updatedUser: StoredLocalUser = {
        ...existingUser,
        name: cleanName || existingUser.name,
        identifier: cleanPhone,
        authType: 'phone',
        passwordHash: passHash,
        updatedAt: new Date().toISOString(),
      };
      localDb[existingIdx] = updatedUser;
      saveLocalUsersDb(localDb);

      const { passwordHash: _unused, ...publicUser } = updatedUser;
      setUserToken('local-user-' + cleanPhone);
      setUser(publicUser);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(publicUser));
      return { success: true };
    }

    const nowIso = new Date().toISOString();
    const newLocalUser: StoredLocalUser = {
      id: 'sub-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      name: cleanName,
      identifier: cleanPhone,
      authType: 'phone',
      passwordHash: passHash,
      status: 'free',
      freeUsesCount,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    localDb.unshift(newLocalUser);
    saveLocalUsersDb(localDb);

    const { passwordHash: _unused, ...publicUser } = newLocalUser;
    setUserToken('local-user-' + cleanPhone);
    setUser(publicUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(publicUser));
    return { success: true };
  };

  // Submit subscription request with payment details
  const submitSubscriptionRequest = async (data: {
    plan: 'monthly' | 'annual';
    paymentMethod: 'easypaisa' | 'jazzcash' | 'bank';
    trxId: string;
    notes?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user?.identifier) {
      return { success: false, error: 'Please sign in first with your mobile phone number.' };
    }

    try {
      const res = await fetch('/api/subscriptions/request', {
        method: 'POST',
        headers: getUserAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({
          identifier: user.identifier,
          name: user.name,
          plan: data.plan,
          paymentMethod: data.paymentMethod,
          trxId: data.trxId,
          notes: data.notes
        })
      });

      const rawText = await res.text();
      const resData = safeParseResponseText(rawText);

      if (resData) {
        if ((res.status === 400 || res.status === 401) && resData.error) {
          return { success: false, error: resData.error };
        }
        if (res.ok && resData.user) {
          if (resData.token) {
            setUserToken(resData.token);
          }
          setUser(resData.user);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(resData.user));

          // Sync with local DB
          const cleanPhone = normalizePhoneIdentifier(user.identifier);
          const localDb = getLocalUsersDb();
          const existingIdx = localDb.findIndex((u) => normalizePhoneIdentifier(u.identifier) === cleanPhone);
          if (existingIdx !== -1) {
            localDb[existingIdx] = { ...localDb[existingIdx], ...resData.user };
          } else {
            localDb.unshift(resData.user);
          }
          saveLocalUsersDb(localDb);

          return { success: true };
        }
      }
    } catch {
      // Fall through to local static deployment handler below
    }

    // Static hosting / offline fallback for subscription request
    const planType = data.plan === 'annual' ? 'annual' : 'monthly';
    const amount = planType === 'annual' ? 2499 : 499;
    const planName = planType === 'annual' ? 'Annual Full Suite Pro' : 'Monthly Unlimited Pro';
    const updatedUser: UserSubscription = {
      ...user,
      status: 'pending',
      plan: planType,
      planName,
      amount,
      paymentMethod: data.paymentMethod,
      trxId: data.trxId.trim(),
      notes: data.notes?.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    const cleanPhone = normalizePhoneIdentifier(user.identifier);
    const localDb = getLocalUsersDb();
    const existingIdx = localDb.findIndex((u) => normalizePhoneIdentifier(u.identifier) === cleanPhone);
    if (existingIdx !== -1) {
      localDb[existingIdx] = { ...localDb[existingIdx], ...updatedUser };
    } else {
      localDb.unshift(updatedUser);
    }
    saveLocalUsersDb(localDb);

    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    clearUserToken();
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  const openSubscriptionModal = (tab: 'auth' | 'pay' = 'pay') => {
    setModalInitialTab(tab);
    setModalOpen(true);
  };

  const closeSubscriptionModal = () => {
    setModalOpen(false);
  };

  const resetFreeUsesForDemo = () => {
    setFreeUsesCount(0);
    localStorage.setItem(STORAGE_KEY_USES, '0');
    if (user) {
      const updated = { ...user, freeUsesCount: 0 };
      setUser(updated);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        user,
        freeUsesCount,
        maxFreeUses: MAX_FREE_USES,
        remainingUses,
        isSubscriber,
        isPending,
        isDisallowed,
        isLocked,
        modalOpen,
        modalInitialTab,
        recordCalculatorUse,
        signInOrRegister,
        submitSubscriptionRequest,
        refreshStatus,
        logout,
        openSubscriptionModal,
        closeSubscriptionModal,
        resetFreeUsesForDemo
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
