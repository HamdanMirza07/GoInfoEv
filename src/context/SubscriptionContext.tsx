import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserSubscription } from '../types/subscription';

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
  signInOrRegister: (identifier: string, name?: string, authType?: 'phone' | 'email', password?: string) => Promise<{ success: boolean; error?: string }>;
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

  // Sync with server on mount or when user changes
  const refreshStatus = useCallback(async () => {
    if (!user?.identifier) return;
    try {
      const res = await fetch(`/api/subscriptions/user/${encodeURIComponent(user.identifier)}`);
      if (res.ok) {
        const data = await res.json();
        setUser((prev) => {
          const updated = { ...(prev || {}), ...data };
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
          return updated;
        });
        if (data.status === 'approved') {
          // Keep count as is, user has unlimited access
        } else if (typeof data.freeUsesCount === 'number') {
          setFreeUsesCount((prev) => Math.max(prev, data.freeUsesCount));
          localStorage.setItem(STORAGE_KEY_USES, String(Math.max(freeUsesCount, data.freeUsesCount)));
        }
      }
    } catch (err) {
      console.warn('Could not sync user subscription status:', err);
    }
  }, [user?.identifier, freeUsesCount]);

  useEffect(() => {
    refreshStatus();
    // Poll every 45 seconds if user is pending so they get activated automatically when admin approves
    if (isPending) {
      const interval = setInterval(refreshStatus, 15000);
      return () => clearInterval(interval);
    }
  }, [refreshStatus, isPending]);

  // Record a calculation event across any of the 7 calculators
  const recordCalculatorUse = useCallback(async (calculatorName: string): Promise<boolean> => {
    if (isSubscriber) {
      return true; // Unlimited allowed
    }

    if (freeUsesCount >= MAX_FREE_USES) {
      setModalOpen(true);
      return false; // Blocked
    }

    const newCount = Math.min(MAX_FREE_USES, freeUsesCount + 1);
    setFreeUsesCount(newCount);
    localStorage.setItem(STORAGE_KEY_USES, String(newCount));

    // Also sync to server if identifier exists
    if (user?.identifier) {
      try {
        fetch('/api/subscriptions/usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: user.identifier, toolName: calculatorName })
        }).catch(() => {});
      } catch {}
    }

    if (newCount >= MAX_FREE_USES) {
      // Auto pop up subscription modal when 7th use is exhausted
      setTimeout(() => setModalOpen(true), 800);
    }

    return true;
  }, [isSubscriber, freeUsesCount, user?.identifier]);

  // Sign in or sign up with Phone or Email
  const signInOrRegister = async (
    identifier: string,
    name?: string,
    authType?: 'phone' | 'email',
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/subscriptions/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          name: name?.trim(),
          authType,
          password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed' };
      }

      setUser(data.user);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));

      // Inherit usage
      if (typeof data.user.freeUsesCount === 'number') {
        const syncedCount = Math.max(freeUsesCount, data.user.freeUsesCount);
        setFreeUsesCount(syncedCount);
        localStorage.setItem(STORAGE_KEY_USES, String(syncedCount));
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server connection error' };
    }
  };

  // Submit subscription request with payment details
  const submitSubscriptionRequest = async (data: {
    plan: 'monthly' | 'annual';
    paymentMethod: 'easypaisa' | 'jazzcash' | 'bank';
    trxId: string;
    notes?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user?.identifier) {
      return { success: false, error: 'Please sign in first with phone or email.' };
    }

    try {
      const res = await fetch('/api/subscriptions/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: user.identifier,
          name: user.name,
          plan: data.plan,
          paymentMethod: data.paymentMethod,
          trxId: data.trxId,
          notes: data.notes
        })
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to submit payment details' };
      }

      setUser(resData.user);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(resData.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error while submitting' };
    }
  };

  const logout = () => {
    setUser(null);
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
