const ADMIN_TOKEN_KEY = 'goinfoev_admin_token';
const USER_TOKEN_KEY = 'goinfoev_user_token';

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string) {
  try {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch {
    // ignore storage errors
  }
}

export function clearAdminToken() {
  try {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem('pakev_admin_auth');
  } catch {
    // ignore
  }
}

export function getAdminAuthHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getAdminToken();
  return token
    ? { ...extra, Authorization: `Bearer ${token}` }
    : { ...extra };
}

export function getUserToken(): string | null {
  try {
    return localStorage.getItem(USER_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setUserToken(token: string) {
  try {
    localStorage.setItem(USER_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearUserToken() {
  try {
    localStorage.removeItem(USER_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function getUserAuthHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getUserToken();
  return token
    ? { ...extra, Authorization: `Bearer ${token}` }
    : { ...extra };
}

const ADMIN_PASS_HASH_KEY = 'goinfoev_admin_pass_sha256';
const ADMIN_RECOVERY_EMAIL_KEY = 'goinfoev_admin_recovery_email';

// Precomputed SHA-256 hex digests for default initial passcodes (no plaintext stored)
const DEFAULT_PASS_HASHES = new Set<string>([
  '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // 123456
  '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', // 1234
  '47a2fb0ff88557c0f14e577e208b90aa8f91fd12f486d0a480d3d00e1cf198c2', // admin786
]);

export async function sha256Hex(input: string): Promise<string> {
  const normalized = input.trim();
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoded = new TextEncoder().encode(normalized);
    const buf = await window.crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return normalized;
}

export function hasLocalAdminPasscode(): boolean {
  try {
    return Boolean(localStorage.getItem(ADMIN_PASS_HASH_KEY));
  } catch {
    return false;
  }
}

export async function saveLocalAdminPasscode(passcode: string): Promise<void> {
  try {
    const digest = await sha256Hex(passcode);
    localStorage.setItem(ADMIN_PASS_HASH_KEY, digest);
  } catch {
    // ignore storage errors
  }
}

export async function verifyLocalAdminPasscode(input: string): Promise<boolean> {
  if (!input || !input.trim()) return false;
  const digest = await sha256Hex(input);
  try {
    const storedHash = localStorage.getItem(ADMIN_PASS_HASH_KEY);
    if (storedHash) {
      return digest === storedHash;
    }
  } catch {
    // ignore
  }
  return DEFAULT_PASS_HASHES.has(digest);
}

export function getLocalRecoveryEmail(): string {
  try {
    return localStorage.getItem(ADMIN_RECOVERY_EMAIL_KEY) || 'Hamdan7394@gmail.com';
  } catch {
    return 'Hamdan7394@gmail.com';
  }
}

export function saveLocalRecoveryEmail(email: string): void {
  try {
    if (email && email.trim()) {
      localStorage.setItem(ADMIN_RECOVERY_EMAIL_KEY, email.trim());
    }
  } catch {
    // ignore
  }
}
