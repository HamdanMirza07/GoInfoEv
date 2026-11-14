import crypto from 'crypto';

// In-memory state for serverless warm instances on Vercel
const memorySubscriptions: any[] = [];
let customAdminPassHash: string | null = null;
let recoveryEmail = process.env.ADMIN_RECOVERY_EMAIL || 'Hamdan7394@gmail.com';

const DEFAULT_PASSCODES = new Set(['123456', '1234', 'admin786']);

const defaultPaymentConfig = {
  easypaisa: {
    title: 'goinfoEV / Hamdan Mirza',
    number: '0300-7394000',
    instructions: 'Send exact amount via EasyPaisa app and copy the TRX ID from SMS or receipt.',
    enabled: true,
  },
  jazzcash: {
    title: 'goinfoEV / Hamdan Mirza',
    number: '0300-7394000',
    instructions: 'Send exact amount via JazzCash and paste the TID below.',
    enabled: true,
  },
  bank: {
    bankName: 'Meezan Bank Ltd. (Raast Supported)',
    title: 'goinfoEV Pakistan',
    accountNumber: '0102-0109283741',
    iban: 'PK36MEZN0001020109283741',
    instructions: 'Transfer via Raast or IBFT and enter Reference / STAN number.',
    enabled: true,
  },
  pricing: {
    monthlyPKR: 499,
    annualPKR: 2499,
    maxFreeUses: 7,
  },
  supportPhone: '0300-7394000',
  supportWhatsApp: '923007394000',
};

function sha256(str: string): string {
  return crypto.createHash('sha256').update(str.trim()).digest('hex');
}

function normalizePhone(raw: string): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('92') && digits.length === 12) {
    return '0' + digits.slice(2);
  }
  return digits;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  const url = String(req.url || '').split('?')[0];
  const body = typeof req.body === 'string' ? (() => {
    try { return JSON.parse(req.body); } catch { return {}; }
  })() : (req.body || {});

  // 1. Payment Config
  if (url.endsWith('/api/payment-config')) {
    return res.status(200).json(defaultPaymentConfig);
  }

  // 2. Phone-Only User Sign-in (Exclusively Phone Number & Password)
  if (url.endsWith('/api/subscriptions/auth') && req.method === 'POST') {
    const rawPhone = String(body.identifier || '').trim();
    const providedName = String(body.name || '').trim();
    const cleanPassword = String(body.password || '').trim();

    if (!rawPhone || rawPhone.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid Pakistani mobile phone number.' });
    }
    const cleanIdentifier = normalizePhone(rawPhone);
    if (cleanIdentifier.length < 10 || cleanIdentifier.length > 15) {
      return res.status(400).json({ error: 'Please enter a valid mobile phone number (e.g. 03001234567).' });
    }
    if (!cleanPassword || cleanPassword.length < 4) {
      return res.status(400).json({ error: 'Password is required (at least 4 characters).' });
    }
    const cleanName = providedName.length >= 2 ? providedName : `EV Member (${cleanIdentifier.slice(-4)})`;

    const passHash = sha256(cleanPassword);
    let existing = memorySubscriptions.find((s) => normalizePhone(s.identifier) === cleanIdentifier);

    if (existing) {
      if (existing.passwordHash && existing.passwordHash !== passHash) {
        return res.status(401).json({ error: 'Incorrect password for this phone number.' });
      }
      if (providedName.length >= 2) {
        existing.name = providedName;
      }
      existing.passwordHash = passHash;
      existing.updatedAt = new Date().toISOString();
      const { passwordHash: _unused, ...safeUser } = existing;
      return res.status(200).json({
        message: 'Signed in successfully',
        isNew: false,
        token: 'vercel-user-' + cleanIdentifier,
        user: safeUser,
      });
    }

    const nowIso = new Date().toISOString();
    const newUser = {
      id: 'sub-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      name: cleanName,
      identifier: cleanIdentifier,
      authType: 'phone',
      passwordHash: passHash,
      status: 'free',
      freeUsesCount: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    memorySubscriptions.unshift(newUser);
    const { passwordHash: _unused, ...safeUser } = newUser;

    return res.status(201).json({
      message: 'Account created successfully',
      isNew: true,
      token: 'vercel-user-' + cleanIdentifier,
      user: safeUser,
    });
  }

  // 3. Submit Subscription Request
  if (url.endsWith('/api/subscriptions/request') && req.method === 'POST') {
    const cleanIdentifier = normalizePhone(body.identifier || '');
    const cleanTrxId = String(body.trxId || '').trim();
    const cleanName = String(body.name || 'EV User').trim();
    const cleanNotes = String(body.notes || '').trim();
    const planType = body.plan === 'annual' ? 'annual' : 'monthly';
    const amount = planType === 'annual' ? 2499 : 499;
    const planName = planType === 'annual' ? 'Annual Full Suite Pro' : 'Monthly Unlimited Pro';
    const safeMethod = body.paymentMethod === 'jazzcash' || body.paymentMethod === 'bank' ? body.paymentMethod : 'easypaisa';

    if (!cleanIdentifier || !cleanTrxId) {
      return res.status(400).json({ error: 'Phone number and Transaction ID are required.' });
    }

    let user = memorySubscriptions.find((s) => normalizePhone(s.identifier) === cleanIdentifier);
    const nowIso = new Date().toISOString();
    if (!user) {
      user = {
        id: 'sub-' + Date.now(),
        name: cleanName,
        identifier: cleanIdentifier,
        authType: 'phone',
        status: 'pending',
        plan: planType,
        planName,
        amount,
        paymentMethod: safeMethod,
        trxId: cleanTrxId,
        notes: cleanNotes || undefined,
        freeUsesCount: 7,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      memorySubscriptions.unshift(user);
    } else {
      user.name = cleanName || user.name;
      user.status = 'pending';
      user.plan = planType;
      user.planName = planName;
      user.amount = amount;
      user.paymentMethod = safeMethod;
      user.trxId = cleanTrxId;
      user.notes = cleanNotes || user.notes;
      user.updatedAt = nowIso;
    }

    const { passwordHash: _unused, ...safeUser } = user;
    return res.status(200).json({
      message: 'Subscription request submitted for admin approval',
      token: 'vercel-user-' + cleanIdentifier,
      user: safeUser,
    });
  }

  // 4. User Status Sync
  if (url.includes('/api/subscriptions/user/')) {
    const rawId = decodeURIComponent(url.split('/api/subscriptions/user/')[1] || '');
    const cleanIdentifier = normalizePhone(rawId);
    const user = memorySubscriptions.find((s) => normalizePhone(s.identifier) === cleanIdentifier);
    if (!user) {
      return res.status(200).json({
        identifier: cleanIdentifier,
        authType: 'phone',
        status: 'free',
        freeUsesCount: 0,
      });
    }
    const { passwordHash: _unused, ...safeUser } = user;
    return res.status(200).json(safeUser);
  }

  // 5. Admin Session & Login
  if (url.endsWith('/api/admin/session')) {
    return res.status(200).json({
      authenticated: !customAdminPassHash,
      hasCustomPasscode: Boolean(customAdminPassHash),
      token: !customAdminPassHash ? 'vercel-admin-token' : undefined,
    });
  }

  if (url.endsWith('/api/admin/login') && req.method === 'POST') {
    const passcode = String(body.passcode || '').trim();
    const isValid = customAdminPassHash
      ? sha256(passcode) === customAdminPassHash
      : DEFAULT_PASSCODES.has(passcode);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid admin passcode.' });
    }
    return res.status(200).json({
      success: true,
      token: 'vercel-admin-token',
      hasCustomPasscode: Boolean(customAdminPassHash),
    });
  }

  if (url.endsWith('/api/admin/change-passcode') && req.method === 'POST') {
    if (body.newPasscode && String(body.newPasscode).trim().length >= 4) {
      customAdminPassHash = sha256(String(body.newPasscode));
    }
    if (body.recoveryEmail) {
      recoveryEmail = String(body.recoveryEmail).trim();
    }
    return res.status(200).json({
      success: true,
      hasCustomPasscode: Boolean(customAdminPassHash),
      message: 'Admin Passcode saved!',
    });
  }

  if (url.endsWith('/api/admin/security-settings')) {
    return res.status(200).json({
      recoveryEmail,
      smtpConfigured: true,
      hasCustomPasscode: Boolean(customAdminPassHash),
    });
  }

  if (url.endsWith('/api/admin/subscriptions')) {
    const safeList = memorySubscriptions.map(({ passwordHash: _u, ...rest }) => rest);
    return res.status(200).json({
      subscriptions: safeList,
      stats: {
        totalUsers: safeList.length,
        totalRequests: safeList.filter((s) => s.status !== 'free').length,
        pendingCount: safeList.filter((s) => s.status === 'pending').length,
        approvedCount: safeList.filter((s) => s.status === 'approved').length,
        disallowedCount: safeList.filter((s) => s.status === 'disallowed').length,
        totalRevenuePKR: safeList
          .filter((s) => s.status === 'approved')
          .reduce((sum, s) => sum + (s.amount || 499), 0),
      },
    });
  }

  return res.status(200).json({ ok: true });
}
