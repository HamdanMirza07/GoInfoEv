export type SubscriptionStatus = 'free' | 'pending' | 'approved' | 'disallowed';

export type PlanType = 'monthly' | 'annual';

export interface UsageLogItem {
  toolName: string;
  timestamp: string;
}

export interface UserSubscription {
  id: string;
  name: string;
  identifier: string; // Phone number or email
  authType: 'phone' | 'email';
  password?: string;
  status: SubscriptionStatus;
  plan?: PlanType;
  planName?: string;
  amount?: number; // in PKR
  paymentMethod?: 'easypaisa' | 'jazzcash' | 'bank';
  trxId?: string;
  notes?: string;
  freeUsesCount: number; // 0 to 7
  usageLogs?: UsageLogItem[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  disallowedAt?: string;
  disallowedReason?: string;
}

export interface PaymentConfig {
  easypaisa: {
    title: string;
    number: string;
    instructions: string;
    enabled: boolean;
  };
  jazzcash: {
    title: string;
    number: string;
    instructions: string;
    enabled: boolean;
  };
  bank: {
    bankName: string;
    title: string;
    accountNumber: string;
    iban: string;
    instructions: string;
    enabled: boolean;
  };
  pricing: {
    monthlyPKR: number;
    annualPKR: number;
    maxFreeUses: number;
  };
  supportPhone: string;
  supportWhatsApp: string;
}

export interface SubscriptionStats {
  totalUsers: number;
  totalRequests: number;
  pendingCount: number;
  approvedCount: number;
  disallowedCount: number;
  totalRevenuePKR: number;
}

